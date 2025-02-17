const REQUEST_STATES = {
    RESET: 'reset',
    IDLE: 'idle',
    PENDING: 'pending',
    SUCCESS: 'success',
    ERROR: 'error',
    FULFILLED: 'fulfilled',
    REJECTED: 'rejected',
  };
  
  const initialState = {
    status: REQUEST_STATES.IDLE,
    isEligible: false,
    response: {},
  };
  
  const eligibilityReducer = (state = initialState, action) => {
    const { type, payload } = action;
    switch (type) {
      case REQUEST_STATES.REJECTED:
        return {
          ...state,
          ui: 'User is ineligible',
          isEligible: false,
          response: payload,
          status: REQUEST_STATES.FULFILLED,
        };
      case REQUEST_STATES.SUCCESS:
        return {
          ...state,
          ui: payload.message,
          isEligible: true,
          response: payload,
          status: REQUEST_STATES.FULFILLED,
        };
      case REQUEST_STATES.RESET:
        return { ...initialState };
      case REQUEST_STATES.IDLE:
        return state;
      default:
        return state;
    }
  };

  export {
    eligibilityReducer,
    initialState,
    REQUEST_STATES
  }
