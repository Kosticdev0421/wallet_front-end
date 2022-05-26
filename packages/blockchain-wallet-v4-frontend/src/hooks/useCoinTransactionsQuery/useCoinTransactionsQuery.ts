import { useCallback } from 'react'
import { toLower } from 'ramda'

import { CoinType } from '@core/types'
import { selectors } from 'data'

import { useCoinCheck } from '../useCoinCheck'
import { useRemote } from '../useRemote'
import { CoinTransactionsQueryHook, TransactionItem } from './useCoinTransactionsQuery.types'

const useCoinTransactionsQuery: CoinTransactionsQueryHook = ({ coin }) => {
  const { isCustodialCoin, isErc20Coin } = useCoinCheck()

  const getSelectorForCoin = useCallback(
    (coin: CoinType) => {
      if (isErc20Coin(coin)) {
        return (state) => selectors.core.common.eth.getErc20WalletTransactions(state, coin)
      }

      if (isCustodialCoin(coin)) {
        return (state) => selectors.core.common.coins.getWalletTransactions(state, coin)
      }

      const commonCoinSelector = selectors.core.common[toLower(coin)]

      if (commonCoinSelector) {
        return (state) => {
          const data = commonCoinSelector.getWalletTransactions(state)

          return data[0]
        }
      }

      // default to fiat
      return (state) => selectors.core.data.fiat.getTransactions(coin, state)
    },
    [isErc20Coin]
  )

  return useRemote<{ message: string }, TransactionItem[]>(getSelectorForCoin(coin))
}

export default useCoinTransactionsQuery
