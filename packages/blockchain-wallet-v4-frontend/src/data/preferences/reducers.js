import { assoc, assocPath } from 'ramda'
import * as AT from './actionTypes'
import * as priceChartActionTypes from '../components/priceChart/actionTypes'

const INITIAL_STATE = {
  language: 'en',
  culture: 'en-GB',
  theme: 'default',
  coinDisplayed: true,
  balancesTable: 'total',
  showKycCompleted: true,
  showEtherWelcome: true,
  showBackupReminder: true,
  showBitcoinWelcome: true,
  showBitcoinCashWelcome: true
}

const preferences = (state = INITIAL_STATE, action) => {
  const { type, payload } = action
  switch (type) {
    case AT.SET_LANGUAGE: {
      const { language } = payload
      return assoc('language', language, state)
    }
    case AT.SET_CULTURE: {
      const { culture } = payload
      return assoc('culture', culture, state)
    }
    case AT.SET_THEME: {
      const { theme } = payload
      return assoc('theme', theme, state)
    }
    case AT.TOGGLE_COIN_DISPLAY: {
      return assoc('coinDisplayed', !state.coinDisplayed, state)
    }
    case AT.HIDE_KYC_COMPLETED: {
      return assoc('showKycCompleted', false, state)
    }
    case AT.SET_ETHER_WELCOME: {
      const { displayed } = payload
      return assoc('showEtherWelcome', displayed, state)
    }
    case AT.SET_BITCOIN_WELCOME: {
      const { displayed } = payload
      return assoc('showBitcoinWelcome', displayed, state)
    }
    case AT.SET_BITCOIN_CASH_WELCOME: {
      const { displayed } = payload
      return assoc('showBitcoinCashWelcome', displayed, state)
    }
    case AT.SET_BALANCES_CHART_TAB: {
      return assoc('balancesTable', payload, state)
    }
    case priceChartActionTypes.PRICE_CHART_COIN_CLICKED: {
      const { coin } = payload
      return assocPath(['priceChart', 'coin'], coin, state)
    }
    case priceChartActionTypes.PRICE_CHART_TIME_CLICKED: {
      const { time } = payload
      return assocPath(['priceChart', 'time'], time, state)
    }
    default:
      return state
  }
}

export default preferences
