// @ts-nocheck
import { M, mustMatch } from '@endo/patterns';
import { makeDurableZone } from '@agoric/zone/durable.js';
import { E } from '@endo/far';
import { AmountMath, BrandShape, PaymentShape } from '@agoric/ertp';
import { TimeMath, RelativeTimeRecordShape } from '@agoric/time';
import { TimerShape } from '@agoric/zoe/src/typeGuards.js';
import { atomicRearrange } from '@agoric/zoe/src/contractSupport/index.js';
import { makeWaker, oneDay } from './helpers/time.js';
import {
  handleFirstIncarnation,
  makeCancelTokenMaker,
} from './helpers/validation.js';
import { makeStateMachine } from './helpers/stateMachine.js';
import { createClaimSuccessMsg } from './helpers/messages.js';
import { objectToMap } from './helpers/objectTools.js';
import { getMerkleRootFromMerkleProof } from '../merkle-tree/index.js';

export const messagesObject = {
  makeClaimInvitationDescription: () => 'claim airdrop',
  makeIllegalActionString: status =>
    `Airdrop can not be claimed when contract status is: ${status}.`,
};

const AIRDROP_TIERS_STATIC = [9000n, 6500n, 3500n, 1500n, 750n];

const cancelTokenMaker = makeCancelTokenMaker('airdrop-campaign');

