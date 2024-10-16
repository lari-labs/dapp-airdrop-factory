/* global fetch */
// import type {
//   QueryAllBalancesResponseSDKType,
//   QueryBalanceResponseSDKType,
// } from '@agoric/cosmic-proto/cosmos/bank/v1beta1/query.js';
// import type { QueryDelegationTotalRewardsResponseSDKType } from '@agoric/cosmic-proto/cosmos/distribution/v1beta1/query.js';
// import type { QueryValidatorsResponseSDKType } from '@agoric/cosmic-proto/cosmos/staking/v1beta1/query.js';
// import type { QueryDelegatorDelegationsResponseSDKType } from '@agoric/cosmic-proto/cosmos/staking/v1beta1/query.js';
// import type { QueryDelegatorUnbondingDelegationsResponseSDKType } from '@agoric/cosmic-proto/cosmos/staking/v1beta1/query.js';
// import type { QueryDenomHashResponseSDKType } from '@agoric/cosmic-proto/ibc/applications/transfer/v1/query.js';
// import type { QueryChannelResponseSDKType } from '@agoric/cosmic-proto/ibc/core/channel/v1/query.js';
// import { QueryChannelsResponseSDKType } from '@agoric/cosmic-proto/ibc/core/channel/v1/query.js';

// TODO use telescope generated query client from @agoric/cosmic-proto
// https://github.com/Agoric/agoric-sdk/issues/9200
export function makeQueryClient(apiUrl = '') {
  const query = async (path = '') => {
    await null;
    try {
      const res = await fetch(`${apiUrl}${path}`);
      const json = await res.json();
      return json;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    query,
    queryBalances: (address = '') =>
      query(`/cosmos/bank/v1beta1/balances/${address}`),
    queryBalance: (address = '', denom = '') =>
      query(`/cosmos/bank/v1beta1/balances/${address}/by_denom?denom=${denom}`),
    queryValidators: () => query('/cosmos/staking/v1beta1/validators'),
    queryDelegations: (delegatorAddr = '') =>
      query(`/cosmos/staking/v1beta1/delegations/${delegatorAddr}`),
    queryUnbonding: (delegatorAddr = '') =>
      query(
        `/cosmos/staking/v1beta1/delegators/${delegatorAddr}/unbonding_delegations`,
      ),
    queryRewards: (delegatorAdddr = '') =>
      query(
        `/cosmos/distribution/v1beta1/delegators/${delegatorAdddr}/rewards`,
      ),
    queryDenom: (path = '', baseDenom = '') =>
      query(`/ibc/apps/transfer/v1/denom_hashes/${path}/${baseDenom}`),
    queryChannel: (portID = '', channelID = '') =>
      query(`/ibc/core/channel/v1/channels/${channelID}/ports/${portID}`),
  };
}
