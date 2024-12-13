/* eslint-disable import/order */
// @ts-check
/* global setTimeout, fetch */
// XXX what's the state-of-the-art in ava setup?
// eslint-disable-next-line import/order
import { test as anyTest } from '../prepare-test-env-ava.js';

import { createRequire } from 'module';
import { env as ambientEnv } from 'node:process';
import * as ambientChildProcess from 'node:child_process';
import * as ambientFsp from 'node:fs/promises';
import { E, passStyleOf } from '@endo/far';
import { extract } from '@agoric/vats/src/core/utils.js';
import {
  makeTerms,
  permit,
  main,
  startAirdrop,
} from '../../src/airdrop.local.proposal.js';
import {
  makeBundleCacheContext,
  getBundleId,
} from '../../tools/bundle-tools.js';
import { makeE2ETools } from '../../tools/e2e-tools.js';
import {
  makeNameProxy,
  makeAgoricNames,
} from '../../tools/ui-kit-goals/name-service-client.js';
import { makeMockTools, mockBootstrapPowers } from '../../tools/boot-tools.js';
import { merkleTreeAPI } from '../../src/merkle-tree/index.js';
import { makeStableFaucet } from '../mintStable.js';
import { makeOfferArgs, simulateClaim } from './actors.js';
import { oneDay } from '../../src/helpers/time.js';
import { merkleTreeObj } from './generated_keys.js';
import { AmountMath } from '@agoric/ertp';

const { accounts } = merkleTreeObj;
// import { makeAgdTools } from '../agd-tools.js';

/** @type {import('ava').TestFn<Awaited<ReturnType<makeTestContext>>>} */
const test = anyTest;

const nodeRequire = createRequire(import.meta.url);

const bundleRoots = {
  tribblesAirdrop: nodeRequire.resolve('../../src/airdrop.contract.js'),
};

const scriptRoots = {
  tribblesAirdrop: nodeRequire.resolve('../../src/airdrop.local.proposal.js'),
};

/** @param {import('ava').ExecutionContext} t */
const makeTestContext = async t => {
  const bc = await makeBundleCacheContext(t);

  const { E2E } = ambientEnv;
  const { execFileSync, execFile } = ambientChildProcess;
  const { writeFile } = ambientFsp;

  /** @type {import('../../tools/agd-lib.js').ExecSync} */
  const dockerExec = (file, args, opts = { encoding: 'utf-8' }) => {
    const workdir = '/workspace/contract';
    const execArgs = ['compose', 'exec', '--workdir', workdir, 'agd'];
    opts.verbose &&
      console.log('docker compose exec', JSON.stringify([file, ...args]));
    return execFileSync('docker', [...execArgs, file, ...args], opts);
  };

  console.time('makeTestTools');
  console.timeLog('makeTestTools', 'start');
  // installBundles,
  // runCoreEval,
  // provisionSmartWallet,
  // runPackageScript???
  const tools = await (E2E
    ? makeE2ETools(t, bc.bundleCache, {
        execFileSync: dockerExec,
        execFile,
        fetch,
        setTimeout,
        writeFile,
      })
    : makeMockTools(t, bc.bundleCache));
  console.timeEnd('makeTestTools');

  return { ...tools, ...bc };
};

test.before(async t => (t.context = await makeTestContext(t)));

//  console.log('after makeAgdTools:::', { context: t.context });

test.serial('we1ll-known brand (ATOM) is available', async t => {
  const { makeQueryTool } = t.context;
  const hub0 = makeAgoricNames(makeQueryTool());
  const agoricNames = makeNameProxy(hub0);
  await null;
  const brand = {
    ATOM: await agoricNames.brand.ATOM,
  };
  t.log(brand);
  t.is(passStyleOf(brand.ATOM), 'remotable');
});

