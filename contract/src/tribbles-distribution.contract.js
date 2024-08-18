// @ts-nocheck
import { M } from '@endo/patterns';
import { makeDurableZone } from '@agoric/zone/durable.js';
import { E } from '@endo/far';
import { AmountMath, AmountShape, IssuerShape, PurseShape } from '@agoric/ertp';
import { TimeMath, RelativeTimeRecordShape } from '@agoric/time';
import { InvitationShape, TimerShape } from '@agoric/zoe/src/typeGuards.js';
import { makeWaker, oneDay } from './airdrop/helpers/time.js';
import {
  handleFirstIncarnation,
  makeCancelTokenMaker,
} from './airdrop/helpers/validation.js';
import { makeStateMachine } from './airdrop/helpers/stateMachine.js';
import { createClaimSuccessMsg } from './airdrop/helpers/messages.js';
import { compose, head, objectToMap } from './airdrop/helpers/objectTools.js';
import {
  actionCreators,
  createStore,
  reducer,
} from './airdrop/helpers/reducers.js';
import { lensProp, view } from './airdrop/helpers/lenses.js';

const { keys, values } = Object;

const makeTrackerArray = x => Array.from({ length: x }, () => 0);

const cancelTokenMaker = makeCancelTokenMaker('airdrop-campaign');

/**
 * @param {ZCFSeat} seat
 */
const getSeatAllocationDetils = seat => ({
  currentAllocation: seat.getCurrentAllocation(),
  stagedAllocation: seat.getStagedAllocation(),
  hasExited: seat.hasExited(),
});

const currentAllocationLens = lensProp('currentAllocation');
const viewCurrentAllocation = view(currentAllocationLens);

const makeInspectAmountString = amount =>
  `Inspecting an object holding ${amount.value} tokens.`;
const trace = label => value => {
  console.log(label, ':::', value);
  return value;
};
const makeCurrentAllocationMsg = compose(
  makeInspectAmountString,
  view(currentAllocationLens),
  trace('after getSeatAllocationDetils'),
  getSeatAllocationDetils,
);
const mintTokenSupply = (tokenMint, amount, toSeat) => {
  return tokenMint.mintGains({ AirdropToken: amount }, toSeat);
};

const AIRDROP_STATES = {
  INITIALIZED: 'initialized',
  PREPARED: 'prepared',
  OPEN: 'claim-window-open',
  EXPIRED: 'claim-window-expired',
  CLOSED: 'claiming-closed',
  RESTARTING: 'restarting',
};
const { OPEN, EXPIRED, PREPARED, INITIALIZED, RESTARTING } = AIRDROP_STATES;

/** @import { CopySet } from '@endo/patterns'; */
/** @import { Brand, Issuer, NatValue, Purse } from '@agoric/ertp/src/types.js'; */
/** @import { CancelToken, TimerService, TimestampRecord } from '@agoric/time/src/types.js'; */
/** @import { Baggage } from '@agoric/vat-data'; */
/** @import { Zone } from '@agoric/base-zone'; */
/** @import { ContractMeta } from './@types/zoe-contract-facet.js'; */
/** @import { Remotable } from '@endo/marshal' */

export const privateArgsShape = harden({
  // marshaller: M.remotable('marshaller'),
  timer: TimerShape,
});

export const customTermsShape = harden({
  feePrice: AmountShape,
  targetEpochLength: M.bigint(),
  tiers: M.any(),
  tokenName: M.string(),
  targetTokenSupply: M.bigint(),
  namesByAddress: M.remotable('namesByAddress'),
  targetNumberOfEpochs: M.number(),
  startTime: RelativeTimeRecordShape,
});

/**
 * @param {TimestampRecord} sourceTs Base timestamp used to as the starting time which a new Timestamp will be created against.
 * @param {RelativeTimeRecordShape} inputTs Relative timestamp spanning the interval of time between sourceTs and the newly created timestamp
 */

const createFutureTs = (sourceTs, inputTs) =>
  TimeMath.absValue(sourceTs) + TimeMath.relValue(inputTs);

/**
 *
 * @typedef {object} ContractTerms
 * @property {object} tiers
 * @property {Amount} feePrice The fee associated with exercising one's right to claim a token.
 * @property {bigint} targetTokenSupply Base supply of tokens to be distributed throughout an airdrop campaign.
 * @property {string} tokenName Name of the token to be created and then airdropped to eligible claimaints.
 * @property {number} targetNumberOfEpochs Total number of epochs the airdrop campaign will last for.
 * @property {bigint} targetEpochLength Length of time for each epoch, denominated in seconds.
 * @property {RelativeTimeRecordShape} startTime Length of time (denoted in seconds) between the time in which the contract is started and the time at which users can begin claiming tokens.
 * @property {{ [keyword: string]: Brand }} brands
 * @property {{ [keyword: string]: Issuer }} issuers
 */

