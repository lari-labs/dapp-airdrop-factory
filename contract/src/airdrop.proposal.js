// @ts-check
import { E } from '@endo/far';
import { makeIssuerKit } from '@agoric/ertp/src/issuerKit.js';
import {
  AmountMath,
  installContract,
  startContract,
} from './airdrop/airdrop.coreEval.js';
import { TimeIntervals } from './airdrop/helpers/time.js';
import { allValues } from './objectTools.js';
import { AIRDROP_TIERS } from '../test/data/account.utils.js';
import { makeTreeRemotable } from '../test/data/tree.utils.js';
import { fixHub } from './fixHub.js';

const defaultContractTemrs = {
  tiers: AIRDROP_TIERS,
  startEpoch: 0,
  totalEpochs: 5,
  epochLength: TimeIntervals.SECONDS.ONE_DAY,
  bonusSupply: 100_000n,
  baseSupply: 10_000_000n,
  tokenName: 'Tribbles',
}
const { SECONDS: { ONE_DAY } } = TimeIntervals

// const defaultArgs = 
// {
//   tiers: AIRDROP_TIERS,
//   startEpoch: 0,
//   totalEpochs: 5,
//   epochLength: TimeIntervals.SECONDS.ONE_DAY,
//   bonusSupply: 100_000n,
//   baseSupply: 10_000_000n,
//   tokenName: 'Tribbles',
//   startTime: makeRelTimeMaker(ONE_DAY * 3n),
// }
/** @import { Payment, Brand, Issuer } from '@agoric/ertp/src/types.js'; */
// TODO: Get to the bottom of using bankManager
// /** @import { AssetIssuerKit } from '@agoric/vats/src/vat-bank.js' */
// /** @import {ERef} from '@endo/far'  */

// /**
//  *
//  * @param {string} denom lower-level denomination string
//  * @param {string} issuerName
//  * @param {string} proposedName
//  * @param {import('@agoric/vats/src/vat-bank.js').AssetIssuerKit & { payment?: ERef<Payment> }} kit ERTP issuer
//  *
//  */
const { Fail } = assert;

const contractName = 'airdrop';

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
export const startAirdropCampaignContract = async (permittedPowers, config) => {
  console.log('core eval for', contractName);
  const {
    // must be supplied by caller or template-replaced
    consume: { namesByAddressAdmin },
  } = config?.options?.[contractName] ?? {};


  // const {tiers = AIRDROP_TIERS, epochLength = ONE_DAY, tokenName = 'Tribbles', bonusSupply =  100_000n, baseSupply = 10_000_000 } = config.terms;
  console.log('insidde startAirdropCampaign :::::', {
    config,
    airdrop: config.options.airdrop,
  });

  const installation = await installContract(permittedPowers, {
    name: contractName,
    bundleID: config.options.airdrop.bundleID,
  });

  console.group('---------- inside startAirdropCampaignContract----------');
  console.log('------------------------');
  console.log('installation::', installation);
  console.log('------------------------');
  console.log(':: powers', permittedPowers);
  console.log('------------------------');
  console.groupEnd();

  const [ist, timer] = await Promise.all([allValues({
    brand: permittedPowers.brand.consume.IST,
    issuer: permittedPowers.issuer.consume.IST,
  }), permittedPowers.consume.chainTimerService]);

  const timerBrand = await E(timer).getTimerBrand();

  const namesByAddress = await fixHub(namesByAddressAdmin);
  const terms = harden({ 
    ...defaultContractTemrs, 
    namesByAddress, 
    startTime: ({ timerBrand, relValue: ONE_DAY })
  });

  await startContract(permittedPowers, {
    name: contractName,
    startArgs: {
      installation,
      issuerKeywordRecord: {
        Price: ist.issuer
      },
      terms,
      privateArgs: {
        timer,
        TreeRemotable: makeTreeRemotable()
        // TODO: think about this approach....
      },
      issuerNames: ['Tribbles']
    },
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
    zoe: true, // to get contract terms, including issuer/brand
  },
  installation: {
    consume: { [contractName]: true },
    produce: { [contractName]: true },
  },
  instance: { produce: { [contractName]: true } },
  issuer: { consume: { IST: true }, produce: { Tribbles: true } },
  brand: { consume: { IST: true } }, produce: { Tribbles: true },
});

export const main = startAirdropCampaignContract;
