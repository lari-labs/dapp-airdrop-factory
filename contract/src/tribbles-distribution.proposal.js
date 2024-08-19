// @ts-check
import { E, Far } from '@endo/far';
import { makeIssuerKit } from '@agoric/ertp/src/issuerKit.js';
import { oneDay } from './airdrop/helpers/time.js';
import { allValues } from './objectTools.js';
import { fixHub } from './fixHub.js';

import { lensProp, view } from './airdrop/helpers/lenses.js';
import { makeMarshal } from '@endo/marshal';
import { AmountMath } from '@agoric/ertp';
import { installContract, startContract } from './airdrop/airdrop.coreEval.js';
/** @import { StartArgs } from './platform-goals/start-contract.js'; */

/*  */
/**
 * @file core eval script* to start the postalService contract.
 *
 * * see rollup.config.mjs to make a script from this file.
 *
 * The `permit` export specifies the corresponding permit.
 */
// @ts-check

const { Fail } = assert;

// /**
//  * @param {BootstrapPowers} powers
//  * @param {{ options?: { postalService: {
//  *   bundleID: string;
//  * }}}} [config]
//  */
// export const startTribblesAirdrop = async (powers, config) => {
//   const {
//     consume: { namesByAddressAdmin },
//   } = powers;
//   const {
//     // must be supplied by caller or template-replaced
//     bundleID = Fail`no bundleID`,
//   } = config?.options?.[contractName] ?? {};

//   const installation = await installContract(powers, {
//     name: contractName,
//     bundleID,
//   });

//   const namesByAddress = await fixHub(namesByAddressAdmin);
//   const terms = harden({ namesByAddress });

//   await startContract(powers, {
//     name: contractName,
//     startArgs: { installation, terms },
//   });
// };

const makeTimerPowers = async ({ consume }) => {
  const timer = await consume.chainTimerService;

  const timerBrand = await E(timer).getTimerBrand();

  return {
    timer,
    timerBrand,
  };
};
const relTimeMaker = (timerBrand, x = 0n) =>
  harden({ timerBrand, relValue: x });
const contractName = 'tribblesAirdrop';

/**
 * Core eval script to start contract
 *
 * @param {BootstrapPowers } permittedPowers
 * @param {*} config
 *
 * @typedef {{
 *   brand: PromiseSpaceOf<{ Ticket: Brand }>;
 *   issuer: PromiseSpaceOf<{ Ticket: Issuer }>;
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
  const [{ issuer: issuerIST, brand: brandIST }, timer, timerBrand] =
    await Promise.all([
      allValues({
        brand: permittedPowers.brand.consume.IST,
        issuer: permittedPowers.issuer.consume.IST,
      }),
      chainTimerService,
      E(chainTimerService).getTimerBrand(),
    ]);

  const { customTerms } = config.options;

  console.log('TimerBrand:::', timerBrand);

  console.log('contract launch config object :::');

  const terms = {
    ...customTerms,
    startTime: relTimeMaker(timerBrand, customTerms.startTime),
  };
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
  console.groupEnd();

  console.log('TERMS:::', { terms });

  /** @type {StartArgs} */

  const startArgs = {
    installation,
    issuerKeywordRecord: {
      Fee: issuerIST,
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
