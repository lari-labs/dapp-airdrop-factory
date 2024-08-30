import { E } from '@endo/far';
import { AmountMath } from '@agoric/ertp';

/**
 * Eligible claimant exercises their right to claim tokens.
 *
 * @param {import('ava').ExecutionContext} t
 * @param {ZoeService} zoe
 * @param {import('@agoric/zoe/src/zoeService/utils').StartContractInstance<Installation>} instance
 * @param {import('@agoric/ertp/src/types').Purse} feePurse
 * @param {{pubkey: string, address: string, tier: number, proof: Array}} claimOfferArgs
 * @param {boolean} shouldThrow boolean flag indicating whether or not the contract is expected to throw an error.
 * @param {string} errorMessage Error message produced by contract resulting from some error arising during the claiming process.
 */
const simulateClaim = async (
  t,
  zoe,
  instance,
  feePurse,
  claimOfferArgs,
  shouldThrow = false,
  errorMessage = '',
) => {
  const [pfFromZoe, terms] = await Promise.all([
    E(zoe).getPublicFacet(instance),
    E(zoe).getTerms(instance),
  ]);
  const { brands, issuers } = terms;

  console.log('TERMS:::', { terms, claimOfferArgs });
  console.log(instance.instance);

  const proposal = {
    give: { Fee: AmountMath.make(brands.Fee, 5n) },
  };
  t.log('Alice gives', proposal.give);

  const feePayment = await E(feePurse).withdraw(
    AmountMath.make(brands.Fee, 5n),
  );
  const [invitation, payoutValues] = await Promise.all([
    E(pfFromZoe).makeClaimTokensInvitation(),
    E(pfFromZoe).getPayoutValues(),
  ]);

  if (!shouldThrow) {
    const seat = E(zoe).offer(
      invitation,
      proposal,
      { Fee: feePayment },
      harden(claimOfferArgs),
    );
    const airdropPayout = await E(seat).getPayout('Tokens');

    const actual = await E(issuers.Tribbles).getAmountOf(airdropPayout);
    t.log('Alice payout brand', actual.brand);
    t.log('Alice payout value', actual.value);
    t.deepEqual(
      actual,
      AmountMath.make(brands.Tribbles, payoutValues[claimOfferArgs.tier]),
    );
  } else {
    const badSeat = E(zoe).offer(
      invitation,
      proposal,
      { Fee: feePayment },
      harden(claimOfferArgs),
    );
    await t.throwsAsync(E(badSeat).getOfferResult(), {
      message: errorMessage,
    });
  }
};

export { simulateClaim };
