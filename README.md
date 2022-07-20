# simple-zk-rollup


## Prerequire:
- In order to run this tutorial, you need to install these following tools:
  * `zkutil` 
  * `circom`
  * `snarkjs` 
- After install these tools, run `npm install` to install the library that we use in this tutorial ( make sure that you have `nodejs` installed ).  
- We also assume that you have some basic knowledge about zero knowledge and cryptography. If you don't, check out these articles about zero knowledge:  
 \\ Techfi article  

## 1. Verify a simple circuit  
  In case you forgot a little bit about `circom` and what is it for, this example will remind you about that and also show you how to combine `zkutil`, `circom` and `snarkjs` to create a circuit and verify it. If you already familiar with `circom`, `snarkjs` and `zkutil` then you can skip this part.
  
  In this example, we will create a simple circuit that take two number **a** and **b** as inputs, multiply them together and assign the result to an output number **c**. The purpose of this example is to prove that someone knows 2 number **a** and **b** without reveal the value of it.  
  First, we have the circuit:   
  
  ```
  pragma circom 2.0.0;
   
  template Mutiplier(){
    signal input a;
    signal input b;
    signal output c;
    
    c <== a * b;  
  }
  
  component main = Multiplier();
  ```

  After finishing the circuit, we will come to `input.json`. Here we assign the value 9 for a and 7 for b (you can choose any value you like).
  `{"a": "9", "b": "7"}`
  
  Now, let's come to the next part where we compile the circuit, create the proof and verify it.
  
  To compile the circuit use : 
  `circom circuit.circom --wasm --r1cs --json`
  
  You will see 2 new file which is `circuit.r1cs` and `circuit_constraints.json` and a new folder `circuit_js`(for further convenient, you should copy all the file in this folder to the parent folder which is the `verify-simple-circuit` folder).
  
  Run `snarkjs calculatewitness` to calculate witness.  
  
  Using `zkutil` to setup parameter for the proving process, run : `zkutil setup`. You will see a new file `params.bin` pop up.  
  
  To create the proof, run : `zkutil prove` . This will create 2 new file `proof.json` and `public.json`   
  
  Now we will verify if the `proof.json` is a correct proof or not by running : `zkutil verify`. If it's correct you should see `Proof is correct` in your terminal.  
  
  If you want to generate a solidity smart contract to verify the proof on the blockchain, run. `zkutil generate-verifier`. This should create a `verifier.sol` file, which you can deploy to any EVM blockchain.
  
## 2. Verify an EdDSA signature

  EdDSA is a popular signature scheme that is widely used in ZK rollup. In this example, we will create a circuit to verify a EdDSA signalture scheme. Instead of rewriting whole circuit (which is very compicated and time consuming) we will use the `circomlib` library. It contain the EdDSA MiMC7 circuit and we just need to import it into our circuit in order to use it.
   
  `circuit.circom`:
  ```
  pragma circom 2.0.0;
  include "./node_modules/circomlib/circuits/eddsamimc.circom";

  component main = VerifyEdDSAMiMC();
``` 
  Generate inputs:
  `node generate_input`
  Compile circuit:
  `circom circuit.circom --wasm --r1cs --json`
  Setup parameter:
  `zkutil setup`
  Calculate witness:
  `snarkjs calculatewitness`
  Generate proof:
  `zkutil prove`
  Verify the proof:
  `zkutil verify`
  Generate on-chain verifier:
  `zkutil generate-verifier`
## 3. Verify a Merkle tree of accounts 
  Merkle tree is the data structure that is used on blockchain to store data, including accounts, transactions,etc. In this part, we will write a circuit to verify if an accounts was included in a Merkle tree or not. 
  
  DualMux (or Dual Multiplexer) is the first circuit that we need to consider. This circuit take 2 inputs and a selector (can only be 0 or 1). If selector = 1 then switch the position of 2 inputs, otherwise keep it the same.
  
  ```
  template DualMux(){
	signal input in[2];
	signal input s;

	signal output out[2];

	s*(s-1) === 0;

	out[0] <== (in[1] - in[0])*s + in[0];
	out[1] <== (in[0] - in[1])*s + in[1];

  }
  ```

We have GetMerkleRoot circuit to calculate the root of a Merkle Tree (this Merkle tree using MultiMiMC7 hash).

  ```
  template GetMerkleRoot(k){

// k is depth of tree

  signal input leaf;
  signal input paths2_root[k];
  signal input paths2_root_pos[k];

  signal output out;

  component selectors[k];

  component hashers[k];

  for(var i = 0; i < k; i++){

	selectors[i] = DualMux();
	selectors[i].in[0] <== i == 0 ? leaf : hashers[i-1].out;
	selectors[i].in[1] <== paths2_root[i];
	selectors[i].s <== paths2_root_pos[i];

	hashers[i] = MultiMiMC7(2,91);
	hashers[i].k <== 1;
	hashers[i].in[0] <== selectors[i].out[0];
	hashers[i].in[1] <== selectors[i].out[1];
  }

  out <== hashers[k-1].out;

}
```


## 4. Verify a single transaction
