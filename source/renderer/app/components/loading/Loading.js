// @flow
import * as React from 'react';
import SVGInline from 'react-svg-inline';
import { observer } from 'mobx-react';
import { defineMessages, intlShape } from 'react-intl';
import classNames from 'classnames';
import { Button } from 'react-polymorph/lib/components/Button';
import { ButtonSkin } from 'react-polymorph/lib/skins/simple/ButtonSkin';

import LoadingSpinner from '../widgets/LoadingSpinner';
import daedalusLogo from '../../assets/images/daedalus-logo-loading-grey.inline.svg';
import type { ReactIntlMessage } from '../../types/i18nTypes';
import environment from '../../../../common/environment';
import { REPORT_ISSUE_TIME_TRIGGER } from '../../config/timingConfig';

import styles from './Loading.scss';

let connectingInterval = null;
let syncingInterval = null;

const messages = defineMessages({
  connecting: {
    id: 'loading.screen.connectingToNetworkMessage',
    defaultMessage: '!!!Connecting to network',
    description: 'Message "Connecting to network" on the loading screen.',
  },
  waitingForSyncToStart: {
    id: 'loading.screen.waitingForSyncToStart',
    defaultMessage: '!!!Connected - waiting for block syncing to start',
    description: 'Message "Connected - waiting for block syncing to start" on the loading screen.',
  },
  reconnecting: {
    id: 'loading.screen.reconnectingToNetworkMessage',
    defaultMessage: '!!!Network connection lost - reconnecting',
    description: 'Message "Network connection lost - reconnecting" on the loading screen.',
  },
  syncing: {
    id: 'loading.screen.syncingBlocksMessage',
    defaultMessage: '!!!Syncing blocks',
    description: 'Message "Syncing blocks" on the loading screen.',
  },
  reportConnectingIssueText: {
    id: 'loading.screen.reportIssue.connecting.text',
    defaultMessage: '!!!Having trouble connecting to network?',
    description: 'Report connecting issue text on the loading screen.',
  },
  reportSyncingIssueText: {
    id: 'loading.screen.reportIssue.syncing.text',
    defaultMessage: '!!!Having trouble syncing?',
    description: 'Report syncing issue text on the loading screen.',
  },
  reportIssueButtonLabel: {
    id: 'loading.screen.reportIssue.buttonLabel',
    defaultMessage: '!!!Report an issue',
    description: 'Report an issue button label on the loading .',
  },
});

type State = {
  connectingTime: number,
  syncingTime: number,
  syncPercentage: string,
};

type Props = {
  currencyIcon: string,
  apiIcon: string,
  isConnecting: boolean,
  hasBeenConnected: boolean,
  hasBlockSyncingStarted: boolean,
  isSyncing: boolean,
  isSynced: boolean,
  syncPercentage: number,
  loadingDataForNextScreenMessage: ReactIntlMessage,
  hasLoadedCurrentLocale: boolean,
  hasLoadedCurrentTheme: boolean,
  handleReportIssue: Function,
};

@observer
export default class Loading extends React.Component<Props, State> {
  state = {
    connectingTime: 0,
    syncingTime: 0,
    syncPercentage: '0',
  };

  componentWillReceiveProps(nextProps: Props) {
    const startConnectingTimer = nextProps.isConnecting && connectingInterval === null;
    const stopConnectingTimer = this.props.isConnecting && !nextProps.isConnecting && connectingInterval !== null;

    if (startConnectingTimer) {
      connectingInterval = setInterval(this.connectingTimer, 1000);
    } else if (stopConnectingTimer) {
      this.resetConnectingTimer();
    }

    const startSyncingTimer = nextProps.isSyncing && syncingInterval === null;
    const stopSyncingTimer = this.props.isSyncing && !nextProps.isSyncing && syncingInterval !== null;

    if (startSyncingTimer) {
      syncingInterval = setInterval(this.syncingTimer, 1000);
    } else if (stopSyncingTimer) {
      this.resetSyncingTimer();
    }
  }

  componentWillUnmount() {
    this.resetConnectingTimer();
    this.resetSyncingTimer();
  }

  static contextTypes = {
    intl: intlShape.isRequired,
  };

