// @ts-check
import { E } from '@endo/far';
import { makeMarshal } from '@endo/marshal';
import { Fail } from '@endo/errors';
import { makeTracer, deeplyFulfilledObject } from '@agoric/internal';
import { fixHub } from './fixHub.js';

const AIRDROP_TIERS_STATIC = [9000n, 6500n, 3500n, 1500n, 750n].map(
  x => x * 1_000_000n,
);

// vstorage paths under published.*
const BOARD_AUX = 'boardAux';

const marshalData = makeMarshal(_val => Fail`data only`);

/**
 * @import {ERef} from '@endo/far';
 * @import {StorageNode} from '@agoric/internal/src/lib-chainStorage.js';
 * @import {BootstrapManifest} from '@agoric/vats/src/core/lib-boot.js';
 */

/**
 * Make a storage node for auxilliary data for a value on the board.
 *
 * @param {ERef<StorageNode>} chainStorage
 * @param {string} boardId
 */
const makeBoardAuxNode = async (chainStorage, boardId) => {
  const boardAux = E(chainStorage).makeChildNode(BOARD_AUX);
  return E(boardAux).makeChildNode(boardId);
};
const trace = makeTracer(':::: START-TRIBBLES-AIRDROP.JS ::::');

const publishBrandInfo = async (chainStorage, board, brand) => {
  trace('publishing info for brand', brand);
  const [id, displayInfo] = await Promise.all([
    E(board).getId(brand),
    E(brand).getDisplayInfo(),
  ]);
  trace('E(board).getId(brand)', id);
  const node = makeBoardAuxNode(chainStorage, id);
  trace('boardAuxNode ####', node);
  const aux = marshalData.toCapData(harden({ displayInfo }));

  const stringifiedAux = JSON.stringify(aux);
  trace('JSON.stringify(aux)', stringifiedAux);
  await E(node).setValue(stringifiedAux);
};

/**
 * @typedef {{
 *   startTime: bigint;
 *   initialPayoutValues: Array;
 *   targetNumberOfEpochs: bigint;
 *   targetEpochLength: bigint;
 *   targetTokenSupply: bigint;
 *   tokenName: string;
 *   merkleRoot: string;
 * }} CustomContractTerms
 */

export const defaultCustomTerms = {
  startTime: 180n,
  initialPayoutValues: harden(AIRDROP_TIERS_STATIC),
  targetNumberOfEpochs: 5n,
  targetEpochLength: 86_000n / 2n, // 6 hour epoch
  targetTokenSupply: 10_000_000n * 1_000_000n,
  tokenName: 'TribblesXnet3',
  merkleRoot:
    'f0efb14f1bd214f97e05f4dfa31bdea9991a3b75aad6a28245b619b4fe66e02e',
};

export const makeTerms = (terms = {}) => ({
  ...defaultCustomTerms,
  ...terms,
});

harden(makeTerms);

export const contractName = 'tribblesAirdropXnet3';

/**
 * Core eval script to start contract q
 *
 * @param {BootstrapPowers} powers
 * @param {any} config
 *
 * @typedef {{
 *   brand: PromiseSpaceOf<{
 *     TribblesXnet3: import('@agoric/ertp/src/types.js').Brand;
 *   }>;
 *   issuer: PromiseSpaceOf<{
 *     TribblesXnet3: import('@agoric/ertp/src/types.js').Issuer;
 *   }>;
 *   instance: { produce: { tribblesAirdropXnet3: Instance } };
 *   installation: { consume: { tribblesAirdropXnet3: Installation } };
 * }} AirdropSpace
 */

const defaultConfig = {
  options: {
    [contractName]: { bundleID: '' },
    customTerms: defaultCustomTerms,
  },
};
/**
 * Core eval script to start contract
 *
 * @param {BootstrapPowers & AirdropSpace} powers
 * @param {{
 *   options: { tribblesAirdropXnet3: { bundleID: string }; customTerms: any };
 * }} config
 *   XXX export AirdropTerms record from contract
 */

