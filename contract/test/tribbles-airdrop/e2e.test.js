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
import process from 'process';
import { permit, startTribblesAirdrop } from '../../src/airdrop.proposal.js';

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
import { oneDay, TimeIntervals } from '../../src/airdrop/helpers/time.js';
import { agdTestKeys } from '../eligibility-tree/tree.data.js';
import {
  produceBoardAuxManager,
  permit as boardAuxPermit,
} from '../../src/platform-goals/board-aux.core.js';
import { makeStableFaucet } from '../mintStable.js';
import { simulateClaim } from './actors.js';

const makeRelTimeMaker = brand => nat =>
  harden({ timerBrand: brand, relValue: nat });

/** @type {import('ava').TestFn<Awaited<ReturnType<makeTestContext>>>} */
const test = anyTest;

const UNIT6 = 1_000_000n;
const CENT = UNIT6 / 100n;

const AIRDROP_TIERS_STATIC = [9000n, 6500n, 3500n, 1500n, 750n];
const defaultCustomTerms = {
  tiers: AIRDROP_TIERS_STATIC,
  targetNumberOfEpochs: 5,
  targetEpochLength: TimeIntervals.SECONDS.ONE_DAY,
  targetTokenSupply: 10_000_000n,
  tokenName: 'Tribbles',
  startTime: TimeIntervals.SECONDS.ONE_DAY,
};

const getLastElement = array => array[array.length - 1];

const createTestScenarios = async (t, pubkeys = agdTestKeys) => {
  console.log('t.context ::::', t.context);
  console.log('----------------------------------');
  const {
    generateMerkleProof,
    getMerkleRootFromMerkleProof,
    generateMerkleTree,
    generateMerkleRoot,
  } = merkleTreeAPI;
  const merkleRoot = generateMerkleRoot(pubkeys);

  console.log('pubkeys:::', pubkeys);
  const generatedMerkleProof = generateMerkleProof(pubkeys[4], pubkeys);

  const merkleTree = generateMerkleTree(pubkeys);

  t.deepEqual(getLastElement(merkleTree), merkleRoot);

  console.group('################ inside simulate airdrop ##############');
  console.log('----------------------------------------');
  console.log('merkleTree ::::', merkleTree);
  console.log('----------------------------------------');
  console.log('generatedMerkleProof ::::', generatedMerkleProof);
  console.groupEnd();
  const simulateAirdropDeployment = async (
    t,
    { terms = { ...defaultCustomTerms, rootHash: merkleRoot } },
  ) => {
    t.log('inside simulate deployment:::');
    console.group(
      '################ inside simulateAirdropDeployment ##############',
    );
    console.log('----------------------------------------');
    console.log('merkleRoot ::::', merkleRoot);
    console.log('----------------------------------------');
    console.log('merkleTree ::::', merkleTree);
    console.log('----------------------------------');
    console.log('terms ::::', terms);
    console.log('----------------------------------');
    console.groupEnd();
  };
  const simulateEligibleClaim = t => {};
  const simulateIneligibleClaim = () => {};
  return {
    simulateAirdropDeployment,
    merkleRoot,
    merkleTree,
    getMerkleProof: pk => generateMerkleProof(pk, pubkeys),
    simulateIneligibleClaim,
    simulateEligibleClaim,
  };
};

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

  const { bundles } = bc;
  console.log('bundles ::::', bundles);
  console.log('----------------------------------');

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

test.serial('install bundle: tribblesAirdrop / tribblesAirdrop', async t => {
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
  console.group('################ inside installBundle Test ##############');
  console.log('----------------------------------------');
  console.log('shortId ::::', shortId);
  console.log('----------------------------------------');
  console.log('bundles ::::', bundles);
  console.groupEnd();
  Object.assign(t.context.shared, { bundles });
});
const containsSubstring = (substring, string) =>
  new RegExp(substring, 'i').test(string);

test.serial(
  'deploy contract with core eval: airdrop / tribblesAirdrop',
  async t => {
    const { runCoreEval } = t.context;
    const { bundles } = t.context.shared;
    const bundleID = getBundleId(bundles.tribblesAirdrop);

    t.deepEqual(
      containsSubstring(bundles.tribblesAirdrop.endoZipBase64Sha512, bundleID),
      true,
    );
    const name = 'airdrop';
    const result = await runCoreEval({
      name,
      behavior: startTribblesAirdrop,
      entryFile: scriptRoots.tribblesAirdrop,
      config: {
        options: {
          customTerms: defaultCustomTerms,
          tribblesAirdrop: { bundleID },
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
  },
);

test.serial('agoricNames.instances has contract: tribblesAirdrop', async t => {
  const { makeQueryTool } = t.context;
  const hub0 = makeAgoricNames(makeQueryTool());
  const agoricNames = makeNameProxy(hub0);
  await null;
  const instances = await agoricNames.instance;
  console.log('instances::::', { keys: [...instances.keys()] }, instances);
  const instance = await agoricNames.instance.tribblesAirdrop;
  t.log(instance);
  t.is(passStyleOf(instance), 'remotable');
});

test.serial(
  'use the code that will go on chain to start the contract',
  async t => {
    const { bundle, bundles } = t.context.shared;

    console.group(
      '################ START start contract logger ##############',
    );
    console.log('----------------------------------------');
    console.log('bundle ::::', bundle);
    console.log('----------------------------------------');
    console.log('bundles ::::', bundles);
    console.log(
      '--------------- END start contract logger -------------------',
    );
    console.groupEnd();
    const bundleID = getBundleId(bundles.tribblesAirdrop);
    const { powers, vatAdminState } = await mockBootstrapPowers(t.log);
    const { feeMintAccess, zoe } = powers.consume;

    // When the BLD staker governance proposal passes,
    // the startup function gets called.
    vatAdminState.installBundle(bundleID, bundles.tribblesAirdrop);
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

    const timerService = await powers.consume.timerSerivce;

    // Now that we have the instance, resume testing as above.
    const { bundleCache } = t.context;
    const { faucet } = makeStableFaucet({ bundleCache, feeMintAccess, zoe });
    await t.throwsAsync(
      simulateClaim(t, zoe, instance, await faucet(5n * UNIT6)),
      {
        message: 'Claim attempt failed.',
      },
    );
    const publicFacet = E(zoe).getPublicFacet(instance);
    await E(timerService).advanceTo(oneDay);

    t.deepEqual(await E(publicFacet).getStatus(), 'should return prepared');
  },
);
