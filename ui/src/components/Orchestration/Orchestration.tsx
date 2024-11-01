import { useAgoric } from "@agoric/react-components";
import { useContext, useEffect, useRef, useState } from "react";
import { NotificationContext } from "../../context/NotificationContext";
import CreateAccountButton from "./CreateAccountButton";
import { makeOffer } from "./MakeOffer";
import { usePurse } from "../../hooks/usePurse";
import { decodePubkey } from "@cosmjs/proto-signing";
import { pubkeyToAgoricAddress } from "../../utils/check-sig";

// globalThis.cryptoFns = {
//   bech32,
//   sha256,
//   ripemd160
// }
const getPubkey = async (chain = "agoric") => {
  await window.keplr.enable(`${chain}local`);
  const offlineSigner = window.getOfflineSigner(`${chain}local`);
  console.log("offlineSigner", offlineSigner);
  const [accounts] = await offlineSigner.getAccounts();
  console.log("accounts", accounts);
  const res = {
    ...accounts,
    rawPubkey: accounts.pubkey,
    pubkey: decodePubkey(accounts.pubkey),
  };
  console.log({ res });
  return res;
};
const Orchestration = () => {
  const { walletConnection } = useAgoric();
  const { addNotification } = useContext(NotificationContext);

  const [loadingCreateAccount, setLoadingCreateAccount] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusText, setStatusText] = useState("");
  const modalRef = useRef<HTMLDialogElement | null>(null);

  const handleToggle = () => {
    setModalOpen((prevState) => !prevState);
  };

  useEffect(() => {
    if (modalRef.current) {
      if (modalOpen) {
        modalRef.current.showModal();
      } else {
        modalRef.current.close();
      }
    }
  }, [modalOpen]);

  const handleCreateAccount = () => {
    setLoadingCreateAccount(true);
    setStatusText("Submitted");
    if (walletConnection) {
      makeOffer(
        walletConnection,
        addNotification!,
        setLoadingCreateAccount,
        handleToggle,
        setStatusText
      ).catch((error) => {
        addNotification!({
          text: `Transaction failed: ${error.message}`,
          status: "error",
        });
        setLoadingCreateAccount(false);
        handleToggle();
      });
    } else {
      addNotification!({
        text: "Error: Please connect your wallet or check your connection to RPC endpoints",
        status: "error",
      });
      setLoadingCreateAccount(false);
      handleToggle();
      setLoadingCreateAccount(false);
      handleToggle();
    }
  };

  const purse = usePurse("Tribbles");


  console.log({
    tribblesPurse: purse,
    walletConnection,
    pubkeyToAgoricAddress,
  });
  return !purse == false &&  purse?.currentAmount?.value !== 0n ? (
    <div className="flex flex-col items-center shadow-lg bg-purple-900 rounded text-white">
      <h3>Tribbles Allocation</h3>

      <ul className="p-4">
        <li>Purse Brand Name: {purse.brandPetname}</li>
        <li>
          Purse Current Amount: {Number(purse.currentAmount.value).toString()}
        </li>
      </ul>
    </div>
  ) : (
    <div className="flex p-4">
      <CreateAccountButton
        handleCreateAccount={handleCreateAccount}
        loadingCreateAccount={loadingCreateAccount}
      />
    </div>
  );
};

export default Orchestration;
