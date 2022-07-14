# simple-zk-rollup


## Prerequire:
- In order to run this tutorial, you need to install these following tools:
  * zkutil 
  * circom
  * snarkjs
- We also assume that you have some basic knowledge about zero knowledge and cryptography. If you don't, check out these articles about zero knowledge:  
 \\ Techfi article  
- Without further ado let's build some zk Rollup :D  
## 1. Verify a simple circuit  
  In case you forgot a little bit about circom and what is it for, this example will remind you about that and also show you how to combine `zkutil`, `circom` and `snarkjs` to create a circuit and verify it.  
  
  In this example, we will create a simple circuit that take two number **a** and **b** as inputs, multiply them together and assign the result to an output number **c**. The purpose of this example is to prove that someone knows 2 number **a** and **b** without reveal the value of it.  
  First, we have the circuit:   
  `````
  pragma circom 2.0.0;
   template Mutiplier(){
    signal input a;
    signal input b;
    signal output c;
    
    c <== a * b;  
  }
  
  component main = Multiplier();
  `````

  After finishing the circuit, we will come to `input.json`. Here we assign the value 9 for a and 7 for b (you can choose any value you like).
  `{"a": "9", "b": "7"}`
  
  With the circuit and the input being done, let's come to the next part where we compile the circuit, create the proof and verify it.
  
  To compile the circuit use : 
  `circom circuit.circom --wasm --r1cs --json`
  
  You will see 2 new file which is `circuit.r1cs` and `circuit_constraints.json` and a new folder `circuit_js`(for further convenient, you should copy all the file in this folder to the parent folder which is the `verify-simple-circuit` folder).
  
  After that run `snarkjs calculatewitness` to create witness.  
  
  Using `zkutil` to setup parameter for the proving process, run : `zkutil setup`. You will see a new file `params.bin` pop up.  
  
  To create the proof, run :`zkutil prove` . This will create 2 new file `proof.json` and `public.json`   
  
  Now we will verify if the `proof.json` is a correct proof or not by running : `zkutil verify`. If it's correct you should see `Proof is correct` in your terminal.  
  
   If you want to generate a solidity smart contract to verify the proof on the blockchain, run. `zkutil generate-verifier`. This should create a `verifier.sol` file, which you can deploy to any EVM blockchain.
  
## 2. Verify an EdDSA address

## 3. Verify a Merkle tree of accounts

