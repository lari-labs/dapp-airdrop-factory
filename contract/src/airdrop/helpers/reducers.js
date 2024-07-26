import { compose } from './objectTools';

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
const uncurry =
  fn =>
  (...args) =>
    args.reduce((fn, arg) => fn(arg), fn);
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
  array.slice(0, index).concat(newData, array.slice(index + 1));
const uncurriedUpdateArray = uncurry(updateArray);
const { CLAIM, CHANGE_EPOCH } = ACTION_TYPES;

const reducer = (state = {}, { type = '', payload = {} }) => {
  switch (type) {
    case CHANGE_EPOCH: {
      console.log({ type, payload, state });
      const newState = {
        ...state,
        epochData: uncurriedUpdateArray(state.epochData, state.currentEpoch, {
          claimTracker: state.currentEpochData.claimTracker,
          store: state.currentEpochData.store,
          epoch: state.currentEpoch,
          previousPayoutValues: state.currentEpochData.previousPayoutValues,
        }),
        currentEpoch: state.currentEpoch + 1,
        currentEpochData: state.epochData[state.currentEpoch + 1],
      };
      console.log({ type, payload, state });
      return newState;
    }
    case CLAIM: {
      const { address, tier, pubkey } = payload;
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
        previousPayoutValues[tier] * state.claimDecayRate ** (size - 1),
      );
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
          claimTracker: uncurriedUpdateArray(
            claimTracker,
            tier,
            claimTracker[tier] + 1,
          ),
          store,
          previousPayoutValues:
            updateArray(previousPayoutValues)(tier)(claimAmount),
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
    getSlice: prop => state[prop],
  };
};

const actionCreators = {
  handleClaim: ({ address, tier, pubkey, hash }) => ({
    type: CLAIM,
    payload: { address, tier, pubkey, hash },
  }),
  handleEpochChange: () => ({ type: CHANGE_EPOCH }),
};
const head = ([x, ...xs]) => x;

const { handleClaim, handleEpochChange } = actionCreators;

export { createClaimReducerState, createStore, reducer, actionCreators };
