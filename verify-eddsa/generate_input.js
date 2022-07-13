const fs = require("fs");
const { buildEddsa, buildBabyjub } = require("circomlibjs");


async function main() {

  const eddsa = await buildEddsa();
  const babyJub = await buildBabyjub();

  const F = babyJub.F;
  const msg = F.e(1234);
  const prvKey = Buffer.from(
    "0001020304050607080900010203040506070809000102030405060708090001",
    "hex"
  );
  const pubKey = eddsa.prv2pub(prvKey);

  const signature = eddsa.signMiMC(prvKey, msg);
  const inputs = {
          "enabled": 1,
          "Ax": BigInt(F.toObject(pubKey[0])).toString(),
          "Ay": BigInt(F.toObject(pubKey[1])).toString(),
          "R8x": BigInt(F.toObject(signature.R8[0])).toString(),
          "R8y": BigInt(F.toObject(signature.R8[1])).toString(),
          "S": signature.S,
          "M": BigInt(F.toObject(msg)).toString()
    }

  fs.writeFileSync(
      "./input.json",
      JSON.stringify(inputs),
      "utf-8"
  )
}

main();
