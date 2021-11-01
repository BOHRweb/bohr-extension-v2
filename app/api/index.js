import { fetch } from './fetch';

const BR_WALLET_URL = 'https://mainnetapi.bohrchain.com/v2.4.0/';
const BYR_EXPLORER_URL = 'https://explorer.bohrchain.com/api/';

const servicesApi = {
  walletAccount(params) {
    return fetch({
      url: 'account',
      method: 'get',
      params,
    });
  },
  /**
   * https://explorer.bohrchain.com/api/token/contract/query/bry
   *
   * @param params
   * @returns {Promise | Promise<unknown>}
   */
  tokenContractQuery(contractAddress, params) {
    return fetch({
      baseURL: BYR_EXPLORER_URL,
      url: `token/contract/query/${contractAddress}`,
      method: 'get',
      params,
    });
  },
  /**
   * https://mainnetapi.bohrchain.com/v2.4.0
   *
   * @param params
   * @returns {Promise | Promise<unknown>}
   */
  walletLocalCall(params) {
    return fetch({
      baseURL: BR_WALLET_URL,
      url: `local-call`,
      method: 'get',
      params,
    });
  },
  broadcastRawTransaction(params) {
    return fetch({
      baseURL: BR_WALLET_URL,
      url: `broadcast-raw-transaction`,
      method: 'get',
      params,
    });
  },
  account(params) {
    return fetch({
      baseURL: BR_WALLET_URL,
      url: `account`,
      method: 'get',
      params,
    });
  },
  /**
   * account Transactions
   *
   * @param params
   * @returns {Promise<unknown>}
   */
  accountTransactions(params) {
    return fetch({
      baseURL: BYR_EXPLORER_URL,
      url: `/transaction/page/other/${params.address}/${params.pageNumber}`,
      method: 'get',
      params,
    });
  },
  /**
   * token Transactions
   * https://explorer.bohrchain.com/api/token/transfer/record/queryn
   * ?walletAddress=0x6432f2edb3b3465a23b6e1f822e2fc38836e1edf
   * &pageSize=50
   * &pageNumber=1
   * &contractAddress=0x63dcc18f421d4752f18ea27761fa5ac8a90c7313
   * &walletType=BR
   *
   * @param params
   * @returns {Promise<unknown>}
   */
  tokenTransferRecordQuery(params) {
    return fetch({
      baseURL: BYR_EXPLORER_URL,
      url: '/token/transfer/record/queryn',
      method: 'get',
      params,
    });
  },
  transactionResult(params) {
    return fetch({
      baseURL: BR_WALLET_URL,
      url: `transaction-result`,
      method: "get",
      params
    });
  },
  blockNumber(params) {
    return fetch({
      baseURL: BR_WALLET_URL,
      url: `latest-block-number`,
      method: "get",
      params
    });
  },
  getBlockByNumber(params) {
    return fetch({
      baseURL: BR_WALLET_URL,
      url: `block-by-number`,
      method: "get",
      params
    });
  },
  checkApiUrl(params) {
    return fetch({
      baseURL: params.apiUrl,
      url: `latest-block-number`,
      method: "get",
      params:{}
    });
  },
};

export default servicesApi;
