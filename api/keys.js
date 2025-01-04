import accounts from './data/accounts.js';
// import { getGistData, gistUrl } from './merkle-tree/fetchAccounts.js';
import { makeMerkleTreeAPI } from './merkle-tree/index.js';

const trace = label => value => {
  console.log(label, '::::', value);
  return value;
};

const getPubkey = ({ pubkey }) => ({ pubkey: { key: pubkey.key } });
const getAddress = ({ address }) => ({ address });

const withPubkeyAndAddress = o => ({ ...getPubkey(o), ...getAddress(o) });
const defaultPubkeys = accounts.map(x => x.pubkey.key);
const merkleTreeObj = makeMerkleTreeAPI(
  defaultPubkeys,
  accounts.map(withPubkeyAndAddress),
);

export default merkleTreeObj;

export { defaultPubkeys as pubkeys, merkleTreeObj, makeMerkleTreeAPI };
