import ethAbi from "ethereumjs-abi";
import api from "../../api";
import ethUtil from 'ethereumjs-util';

const BN = require('ethjs').BN
const util = require('./util')
const web3Utils = require('web3-utils');

/**
 * Checks whether the given input and base will produce an invalid bn instance.
 *
 * bn.js requires extra validation to safely use, so this function allows
 * us to typecheck the params we pass to it.
 *
 * @see {@link https://github.com/indutny/bn.js/issues/151}
 * @param {any} input - the bn.js input
 * @param {number} base - the bn.js base argument
 * @returns {boolean}
 */
function _isInvalidBnInput (input, base) {
  return (
    typeof input === 'string' &&
    (
      input.startsWith('0x') ||
      Number.isNaN(parseInt(input, base))
    )
  )
}

class Token {

  constructor ({ address, symbol, balance, decimals, contract, owner } = {}) {
    if (!contract) {
      throw new Error('Missing requried \'contract\' parameter')
    } else if (!owner) {
      throw new Error('Missing requried \'owner\' parameter')
    }
    this.isLoading = !address || !symbol || !balance || !decimals
    this.address = address || '0x0'
    this.symbol  = symbol

    if (!balance) {
      balance = '0'
    } else if (_isInvalidBnInput(balance, 16)) {
      throw new Error('Invalid \'balance\' option provided; must be non-prefixed hex string if given as string')
    }

    if (decimals && _isInvalidBnInput(decimals, 10)) {
      throw new Error('Invalid \'decimals\' option provided; must be non-prefixed hex string if given as string')
    }

    this.balance = new BN(balance, 16)
    this.decimals = decimals ? new BN(decimals) : undefined
    this.owner = owner
    this.contract = contract
  }

  async update() {
    await Promise.all([
      this.symbol || this.updateSymbol(),
      this.updateBalance(),
      this.decimals || this.updateDecimals(),
    ])
    this.isLoading = false
    return this.serialize()
  }

  serialize() {
    return {
      address: this.address,
      symbol: this.symbol,
      balance: this.balance.toString(10),
      decimals: this.decimals ? parseInt(this.decimals.toString()) : 0,
      string: this.stringify(),
    }
  }

  stringify() {
    return util.stringifyBalance(this.balance, this.decimals || new BN(0))
  }

  async updateSymbol() {
    const symbol = await this.updateValue('symbol')
    this.symbol = symbol || 'TKN'
    return this.symbol
  }

  async updateBalance() {
    const balance = await this.updateValue('balance')
    this.balance = balance
    return this.balance
  }

  async updateDecimals() {
    if (this.decimals !== undefined) return this.decimals
    var decimals = await this.updateValue('decimals')
    if (decimals) {
      this.decimals = decimals
    }
    return this.decimals
  }

  async updateValue(key) {
    let methodName
    let args = []

    switch (key) {
      case 'balance':
        methodName = 'balanceOf'
        args = [ this.owner ]
        break
      default:
        methodName = key
    }

    const approveFun = web3Utils.sha3('balanceOf(address)').slice(0, 10)
    const myabi = ethAbi;
    const approveVallue = Array.prototype.map
      .call(
        myabi.rawEncode(
          ['address'],
          args,
        ),
        (x) => `00${x.toString(16)}`.slice(-2),
      )
      .join('');

    const funStr = approveFun.replace("0x", "")+approveVallue.replace("0x", "");

    const paramObj = {
      to:this.contract.address,
      data:funStr
    }
    let result = {"0":"0","balance":"0"};
    const dataResult = await api.walletLocalCall(paramObj);
    if(dataResult.success){
      const ba = new BN(ethUtil.stripHexPrefix(dataResult.result.returnData), 16)
      result[0] = ba
    }

    if (result) {
      const val = result[0]
      this[key] = val
      return val
    }

    return this[key]
  }

}

module.exports = Token
