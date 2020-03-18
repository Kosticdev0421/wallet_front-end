import * as AT from './actionTypes'
import { SimpleBuyActionTypes, SimpleBuyState } from './types'
import Remote from 'blockchain-wallet-v4/src/remote/remote'

const INITIAL_STATE: SimpleBuyState = {
  fiatCurrency: null,
  fiatEligible: Remote.NotAsked,
  pairs: Remote.NotAsked,
  step: 'CURRENCY_SELECTION',
  suggestedAmounts: Remote.NotAsked
}

export function simpleBuyReducer (
  state = INITIAL_STATE,
  action: SimpleBuyActionTypes
): SimpleBuyState {
  switch (action.type) {
    case AT.DESTROY_CHECKOUT:
      return {
        ...state,
        pairs: Remote.NotAsked,
        suggestedAmounts: Remote.NotAsked
      }
    case AT.FETCH_SB_FIAT_ELIGIBLE_FAILURE: {
      return {
        ...state,
        fiatEligible: Remote.Failure(action.payload.error)
      }
    }
    case AT.FETCH_SB_FIAT_ELIGIBLE_LOADING:
      return {
        ...state,
        fiatEligible: Remote.Loading
      }
    case AT.FETCH_SB_FIAT_ELIGIBLE_SUCCESS:
      return {
        ...state,
        fiatEligible: Remote.Success(action.payload.fiatEligible)
      }
    case AT.FETCH_SB_PAIRS_FAILURE: {
      return {
        ...state,
        pairs: Remote.Failure(action.payload.error)
      }
    }
    case AT.FETCH_SB_PAIRS_LOADING:
      return {
        ...state,
        pairs: Remote.Loading
      }
    case AT.FETCH_SB_PAIRS_SUCCESS:
      return {
        ...state,
        pairs: Remote.Success(action.payload.pairs)
      }
    case AT.FETCH_SB_SUGGESTED_AMOUNTS_FAILURE: {
      return {
        ...state,
        suggestedAmounts: Remote.Failure(action.payload.error)
      }
    }
    case AT.FETCH_SB_SUGGESTED_AMOUNTS_LOADING:
      return {
        ...state,
        suggestedAmounts: Remote.Loading
      }
    case AT.FETCH_SB_SUGGESTED_AMOUNTS_SUCCESS:
      return {
        ...state,
        suggestedAmounts: Remote.Success(action.payload.amounts)
      }
    case AT.SET_STEP:
      switch (action.payload.step) {
        case 'ENTER_AMOUNT':
          return {
            ...state,
            step: action.payload.step,
            fiatCurrency: action.payload.fiatCurrency
          }
        default: {
          return {
            ...state,
            step: action.payload.step
          }
        }
      }
    default:
      return state
  }
}
