import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import Identicon from '../../../ui/identicon';
import { ellipsify } from '../../../../pages/send/send.utils';
import { addressEncode } from '../../../../../mixins/mixin';
import {
  getMetaMaskAccountsRaw
} from '../../../../selectors/selectors';

function addressesEqual(address1, address2) {
  return String(address1).toLowerCase() === String(address2).toLowerCase();
}

export default function RecipientGroup({
  label,
  items,
  onSelect,
  selectedAddress,
}) {
  const accounts = useSelector(getMetaMaskAccountsRaw);

  if (!items || !items.length) {
    return null;
  }

  const getTokenImg = (address) => {
    // eslint-disable-next-line no-param-reassign
    address = address.toLowerCase();
    let tokenImg = '';
    if (!accounts[address]) {
      if (address === '0x13cd83963e8f6a717b0c4b324cd4f88d6e5568f4') {
        tokenImg = 'images/logo/token/BO.png';
      } else if (address === '0xde3309f83bd9cf499c345718607359ffd0797c88') {
        tokenImg = 'images/logo/token/BrMarker.png';
      } else {
        tokenImg = 'images/logo/empty-brc.png';
      }
    }
    return tokenImg;
  };

  return (
    <div className="send__select-recipient-wrapper__group">
      {label && (
        <div className="send__select-recipient-wrapper__group-label">
          {label}
        </div>
      )}
      {items.map(({ address, name }) => (
        <div
          key={address}
          onClick={() => onSelect(address, name)}
          className={classnames({
            'send__select-recipient-wrapper__group-item': !addressesEqual(
              address,
              selectedAddress,
            ),
            'send__select-recipient-wrapper__group-item--selected': addressesEqual(
              address,
              selectedAddress,
            ),
          })}
        >
          <Identicon
            address={address}
            diameter={28}
            image={getTokenImg(address)}
          />
          <div className="send__select-recipient-wrapper__group-item__content">
            <div className="send__select-recipient-wrapper__group-item__title">
              {name || ellipsify(addressEncode(address))}
            </div>
            {name && (
              <div className="send__select-recipient-wrapper__group-item__subtitle">
                {ellipsify(addressEncode(address))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

RecipientGroup.propTypes = {
  label: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      address: PropTypes.string.isRequired,
      name: PropTypes.string,
    }),
  ),
  onSelect: PropTypes.func.isRequired,
  selectedAddress: PropTypes.string,
};
