// @ts-check
import { E } from '@endo/far';
import { allValues } from './objectTools.js';

import {
  installContract,
  startContract,
} from './platform-goals/start-contract.js';
import { AIRDROP_TIERS_STATIC } from '../test/data/account.utils.js';
import { TimeIntervals } from './airdrop/helpers/time.js';
import { merkleTreeAPI } from './merkle-tree/index.js';
import { agoricPubkeys } from '../test/data/agd-keys.js';

/** @import { StartArgs } from './platform-goals/start-contract.js'; */

const relTimeMaker = (timerBrand, x = 0n) =>
  harden({ timerBrand, relValue: x });
const contractName = 'tribblesAirdrop';

export const defaultCustomTerms = {
  initialPayoutValues: harden(AIRDROP_TIERS_STATIC),
  targetNumberOfEpochs: 5,
  targetEpochLength: TimeIntervals.SECONDS.ONE_DAY,
  targetTokenSupply: 10_000_000n,
  tokenName: 'Tribbles',
  startTime: TimeIntervals.SECONDS.ONE_DAY,
  merkleRoot: merkleTreeAPI.generateMerkleRoot(agoricPubkeys),
};

export const makeTerms = (terms = {}) => ({
  ...defaultCustomTerms,
  ...terms,
});

harden(makeTerms);

/**
 * Core eval script to start contract
 *
 * @param {BootstrapPowers } permittedPowers
 * @param {*} config
 *
 * @typedef {{
 *   brand: PromiseSpaceOf<{ Ticket: import('@agoric/ertp/src/types.js').Brand }>;
 *   issuer: PromiseSpaceOf<{ Ticket: import('@agoric/ertp/src/types.js').Issuer }>;
 *   instance: PromiseSpaceOf<{ sellConcertTickets: Instance }>
 * }} StartAirdropCampaign
 */
export const startTribblesAirdrop = async (permittedPowers, config) => {
  const {
    consume: { chainTimerService },
  } = permittedPowers;

  const {
    // must be supplied by caller or template-replaced
    bundleID = config.bundleID,
  } = config?.options?.[contractName] ?? {};
  const ps = allValues({
    ist: {
      brand: permittedPowers.brand.consume.IST,
      issuer: permittedPowers.issuer.consume.IST,
    },
    timer: chainTimerService,
    timerBrand: E(chainTimerService).getTimerBrand(),
  });

  const { ist, timer, timerBrand } = await ps;
  console.log('AFTER AWAITING :::', { ist, timer, timerBrand });
  const { customTerms } = config.options;

  console.log('TimerBrand:::', timerBrand);

  console.log('contract launch config object :::');

  const terms = makeTerms({
    ...customTerms,
    startTime: relTimeMaker(timerBrand, customTerms.startTime),
  });
  const installation = await installContract(permittedPowers, {
    name: contractName,
    bundleID,
  });

  console.group('---------- inside startAirdropCampaignContract----------');
  console.log('------------------------');
  console.log('installation::', installation);
  console.log('------------------------');
  console.log(':: powers', permittedPowers);
  console.log('------------------------');
  console.log('ps ::::', ps);
  console.log('----------------------------------');
  console.groupEnd();

  console.log('TERMS:::', { terms });

  /** @type {StartArgs} */

  const startArgs = {
    installation,
    issuerKeywordRecord: {
      Fee: ist.issuer,
    },
    terms,
    privateArgs: { timer },
  };

  await startContract(permittedPowers, {
    name: contractName,
    startArgs,
    issuerNames: ['Tribbles'],
  });

  console.log(contractName, '(re)started');
};
/** @type { import("@agoric/vats/src/core/lib-boot").BootstrapManifestPermit } */
export const permit = harden({
  consume: {
    bankManager: true,
    chainTimerService: true,
    agoricNames: true,
    namesByAddress: true,
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
});

export const main = startTribblesAirdrop;
