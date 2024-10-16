import { dirname, join } from 'path';
import { execa } from 'execa';
import fse from 'fs-extra';
import childProcess from 'child_process';
import { generateMnemonic } from './tools/wallet.js';
import { makeRetryUntilCondition } from './tools/sleep.js';
import { makeDeployBuilder } from './tools/deploy.js';
import { makeAgdTools } from './tools/agd-tools.js';

const makeKeyring = async e2eTools => {
  //   let _keys = ['user1'];
  let _keys = ['user1'];
  //   const setupTestKeys = async (keys = ['user1']) => {
  const setupTestKeys = async (keys = ['alice']) => {
    _keys = keys;
    const wallets = {};
    for (const name of keys) {
      const res = await e2eTools.addKey(name, generateMnemonic());
      const { address } = JSON.parse(res);
      wallets[name] = address;
    }
    return wallets;
  };

  const deleteTestKeys = (keys = []) =>
    Promise.allSettled(
      Array.from(new Set([...keys, ..._keys])).map(key =>
        e2eTools.deleteKey(key).catch(),
      ),
    ).catch();

  return { setupTestKeys, deleteTestKeys };
};

const commonSetup = async t => {
  const tools = await makeAgdTools(t.log, {
    execFileSyncFn: childProcess.execFileSync,
    execFileFn: childProcess.execFile,
  });
  const keyring = await makeKeyring(tools);
  const deployBuilder = makeDeployBuilder(tools, fse.readJSON, execa);
  const retryUntilCondition = makeRetryUntilCondition({ log: t.log });
  const startContract = async (contractName = '', contractBuilder = '') => {
    const { vstorageClient } = tools;
    const instances = Object.fromEntries(
      await vstorageClient.queryData(`published.agoricNames.instance`),
    );
    // if (contractName in instances) {
    //   return t.log('Contract found. Skipping installation...');
    // }
    t.log('bundle and install contract', contractName);
    await deployBuilder(contractBuilder);
    await retryUntilCondition(
      () => vstorageClient.queryData(`published.agoricNames.instance`),
      res => Object.fromEntries(res).filter(x => x === contractName).length > 0,
      `${contractName} instance is available`,
    );
  };
  return {
    ...tools,
    ...keyring,
    retryUntilCondition,
    deployBuilder,
    startContract,
  };
};

export { commonSetup };
