import fs from 'fs';
import path from 'path';
import log from 'electron-log';
import moment from 'moment';
import ensureDirectoryExists from './ensureDirectoryExists';
import { pubLogsFolderPath, appLogsFolderPath, APP_NAME } from '../config';
import { getFileNameWithTimestamp } from '../../common/fileName';

const isTest = process.env.NODE_ENV === 'test';

export const setupLogging = () => {
  const logFilePath = path.join(pubLogsFolderPath, APP_NAME + '.log');
  ensureDirectoryExists(pubLogsFolderPath);

  log.transports.console.level = isTest ? 'error' : false;
  log.transports.rendererConsole.level = 'error';
  log.transports.file.level = 'debug';
  log.transports.file.maxSize = 20 * 1024 * 1024;
  log.transports.file.file = logFilePath;
  log.transports.file.format = (msg) => {
    const formattedDate = moment.utc(msg.date).format('YYYY-MM-DDTHH:mm:ss.0SSS');
    return `[${formattedDate}Z] [${msg.level}] ${msg.data}`;
  };

  // Removes existing compressed logs
  fs.readdir(appLogsFolderPath, (err, files) => {
    files
      .filter(getFileNameWithTimestamp())
      .forEach((logFileName) => {
        const logFile = path.join(appLogsFolderPath, logFileName);
        try {
          fs.unlinkSync(logFile);
        } catch (error) {
          console.error(`Compressed log file "${logFile}" deletion failed: ${error}`);
        }
      });
  });
};
