import { MerkleTree } from 'merkletreejs';
import { compose } from '../../src/airdrop/helpers/objectTools.js';
import { Either } from '../../src/airdrop/helpers/adts.js';
import { accounts } from './agd-keys.js';
import { sha256 } from '../../src/cryptography-lib/sha256.vendor.js';
const hashInput = algo => data => algo(data);
const makeSha256Hash = hashInput(sha256);
const getProp = prop => object => object[prop];
const getPubkey = getProp('pubkey');
const getKey = getProp('key');

const getPubkeyKey = ({ pubkey }) => pubkey.key;

const toHexString = value => value.toString('hex');
const getRoot = x => x.getRoot();
const getProof = tree => value => tree.getProof(value);
const getHexProof = tree => value => tree.getHexProof(value);

const getRootHash = compose(toHexString, getRoot);

const trace = label => value => {
  console.log(label, '::::', value);
  return value;
};
// The object below is an example of the account data objects we will process at construction time. The node value will be
const exampleAccountObject = {
  tier: 0,
  address: 'agoric1vzqqm5dfdhlxh6n3pgkyp5z5thljklq3l02kug',
  prefix: 'agoric',
  pubkey: {
    type: '/cosmos.crypto.secp256k1.PubKey',
    key: 'A+Si8+03Q85NQUAsvhW999q8Xw0fON08k3i6iZXg3S7/',
  },
};

// Importing Either from the provided codebase
const { Right, Left } = Either;
const gte = x => y => y >= x;
const lte = x => y => y <= x;
const gteZero = gte(0);
const lteFour = lte(4);
const and = (x, y) => x && y;

const isWithinBounds = x => and(gteZero(x), lteFour(x));
const isUndefined = x => x === undefined;
const exists = x => !x === false;

// Helper function to safely concatenate properties within Either monad
const concatenateProps = (obj = accounts[0]) =>
  and(isWithinBounds(obj.tier), exists(obj.pubkey))
    ? Right(`${obj.pubkey.key}${obj.tier}`)
    : Left('Invalid object structure');

const toString = x => String(x);

/**
 * Represents cosmos account information.
 * @typedef {object} EligibleAccountObject
 * @property {string} prefix - The prefix.
 * @property {object} pubkey - The public key.
 * @property {string} pubkey.type - The type of the public key.
 * @property {string} pubkey.value - The value of the public key.
 * @property {number} tier - Number of tier an account falls into.
 */

/** @param {EligibleAccountObject} x */
const formatTier = x => ({ ...x, tier: toString(x.tier), tierInt: x.tier });

// Processing array
const processArray = array =>
  array.map(formatTier).map(obj =>
    concatenateProps(obj).fold(
      e => e,
      r => r,
    ),
  );

const pubkeys = processArray(accounts)
  .map(x => x.slice(0, x.length - 1))
  .map(trace('after slicing'));

const getLast = array => array[array.length - 1];
const stringToArray = string => [...string];

const getLastChar = compose(getLast, stringToArray);

// pubkeys
const tree1 = new MerkleTree(
  pubkeys,
  makeSha256Hash,
  // {duplicateOdd: true },
);
const TEST_TREE_DATA = {
  tree: tree1,
  rootHash: getRootHash(tree1),
  leaves: pubkeys,
  hexLeaves: tree1.getHexLeaves(),
  proofs: pubkeys.map(getProof(tree1)),
  hexProofs: pubkeys.map(getHexProof(tree1)),
};

const { tree: testTree, proofs } = TEST_TREE_DATA;

const withProof = (o, i) => ({ ...o, proof: proofs[i], pubkey: pubkeys[i] });
const preparedAccounts = accounts.map(withProof).map(formatTier);
export {
  accounts,
  pubkeys,
  preparedAccounts,
  makeSha256Hash,
  testTree,
  TEST_TREE_DATA,
  getLastChar,
};
