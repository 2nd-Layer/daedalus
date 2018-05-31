import React, { Component } from 'react';
import { Provider, observer } from 'mobx-react';
import { observable, runInAction } from 'mobx';
import { action } from '@storybook/addon-actions';
import BigNumber from 'bignumber.js';
import moment from 'moment';

// Assets and helpers
import walletsIcon from '../../../source/renderer/app/assets/images/sidebar/wallet-ic.inline.svg';
// import settingsIcon from
// '../../../source/renderer/app/assets/images/sidebar/settings-ic.inline.svg';
import adaIcon from '../../../source/renderer/app/assets/images/sidebar/ada-redemption-ic.inline.svg';
import paperCertificateIcon from '../../../source/renderer/app/assets/images/sidebar/paper-certificate-ic.inline.svg';

import actions from '../../../source/renderer/app/actions';
import { assuranceModeOptions } from '../../../source/renderer/app/types/transactionAssuranceTypes.js';

type Props = {
  children: Node,
  activeWallet?: ?{}
};

const WALLETS = [
  {
    id: '0',
    name: 'With Password',
    amount: new BigNumber(0),
    assurance: assuranceModeOptions.NORMAL,
    hasPassword: true,
    passwordUpdateDate: moment().subtract(1, 'month').toDate(),
  },
  {
    id: '1',
    name: 'No Password',
    amount: new BigNumber(66.998),
    assurance: assuranceModeOptions.NORMAL,
    hasPassword: false,
    passwordUpdateDate: new Date(),
  }
];

const SIDEBAR_WALLETS = [
  { id: WALLETS[0].id, title: WALLETS[0].name, info: `${WALLETS[0].amount} ADA`, isConnected: true },
  { id: WALLETS[1].id, title: WALLETS[1].name, info: `${WALLETS[1].amount} ADA`, isConnected: true },
];

const sidebarCategories = [
  {
    name: 'WALLETS',
    route: '/wallets',
    icon: walletsIcon,
  },
  // {
  //   name: 'SETTINGS',
  //   route: '/settings',
  //   icon: settingsIcon,
  // },
  {
    name: 'ADA_REDEMPTION',
    route: '/ada-redemption',
    icon: adaIcon,
  },
  {
    name: 'PAPER_WALLET',
    route: '/paper-wallet-create-certificate',
    icon: paperCertificateIcon,
  }
];

@observer
export default class StoryProvider extends Component<Props> {

  @observable sidebarMenus = {
    wallets: {
      items: SIDEBAR_WALLETS,
      activeWalletId: '1',
      actions: {
        onAddWallet: action('toggleAddWallet'),
        onWalletItemClick: (walletId: string) => {
          runInAction(() => this.sidebarMenus.wallets.activeWalletId = walletId);
        }
      }
    }
  };

  selectWallet = () => {
    runInAction((walletId: string) => this.sidebarMenus.wallets.activeWalletId = walletId);
  };

  getStoriesProps = () => ({
    wallets: WALLETS,
    sidebarWallets: SIDEBAR_WALLETS,
    activeWalletId: this.sidebarMenus.wallets.activeWalletId,
    sidebarMenus: this.sidebarMenus,
    sidebarCategories
  });

  render() {

    const stores = {
      ada: {
        wallets: {
          active: WALLETS[this.sidebarMenus.wallets.activeWalletId],
          sendMoney: () => {},
          sendMoneyRequest: {
            isExecuting: false,
            reset: () => {}
          }
        }
      }
    };

    return (
      <Provider stores={stores} actions={actions} storiesProps={this.getStoriesProps()}>
        {this.props.children}
      </Provider>
    );
  }

}