const AIRDROP_STATES = {
  INITIALIZED: 'initialized',
  PREPARED: 'prepared',
  OPEN: 'claim-window-open',
  EXPIRED: 'claim-window-expired',
  CLOSED: 'claiming-closed',
  RESTARTING: 'restarting',
};
export const { OPEN, EXPIRED, PREPARED, INITIALIZED, RESTARTING } =
  AIRDROP_STATES;

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
  targetEpochLength: M.bigint(),
  initialPayoutValues: M.arrayOf(M.bigint()),
  tokenName: M.string(),
  targetTokenSupply: M.bigint(),
  targetNumberOfEpochs: M.number(),
  startTime: RelativeTimeRecordShape,
  merkleRoot: M.string(),
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
    targetEpochLength = oneDay,
    targetTokenSupply = 10_000_000n,
    tokenName = 'Tribbles',
    targetNumberOfEpochs = 5,
    merkleRoot,
    initialPayoutValues = AIRDROP_TIERS_STATIC,
    issuers,
    brands,
  } = zcf.getTerms();

  const { Fee: feeIssuer } = issuers;

  const FeeAmountShape = harden({
    brand: feeIssuer.getBrand(),
    value: 5n,
  });

  const feeBrand = feeIssuer.getBrand();

  console.log('feeBrand ::::', feeBrand);
  console.log('----------------------------------');
  const airdropStatusTracker = zone.mapStore('airdrop claim window status');

  const accountStore = zone.setStore('claim accounts');
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

  const rearrange = transfers => atomicRearrange(zcf, transfers);

  const t0 = await E(timer).getCurrentTimestamp();
  const tokenMint = await zcf.makeZCFMint(tokenName);

  const { brand: tokenBrand, issuer: tokenIssuer } =
    await tokenMint.getIssuerRecord();

  const tokenHolderSeat = tokenMint.mintGains({
    Tokens: AmountMath.make(tokenBrand, targetTokenSupply),
  });
  await objectToMap(
    {
      merkleRoot,
      targetNumberOfEpochs,
      // exchange this for a purse created from ZCFMint
      payouts: initialPayoutValues,
      epochLengthInSeconds: targetEpochLength,
      tokenIssuer,
      startTime: createFutureTs(t0, startTime),
      claimedAccountsStore: zone.setStore('claimed accounts'),
      airdropStatusTracker: zone.mapStore('airdrop status'),
    },
    baggage,
  );

  const interfaceGuard = {
    helper: M.interface('Helper', {
      cancelTimer: M.call().returns(M.promise()),
      updateDistributionMultiplier: M.call(M.any()).returns(M.promise()),
      updateEpochDetails: M.call(M.any(), M.any()).returns(),
    }),
    public: M.interface('public facet', {
      makeClaimTokensInvitation: M.call().returns(M.promise()),
      getStatus: M.call().returns(M.string()),
      getEpoch: M.call().returns(M.bigint()),
      getPayoutValues: M.call().returns(M.array()),
    }),
    creator: M.interface('creator', {
      pauseContract: M.call().returns(M.any()),
    }),
  };

  const prepareContract = zone.exoClassKit(
    'Tribble Token Distribution',
    interfaceGuard,
    (store, currentCancelToken) => ({
      currentCancelToken,
      claimCount: 0,
      claimedAccounts: store,
      payoutArray: baggage.get('payouts'),
      currentEpoch: null,
    }),
    {
      helper: {
        /**
         * @param {TimestampRecord} absTime
         * @param {bigint} epochIdx
         */
        updateEpochDetails(absTime, epochIdx) {
          const { helper } = this.facets;
          this.state.currentEpoch = epochIdx;
          if (this.state.currentEpoch === targetNumberOfEpochs) {
            zcf.shutdown('Airdrop complete');
            stateMachine.transitionTo(EXPIRED);
          }
          helper.updateDistributionMultiplier(
            TimeMath.addAbsRel(absTime, targetEpochLength),
          );
        },
        async updateDistributionMultiplier(wakeTime) {
          const { facets } = this;
          this.state.currentCancelToken = cancelTokenMaker();

          void E(timer).setWakeup(
            wakeTime,
            makeWaker(
              'updateDistributionEpochWaker',
              /** @param {TimestampRecord} latestTs */
              ({ absValue: latestTs }) => {
                this.state.payoutArray = harden(
                  this.state.payoutArray.map(x => x / 2n),
                );

                baggage.set('payouts', this.state.payoutArray);

                facets.helper.updateEpochDetails(
                  latestTs,
                  this.state.currentEpoch + 1n,
                );
              },
            ),
            this.state.currentCancelToken,
          );

          return 'wake up successfully set.';
        },
        async cancelTimer() {
          await E(timer).cancel(this.state.currentCancelToken);
        },
      },
      public: {
        makeClaimTokensInvitation() {
          assert(
            airdropStatusTracker.get('currentStatus') === AIRDROP_STATES.OPEN,
            messagesObject.makeIllegalActionString(
              airdropStatusTracker.get('currentStatus'),
            ),
          );
          /**
           * @param {UserSeat} claimSeat
           * @param {{proof: Array, address: string, key: string, tier: number}} offerArgs
           */
          const claimHandler = (claimSeat, offerArgs) => {
            const {
              give: { Fee: claimTokensFee },
            } = claimSeat.getProposal();

            const { proof, key: pubkey, address, tier } = offerArgs;

            // This line was added because of issues when testing
            // Is there a way to gracefully test assertion failures????
            if (accountStore.has(pubkey)) {
              claimSeat.exit();
              throw new Error(
                `Allocation for address ${address} has already been claimed.`,
              );
            }

            assert.equal(
              getMerkleRootFromMerkleProof(proof),
              merkleRoot,
              'Computed proof does not equal the correct root hash. ',
            );

            const paymentAmount = AmountMath.make(
              tokenBrand,
              this.state.payoutArray[tier],
            );

            rearrange(
              harden([
                [tokenHolderSeat, claimSeat, { Tokens: paymentAmount }],
                [claimSeat, tokenHolderSeat, { Fee: claimTokensFee }],
              ]),
            );

            claimSeat.exit();

            accountStore.add(pubkey, {
              address,
              pubkey,
              tier,
              amountAllocated: paymentAmount,
              epoch: this.state.currentEpoch,
            });

            return createClaimSuccessMsg(paymentAmount);
          };
          return zcf.makeInvitation(
            claimHandler,
            messagesObject.makeClaimInvitationDescription(),
            {
              currentEpoch: this.state.currentEpoch,
            },
            M.splitRecord({
              give: { Fee: FeeAmountShape },
            }),
          );
        },
        getStatus() {
          return stateMachine.getStatus();
        },
        getEpoch() {
          return this.state.currentEpoch;
        },
        getPayoutValues() {
          return this.state.payoutArray;
        },
      },
      creator: {
        pauseContract() {
          zcf.setOfferFilter([messagesObject.makeClaimInvitationDescription()]);
        },
      },
    },
  );
  const cancelToken = cancelTokenMaker();
  const {
    creator: creatorFacet,
    helper,
    public: publicFacet,
  } = prepareContract(airdropStatusTracker, cancelToken);

  console.log('START TIME', baggage.get('startTime'));
  await E(timer).setWakeup(
    baggage.get('startTime'),
    makeWaker('claimWindowOpenWaker', ({ absValue }) => {
      airdropStatusTracker.init('currentEpoch', 0n);
      helper.updateEpochDetails(absValue, 0n);
      stateMachine.transitionTo(OPEN);
    }),
  );

  stateMachine.transitionTo(PREPARED);

  return harden({
    creatorFacet,
    publicFacet,
  });
};
