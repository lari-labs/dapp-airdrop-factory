// hocs/withWallet.jsx
import { useEffect, useState } from 'react';
import { useAgoric } from '@agoric/react-components';
import { getPubkey } from '../shared/api/index';
import DisconnectedComponent from '../features/Disconnected/component.tsx';

export const withWallet = (WrappedComponent) => {
  return function WithWalletComponent(props) {
    const [walletState, setWalletState] = useState({
      isLoading: true,
      pubkey: '',
      error: null
    });

    const { walletConnection, address } = useAgoric();

    useEffect(() => {
      if (walletConnection) {
        getPubkey(walletConnection)
          .then(res => {
            setWalletState({
              isLoading: false,
              pubkey: res.pubkey,
              error: null
            });
          })
          .catch(error => {
            setWalletState({
              isLoading: false,
              pubkey: '',
              error
            });
          });
      } else {
        setWalletState(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    }, [walletConnection, address]);


    if (!address) {
      return <DisconnectedComponent />;
    }

    if (walletState.error) {
      return <div>Error connecting to wallet: {walletState.error.message}</div>
    }

    return (
      <WrappedComponent
        {...props}
        address={address}
        pubkey={walletState.pubkey}
      />
    );
  };
};
