/* eslint-disable import/first */
console.log('sane');

import { makeHelpers } from '@agoric/deploy-script-support';
import { exec } from 'child_process';
import { startAirdrop } from '../../src/airdrop.proposal.js';

const runCommand = command => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error.message}`);
      } else if (stderr) {
        reject(`Stderr: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
};

/** @type {import('@agoric/deploy-script-support/src/externalTypes.js').CoreEvalBuilder} */
export const defaultProposalBuilder = async ({ publishRef, install }) => {
  try {
    const whoamiOutput = await runCommand('whoami');
    console.log('Whoami Output:', whoamiOutput);

    const lsOutput = await runCommand('ls');
    console.log('LS Output:', lsOutput);

    const pwdOutput = await runCommand('pwd');
    console.log('PWD Output:', pwdOutput);
  } catch (error) {
    console.error('Command execution error:', error);
  }

  return harden({
    sourceSpec: '../../src/airdrop.proposal.js',
    getManifestCall: [
      'getManifestForAirdrop',
      {
        installKeys: {
          airdrop: publishRef(install('../../src/airdrop.contract.js')),
        },
      },
    ],
  });
};

export default async (homeP, endowments) => {
  const { writeCoreEval } = await makeHelpers(homeP, endowments);
  await writeCoreEval(startAirdrop.name, defaultProposalBuilder);
};
