import { any, path, prop, map, flatten, filter, head, nth } from 'ramda'
import { kvStorePath } from '../../paths'
import { LOCKBOX } from '../config'

// General
export const getMetadata = path([kvStorePath, LOCKBOX])

export const getDevices = state =>
  getMetadata(state).map(path(['value', 'devices']))

export const getDevice = (state, deviceIndex) =>
  getDevices(state).map(nth(deviceIndex))

export const getDeviceName = (state, deviceIndex) =>
  getDevice(state, deviceIndex).map(prop('device_name'))

// BTC
export const getLockboxBtc = state => getDevices(state).map(map(path(['btc'])))

export const getLockboxBtcAccounts = state =>
  getLockboxBtc(state)
    .map(map(path(['accounts'])))
    .map(flatten)

export const getLockboxBtcContext = state => {
  return getLockboxBtcAccounts(state).map(accounts => {
    return accounts ? accounts.map(a => path(['xpub'], a)) : []
  })
}
export const getBtcContextForDevice = (state, deviceId) =>
  getDevice(state, deviceId)
    .map(path(['btc', 'accounts']))
    .map(map(prop('xpub')))

export const getLockboxBtcAccount = (state, xpub) =>
  getLockboxBtcAccounts(state)
    .map(filter(x => x.xpub === xpub))
    .map(head)

export const getDeviceFromBtcXpubs = (state, xpubs) => {
  const accountContainsXpubs = account =>
    any(xpub => xpub === account.xpub, xpubs)
  const deviceFilter = device =>
    any(accountContainsXpubs, path(['btc', 'accounts'], device))
  return getDevices(state)
    .map(filter(deviceFilter))
    .map(head)
}

export const getLockboxBtcDefaultAccount = (state, deviceId) =>
  getDevice(state, deviceId)
    .map(path(['btc', 'accounts']))
    .map(head)

// BCH
export const getLockboxBch = state => getDevices(state).map(map(path(['bch'])))

export const getLockboxBchAccounts = state =>
  getLockboxBch(state)
    .map(map(path(['accounts'])))
    .map(flatten)

export const getLockboxBchContext = state => {
  return getLockboxBchAccounts(state).map(accounts => {
    return accounts ? accounts.map(a => path(['xpub'], a)) : []
  })
}

export const getBchContextForDevice = (state, deviceId) =>
  getDevice(state, deviceId)
    .map(path(['bch', 'accounts']))
    .map(map(prop('xpub')))

export const getLockboxBchAccount = (state, xpub) =>
  getLockboxBchAccounts(state)
    .map(filter(x => x.xpub === xpub))
    .map(head)

export const getDeviceFromBchXpubs = (state, xpubs) => {
  const accountContainsXpubs = account =>
    any(xpub => xpub === account.xpub, xpubs)
  const deviceFilter = device =>
    any(accountContainsXpubs, path(['bch', 'accounts'], device))
  return getDevices(state)
    .map(filter(deviceFilter))
    .map(head)
}

// ETH
export const getLockboxEth = state => getDevices(state).map(map(path(['eth'])))

export const getLockboxEthAccounts = state =>
  getLockboxEth(state)
    .map(map(path(['accounts'])))
    .map(flatten)

export const getLockboxEthAccount = (state, address) =>
  getLockboxEthAccounts(state)
    .map(filter(x => x.addr === address))
    .map(head)

export const getLockboxEthContext = state => {
  return getLockboxEthAccounts(state).map(accounts => {
    return accounts ? accounts.map(a => path(['addr'], a)) : []
  })
}
export const getEthContextForDevice = (state, deviceId) =>
  getDevice(state, deviceId)
    .map(path(['eth', 'accounts']))
    .map(map(prop('addr')))

export const getDeviceFromEthAddr = (state, addr) => {
  const accountContainsAddr = account => account.addr === addr
  const deviceFilter = device =>
    any(accountContainsAddr, path(['eth', 'accounts'], device))
  return getDevices(state)
    .map(filter(deviceFilter))
    .map(head)
}
