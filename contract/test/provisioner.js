const newLocal = provisionSmartWallet =>
  AIRDROP_DATA.accounts.slice(5, 15).map(async accountData => {
    const wallet = await provisionSmartWallet(accountData.address);
    return wallet;
  });

