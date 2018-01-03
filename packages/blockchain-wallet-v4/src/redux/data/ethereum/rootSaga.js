
import { call, put, takeLatest } from 'redux-saga/effects'
import { compose, dissoc, mapObjIndexed, negate, prop, sortBy, sum, values } from 'ramda'
import { delay } from 'redux-saga'
import * as AT from './actionTypes'
import * as A from './actions'

export default ({ api } = {}) => {
  const fetchData = function * (action) {
    try {
      const { context } = action.payload
      const data = yield call(api.getEthereumData, context)
      // Accounts treatments
      const finalBalance = sum(values(data).map(obj => obj.balance))
      const totalReceived = sum(values(data).map(obj => obj.totalReceived))
      const totalSent = sum(values(data).map(obj => obj.totalSent))
      const nTx = sum(values(data).map(obj => obj.txn_count))
      const addresses = mapObjIndexed((num, key, obj) => dissoc('txns', num), data)
      const transactions = mapObjIndexed((num, key, obj) => sortBy(compose(negate, prop('timeStamp')), prop('txns', num)), data)

      const ethereumData = {
        addresses,
        info: {
          n_tx: nTx,
          total_received: totalReceived,
          total_sent: totalSent,
          final_balance: finalBalance
        },
        transactions
      }
      yield put(A.fetchDataSuccess(ethereumData))
    } catch (e) {
      yield put(A.fetchDataFailure(e.message))
      throw e
    }
  }

  const fetchFee = function * () {
    try {
      const data = yield call(api.getEthereumFee)
      yield call(delay, 2000)
      yield put(A.fetchFeeSuccess(data))
    } catch (e) {
      yield put(A.fetchFeeFailure(e.message))
      throw e
    }
  }

  const fetchLatestBlock = function * () {
    try {
      const data = yield call(api.getEthereumLatestBlock)
      yield call(delay, 2000)
      yield put(A.fetchLatestBlockSuccess(data))
    } catch (e) {
      yield put(A.fetchLatestBlockFailure(e.message))
      throw e
    }
  }

  const fetchRates = function * () {
    try {
      const data = yield call(api.getEthereumTicker)
      yield call(delay, 2000)
      yield put(A.fetchRatesSuccess(data))
    } catch (e) {
      yield put(A.fetchRatesFailure(e.message))
    }
  }

  const fetchTransactions = function * ({ address }) {
    try {
      const data = yield call(api.getEthereumData, address)
      yield call(delay, 2000)
      yield put(A.fetchTransactionsSuccess(data))
    } catch (e) {
      yield put(A.fetchTransactionsFailure(e.message))
      throw e
    }
  }

  return function * () {
    yield takeLatest(AT.FETCH_ETHEREUM_DATA, fetchData)
    yield takeLatest(AT.FETCH_ETHEREUM_FEE, fetchFee)
    yield takeLatest(AT.FETCH_ETHEREUM_LATEST_BLOCK, fetchLatestBlock)
    yield takeLatest(AT.FETCH_ETHEREUM_RATES, fetchRates)
    yield takeLatest(AT.FETCH_ETHEREUM_TRANSACTIONS, fetchTransactions)
  }
}
