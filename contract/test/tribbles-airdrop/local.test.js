/**
 * @file tests demonstrating the different scenarios that the airdrop contract
 * may find itself.
 *
 * **Note** - The test cases within this file are run in a psuedo environment that is not
 * concerned with processes related to gaining access to various on-chain powers.
 * (e.g. zoe, chainTimerService, agoricNames)
 *
 */
// @ts-check

/* eslint-disable import/order -- https://github.com/endojs/endo/issues/1235 */
import { test as anyTest } from '../prepare-test-env-ava.js';

import { createRequire } from 'module';
import { E, Far } from '@endo/far';
import { makePromiseKit } from '@endo/promise-kit';
import { makeCopyBag } from '@endo/patterns';
import { makeNodeBundleCache } from '@endo/bundle-source/cache.js';
import { makeZoeKitForTest } from '@agoric/zoe/tools/setup-zoe.js';
import { AmountMath, makeIssuerKit } from '@agoric/ertp';

import { makeStableFaucet } from '../mintStable.js';
import buildManualTimer from '@agoric/zoe/tools/manualTimer.js';
import { oneDay, TimeIntervals } from '../../src/airdrop/helpers/time.js';
import { fixHub } from '../../src/fixHub.js';
import { makeNameHubKit } from '@agoric/vats';
import { group, trace } from 'console';
import {
  startTribblesAirdrop,
  permit,
} from '../../src/tribbles-distribution.proposal.js';
import {
  produceBoardAuxManager,
  permit as boardAuxPermit,
} from '../../src/platform-goals/board-aux.core.js';
import { extract } from '@agoric/vats/src/core/utils.js';
import { mockBootstrapPowers } from '../../tools/boot-tools.js';
import { getBundleId } from '../../tools/bundle-tools.js';
import { head } from '../../src/airdrop/helpers/objectTools.js';
import { accounts } from '../data/agd-keys.js';
import {
  generateMerkleProof,
  generateMerkleRoot,
  merkleTreeAPI,
} from '../../src/merkle-tree/index.js';

/** @typedef {typeof import('../../src/tribbles-distribution.contract.js').start} AssetContractFn */

const myRequire = createRequire(import.meta.url);
const contractPath = myRequire.resolve(
  `../../src/tribbles-distribution.contract.js`,
);
const AIRDROP_TIERS_STATIC = [9000n, 6500n, 3500n, 1500n, 750n];

const divide =
  (x = 1n) =>
  (y = 10n) =>
    y / x;
const divideByTwo = divide(2n);

/** @type {import('ava').TestFn<Awaited<ReturnType<makeTestContext>>>} */
const test = anyTest;
const publicKeys = accounts.map(x => x.pubkey.key);

const makeRelTimeMaker = brand => nat =>
  harden({ timerBrand: brand, relValue: nat });
const defaultCustomTerms = {
  tiers: AIRDROP_TIERS_STATIC,
  targetNumberOfEpochs: 5,
  targetEpochLength: TimeIntervals.SECONDS.ONE_DAY * 10n,
  targetTokenSupply: 10_000_000n,
  tokenName: 'Tribbles',
  startTime: oneDay,
  merkleRoot: merkleTreeAPI.generateMerkleRoot(publicKeys),
};

const UNIT6 = 1_000_000n;
const CENT = UNIT6 / 100n;

const timerTracer = label => value => {
  console.log(label, '::: latest #### ', value);
  return value;
};
const makeLocalTimer = async (
  createTimerFn = buildManualTimer(timerTracer('default timer'), 5n),
) => {
  const timer = createTimerFn();

  const timerBrand = await E(timer).getTimerBrand();

  return {
    timer,
    timerBrand,
  };
};
/**
 * Tests assume access to the zoe service and that contracts are bundled.
 *
 * See test-bundle-source.js for basic use of bundleSource().
 * Here we use a bundle cache to optimize running tests multiple times.
 *
 * @param {unknown} _t
 */
const makeTestContext = async _t => {
  const { zoeService: zoe, feeMintAccess } = makeZoeKitForTest();

  const bundleCache = await makeNodeBundleCache('bundles/', {}, s => import(s));
  const bundle = await bundleCache.load(contractPath, 'assetContract');

  console.log('bundle:::', { bundle, bundleCache });
  return { zoe, bundle, bundleCache, makeLocalTimer };
};

test.before(async t => (t.context = await makeTestContext(t)));

// IDEA: use test.serial and pass work products
// between tests using t.context.

test('Install the contract', async t => {
  const { zoe, bundle } = t.context;

  const installation = await E(zoe).install(bundle);
  t.log(installation);
  t.is(typeof installation, 'object');
});

