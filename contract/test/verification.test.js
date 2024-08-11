/* eslint-disable import/order */
// @ts-check
import { test as anyTest } from './airdropData/prepare-test-env-ava.js';
import { createRequire } from 'module';

import { isHexString } from '../src/verifyProof.js';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import {
  generateMerkleProof,
  generateMerkleRoot,
  generateMerkleTree,
  getMerkleRootFromMerkleProof,
  hashes,
} from '../src/merkle-tree/index.js';

/** @type {import('ava').TestFn<Awaited<ReturnType<makeBundleCacheContext>>>} */
const test = anyTest;
const id = x => x;
const unfold = type => type.fold(id, id);

test('tree construction', t => {
  const merkleRoot = generateMerkleRoot(hashes);

  t.log('generating proof from hash[4]', {hash: hashes[4]})
  const generatedMerkleProof = generateMerkleProof(hashes[4], hashes);

  const merkleTree = generateMerkleTree(hashes);

  const merkleRootFromMerkleProof =
    getMerkleRootFromMerkleProof(generatedMerkleProof);
  console.log('merkleRoot: ', merkleRoot);
  console.log('generatedMerkleProof: ', generatedMerkleProof);
  console.log('merkleTree: ', merkleTree);
  console.log('merkleRootFromMerkleProof: ', merkleRootFromMerkleProof);

  console.log(
    'merkleRootFromMerkleProof === merkleRoot: ',
    merkleRootFromMerkleProof === merkleRoot, //?
  );
  t.deepEqual(merkleRootFromMerkleProof, merkleRoot); //?
});

test('isHexString function', t => {
  const string = '0x123';
  t.deepEqual(
    unfold(isHexString(string)),
    sha256(string),
    'given a hex string should return true.',
  );
});
