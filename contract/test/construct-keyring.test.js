import anyTest from '@endo/ses-ava/prepare-endo.js';
import { performance } from 'perf_hooks';
import { commonSetup } from './tribbles-airdrop/support.js';
import { mnemonics, pubkeys, accounts } from './keyring.js';
import { makeMerkleTreeAPI } from './merkle-tree.js';
import { makeDoOffer } from '../tools/e2e-tools.js';
import { Either } from '../src/helpers/adts.js';

const test = anyTest;
const contractName = 'tribblesAirdrop';
const contractBuilder =
  '../packages/builders/scripts/testing/start-tribbles-airdrop.js';

const generateInt = x => () => Math.floor(Math.random() * (x + 1));

const createTestTier = generateInt(4); // ?

const Right = v => ({
  map: f => Right(f(v)),
  match: pattern => pattern.right(v),
  bind: f => f(v),
  chain: f => f(v),
});

const Left = v => ({
  map: f => Left(v),
  match: pattern => pattern.left(v),
  bind: f => Left(v),
});

const OFFER_RESULT_TYPES = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  ERROR: 'ERROR',
};

const updatePerformanceMetrics =
  (
    state = {
      history: [],
      lastResponse: {
        error: null,
        data: null,
      },
    },
  ) =>
  ({ type, payload }) => {
    switch (type) {
      case OFFER_RESULT_TYPES.FAILURE: {
        console.log('INSIDE FAILRE CASE ::::', type);
        console.log('----------------------------------');
        return {};
      }
      case OFFER_RESULT_TYPES.SUCCESS: {
        console.log('INSIDE SUCCESS CASE ::::', type);
        console.log('----------------------------------');
        return { history: state.history.concat({ index }) };
      }
      default: {
        console.log(`Action type not recognized: ${type}.`);
        console.log(`Returning current state::`, state);
        return state;
      }
    }
  };
const makeDoOfferHandler =
  (performanceState = [{ history: [], latestResult: {} }]) =>
  async (merkleTreeObj, currentAccount, wallet, feeAmount) => {
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

    return Either.tryCatch(async () => {
      const start = performance.now();
      const request = await doOffer({
        id: `offer-${Date.now()}`,
        invitationSpec: {
          source: 'agoricContract',
          instancePath: [contractName],
          callPipe: [['makeClaimTokensInvitation']],
        },
        offerArgs,
        proposal: {
          give: {
            Fee: feeAmount(),
          },
        },
      });
      return { request, start, endTime: performance.now() };
    });
  };

// const handleAddKeysToKeyring = (mnemonics = [], setupKeyringFn) =>
test.before(async t => {
  const merkleTree = makeMerkleTreeAPI(pubkeys, accounts);
  const setup = await commonSetup(t);

  // example usage. comment out after first run
  //  await setupSpecificKeys(MNEMONICS_SET_1);
  const [brands] = await Promise.all([
    setup.vstorageClient.queryData('published.agoricNames.brand'),
  ]);
  const makeFeeAmount = () =>
    harden({ brand: Object.fromEntries(brands).IST, value: 5n });

  t.context = {
    ...setup,
    provisionSmartWallet: setup.provisionSmartWallet,
    brands,
    merkleTreeAPI: merkleTree,
    makeFeeAmount,
    performanceMetrics: {
      currentSequence: Sum(0),
      pastSequenceHistory: [],
      currentSequenceHistory: [],
    },
  };
});

test.serial('keyring', async t => {
  const { merkleTreeAPI } = t.context;
  const { accounts, pubkeys } = merkleTreeAPI;
  t.deepEqual(
    accounts.map(({ pubkey }) =>
      merkleTreeAPI.constructRootFromProof(
        merkleTreeAPI.constructProof(pubkey, pubkeys),
      ),
    ),
    merkleTreeAPI.root,
    `accounts with pubkey ${fst.pubkey.key} should provide a proof that computes to the correct merkle root`,
  );
});

const provisionWallets = (accounts, { provisionSmartWallet }) =>
  accounts.map(async ({ address }) => {
    const wallet = await provisionSmartWallet(address, {
      BLD: 1000n,
      IST: 500n,
    });
    return wallet;
  });
test.serial('makeDoOffer', async t => {
  const { performanceMetrics } = t.context;
  const doOfferFn = makeDoOfferHandler(performanceMetrics);
});
