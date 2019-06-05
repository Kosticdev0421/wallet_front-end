import { shift, shiftIProp } from './util'
import { pipe, compose, curry, is, range, map } from 'ramda'
import { view, over, traverseOf, traversed } from 'ramda-lens'
import Bitcoin from 'bitcoinjs-lib'
import BIP39 from 'bip39'
import * as crypto from '../walletCrypto'
import Task from 'data.task'

import Type from './Type'
import * as HDAccountList from './HDAccountList'
import * as HDAccount from './HDAccount'
import * as Derivation from './Derivation'

export const DEFAULT_DERIVATION = { type: 'segwitP2SH', purpose: 49 }

/* HDWallet :: {
  seed_hex :: String
  accounts :: [Account]
} */

export class HDWallet extends Type {}

export const isHDWallet = is(HDWallet)

export const seedHex = HDWallet.define('seedHex')
export const accounts = HDWallet.define('accounts')
export const defaultAccountIdx = HDWallet.define('default_account_idx')
export const mnemonicVerified = HDWallet.define('mnemonic_verified')

// Lens used to traverse all secrets for double encryption
export const secretsLens = compose(
  accounts,
  traversed,
  HDAccount.secretsLens
)

export const selectSeedHex = view(seedHex)
export const selectAccounts = view(accounts)
export const selectDefaultAccountIdx = view(defaultAccountIdx)
export const selectMnemonicVerified = compose(
  Boolean,
  view(mnemonicVerified)
)

export const selectAccount = curry((index, hdwallet) =>
  selectAccounts(hdwallet).get(index)
)

export const selectDefaultAccount = hdwallet =>
  selectAccount(selectDefaultAccountIdx(hdwallet), hdwallet)

export const selectContext = compose(
  HDAccountList.selectContext,
  selectAccounts
)

const shiftHDWallet = compose(
  shiftIProp('seed_hex', 'seedHex'),
  shift
)

export const fromJS = x => {
  if (is(HDWallet, x)) {
    return x
  }
  const hdwalletCons = compose(
    over(accounts, HDAccountList.fromJS),
    hdw => shiftHDWallet(hdw).forward()
  )
  return hdwalletCons(new HDWallet(x))
}

export const toJS = pipe(
  HDWallet.guard,
  hd => {
    const hdwalletDecons = compose(
      hdw => shiftHDWallet(hdw).back(),
      over(accounts, HDAccountList.toJS)
    )
    return hdwalletDecons(hd).toJS()
  }
)

export const reviver = jsObject => {
  return new HDWallet(jsObject)
}

const deriveAccountNodeAtIndex = (seedHex, purpose, index, network) => {
  let seed = BIP39.mnemonicToSeed(BIP39.entropyToMnemonic(seedHex))
  let masterNode = Bitcoin.HDNode.fromSeedBuffer(seed, network)
  return masterNode
    .deriveHardened(purpose)
    .deriveHardened(0)
    .deriveHardened(index)
}

export const generateAccount = curry(
  (type, purpose, index, label, network, seedHex) => {
    let node = deriveAccountNodeAtIndex(seedHex, purpose, index, network)
    let derivation = Derivation.js(type, purpose, node, null)
    return HDAccount.fromJS(HDAccount.js(label, derivation))
  }
)

export const generateDerivation = curry(
  (type, purpose, index, network, seedHex) => {
    let node = deriveAccountNodeAtIndex(seedHex, purpose, index, network)
    return Derivation.fromJS(Derivation.js(type, purpose, node, null))
  }
)

// encrypt :: Number -> String -> String -> HDWallet -> Task Error HDWallet
export const encrypt = curry((iterations, sharedKey, password, hdWallet) => {
  const cipher = crypto.encryptSecPass(sharedKey, iterations, password)
  const traverseSeed = traverseOf(seedHex, Task.of, cipher)
  const traverseAccounts = traverseOf(secretsLens, Task.of, cipher)
  return Task.of(hdWallet)
    .chain(traverseSeed)
    .chain(traverseAccounts)
})

// decrypt :: Number -> String -> String -> HDWallet -> Task Error HDWallet
export const decrypt = curry((iterations, sharedKey, password, hdWallet) => {
  const cipher = crypto.decryptSecPass(sharedKey, iterations, password)
  const traverseSeed = traverseOf(seedHex, Task.of, cipher)
  const traverseAccounts = traverseOf(secretsLens, Task.of, cipher)
  return Task.of(hdWallet)
    .chain(traverseSeed)
    .chain(traverseAccounts)
})

export const createNew = mnemonic =>
  fromJS({
    seed_hex: mnemonic ? BIP39.mnemonicToEntropy(mnemonic) : '',
    passphrase: '',
    mnemonic_verified: false,
    default_account_idx: 0,
    accounts: []
  })

export const js = (label, mnemonic, xpub, nAccounts, network) => {
  const { type, purpose } = DEFAULT_DERIVATION

  const seed = mnemonic ? BIP39.mnemonicToSeed(mnemonic) : ''
  const seedHex = mnemonic ? BIP39.mnemonicToEntropy(mnemonic) : ''

  const masterNode = mnemonic
    ? Bitcoin.HDNode.fromSeedBuffer(seed, network)
    : undefined

  const parentNode = mnemonic
    ? masterNode.deriveHardened(purpose).deriveHardened(0)
    : undefined

  const createAccountAtIndex = i => {
    const node = mnemonic ? parentNode.deriveHardened(i) : undefined
    const derivation = Derivation.js(type, purpose, node, xpub)
    return HDAccount.js(`${label}${i > 0 ? ` ${i + 1}` : ''}`, derivation)
  }

  return {
    seed_hex: seedHex,
    passphrase: '',
    mnemonic_verified: false,
    default_account_idx: 0,
    accounts: map(createAccountAtIndex, range(0, nAccounts))
  }
}
