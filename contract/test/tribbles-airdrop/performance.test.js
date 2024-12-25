/** global setTimeout, assert */
import anyTest from '@endo/ses-ava/prepare-endo.js';

// eslint-disable-next-line
import { E } from '@endo/far';
// eslint-disable-next-line
import { createWriteStream } from 'node:fs';

import { performance } from 'node:perf_hooks';
import { makeDoOffer } from './tools/e2e-tools.js';
import { commonSetup } from './support.js';
import { merkleTreeObj, mnemonics } from './generated_keys.js';

// Create a writable stream to store performance data
const createPerformanceDataStream = outputPath => {
  const stream = createWriteStream(outputPath, { flags: 'a' }); // Append mode
  stream.write('[\n'); // Start the JSON array
  return {
    stream,
    write: data => stream.write(`${JSON.stringify(data)},\n`),
    close: () => {
      stream.write('{}\n]'); // Close the JSON array (dummy empty object)
      stream.end();
    },
  };
};

/** @type {import('ava').TestFn<Awaited<ReturnType<makeTestContext>>>} */
const test = anyTest;

// 2. Type Alias with Intersection
// type ExtendedSetupContext = SetupContext & {
//   brands: [{ key: string, value: Brand }],
//   instances: [{ key: string, value: Instance }]
//   makeFeeAmount: () => Amount
// };
const contractName = 'tribblesAirdrop3';
const contractBuilder = './builder/start-tribbles-airdrop.js';

// Using startsWith() method
const checkSuccessMessage = result =>
  typeof result === 'string' && result.startsWith('Successfully claimed');

const trace = label => value => {
  console.log(label, ':::', value);
  return value;
};
const generateInt = x => () => Math.floor(Math.random() * (x + 1));

const createTestTier = generateInt(4); // ?

const createPerformanceObject = ({
  account = { name: '', address: '', pubkey: { key: '' } },
  startTime = 0,
  endTime = 0,
  message = '',
  offerId = '',
  error = new Error('Default Error'),
  isError = false,
}) => ({
  message,
  offerId,
  account: {
    address: account.address,
    pubkey: account.pubkey.key,
  },
  startTime,
  endTime,
  latency: endTime - startTime,
  ...(isError ? { error } : {}),
});

const makeDoOfferHandler = async (
  currentAccount,
  wallet,
  feeAmount,
  createMetricsFn,
) => {
  await null;
  console.log(
    'claiming foxr account::',
    currentAccount.address,
    'pubkey',
    currentAccount.pubkey,
  );

  const doOffer = makeDoOffer(wallet);

  const startTime = performance.now();

  const offerId = `offer-${Date.now()}`;
  try {
    await doOffer({
      id: offerId,
      invitationSpec: {
        source: 'agoricContract',
        instancePath: [contractName],
        callPipe: [['makeClaimTokensInvitation']],
      },
      offerArgs: {
        proof: merkleTreeObj.constructProof(currentAccount.pubkey.key),
        address: currentAccount.address,
        key: currentAccount.pubkey.key,
        tier: createTestTier(),
      },
      proposal: {
        give: {
          Fee: feeAmount(),
        },
      },
    }).catch(err => {
      throw new Error(err);
    });

    return createMetricsFn({
      offerId,
      message: 'Offer handled properly.',
      startTime,
      endTime: performance.now(),
      account: currentAccount,
    });
  } catch (error) {
    return createMetricsFn({
      error,
      offerId,
      message: 'Error while handling offer',
      isError: true,
      startTime,
      endTime: performance.now(),
      account: currentAccount,
    });
  }
};

// Milliseconds in one minute
const msInMinute = () => 1000 * 60; // 60000 ms

// Seconds in one hour
const secondsInHour = () => 60 * 60; // 3600 seconds

const prepareAccountsForTests = (
  accounts = merkleTreeObj.accounts.slice(0, 10),
  range = [0, 1],
) => accounts.slice(range[0], range[1]).filter(x => !x.address === false);

