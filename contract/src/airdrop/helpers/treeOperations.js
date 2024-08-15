import MerkleTree from 'merkletreejs';

const verifyProof = rootHash => (proof, pubkey) =>
  MerkleTree.verify(proof, pubkey, rootHash);

harden(verifyProof);

export { verifyProof };
