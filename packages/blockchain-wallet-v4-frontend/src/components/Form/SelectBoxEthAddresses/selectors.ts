// @ts-ignore
import { concat, curry, filter, has, map, reduce, sequence } from 'ramda'

import { Exchange, Remote } from 'blockchain-wallet-v4/src'
import { ADDRESS_TYPES } from 'blockchain-wallet-v4/src/redux/payment/btc/utils'
import {
  Erc20CoinType,
  InterestAccountBalanceType
} from 'blockchain-wallet-v4/src/types'
import { selectors } from 'data'

export const getEthData = (
  state,
  ownProps: {
    exclude?: Array<string>
    excludeLockbox?: boolean
    forceCustodialFirst?: boolean
    includeCustodial?: boolean
    includeExchangeAddress?: boolean
    includeInterest?: boolean
  }
) => {
  const {
    exclude = [],
    excludeLockbox,
    includeExchangeAddress,
    includeCustodial,
    includeInterest,
    forceCustodialFirst
  } = ownProps

  const displayEthFixed = data => {
    return Exchange.displayCoinToCoin({ value: data.value, coin: 'ETH' })
  }
  const buildDisplay = wallet => {
    if (has('balance', wallet)) {
      let ethDisplay = displayEthFixed({
        value: wallet.balance,
        fromUnit: 'WEI',
        coin: 'ETH'
      })
      return wallet.label + ` (${ethDisplay})`
    }
    return wallet.label
  }
  const buildCustodialDisplay = account => {
    return (
      `Trading Account` +
      ` (${Exchange.displayCoinToCoin({
        value: account ? account.available : 0,
        coin: 'ETH'
      })})`
    )
  }
  const buildInterestDisplay = (account: InterestAccountBalanceType['ETH']) => {
    return (
      `Interest Account` +
      ` (${Exchange.displayCoinToCoin({
        value: account ? account.balance : 0,
        coin: 'ETH'
      })})`
    )
  }
  // @ts-ignore
  const excluded = filter(x => !exclude.includes(x.label))
  const toDropdown = map(x => ({ label: buildDisplay(x), value: x }))
  const toGroup = curry((label, options) => [{ label, options, value: '' }])
  const toExchange = x => [{ label: `ETH Exchange Account`, value: x }]
  const toCustodialDropdown = currencyDetails => [
    {
      label: buildCustodialDisplay(currencyDetails),
      value: {
        ...currencyDetails,
        type: ADDRESS_TYPES.CUSTODIAL,
        label: 'Trading Account'
      }
    }
  ]

  const toInterestDropdown = account => [
    {
      label: buildInterestDisplay(account),
      value: {
        ...account,
        type: ADDRESS_TYPES.INTEREST,
        label: 'Interest Account'
      }
    }
  ]

  const exchangeAddress = selectors.components.send.getPaymentsAccountExchange(
    'ETH',
    state
  )
  const hasExchangeAddress = Remote.Success.is(exchangeAddress)

  const accountAddress = selectors.components.send.getPaymentsTradingAccountAddress(
    'ETH',
    state
  )
  const hasAccountAddress = Remote.Success.is(accountAddress)

  const showCustodial = includeCustodial && !forceCustodialFirst
  const showCustodialWithAddress =
    includeCustodial && forceCustodialFirst && hasAccountAddress

  const getAddressesData = () => {
    return sequence(Remote.of, [
      includeExchangeAddress && hasExchangeAddress
        ? exchangeAddress.map(toExchange).map(toGroup('Exchange'))
        : Remote.of([]),
      selectors.core.common.eth
        .getAccountBalances(state)
        .map(excluded)
        .map(toDropdown)
        .map(toGroup('Wallet')),
      showCustodial || showCustodialWithAddress
        ? selectors.components.simpleBuy
            .getSBBalances(state)
            .map(x => ({
              ...x.ETH,
              address: accountAddress ? accountAddress.data : null
            }))
            .map(toCustodialDropdown)
            .map(toGroup('Custodial Wallet'))
        : Remote.of([]),
      includeInterest
        ? selectors.components.interest
            .getInterestAccountBalance(state)
            .map(x => x.ETH)
            .map(toInterestDropdown)
            .map(toGroup('Interest Account'))
        : Remote.of([]),
      excludeLockbox
        ? Remote.of([])
        : selectors.core.common.eth
            .getLockboxEthBalances(state)
            .map(excluded)
            .map(toDropdown)
            .map(toGroup('Lockbox'))
    ]).map(([b1, b2, b3, b4, b5]) => {
      const orderArray = forceCustodialFirst
        ? [b3, b1, b2, b4, b5]
        : [b1, b2, b3, b4, b5]
      // @ts-ignore
      const data = reduce(concat, [], orderArray)
      return { data }
    })
  }

  return getAddressesData()
}

