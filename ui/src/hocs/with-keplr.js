import { fromBase64 } from "@cosmjs/encoding";
// import {sha256} from '@noble/hashes/sha256'
// import {ripemd160} from '@noble/hashes/ripemd160'
import { decodePubkey } from "@cosmjs/proto-signing";
import { useCallback, useState } from "react";

// globalThis.cryptoFns = {
//   bech32,
//   sha256,
//   ripemd160
// }
const fetchAccountObject = async (chain = "agoric") => {
  const offlineSigner = await window.getOfflineSigner(`${chain}local`);
  const res = {
    ...accounts,
    rawPubkey: accounts.pubkey,
    pubkey: decodePubkey(accounts.pubkey),
  };
  console.log({ res });
  return res;
};

const handleEnableKeplr = async (chain = "agoriclocal") => {
  await window.keplr.enable(chain);
  console.log("------------------------");
  console.log("enabling keplr....::");
};

const withKeplr = (Component) => {
  return function WithKeplr(props) {
    return <Component {...props} />;
  };
};

const withUser = (Component) => {
  return function WithUser(props) {
    const fetcher = useCallback(fetchAccountObject);
    useEffect(() => {}, [props.walletProviderConnection]);
    return <Component user={user} {...props} />;
  };
};

export default withUser;
