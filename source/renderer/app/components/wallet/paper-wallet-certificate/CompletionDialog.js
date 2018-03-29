// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import QRCode from 'qrcode.react';
import classnames from 'classnames';
import { defineMessages, intlShape } from 'react-intl';
import Dialog from '../../widgets/Dialog';
import styles from './CompletionDialog.scss';

const shell = require('electron').shell;

const messages = defineMessages({
  headline: {
    id: 'paper.wallet.create.certificate.completion.dialog.headline',
    defaultMessage: '!!!Paper wallet certificate',
    description: 'Headline for the "Paper wallet create certificate completion dialog" headline.'
  },
  subtitle: {
    id: 'paper.wallet.create.certificate.completion.dialog.subtitle',
    defaultMessage: '!!!You may wish to fold your paper wallet certificate and glue together the edges to store it securely. Please keep your certificate safe.',
    description: 'Headline for the "Paper wallet create certificate completion dialog" subtitle.'
  },
  linkInstructions: {
    id: 'paper.wallet.create.certificate.completion.dialog.linkInstructions',
    defaultMessage: `!!!When you wish to import your wallet back into Daedalus crop any glued edges of the certificate to open it.
      To check your balance on the paper wallet at any time, you may use the link below. Copy or save the URL to your browser bookmarks to do this easily`,
    description: 'Headline for the "Paper wallet create certificate completion dialog" link instructions.'
  },
  addressInstructions: {
    id: 'paper.wallet.create.certificate.completion.dialog.addressInstructions',
    defaultMessage: '!!!To receive funds to your paper wallet simply share your wallet address with others.',
    description: 'Headline for the "Paper wallet create certificate completion dialog" address instructions.'
  },
  cardanoLinkLabel: {
    id: 'paper.wallet.create.certificate.completion.dialog.cardanoLinkLabel',
    defaultMessage: '!!!Cardano explorer link',
    description: '"Paper wallet create certificate completion dialog" cardano link label.'
  },
  addressLabel: {
    id: 'paper.wallet.create.certificate.completion.dialog.addressLabel',
    defaultMessage: '!!!Wallet address',
    description: '"Paper wallet create certificate completion dialog" wallet address label.'
  },

  finishButtonLabel: {
    id: 'paper.wallet.create.certificate.completion.dialog.finishButtonLabel',
    defaultMessage: '!!!Finish',
    description: '"Paper wallet create certificate completion dialog" finish button label.'
  },
});

type Props = {
  walletCertificateAddress: string,
  onFinish: Function,
};

@observer
export default class CompletionDialog extends Component<Props> {

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const { onFinish, walletCertificateAddress } = this.props;
    const dialogClasses = classnames([
      styles.component,
      'completionDialog',
    ]);

    const actions = [
      {
        className: 'finishButton',
        label: intl.formatMessage(messages.finishButtonLabel),
        primary: true,
        onClick: onFinish,
      }
    ];

    const cardanoExplorerLink = `https://cardanoexplorer.com/address/${walletCertificateAddress}`;

    // Get QRCode color value from active theme's CSS variable
    const qrCodeBackgroundColor = document.documentElement ?
      document.documentElement.style.getPropertyValue('--theme-receive-qr-code-background-color') : 'transparent';
    const qrCodeForegroundColor = document.documentElement ?
      document.documentElement.style.getPropertyValue('--theme-receive-qr-code-foreground-color') : '#000';

    return (
      <Dialog
        className={dialogClasses}
        title={intl.formatMessage(messages.headline)}
        actions={actions}
      >

        <div className={styles.completionContentWrapper}>
          <p className={styles.subtitle}>{intl.formatMessage(messages.subtitle)}</p>

          <div className={styles.linkInstructionsWrapper}>
            <p>{intl.formatMessage(messages.linkInstructions)}</p>

            <p className={styles.infoBoxLabel}>{intl.formatMessage(messages.cardanoLinkLabel)}</p>

            <div className={styles.infoBox}>
              <span
                className={styles.link}
                onClick={this.openCardanoExplorer.bind(this, cardanoExplorerLink)}
              >
                {cardanoExplorerLink}
              </span>
            </div>
          </div>

          <div className={styles.addressInstructionsWrapper}>
            <p>{intl.formatMessage(messages.addressInstructions)}</p>

            <p className={styles.infoBoxLabel}>{intl.formatMessage(messages.addressLabel)}</p>

            <div className={styles.infoBox}>
              {walletCertificateAddress}
            </div>
          </div>

          <div className={styles.qrCode}>
            <QRCode
              value={walletCertificateAddress}
              bgColor={qrCodeBackgroundColor}
              fgColor={qrCodeForegroundColor}
              size={160}
            />
          </div>

        </div>

      </Dialog>
    );
  }

  openCardanoExplorer = (link: string, e: Object) => {
    e.preventDefault();
    shell.openExternal(link);
  };
}
