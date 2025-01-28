import { useEffect, useReducer, useState } from 'react';
import { motion } from 'framer-motion';
import Modal from '../CheckEligibility/Modal/component.tsx';
import { useContractStore } from '../../store/contract.ts';

const REQUEST_STATES = {
  RESET: 'reset',
  IDLE: 'idle', // Initial state, no request has been made yet
  PENDING: 'pending', // Request is in progress
  SUCCESS: 'success', // Request completed successfully
  ERROR: 'error', // Request failed with an error
  LOADING: 'loading', // Alternative to PENDING, used when loading data
  FULFILLED: 'fulfilled', // Alternative to SUCCESS, commonly used with Promise states
  REJECTED: 'rejected', // Alternative to ERROR, commonly used with Promise states
  LOAD_PURSES_SUCCESS: 'load purses success',
};

const makeActionCreator = states =>
  Object.values(states).map(x => ({
    action: payload => ({
      type: x,
      payload,
    }),
  }));
const initialState = {
  showModal: false,
  status: REQUEST_STATES.IDLE,
  isEligible: false,
  response: {},
  purses: [],
};
const actionCreators = makeActionCreator(REQUEST_STATES);

const {
  ERROR,
  FULFILLED,
  REJECTED,
  RESET,
  PENDING,
  SUCCESS,
  IDLE,
  LOAD_PURSES_SUCCESS,
} = REQUEST_STATES;

// const response = ({payload}) => payload === undefined ?

const requestReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case LOAD_PURSES_SUCCESS:
      return {
        ...state,
        purses: payload.data,
      };
    case REJECTED:
      return {
        ...state,
        ui: 'User is ineliibles',
        showModal: true,
        isEligible: false,
        response: payload,
        status: FULFILLED,
      };
    case SUCCESS:
      return {
        ...state,
        showModal: true,
        ui: payload.message,
        isEligible: true,
        response: payload,
        status: FULFILLED,
      };
    case RESET:
      return { ...initialState, showModal: false };
    case REQUEST_STATES.IDLE:
      return state;
    default:
      return state;
  }
};
const AddressForm = ({ purses, addressInput = '', publicKey = '' }) => {
  const agoricStore = useContractStore();

  const [state, dispatch] = useReducer(requestReducer, initialState);
  const checkEligibility = async () => {
    try {
      const response = await fetch(
        'http://localhost:1010/api/verify-eligibility',
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
        dispatch({ type: SUCCESS, payload: data });
        // Handle successful eligibility response (e.g., show to user)
      } else {
        dispatch({ type: REJECTED, payload: data });
        console.error('Eligibility Check Failed:', data);
        // Handle errors returned from server (e.g., show error message to user)
      }
    } catch (error) {
      dispatch({ type: ERROR, payload: error });

      console.error('Network Error:', error);
      // Handle network errors (e.g., show network error message to user)
    }
  };

  useEffect(() => {
    dispatch(() => ({ type: LOAD_PURSES_SUCCESS, payload: { data: purses } }));
  }, [purses]);

  useEffect(() => {
    dispatch({ type: RESET });
  }, [addressInput]);

  const [responseMessage, setResponseMessage] = useState('');
  const setter = set => e => {
    const { target } = e;
    const { value } = target;
    set(value);
  };
  const handleResponse = payload => ({ type: SUCCESS, payload });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const handleFormSubmit = async event => {
    event.preventDefault(); // Prevent default form submission behavior

    try {
      const response = await fetch(
        'http://localhost:1010/api/verify-eligibility',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ publicKey: { key: publicKey } }), // Convert the data to a JSON string
        },
      );

      const data = await response.json(); // Parse the JSON from the response
      console.log({ data });
      handleResponse(data);
    } catch (error) {
      console.error('Error:', error);
      setResponseMessage('An unexpected error occurred.');
    }
  };

  const renderResponse = state => (!state.ui ? <p>{state.ui}</p> : null);
  return (
    <div>
      <div className="mb-6 flex justify-center">
        <div className="relative flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl border-2 border-purple-500 bg-[#2b2836] p-3 shadow-lg shadow-purple-500/50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className="h-full w-full"
            fill="white"
          >
            <polygon points="50,15 90,80 10,80" />
          </svg>
        </div>
      </div>

      <h2 className="mt-10 text-center text-2xl font-bold text-white ">
        Check Eligibility
      </h2>
      <p
        className={`mt-4 p-8 text-center ${state.status === IDLE ? 'text-gray-300' : state.isEligible ? 'text-lg font-bold text-green-300' : 'text-lg font-bold text-red-200'}`}
      >
        {state.status === FULFILLED
          ? state.ui
          : 'Click button below to check eligibility'}
      </p>
      <form className="space-y-4" onSubmit={handleFormSubmit}>
        <div>
          <input
            type="text"
            className="w-full rounded-lg border-2 border-[#2c2b2f] bg-[#1b1a1f] px-5 py-4 text-[0.9rem] text-white focus:animate-pulse focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/50 focus:outline-none"
            readOnly
            value={addressInput}
          />
        </div>

        <div className="flex w-full flex-col items-center">
          <motion.button
            type="submit"
            onClick={checkEligibility}
            className={`w-full rounded p-4 py-3 font-semibold text-white shadow-inner hover:shadow-lg ${
              formSubmitted ? 'bg-[#2c2b2f]' : 'bg-purple-500'
            }`}
            whileTap={{ scale: 0.95 }}
            animate={
              formSubmitted
                ? { backgroundColor: '#2c2b2f' }
                : { backgroundColor: '#6b46c1' }
            }
            transition={{ duration: 0.3 }}
          >
            {formSubmitted ? 'Check Eligibility' : 'Checking Eligibility'}
          </motion.button>
          <Modal
            publicKey={publicKey}
            istBrand={agoricStore.brands.IST}
            onClose={() => dispatch({ type: RESET })}
            isOpen={state.showModal}
            status={state.status}
            isEligible={state.isEligible}
            proof={state.response.payload}
          />
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