const makeTimerPowers = async ({ consume }) => {
  const timer = await consume.chainTimerService;

  const timerBrand = await E(timer).getTimerBrand();
  const relTimeMaker = makeRelTimeMaker(timerBrand);

  const relTime = relTimeMaker(TimeIntervals.SECONDS.ONE_DAY);

  return {
    timer,
    timerBrand,
    relTime,
    relTimeMaker,
  };
};

test.skip('Start the contract', async t => {
  const { zoe: zoeRef, bundle, bundleCache, feeMintAccess } = t.context;

  const { nameHub: namesByAddress, nameAdmin: namesByAddressAdmin } =
    makeNameHubKit();

  const testFeeIssuer = await E(zoeRef).getFeeIssuer();
  const testFeeBrand = await E(testFeeIssuer).getBrand();

  const testFeeTokenFaucet = await makeStableFaucet({
    feeMintAccess,
    zoe: zoeRef,
    bundleCache,
  });
  console.log('context:', { testFeeTokenFaucet });

  const localTestConfig = {
    zoe: zoeRef,
    issuers: { Fee: testFeeIssuer },
    terms: defaultCustomTerms,
  };
  const startLocalInstance = async (
    t,
    bundle,
    startLocalConfig = localTestConfig,
  ) => {
    const {
      issuers: { Fee },
      zoe,
      terms: customTerms,
    } = startLocalConfig;

    const timer = buildManualTimer();

    const timerBrand = await E(timer).getTimerBrand();
    /** @type {ERef<Installation<AssetContractFn>>} */
    const installation = E(zoe).install(bundle);
    const contractInstance = await E(zoe).startInstance(
      installation,
      { Fee },
      {
        ...customTerms,
        startTime: harden({ timerBrand, relValue: customTerms.startTime }),
      },
      { timer },
    );

    t.log('instance', { contractInstance });

    return { contractInstance, installation, timer };
  };

  const contractInstance = await startLocalInstance(t, bundle, localTestConfig);
  t.log(contractInstance.instance);
  t.is(typeof contractInstance.instance, 'object');
});

const makeOfferArgs = ({ tier, pubkey: { key }, address }) => ({
  key,
  proof: merkleTreeAPI.generateMerkleProof(key, publicKeys),
  address,
  tier,
});

/**
 * Alice trades by paying the price from the contract's terms.
 *
 * @param {import('ava').ExecutionContext} t
 * @param {ZoeService} zoe
 * @param {ERef<import('@agoric/zoe/src/zoeService/utils').Instance<AssetContractFn>} instance
 * @param {Purse} purse
 * @param {string[]} choices
 */
const alice = async (
  t,
  zoe,
  instance,
  feePurse,
  claimOfferArgs = head(accounts),
) => {
  const publicFacet = E(zoe).getPublicFacet(instance);
  // @ts-expect-error Promise<Instance> seems to work
  const terms = await E(zoe).getTerms(instance);
  const { issuers, brands, tradePrice } = terms;

  console.log('TERMS ::: INSIDE ALIE', terms);
  const proposal = {
    give: { Fee: AmountMath.make(brands.Fee, 5n) },
    want: { Tribbles: AmountMath.make(brands.Tribbles, 1000n) },
  };
  t.log('Alice gives', proposal.give);
  // #endregion makeProposal

  const feePayment = await E(feePurse).withdraw(
    AmountMath.make(brands.Fee, 5n),
  );
  const toTrade = await E(publicFacet).makeClaimTokensInvitation();

  const seat = E(zoe).offer(
    toTrade,
    proposal,
    { Fee: feePayment },
    harden(makeOfferArgs(claimOfferArgs)),
  );
  const airdropPayout = await E(seat).getPayout('Tokens');

  const actual = await E(issuers.Tribbles).getAmountOf(airdropPayout);
  t.log('Alice payout brand', actual.brand);
  t.log('Alice payout value', actual.value);
  t.deepEqual(actual, proposal.want.Tokens);
};

