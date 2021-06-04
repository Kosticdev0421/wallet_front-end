import * as AT from './actionTypes'

export const toggleSecondPassword = (password, secondPasswordEnabled) => ({
  payload: { password, secondPasswordEnabled },
  type: AT.TOGGLE_SECOND_PASSWORD
})

export const updatePbkdf2Iterations = (iterations) => ({
  payload: { iterations },
  type: AT.UPDATE_PBKDF2_ITERATIONS
})

export const submitSecondPassword = (password) => ({
  payload: { password },
  type: AT.SUBMIT_SECOND_PASSWORD
})

export const importLegacyAddress = (addr, priv, to, bipPass) => ({
  payload: { addr, bipPass, priv, to },
  type: AT.IMPORT_LEGACY_ADDRESS
})

export const verifyMnemonic = () => ({ type: AT.VERIFY_MNEMONIC })
export const updateMnemonicBackup = () => ({ type: AT.UPDATE_MNEMONIC_BACKUP })
export const submitPromptInput = (value) => ({
  payload: { value },
  type: AT.SUBMIT_PROMPT_INPUT
})

export const submitConfirmation = () => ({
  payload: { value: true },
  type: AT.SUBMIT_CONFIRMATION
})

export const editBtcAccountLabel = (index, label) => ({
  payload: { index, label },
  type: AT.EDIT_BTC_ACCOUNT_LABEL
})

export const setMainPassword = (password) => ({
  payload: { password },
  type: AT.SET_MAIN_PASSWORD
})
