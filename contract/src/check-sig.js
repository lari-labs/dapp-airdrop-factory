// @ts-check
import { decodeBase64, encodeBase64 } from '@endo/base64';
import { bech32 } from 'bech32';
import { sha256 } from '@noble/hashes/sha256';
import { Secp256k1, Secp256k1Signature } from '@cosmjs/crypto';
import {
  makeSignDoc as makeSignDocAmino,
  serializeSignDoc,
} from '@cosmjs/amino';
import { ripemd160 } from '@noble/hashes/ripemd160';
import { preparedAccounts } from '../test/data/agoric.accounts.js';

const Either = (() => {
  const Right = x => ({
    isLeft: false,
    chain: f => f(x),
    ap: other => other.map(x),
    alt: other => Right(x),
    extend: f => f(Right(x)),
    concat: other =>
      other.fold(
        x => other,
        y => Right(x.concat(y)),
      ),
    traverse: (of, f) => f(x).map(Right),
    map: f => Right(f(x)),
    fold: (_, g) => g(x),
    inspect: () => `Right(${x})`,
  });

  const Left = x => ({
    isLeft: true,
    chain: _ => Left(x),
    ap: _ => Left(x),
    extend: _ => Left(x),
    alt: other => other,
    concat: _ => Left(x),
    traverse: (of, _) => of(Left(x)),
    map: _ => Left(x),
    fold: (f, _) => f(x),
    inspect: () => `Left(${x})`,
  });

  const of = Right;
  const tryCatch = f => {
    try {
      return Right(f());
    } catch (e) {
      return Left(e);
    }
  };

  const fromUndefined = x => (x === undefined ? Right(x) : Left(x));

  const fromNullable = x => (x != null ? Right(x) : Left(x));

  return { Right, Left, of, tryCatch, fromNullable, fromUndefined };
})();

const { Left, Right, tryCatch, of } = Either;

const keys = preparedAccounts.map(x => ({
  prefix: x.prefix,
  address: x.address,
  key: x.pubkey.slice(0, x.pubkey.length - 1),
  keyWithTier: x.pubkey,
}));

const safeByteLengthCheck = pk =>
  pk.byteLength === 33
    ? Right(pk)
    : Left('pubkey.bytelength is not the correct value');

const decode = x => decodeBase64(x);
const createHash = hashFn => data => hashFn.create().update(data).digest();
const createSha256Hash = createHash(sha256);
const createRipeMdHash = createHash(ripemd160);
const compose =
  (...fns) =>
  initialValue =>
    fns.reduceRight((acc, val) => val(acc), initialValue);

const toWords = bytes => bech32.toWords(bytes);
const toBech32Address = prefix => (hash, limit) =>
  bech32.encode(prefix, toWords(hash), limit);

const trace = label => value => {
  console.log(label, '::::', value);
  return value;
};

const mapFn = fn => type => type.map(fn);

const id = x => x;

const pkToAddress = prefix =>
  compose(
    x =>
      x.fold(
        err => new Error('Error', err),
        x => x,
      ),
    mapFn(toBech32Address(prefix)),
    trace('after create ripe'),
    x => x.map(createRipeMdHash),
    trace('after create'),
    x => x.map(createSha256Hash),
    trace('after safe'),
    safeByteLengthCheck,
    decode,
  );
// https://github.com/cosmos/cosmjs/blob/main/packages/encoding/src/bech32.ts#L3C1-L6C2
export function toBech32(prefix, data, limit) {
  const address = bech32.encode(prefix, bech32.toWords(data), limit);
  return address;
}

/**
 * @param {string} pubkey in base64
 * @param {string} prefix
 */
export const pubkeyToAddress = (pubkey, prefix) => {
  const pubkeyData = decodeBase64(pubkey);
  assert.equal(pubkeyData.byteLength, 33);
  //   console.log('pubkey', Buffer.from(pubkeyData));
  const h1 = sha256.create().update(pubkeyData).digest();
  const h2 = ripemd160.create().update(h1).digest();
  return toBech32(prefix, h2);
};

const fail = msg => {
  throw Error(msg);
};

const te = new TextEncoder();

const ADR36 = {
  type: 'sign/MsgSignData',
  memo: '',
  accountNumber: 0,
  sequence: 0,
  chainId: '',
  fee: { gas: '0', amount: [] },
};

/**
 *
 * @param {KeplrSig} kSig
 * @param {Address} signer
 *
 * @typedef { string } Address
 * @typedef { string } Base64
 * @typedef {{
 *   pub_key: { type: 'tendermint/PubKeySecp256k1', value: Base64 },
 *   signature: Base64,
 * }} KeplrSig
 *
 */
export const checkSig = async (kSig, signer) => {
  const prefix = 'agoric'; // TODO: support others
  const addr = pubkeyToAddress(kSig.pub_key.value, prefix);
  addr === signer || fail('pubKey does not match address');

  const fixed = decodeBase64(kSig.signature);
  const cSig = Secp256k1Signature.fromFixedLength(fixed);

  const msg = 'I am eligible'; // TODO: address
  const d = te.encode(msg);
  const msgs = [{ type: ADR36.type, value: { signer, data: encodeBase64(d) } }];
  const signBytes = serializeSignDoc(
    makeSignDocAmino(
      msgs,
      ADR36.fee,
      ADR36.chainId,
      ADR36.memo,
      ADR36.accountNumber,
      ADR36.sequence,
    ),
  );
  const hash = sha256(signBytes);
  const pkbytes = decodeBase64(kSig.pub_key.value);
  const ok = await Secp256k1.verifySignature(cSig, hash, pkbytes);
  ok || fail('signature verification failure');
};
