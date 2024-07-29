/* global Buffer */
/* eslint-disable import/order */
// @ts-check
import { test as anyTest } from './airdropData/prepare-test-env-ava.js';
import { createRequire } from 'module';
import { E, Far } from '@endo/far';
import { AmountMath } from '@agoric/ertp/src/amountMath.js';
import { TimeMath } from '@agoric/time';
import {
  bootAndInstallBundles,
  makeSmartWalletFactory,
} from '../tools/boot-tools.js';
import { makeBundleCacheContext } from '../tools/bundle-tools.js';
import { M, makeCopySet, mustMatch } from '@endo/patterns';

/**
 * 1. add getTree and verifyProof method to TreeRemotable
 * 2. verify validity proof against merkle root
 */
import '@agoric/store/exported.js';
import {
  accounts,
  makeSha256Hash,
  preparedAccounts,
  TEST_TREE_DATA,
} from './data/agoric.accounts.js';
import { TimeIntervals } from '../src/airdrop/helpers/time.js';
import { setup } from './setupBasicMints.js';
import { compose, objectToMap } from '../src/airdrop/helpers/objectTools.js';
import { makeMarshal } from '@endo/marshal';
import { createClaimSuccessMsg } from '../src/airdrop/helpers/messages.js';
import { makeTreeRemotable } from './data/tree.utils.js';
import { encodeBase64 } from '@endo/base64';
import { MerkleTree } from 'merkletreejs';
const trace = label => value => {
  console.log(label, '::::', value);
  return value;
};

const head = ([x]) => x;
const parseAccountInfo = ({ pubkey, address }) => ({
  pubkey: pubkey.key,
  address,
});

const defaultClaimaint = {
  // @ts-ignore
  ...parseAccountInfo(head(accounts)),
  hexProof: head(TEST_TREE_DATA.hexProofs),
  proof: head(TEST_TREE_DATA.proofs),
};

const getLast = iterable => iterable[iterable.length - 1];

const makeClaimOfferArgs = ({
  hexProof,
  pubkey,
  address,
  proof,
  tier,
} = defaultClaimaint) => ({
  hexProof,
  pubkey,
  tier,
  address,
  proof,
});
const claimCount = 0;
const simulateClaim = async (
  t,
  invitation,
  expectedPayout,
  claimAccountDetails = {},
) => {
  console.log('inside simulateClaim', { ...claimAccountDetails });
  // claimAccountDetails object holds values that are passed into the offer as offerArgs
  // proof should be used to verify proof against tree (e.g. tree.verify(proof, leafValue, hash) where tree is the merkletree, leafValue is pubkey value, and root hash of tree)
  // address is used in conjunction with namesByAddress/namesByAddressAdmin to send tokens to claimain (see https://docs.agoric.com/guides/integration/name-services.html#namesbyaddress-namesbyaddressadmin-and-depositfacet-per-account-namespace)
  const { zoe, airdropIssuer: tokenIssuer, marshaller } = await t.context;

  t.log('Proof::', claimAccountDetails.proof);
  const offerArgsObject = await E(marshaller).marshall(
    harden({
      ...claimAccountDetails,
      hexProof: claimAccountDetails.hexProof,
      proof: Far('proof remotable', {
        getProof() {
          return claimAccountDetails.proof;
        },
      }),
    }),
  );

  t.log('offerArgsObject', offerArgsObject);

  /** @type {UserSeat} */
  const claimSeat = await E(zoe).offer(
    invitation,
    undefined,
    undefined,
    offerArgsObject,
  );

  t.log('------------ testing claim capabilities -------');
  t.log('-----------------------------------------');
  t.log('AirdropResult', claimSeat);
  t.log('-----------------------------------------');
  t.log('expectedPayout value', expectedPayout);
  t.log('-----------------------------------------');
  const offerResult = await E(claimSeat).getOfferResult();
  //
  t.deepEqual(
    offerResult,
    // Need
    createClaimSuccessMsg(expectedPayout),
  );

  const claimPayment = await E(claimSeat).getPayout('Payment');

  t.deepEqual(await E(tokenIssuer).isLive(claimPayment), true); // any particular reason for isLive check? getAmountOf will do that.
  t.deepEqual(
    await E(tokenIssuer).getAmountOf(claimPayment),
    expectedPayout,
    `claimPayment #${claimCount} should contain the correct payment value.`,
  );

  t.log('tests pass for account:', claimAccountDetails.address);
};

/** @type {import('ava').TestFn<Awaited<ReturnType<makeBundleCacheContext>>>} */
const test = anyTest;

test.before(async t => (t.context = await makeBundleCacheContext(t)));

const nodeRequire = createRequire(import.meta.url);
const { zoe } = setup();

// const contractName = 'launchIt';
const airdropName = 'airdropCampaign';
const bundleRoots = {
  // [contractName]: nodeRequire.resolve('../src/launchIt.js'),
  [airdropName]: nodeRequire.resolve('../src/airdrop.contract.js'),
  // contractStarter: nodeRequire.resolve('../src/contractStarter.js'),
};

export const makeRelTimeMaker = brand => nat =>
  harden({ timerBrand: brand, relValue: nat });

