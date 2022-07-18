pragma circom 2.0.0;
include "./get_merkle_root.circom";
include "../../node_modules/circomlib/circuits/mimc.circom";

template LeafExistence(k,l){
    // k is depth of the tree, l is length preimage of leaf

    signal input preimage[l];
    signal input root;
    signal input paths2_root_pos[k];
    signal input paths2_root[k];

    component leaf = MultiMiMC7(l,91);
    leaf.k <== 1;
    for(var i = 0; i < l; i++){
        leaf.in[i] <== preimage[i];
    }

    component computed_root = GetMerkleRoot(k);
    computed_root.leaf <== leaf.out;

    for (var w = 0; w < k; w++){
        computed_root.paths2_root[w] <== paths2_root[w];
        computed_root.paths2_root_pos[w] <== paths2_root_pos[w];
    }

    // equality constraint: input tx root === computed tx root 
    root === computed_root.out;
}
