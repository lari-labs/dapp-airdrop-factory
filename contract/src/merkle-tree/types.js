/**
 * @typedef {string} PublicKeyHash - A SHA-256 hash of a public key, represented as a hexadecimal string.
 */

/**
 * An array of SHA-256 hashes, each computed against a different cryptocurrency public key.
 * @typedef {PublicKeyHash[]} PubkeyHashArray
 */

/**
 * @typedef {object} MerkleTreeNode
 * @property {string} hash
 * @property {string} direction
 */

/** @typedef {MerkleTreeNode[]} Proof */
