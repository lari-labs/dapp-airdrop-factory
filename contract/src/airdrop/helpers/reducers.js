import { lensProp, uncurry, view } from './lenses.js';
import { compose } from './objectTools.js';

/**
 * An array of epoch data objects containing historical data of each epoch that has passed.+
 * @type {Array<{
 *   epoch: number,
 *   previousPayoutValues: number[],
 *   claimTracker: number[],
 *   store: Map<any, any>
 * }>}
 *
 * @property {number} epoch - The index position of the epoch.
 * @property {number[]} previousPayoutValues - An array containing the final allocation of tokens recieved by claimants, seperated by tier.
 * @property {number[]} claimTracker - An array
 * @property {Map<any, any>} store - A Map object used to store additional data for this epoch.
 *
 * @description This array contains data for multiple epochs, each represented by an object.
 * The data includes information about payouts, claim tracking, and additional storage for each epoch.
 * It's likely used in a system that manages periodic rewards or state changes.
 */
const epochDataArray = [
  {
    epoch: 0,
    previousPayoutValues: [1000, 850, 500, 400, 300],
    claimTracker: [0, 0, 0, 0, 0],
    store: new Map(),
  },
  {
    epoch: 1,
    previousPayoutValues: [600, 480, 384, 307, 245],
    claimTracker: [0, 0, 0, 0, 0],
    store: new Map(),
  },
  {
    epoch: 2,
    previousPayoutValues: [480, 384, 307, 200, 165],
    claimTracker: [0, 0, 0, 0, 0],
    store: new Map(),
  },
];
const defaultState = {
  claimDecayRate: 0.999,
  epochDecayRate: 0.875,
  currentEpoch: 0,
  epochData: epochDataArray,
  currentEpochData: epochDataArray[0],
};

const ACTION_TYPES = {
  CLAIM: 'user/handleClaimAirdrop',
  CHANGE_EPOCH: 'system/handleEpochChange',
};

const roundNumber = number => Math.round(number);
const toBigInt = x => BigInt(x);

const toWholeBigInt = compose(toBigInt, roundNumber);
const createClaimReducerState = ({
  epochDataArray = [],
  claimDecayRate = 0,
  epochDecayRate = 0,
  currentEpoch = 0,
  currentEpochData = epochDataArray.slice(0, 1)[0],
}) => ({
  ...defaultState,
  claimDecayRate,
  epochDecayRate,
  currentEpoch,
  epochData: epochDataArray,
  currentEpochData,
});
const updateArray = array => index => newData =>
  index === 0
    ? [newData].concat(array.slice(0))
    : [].concat(array.slice(0, index), newData, array.slice(index));

const rest = ([, ...xs]) => xs;

const updateArrayAtIndex = (array, index, newData) =>
  index === 0
    ? [].concat(newData, ...rest(array))
    : []
        .concat(array.slice(0, index))
        .concat(newData)
        .concat(array.slice(index + 1));

const { CLAIM, CHANGE_EPOCH } = ACTION_TYPES;

const reducer = (
  state = { epochData: [], currentEpoch: 0 },
  { type = '', payload = {} },
) => {
  switch (type) {
    case CHANGE_EPOCH: {
      console.log({ type, payload, state });
      const newState = {
        ...state,
        epochData: state.epochData.concat(state.currentEpochData),
        currentEpoch: state.currentEpoch + 1,
        currentEpochData: {
          ...payload,
          previousPayoutValues: state.currentEpochData.previousPayoutValues,
        },
      };
      console.log({ type, payload, state });
      return newState;
    }
    case CLAIM: {
      const { address, pubkey } = payload;
      const tier = Number(payload.tier);
      const { currentEpochData } = state;
      console.group('---------- inside CLAIM----------');
      console.log('------------------------');
      console.log('currentEpochData::', currentEpochData);
      console.log('------------------------');
      console.log('::');
      console.log('------------------------');
      console.groupEnd();
      const { previousPayoutValues, store, claimTracker } = currentEpochData;
      // update currentEpochData.previousPayoutValues[tier]
      // increment currentEpochData.claimTracker[tier]

      console.log({ previousPayoutValues, tier });
      const size = store.getSize() + 1;
      const claimAmount = toWholeBigInt(
        Number(previousPayoutValues[tier]) * state.claimDecayRate ** (size - 1),
      );
      console.log('Claim AMount :::', claimAmount);
      store.init(
        pubkey,
        harden({
          address,
          tier,
          amount: claimAmount,
        }),
      );

      const newState = {
        ...state,
        currentEpochData: {
          currentClaimAnount: claimAmount,
          claimTracker: updateArrayAtIndex(
            claimTracker,
            tier,
            claimTracker[tier] + 1,
          ),
          store,
          previousPayoutValues: updateArrayAtIndex(
            previousPayoutValues,
            tier,
            claimAmount,
          ),
        },
      };
      console.group('------------ STATE vs NEW STATE');
      console.log('------------------------');
      console.log('newState::', { ...newState });
      console.groupEnd();
      return newState;
    }
    default:
      return state;
  }
};

const createStore = (reducerFn = reducer, initialState) => {
  let state = initialState;
  const dispatch = action => {
    state = reducer(state, action);
  };
  return {
    dispatch,
    getState: () => state,
    getSlice: prop => view(lensProp(prop), state),
  };
};

const actionCreators = {
  handleClaim: ({ address, tier, pubkey, hash }) => ({
    type: CLAIM,
    payload: { address, tier, pubkey, hash },
  }),
  handleEpochChange: data => ({ type: CHANGE_EPOCH, payload: data }),
};

const { handleClaim, handleEpochChange } = actionCreators;

export { createClaimReducerState, createStore, reducer, actionCreators };
