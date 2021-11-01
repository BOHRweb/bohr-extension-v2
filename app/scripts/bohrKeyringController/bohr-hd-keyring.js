//const { hdkey } = require('ethereumjs-wallet')
import hdkey from 'ethereumjs-wallet/hdkey';
import nacl from "tweetnacl";
import { Wallet,Key } from './bohr.es6.js';
// const hdkey = require('ethereumjs-wallet').default
const SimpleKeyring = require('./bohr-simple-keyring')
const bip39 = require('bip39')
const sigUtil = require('eth-sig-util')
const ethUtil = require('ethereumjs-util')

// Options:
const hdPathString = `m/44'/60'/0'/0`
const type = 'HD Key Tree'

class HdKeyring extends SimpleKeyring {

  /* PUBLIC METHODS */
  constructor (opts = {}) {
    super()
    this.type = type
    this.deserialize(opts)
  }

  serialize () {
    return Promise.resolve({
      mnemonic: this.mnemonic,
      numberOfAccounts: this.wallets.length,
      hdPath: this.hdPath,
    })
  }

  deserialize (opts = {}) {

    this.opts = opts || {}
    this.wallets = []
    this.mnemonic = null
    this.root = null
    this.hdPath = opts.hdPath || hdPathString

    if (opts.mnemonic) {
      this._initFromMnemonic(opts.mnemonic)
    }

    if (opts.numberOfAccounts) {
      return this.addAccounts(opts.numberOfAccounts)
    }

    return Promise.resolve([])
  }

  addAccounts (numberOfAccounts = 1) {
    if (!this.root) {
      this._initFromMnemonic(bip39.generateMnemonic())
    }

    /**
     * old
     * @type {number}
     *
       const oldLen = this.wallets.length
       const newWallets = []
       for (let i = oldLen; i < numberOfAccounts + oldLen; i++) {
        const child = this.root.deriveChild(i)
        const wallet = child.getWallet()
        newWallets.push(wallet)
        this.wallets.push(wallet)
      }
       const hexWallets = newWallets.map((w) => {
        return sigUtil.normalize(w.getAddress().toString('hex'))
      })
       return Promise.resolve(hexWallets)
     */

    const oldLen = this.wallets.length
    const newWallets = []
    for (let i = oldLen; i < numberOfAccounts + oldLen; i++) {
      // const child = this.root.deriveChild(i)
      // const wallet = child.getWallet()

      const stripped = ethUtil.stripHexPrefix(this.root)
      const buffer = Buffer.from(stripped, 'hex')

      const wallet = Wallet.fromPrivateKey(buffer)

      newWallets.push(wallet)
      this.wallets.push(wallet)
    }
    const hexWallets = newWallets.map((w) => {
      return sigUtil.normalize(w.getAddress().toString('hex'))
    })
    return Promise.resolve(hexWallets)

  }

  getAccounts () {
    return Promise.resolve(this.wallets.map((w) => {
      return sigUtil.normalize(w.getAddress().toString('hex'))
    }))
  }

  /* PRIVATE METHODS */

  _initFromMnemonic (mnemonic) {
    this.mnemonic = mnemonic
    // const seed = bip39.mnemonicToSeed(mnemonic)
    //
    // this.hdWallet = hdkey.fromMasterSeed(seed)
    // this.root = this.hdWallet.derivePath(this.hdPath)

    // String.prototype.normalize = function (from) {
    //   return this.toString()
    // }
    const mnemonicBuffer = Buffer.from((mnemonic || '').normalize('NFKD'), 'utf8');
    const seed = mnemonicBuffer.slice(0, 32);
    for (let i = 32; i < mnemonicBuffer.length; i++) {
      const ivalue = mnemonicBuffer[i];
      const nvalue = (seed[i % 32] + ivalue) % 128;
      seed[i % 32] = nvalue;
    }
    const keyPair = nacl.sign.keyPair.fromSeed(seed);
    const key = new Key(keyPair.publicKey, keyPair.secretKey, seed);

    this.hdWallet = key;
    this.root =  Buffer.from(key.getEncodedPrivateKey().buffer).toString("hex");
    // const privateKeyStr = Buffer.from(key.getEncodedPrivateKey().buffer).toString("hex");
    // console.log(privateKeyStr)
    // const address = key.toAddressHexString()
  }
}

HdKeyring.type = type
module.exports = HdKeyring