export const getErc20Data = (
  state,
  ownProps: {
    coin: Erc20CoinType
    exclude?: Array<string>
    forceCustodialFirst?: boolean
    includeCustodial?: boolean
    includeExchangeAddress?: boolean
    includeInterest?: boolean
  }
) => {
  const {
    coin,
    exclude = [],
    includeExchangeAddress,
    includeCustodial,
    includeInterest,
    forceCustodialFirst
  } = ownProps
  const displayErc20Fixed = data => {
    const amount = Exchange.convertCoinToCoin({
      coin,
      value: data.value
    })
    return Exchange.displayCoinToCoin({
      value: Number(amount).toFixed(8),
      coin: 'PAX'
    })
  }
  const buildCustodialDisplay = (coin: Erc20CoinType, account) => {
    return (
      `Trading Account` +
      ` (${displayErc20Fixed({
        value: account ? account.available : 0,
        fromUnit: 'WEI',
        toUnit: coin
      })})`
    )
  }

  const buildInterestDisplay = (coin: Erc20CoinType, account) => {
    return (
      `Interest Account` +
      ` (${Exchange.displayCoinToCoin({
        value: account ? account.balance : 0,
        coin
      })})`
    )
  }

  // @ts-ignore
  const excluded = filter(account => !exclude.includes(account.label))
  const buildDisplay = wallet => {
    let erc20BalanceDisplay = displayErc20Fixed({
      value: wallet.balance,
      fromUnit: 'WEI',
      toUnit: coin
    })
    return wallet.label + ` (${erc20BalanceDisplay})`
  }
  const toDropdown = map(x => ({
    label: buildDisplay(x),
    value: x
  }))
  const toGroup = curry((label, options) => [{ label, options }])
  const toExchange = x => [
    {
      label: 'Exchange Account',
      value: x
    }
  ]
  const toCustodialDropdown = account => [
    {
      label: buildCustodialDisplay(coin, account),
      value: {
        ...account,
        type: ADDRESS_TYPES.CUSTODIAL,
        label: `Trading Account`
      }
    }
  ]

  const toInterestDropdown = account => [
    {
      label: buildInterestDisplay(coin, account),
      value: {
        ...account,
        type: ADDRESS_TYPES.INTEREST,
        label: `Interest Account`
      }
    }
  ]

  const exchangeAddress = selectors.components.send.getPaymentsAccountExchange(
    coin,
    state
  )
  const hasExchangeAddress = Remote.Success.is(exchangeAddress)

  const accountAddress = selectors.components.send.getPaymentsTradingAccountAddress(
    coin,
    state
  )
  const hasAccountAddress = Remote.Success.is(accountAddress)
  const showCustodial = includeCustodial && !forceCustodialFirst
  const showCustodialWithAddress =
    includeCustodial && forceCustodialFirst && hasAccountAddress

  const getAddressesData = () => {
    return sequence(Remote.of, [
      includeExchangeAddress && hasExchangeAddress
        ? exchangeAddress.map(toExchange).map(toGroup('Exchange'))
        : Remote.of([]),
      selectors.core.common.eth
        .getErc20AccountBalances(state, coin)
        .map(excluded)
        .map(toDropdown)
        .map(toGroup('Wallet')),
      Remote.of([]),
      showCustodial || showCustodialWithAddress
        ? selectors.components.simpleBuy
            .getSBBalances(state)
            .map(x => ({
              ...x[coin],
              address: accountAddress ? accountAddress.data : null
            }))
            .map(toCustodialDropdown)
            .map(toGroup('Custodial Wallet'))
        : Remote.of([]),
      includeInterest
        ? selectors.components.interest
            .getInterestAccountBalance(state)
            .map(x => x[coin])
            .map(toInterestDropdown)
            .map(toGroup('Interest Account'))
        : Remote.of([])
    ]).map(([b1, b2, b3, b4, b5]) => {
      const orderArray = forceCustodialFirst
        ? [b2, b1, b3, b4, b5]
        : [b1, b2, b3, b4, b5]
      // @ts-ignore
      const data = reduce(concat, [], orderArray)
      return { data }
    })
  }

  return getAddressesData()
}
