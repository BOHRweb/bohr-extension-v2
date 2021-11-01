import ethUtil from 'ethereumjs-util';
import {Key, Network, Transaction as BohrTransaction, TransactionType, Wallet} from './bohr.es6.js';
import BigNumber from "bignumber.js";
import Long from "long";
import {TRANSACTION_TYPES} from "../../../shared/constants/transaction";


const { EventEmitter } = require('events')

const type = 'Simple Key Pair'
const sigUtil = require('eth-sig-util')

class SimpleKeyring extends EventEmitter {
  constructor (opts) {
    super()
    this.type = type
    this.wallets = []
    this.deserialize(opts)
  }

  serialize () {
    return Promise.resolve(this.wallets.map((w) => w.getPrivateKey().toString('hex')))
  }

  deserialize (privateKeys = []) {

    return new Promise((resolve, reject) => {
      try {

        this.wallets = privateKeys.map((privateKey) => {
          const stripped = ethUtil.stripHexPrefix(privateKey)
          const buffer = Buffer.from(stripped, 'hex')

          const wallet = Wallet.fromPrivateKey(buffer)
          return wallet
        })
      } catch (e) {
        reject(e)
      }
      resolve()
    })
  }

  addAccounts (n = 1) {
    const newWallets = []
    for (let i = 0; i < n; i++) {
      newWallets.push(Wallet.generate())
    }
    this.wallets = this.wallets.concat(newWallets)
    const hexWallets = newWallets.map((w) => ethUtil.bufferToHex(w.getAddress()))
    return Promise.resolve(hexWallets)
  }

  getAccounts () {
    return Promise.resolve(this.wallets.map((w) => ethUtil.bufferToHex(w.getAddress())))
  }

  // tx is an instance of the ethereumjs-transaction class.
  signTransaction (address, tx, opts = {}) {

    const txJSON = tx.toJSON();
    const amount = tx.value.length === 0 ?  new BigNumber(0) : new BigNumber(txJSON[4]);

    const txObj = {};
    try {
      txObj.network = Network.MAINNET;
      try {

        txObj.to = ethUtil.toBuffer(txJSON[3]);

      } catch (e) {
        console.log(JSON.stringify(e) + "to")
      }

      // else if (data && !to) {
      //     result = TRANSACTION_TYPES.DEPLOY_CONTRACT;
      //   }

      if(tx.data.length>0 && tx.to.length == 0){
        txObj.to = ethUtil.toBuffer("0x0000000000000000000000000000000000000000");
        txObj.value = Long.fromString("0");
        txObj.type =  TransactionType.CREATE;
        txObj.fee = Long.fromString("0");
        txObj.gas = Long.fromNumber(Number(txJSON[2])*2);
        txObj.gasPrice = Long.fromString("1");
      }else if( tx.value.length === 0 ){
        txObj.value = Long.fromString("0");
        txObj.type =  TransactionType.CALL;
        txObj.fee = Long.fromString("0");
        txObj.gas = Long.fromString("60000");
        txObj.gasPrice = Long.fromString("10");

      } else {
        txObj.value = Long.fromString(amount.divToInt(1e9).toString());
        txObj.type = TransactionType.TRANSFER;
        txObj.fee = Long.fromString("100000");
        txObj.gas = Long.fromString("0");
        txObj.gasPrice = Long.fromString("0");
      }

      txObj.nonce = Long.fromNumber(Number(txJSON[0]));
      txObj.timestamp =  Long.fromString(`${(new Date()).getTime()}`);
      txObj.data = tx.data.length === 0 ? [] : ethUtil.toBuffer(txJSON[5]);
    } catch (e) {
      console.log("" + JSON.stringify(e));
    }

    const privKey = this.getPrivateKeyFor(address, opts)

    try {
      txObj.key = Key.importEncodedPrivateKey(privKey);
    } catch (e) {
      console.log("" + e);
    }

    var txBohr = new BohrTransaction(
      txObj.network,
      txObj.type,
      txObj.to,
      txObj.value,
      txObj.fee,
      txObj.gas,
      txObj.gasPrice,
      txObj.nonce,
      txObj.timestamp,
      txObj.data,
    );
    try {
      const txNew = txBohr.sign(txObj.key);
      const resultStr = Buffer.from(txNew.toBytes().buffer).toString('hex')
      const signedTx = Object.assign(tx, {rawStr:resultStr});
      // Newer versions of Ethereumjs-tx are immutable and return a new tx object
      return Promise.resolve(signedTx === undefined ? tx : signedTx)

    } catch (e) {
      console.log("" + JSON.stringify(e));
    }

  }

  // For eth_sign, we need to sign arbitrary data:
  signMessage (address, data, opts = {}) {
    const message = ethUtil.stripHexPrefix(data)
    const privKey = this.getPrivateKeyFor(address, opts)
    const msgSig = ethUtil.ecsign(Buffer.from(message, 'hex'), privKey)
    const rawMsgSig = sigUtil.concatSig(msgSig.v, msgSig.r, msgSig.s)
    return Promise.resolve(rawMsgSig)
  }