test.serial('install bundle: airdrop / tribblesAirdrop', async t => {
  const { installBundles } = t.context;
  console.time('installBundles');
  console.timeLog('installBundles', Object.keys(bundleRoots).length, 'todo');
  const bundles = await installBundles(bundleRoots, (...args) =>
    console.timeLog('installBundles', ...args),
  );

  console.timeEnd('installBundles');

  const id = getBundleId(bundles.tribblesAirdrop);
  const shortId = id.slice(0, 8);
  t.log('bundleId', shortId);
  t.is(id.length, 3 + 128, 'bundleID length');
  t.regex(id, /^b1-.../);
  console.groupEnd();
  Object.assign(t.context.shared, { bundles });
  t.truthy(
    t.context.shared.bundles.tribblesAirdrop,
    't.context.shared.bundles should contain a property "tribblesAirdrop"',
  );
});
const containsSubstring = (substring, string) =>
  new RegExp(substring, 'i').test(string);

test.serial('deploy contract with core eval: airdrop / airdrop', async t => {
  const { runCoreEval } = t.context;
  const { bundles } = t.context.shared;
  const bundleID = getBundleId(bundles.tribblesAirdrop);

  t.deepEqual(
    containsSubstring(bundles.tribblesAirdrop.endoZipBase64Sha512, bundleID),
    true,
  );
  const merkleRoot = merkleTreeAPI.generateMerkleRoot(
    accounts.map(x => x.pubkey.key),
  );

  const { vatAdminState } = await mockBootstrapPowers(t.log);

  vatAdminState.installBundle(bundleID, bundles.tribblesAirdrop);

  console.log('inside deploy test::', bundleID);
  // this runCoreEval does not work
  const name = 'airdrop';
  const result = await runCoreEval({
    name,
    behavior: main,
    entryFile: scriptRoots.tribblesAirdrop,
    config: {
      options: {
        customTerms: {
          ...makeTerms(),
          merkleRoot: merkleTreeObj.root,
        },
        tribblesAirdrop: { bundleID },
        merkleRoot,
      },
    },
  });

  t.log(result.voting_end_time, '#', result.proposal_id, name);
  t.like(result, {
    content: {
      '@type': '/agoric.swingset.CoreEvalProposal',
    },
    status: 'PROPOSAL_STATUS_PASSED',
  });
});

