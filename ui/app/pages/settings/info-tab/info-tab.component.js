import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../components/ui/button';

export default class InfoTab extends PureComponent {
  state = {
    version: global.platform.getVersion(),
  };

  static contextTypes = {
    t: PropTypes.func,
  };

  renderInfoLinks() {
    const { t } = this.context;

    return (
      <div className="settings-page__content-item settings-page__content-item--without-height">
        <div className="info-tab__link-header">{t('links')}</div>
        <div className="info-tab__link-item">
          <Button
            type="link"
            href="https://bohrweb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="info-tab__link-text"
          >
            BOHR Official website
          </Button>
        </div>
        <div className="info-tab__link-item">
          <Button
            type="link"
            href="https://explorer.bohrweb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="info-tab__link-text"
          >
            Blockchain Explorer
          </Button>
        </div>
        <div className="info-tab__link-item">
          <Button
            type="link"
            href="https://github.com/BOHRweb"
            target="_blank"
            rel="noopener noreferrer"
            className="info-tab__link-text"
          >
            Github
          </Button>
        </div>
        <hr className="info-tab__separator" />
        <div className="info-tab__link-item">
          <Button
            type="link"
            href="https://twitter.com/BOHRweb"
            target="_blank"
            rel="noopener noreferrer"
            className="info-tab__link-text"
          >
            Twitter
          </Button>
        </div>
        <div className="info-tab__link-item">
          <Button
            type="link"
            href="https://t.me/bohrwebc"
            target="_blank"
            rel="noopener noreferrer"
            className="info-tab__link-text"
          >
            Telegram
          </Button>
        </div>
        <div className="info-tab__link-item">
          <Button
            type="link"
            href="https://bohrweb.medium.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="info-tab__link-text"
          >
            Medium
          </Button>
        </div>
      </div>
    );
  }

  render() {
    const { t } = this.context;

    return (
      <div className="settings-page__body">
        <div className="settings-page__content-row">
          <div className="settings-page__content-item-logo  settings-page__content-item--without-height">
            <div className="info-tab__logo-wrapper">
              <img src="images/logo/bohr.png" className="info-tab__logo" alt="" />
            </div>
            <div className="info-tab__item">
              <div className="info-tab__version-header">
                {t('bohrVersion')}
              </div>
              <div className="info-tab__version-number">
                {this.state.version}
              </div>
            </div>
          </div>
          {this.renderInfoLinks()}
        </div>
      </div>
    );
  }
}
