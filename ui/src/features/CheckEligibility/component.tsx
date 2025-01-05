import { useEffect, useState } from 'react';
import { useAgoric } from '@agoric/react-components';
import AddressForm from '../AddressForm/component.js';
import Navbar from '../../shared/navbar/component.js';
import { toBase64 } from '@cosmjs/encoding';
import { motion } from 'framer-motion';
import { ConnectWalletButton } from '@agoric/react-components';
import ProjectInfoComponent from '../ProjectInformation/component.js';

const DisconnectedComponent = () => (
  <motion.div
    animate={{ scale: 1.2 }}
    transition={{
      type: 'spring',
      duration: 3,
    }}
  >
    <div className="w-full max-w-md rounded-lg border-2 border-[#2c2b2f] bg-[#26252a] p-8 ">
      <div className="mb-6 flex flex-col items-center justify-around">
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
        <h2 className="font-kanit p-4 text-white">
          Tribbles Airdrop Redemption
        </h2>
        <p className="text-small font-kanit text-center">
          Connect your wallet now and discover if you’re among the exclusive
          recipients of our highly anticipated token airdrop.
        </p>
      </div>
    </div>
  </motion.div>
);

const UI_STATES = {
  disconnected: 'DISCONNECTED',
  connected: 'CONNECTED',
  claim_requested: 'CLAIM_REQUESTED',
  claim_requested_success: 'CLAIM_REQUESTED_SUCCESS',
  claim_requested_failure: 'CLAIM_REQUESTED_FAILURE',
};

const getPubkey = async ({ signingClient: { signer } }) => {
  const [account] = await signer.getAccounts();
  console.log({ account, pk: toBase64(account.pubkey) });
  return { ...account, pubkey: toBase64(account.pubkey) };
};

const CheckEligibility = () => {
  const [state, setState] = useState({
    mode: 'disconnected',
    proof: null,
    pubkey: '',
  });
  const { walletConnection, address } = useAgoric();

  useEffect(() => {
    getPubkey(walletConnection)
      .then(res => {
        return res;
      })
      .then(res => {
        console.log({ res });
        return setState(x => ({ ...x, pubkey: res.pubkey }));
      });
  }, [walletConnection]);
  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center rounded-lg bg-transparent px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1.5,
          }}
        >
          {' '}
          {address ? (
            <AddressForm addressInput={address} publicKey={state.pubkey} />
          ) : (
            <DisconnectedComponent />
          )}
        </motion.div>
      </div>{' '}
    </>
  );
};

export default CheckEligibility;
