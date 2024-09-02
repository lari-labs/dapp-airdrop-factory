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
  startAirdrop as startTribblesAirdrop,
} from '../../src/airdrop.proposal.js';
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
import {
  produceBoardAuxManager,
  permit as boardAuxPermit,
} from '../../src/platform-goals/board-aux.core.js';

import { makeStableFaucet } from '../mintStable.js';
import { simulateClaim } from './actors.js';
import { accounts } from '../data/agd-keys.js';
import {
  messagesObject,
  PREPARED,
} from '../../src/airdrop/airdropKitCreator.js';
import { oneDay } from '../../src/airdrop/helpers/time.js';

/** @type {import('ava').TestFn<Awaited<ReturnType<makeTestContext>>>} */
const test = anyTest;

const nodeRequire = createRequire(import.meta.url);

const bundleRoots = {
  tribblesAirdrop: nodeRequire.resolve('../../src/airdrop.contract.js'),
};

const scriptRoots = {
  tribblesAirdrop: nodeRequire.resolve('../../src/airdrop.proposal.js'),
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

test.serial('well-known brand (ATOM) is available', async t => {
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
  // this runCoreEval does not work
  const name = 'airdrop';
  const result = await runCoreEval({
    name,
    behavior: startTribblesAirdrop,
    entryFile: scriptRoots.tribblesAirdrop,
    config: {
      options: {
        customTerms: makeTerms(),
        airdrop: { bundleID },
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

test.serial('agoricNames.instances has contract: airdrop', async t => {
  const { makeQueryTool } = t.context;
  const hub0 = makeAgoricNames(makeQueryTool());
  const agoricNames = makeNameProxy(hub0);
  await null;
  const instance = await agoricNames.instance.airdrop;
  t.log(instance);
  t.is(passStyleOf(instance), 'remotable');
});

test('E2E test', async t => {
  // Is there a better way to obtain a reference to this bundle???
  // or is this just fine??
  const { tribblesAirdrop } = t.context.shared.bundles;

  const bundleID = getBundleId(tribblesAirdrop);
  const { powers, vatAdminState } = await mockBootstrapPowers(t.log);
  const { feeMintAccess, zoe, chainTimerService } = powers.consume;

  vatAdminState.installBundle(bundleID, tribblesAirdrop);
  const airdropPowers = extract(permit, powers);
  const boardAuxPowers = extract(boardAuxPermit, powers);
  await Promise.all([
    produceBoardAuxManager(boardAuxPowers),
    startTribblesAirdrop(airdropPowers, {
      options: {
        customTerms: {
          ...makeTerms(),
          merkleRoot: merkleTreeAPI.generateMerkleRoot(
            accounts.map(x => x.pubkey.key),
          ),
        },
        airdrop: { bundleID },
      },
    }),
  ]);
  /** @type {import('../../src/airdrop.proposal.js').AirdropSpace} */
  // @ts-expect-error cast
  const airdropSpace = powers;
  const instance = await airdropSpace.instance.consume.airdrop;

  // Now that we have the instance, resume testing as above.
  const { bundleCache } = t.context;
  const { faucet } = makeStableFaucet({ bundleCache, feeMintAccess, zoe });

  // TODO: update simulateClaim to construct claimArgs object.
  // see makeOfferArgs function for reference.

  const feePurse = await faucet(5n * 1_000_000n);
  const claimAttempt = simulateClaim(t, zoe, instance, feePurse, accounts[4]);
  await t.throwsAsync(
    claimAttempt,
    {
      message: messagesObject.makeIllegalActionString(PREPARED),
    },
    'makeClaimInvitation() should throw an error stemming from the contract not being ready to accept offers.',
  );

  await E(chainTimerService).advanceBy(oneDay * (oneDay / 2n));

  await simulateClaim(t, zoe, instance, feePurse, accounts[4]);

  await simulateClaim(
    t,
    zoe,
    instance,
    await faucet(5n * 1_000_000n),
    accounts[4],
    true,
    `Allocation for address ${accounts[4].address} has already been claimed.`,
  );
});
