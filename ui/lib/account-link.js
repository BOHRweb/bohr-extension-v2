import { createAccountLinkForChain } from '@metamask/etherscan-link';
import { addressEncode } from '../mixins/mixin';
export default function getAccountLink(address, chainId, rpcPrefs) {
  // if (rpcPrefs && rpcPrefs.blockExplorerUrl) {
  //   return `${rpcPrefs.blockExplorerUrl.replace(
  //     /\/+$/u,
  //     '',
  //   )}/address/${address}`;
  // }
  //
  // return createAccountLinkForChain(address, chainId);

  // https://explorer.bohrweb.org/#/address/detail?address=BfQS1LFyPMH5dvxwQEQbHoUjmNH6muCaz9b
  address = addressEncode(address);
  return "https://explorer.bohrweb.org/#/address/detail?address=" + address
}
