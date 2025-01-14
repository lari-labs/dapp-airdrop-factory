import { toBase64 } from '@cosmjs/encoding';

const checkEligibility = async publicKey => {
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
    return await response.json();
  } catch (error) {
    throw new Error('Failed to check eligibility');
  }
};

const formatResponse = account => ({
  ...account,
  pubkey: toBase64(account.pubkey),
});

const getPubkey = async ({ signingClient: { signer } }) => {
  const [account] = await signer.getAccounts();
  console.log({ account, pk: toBase64(account.pubkey) });
  return formatResponse(account);
};

export { checkEligibility, getPubkey };
