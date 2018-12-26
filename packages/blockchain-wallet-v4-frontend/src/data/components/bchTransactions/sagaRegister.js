import { takeEvery } from 'redux-saga/effects'
import * as AT from './actionTypes'
import * as actionTypes from '../../actionTypes'
import sagas from './sagas'

export default () => {
  const bchTransactionsSagas = sagas()

  return function*() {
    yield takeEvery(
      AT.BCH_TRANSACTIONS_INITIALIZED,
      bchTransactionsSagas.initialized
    )
    yield takeEvery(
      AT.BCH_TRANSACTIONS_REPORT_CLICKED,
      bchTransactionsSagas.reportClicked
    )
    yield takeEvery(actionTypes.form.CHANGE, bchTransactionsSagas.formChanged)
  }
}
