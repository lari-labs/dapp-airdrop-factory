/**
 * @file Permission Contract Deployment builder
 *
 * Creates files for starting an instance of the contract:
 * * contract source and instantiation proposal bundles to be published via
 *   `agd tx swingset install-bundle`
 * * start-airdrop-permit.json and start-airdrop.js to submit the
 *   instantiation proposal via `agd tx gov submit-proposal swingset-core-eval`
 *
 * Usage:
 *   agoric run build-contract-deployer.js
 */

import { makeHelpers } from '@agoric/deploy-script-support';
import { getManifestForAirdrop } from '../src/airdrop.proposal.js';

/** @type {import('./types.js').ProposalBuilder} */
export const airdropProposalBuilder = async ({ publishRef, install }) => {
  console.group(
    '------------- NESTED LOGGER OPEN:: inside airdropPrposalBuilder -------------',
  );
  console.log('=====================================================');

  console.log('=====================================================');
  console.log(
    '---------- NESTED LOGGER CLOSED:: inside airdropPrposalBuilder----------',
  );
  console.groupEnd();
  return harden({
    sourceSpec: '../src/airdrop.proposal.js',
    getManifestCall: [
      getManifestForAirdrop.name,
      {
        airdropRef: publishRef(
          install('../src/airdrop.contract.js', '../bundle-airdrop.js'),
        ),
      },
    ],
  });
};

/** @type {import('./types.js').DeployScriptFunction} */
export default async (homeP, endowments) => {
  const { writeCoreProposal } = await makeHelpers(homeP, endowments);
  await writeCoreProposal('start-airdrop', airdropProposalBuilder);
};
