// @ts-check
import { M, mustMatch } from '@endo/patterns';
import { makeDurableZone } from '@agoric/zone/durable.js';
import { E } from '@endo/far';
import {
  AmountMath,
  AmountShape,
  BrandShape,
  IssuerShape,
  PurseShape,
} from '@agoric/ertp';
import { TimeMath, RelativeTimeRecordShape } from '@agoric/time';
import { TimerShape } from '@agoric/zoe/src/typeGuards.js';
import {
  fromOnly,
  toOnly,
  atomicRearrange,
  withdrawFromSeat,
  makeRatio,
} from '@agoric/zoe/src/contractSupport/index.js';
import { makeMarshal } from '@endo/marshal';
import { decodeBase64 } from '@endo/base64';
import {
  ceilMultiplyBy,
  multiplyBy,
} from '@agoric/zoe/src/contractSupport/ratio.js';
import { makeWaker, TimeIntervals } from './helpers/time.js';
import {
  handleFirstIncarnation,
  makeCancelTokenMaker,
} from './helpers/validation.js';
import { makeStateMachine } from './helpers/stateMachine.js';
import { createClaimSuccessMsg } from './helpers/messages.js';
import { objectToMap } from './helpers/objectTools.js';
import {
  actionCreators,
  createClaimReducerState,
  createStore,
  reducer,
} from './helpers/reducers.js';

const makeIncrementalDecayFn = r => p => i => p * r ** i;

const { keys, values } = Object;

const makeTrackerArray = x => Array.from({ length: x }, () => 0);

const getLast = x => x.slice(x.length - 1);

const cancelTokenMaker = makeCancelTokenMaker('airdrop-campaign');

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
/** @import { ContractMeta } from '../@types/zoe-contract-facet.js'; */
/** @import { Remotable } from '@endo/marshal' */

export const privateArgsShape = harden({
  TreeRemotable: M.remotable('Merkle Tree'),
  purse: PurseShape,
  bonusPurse: PurseShape,
  timer: TimerShape,
});

export const customTermsShape = harden({
  tiers: M.any(),
  totalEpochs: M.bigint(),
  startTime: RelativeTimeRecordShape,
});

/** @type {ContractMeta} */
export const meta = {
  customTermsShape,
  privateArgsShape,
  upgradability: 'canUpgrade',
};

let issuerNumber = 1;

/**
 * @param {string} addr
 * @returns {ERef<DepositFacet>}
 */
const getDepositFacet = addr => {
  assert.typeof(addr, 'string');
  return E(namesByAddress).lookup(addr, 'depositFacet');
};

/**
 * @param {string} addr
 * @param {Payment} pmt
 */
const sendTo = (addr, pmt) => E(getDepositFacet(addr)).receive(pmt);

/**
 * @param zcf
 * @param {string} recipient
 * @param {Issuer[]} issuers
 */
const makeSendInvitation = (zcf, recipient, issuers) => {
  assert.typeof(recipient, 'string');
  mustMatch(issuers, M.arrayOf(IssuerShape));

  for (const i of issuers) {
    if (!Object.values(zcf.getTerms().issuers).includes(i)) {
      zcf.saveIssuer(i, `Issuer${(issuerNumber += 1)}`);
    }
  }

  /** @type {OfferHandler} */
  const handleSend = async seat => {
    const { give } = seat.getProposal();
    const depositFacet = await getDepositFacet(recipient);
    const payouts = await withdrawFromSeat(zcf, seat, give);

    // XXX partial failure? return payments?
    await Promise.all(
      values(payouts).map(pmtP =>
        E.when(pmtP, pmt => E(depositFacet).receive(pmt)),
      ),
    );
    seat.exit();
    return `sent ${keys(payouts).join(', ')}`;
  };

  return zcf.makeInvitation(handleSend, 'send');
};

const getKey = baggage => key => baggage.get(key);

