// @flow
import { observable, action } from 'mobx';
import { findIndex } from 'lodash';

import WalletSettingsStore from '../WalletSettingsStore';
import Request from '../lib/LocalizedRequest';
import type { UpdateWalletPasswordResponse, UpdateWalletResponse } from '../../api/common';

export default class EtcWalletSettingsStore extends WalletSettingsStore {
  @observable
  updateWalletRequest: Request<UpdateWalletResponse> = new Request(this.api.etc.updateWallet);

  @observable
  updateWalletPasswordRequest: Request<UpdateWalletPasswordResponse> = new Request(this.api.etc.updateWalletPassword);

  setup() {
    const a = this.actions.etc.walletSettings;
    a.startEditingWalletField.listen(this.startEditingWalletField);
    a.stopEditingWalletField.listen(this.stopEditingWalletField);
    a.cancelEditingWalletField.listen(this.cancelEditingWalletField);
    a.updateWalletField.listen(this._updateWalletField);
    a.updateWalletPassword.listen(this._updateWalletPassword);
  }

  @action
  _updateWalletPassword = async ({
    walletId,
    oldPassword,
    newPassword,
  }: {
    walletId: string,
    oldPassword: ?string,
    newPassword: ?string,
  }) => {
    await this.updateWalletPasswordRequest.execute({ walletId, oldPassword, newPassword }).promise;
    this.actions.dialogs.closeActiveDialog.trigger();
    this.updateWalletPasswordRequest.reset();
    this.stores.etc.wallets.refreshWalletsData();
  };

  @action
  _updateWalletField = async ({ field, value }: { field: string, value: string }) => {
    const activeWallet = this.stores.etc.wallets.active;
    if (!activeWallet) return;
    const { id, name, amount, assurance, hasPassword, passwordUpdateDate } = activeWallet;
    const walletData = { id, name, amount, assurance, hasPassword, passwordUpdateDate };
    walletData[field] = value;
    const wallet = await this.updateWalletRequest.execute(walletData).promise;
    if (!wallet) return;
    await this.stores.etc.wallets.walletsRequest.patch(result => {
      const walletIndex = findIndex(result, { id });
      result[walletIndex] = wallet;
    });
    this.updateWalletRequest.reset();
    this.stores.etc.wallets.setActiveWallet({ walletId: id });
  };
}