export const startAirdrop = async (powers, config) => {
  trace('######## inside startAirdrop ###########');
  trace('config ::::', config);
  trace('----------------------------------');
  trace('powers::', powers);
  trace('powers.installation', powers.installation.consume);
  trace('powers.installation', powers.installation.consume[contractName]);
  const {
    consume: {
      namesByAddressAdmin: namesByAddressAdminP,
      bankManager,
      board,
      chainTimerService,
      chainStorage,
      startUpgradable,
      zoe,
    },
    installation: {
      consume: { [contractName]: airdropInstallationP },
    },
    instance: {
      produce: { [contractName]: produceInstance },
    },
    issuer: {
      consume: { IST: istIssuer },
      produce: { TribblesXnet3: produceTribblesIssuer },
    },
    brand: {
      consume: { IST: istBrand },
      produce: { TribblesXnet3: produceTribblesBrand },
    },
  } = powers;

  const [issuerIST, feeBrand, timer, namesByAddressAdmin] = await Promise.all([
    istIssuer,
    istBrand,
    chainTimerService,
    namesByAddressAdminP,
  ]);

  const { customTerms } = config.options;

  /** @type {CustomContractTerms} */
  const terms = {
    ...customTerms,
    merkleRoot:
      'f0efb14f1bd214f97e05f4dfa31bdea9991a3b75aad6a28245b619b4fe66e02e',
    feeAmount: harden({
      brand: feeBrand,
      value: 5n,
    }),
  };

  trace('starting contract with merkleRoot', terms.merkleRoot);
  assert(
    customTerms?.merkleRoot,
    'can not start contract without merkleRoot???',
  );
  trace('AFTER assert(config?.options?.merkleRoot');
  const namesByAddress = await fixHub(namesByAddressAdmin);

  const startOpts = {
    installation: await airdropInstallationP,
    label: contractName,
    terms,
    issuerKeywordRecord: {
      Fee: issuerIST,
    },
    issuerNames: ['TribblesXnet3'],
    privateArgs: await deeplyFulfilledObject(
      harden({
        timer,
        namesByAddress,
      }),
    ),
  };

  trace('BEFORE astartContract(permittedPowers, startOpts);', { startOpts });

  const { instance, creatorFacet } = await E(startUpgradable)(startOpts);
  trace('contract installation started');
  trace(instance);
  const instanceTerms = await E(zoe).getTerms(instance);
  trace('instanceTerms::', instanceTerms);
  const {
    brands: { TribblesXnet3: tribblesBrand },
    issuers: { TribblesXnet3: tribblesIssuer },
  } = instanceTerms;

  produceInstance.reset();
  produceInstance.resolve(instance);

  produceTribblesBrand.reset();
  produceTribblesIssuer.reset();
  produceTribblesBrand.resolve(tribblesBrand);
  produceTribblesIssuer.resolve(tribblesIssuer);

  // Sending invitation for pausing contract to a specific wallet
  // TODO: add correct wallet address
  const adminWallet = 'agoric1jng25adrtpl53eh50q7fch34e0vn4g72j6zcml';
  await E(namesByAddressAdmin).reserve(adminWallet);
  const adminDepositFacet = E(namesByAddress).lookup(
    adminWallet,
    'depositFacet',
  );

  await E(creatorFacet).makePauseContractInvitation(adminDepositFacet);

  // Add utribbles token to vbank
  const tribblesMint = await E(creatorFacet).getBankAssetMint();

  await E(bankManager).addAsset(
    'utribblesxnet3',
    'TribblesXnet3',
    'TribblesXnet3 Intersubjective Token',
    harden({
      issuer: tribblesIssuer,
      brand: tribblesBrand,
      mint: tribblesMint,
    }),
  );
  await publishBrandInfo(chainStorage, board, tribblesBrand);
  trace('deploy script complete.');
};

/** @type {BootstrapManifest} */
const airdropManifest = harden({
  [startAirdrop.name]: {
    consume: {
      namesByAddress: true,
      namesByAddressAdmin: true,
      bankManager: true,
      board: true,
      chainStorage: true,
      chainTimerService: true,
      agoricNames: true,
      brandAuxPublisher: true,
      startUpgradable: true, // to start contract and save adminFacet
      zoe: true, // to get contract terms, including issuer/brand,
    },
    installation: {
      consume: { [contractName]: true },
      produce: { [contractName]: true },
    },
    issuer: {
      consume: { IST: true, TribblesXnet3: true },
      produce: { TribblesXnet3: true },
    },
    brand: {
      consume: { IST: true, TribblesXnet3: true },
      produce: { TribblesXnet3: true },
    },
    instance: { produce: { [contractName]: true } },
  },
});

export const getManifestForTribblesXnet = (
  { restoreRef },
  {
    installKeys,
    options = {
      customTerms: {
        ...defaultCustomTerms,
        merkleRoot:
          'f0efb14f1bd214f97e05f4dfa31bdea9991a3b75aad6a28245b619b4fe66e02e',
      },
    },
  },
) => {
  trace('getManifestForAirdrop');
  trace('installKeys', installKeys);
  trace('options ::::', options);
  return harden({
    manifest: airdropManifest,
    installations: {
      tribblesAirdropXnet3: restoreRef(installKeys.tribblesAirdropXnet3),
    },
    options,
  });
};

export const permit = Object.values(airdropManifest)[0];

// /** @type {import('@agoric/deploy-script-support/src/externalTypes.js').CoreEvalBuilder} */
// export const defaultProposalBuilder = async ({ publishRef, install }) => {
//   return harden({
//     // Somewhat unorthodox, source the exports from this builder module
//     sourceSpec:
//       '/workspaces/dapp-ertp-airdrop/contract/src/airdrop.proposal.js',
//     getManifestCall: [
//       'getManifestForAirdrop',
//       {
//         installKeys: {
//           tribblesAirdropXnet3: publishRef(
//             install(
//               '/workspaces/dapp-ertp-airdrop/contract/src/airdrop.contract.js',
//             ),
//           ),
//         },
//       },
//     ],
//   });
// };

// export default async (homeP, endowments) => {
//   // import dynamically so the module can work in CoreEval environment
//   const dspModule = await import('@agoric/deploy-script-support');
//   const { makeHelpers } = dspModule;
//   const { writeCoreEval } = await makeHelpers(homeP, endowments);
//   await writeCoreEval(startAirdrop.name, defaultProposalBuilder);
// };
