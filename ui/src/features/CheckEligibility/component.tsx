import { useEffect, useState } from 'react';
import { useAgoric } from '@agoric/react-components';
import AddressForm from '../AddressForm/component.js';
import Navbar from '../../shared/navbar/component.js';
import { toBase64 } from '@cosmjs/encoding';
import DisconnectedComponent from '../Disconnected/component.js';

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
      <div className="w-400 mt-20 flex h-96 items-center justify-center rounded-lg bg-transparent px-4 py-20">
        {address ? (
          <AddressForm addressInput={address} publicKey={state.pubkey} />
        ) : (
          <DisconnectedComponent />
        )}
      </div>{' '}
    </>
  );
};

export default CheckEligibility;
