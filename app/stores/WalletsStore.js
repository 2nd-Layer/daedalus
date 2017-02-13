// @flow
import { observable, computed, action } from 'mobx';
import Store from './lib/Store';
import Wallet from '../domain/Wallet';
import { matchRoute } from '../lib/routing-helpers';
import CachedRequest from './lib/CachedRequest';
import Request from './lib/Request';
import environment from '../environment';

export default class WalletsStore extends Store {

  BASE_ROUTE = '/wallets';
  WALLET_REFRESH_INTERVAL = 5000;

  @observable walletsCache : Array<Wallet> = [];

  @observable walletsRequest = new CachedRequest(this.api, 'getWallets');
  @observable createWalletRequest = new Request(this.api, 'createWallet');
  @observable sendMoneyRequest = new Request(this.api, 'createTransaction');
  @observable getWalletRecoveryPhraseRequest = new Request(this.api, 'getWalletRecoveryPhrase');
  @observable restoreRequest = new Request(this.api, 'restoreWallet');
  // DIALOGUES
  @observable isAddWalletDialogOpen = false;
  @observable isCreateWalletDialogOpen = false;
  @observable isWalletRestoreDialogOpen = false;

  _newWalletDetails = null;

  constructor(...args) {
    super(...args);
    this.actions.createPersonalWallet.listen(this._createPersonalWallet);
    this.actions.sendMoney.listen(this._sendMoney);
    this.actions.toggleAddWallet.listen(this._toggleAddWallet);
    this.actions.toggleCreateWalletDialog.listen(this._toggleCreateWalletDialog);
    this.actions.toggleWalletRestore.listen(this._toggleWalletRestore);
    this.actions.finishWalletBackup.listen(this._finishWalletCreation);
    this.actions.restoreWallet.listen(this._restoreWallet);
    if (environment.CARDANO_API) {
      setInterval(this._refreshWalletsData, this.WALLET_REFRESH_INTERVAL);
    }
  }

  _createPersonalWallet = async (params) => {
    this._newWalletDetails = params;
    try {
      const recoveryPhrase = await this.getWalletRecoveryPhraseRequest.execute();
      this.actions.initiateWalletBackup({ recoveryPhrase });
    } catch (error) {
      throw error;
    }
  };

  _finishWalletCreation = async () => {
    this._newWalletDetails.mnemonic = this.stores.walletBackup.recoveryPhrase.join(' ');
    const wallet = await this.createWalletRequest.execute(this._newWalletDetails);
    await this.walletsRequest.patch(result => { result.push(wallet); });
    this.goToWalletRoute(wallet.id);
  };

  _sendMoney = async (transactionDetails) => {
    const wallet = this.active;
    await this.sendMoneyRequest.execute({
      ...transactionDetails,
      walletId: wallet.id,
      amount: parseFloat(transactionDetails.amount),
      sender: wallet.address,
      currency: wallet.currency,
    });
    this._refreshWalletsData();
    this.goToWalletRoute(wallet.id);
  };

  @computed get all() {
    return this.walletsCache;
  }

  @computed get active() {
    const currentRoute = this.stores.router.location.pathname;
    const match = matchRoute(`${this.BASE_ROUTE}/:id(*page)`, currentRoute);
    if (match) return this.walletsCache.find(w => w.id === match.id) || null;
    return null;
  }

  getWalletRoute(walletId: ?string, screen = 'home') {
    return `${this.BASE_ROUTE}/${walletId}/${screen}`;
  }

  isValidAddress(address: string) {
    return this.api.isValidAddress('ADA', address);
  }

  @action _refreshWalletsData = () => {
    if (this.stores.networkStatus.isCardanoConnected) {
      this.walletsRequest.invalidate({ immediately: true });
      this.walletsCache.replace(this.walletsRequest.execute().result || []);
      const walletIds = this.walletsCache.map((wallet: Wallet) => wallet.id);
      this.stores.transactions.transactionCache = walletIds.map(walletId => ({
        walletId,
        transactions: this.stores.transactions._getTransactionsForWallet(walletId)
      }));
      this.stores.transactions._refreshTransactionData();
    }
  };

  @action _toggleAddWallet = () => {
    this.isAddWalletDialogOpen = !this.isAddWalletDialogOpen;
  };

  @action _toggleCreateWalletDialog = () => {
    if (!this.isCreateWalletDialogOpen) {
      this.isAddWalletDialogOpen = false;
      this.isCreateWalletDialogOpen = true;
    } else {
      this.isCreateWalletDialogOpen = false;
    }
  };

  @action _toggleWalletRestore = () => {
    if (!this.isWalletRestoreDialogOpen) {
      this.isAddWalletDialogOpen = false;
      this.isWalletRestoreDialogOpen = true;
    } else {
      this.isWalletRestoreDialogOpen = false;
    }
  };

  @action _restoreWallet = async (params) => {
    const restoredWallet = await this.restoreRequest.execute(params);
    this._toggleWalletRestore();
    this._refreshWalletsData();
    this.goToWalletRoute(restoredWallet.id);
  };

  goToWalletRoute(walletId) {
    const route = this.getWalletRoute(walletId);
    this.actions.goToRoute({ route });
    // TODO: Make sidebar route dependent on the real route instead!! (this is just a hack)
    this.actions.changeSidebarRoute({ route });
  }

}
