import { E } from '@endo/far';
import { accounts } from '../data/agd-keys.js';
import { merkleTreeObj } from './generated_keys.js';
import { Fn, Observable } from '../../src/helpers/adts.js';
import { createStore } from '../../src/tribbles/utils.js';

const generateInt = x => () => Math.floor(Math.random() * (x + 1));

const createTestTier = generateInt(4); // ?

const makeClaimOfferArgs = account =>
  Fn(({ merkleTreeAPI }) => ({
    key: account.pubkey.key,
    tier: account.tier,
    proof: merkleTreeAPI.constructProof(account.pubkey),
  }));

const makePauseOfferSpec = (instance, offerId = 'default-offer-id') => ({
  offerId,
  invitationSpec: {
    source: 'purse',
    instance,
    description: 'pause contract',
  },
  proposal: {},
});

const makeMakeOfferSpec = instance => (account, feeAmount, id) => ({
  id: `offer-${id}`,
  invitationSpec: {
    source: 'contract',
    instance,
    publicInvitationMaker: 'makeClaimTokensInvitation',
  },
  proposal: { give: { Fee: feeAmount } },
  offerArgs: {
    key: account.pubkey.key,
    proof: merkleTreeObj.constructProof(account.pubkey),
    tier: account.tier,
  },
});

const publicKeys = accounts.map(x => x.pubkey.key);
/**
 * @param {import('../../src/types.js').AccountDetails} account
 */
const handleConstructClaimOffer = account =>
  makeClaimOfferArgs(account).chain(offerArgs =>
    Fn(({ makeFeeAmount, instance, invitationMaker }) => ({
      id: `offer-${account.address}`,
      invitationSpec: {
        source: 'contract',
        instance,
        publicInvitationMaker: invitationMaker,
      },
      proposal: { give: { Fee: makeFeeAmount() } },
      offerArgs,
    })),
  );

export const makeOfferArgs = ({
  pubkey = {
    key: '',
  },
  tier = createTestTier(),
}) => ({
  key: pubkey.key,
  proof: merkleTreeObj.constructProof(pubkey),
  tier,
});

const reducerFn = (state = [], action) => {
  const { type, payload } = action;
  switch (type) {
    case 'NEW_RESULT':
      return [...state, payload];
    default:
      return state;
  }
};
const handleNewResult = result => ({
  type: 'NEW_RESULT',
  payload: result.value,
});

const makeAsyncObserverObject = (
  generator,
  completeMessage = 'Iterator lifecycle complete.',
  maxCount = Infinity,
) =>
  Observable(async observer => {
    const iterator = E(generator);
    const { dispatch, getStore } = createStore(reducerFn, []);
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line @jessie.js/safe-await-separator
      const result = await iterator.next();
      if (result.done) {
        console.log('result.done === true #### breaking loop');
        break;
      }
      dispatch(handleNewResult(result));
      if (getStore().length === maxCount) {
        console.log('getStore().length === maxCoutn');
        break;
      }
      observer.next(result.value);
    }
    observer.complete({ message: completeMessage, values: getStore() });
  });

const traceFn = label => value => {
  console.log(label, '::::', value);
  return value;
};

export {
  createTestTier,
  makeAsyncObserverObject,
  handleConstructClaimOffer,
  makeClaimOfferArgs,
  makeMakeOfferSpec,
  makePauseOfferSpec,
  traceFn,
};
