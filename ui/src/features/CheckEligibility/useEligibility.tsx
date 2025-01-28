import { useReducer, useCallback } from 'react';
import { checkEligibility as callEligibilityApi } from '../../shared/api/index';
import { 
  eligibilityReducer, 
  initialState, 
  REQUEST_STATES 
} from '../AddressForm/reducer';

export const useEligibility = () => {
  const [state, dispatch] = useReducer(eligibilityReducer, initialState);

  const checkEligibility = useCallback(async (publicKey) => {
    try {
      dispatch({ type: REQUEST_STATES.PENDING });
      const response = await callEligibilityApi(publicKey);
    
      const data = response.json();
      if (response.ok) {
        console.log('Eligibility Check Success:', data);
        dispatch({ type: REQUEST_STATES.SUCCESS, payload: data });
        // Handle successful eligibility response (e.g., show to user)
      } else {
        dispatch({ type: REQUEST_STATES.REJECTED, payload: data });
        console.error('Eligibility Check Failed:', data);
        // Handle errors returned from server (e.g., show error message to user)
      }
    } catch (error) {
      dispatch({ type: REQUEST_STATES.ERROR, payload: error });

      console.error('Network Error:', error);
      // Handle network errors (e.g., show network error message to user)
    }
  }, []);

  return {
    state,
    checkEligibility,
    resetEligibility: () => dispatch({ type: REQUEST_STATES.RESET }),
  };
};
