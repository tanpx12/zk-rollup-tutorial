const fs = require("fs");
const { buildBabyjub, buildMimc7, buildEddsa } = require("circomlibjs");
const wasm_tester = require('circom_tester').wasm

async function main() {
  const babyJub = await buildBabyjub();
  const mimc7 = await buildMimc7();
  const eddsa = await buildEddsa();
  const F = babyJub.F;
  
  // setup accounts
  const alicePrvKey = Buffer.from("1".toString().padStart(64, "0"), "hex");
  const bobPrvKey = Buffer.from("2".toString().padStart(64, "0"), "hex");
  const alicePubKey = eddsa.prv2pub(alicePrvKey);
  const bobPubKey = eddsa.prv2pub(bobPrvKey);

  const alice = {
    pubkey: alicePubKey,
    balance: 500,
  };

  const bob = {
    pubkey: bobPubKey,
    balance: 0,
  };
  // setup accounts and root hash
  const aliceHash = mimc7.multiHash(
    [alice.pubkey[0], alice.pubkey[1], alice.balance],
    1
  );
  const bobHash = mimc7.multiHash(
    [bob.pubkey[0], bob.pubkey[1], bob.balance],
    1
  );

  const accounts_root = mimc7.multiHash([aliceHash, bobHash], 1);

  // transaction
  const tx = {
    from: alice.pubkey,
    to: bob.pubkey,
    amount: 500,
  };

  // sign tx
  const txHash = mimc7.multiHash(
    [tx.from[0], tx.from[1], tx.to[0], tx.to[1], tx.amount],
    1
  );

  const signature = eddsa.signMiMC(alicePrvKey, txHash);

  // new accounts state
  const newAlice = {
    pubkey: alicePubKey,
    balance: 0,
  };

  const newBob = {
    pubkey: bobPubKey,
    balance: 500,
  };
  // new accounts and root hash
  const newAliceHash = mimc7.multiHash(
    [newAlice.pubkey[0], newAlice.pubkey[1], newAlice.balance],
    1
  );
  const newBobHash = mimc7.multiHash(
    [newBob.pubkey[0], newBob.pubkey[1], newBob.balance],
    1
  );
  const intermediate_root = mimc7.multiHash([newAliceHash, bobHash], 1);
  const new_root = mimc7.multiHash([newAliceHash, newBobHash], 1);

  const inputs = {
    accounts_root: BigInt(F.toObject(accounts_root)).toString(),
    intermediate_root: BigInt(F.toObject(intermediate_root)).toString(),
    accounts_pubkey: [
      [
        BigInt(F.toObject(alice.pubkey[0])).toString(),
        BigInt(F.toObject(alice.pubkey[1])).toString(),
      ],
      [
        BigInt(F.toObject(bob.pubkey[0])).toString(),
        BigInt(F.toObject(bob.pubkey[1])).toString(),
      ],
    ],
    accounts_balance: [alice.balance.toString(), bob.balance.toString()],
    sender_pubkey: [
      BigInt(F.toObject(alice.pubkey[0])).toString(),
      BigInt(F.toObject(alice.pubkey[1])).toString(),
    ],
    sender_balance: alice.balance.toString(),
    receiver_pubkey: [
      BigInt(F.toObject(bob.pubkey[0])).toString(),
      BigInt(F.toObject(bob.pubkey[1])).toString(),
    ],
    receiver_balance: bob.balance.toString(),
    amount: tx.amount.toString(),
    signature_R8x: BigInt(F.toObject(signature.R8[0])).toString(),
    signature_R8y: BigInt(F.toObject(signature.R8[1])).toString(),
    signature_S: BigInt(signature.S).toString(),
    sender_proof: [BigInt(F.toObject(bobHash)).toString()],
    sender_proof_pos: ["0"],
    receiver_proof: [BigInt(F.toObject(newAliceHash)).toString()],
    receiver_proof_pos: ["1"],
    enabled:"1"
  };
  console.log(BigInt(F.toObject(new_root)).toString());
  fs.writeFileSync("../circom/input.json",JSON.stringify(inputs),'utf-8');
  
  
  // const circuit = await wasm_tester("../circom/circuit.circom");

  // const w = await circuit.calculateWitness({
  //   accounts_root: (F.toObject(accounts_root)),
  //   intermediate_root: (F.toObject(intermediate_root)),
  //   accounts_pubkey: [
  //     [
  //       F.toObject(alice.pubkey[0]),
  //       F.toObject(alice.pubkey[1])
  //     ],
  //     [
  //       F.toObject(bob.pubkey[0]),
  //       F.toObject(bob.pubkey[1]),
  //     ],
  //   ],
  //   accounts_balance: [alice.balance, bob.balance],
  //   sender_pubkey: [
  //     F.toObject(alice.pubkey[0]),
  //     F.toObject(alice.pubkey[1]),
  //   ],
  //   sender_balance: alice.balance,
  //   receiver_pubkey: [
  //     F.toObject(bob.pubkey[1]),
  //     F.toObject(bob.pubkey[0]),
  //   ],
  //   receiver_balance: bob.balance,
  //   amount: tx.amount,
  //   signature_R8x: F.toObject(signature.R8[0]),
  //   signature_R8y: F.toObject(signature.R8[1]),
  //   signature_S: signature.S,
  //   sender_proof: [(F.toObject(bobHash))],
  //   sender_proof_pos: [1],
  //   receiver_proof: [(F.toObject(aliceHash))],
  //   receiver_proof_pos: [0],
  //   enabled: 1
  // })
  // console.log(w);
}
main();
