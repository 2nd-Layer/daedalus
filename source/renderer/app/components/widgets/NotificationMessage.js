// @flow
import * as React from 'react';
import SVGInline from 'react-svg-inline';
import classNames from 'classnames';

import styles from './NotificationMessage.scss';

type Props = {
  icon: string,
  show: boolean,
  children?: React.Node,
};

export default class NotificationMessage extends React.Component<Props> {

  render() {
    const { icon, show, children } = this.props;

    const notificationMessageStyles = classNames([
      styles.component,
      show ? styles.show : null,
    ]);

    return (
      <div className={notificationMessageStyles}>

        {icon && <SVGInline svg={icon} className={styles.icon} />}

        <div className={styles.message}>
          {children}
        </div>

      </div>
    );
  }

}
