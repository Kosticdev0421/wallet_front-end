import { path, propOr, propEq, toUpper, filter } from 'ramda'

import { selectors, model } from 'data'
const { TIERS_STATES } = model.profile

export const getDomains = state =>
  selectors.core.walletOptions.getDomains(state).getOrElse(false)

export const getCanAirdrop = (state, ownProps) => {
  const { coin } = ownProps
  const supportedCoins = selectors.core.walletOptions
    .getSupportedCoins(state)
    .getOrFail()
  const userData = selectors.modules.profile.getUserData(state).getOrElse({})
  return (
    path([coin, 'airdrop'], supportedCoins) &&
    !path(['tags', path([coin, 'airdrop', 'name'], supportedCoins)], userData)
  )
}

export const getCanBuyBtc = (state, ownProps) => {
  const { coin } = ownProps
  const canTrade = selectors.exchange.getCanTrade(state, 'Buy').getOrElse(false)
  return coin === 'BTC' && canTrade
}

export const getAvailability = (state, ownProps) => {
  const availability = selectors.core.walletOptions.getCoinAvailability(
    state,
    toUpper(ownProps.coin)
  )
  return {
    exchange: availability.map(propOr(true, 'exchange')).getOrElse(false),
    request: availability.map(propOr(true, 'request')).getOrElse(false)
  }
}
export const isTier2Verified = state => {
  return selectors.modules.profile
    .getTiers(state)
    .map(filter(propEq('index', 2)))
    .map(propEq('state', TIERS_STATES.VERIFIED))
    .getOrElse(false)
}
