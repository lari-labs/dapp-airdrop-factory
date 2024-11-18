import anyTest from '@endo/ses-ava/prepare-endo.js';
import type { TestFn } from 'ava';
import { makeDoOffer } from '../tools/e2e-tools.js';
import { commonSetup } from './support.js';
import { accounts, pubkeys } from './keyring.js';
import { makeMerkleTreeAPI } from '@agoric/orchestration/src/examples/airdrop/merkle-tree/index.js';

const test = anyTest as TestFn<SetupContextWithWallets, Brand>;
const contractName = 'tribblesAirdrop';
const contractBuilder =
  '../packages/builders/scripts/testing/start-tribbles-airdrop.js';

const generateInt = x => () => Math.floor(Math.random() * (x + 1));

const createTestTier = generateInt(4); // ?

test.before(async t => {
  const setup = await commonSetup(t);

  // example usage. comment out after first run
  //  await setupSpecificKeys(MNEMONICS_SET_1);
  const [brands] = await Promise.all([
    setup.vstorageClient.queryData('published.agoricNames.brand'),
  ]);

  const merkleTreeObj = makeMerkleTreeAPI(pubkeys, accounts);

  const makeFeeAmount = (brand = Object.fromEntries(brands).IST) => ({
    brand,
    value: 5n,
  });

  t.context = {
    ...setup,
    brands,
    makeFeeAmount,
    merkleTreeObj,
  };
});