  render() {
    const { intl } = this.context;
    const {
      currencyIcon,
      apiIcon,
      isConnecting,
      isSyncing,
      hasLoadedCurrentLocale,
      hasLoadedCurrentTheme,
      handleReportIssue,
    } = this.props;

    const { connectingTime, syncingTime } = this.state;

    const componentStyles = classNames([
      styles.component,
      hasLoadedCurrentTheme ? null : styles['is-loading-theme'],
      isConnecting ? styles['is-connecting'] : null,
      isSyncing ? styles['is-syncing'] : null,
    ]);
    const daedalusLogoStyles = classNames([
      styles.daedalusLogo,
      isConnecting ? styles.connectingLogo : styles.syncingLogo,
    ]);
    const currencyLogoStyles = classNames([
      styles[`${environment.API}-logo`],
      isConnecting ? styles.connectingLogo : styles.syncingLogo,
    ]);
    const apiLogoStyles = classNames([
      styles[`${environment.API}-apiLogo`],
      isConnecting ? styles.connectingLogo : styles.syncingLogo,
    ]);

    const daedalusLoadingLogo = daedalusLogo;
    const currencyLoadingLogo = currencyIcon;
    const apiLoadingLogo = apiIcon;

    const canReportConnectingIssue = isConnecting && connectingTime >= REPORT_ISSUE_TIME_TRIGGER;
    const canReportSyncingIssue = isSyncing && syncingTime >= REPORT_ISSUE_TIME_TRIGGER;
    const showReportIssue = canReportConnectingIssue || canReportSyncingIssue;

    const buttonClasses = classNames(['primary', styles.reportIssueButton]);

    const loadingScreen = this._getLoadingScreen();

    return (
      <div className={componentStyles}>
        {showReportIssue && (
          <div className={styles.reportIssue}>
            <h1 className={styles.reportIssueText}>
              {isConnecting
                ? intl.formatMessage(messages.reportConnectingIssueText)
                : intl.formatMessage(messages.reportSyncingIssueText)}
            </h1>
            <Button
              className={buttonClasses}
              label={intl.formatMessage(messages.reportIssueButtonLabel)}
              onClick={handleReportIssue}
              skin={ButtonSkin}
            />
          </div>
        )}
        <div className={styles.logos}>
          <SVGInline svg={currencyLoadingLogo} className={currencyLogoStyles} />
          <SVGInline svg={daedalusLoadingLogo} className={daedalusLogoStyles} />
          <SVGInline svg={apiLoadingLogo} className={apiLogoStyles} />
        </div>
        {hasLoadedCurrentLocale ? loadingScreen : null}
      </div>
    );
  }

  connectingTimer = () => {
    this.setState(state => ({ connectingTime: state.connectingTime + 1 }));
  };

  resetConnectingTimer = () => {
    if (connectingInterval !== null) {
      clearInterval(connectingInterval);
      connectingInterval = null;
    }
    this.setState({ connectingTime: 0 });
  };

  syncingTimer = () => {
    const syncPercentage = this.props.syncPercentage.toFixed(2);
    if (syncPercentage === this.state.syncPercentage) {
      // syncPercentage not increased, increase syncing time
      this.setState(state => ({ syncingTime: state.syncingTime + 1 }));
    } else {
      // reset syncingTime and set new max percentage
      this.setState({ syncingTime: 0, syncPercentage });
    }
  };

  resetSyncingTimer = () => {
    if (syncingInterval !== null) {
      clearInterval(syncingInterval);
      syncingInterval = null;
    }
    this.setState({ syncingTime: 0 });
  };

  _getLoadingScreen(): React.Element<*> {
    const { intl } = this.context;
    const {
      isConnecting,
      isSynced,
      syncPercentage,
      loadingDataForNextScreenMessage,
      hasBeenConnected,
      hasBlockSyncingStarted,
    } = this.props;

    if (isConnecting) {
      const connectingMessage = this._getConnectingMessage(hasBeenConnected, hasBlockSyncingStarted);
      return (
        <div className={styles.connecting}>
          <h1 className={styles.headline}>{intl.formatMessage(connectingMessage)}</h1>
        </div>
      );
    } else if (!isSynced) {
      return (
        <div className={styles.syncing}>
          <h1 className={styles.headline}>
            {intl.formatMessage(messages.syncing)}
            {' '}
            {syncPercentage.toFixed(2)}
%
          </h1>
        </div>
      );
    }
    return (
      <div className={styles.syncing}>
        <div>
          <h1 className={styles.headline}>{intl.formatMessage(loadingDataForNextScreenMessage)}</h1>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  _getConnectingMessage(hasBeenConnected, hasBlockSyncingStarted) {
    if (hasBeenConnected) {
      return messages.reconnecting;
    } else if (hasBlockSyncingStarted) {
      return messages.waitingForSyncToStart;
    }
    return messages.connecting;
  }
}
