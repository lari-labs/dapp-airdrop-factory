/* global fetch, setTimeout */
import { unsafeMakeBundleCache } from '@agoric/swingset-vat/tools/bundleTool.js';
import { execFile, execFileSync } from 'child_process';
import { makeTracer } from '@agoric/internal';
import { makeE2ETools } from './e2e-tools.js';

export const makeAgdTools = async (
  log = console.log,
  { execFileFn = execFile, execFileSyncFn = execFileSync },
) => {
  const bundleCache = await unsafeMakeBundleCache('bundles');
  const tools = await makeE2ETools(log, bundleCache, {
    execFileSync: execFileSyncFn,
    execFile: execFileFn,
    fetch,
    setTimeout,
  });
  return tools;
};

const tracer = makeTracer('DEPLOY TRACER');
const AgdTools = makeAgdTools(tracer, {
  execFileFn: execFile,
  execFileSyncFn: execFileSync,
});
export { AgdTools };
