import { useEffect, useState } from 'react';
import { useAgoric } from '@agoric/react-components';
import AddressForm from '../AddressForm/component.js';
import Navbar from '../../shared/navbar/component.js';
import { toBase64 } from '@cosmjs/encoding';
import DisconnectedComponent from '../Disconnected/component.js';
import PurseDetails from '../Purses/component.tsx';
import { usePurse } from '../../hooks/usePurse.ts';
import Form from '../Form/component';
import { useContractStore } from '../../store/contract.ts';

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
  const { walletConnection, address, ...agState } = useAgoric();

  const { brands } = useContractStore();

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

  console.log({ agState });
  return (
    <>
      <Navbar />
      <div className="mt-20 flex h-96 items-center justify-center rounded-lg bg-transparent px-4 py-20">
        {address ? (
          <Form
            address={address}
            walletConnection={walletConnection}
            pubkey={state.pubkey}
            istBrand={brands?.IST}
          />
        ) : (
          <DisconnectedComponent />
        )}
      </div>{' '}
    </>
  );
};

export default CheckEligibility;