const setValue = baggage => key => newValue => baggage.set(key, newValue);

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
 * @property {bigint} bonusSupply Number of tokens that should be made available if certain criteria is met. Whereas the base supply tokens are guaranteed to be available for distribution, tokens held within the bonus supply are only introduced into the contract when a certain criteria is met. (e.g. If X number of claims occur within an epoch, increase the supply of tokens by 1%)
 * @property {bigint} baseSupply Base supply of tokens to be distributed throughout an airdrop campaign.
 * @property {string} tokenName Name of the token to be created and then airdropped to eligible claimaints.
 * @property {bigint} totalEpochs Total number of epochs the airdrop campaign will last for.
 * @property {bigint} epochLength Length of time for each epoch, denominated in seconds.
 * @property {RelativeTimeRecordShape} startTime Length of time (denoted in seconds) between the time in which the contract is started and the time at which users can begin claiming tokens.
 * @property {{ [keyword: string]: Brand }} brands
 * @property {{ [keyword: string]: Issuer }} issuers
 */

/**
 * @param {ZCF<ContractTerms>} zcf
 * @param {{ purse: Purse, bonusPurse: Purse, TreeRemotable: Remotable, timer: TimerService }} privateArgs
 * @param {Baggage} baggage
 */
export const start = async (zcf, privateArgs, baggage) => {
  handleFirstIncarnation(baggage, 'LifecycleIteration');
  // XXX why is type not inferred from makeDurableZone???
  /** @type { Zone } */
  const zone = makeDurableZone(baggage, 'rootZone');

  const { timer, TreeRemotable, marshaller } = privateArgs;

  /** @type {ContractTerms} */
  const {
    startTime,
    epochLength,
    bonusSupply = 100_000n,
    baseSupply = 10_000_000n,
    tokenName = 'Tribbles',
    tiers,
    bonusMintThreshold = 1000,
  } = zcf.getTerms();
  const tokenMint = await zcf.makeZCFMint(tokenName);

  const tierSizes = {
    0: 1200,
    1: 4000,
    2: 10000,
    3: 50000,
    4: 100000,
  };

  const { brand: tokenBrand, issuer: tokenIssuer } =
    await tokenMint.getIssuerRecord();

  const tokenDecayConfig = {
    perClaim: 0.999,
    perEpoch: 0.85,
  };

  const { perClaim: claimDecay, perEpoch: epochDecay } = tokenDecayConfig;

  const [baseAmount, bonusAmount] = [baseSupply, bonusSupply].map(x =>
    AmountMath.make(tokenBrand, x),
  );
  const primarySeat = tokenMint.mintGains(harden({ Payment: baseAmount }));
  const bonusSeat = (await tokenMint).mintGains({ Payment: bonusAmount });

  console.log(
    'primarySeat:::',
    primarySeat,
    primarySeat.getCurrentAllocation(),
  );
  console.log('bonusSeat:::', bonusSeat.getCurrentAllocation());

  const trace = label => value => {
    console.log(label, '::::', value);
    return value;
  };

  const tiersStore = zone.mapStore('airdrop tiers');
  await objectToMap({ ...tiers, current: tiers[0] }, tiersStore);

  const epochDataArray = await Object.entries(tiers)
    .map(([key, value], index) => ({
      epoch: index,
      previousPayoutValues: value,
      claimTracker: makeTrackerArray(value.length),
      store: zone.mapStore(`epoch ${key} claim set`),
    }))
    .map(trace('after object creation'));

  const showKeys = store => [...store.keys()];
  const showValues = store => [...store.values()];

  const [t0, handleProofVerification] = await Promise.all([
    E(timer).getCurrentTimestamp(),
    E(TreeRemotable).getVerificationFn(),
  ]);

  await objectToMap(
    {
      // exchange this for a purse created from ZCFMint
      currentEpoch: 0,
      currentTier: tiersStore.get('0'),
      airdropTiers: tiers,
      epochLength,
      TreeRemotable,
      tokenIssuer,
      startTime: createFutureTs(t0, startTime),
      claimedAccountsStore: zone.setStore('claimed accounts'),
      airdropStatusTracker: zone.mapStore('airdrop status'),
    },
    baggage,
  );

  const airdropStatus = baggage.get('airdropStatusTracker');
  const claimStore = createStore(reducer, {
    currentEpoch: 0,
    epochData: epochDataArray,
    currentEpochData: epochDataArray[0],
    claimDecayRate: 0.9999,
    epochDecayRate: 0.875,
  });

  const getCurrentTier = () => tiersStore.get('current');
  airdropStatus.init('currentStatus', INITIALIZED);

  const stateMachine = makeStateMachine(
    INITIALIZED,
    [
      [INITIALIZED, [PREPARED]],
      [PREPARED, [OPEN]],
      [OPEN, [EXPIRED, RESTARTING]],
      [RESTARTING, [OPEN]],
      [EXPIRED, []],
    ],
    baggage.get('airdropStatusTracker'),
  );

  const makeUnderlyingAirdropKit = zone.exoClassKit(
    'Airdrop Campaign',
    {
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
      creator: M.interface('Creator', {
        createPayment: M.call().returns(M.any()),
        handleBonusMintLogic: M.call(M.number()).returns(M.any()),
      }),
      claimer: M.interface('Claimer', {
        makeClaimInvitation: M.call().returns(M.promise()),
        getAirdropTokenIssuer: M.call().returns(IssuerShape),
        getIssuer: M.call().returns(IssuerShape),

        getStatus: M.call().returns(M.string()),
      }),
    },
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
    (store, currentCancelToken) => ({
      /** @type { object } */
      currentTier: baggage.get('currentTier'),
      nextPayoutValues: getCurrentTier(),
      currentEpochClaimCount: 0,
      currentCancelToken,
      claimedAccounts: store,
      currentEpoch: baggage.get('currentEpoch'),
    }),
    {
      helper: {
        getPayoutAmount(tier) {
          return AmountMath.make(
            tokenBrand,
            BigInt(tiersStore.get('current')[tier]),
          );
        },
        // combineAmounts() {
        //   const { earlyClaimBonus, basePayout } = this.state;
        //   mustMatch(
        //     earlyClaimBonus,
        //     AmountShape,
        //     'earlyClaimBonus must be an amount.',
        //   );
        //   mustMatch(basePayout, AmountShape, 'basePayout must be an amount.');

        //   return AmountMath.add(earlyClaimBonus, basePayout);
        // },
        /**
         * @param {TimestampRecord} absTime
         * @param {number} epochIdx
         */
        updateEpochDetails(absTime, epochIdx) {
          const {
            state: { currentEpoch, currentEpochEndTime },
          } = this;
          const { helper } = this.facets;

          console.log('inside updateEpochDetails', {
            absTime,
            epochIdx,
            currentEpoch,
          });

          helper.updateDistributionMultiplier(
            TimeMath.addAbsRel(absTime, epochLength),
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
                let { currentEpoch, currentEpochClaimCount } = this.state;
                console.log('last epoch:::', {
                  latestTs,
                  currentE: currentEpoch,
                  currentEpochClaimCount,
                });
                claimStore.dispatch(actionCreators.handleEpochChange());
                this.facets.creator.handleBonusMintLogic(
                  currentEpochClaimCount,
                );

                currentEpoch = baggage.get('currentEpoch');
                console.log('currentEpoch :::', currentEpoch);

                currentEpoch <= 0
                  ? tiersStore.get('current')
                  : tiersStore.set(
                      'current',
                      tiersStore.get(String(currentEpoch)),
                    );

                // debugger

                console.log('LATEST SET:::', tiersStore.get('current'));

                console.log({ latestTs });
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
        handleBookKeeping(store, { address, pubkey, amount, tier }) {
          const maxClaimForEpoch = 1000;
          const rate = 0.9999;
          const maxClaimaints = 50;

          const priorClaimants = store.getSize();

          // // k = current claimeer index. the first individual who clims will make out
          // // rate
          // for (let k = 1; k <= maxClaimaints; k++) {
          //   let tokenAmount = maxClaimaints * Math.pow(rate, (k - 1));
          //   tokens.push(tokenAmount);
          //   }
          console.group('---------- inside handleBookKeeping----------');
          console.log('------------------------');
          console.log('------------------------');
          console.log('amount::', amount);
          console.log('------------------------');
          console.log('claimStore.getState().currentEpochData.store.keys()::', [
            ...claimStore.getState().currentEpochData.store.keys(),
          ]);

          console.log('------------------------');
          console.log('::');

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
      },
      creator: {
        handleBonusMintLogic(x) {
          console.log('------------------------');
          console.log('inside handleBonusMintLogic::', x);
        },
        /**
         * @param {NatValue} x
         * @param amount
         */
        createPayment(x) {
          return AmountMath.make(tokenBrand, x);
        },
      },
      claimer: {
        getStatus() {
          return airdropStatus.get('currentStatus');
        },
        getIssuer() {
          return tokenIssuer;
        },
        getAirdropTokenIssuer() {
          return tokenIssuer;
        },
        async makeClaimInvitation() {
          assert(
            airdropStatus.get('currentStatus') === AIRDROP_STATES.OPEN,
            'Claim attempt failed.',
          );
          /**
           * @param {import('@agoric/ertp/src/types.js').Payment} payment
           */
          const claimHandler =
            /** @type {OfferHandler} */
            async (seat, offerArgs) => {
              const state = claimStore.getState();
              console.log('------------------------');
              console.log('claimaccountsSets:: keys', state);

              const accountSetStore = state.currentEpochData.store;

              const offerArgsInput = marshaller.unmarshal(offerArgs);

              console.log({ offerArgsInput });

              const proof = await E(offerArgsInput.proof).getProof();

              assert(
                handleProofVerification(proof, offerArgsInput.pubkey),
                `Failed to verify the existence of pubkey ${offerArgsInput.pubkey}.`,
              );

              const { address, tier, pubkey } = offerArgsInput;
              assert(
                !accountSetStore.has(pubkey),
                `Allocation for address ${address} has already been claimed.`,
              );

              const claimantTier = pubkey.slice(pubkey.length - 1);

              claimStore.dispatch(
                actionCreators.handleClaim({ address, tier, pubkey }),
              );

              const paymentAmount = AmountMath.make(
                tokenBrand,
                claimStore.getSlice('currentEpochData').currentClaimAnount,
              );

              console.log('------------------------');
              console.log('scaledAmount::', paymentAmount);
              this.facets.helper.handleBookKeeping(accountSetStore, {
                address,
                pubkey,
                amount: paymentAmount,
                tier: claimantTier,
              });

              seat.incrementBy(
                primarySeat.decrementBy({ Payment: paymentAmount }),
              );
              zcf.reallocate(primarySeat, seat);
              this.state.currentEpochClaimCount += 1;

              this.facets.helper.handleBookKeeping(accountSetStore, {
                address,
                pubkey,
                amount: paymentAmount,
                tier: claimantTier,
              });

              seat.exit();
              return createClaimSuccessMsg(paymentAmount);
            };
          return zcf.makeInvitation(claimHandler, 'airdrop claim handler');
        },
      },
    },
  );

  const cancelToken = cancelTokenMaker();
  const { creator, helper, claimer } = makeUnderlyingAirdropKit(
    baggage.get('airdropStatusTracker'),
    cancelToken,
  );

  console.log('START TIME', baggage.get('startTime'));
  await E(timer).setWakeup(
    baggage.get('startTime'),
    makeWaker('claimWindowOpenWaker', ({ absValue }) => {
      console.log('inside makeWakerxxaa:::', { absValue });

      helper.updateEpochDetails(absValue, 0);

      stateMachine.transitionTo(OPEN);
    }),
    cancelToken,
  );

  stateMachine.transitionTo(PREPARED);

  return harden({
    creatorFacet: creator,
    publicFacet: claimer,
  });
};
harden(start);
