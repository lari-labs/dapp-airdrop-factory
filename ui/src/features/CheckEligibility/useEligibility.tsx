import { useReducer, useCallback } from 'react';
import { checkEligibility as callEligibilityApi } from '../../shared/api/index.js';
import {
  eligibilityReducer,
  initialState,
  REQUEST_STATES,
} from '../AddressForm/reducer.js';

const { PENDING, SUCCESS, REJECTED, ERROR } = REQUEST_STATES;
export const useEligibility = () => {
  const [state, dispatch] = useReducer(eligibilityReducer, initialState);

  const handleAction = (type, payload = {}) => dispatch({ type, payload });

  const checkEligibility = async publicKey => {
    try {
      handleAction(REQUEST_STATES.PENDING);

      const response = await fetch(
        'http://localhost:3000/api/verify-eligibility',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ publicKey: { key: publicKey } }),
        },
      );

      const data = await response.json();
      if (response.ok) {
        console.log('Eligibility Check Success:', data);
        handleAction(REQUEST_STATES.SUCCESS, data);
        // Handle successful eligibility response (e.g., show to user)
      } else {
        handleAction(REQUEST_STATES.REJECTED, data);
        console.error('Eligibility Check Failed:', data);
        // Handle errors returned from server (e.g., show error message to user)
      }
    } catch (error) {
      handleAction(REQUEST_STATES.ERROR, error);

      console.error('Network Error:', error);
      // Handle network errors (e.g., show network error message to user)
    }
  };

  return {
    state,
    checkEligibility,
    resetEligibility: () => handleAction(REQUEST_STATES.RESET),
  };
};
