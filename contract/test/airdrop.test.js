// @ts-check
/* global setTimeout, fetch */
// XXX what's the state-of-the-art in ava setup?
// eslint-disable-next-line import/order
import { test as anyTest } from './prepare-test-env-ava.js';

import { createRequire } from 'module';
import { env as ambientEnv } from 'node:process';
import * as ambientChildProcess from 'node:child_process';
import * as ambientFsp from 'node:fs/promises';
import { passStyleOf } from '@endo/far';

import { makeBundleCacheContext, getBundleId } from '../tools/bundle-tools.js';
import { makeE2ETools } from '../tools/e2e-tools.js';
import {
  makeNameProxy,
  makeAgoricNames,
} from '../tools/ui-kit-goals/name-service-client.js';
import { makeMockTools } from '../tools/boot-tools.js';
import {
  makeTerms,
  startTribblesAirdrop as startAirdropCampaignContract,
} from '../src/airdrop.proposal.js';

/** @type {import('ava').TestFn<Awaited<ReturnType<setupTestContext>>>} */
const test = anyTest;

const nodeRequire = createRequire(import.meta.url);

const bundleRoots = {
  airdrop: nodeRequire.resolve('../src/airdrop.contract.js'),
};

const scriptRoots = {
  airdrop: nodeRequire.resolve('../src/airdrop.proposal.js'),
};

/** @param {import('ava').ExecutionContext} t */
const setupTestContext = async t => {
  const bc = await makeBundleCacheContext(t);

  const { E2E } = ambientEnv;
  const { execFileSync, execFile } = ambientChildProcess;
  const { writeFile } = ambientFsp;

  /** @type {import('../tools/agd-lib.js').ExecSync} */
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

test.before(async t => (t.context = await setupTestContext(t)));

test.skip('well-known brand (ATOM) is available', async t => {
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

test.skip('install bundle: airdrop / airdrop', async t => {
  const { installBundles } = t.context;
  console.time('installBundles');
  console.timeLog('installBundles', Object.keys(bundleRoots).length, 'todo');
  const bundles = await installBundles(bundleRoots, (...args) =>
    console.timeLog('installBundles', ...args),
  );
  console.timeEnd('installBundles');

  const id = getBundleId(bundles.airdrop);
  const shortId = id.slice(0, 8);
  t.log('airdrop', shortId);
  t.is(id.length, 3 + 128, 'bundleID length');
  t.regex(id, /^b1-.../);

  Object.assign(t.context.shared, { bundles });
});

test.skip('deploy contract with core eval: airdrop / airdrop', async t => {
  const { runCoreEval } = t.context;
  const { bundles } = t.context.shared;
  const bundleID = getBundleId(bundles.airdrop);

  const name = 'send';
  const result = await runCoreEval({
    name,
    behavior: startAirdropCampaignContract,
    entryFile: scriptRoots.airdrop,
    config: {
      options: { airdrop: { bundleID }, customTerms: makeTerms() },
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

test.skip('agoricNames.instances has contract: airdrop', async t => {
  const { makeQueryTool } = t.context;
  const hub0 = makeAgoricNames(makeQueryTool());

  const agoricNames = makeNameProxy(hub0);
  console.log({ agoricNames });
  await null;
  const instance = await agoricNames.instance.produce.airdrop;
  t.deepEqual(instance, '');
  t.log(instance);
  t.is(passStyleOf(instance), 'remotable');
});
