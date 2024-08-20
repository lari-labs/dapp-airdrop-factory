import { E } from '@endo/far';
import { AmountMath } from '@agoric/ertp';
import { head } from '../../src/airdrop/helpers/objectTools.js';
import { accounts, agoricPubkeys } from '../data/agd-keys.js';
import { generateMerkleProof } from '../../src/merkle-tree/index.js';

const makeOfferArgs = ({ tier, pubkey: { key }, address }) => ({
  key,
  proof: generateMerkleProof(key, agoricPubkeys),
  address,
  tier,
});

/**
 * Alice trades by paying the price from the contract's terms.
 *
 * @param {import('ava').ExecutionContext} t
 * @param {ZoeService} zoe
 * @param {ERef<import('@agoric/zoe/src/zoeService/utils').Instance<AssetContractFn>} instance
 * @param {Purse} purse
 * @param {string[]} choices
 * @param feePurse
 * @param claimOfferArgs
 */
const simulateClaim = async (
  t,
  zoe,
  instance,
  feePurse,
  claimOfferArgs = head(accounts),
) => {
  const { publicFacet } = instance;
  const [pfFromZoe, terms] = await Promise.all([
    E(zoe).getPublicFacet(instance),
    E(zoe).getTerms(instance),
  ]);
  const { brands, issuers } = terms;

  console.log('TERMS:::', { terms });
  console.log(instance.instance);
  // @ts-expect-error Promise<Instance> seems to work

  const proposal = {
    give: { Fee: AmountMath.make(brands.Fee, 5n) },
  };
  t.log('Alice gives', proposal.give);
  // #endregion makeProposal

  const feePayment = await E(feePurse).withdraw(
    AmountMath.make(brands.Fee, 5n),
  );
  const [toTrade, payoutValues, epoch] = await Promise.all([
    E(pfFromZoe).makeClaimTokensInvitation(),
    E(pfFromZoe).getPayoutValues(),
    E(pfFromZoe).getEpoch(),
  ]);

  const seat = E(zoe).offer(
    toTrade,
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
};

export { simulateClaim };