  // For eth_sign, we need to sign transactions:
  newGethSignMessage (withAccount, msgHex, opts = {}) {
    const privKey = this.getPrivateKeyFor(withAccount, opts)
    const msgBuffer = ethUtil.toBuffer(msgHex)
    const msgHash = ethUtil.hashPersonalMessage(msgBuffer)
    const msgSig = ethUtil.ecsign(msgHash, privKey)
    const rawMsgSig = sigUtil.concatSig(msgSig.v, msgSig.r, msgSig.s)
    return Promise.resolve(rawMsgSig)
  }

  // For personal_sign, we need to prefix the message:
  signPersonalMessage (address, msgHex, opts = {}) {
    const privKey = this.getPrivateKeyFor(address, opts)
    const privKeyBuffer = Buffer.from(privKey, 'hex')
    const sig = sigUtil.personalSign(privKeyBuffer, { data: msgHex })
    return Promise.resolve(sig)
  }

  // For eth_decryptMessage:
  decryptMessage (withAccount, encryptedData) {
    const wallet = this._getWalletForAccount(withAccount)
    const privKey = ethUtil.stripHexPrefix(wallet.getPrivateKey())
    const sig = sigUtil.decrypt(encryptedData, privKey)
    return Promise.resolve(sig)
  }

  // personal_signTypedData, signs data along with the schema
  signTypedData (withAccount, typedData, opts = { version: 'V1' }) {
    switch (opts.version) {
      case 'V1':
        return this.signTypedData_v1(withAccount, typedData, opts)
      case 'V3':
        return this.signTypedData_v3(withAccount, typedData, opts)
      case 'V4':
        return this.signTypedData_v4(withAccount, typedData, opts)
      default:
        return this.signTypedData_v1(withAccount, typedData, opts)
    }
  }

  // personal_signTypedData, signs data along with the schema
  signTypedData_v1 (withAccount, typedData, opts = {}) {
    const privKey = this.getPrivateKeyFor(withAccount, opts)
    const sig = sigUtil.signTypedDataLegacy(privKey, { data: typedData })
    return Promise.resolve(sig)
  }

  // personal_signTypedData, signs data along with the schema
  signTypedData_v3 (withAccount, typedData, opts = {}) {
    const privKey = this.getPrivateKeyFor(withAccount, opts)
    const sig = sigUtil.signTypedData(privKey, { data: typedData })
    return Promise.resolve(sig)
  }

  // personal_signTypedData, signs data along with the schema
  signTypedData_v4 (withAccount, typedData, opts = {}) {
    const privKey = this.getPrivateKeyFor(withAccount, opts)
    const sig = sigUtil.signTypedData_v4(privKey, { data: typedData })
    return Promise.resolve(sig)
  }

  // get public key for nacl
  getEncryptionPublicKey (withAccount, opts = {}) {
    const privKey = this.getPrivateKeyFor(withAccount, opts)
    const publicKey = sigUtil.getEncryptionPublicKey(privKey)
    return Promise.resolve(publicKey)
  }

  getPrivateKeyFor (address, opts = {}) {
    if (!address) {
      throw new Error('Must specify address.')
    }
    const wallet = this._getWalletForAccount(address, opts)
    const privKey = ethUtil.toBuffer(wallet.getPrivateKey())
    return privKey
  }

  // returns an address specific to an app
  getAppKeyAddress (address, origin) {
    if (
      !origin ||
      typeof origin !== 'string'
    ) {
      throw new Error(`'origin' must be a non-empty string`)
    }
    return new Promise((resolve, reject) => {
      try {
        const wallet = this._getWalletForAccount(address, {
          withAppKeyOrigin: origin,
        })
        const appKeyAddress = sigUtil.normalize(wallet.getAddress().toString('hex'))
        return resolve(appKeyAddress)
      } catch (e) {
        return reject(e)
      }
    })
  }

  // exportAccount should return a hex-encoded private key:
  exportAccount (address, opts = {}) {
    const wallet = this._getWalletForAccount(address, opts)
    return Promise.resolve(wallet.getPrivateKey().toString('hex'))
  }

  removeAccount (address) {
    if (!this.wallets.map((w) => ethUtil.bufferToHex(w.getAddress()).toLowerCase()).includes(address.toLowerCase())) {
      throw new Error(`Address ${address} not found in this keyring`)
    }
    this.wallets = this.wallets.filter((w) => ethUtil.bufferToHex(w.getAddress()).toLowerCase() !== address.toLowerCase())
  }

  /**
   * @private
   */
  _getWalletForAccount (account, opts = {}) {
    const address = sigUtil.normalize(account)
    let wallet = this.wallets.find((w) => ethUtil.bufferToHex(w.getAddress()) === address)
    if (!wallet) {
      throw new Error('Simple Keyring - Unable to find matching address.')
    }

    if (opts.withAppKeyOrigin) {
      const privKey = wallet.getPrivateKey()
      const appKeyOriginBuffer = Buffer.from(opts.withAppKeyOrigin, 'utf8')
      const appKeyBuffer = Buffer.concat([privKey, appKeyOriginBuffer])
      debugger
      const appKeyPrivKey = ethUtil.keccak(appKeyBuffer, 256)
      wallet = Wallet.fromPrivateKey(appKeyPrivKey)
    }

    return wallet
  }

}

SimpleKeyring.type = type
module.exports = SimpleKeyring
