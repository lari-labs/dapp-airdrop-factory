// @ts-check
import { E, Far } from '@endo/far';
import { makeIssuerKit } from '@agoric/ertp/src/issuerKit.js';
import { oneDay } from './airdrop/helpers/time.js';
import { allValues } from './objectTools.js';
import { fixHub } from './fixHub.js';

const AIRDROP_TIERS_STATIC = [9000, 6500, 3500, 1500, 750];

import {
  installContract,
  startContract,
} from './platform-goals/start-contract.js';
import { lensProp, view } from './airdrop/helpers/lenses.js';
import { makeMarshal } from '@endo/marshal';
import { AmountMath } from '@agoric/ertp';

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
const makeStartTime = (timerBrand, ts = oneDay) =>
  harden({ brand: timerBrand, relValue: ts });

const makeFeePrice = feeBrand => AmountMath.make(feeBrand, 5n);

// /**
//  * @param {BootstrapPowers} powers
//  * @param {{ options?: { postalService: {
//  *   bundleID: string;
//  * }}}} [config]
//  */
// export const startTribblesDistribution = async (powers, config) => {
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
    relTimeMaker: x => harden({ timerBrand, relValue: x }),
  };
};
const contractName = 'tribblesAirdrop';

const bundleIdLens = lensProp('bundleID');

const customTermsLens = lensProp('customTerms');
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
export const startTribblesDistribution = async (permittedPowers, config) => {
  const {
    brand: {
      consume: { IST: feeBrand },
    },
    issuer: {
      consume: { IST: feeIssuer },
    },
    consume: { namesByAddressAdmin, chainTimerService },
  } = permittedPowers;

  const { timerBrand, timer, relTimeMaker } =
    await makeTimerPowers(permittedPowers);

  const {
    // must be supplied by caller or template-replaced
    bundleID = config.bundleID,
  } = config?.options?.[contractName] ?? {};
  const feeIssuerDetails = await allValues({
    brand: permittedPowers.brand.consume.IST,
    issuer: permittedPowers.issuer.consume.IST,
  });

  console.log('feeIssuerDetails::', { feeIssuerDetails });
  const { customTerms, privateArgs: privateArguments } = config.options;

  console.log('TimerBrand:::', timerBrand);

  const contractLaunchConfig = {
    ...customTerms,
    startTime: relTimeMaker(oneDay),
  };

  console.log('contract launch config object :::', contractLaunchConfig);

  // const {tiers = AIRDROP_TIERS, epochLength = ONE_DAY, tokenName = 'Tribbles', bonusSupply =  100_000n, baseSupply = 10_000_000 } = config.terms;
  console.log('insidde startAirdropCampaign :::::', {
    config,
    airdrop: config.options.tribblesAirdrop,
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
  console.groupEnd();

  const namesByAddress = await fixHub(namesByAddressAdmin);
  const terms = harden({
    ...contractLaunchConfig,
    namesByAddress,
  });

  console.log('TERMS:::', { terms });

  /** @type {StartArgs} */

  const startArgs = {
    installation,
    issuerKeywordRecord: {
      Fee: feeIssuer,
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

export const manifest = /** @type {const} */ ({
  [startTribblesDistribution.name]: {
    consume: {
      bankManager: true,
      chainTimerService: true,
      agoricNames: true,
      namesByAddress: true,
      namesByAddressAdmin: true,
      brandAuxPublisher: true,
      startUpgradable: true, // to start contract and save adminFacet
      zoe: true, // to get contract terms, including issuer/brand
    },
    installation: {
      consume: { [contractName]: true },
      produce: { [contractName]: true },
    },
    instance: { produce: { [contractName]: true } },
    issuer: { consume: { IST: true }, produce: { Tribbles: true } },
    brand: { consume: { IST: true } },
    produce: { Tribbles: true },
  },
});

export const permit = Object.values(manifest)[0];

export const main = startTribblesDistribution;
