import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SendRowWrapper from '../send-row-wrapper';
import Identicon from '../../../../components/ui/identicon/identicon.component';
import TokenBalance from '../../../../components/ui/token-balance';
import UserPreferencedCurrencyDisplay from '../../../../components/app/user-preferenced-currency-display';
import { ERC20, PRIMARY } from '../../../../helpers/constants/common';

export default class SendAssetRow extends Component {
  static propTypes = {
    tokens: PropTypes.arrayOf(
      PropTypes.shape({
        address: PropTypes.string,
        decimals: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        symbol: PropTypes.string,
      }),
    ).isRequired,
    accounts: PropTypes.object.isRequired,
    selectedAddress: PropTypes.string.isRequired,
    sendTokenAddress: PropTypes.string,
    setSendToken: PropTypes.func.isRequired,
    nativeCurrency: PropTypes.string,
    nativeCurrencyImage: PropTypes.string,
  };

  static contextTypes = {
    t: PropTypes.func,
    metricsEvent: PropTypes.func,
  };

  state = {
    isShowingDropdown: false,
  };

  openDropdown = () => this.setState({ isShowingDropdown: true });

  closeDropdown = () => this.setState({ isShowingDropdown: false });

  selectToken = (token) => {
    this.setState(
      {
        isShowingDropdown: false,
      },
      () => {
        this.context.metricsEvent({
          eventOpts: {
            category: 'Transactions',
            action: 'Send Screen',
            name: 'User clicks "Assets" dropdown',
          },
          customVariables: {
            assetSelected: token ? ERC20 : this.props.nativeCurrency,
          },
        });
        this.props.setSendToken(token);
      },
    );
  };

  render() {
    const { t } = this.context;

    return (
      <SendRowWrapper label={`${t('asset')}:`}>
        <div className="send-v2__asset-dropdown">
          {this.renderSendToken()}
          {this.props.tokens.length > 0 ? this.renderAssetDropdown() : null}
        </div>
      </SendRowWrapper>
    );
  }

  renderSendToken() {
    const { sendTokenAddress } = this.props;
    const token = this.props.tokens.find(
      ({ address }) => address === sendTokenAddress,
    );
    return (
      <div
        className="send-v2__asset-dropdown__input-wrapper"
        onClick={this.openDropdown}
      >
        {token ? this.renderAsset(token) : this.renderNativeCurrency()}
      </div>
    );
  }

  renderAssetDropdown() {
    return (
      this.state.isShowingDropdown && (
        <div>
          <div
            className="send-v2__asset-dropdown__close-area"
            onClick={this.closeDropdown}
          />
          <div className="send-v2__asset-dropdown__list">
            {this.renderNativeCurrency(true)}
            {this.props.tokens.map((token) => this.renderAsset(token, true))}
          </div>
        </div>
      )
    );
  }

  renderNativeCurrency(insideDropdown = false) {
    const { t } = this.context;
    const {
      accounts,
      selectedAddress,
      nativeCurrency,
      nativeCurrencyImage,
    } = this.props;

    const balanceValue = accounts[selectedAddress]
      ? accounts[selectedAddress].balance
      : '';

    return (
      <div
        className={
          this.props.tokens.length > 0
            ? 'send-v2__asset-dropdown__asset'
            : 'send-v2__asset-dropdown__single-asset'
        }
        onClick={() => this.selectToken()}
      >
        <div className="send-v2__asset-dropdown__asset-icon">
          <Identicon
            diameter={36}
            image={nativeCurrencyImage}
            address={nativeCurrency}
          />
        </div>
        <div className="send-v2__asset-dropdown__asset-data">
          <div className="send-v2__asset-dropdown__symbol">
            {nativeCurrency}
          </div>
          <div className="send-v2__asset-dropdown__name">
            <span className="send-v2__asset-dropdown__name__label">
              {`${t('balance')}:`}
            </span>
            <UserPreferencedCurrencyDisplay
              value={balanceValue}
              type={PRIMARY}
            />
          </div>
        </div>
        {!insideDropdown && this.props.tokens.length > 0 && (
          <i className="fa fa-caret-down fa-lg send-v2__asset-dropdown__caret" />
        )}
      </div>
    );
  }

  renderAsset(token, insideDropdown = false) {
    const { address, symbol } = token;
    const { t } = this.context;

    let tokenImg = '';
    if (address === '0x13cd83963e8f6a717b0c4b324cd4f88d6e5568f4') {
      tokenImg = 'images/logo/token/BO.png';
    } else if (address === '0xde3309f83bd9cf499c345718607359ffd0797c88') {
      tokenImg = 'images/logo/token/BrMarker.png';
    } else {
      tokenImg = 'images/logo/empty-brc.png';
    }

    return (
      <div
        key={address}
        className="send-v2__asset-dropdown__asset"
        onClick={() => this.selectToken(token)}
      >
        <div className="send-v2__asset-dropdown__asset-icon">
          <Identicon address={address} diameter={36} image={tokenImg} />
        </div>
        <div className="send-v2__asset-dropdown__asset-data">
          <div className="send-v2__asset-dropdown__symbol">{symbol}</div>
          <div className="send-v2__asset-dropdown__name">
            <span className="send-v2__asset-dropdown__name__label">
              {`${t('balance')}:`}
            </span>
            <TokenBalance token={token} />
          </div>
        </div>
        {!insideDropdown && (
          <i className="fa fa-caret-down fa-lg send-v2__asset-dropdown__caret" />
        )}
      </div>
    );
  }
}
