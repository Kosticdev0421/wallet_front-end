import { prop } from 'ramda'

export const getBtcCurrency = prop('btc_currency')
export const getLanguage = prop('language')
export const getCurrency = prop('currency')
export const getSmsNumber = prop('sms_number')
export const getSmsVerified = prop('sms_verified')
export const getEmail = prop('email')
export const getEmailVerified = prop('email_verified')
export const getAutoLogout = prop('auto_logout')
export const getLoggingLevel = prop('logging_level')
export const getIpLock = prop('ip_lock')
export const getBlockTorIps = prop('block_tor_ips')