const makeDoOfferHandler = async (
  _useChain,
  currentAccount,
  wallet,
  feeAmount,
) => {
  console.log(
    'claiming foxr account::',
    currentAccount.address,
    'pubkey',
    currentAccount.pubkey,
  );

  const doOffer = makeDoOffer(wallet);

  const proof = merkleTreeObj.constructProof(currentAccount.pubkey.key);
  const offerArgs = {
    proof,
    address: currentAccount.address,
    key: currentAccount.pubkey.key,
    tier: createTestTier(),
  };
  // const offerArgs2 = makeOfferArgs(currentAccount);
  console.group(
    '################ START makeDoOfferHandler logger ##############',
  );
  console.log('----------------------------------------');
  console.log('proof ::::', proof);
  console.log('----------------------------------------');
  console.log('offerArgs ::::', offerArgs);
  console.log(
    '--------------- END makeDoOfferHandler logger -------------------',
  );
  console.groupEnd();
  const startTime = performance.now();

  await doOffer({
    id: `offer-${Date.now()}`,
    invitationSpec: {
      source: 'agoricContract',
      instancePath: [contractName],
      callPipe: [['makeClaimTokensInvitation']],
    },
    offerArgs,
    proposal: {
      give: {
        Fee: feeAmount,
      },
    },
  });

  const duration = performance.now() - startTime;
  return { ...currentAccount, duration, wallet };
};
const trace = label => value => {
  console.log(label, ':::', value);
  return value;
};
const makeClaimAirdropMacro = async (t, claimaints, testaccts, delay) => {
  const { makeFeeAmount } = t.context;
  const durations: number[] = [];
  console.log('----------------------------------');
  console.log(
    'testaccts.map(trace("offerArgs info")) ::::',
    testaccts.map(trace('offerArgs info')),
  );
  console.log('----------------------------------');
  console.log('claimaints ::::', claimaints.map(trace('claimaint info')));
  console.log('----------------------------------');
  // Make multiple API calls with the specified delay
  for (let i = 0; i < claimaints.length - 1; i++) {
    console.log('offerArgs', testaccts[i]);
    console.log('Current iteration::', i);

    // picking off duration and address
    // this can be used to inspect the validity of offer results, however it comes at the expense
    // of a failing test halting execution & destroying duration data

    const doOffer = makeDoOffer(claimaints[i]);
    const startTime = performance.now();

    await doOffer({
      id: `offer-${Date.now()}`,
      invitationSpec: {
        source: 'agoricContract',
        instancePath: [contractName],
        callPipe: [['makeClaimTokensInvitation']],
      },
      offerArgs: testaccts,
      proposal: {
        give: {
          Fee: makeFeeAmount(),
        },
      },
    });

    const duration = performance.now() - startTime;

    durations.push(duration);

    // Assert that the response matches the expected output

    console.log('----------------------------------');
    console.log('currentAccount.address ::::', duration);
    console.log('----------------------------------');

    // Wait for the specified delay before making the next call
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  return durations;
};

const mult = x => y => x * y;
const
const getMinutesInMilliseconds = minutes => minutes * ()

const Product = value => ({
  value,
  concat: other => Product(value * other.value)
});

Product.empty = () => Product(1)

test.serial(
  'makeClaimTokensInvitation offers ### start: accounts[3] || end: accounts[4] ### offer interval: 3000ms',
  async t => {
    const { provisionSmartWallet, makeFeeAmount, merkleTreeObj } = t.context;

    const [start, end] = [100, 102];
    const testaccts = merkleTreeObj.accounts.slice(start, end).map(x => ({
      proof: merkleTreeObj.constructProof(x.pubkey.key),
      address: x.address,
      key: x.pubkey.key,
      tier: createTestTier(),
    }));

    t.deepEqual(
      merkleTreeObj.accounts.slice(start, end),
      accounts.slice(start, end),
    );

    const claimantsP = testaccts.map(offerArgs => {
      const smartWallet = provisionSmartWallet(offerArgs.address, {
        BLD: 1000n,
        IST: 500n,
      });
      console.log('----------------------------------');
      console.log('smartWallet ::::', smartWallet);
      console.log('----------------------------------');
      return smartWallet;
    });

    const claimants = await Promise.all(...[claimantsP]);
    console.log('claimants ::::', claimants);
    console.log('----------------------------------');
    const durations = await makeClaimAirdropMacro(
      t,
      claimants,
      testaccts,
      3500,
    );
    t.log('Durations for all calls', durations);
    console.group('################ START DURATIONS logger ##############');
    console.log('----------------------------------------');
    console.log('durations ::::', durations);
    console.log('----------------------------------------');
    console.log('claimRange ::::', testaccts);
    console.log('--------------- END DURATIONS logger -------------------');
    console.groupEnd();
    t.deepEqual(durations.length === 10, true);
  },
);
// const newLocal = provisionSmartWallet =>
//   AIRDROP_DATA.accounts.slice(5, 15).map(async accountData => {
//     const wallet = await provisionSmartWallet(accountData.address);
//     return wallet;
//   });

test.skip('makeClaimTokensInvitation offers ### start: accounts[5] || end: accounts[15] ### offer interval: 3000ms', async t => {
  const claimRange = [5, 15];

  const durations = await claimAirdropMacro(t, claimRange, 1000);
  t.log('Durations for all calls', durations);
  console.group('################ START DURATIONS logger ##############');
  console.log('----------------------------------------');
  console.log('durations ::::', durations);
  console.log('----------------------------------------');
  console.log('claimRange ::::', claimRange);
  console.log('--------------- END DURATIONS logger -------------------');
  console.groupEnd();
  t.deepEqual(durations.length === 10, true);
});

test.skip('makeClaimTokensInvitation offers ### start: accounts[25] || end: accounts[29] ### offer interval: 3500ms', async t => {
  const claimRange = [25, 29];
  const durations = await claimAirdropMacro(t, claimRange, 3500);
  t.log('Durations for all calls', durations);
  console.group('################ START DURATIONS logger ##############');
  console.log('----------------------------------------');
  console.log('durations ::::', durations);
  console.log('----------------------------------------');
  console.log('claimRange ::::', claimRange);
  console.log('--------------- END DURATIONS logger -------------------');
  console.groupEnd();
  t.deepEqual(durations.length === 4, true);
});

test.skip('makeClaimTokensInvitation offers ### start: accounts[40] || end: accounts[90] ### offer interval: 6000ms', async t => {
  const claimRange = [40, 90];
  const durations = await claimAirdropMacro(t, claimRange, 6000);
  t.log('Durations for all calls', durations);
  console.group('################ START DURATIONS logger ##############');
  console.log('----------------------------------------');
  console.log('durations ::::', durations);
  console.log('----------------------------------------');
  console.log('claimRange ::::', claimRange);
  console.log('--------------- END DURATIONS logger -------------------');
  console.groupEnd();
  t.deepEqual(durations.length === 50, true);
});
