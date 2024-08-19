/* global hardne  */

const createStore = (reducer, initialState = defaultState) => {
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

harden(createStore);

export { createStore };