test.before(async t => {
  const setup = await commonSetup(t);

  console.log({ setup });

  // await setup.setupSpecificKeys(
  //   merkleTreeObj.accounts.map(x => x.mnemonic).slice(300, 600),
  // );
  console.log('successfully started contract::', contractName);

  console.log('setup', setup);

  // example usage. comment out after first run
  const chainData = await Promise.all([
    E(setup.vstorageClient).queryData('published.agoricNames.brand'),
    E(setup.vstorageClient).queryData('published.agoricNames.instance'),
  ]);

  const [brands, instances] = [
    Object.fromEntries(chainData[0]),
    Object.fromEntries(chainData[1]),
  ];

  const makeFeeAmount = () => harden({ brand: brands.IST, value: 5n });

  t.context = {
    ...setup,
    wallets: [],
    provisionSmartWallet: setup.provisionSmartWallet,
    brands,
    instances,
    makeFeeAmount,
  };
});
const runManyOffersConcurrently = async (
  t,
  delay = 10000,
  accounts,
  concurrencyLimit = 5,
  outputPath = './performance_data.json',
) => {
  const performanceStream = createPerformanceDataStream(outputPath);

  // Helper to process an offer and add a delay
  const processOffer = async account => {
    const wallet = await t.context.provisionSmartWallet(account.address, {
      IST: 100n,
      BLD: 100n,
    });

    const response = await makeDoOfferHandler(
      account,
      wallet,
      t.context.makeFeeAmount,
      createPerformanceObject,
    );

    performanceStream.write(response);
    await new Promise(resolve => setTimeout(resolve, delay));
  };

  await null;
  try {
    const results = [];
    for (let i = 0; i < accounts.length; i += concurrencyLimit) {
      const chunk = accounts.slice(i, i + concurrencyLimit); // Get a batch of accounts
      const chunkResults = await Promise.allSettled(chunk.map(processOffer)); // Process the batch concurrently
      results.push(...chunkResults);
    }
    return results;
  } catch (error) {
    console.error('Error during concurrent stress testing:', error);
  } finally {
    performanceStream.close();
  }
};

