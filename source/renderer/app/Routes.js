// @flow
import React from 'react';
import { Route, IndexRedirect } from 'react-router';
import { ROUTES } from './routes-config';
import resolver from './utils/imports';
import environment from '../../common/environment';

// PAGES
// import StakingPage from './containers/staking/StakingPage';
import Root from './containers/Root';
import AdaRedemptionPage from './containers/wallet/AdaRedemptionPage';
import WalletAddPage from './containers/wallet/WalletAddPage';
import LanguageSelectionPage from './containers/profile/LanguageSelectionPage';
import Settings from './containers/settings/Settings';
import GeneralSettingsPage from './containers/settings/categories/GeneralSettingsPage';
import SupportSettingsPage from './containers/settings/categories/SupportSettingsPage';
import TermsOfUseSettingsPage from './containers/settings/categories/TermsOfUseSettingsPage';
import TermsOfUsePage from './containers/profile/TermsOfUsePage';
import DisplaySettingsPage from './containers/settings/categories/DisplaySettingsPage';
import PaperWalletCreateCertificatePage from './containers/wallet/PaperWalletCreateCertificatePage';

// Dynamic container loading - resolver loads file relative to '/app/' directory
const Wallet = resolver('containers/wallet/Wallet');
const WalletSummaryPage = resolver('containers/wallet/WalletSummaryPage');
const WalletSendPage = resolver('containers/wallet/WalletSendPage');
const WalletReceivePage = resolver('containers/wallet/WalletReceivePage');
const WalletTransactionsPage = resolver('containers/wallet/WalletTransactionsPage');
const WalletSettingsPage = resolver('containers/wallet/WalletSettingsPage');
const WalletTokensPage = resolver('tokens/pages/WalletTokensPage');

export const Routes = (
  <Route path={ROUTES.ROOT} component={Root}>
    <IndexRedirect to={ROUTES.WALLETS.ROOT} />
    <Route path={ROUTES.PROFILE.LANGUAGE_SELECTION} component={LanguageSelectionPage} />
    <Route path={ROUTES.PROFILE.TERMS_OF_USE} component={TermsOfUsePage} />
    {/* <Route path={ROUTES.STAKING} component={StakingPage} /> */}
    <Route path={ROUTES.ADA_REDEMPTION} component={AdaRedemptionPage} />
    <Route path={ROUTES.WALLETS.ADD} component={WalletAddPage} />
    <Route path={ROUTES.WALLETS.ROOT} component={Wallet}>
      <Route path={ROUTES.WALLETS.SUMMARY} component={WalletSummaryPage} />
      <Route path={ROUTES.WALLETS.TRANSACTIONS} component={WalletTransactionsPage} />
      <Route path={ROUTES.WALLETS.SEND} component={WalletSendPage} />
      <Route path={ROUTES.WALLETS.RECEIVE} component={WalletReceivePage} />
      <Route path={ROUTES.WALLETS.SETTINGS} component={WalletSettingsPage} />
      {(environment.isEtcApi() && environment.ENABLE_TOKENS_UI) && <Route path={ROUTES.WALLETS.TOKENS} component={WalletTokensPage} />}
    </Route>
    <Route path="/settings" component={Settings}>
      <IndexRedirect to="general" />
      <Route path="general" component={GeneralSettingsPage} />
      <Route path="terms-of-use" component={TermsOfUseSettingsPage} />
      <Route path="support" component={SupportSettingsPage} />
      <Route path="display" component={DisplaySettingsPage} />
    </Route>
    <Route
      path={ROUTES.PAPER_WALLET_CREATE_CERTIFICATE}
      component={PaperWalletCreateCertificatePage}
    />
  </Route>
);