// test.serial('checkBundle()', async t => {
//   const { tribblesAirdrop } = t.context.shared.bundles;
//   t.deepEqual(await checkBundle(tribblesAirdrop), '');
// });
const makeMakeOfferSpec = instance => (account, feeAmount) => ({
  id: `${account.address}-offer-${Date.now()}`,
  invitationSpec: {
    source: 'contract',
    instance,
    publicInvitationMaker: 'makeClaimTokensInvitation',
  },
  proposal: { give: { Fee: feeAmount } },
  offerArgs: { ...makeOfferArgs(account) },
});
test.serial('E2E test', async t => {
  const merkleRoot = merkleTreeAPI.generateMerkleRoot(
    accounts.map(x => x.pubkey.key),
  );
  const { bundleCache } = t.context;

  t.log('starting contract with merkleRoot:', merkleRoot);
  // Is there a better way to obtain a reference to this bundle???
  // or is this just fine??
  const { tribblesAirdrop } = t.context.shared.bundles;

  const bundleID = getBundleId(tribblesAirdrop);
  const { powers, vatAdminState, makeMockWalletFactory } = await makeMockTools(
    t,
    bundleCache,
  );
  const { feeMintAccess, zoe, chainTimerService } = powers.consume;

  vatAdminState.installBundle(bundleID, tribblesAirdrop);
  const airdropPowers = extract(permit, powers);
  await startAirdrop(airdropPowers, {
    merkleRoot: merkleTreeObj.root,
    options: {
      customTerms: {
        ...makeTerms(),
        merkleRoot: merkleTreeObj.root,
      },
      tribblesAirdrop: { bundleID },
      merkleRoot: merkleTreeObj.root,
    },
  });

  /** @type {import('../../src/airdrop.local.proposal.js').AirdropSpace} */
  // @ts-expeimport { merkleTreeObj } from '@agoric/orchestration/src/examples/airdrop/generated_keys.js';
  const airdropSpace = powers;
  const instance = await airdropSpace.instance.consume.tribblesAirdrop;

  const terms = await E(zoe).getTerms(instance);
  const { issuers, brands } = terms;

  const walletFactory = makeMockWalletFactory({
    Tribbles: issuers.Tribbles,
    Fee: issuers.Fee,
  });

  console.log('BRANDS::', brands);
  const wallets = {
    alice: await walletFactory.makeSmartWallet(accounts[4].address),
    bob: await walletFactory.makeSmartWallet(accounts[2].address),
  };
  const { faucet, mintBrandedPayment } = makeStableFaucet({
    bundleCache,
    feeMintAccess,
    zoe,
  });

  await Object.values(wallets).map(async wallet => {
    const pmt = await mintBrandedPayment(10n);
    console.log('payment::', pmt);
    await E(wallet.deposit).receive(pmt);
  });
  const makeOfferSpec = makeMakeOfferSpec(instance);

  // Now that we have the instance, resume testing as above.

  // TODO: update simulateClaim to construct claimArgs object.
  // see makeOfferArgs function for reference.

  const feePurse = await faucet(5n * 1_000_000n);
  // const claimAttempt = simulateClaim(
  //   t,
  //   zoe,
  //   instance,
  //   feePurse,
  //   merkleTreeObj.accounts[4],
  // );
  // await t.throwsAsync(
  //   claimAttempt,
  //   {
  //     message: messagesObject.makeIllegalActionString(PREPARED),
  //   },
  //   'makeClaimInvitation() should throw an error stemming from the contract not being ready to accept offers.',
  // );

  await E(chainTimerService).advanceBy(oneDay * (oneDay / 2n));
  const makeFeeAmount = () => AmountMath.make(brands.Fee, 5n);

  /**
   * @summary this creates an  AsyncGenerator object that emits values in the code blocks that follow.
   *
   * @example the first value is recieved as a  result of the following code
   *
   * await E(aliceUpdates).next()
   * .then(res => {
   *    console.log('update res', res);
   *    return res;
   * });
   */
  const aliceUpdates = E(wallets.alice.offers).executeOffer(
    makeOfferSpec(accounts[4], makeFeeAmount()),
  );

  /*
   *
   * {
   *    value: {
   *    updated: 'offerStatus',
   *    status: {
   *      id: 'agoric19s266pak0llft2gcapn64x5aa37ysqnqzky46y-offer-1734092744506',
   *      invitationSpec: [Object],
   *      proposal: [Object],
   *      offerArgs: [Object]
   *     }
   *   },
   *    done: false
   * }
   */
  /**
   * @typedef {{value: { updated: string, status: { id: string, invitationSpec: import('../../tools/wallet-tools.js').InvitationSpec, proposal:Proposal, offerArgs: {key: string, proof: []}}}}} OfferResult
   */

  /** @returns {OfferResult} */
  await E(aliceUpdates)
    .next()
    .then(res => {
      console.log('update res', res);
      return res;
    });

  const tribblesWatcher = await E(wallets.alice.peek).purseUpdates(
    brands.Tribbles,
  );

  let payout;
  for await (const value of tribblesWatcher) {
    console.log('update from smartWallet', value); // Process the value here
    payout = value;
  }
  t.deepEqual(
    AmountMath.isGTE(payout, AmountMath.make(brands.Tribbles, 0n)),
    true,
  );
  // await simulateClaim(
  //   t,
  //   zoe,
  //   instance,
  //   await faucet(5n * 1_000_000n),
  //   accounts[4],
  //   true,
  //   `Allocation for address ${accounts[4].address} has already been claimed.`,
  // );
});

// test.serial('agoricNames.instances has contract: airdrop', async t => {
//   const { makeQueryTool } = t.context;
//   const hub0 = makeAgoricNames(makeQueryTool());

//   const agoricNames = makeNameProxy(hub0);
//   console.log({ agoricNames });
//   await null;
//   const instance = await E(agoricNames).lookup('instance', 'tribblesAirdrop');
//   t.is(passStyleOf(instance), 'remotable');
//   t.log(instance);
// });
