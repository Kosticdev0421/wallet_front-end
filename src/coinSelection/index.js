import { curry, unfold, last, filter, is,
         head, map, isNil, isEmpty, tail,
         clamp, sort, length } from 'ramda'
import memoize from 'fast-memoize'
import shuffle from 'fisher-yates'
import { List } from 'immutable-ext'
import seedrandom from 'seedrandom'

export const TX_EMPTY_SIZE = 4 + 1 + 1 + 4
export const TX_INPUT_BASE = 32 + 4 + 1 + 4
export const TX_INPUT_PUBKEYHASH = 106
export const TX_OUTPUT_BASE = 8 + 1
export const TX_OUTPUT_PUBKEYHASH = 25

export const inputBytes = input => TX_INPUT_BASE + (isNil(input.script) ? TX_INPUT_PUBKEYHASH : input.script.length)
export const outputBytes = output => TX_OUTPUT_BASE + (isNil(output.script) ? TX_OUTPUT_PUBKEYHASH : output.script.length)
export const dustThreshold = (feeRate) => (inputBytes({}) + outputBytes({})) * feeRate

export const transactionBytes = (inputs, outputs) =>
  TX_EMPTY_SIZE + inputs.reduce((a, c) => a + inputBytes(c), 0) + outputs.reduce((a, c) => a + outputBytes(c), 0)

export const Coin = (value, address, script, txHash, index, xpub, change, priv) =>
({
  value: value,
  script: script,
  txHash: txHash,
  index: index,
  address: address,
  xpub: xpub,
  change: change || false,
  priv: priv,
  isAccount: () => is(Object, xpub),
  equals: coin => value === coin.value,
  lte: coin => value <= coin.value,
  map: f => Coin(f(value)),
  concat: coin => Coin(value + coin.value)
  // inspect: () => `Coin(${value})`
})
Coin.empty = () => Coin(0)
Coin.fromUTXO = o => Coin(o.value, undefined, o.script, o.tx_hash_big_endian, o.tx_index, o.xpub)

export const effectiveValue = curry((feePerByte, coin) => clamp(0, Infinity, coin.value - feePerByte * inputBytes(coin)))
export const effectiveBalance = curry((feePerByte, inputs, outputs = [{}]) =>
  List(inputs).fold(Coin.empty()).map(v => clamp(0, Infinity, v - transactionBytes(inputs, outputs) * feePerByte))
)
// findTarget :: [Coin(x), ..., Coin(y)] -> Number -> [Coin(a), ..., Coin(b)] -> Selection
const ft = (targets, feePerByte, coins, changeAddress) => {
  const target = List(targets).fold(Coin.empty()).value
  const _findTarget = seed => {
    const acc = seed[0]
    const newCoin = head(seed[2])
    if (isNil(newCoin) || acc > target + seed[1]) { return false }
    const partialFee = seed[1] + inputBytes(newCoin) * feePerByte
    const restCoins = tail(seed[2])
    const nextAcc = acc + newCoin.value
    return acc > target + partialFee ? false : [[nextAcc, partialFee, newCoin], [nextAcc, partialFee, restCoins]]
  }
  const partialFee = transactionBytes([], targets) * feePerByte
  const effectiveCoins = filter(c => effectiveValue(feePerByte, c) > 0, coins)
  const selection = unfold(_findTarget, [0, partialFee, effectiveCoins])
  if (isEmpty(selection)) {
    // no coins to select
    return { fee: 0, inputs: [], outputs: [] }
  } else {
    const maxBalance = last(selection)[0]
    const fee = last(selection)[1]
    const selectedCoins = map(e => e[2], selection)
    if (maxBalance < target + fee) {
      // not enough money to satisfy target
      return { fee: fee, inputs: [], outputs: targets }
    } else {
      const extra = maxBalance - target - fee
      if (extra >= dustThreshold(feePerByte)) {
        // add change
        const change = Coin(extra, changeAddress, undefined, undefined, undefined, undefined, true)
        return { fee: fee, inputs: selectedCoins, outputs: [...targets, change] }
      } else {
        // burn change
        return { fee: fee + extra, inputs: selectedCoins, outputs: targets }
      }
    }
  }
}
export const findTarget = memoize(ft)

