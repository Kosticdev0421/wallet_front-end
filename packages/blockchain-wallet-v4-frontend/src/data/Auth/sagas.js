import { delay } from 'redux-saga'
import { takeEvery, call, put, select, cancel, cancelled, fork } from 'redux-saga/effects'
import { push } from 'react-router-redux'
import { prop, assoc } from 'ramda'
import Either from 'data.either'

import * as AT from './actionTypes'
import { actionTypes, actions, selectors } from 'data'
import { api } from 'services/ApiService'
import { pairing } from 'blockchain-wallet-v4/src'

// =============================================================================
// ================================= Generic ===================================
// =============================================================================

const loginRoutineSaga = function * () {
  const context = yield select(selectors.core.wallet.getWalletContext)
  const sharedKey = yield select(selectors.core.wallet.getSharedKey)
  const guid = yield select(selectors.core.wallet.getGuid)
  yield put(actions.core.common.fetchBlockchainData(context))
  yield put(actions.core.settings.fetchSettings({ guid, sharedKey }))
  yield put(actions.core.webSocket.startSocket())
  yield put(actions.auth.loginSuccess())
  yield put(actions.auth.logoutStartTimer())
  yield put(push('/wallet'))
}

// =============================================================================
// ================================== Login ====================================
// =============================================================================
let safeParse = Either.try(JSON.parse)

const pollingSaga = function * (session, n = 50) {
  if (n === 0) { return false }
  try {
    yield call(delay, 2000)
    let response = yield call(api.pollForSessioGUID, session)
    if (prop('guid', response)) { return true }
  } catch (error) {
    return false
  }
  return yield call(pollingSaga, session, n - 1)
}

const fetchWalletSaga = function * (guid, sharedKey, session, password, code) {
  try {
    const wrapper = yield call(api.fetchWallet, guid, sharedKey, session, password, code)
    yield put(actions.core.wallet.setWrapper(wrapper))
    yield call(loginRoutineSaga)
  } catch (error) {
    const initialError = safeParse(error).map(prop('initial_error'))
    const authRequired = safeParse(error).map(prop('authorization_required'))
    if (authRequired.isRight && authRequired.value) {
      yield put(actions.alerts.displayInfo('Authorization required, check your inbox'))
      const authorized = yield call(pollingSaga, session)
      if (authorized) {
        yield call(fetchWalletSaga, guid, undefined, session, password)
      }
    } else if (initialError.isRight && initialError.value) {
      yield call(loginError, initialError.value)
    } else {
      if (error.auth_type > 0) { // 2fa required
        // dispatch state change to show form
        yield put(actions.auth.setAuthType(error.auth_type))
        yield put(actions.alerts.displaySuccess('2FA required'))
      } else if (error.message) {
        yield put(actions.alerts.displayError(error.message))
      } else {
        yield put(actions.alerts.displayError(error || 'Error logging into your wallet'))
      }
    }
  }
}

const login = function * (action) {
  const { guid, sharedKey, password, code } = action.payload
  // login with shared key
  if (sharedKey) {
    yield call(fetchWalletSaga, guid, sharedKey, undefined, password, undefined)
  } else {
    try {
      let session = yield select(selectors.auth.getSession(guid))
      session = yield call(api.establishSession, session)
      yield put(actions.auth.saveSession(assoc(guid, session, {})))
      yield call(fetchWalletSaga, guid, undefined, session, password, code)
    } catch (e) {
      yield call(loginError, 'Error establishing the session')
    }
  }
}

const loginSuccess = function * (action) {
  yield put(actions.alerts.displaySuccess('Login successful'))
}

const loginError = function * (action) {
  yield put(actions.alerts.displayError(action.payload))
}

// =============================================================================
// ================================= Register ==================================
// =============================================================================
const registerSuccess = function * (action) {
  yield put(actions.alerts.displaySuccess('Wallet successfully created.'))
  yield call(loginRoutineSaga)
}

