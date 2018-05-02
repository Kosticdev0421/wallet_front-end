import ExchangeDelegate from '../../../exchange/delegate'
import { apply, call, put, select, take, takeLatest, fork } from 'redux-saga/effects'
import * as buySellSelectors from '../../kvStore/buySell/selectors'
import * as buySellAT from '../../kvStore/buySell/actionTypes'
import { sfoxService } from '../../../exchange/service'
import * as AT from './actionTypes'
import * as A from './actions'
let sfox

export default ({ api, options }) => {
  const refreshSFOX = function * () {
    const state = yield select()
    const delegate = new ExchangeDelegate(state, api)
    const value = yield select(buySellSelectors.getMetadata)
    sfox = sfoxService.refresh(value, delegate, options)
  }

  const init = function * () {
    try {
      yield call(refreshSFOX)
    } catch (e) {
      throw new Error(e)
    }
  }

  const fetchProfile = function * () {
    try {
      yield put(A.fetchProfileLoading())
      const profile = yield apply(sfox, sfox.fetchProfile)
      yield put(A.fetchProfileSuccess(profile))
    } catch (e) {
      yield put(A.fetchProfileFailure(e))
    }
  }

  const fetchQuote = function * (data) {
    try {
      yield put(A.fetchQuoteLoading())
      const nextAddress = data.payload.nextAddress
      yield put(A.setNextAddress(nextAddress))
      yield call(refreshSFOX)
      const { amt, baseCurr, quoteCurr } = data.payload.quote
      const quote = yield apply(sfox, sfox.getBuyQuote, [amt, baseCurr, quoteCurr])
      yield put(A.fetchQuoteSuccess(quote))
      yield fork(waitForRefreshQuote, data.payload)
    } catch (e) {
      yield put(A.fetchQuoteFailure(e))
    }
  }

  const fetchSellQuote = function * (data) {
    try {
      yield put(A.fetchSellQuoteLoading())
      // const nextAddress = data.payload.nextAddress
      // yield put(A.setNextAddress(nextAddress))
      yield call(refreshSFOX)
      const { amt, baseCurr, quoteCurr } = data.payload.quote
      const quote = yield apply(sfox, sfox.getSellQuote, [amt, baseCurr, quoteCurr])
      yield put(A.fetchSellQuoteSuccess(quote))
      // yield fork(waitForRefreshQuote, data.payload)
    } catch (e) {
      yield put(A.fetchSellQuoteFailure(e))
    }
  }

  const waitForRefreshQuote = function * (quotePayload) {
    yield take(AT.REFRESH_QUOTE)
    yield put(A.fetchQuote(quotePayload))
  }

  const fetchTrades = function * () {
    try {
      yield put(A.fetchTradesLoading())
      const trades = yield apply(sfox, sfox.getTrades)
      yield put(A.fetchTradesSuccess(trades))
    } catch (e) {
      yield put(A.fetchTradesFailure(e))
    }
  }

  const fetchAccounts = function * () {
    try {
      yield put(A.sfoxFetchAccountsLoading())
      const methods = yield apply(sfox, sfox.getBuyMethods)
      const accounts = yield apply(sfox, methods.ach.getAccounts)
      yield put(A.sfoxFetchAccountsSuccess(accounts))
    } catch (e) {
      yield put(A.sfoxFetchAccountsFailure(e))
    }
  }

  const getBankAccounts = function * (data) {
    const token = data.payload
    try {
      const bankAccounts = yield apply(sfox.bankLink, sfox.bankLink.getAccounts, [token])
      yield put(A.getBankAccountsSuccess(bankAccounts))
    } catch (e) {
      yield put(A.getBankAccountsFailure(e))
    }
  }

  const resetProfile = function * () {
    yield put(A.resetProfile())
  }

  return function * () {
    yield takeLatest(buySellAT.FETCH_METADATA_BUYSELL_SUCCESS, init)
    yield takeLatest(AT.SFOX_FETCH_ACCOUNTS, fetchAccounts)
    yield takeLatest(AT.FETCH_PROFILE, fetchProfile)
    yield takeLatest(AT.FETCH_TRADES, fetchTrades)
    yield takeLatest(AT.SFOX_FETCH_QUOTE, fetchQuote)
    yield takeLatest(AT.SFOX_FETCH_SELL_QUOTE, fetchSellQuote)
    yield takeLatest(AT.GET_BANK_ACCOUNTS, getBankAccounts)
    yield takeLatest(AT.RESET_PROFILE, resetProfile)
  }
}