// singleRandomDraw :: Number -> [Coin(a), ..., Coin(b)] -> String -> Selection
export const selectAll = (feePerByte, coins, outAddress) => {
  const effectiveCoins = filter(c => effectiveValue(feePerByte, c) > 0, coins)
  const effBalance = effectiveBalance(feePerByte, effectiveCoins).value
  const Balance = List(effectiveCoins).fold(Coin.empty()).value
  const fee = Balance - effBalance
  return {
    fee: fee,
    inputs: effectiveCoins,
    outputs: [Coin(effBalance, outAddress)]
  }
}
// singleRandomDraw :: [Coin(x), ..., Coin(y)] -> Number -> [Coin(a), ..., Coin(b)] -> String -> Selection
export const singleRandomDraw = (targets, feePerByte, coins, changeAddress, seed) => {
  const rng = is(String, seed) ? seedrandom(seed) : undefined
  return findTarget(targets, feePerByte, shuffle(coins, rng), changeAddress)
}

// descentDraw :: [Coin(x), ..., Coin(y)] -> Number -> [Coin(a), ..., Coin(b)] -> Selection
export const descentDraw = (targets, feePerByte, coins, changeAddress) =>
  findTarget(targets, feePerByte, sort((a, b) => a.lte(b), coins), changeAddress)
// ascentDraw :: [Coin(x), ..., Coin(y)] -> Number -> [Coin(a), ..., Coin(b)] -> Selection
export const ascentDraw = (targets, feePerByte, coins, changeAddress) =>
  findTarget(targets, feePerByte, sort((a, b) => b.lte(a), coins), changeAddress)

// branchAndBound implementation of the coin selection algorithm
// from http://murch.one/wp-content/uploads/2016/11/erhardt2016coinselection.pdf
// presented by Mark Erhardt
// branchAndBound :: [Coin(x), ..., Coin(y)] -> Number -> [Coin(a), ..., Coin(b)] -> String -> Selection
const bnb = (targets, feePerByte, coins, changeAddress, seed) => {
  const rng = is(String, seed) ? seedrandom(seed) : undefined
  const sortedCoins = sort((a, b) => a.lte(b), coins)
  let bnbTries = 1000000
  const target = List(targets).fold(Coin.empty()).value
  const targetForMatch = target + transactionBytes([], targets) * feePerByte
  const matchRange = dustThreshold(feePerByte)

  const _branchAndBound = (depth, currentSelection, effValue) => {
    bnbTries = bnbTries - 1
    if (effValue > targetForMatch + matchRange) { // cut branch
      return []
    } else if (effValue >= targetForMatch) { // match
      return currentSelection
    } else if (bnbTries < 1) { // max tries reached
      return []
    } else if (depth >= length(sortedCoins)) { // end of branch
      return []
    } else if ((rng && rng()) || Math.random() > 0.5) { // explore include or exclude randomly
      const include = _branchAndBound(depth + 1, currentSelection.concat(sortedCoins[depth]), effValue + effectiveValue(feePerByte, sortedCoins[depth]))
      if (!isEmpty(include)) {
        return include
      } else {
        return _branchAndBound(depth + 1, currentSelection, effValue)
      }
    } else {
      const exclude = _branchAndBound(depth + 1, currentSelection, effValue)
      if (!isEmpty(exclude)) {
        return exclude
      } else {
        return _branchAndBound(depth + 1, currentSelection.concat(sortedCoins[depth]), effValue + effectiveValue(feePerByte, sortedCoins[depth]))
      }
    }
  }

  const bnbSelection = _branchAndBound(0, [], 0)
  if (isEmpty(bnbSelection)) {
    return singleRandomDraw(targets, feePerByte, sortedCoins, changeAddress, seed)
  } else {
    return {
      fee: List(bnbSelection).fold(Coin.empty()).value - target,
      inputs: bnbSelection,
      outputs: targets
    }
  }
}
export const branchAndBound = memoize(bnb)
