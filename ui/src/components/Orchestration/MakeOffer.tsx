import { AgoricWalletConnection } from '@agoric/react-components';
import { DynamicToastChild } from '../Tabs';
import { useContractStore } from '../../store/contract';
import { merkleTreeAPI, pubkeys } from '../../airdrop-data/merkle-tree';

const { generateMerkleProof } = merkleTreeAPI;
export const makeOffer = async (
  wallet: AgoricWalletConnection,
  addNotification: (arg0: DynamicToastChild) => void,
  selectedChain: string,
  publicInvitationMaker: string,
  offerArgs: Record<string, unknown>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  handleToggle: () => void,
  setStatusText: React.Dispatch<React.SetStateAction<string>>,
) => {
 
  const { instances, brands } = useContractStore.getState();
  const instance = instances?.['tribblesAirdrop'];

  if (!instance || !brands) {
    setLoading(false);
    handleToggle();
    throw Error('No contract instance or brands found.');
  }

  // fetch the BLD brand
  const bldBrand = brands.BLD;
  if (!bldBrand) {
    setLoading(false);
    handleToggle();
    throw Error('BLD brand not found.');
  }


  const give = {
    Fee: { 
      value: 5n,
      brand: brands?.IST 
    }
  };
  const accountData =   {
    address: 'agoric1jng25adrtpl53eh50q7fch34e0vn4g72j6zcml',
    pubkey: 'Axn3Bies1P2bVzvRc23udrmny6YAXxH1o8NYpf3tDnR5',
  };
  const offerArgsInput = {
    ...accountData,
    proof: generateMerkleProof(accountData.pubkey, pubkeys),
    tier: 1
  }
  // const makeAccountofferId = `makeAccount-${Date.now()}`;
  const makeAccountofferId = Date.now();

  // // Make the initial offer
  // await wallet?.makeOffer(
  //   {
    
  //     instance,
  //     source: 'agoricContract',
  //     instancePath: ['tribblesAirdrop'],
  //     callPipe: [['makeClaimTokensInvitation']],
  //   },
  //   { give },
  //   { offerArgsInput },
  //   // {},
  //   (update: { status: string; data?: unknown }) => {
  //     if (update.status === 'error') {
  //       console.log(update);
  //     }
  //     if (update.status === 'accepted') {
  //       console.log(update);
  //     }
  //     if (update.status === 'refunded') {
  //       console.log(update);
  //     }
  //   },
  //   makeAccountofferId,
  // );

/**
 * 
 * 
 */

  await  wallet?.makeOffer(
    {
    
      source: 'agoricContract',
      instancePath: ['tribblesAirdrop'],
      callPipe: [['makeClaimTokensInvitation']],
    },
    { give },
    { offerArgsInput },
    (update: { status: string; data?: unknown }) => {
      if (update.status === 'error') {
        addNotification({
          text: `Offer update error: ${update.data}`,
          status: 'error',
        });
        setStatusText('Error during offer submission.');
        setLoading(false);
        handleToggle();
        console.log(update);
      }
      if (update.status === 'accepted') {
        addNotification({
          text: 'Offer accepted successfully',
          status: 'success',
        });
        setStatusText('Offer accepted. Processing...');
        handleToggle();
        setLoading(false);
      }
      if (update.status === 'refunded') {
        addNotification({
          text: 'Offer was refunded',
          status: 'error',
        });
        setStatusText('Offer refunded.');
        setLoading(false);
        handleToggle();
        console.log(update);
      }
      if (update.status === 'done') {
        setStatusText('Operation completed successfully.');
        setLoading(false);
        setTimeout(() => {
          handleToggle();
        }, 1000);
      }
    },
    makeAccountofferId,
  );
};
