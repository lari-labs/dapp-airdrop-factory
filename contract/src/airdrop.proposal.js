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
const trace = makeTracer(':::: START-Trill-AIRDROP.JS ::::');

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
 *   initialPayoutValues: any;
 *   targetNumberOfEpochs: bigint;
 *   targetEpochLength: bigint;
 *   targetTokenSupply: bigint;
 *   tokenName: string;
 * }} CustomContractTerms
 */

export const defaultCustomTerms = {
  startTime: 0n,
  initialPayoutValues: harden(AIRDROP_TIERS_STATIC),
  targetNumberOfEpochs: 5n,
  targetEpochLength: 86_400n / 2n,
  targetTokenSupply: 10_000_000n * 1_000_000n,
  tokenName: 'Tribbles',
};

export const makeTerms = (terms = {}) => ({
  ...defaultCustomTerms,
  ...terms,
});

harden(makeTerms);

export const contractName = 'tribblesAirdropContract';

/**
 * Core eval script to start contract q
 *
 * @param {BootstrapPowers} powers
 * @param {any} config
 *
 * @typedef {{
 *   brand: PromiseSpaceOf<{
 *     Tribbles: import('@agoric/ertp/src/types.js').Brand;
 *   }>;
 *   issuer: PromiseSpaceOf<{
 *     Tribbles: import('@agoric/ertp/src/types.js').Issuer;
 *   }>;
 *   instance: { produce: { TribblesAirdrop: Instance } };
 *   installation: { consume: { TribblesAirdrop: Installation } };
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
 *   XXX export AirdropTerms record from contract
 */

export const startAirdrop = async (powers, config) => {
  trace('######## inside startAirdrop ###########');
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
      produce: { Tribbles: produceTribblesIssuer },
    },
    brand: {
      consume: { IST: istBrand },
      produce: { Tribbles: produceTribblesBrand },
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
    feeAmount: harden({
      brand: feeBrand,
      value: 5n,
    }),
  };

  trace('BEFORE assert(config?.options?.merkleRoot');
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
    issuerNames: ['Tribbles'],
    privateArgs: await deeplyFulfilledObject(
      harden({
        timer,
        namesByAddress,
      }),
    ),
  };

  trace('BEFORE astartContract(permittedPowers, startOpts);', { startOpts });

  const { instance } = await E(startUpgradable)(startOpts);
  trace('contract installation started');
  trace(instance);
  const instanceTerms = await E(zoe).getTerms(instance);
  trace('instanceTerms::', instanceTerms);
  const {
    brands: { Tribbles: tribblesBrand },
    issuers: { Tribbles: tribblesIssuer },
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

  // Does this const declaraction need to be removed???
  // ln 208 - includes `await` -----\  [TG] Investigation:
  //                                 \  - reserve(adminWallet) is awaited
  //                                 /  - .lookup() is NOT await
  // ln 212 - no `await`       -----/  **Conclusion**: lookup is synchronous (clearly?). Does this mean vat within the same object?

  const adminDepositFacet = E(namesByAddress).lookup(
    adminWallet,
    'depositFacet',
  );

  // addAsset creating a short lived mint
  // See https://github .com/hindley-milner-systems/dapp-ertp-airdrop/issues/164
  await E(bankManager).addAsset(
    'uTribbles',
    'Tribbles',
    'Tribbles Intersubjective Token',
    harden({
      issuer: tribblesIssuer,
      brand: tribblesBrand,
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
      consume: { IST: true, Tribbles: true },
      produce: { Tribbles: true },
    },
    brand: {
      consume: { IST: true, Tribbles: true },
      produce: { Tribbles: true },
    },
    instance: { produce: { [contractName]: true } },
  },
});

export const getManifestForAirdrop = (
  { restoreRef },
  {
    installKeys,
    options = {
      customTerms: {
        ...defaultCustomTerms,
        merkleRoot:
          'b76e712cf47109285bf9fe0027a20f1dd8790adb1645bbaf4317d1af8668876d',
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
      tribblesAirdrop: restoreRef(installKeys.tribblesAirdrop),
    },
    options,
  });
};

export const permit = Object.values(airdropManifest)[0];

// ´