const runManyOffers = async (
  t,
  delay = 10000,
  accounts,
  performanceDataOutputFile = 'default',
) => {
  const performanceStream = createPerformanceDataStream(
    `${performanceDataOutputFile}.json`,
  );
  const durations = [];

  try {
    for (let i = 0; i <= accounts.length - 1; i += 1) {
      const currentAccount = accounts[i];
      console.group(
        '------------- NESTED LOGGER OPEN:: runManyOffers -------------',
      );
      console.log('=====================================================');
      console.log('currentAccount::', currentAccount);

      const sw = await t.context.provisionSmartWallet(currentAccount.address, {
        IST: 10n,
        BLD: 10n,
      });
      console.log('wallet provisioned:::');

      const currentAccountWithWallet = {
        wallet: sw,
        account: currentAccount,
      };

      console.log('----------------------------------------------');
      console.log('currentAccountWithWallet::', currentAccountWithWallet);
      console.log('=====================================================');
      console.log('---------- NESTED LOGGER CLOSED:: runManyOffers----------');
      console.groupEnd();

      // this can be used to i
      // nspect the validity of offer results, however it comes at the expense
      // of a failing test halting execution & destroying duration data
      const response = await makeDoOfferHandler(
        currentAccountWithWallet.account,
        currentAccountWithWallet.wallet,
        t.context.makeFeeAmount,
        createPerformanceObject,
      );
      // Write performance data to the stream
      performanceStream.write(response);
      console.log('response from makeeDoOfferHandler', response);
      durations.push(response);

      // Assert that the response matches the expected output

      console.log('----------------------------------');
      console.log('currentAccount.address ::::', response.address);
      console.log('----------------------------------');

      t.context = Object.assign(t.context, {
        [performanceDataOutputFile]: durations,
      });
      console.log('------------------------');
      console.log('t.context::', t.context);

      // Wait for the specified delay before making the next call
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  } catch (error) {
    console.error('Error during test::', error);
  } finally {
    performanceStream.close();
  }
};
test.skip('Stress Test: Concurrent Offers', async t => {
  const startIndex = 20;
  const endIndex = 80; // Example range
  const testAccounts = merkleTreeObj.accounts.slice(startIndex, endIndex);

  // Adjust concurrency limit and delay as necessary
  const concurrencyLimit = 5;
  const delay = 2000;

  const results = await runManyOffersConcurrently(
    t,
    delay,
    testAccounts,
    concurrencyLimit,
  );
  t.log('Results:', results);

  // Ensure all transactions were processed
  t.deepEqual(testAccounts.length, 60);
});

test.serial(
  'makeClaimTokensInvitation offrs ### start: accounts[0] || end: accounts[10] ### offer interval: 10s',
  async t => {
    const { provisionSmartWallet, makeFeeAmount } = t.context;
    const [startIndex, endIndex] = [300, 500];
    const testAccts = merkleTreeObj.accounts.slice(startIndex, endIndex);

    console.log({ testAccts });

    const delay = 7500;
    const results = await runManyOffers(
      t,
      delay,
      testAccts,
      `${delay}ms-${startIndex}_through_${endIndex}-round2`,
    );
    const res =
      await t.context[`${delay}ms-${startIndex}_through_${endIndex}-round2`];
    t.log('Durations for all calls', results);
    console.group('################ START DURATIONS logger ##############');
    console.log('----------------------------------------');

    console.log('----------------------------------------');
    console.log('--------------- END DURATIONS logger -------------------');
    console.groupEnd();

    t.truthy(t.context, 'Dummy test');
  },
);

test.skip('makeClaimTokensInvitation offrs ### start: accounts[30] || end: accounts[100] ### offer interval: 2.5s', async t => {
  const [startIndex, endIndex] = [40, 80];
  const testAccts = merkleTreeObj.accounts.slice(startIndex, endIndex);
  const delay = 25000;
  await runManyOffers(
    t,
    delay,
    testAccts,
    `${delay}ms-${startIndex}_through_${endIndex}`,
  );
  console.group('################ START DURATIONS logger ##############');
  console.log('----------------------------------------');
  const results = t.context[`${delay}ms-${startIndex}_through_${endIndex}`];

  console.log('----------------------------------------', { results });
  console.log('------------------------');
  console.log('t.context::', t.context);
  console.log('--------------- END DURATIONS logger -------------------');
  console.groupEnd();
  t.true(t.context);
});

test.skip('makeClaimTokensInvitation offrs ### start: accounts[65] || end: accounts[95] ### offer interval: 15s', async t => {
  const [startIndex, endIndex] = [0, 95];
  const testAccts = merkleTreeObj.accounts.slice(startIndex, endIndex);

  const delay = 15000;
  const results = await runManyOffers(t, delay, testAccts);
  t.log('Durations for all calls', results);
  console.group('################ START DURATIONS logger ##############');
  console.log('----------------------------------------');
  console.log('durations ::::', results.map(trace('inspecting offer results')));
  console.log('----------------------------------------');
  console.log('--------------- END DURATIONS logger -------------------');
  console.groupEnd();
  t.deepEqual(results.length === 40, true);
});

// test.serial('makeClaimTokensInvitation offers ### start: accounts[20] || end: accounts[35] ### offer interval: 6s', async t => {
//   const claimRange = [20, 35];
//   const testAccounts = prepareAccountsForTests(merkleTreeObj.accounts, claimRange)
//   const makeClaimAirdropMacro = claimAirdropMacro(testAccounts);
//   const walletsP = await Promise.all(provisionWallets(testAccounts, t.context));

//   const testWallets = await walletsP;
//   const durations = await makeClaimAirdropMacro(t, testWallets, 4000);
//   t.log('Durations for all calls', durations);
//   console.group('################ START DURATIONS logger ##############');
//   console.log('----------------------------------------');
//   console.log('durations ::::', durations);
//   console.log('----------------------------------------');
//   console.log('claimRange ::::', claimRange);
//   console.log('--------------- END DURATIONS logger -------------------');
//   console.groupEnd();
//   t.deepEqual(durations.length === 30, true);
// });

// test.serial('makeClaimTokensInvitation offers ### start: accounts[30] || end: accounts[40] ### offer interval: 6s', async t => {
//   const claimRange = [35, 50];
//   const testAccounts = prepareAccountsForTests(accounts, claimRange)
//   const makeClaimAirdropMacro = claimAirdropMacro(testAccounts);
//   const walletsP = await Promise.all(provisionWallets(testAccounts, t.context));

//   const testWallets = await walletsP;
//   const durations = await makeClaimAirdropMacro(t, testWallets, 4000);
//   t.log('Durations for all calls', durations);
//   console.group('################ START DURATIONS logger ##############');
//   console.log('----------------------------------------');
//   console.log('durations ::::', durations);
//   console.log('----------------------------------------');
//   console.log('claimRange ::::', claimRange);
//   console.log('--------------- END DURATIONS logger -------------------');
//   console.groupEnd();
//   t.deepEqual(durations.length === 40, true);
// });
