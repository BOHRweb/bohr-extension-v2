import classnames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
import AssetListItem from '../asset-list-item';
import { getSelectedAddress } from '../../../selectors';
import { useI18nContext } from '../../../hooks/useI18nContext';
import { useTokenFiatAmount } from '../../../hooks/useTokenFiatAmount';

export default function TokenCell({
  address,
  decimals,
  balanceError,
  symbol,
  string,
  image,
  onClick,
}) {
  const userAddress = useSelector(getSelectedAddress);
  const t = useI18nContext();

  const formattedFiat = useTokenFiatAmount(address, string, symbol);

  const warning = balanceError ? (
    <span>
      {t('troubleTokenBalances')}
      <a
        href={`https://ethplorer.io/address/${userAddress}`}
        rel="noopener noreferrer"
        target="_blank"
        onClick={(event) => event.stopPropagation()}
        style={{ color: '#F7861C' }}
      >
        {t('here')}
      </a>
    </span>
  ) : null;

  let tokenImg = '';
  if (!image) {
    if (address === '0x13cd83963e8f6a717b0c4b324cd4f88d6e5568f4') {
      tokenImg = 'images/logo/token/BO.png';
    } else if (address === '0xde3309f83bd9cf499c345718607359ffd0797c88') {
      tokenImg = 'images/logo/token/BrMarker.png';
    } else {
      tokenImg = 'images/logo/empty-brc.png';
    }
  }

  return (
    <AssetListItem
      className={classnames('token-cell', {
        'token-cell--outdated': Boolean(balanceError),
      })}
      iconClassName="token-cell__icon"
      onClick={onClick.bind(null, address)}
      tokenAddress={address}
      // tokenImage={image}
      tokenImage={tokenImg}
      tokenSymbol={symbol}
      tokenDecimals={decimals}
      warning={warning}
      primary={`${string || 0}`}
      secondary={formattedFiat}
    />
  );
}

TokenCell.propTypes = {
  address: PropTypes.string,
  balanceError: PropTypes.object,
  symbol: PropTypes.string,
  decimals: PropTypes.number,
  string: PropTypes.string,
  image: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

TokenCell.defaultProps = {
  balanceError: null,
};
