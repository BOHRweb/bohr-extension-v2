import React, {useCallback, useState} from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { createTokenTrackerLinkForChain } from '@metamask/etherscan-link';

import TransactionList from '../../../components/app/transaction-list';
import { TokenOverview } from '../../../components/app/wallet-overview';
import {
  getCurrentChainId,
  getSelectedIdentity,
} from '../../../selectors/selectors';
import { DEFAULT_ROUTE } from '../../../helpers/constants/routes';
import { showModal } from '../../../store/actions';

import AssetNavigation from './asset-navigation';
import TokenOptions from './token-options';
import { useI18nContext } from '../../../hooks/useI18nContext';

export default function TokenAsset({ token }) {
  const dispatch = useDispatch();
  const chainId = useSelector(getCurrentChainId);
  const selectedIdentity = useSelector(getSelectedIdentity);
  const selectedAccountName = selectedIdentity.name;
  const selectedAddress = selectedIdentity.address;
  const history = useHistory();
  const t = useI18nContext();
  const [isTransactionRecord, setIsTransactionRecord] = useState(false);

  // const switchList = useCallback(
  //   () => setIsTransactionRecord(!isTransactionRecord),
  //   [],
  // );

  const switchList = () => {
    setIsTransactionRecord(!isTransactionRecord);
    console.log('isTransactionRecord', isTransactionRecord);
  };

  return (
    <>
      <AssetNavigation
        accountName={selectedAccountName}
        assetName={token.symbol}
        onBack={() => history.push(DEFAULT_ROUTE)}
        optionsButton={
          <TokenOptions
            onRemove={() =>
              dispatch(showModal({ name: 'HIDE_TOKEN_CONFIRMATION', token }))
            }
            onViewEtherscan={() => {
              const url = createTokenTrackerLinkForChain(
                token.address,
                chainId,
                selectedAddress,
              );
              global.platform.openTab({ url });
            }}
            tokenSymbol={token.symbol}
          />
        }
      />
      <TokenOverview className="asset__overview" token={token} />
      <div className="transaction-list__header" style={{ padding: '8px 16px', textAlign: 'end'}} onClick={switchList}>
        {isTransactionRecord ? t('activity') : t('transactionRecord')}
      </div>
      {isTransactionRecord ? (
        null
      ) : (
        <TransactionList tokenAddress={token.address} />
      )}
    </>
  );
}

TokenAsset.propTypes = {
  token: PropTypes.shape({
    address: PropTypes.string.isRequired,
    decimals: PropTypes.number,
    symbol: PropTypes.string,
  }).isRequired,
};