test('use the code that will go on chain to start the contract', async t => {
  const { bundle, bundles } = t.context;

  console.group('################ START start contract logger ##############');
  console.log('----------------------------------------');
  console.log('bundle ::::', bundle);
  console.log('----------------------------------------');
  console.log('bundles ::::', bundles);
  console.log('--------------- END start contract logger -------------------');
  console.groupEnd();
  const bundleID = getBundleId(bundle);
  const { powers, vatAdminState } = await mockBootstrapPowers(t.log);
  const { feeMintAccess, zoe } = powers.consume;

  // When the BLD staker governance proposal passes,
  // the startup function gets called.
  vatAdminState.installBundle(bundleID, bundle);
  const airdropPowers = extract(permit, powers);
  const boardAuxPowers = extract(boardAuxPermit, powers);
  await Promise.all([
    produceBoardAuxManager(boardAuxPowers),
    startTribblesAirdrop(airdropPowers, {
      options: {
        customTerms: defaultCustomTerms,
        tribblesAirdrop: { bundleID },
      },
    }),
  ]);
  /** @type {import('../src/sell-concert-tickets.proposal.js').SellTicketsSpace} */
  // @ts-expect-error cast
  const sellSpace = powers;
  const instance = await sellSpace.instance.consume.tribblesAirdrop;

  // Now that we have the instance, resume testing as above.
  const { bundleCache } = t.context;
  const { faucet } = makeStableFaucet({ bundleCache, feeMintAccess, zoe });
  await t.throwsAsync(alice(t, zoe, instance, await faucet(5n * UNIT6)), {
    message: 'Claim attempt failed.',
  });
});
// test('Trade in IST rather than play money', async t => {
//   /**
//    * Start the contract, providing it with
//    * the IST issuer.
//    *
//    * @param {{ zoe: ZoeService, bundle: {} }} powers
//    */
//   const startContract = async ({ zoe, bundle }) => {
//     /** @type {ERef<Installation<AssetContractFn>>} */
//     const installation = E(zoe).install(bundle);
//     const feeIssuer = await E(zoe).getFeeIssuer();
//     const feeBrand = await E(feeIssuer).getBrand();
//     const tradePrice = AmountMath.make(feeBrand, 25n * CENT);
//     return E(zoe).startInstance(
//       installation,
//       { Price: feeIssuer },
//       { tradePrice },
//     );
//   };

//   const { zoe, bundle, bundleCache, feeMintAccess } = t.context;
//   const { instance } = await startContract({ zoe, bundle });
//   const { faucet } = makeStableFaucet({ bundleCache, feeMintAccess, zoe });
//   await alice(t, zoe, instance, await faucet(5n * UNIT6));
// });

// test('use the code that will go on chain to start the contract', async t => {
//   const noop = harden(() => {});

//   // Starting the contract consumes an installation
//   // and produces an instance, brand, and issuer.
//   // We coordinate these with promises.
//   const makeProducer = () => ({ ...makePromiseKit(), reset: noop });
//   const sync = {
//     installation: makeProducer(),
//     instance: makeProducer(),
//     brand: makeProducer(),
//     issuer: makeProducer(),
//   };

//   /**
//    * Chain bootstrap makes a number of powers available
//    * to code approved by BLD staker governance.
//    *
//    * Here we simulate the ones needed for starting this contract.
//    */
//   const mockBootstrap = async () => {
//     const board = { getId: noop };
//     const chainStorage = Far('chainStorage', {
//       makeChildNode: async () => chainStorage,
//       setValue: async () => {},
//     });

//     const { zoe } = t.context;
//     const startUpgradable = async ({
//       installation,
//       issuerKeywordRecord,
//       label,
//       terms,
//     }) =>
//       E(zoe).startInstance(installation, issuerKeywordRecord, terms, {}, label);
//     const feeIssuer = await E(zoe).getFeeIssuer();
//     const feeBrand = await E(feeIssuer).getBrand();

//     const pFor = x => Promise.resolve(x);
//     const powers = {
//       consume: { zoe, chainStorage, startUpgradable, board },
//       brand: {
//         consume: { IST: pFor(feeBrand) },
//         produce: { Item: sync.brand },
//       },
//       issuer: {
//         consume: { IST: pFor(feeIssuer) },
//         produce: { Item: sync.issuer },
//       },
//       installation: { consume: { offerUp: sync.installation.promise } },
//       instance: { produce: { offerUp: sync.instance } },
//     };
//     return powers;
//   };

//   const powers = await mockBootstrap();

//   // Code to install the contract is automatically
//   // generated by `agoric run`. No need to test that part.
//   const { zoe, bundle } = t.context;
//   const installation = E(zoe).install(bundle);
//   sync.installation.resolve(installation);

//   // When the BLD staker governance proposal passes,
//   // the startup function gets called.
//   await startOfferUpContract(powers);
//   const instance = await sync.instance.promise;

//   // Now that we have the instance, resume testing as above.
//   const { feeMintAccess, bundleCache } = t.context;
//   const { faucet } = makeStableFaucet({ bundleCache, feeMintAccess, zoe });
//   await alice(t, zoe, instance, await faucet(5n * UNIT6));
// });
