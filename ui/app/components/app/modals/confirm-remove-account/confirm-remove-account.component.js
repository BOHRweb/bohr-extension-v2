import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../modal';
import { addressSummary, shortenAddress } from '../../../../helpers/utils/util';
import Identicon from '../../../ui/identicon';
import getAccountLink from '../../../../../lib/account-link';
import {addressEncode} from "../../../../../mixins/mixin";

export default class ConfirmRemoveAccount extends Component {
  static propTypes = {
    hideModal: PropTypes.func.isRequired,
    removeAccount: PropTypes.func.isRequired,
    identity: PropTypes.object.isRequired,
    chainId: PropTypes.string.isRequired,
    rpcPrefs: PropTypes.object.isRequired,
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  handleRemove = () => {
    this.props
      .removeAccount(this.props.identity.address)
      .then(() => this.props.hideModal());
  };

  handleCancel = () => {
    this.props.hideModal();
  };

  renderSelectedAccount() {
    const { identity } = this.props;
    return (
      <div className="confirm-remove-account__account">
        <div className="confirm-remove-account__account__identicon">
          <Identicon address={identity.address} diameter={32} />
        </div>
        <div className="confirm-remove-account__account__name">
          <span className="confirm-remove-account__account__label">Name</span>
          <span className="account_value">{identity.name}</span>
        </div>
        <div className="confirm-remove-account__account__address">
          <span className="confirm-remove-account__account__label">
            Public Address
          </span>
          <span className="account_value">
            {shortenAddress(addressEncode(identity.address))}
          </span>
        </div>
        <div className="confirm-remove-account__account__link">
          <a
            className=""
            href={getAccountLink(
              identity.address,
              this.props.chainId,
              this.props.rpcPrefs,
            )}
            target="_blank"
            rel="noopener noreferrer"
            title={this.context.t('bohrView')}
          >
            <img
              src="images/popout.svg"
              alt={this.context.t('bohrView')}
            />
          </a>
        </div>
      </div>
    );
  }

  render() {
    const { t } = this.context;

    return (
      <Modal
        headerText={`${t('removeAccount')}?`}
        onClose={this.handleCancel}
        onSubmit={this.handleRemove}
        onCancel={this.handleCancel}
        submitText={t('remove')}
        cancelText={t('nevermind')}
        submitType="secondary"
      >
        <div>
          {this.renderSelectedAccount()}
          <div className="confirm-remove-account__description">
            {t('removeAccountDescription')}
          </div>
        </div>
      </Modal>
    );
  }
}