// test('Fn', async t => {
//   Fn(x => mintMemesToPurse(x)).run();
// });

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
// Example usage with AIRDROP_TIERS:
const AIRDROP_TIERS = {
  0: [1000, 800, 650, 500, 350],
  1: [600, 480, 384, 307, 245],
  2: [480, 384, 307, 200, 165],
  3: [300, 240, 192, 153, 122],
  4: [100, 80, 64, 51, 40],
  5: [15, 13, 11, 9, 7],
};

const makeTestContext = async t => {
  const bootKit = await bootAndInstallBundles(t, bundleRoots);
  const walletFactory = makeSmartWalletFactory(bootKit.powers);
  const { powers, bundles } = bootKit;

  const { timer, relTimeMaker } = await makeTimerPowers(powers);

  // t.deepEqual(
  //   await MemePurse.map(x => x.deposit(memeMint.mintPayment(memes(10_000n)))),
  //   MemePurse.inspect(),
  // );

  const startTime = relTimeMaker(TimeIntervals.SECONDS.ONE_DAY);
  t.deepEqual(TimeMath.relValue(startTime), TimeIntervals.SECONDS.ONE_DAY);
  const isFrozen = x => Object.isFrozen(x);

  t.deepEqual(
    isFrozen(timer),
    true,
    'Timer being passed into contract via privateArgs must be frozen.',
  );

  const invitationIssuer = await E(zoe).getInvitationIssuer();
  const invitationBrand = await E(invitationIssuer).getBrand();

  const { airdropCampaign } = bundles;

  const airdropInstallation = await E(zoe).install(airdropCampaign);

  const defaultCustomTerms = {
    tiers: AIRDROP_TIERS,
    rootHash: TEST_TREE_DATA.rootHash,
    totalEpochs: 5,
    epochLength: TimeIntervals.SECONDS.ONE_DAY * 10n,
    bonusSupply: 100_000n,
    baseSupply: 10_000_000n,
    tokenName: 'Tribbles',
    startTime: relTimeMaker(TimeIntervals.SECONDS.ONE_DAY * 3n),
  };

  const makeStartOpts = ({ customTerms = {}, privateArgs = {} }) => ({
    ...harden(customTerms),
    ...harden(privateArgs),
  });

  const testTreeRemotable = makeTreeRemotable(
    TEST_TREE_DATA.tree,
    TEST_TREE_DATA.rootHash,
    MerkleTree,
    makeSha256Hash,
  );
  const { toCapData, fromCapData } = makeMarshal();
  const marshaller = Far('marshaller', {
    marshall(x) {
      return toCapData(x);
    },
    unmarshal(x) {
      return fromCapData(x);
    },
  });
  const instance = await E(zoe).startInstance(
    airdropInstallation,
    undefined,
    harden(defaultCustomTerms),
    harden({
      TreeRemotable: testTreeRemotable,
      timer,
      marshaller,
    }),
    'c1-ownable-Airdrop',
  );

  const airdropIssuer = await E(instance.publicFacet).getIssuer();
  const issuerBrand = await airdropIssuer.getBrand();

  t.context = {
    ...t.context,
    marshaller,
    walletFactory,
    invitationIssuer,
    invitationBrand,
    airdropIssuer,
    airdropAmount: x => AmountMath.make(issuerBrand, x),
    zoe,
    timer,
    testTreeRemotable,
    makeStartOpts,
    airdropInstallation,
    instance,
    publicFacet: instance.publicFacet,
  };
};
test('airdrop claim :: bonus mint', async t => {
  await makeTestContext(t);

  const { publicFacet, timer, testTreeRemotable } = await t.context;

  const airdropIssuer = await E(publicFacet).getIssuer();
  const issuerBrand = await airdropIssuer.getBrand();

  await E(timer).advanceTo(2719838800n);

  const getTier = ({ tier }) => tier;

  const toNumber = x => Number(x);

  const formatTierForLookup = compose(toNumber, getTier);
  const [alice, bob, carol, dan, eva, ...x] =
    preparedAccounts.map(makeClaimOfferArgs);
  t.deepEqual(
    formatTierForLookup(alice),
    1,
    `formatTierForLoopp given alice's pubkey should return a value indicating the correct tier for the account.`,
  );
  console.log('alice', alice);

  const toBigInt = x => BigInt(x);
  const getExpectedTokenAMount = epoch =>
    compose(
      toBigInt,
      trace('after tier lookup'),
      x => AIRDROP_TIERS[epoch][x],
      formatTierForLookup,
    );
  const tribbles = x => AmountMath.make(issuerBrand, x);

  await simulateClaim(
    t,
    await E(publicFacet).makeClaimInvitation(),
    tribbles(getExpectedTokenAMount(0)(alice)),
    alice,
  );

  await simulateClaim(
    t,
    await E(publicFacet).makeClaimInvitation(),
    tribbles(getExpectedTokenAMount(0)(bob)),
    bob,
  );

  await simulateClaim(
    t,
    await E(publicFacet).makeClaimInvitation(),
    tribbles(getExpectedTokenAMount(0)(carol)),
    carol,
  );

  await simulateClaim(
    t,
    await E(publicFacet).makeClaimInvitation(),
    tribbles(getExpectedTokenAMount(0)(dan)),
    dan,
  );

  await simulateClaim(
    t,
    await E(publicFacet).makeClaimInvitation(),
    tribbles(getExpectedTokenAMount(0)(eva)),
    eva,
  );
});
