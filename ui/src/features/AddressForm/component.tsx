import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { ConnectWalletButton, useAgoric } from '@agoric/react-components';
import CreateAccountButton from '../../components/Orchestration/CreateAccountButton.tsx';
import { makeOffer } from '../../components/Orchestration/MakeOffer.tsx';
import { decodePubkey } from '@cosmjs/proto-signing';
import { pubkeyToAgoricAddress } from '../../utils/check-sig';

const noop = () => {};

const AddressForm = ({
  itemPrice = 175,
  username = '',
  addressInput = '',
  publicKey = '',
  id = '',
  removeHolder = noop,
  showRemoveButton = false,
}) => {
  const { walletConnection } = useAgoric();
  const checkEligibility = async () => {
    try {
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
        // Handle successful eligibility response (e.g., show to user)
      } else {
        console.error('Eligibility Check Failed:', data);
        // Handle errors returned from server (e.g., show error message to user)
      }
    } catch (error) {
      console.error('Network Error:', error);
      // Handle network errors (e.g., show network error message to user)
    }
  };
  const [usernameInput, setUsername] = useState(username);
  const [responseMessage, setResponseMessage] = useState('');
  const setter = set => e => {
    const { target } = e;
    const { value } = target;
    set(value);
  };
  const [formSubmitted, setFormSubmitted] = useState(false);
  const handleFormSubmit = async event => {
    event.preventDefault(); // Prevent default form submission behavior

    try {
      const response = await fetch(
        'http://localhost:3000/api/verify-eligibility',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ publicKey: { key: publicKey } }), // Convert the data to a JSON string
        },
      );

      const data = await response.json(); // Parse the JSON from the response

      if (response.ok) {
        setResponseMessage(`Success: ${data.message}`);
      } else {
        setResponseMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setResponseMessage('An unexpected error occurred.');
    }
  };

  return (
    <div className="bg-transparent px-4 py-20">
      <div className="w-4xl rounded-lg border-2 border-[#2c2b2f] bg-[#26252a] p-8 ">
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

        <h2 className="mt-10 text-center text-2xl font-bold text-white">
          Check Eligibility
        </h2>
        <p className="mx-12 mb-12 mt-4 text-center text-xs text-gray-400">
          Click button below to check eligibility
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
              className={`w-full rounded p-4 py-3 font-semibold text-white ${
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;
