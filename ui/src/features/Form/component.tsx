import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useEligibility } from '../CheckEligibility/useEligibility.tsx';
import { useContractStore } from '../../store/contract.ts';
import { usePurse } from '../../hooks/usePurse';

// Simulated API check - in reality this would be a real API call
const fakeApiCheck = async (name: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 3000));
  return ['John', 'Jane', 'Alice', 'Bob', 'Nicole'].includes(name);
};

const generateInt = x => () => Math.floor(Math.random() * (x + 1));

const createTestTier = generateInt(4); // ?
const STRING_CONSTANTS = {
  OFFER_TYPES: {
    AGORIC_CONTRACT: 'agoricContract',
    CONTRACT: 'contract',
  },
  OFFER_NAME: 'makeClaimTokensInvitation',
  INSTANCE: {
    PATH: 'xnetTribblesAirdrop',
  },
  ISSUERS: {
    TRIBBLES: 'XnetTribbles',
    IST: 'IST',
    BLD: 'BLD',
  },
};
const Form = ({ pubkey, address, walletConnection, istBrand }) => {
  const { state, checkEligibility, resetEligibility } = useEligibility();
  console.log('Form ::: state', state);
  const contractStore = useContractStore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEligible, setIsEligible] = useState(false);

  const [response, setResponse] = useState({
    type: 'none',
    payload: null,
  });
  const handleResponse = ({ type, payload }) => {
    setResponse({ type, payload });
  };

  const formatPurseValue = ({ currentAmount, displayInfo }) =>
    Number(currentAmount.value) / Math.pow(10, displayInfo.decimalPlaces);

  const [tribblesPurse, istPurse] = ['XnetTribbles', 'IST'].map(usePurse);

  console.log({ tribblesPurse, istPurse });

  console.log({ response });
  const submitOffer = async () => {
    await walletConnection?.makeOffer(
      {
        source: STRING_CONSTANTS.OFFER_TYPES.AGORIC_CONTRACT,
        instancePath: [STRING_CONSTANTS.INSTANCE.PATH],
        callPipe: [[STRING_CONSTANTS.OFFER_NAME]],
      },
      { give: { Fee: { brand: contractStore.brands.IST, value: 5n } } },
      { proof: state.response.payload, key: pubkey, tier: createTestTier() },
      (update: { status: string; data?: unknown }) => {
        setIsLoading(true);

        if (update.status === 'error') {
          handleResponse({
            type: 'error',
            payload: {
              text: 'Error claiming tokens.',
              data: update.data,
            },
          });
          console.log(update);
          setStep(3);
        }
        if (update.status === 'accepted') {
          handleResponse({
            type: 'success',
            payload: { text: 'Token claimsuccess', data: update.data },
          });
          setStep(3);
        }
        if (update.status === 'refunded') {
          handleResponse({
            type: 'refunded',
            payload: { text: 'Tokens refunded', data: update.data },
          });
          setStep(3);
        }
        if (update.status === 'done') {
          console.log('Done!', update);
          setStep(3);
        }
      },
      `Offer-Airdrop-1`,
    );
  };
  const handleSubmitName = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await checkEligibility(pubkey);
    setIsEligible(state.isEligible);
    setIsLoading(false);
    setStep(2);
  };

  const resetForm = () => {
    setStep(1);
    setName('');
    setIsEligible(false);
  };

  return (
    <div className="flex min-w-[500px] items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl rounded-2xl bg-white bg-white/90 p-8 shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] backdrop-blur-sm"
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 rounded-full bg-gray-200">
            <motion.div
              className="h-full rounded-full bg-purple-600"
              initial={{ width: '33.33%' }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="mt-2 flex justify-between text-sm text-gray-600">
            <span>Start</span>
            <span>Verify</span>
            <span>Claim</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmitName}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-800">
                Check Eligibility
              </h2>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Wallet Address
                </label>
                <input
                  type="text"
                  id="name"
                  value={address}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-gray-800 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  disabled
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-purple-600 px-4 py-3 text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 animate-spin" size={20} />
                ) : (
                  <ArrowRight className="mr-2" size={20} />
                )}
                Check Eligibility
              </button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {state.isEligible ? (
                <>
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle2 size={24} />
                    <h2 className="text-2xl font-bold">You're Eligible!</h2>
                  </div>
                  <p className="text-gray-600">
                    Congratulations! You can now proceed to claim your tokens.
                  </p>
                  {!walletConnection.isSmartWalletProvisioned ? (
                    <p className="text-red-600">
                      Current wallet does not have a smart wallet provisioned.
                    </p>
                  ) : istPurse.currentAmount.value < 5n ? (
                    <p className="text-red-600">
                      Insufficient IST balance. Please add more IST to your
                      wallet.
                    </p>
                  ) : null}
                  <button
                    onClick={submitOffer}
                    disabled={isLoading || istPurse.currentAmount.value < 5n}
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-3 text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 animate-spin" size={20} />
                    ) : (
                      'Submit Transaction'
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-2 text-red-600">
                    <XCircle size={24} />
                    <h2 className="text-2xl font-bold">Not Eligible</h2>
                  </div>
                  <p className="text-gray-600">
                    Sorry, you are not eligible for token claiming at this time.
                  </p>
                  <button
                    onClick={resetForm}
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-gray-600 px-4 py-3 text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    <RefreshCw className="mr-2" size={20} />
                    Try Again
                  </button>
                </>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 text-center"
            >
              <div className="flex flex-col items-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                >
                  <CheckCircle2 size={64} className="text-green-600" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Tokens Claimed Successfully!
                </h2>
                <p className="text-gray-600">
                  Your tokens have been successfully claimed. You can now claim
                  more tokens if you'd like.
                </p>
              </div>
              <button
                onClick={resetForm}
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-purple-600 px-4 py-3 text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <RefreshCw className="mr-2" size={20} />
                Claim More Tokens
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Form;
