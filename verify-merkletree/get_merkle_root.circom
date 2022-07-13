pragma circom 2.0.0;
include "../node_modules/circomlib/circuits/mimc.circom";

template DualMux(){
    signal input in[2];
    signal input s;
    signal output out[2];
    
    s*(s-1) === 0;

    out[0] <== (in[1] - in[0])*s + in[0];
    out[1] <== (in[0] - in[1])*s + in[1];
}

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
