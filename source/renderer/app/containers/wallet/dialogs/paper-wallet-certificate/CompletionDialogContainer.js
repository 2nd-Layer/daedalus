// @flow
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import CompletionDialog from '../../../../components/wallet/paper-wallet-certificate/CompletionDialog';
import type { InjectedDialogContainerProps } from '../../../../types/injectedPropsType';

type Props = InjectedDialogContainerProps;

@inject('stores') @observer
export default class CompletionDialogContainer extends Component<Props> {
  static defaultProps = { actions: null, stores: null, children: null, onClose: () => {} };

  render() {
    const { walletCertificateAddress } = this.props.stores.ada.wallets;

    return (
      <CompletionDialog
        walletCertificateAddress={walletCertificateAddress}
        onClose={this.props.onClose}
      />
    );
  }
}
