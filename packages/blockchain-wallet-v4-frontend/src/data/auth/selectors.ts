import { RootState } from 'data/rootReducer'

import { AuthStateType } from './types'

export function getAccountReset(state: RootState): AuthStateType['resetAccount'] {
  return state.auth.resetAccount
}

export function getAccountUnificationFlowType(
  state: RootState
): AuthStateType['accountUnificationFlow'] {
  return state.auth.accountUnificationFlow
}

export function getAuthPlatform(state: RootState): AuthStateType['authPlatform'] {
  return state.auth.authPlatform
}

export function getAuthType(state: RootState): AuthStateType['auth_type'] {
  return state.auth.auth_type
}

export function getRegistering(state: RootState): AuthStateType['registering'] {
  return state.auth.registering
}

export function getFirstLogin(state: RootState): AuthStateType['firstLogin'] {
  return state.auth.firstLogin
}

export function getRestoring(state: RootState): AuthStateType['restoring'] {
  return state.auth.restoring
}

export function getDesignatedProduct(state: RootState): AuthStateType['designatedProduct'] {
  return state.auth.designatedProduct
}

export function getSecureChannelLogin(state: RootState): AuthStateType['secureChannelLogin'] {
  return state.auth.secureChannelLogin
}

export function getExchangeLogin(state: RootState): AuthStateType['exchangeAuth']['exchangeLogin'] {
  return state.auth.exchangeAuth.exchangeLogin
}

export function getLogin(state: RootState): AuthStateType['login'] {
  return state.auth.login
}

export function getMobileLoginStarted(state: RootState): AuthStateType['mobileLoginStarted'] {
  return state.auth.mobileLoginStarted
}

export function getRegisterEmail(state: RootState): AuthStateType['registerEmail'] {
  return state.auth.registerEmail
}

export function getMetadataRestore(state: RootState): AuthStateType['metadataRestore'] {
  return state.auth.metadataRestore
}

export function getKycResetStatus(state: RootState): AuthStateType['kycReset'] {
  return state.auth.kycReset
}

export function getMagicLinkData(state: RootState): AuthStateType['magicLinkData'] {
  return state.auth.magicLinkData
}

export function getUserGeoData(state: RootState): AuthStateType['userGeoData'] {
  return state.auth.userGeoData
}

export function getManifest(state: RootState): AuthStateType['manifestFile'] {
  return state.auth.manifestFile
}

export function isAuthenticated(state: RootState): AuthStateType['isAuthenticated'] {
  return state.auth.isAuthenticated
}

export function getJwtToken(state: RootState): AuthStateType['exchangeAuth']['jwtToken'] {
  return state.auth.exchangeAuth.jwtToken
}