const registerError = function * (action) {
  yield put(actions.alerts.displayError('Wallet could not be created.'))
}

// =============================================================================
// ================================== Recover ==================================
// =============================================================================
const restoreWalletSuccess = function* (action) {
  yield put(actions.alerts.displaySuccess('Your wallet has been successfully restored.'))
  yield call(loginRoutineSaga)
}

const restoreWalletError = function* () {
  yield put(actions.alerts.displayError('Error restoring your wallet.'))
}


// =============================================================================
// ============================ MobileLogin modal ==============================
// =============================================================================

const mobileLoginSuccess = function * (action) {
  const { payload } = action
  const { data } = payload

  try {
    const parsedDataE = pairing.parseQRcode(data)
    if (parsedDataE.isRight) {
      const { guid, encrypted } = parsedDataE.value
      const passphrase = yield call(api.getPairingPassword, guid)
      const credentialsE = pairing.decode(encrypted, passphrase)
      if (credentialsE.isRight) {
        const { sharedKey, password } = credentialsE.value
        yield call(fetchWalletSaga, guid, sharedKey, undefined, password)
      } else {
        throw new Error(credentialsE.value)
      }
    } else {
      throw new Error(parsedDataE.value)
    }
  } catch (error) {
    yield put(actions.alerts.displayError(error.message))
  }
  yield put(actions.modals.closeModal())
}

const mobileLoginError = function * (action) {
  yield put(actions.alerts.displayError('Error using mobile login'))
  yield put(actions.modals.closeModal())
}

// =============================================================================
// ================================== Logout ===================================
// =============================================================================
let timerTask

const logoutStart = function * () {
  // yield put(actions.core.webSocket.stopSocket())
  window.location.reload(true)
}

const logoutStartTimer = function * () {
  timerTask = yield fork(logoutTimer)
}

const logoutResetTimer = function * () {
  yield cancel(timerTask)
}

const logoutTimer = function * () {
  try {
    const autoLogout = yield select(selectors.core.wallet.getLogoutTime)
    let elapsed = 0
    const total = parseInt(autoLogout / 1000)
    const threshold = 10

    while (elapsed < total) {
      // When we reach the threshold value, we show the auto-disconnection modal
      if (total - elapsed === threshold) {
        yield put(actions.modals.showModal('AutoDisconnection', { duration: threshold }))
      }
      yield call(delay, 1000)
      elapsed++
    }
  } finally {
    if (yield cancelled()) {
      // If the task has been cancelled (reset timer), we restart the timer
      yield put(actions.modals.closeModal())
      yield put(actions.auth.logoutStartTimer())
    } else {
      // If the timer reaches the end, we logout
      yield put(actions.auth.logoutStart())
    }
  }
}

function * sagas () {
  yield takeEvery(AT.LOGIN, login)
  yield takeEvery(AT.LOGIN_SUCCESS, loginSuccess)
  yield takeEvery(AT.LOGIN_ERROR, loginError)

  yield takeEvery(AT.MOBILE_LOGIN_SUCCESS, mobileLoginSuccess)
  yield takeEvery(AT.MOBILE_LOGIN_ERROR, mobileLoginError)

  yield takeEvery(AT.LOGOUT_START, logoutStart)
  yield takeEvery(AT.LOGOUT_START_TIMER, logoutStartTimer)
  yield takeEvery(AT.LOGOUT_RESET_TIMER, logoutResetTimer)

  yield takeEvery(actionTypes.core.wallet.CREATE_WALLET_SUCCESS, registerSuccess)
  yield takeEvery(actionTypes.core.wallet.CREATE_WALLET_ERROR, registerError)

  yield takeEvery(actionTypes.core.wallet.RESTORE_WALLET_SUCCESS, restoreWalletSuccess)
  yield takeEvery(actionTypes.core.wallet.RESTORE_WALLET_ERROR, restoreWalletError)
}

export default sagas
