const fs = require('fs')
const {buildMimc7,buildBabyjub} = require('circomlibjs')
const mimcMerkle = require('./MiMCMerkle')

async function main(){
    const mimc7 = await buildMimc7()
    const babyJub = await buildBabyjub()
    const F = babyJub.F

    const leaf1 = mimc7.multiHash([1,2,3],1)
    const leaf2 = mimc7.multiHash([4,5,6],1)
    const leaf3 = mimc7.multiHash([7,8,9],1)
    const leaf4 = mimc7.multiHash([9,8,7],1)
    const leafs = [leaf1,leaf2,leaf3,leaf4]

    const tree = await mimcMerkle.treeFromLeafArray(leafs);
    const root = tree[0][0];
    const leaf1Proof = mimcMerkle.getProof(0,tree,leafs);
    const leaf1Pos = mimcMerkle.idxToBinaryPos(0,2);

    const inputs = {
        "leaf" : BigInt(F.toObject(leaf1)).toString(),
        "root" : BigInt(F.toObject(root)).toString(),
        "paths2_root" : [BigInt(F.toObject(leaf1Proof[0])).toString(),BigInt(F.toObject(leaf1Proof[1])).toString()],
        "paths2_root_pos" :  leaf1Pos
    }
    fs.writeFileSync("./input.json",JSON.stringify(inputs),"utf-8")
}
main()