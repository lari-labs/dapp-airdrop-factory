// @ts-check
import { E } from '@endo/far';
import { allValues } from './objectTools.js';
import { installContract, startContract } from './airdrop/airdrop.coreEval.js';
import { TimeIntervals } from './airdrop/helpers/time.js';
import { AIRDROP_TIERS_STATIC } from '../test/data/account.utils.js';
import './airdrop/types.js';

/** @import { StartArgs } from './platform-goals/start-contract.js'; */

const relTimeMaker = (timerBrand, x = 0n) =>
  harden({ timerBrand, relValue: x });

export const defaultCustomTerms = {
  initialPayoutValues: harden(AIRDROP_TIERS_STATIC),
  targetNumberOfEpochs: 5,
  targetEpochLength: TimeIntervals.SECONDS.ONE_DAY,
  targetTokenSupply: 10_000_000n,
  tokenName: 'Tribbles',
};

export const makeTerms = (terms = {}) => ({
  ...defaultCustomTerms,
  ...terms,
});

harden(makeTerms);

const contractName = 'tribblesAirdrop';

/**
 * Core eval script to start contract
 *
 * @param {BootstrapPowers } permittedPowers
 * @param {*} config
 *
 * @typedef {{
 *   brand: PromiseSpaceOf<{ Tribbles: import('@agoric/ertp/src/types.js').Brand }>;
 *   issuer: PromiseSpaceOf<{ Tribbles: import('@agoric/ertp/src/types.js').Issuer }>;
 *   instance: PromiseSpaceOf<{ [contractName]: Instance }>
 * }} AirdropSpace
 */
export const startAirdrop = async (permittedPowers, config) => {
  console.log('######## inside startAirdrop ###########');
  console.log('config ::::', config);
  console.log('----------------------------------');

  const {
    consume: { chainTimerService, startUpgradable },
    installation: {
      consume: { [contractName]: airdropInstallationP },
    },
    instance: {
      produce: { [contractName]: airdropInstance },
    },
  } = permittedPowers;
  console.log('permitted Powers:::', permittedPowers);

  const [_installation, instance, { issuer: issuerIST }, timer, timerBrand] =
    await Promise.all([
      airdropInstallationP,
      airdropInstance,
      allValues({
        brand: permittedPowers.brand.consume.IST,
        issuer: permittedPowers.issuer.consume.IST,
      }),
      chainTimerService,
      E(chainTimerService).getTimerBrand(),
    ]);

  const { customTerms } = config.options;

  /** @type {CustomContractTerms} */
  const terms = {
    ...customTerms,
    startTime: relTimeMaker(timerBrand, TimeIntervals.SECONDS.ONE_DAY),
    merkleRoot: config.options.merkleRoot,
  };
  console.log('BEFORE assert(config?.options?.merkleRoot');
  assert(
    config?.options?.merkleRoot,
    'can not start contract without merkleRoot???',
  );
  console.log('AFTER assert(config?.options?.merkleRoot');

  const privateArgs = harden({
    timer,
  });

  const startArgs = {
    installation: _installation,
    name: contractName,
    terms,
    issuerKeywordRecord: {
      Fee: issuerIST,
    },
    issuerNames: ['Tribbles'],
    privateArgs,
    merkleRoot: config.options.merkleRoot,
  };
  console.log('BEFORE astartContract(permittedPowers, startArgs);');

  await startContract(permittedPowers, startArgs);

  console.log('AFTER astartContract(permittedPowers, startArgs);');
};

/** @type { import("@agoric/vats/src/core/lib-boot").BootstrapManifest } */
const airdropManifest = {
  [startAirdrop.name]: {
    consume: {
      chainTimerService: true,
      agoricNames: true,
      namesByAddressAdmin: true,
      brandAuxPublisher: true,
      startUpgradable: true, // to start contract and save adminFacet
      zoe: true, // to get contract terms, including issuer/brand,
    },
    installation: {
      consume: { [contractName]: true },
      produce: { [contractName]: true },
    },
    issuer: { consume: { IST: true }, produce: { Tribbles: true } },
    brand: { consume: { IST: true }, produce: { Tribbles: true } },
    instance: { produce: { [contractName]: true } },
  },
};
harden(airdropManifest);

export const permit = airdropManifest[startAirdrop.name];

const { Fail } = assert;
export const main = (
  permittedPowers,

  config = {
    options: Fail`missing options config`,
  },
) => {
  startAirdrop(permittedPowers, config);
};

export const getManifestForAirdrop = ({ restoreRef }, { airdropRef }) => {
  return harden({
    manifest: airdropManifest,
    installations: {
      airdrop: restoreRef(airdropRef),
    },
  });
};
