/* global fetch, setTimeout */
import { env as ambientEnv } from 'node:process';
import * as ambientChildProcess from 'node:child_process';
import * as ambientFsp from 'node:fs/promises';
import { makeBundleCacheContext } from '../tools/bundle-tools.js';
import { makeMockTools } from '../tools/boot-tools.js';
import { makeE2ETools } from '../tools/e2e-tools.js';

const { writeFile } = ambientFsp;
const { execFileSync, execFile } = ambientChildProcess;

/** @type {import('../tools/agd-lib.js').ExecSync} */
const dockerExec = (file, args, opts = { encoding: 'utf-8' }) => {
  const workdir = '/workspace/contract';
  const execArgs = ['compose', 'exec', '--workdir', workdir, 'agd'];
  opts.verbose &&
    console.log('docker compose exec', JSON.stringify([file, ...args]));
  return execFileSync('docker', [...execArgs, file, ...args], opts);
};

export const makeAgdTools = async t => {
  const { E2E } = ambientEnv;

  const bc = await makeBundleCacheContext(t);
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

  t.context = { ...tools };
};