/**
 * @param {ZCF<ContractTerms>} zcf
 * @param {{ marshaller: Remotable, timer: TimerService }} privateArgs
 * @param {Baggage} baggage
 */
export const start = async (zcf, privateArgs, baggage) => {
  handleFirstIncarnation(baggage, 'LifecycleIteration');
  // XXX why is type not inferred from makeDurableZone???
  /** @type { Zone } */
  const zone = makeDurableZone(baggage, 'rootZone');

  const { timer } = privateArgs;
  /** @type {ContractTerms} */
  const {
    startTime,
    feePrice,
    targetEpochLength = oneDay,
    targetTokenSupply = 10_000_000n,
    tokenName = 'Tribbles',
    tiers = [9000, 6500, 3500, 1500, 750],
  } = zcf.getTerms();

  const airdropStatusTracker = zone.mapStore('airdrop claim window status');

  const stateMachine = makeStateMachine(
    INITIALIZED,
    [
      [INITIALIZED, [PREPARED]],
      [PREPARED, [OPEN]],
      [OPEN, [EXPIRED, RESTARTING]],
      [RESTARTING, [OPEN]],
      [EXPIRED, []],
    ],
    airdropStatusTracker,
  );

  const t0 = await E(timer).getCurrentTimestamp();
  console.log('timer ::::', { timer, t0 });
  console.log('----------------------------------');
  const tokenMint = await zcf.makeZCFMint(tokenName);

  const { brand: tokenBrand, issuer: tokenIssuer } =
    await tokenMint.getIssuerRecord();

  const { zcfSeat: contractSeat } = zcf.makeEmptySeatKit();

  await objectToMap(
    {
      // exchange this for a purse created from ZCFMint
      incarnationRef: baggage.get('LifecycleIteration'),
      airdropTiers: tiers,
      epochLength: targetEpochLength,
      currentEpoch: zone.mapStore(),
      tokenIssuer,
      startTime: createFutureTs(t0, startTime),
      claimedAccountsStore: zone.setStore('claimed accounts'),
      airdropStatusTracker: zone.mapStore('airdrop status'),
    },
    baggage,
  );
  console.log('----------------------------------');

  console.log('[...baggage.values() ::::', [...baggage.values()]);

  console.log('----------------------------------');

  console.log('[...baggage.keys() ::::', [...baggage.keys()]);
  console.log('----------------------------------');
  const interfaceGuard = {
    helper: M.interface(
      'Helper',
      {
        // combineAmounts: M.call().returns(AmountShape),
        cancelTimer: M.call().returns(M.promise()),
        updateDistributionMultiplier: M.call(M.any()).returns(M.promise()),
        updateEpochDetails: M.call(M.any(), M.any()).returns(),
      },
      { sloppy: true },
    ),
    public: M.interface('public facet', {
      makeClaimTokensInvitation: M.call().returns(M.promise()),
    }),
    creator: M.interface('creator', {
      pauseContract: M.call().returns(M.any()),
    }),
  };

  const initState =
    /**
     * @description initializes state for this exoClassKit.
     *
     * TODO
     * Create issue for:
     *  - My use of baggage values throughout code but specificially within exo context.
     *  - What is the relation between durable values <-> state values.
     * More specifically, state values such as that which exist in a durableZone.
     * Reviewin
     *
     * @param {CopySet} store
     * @param {CancelToken} currentCancelToken
     */
    (store, currentCancelToken) => {
      console.log('this value::', this);

      const contractSeatWithTokens = mintTokenSupply(
        tokenMint,
        AmountMath.make(tokenBrand, targetTokenSupply),
        contractSeat,
      );
      const state = {
        /** @type { object } */
        contractSeat: zcf.makeEmptySeatKit().zcfSeat,
        currentCancelToken,
        claimedAccounts: store,
        currentEpoch: null,
      };
      console.log(
        'getSeatAllocationDetils ::::',
        getSeatAllocationDetils(contractSeatWithTokens),
      );
      console.log('----------------------------------');
      console.log('contractSeatWithTokens ::::', contractSeatWithTokens);
      console.log('----------------------------------');
      console.log('state ::::', state);
      console.log('----------------------------------');
      return { ...state, contractSeat: contractSeatWithTokens };
    };
  const prepareContract = zone.exoClassKit(
    'Tribble Token Distribution',
    interfaceGuard,
    initState,
    {
      helper: {
        /**
         * @param {TimestampRecord} absTime
         * @param {number} epochIdx
         */
        updateEpochDetails(absTime, epochIdx) {
          const {
            state: { currentEpoch },
          } = this;
          const { helper } = this.facets;
          console.log('inside updateEpochDetails ::::');
          console.log('----------------------------------');

          // add logic for updating claim amounts for each tier
          // 1. add claimAmounts: tiers to initState
          // 2. update state.claimAmounts using the following logic:
          // claimAmountsArray.map(x => AmountMath.make(tokenBrand, x / 2))

          helper.updateDistributionMultiplier(
            TimeMath.addAbsRel(absTime, targetEpochLength),
          );
        },
        async updateDistributionMultiplier(wakeTime) {
          console.log('WAKE TIME:::', { wakeTime });
          const { facets } = this;
          // const epochDetails = newEpochDetails;

          this.state.currentCancelToken = cancelTokenMaker();

          void E(timer).setWakeup(
            wakeTime,
            makeWaker(
              'updateDistributionEpochWaker',
              /** @param {TimestampRecord} latestTs */
              ({ absValue: latestTs }) => {
                let { currentEpoch } = this.state;
                if (currentEpoch > 0) {
                  currentEpoch += 1;
                }

                // TODO: Investigate whether this logic is still necessary. If it is not, then remove.

                // console.log('LATEST SET:::', tiersStore.get('current'));

                facets.helper.updateEpochDetails(latestTs, currentEpoch);
              },
            ),
            this.state.currentCancelToken,
          );
          return 'wake up successfully set.';
        },
        async cancelTimer() {
          await E(timer).cancel(this.state.currentCancelToken);
        },
        updateEpoch(x) {
          console.log(
            'BEFORE -------- this.state.currentEpoch ::::',
            this.state.currentEpoch,
          );
          console.log('----------------------------------');

          this.state.currentEpoch = x;
          console.log(
            'AFTER -------- this.state.currentEpoch ::::',
            this.state.currentEpoch,
          );
        },
        increasePrimarySeatAllocation() {
          // Transfer payment from bonusSeat to primarySeat -> increase supply by 0.5 percent.
          // The other 0.5 percent is distributed equally amongst claimants whose collective actions led to the bonusMint threshold being met.shold being met.
        },
        /**
         * @param store
         * @param root0
         * @param root0.address
         * @param root0.pubkey
         * @param root0.amount
         * @param root0.tier
         * @description
         * handles the following logic:
         * 1. adding latest claimants to the setStore associated with
         * the current epoch (which they just successfully claimed in)
         * 2. prepares the next payout to be claimed by calculating
         * its value using the incremental decaay equation.
         *
         * Objective:
         *  - calculate the next payment for next individual
         *
         */
        handleBookKeeping(store, { address, amount }) {
          // // k = current claimeer index. the first individual who clims will make out
          // // rate
          // for (let k = 1; k <= maxClaimaints; k++) {
          //   let tokenAmount = maxClaimaints * Math.pow(rate, (k - 1));
          //   tokens.push(tokenAmount);
          //   }

          // TODO: Remove in place of external value which tracks claim metrics.
          this.state.currentEpochClaimCount += 1;

          // Formulae for

          // // max tokens (for tier)
          // const a_1 = 1000;
          // // decay rate
          // const rate = 0.9999;
          // // max claimans  (for tier)
          // const n = 1000;

          // // TODO
          // // extract logic from within loop;.

          // for (let k = 1; k <= n; k++) {
          //   let tokenAmount = a_1 * toPower()(k - 1));
          //   tokens.push(tokenAmount);
          // }

          // iiinspect:: tokens
          // const tokenAmount = a_1 * r_i**(k - 1);

          // TODO
          // logic for rewardClaimant
          // if(this.store.currentEpochClaimCount >= bonusMintThreshold) rewardClaimants(store) && increasePrimarySeatAllocation();

          console.log('setStore.keys() :: AFTER ADDING NEW ENTRY ', [
            ...store.keys(),
          ]);
          console.log('------------------------');
          console.groupEnd();
          return `Successfully added ${address} to setStore.`;
        },
        getState() {
          return this.state;
        },
        getSlice(key = '') {
          return this.state[key];
        },
      },
      public: {
        makeClaimTokensInvitation() {
          return zcf.makeInvitation(seat => {
            console.log('---- OFFER HANDLER ---');
            console.log('seat ::::', seat);
            console.log('----------------------------------');
          }, 'claim airdrop invitation');
        },
      },
      creator: {
        pauseContract() {},
      },
    },
  );
  const cancelToken = cancelTokenMaker();
  const {
    creator,
    helper,
    public: publicFacet,
  } = prepareContract(airdropStatusTracker, cancelToken);

  console.log('START TIME', baggage.get('startTime'));
  await E(timer).setWakeup(
    baggage.get('startTime'),
    makeWaker('claimWindowOpenWaker', ({ absValue }) => {
      console.log('inside makeWakerxxaa:::', { absValue });
      debugger;
      airdropStatusTracker.init('currentEpoch', 0);

      helper.updateEpochDetails(absValue, 0);
      helper.updateEpoch(0);
      stateMachine.transitionTo(OPEN);
      debugger;
    }),
    cancelToken,
  );

  stateMachine.transitionTo(PREPARED);

  return harden({
    creatorFacet: creator,
    publicFacet,
  });
};
