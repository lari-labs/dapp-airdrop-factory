import { ripemd160 } from '@noble/hashes/ripemd160';
import { sha256 } from '@noble/hashes/sha256';
import { bech32 } from 'bech32';

const Task = fork => ({
  fork,
  ap: other =>
    Task((rej, res) => fork(rej, f => other.fork(rej, x => res(f(x))))),
  map: f => Task((rej, res) => fork(rej, x => res(f(x)))),
  chain: f => Task((rej, res) => fork(rej, x => f(x).fork(rej, res))),
  concat: other =>
    Task((rej, res) => fork(rej, x => other.fork(rej, y => res(x.concat(y))))),
  fold: (f, g) =>
    Task((rej, res) =>
      fork(
        x => f(x).fork(rej, res),
        x => g(x).fork(rej, res),
      ),
    ),
});
Task.of = x => Task((rej, res) => res(x));
Task.rejected = x => Task((rej, res) => rej(x));
Task.fromPromised =
  fn =>
  (...args) =>
    Task((rej, res) =>
      fn(...args)
        .then(res)
        .catch(rej),
    );

const Either = (() => {
  const Right = x => ({
    isLeft: false,
    chain: f => f(x),
    ap: other => other.map(x),
    alt: _ => Right(x),
    extend: f => f(Right(x)),
    concat: other =>
      other.fold(
        _ => other,
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
const compose =
  (...fns) =>
  initialValue =>
    fns.reduceRight((acc, val) => val(acc), initialValue);
const trace = label => value => {
  console.log(label, '::', value);
  return value;
};
const curry = (f, arity = f.length, ...args) =>
  arity <= args.length
    ? f(...args)
    : (...argz) => curry(f, arity, ...args, ...argz);

const Maybe = () => {
  const isNothing = value => value === null || value === undefined;
  const Just = value => ({
    value,
    map: fn => Just(fn(value)),
    fold: () => value,
    inspect: () => `Just(${value})`,
  });
  const Nothing = value => ({
    value,
    map: _fn => Nothing(value),
    inspect: () => `Nothing(${value})`,
  });

  const of = value => (!isNothing(value) ? Just(value) : Nothing(value));

  return {
    of,
    Just,
    Nothing,
  };
};
const { of: maybeOf } = Maybe();
const prop = curry((p, obj) => obj[p]);
const safeProp = prop => obj => maybeOf(obj[prop]);

const safeByteLengthCheck = ({ value }) =>
  value.length === 33
    ? Either.Right(value)
    : Either.Left('Pubkey bytes is not the correct length');

const computeHash = algo => data => algo.create().update(data).digest();

const compute256 = computeHash(sha256);
const computeRipeMd160 = computeHash(ripemd160);

const toBech32Encoding = (prefix, limit) => data =>
  bech32.encode(prefix, bech32.toWords(data), limit);
const computeHex = compose(computeRipeMd160, compute256);
const pubkeyBytesToHex = compose(
  trace('after computeHex'),
  toBech32Encoding('agoric'),
  x =>
    x.fold(
      err => err,
      data => computeHex(data),
    ),
  trace('after safeByteLength'),
  safeByteLengthCheck,
  trace('afte safe prop'),
  safeProp('pubkey'),
);
export { Either, compose, pubkeyBytesToHex, Task };
