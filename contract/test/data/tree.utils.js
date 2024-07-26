import { Far } from '@endo/far';
import { makeSha256Hash } from './agoric.accounts.js';
import { pubkeyToAgoricAddress } from '../../src/check-sig.js';

/**
 * @name makeTreeRemotable
 * @description Factory function that
 *  *
 * unfortunately, merkletree.js produces an object encapsulated with an API that is far more than a simple tree structure.
 * we're faced with the decision to continue with merkletree.js, and take a somewhat graceful approa
 *
 * Ideas
 *  - construct tree by-hand (already have an implementation ready)
 *  -
 */
const makeTreeRemotable = (tree, rootHash, TreeAPI, hashFn = makeSha256Hash) =>
  Far('Merkle Tree', {
    getTreeAPI: () => TreeAPI,
    staticVerify: (proof, targetNode) =>
      TreeAPI.verify(proof, targetNode, rootHash),
    emptyVerifyfn: (proof, targetNode) =>
      new TreeAPI([], hashFn).verify(proof, targetNode, rootHash)
        ? pubkeyToAgoricAddress(targetNode).fold(
            error => error,
            address => ({
              msg: 'successfully verified proof',
              pubkey: targetNode,
              walletAddress: address,
            }),
          )
        : new Error(`${targetNode} failed to pass verification.`),
    getTree: () => tree,
    getRootHash: () => rootHash,
    getVerificationFn() {
      return (proof, targetNode) => tree.verify(proof, targetNode, rootHash);
    },
  });

const generateInt = x => () => Math.floor(Math.random() * (x + 1));

export { generateInt, makeTreeRemotable };
