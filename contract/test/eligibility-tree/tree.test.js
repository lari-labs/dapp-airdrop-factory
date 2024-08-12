/* eslint-disable import/order */
// @ts-check
import { test as anyTest } from '../prepare-test-env-ava.js';
import { createRequire } from 'module';

import {
  generateMerkleProof,
  generateMerkleRoot,
  generateMerkleTree,
  getMerkleRootFromMerkleProof,
  hashes,
} from '../../src/merkle-tree/index.js';
import { agdTestKeys } from './tree.data.js';
import { isHexString } from '../../src/verifyProof.js';
import { hexToBytes } from '@noble/hashes/utils';
import { sha256 } from '@noble/hashes/sha256';

/** @type {import('ava').TestFn<Awaited<ReturnType<makeBundleCacheContext>>>} */
const test = anyTest;
const id = x => x;
const unfold = type => type.fold(id, id);

test('proof verification :: given a pubkey that exists the tree', t => {
  const merkleRoot = generateMerkleRoot(agdTestKeys);

  const generatedMerkleProof = generateMerkleProof(
    agdTestKeys[20],
    agdTestKeys,
  );

  const merkleTree = generateMerkleTree(agdTestKeys);

  const merkleRootFromMerkleProof =
    getMerkleRootFromMerkleProof(generatedMerkleProof);

  t.log('tree', merkleTree);
  t.deepEqual(
    merkleRootFromMerkleProof === merkleRoot,
    true,
    'should return a hash that equal to the correct root hash.',
  ); //?
});

test('proof verification :: given a pubkey that does not exist in the tree', t => {
  const merkleRoot = generateMerkleRoot(agdTestKeys);
  const nonexistentPubkey = 'agoric15r9kesuumyfdjtuj5pvulmt6ff90uqz82yhk84';

  const generatedMerkleProof = generateMerkleProof(
    nonexistentPubkey,
    agdTestKeys,
  );

  const merkleTree = generateMerkleTree(agdTestKeys);

  const merkleRootFromMerkleProof =
    getMerkleRootFromMerkleProof(generatedMerkleProof);

  t.deepEqual(
    merkleRootFromMerkleProof !== merkleRoot,
    true,
    'should return a hash that is not equal to the correct root hash.',
  ); //?
});

test('isHexString function:: given a hex string', t => {
  const string =
    'c7a3bf784a08ad3804386ff389704aeca5a1495ae3c42de649bcfb93a739ef45';
  t.deepEqual(
    unfold(isHexString(string)) === string,
    true,
    'should return its input.',
  );
});

test('isHexString function:: given a value that is not a hex string', t => {
  const string = 'i a mnot a hex string';
  t.deepEqual(
    unfold(isHexString(string)),
    new Error('Input value is not in hex format.'),
    'should return an error message informing the caller that the input is not a hex string.',
  );
});
