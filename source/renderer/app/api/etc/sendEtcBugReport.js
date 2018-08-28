// @flow
import moment from 'moment';
import url from 'url';
import { request } from '../lib/reportRequest';
import environment from '../../../../common/environment';

export type BugReportFormData = {
  email: string,
  subject: string,
  problem: string,
  compressedLogsFile: string,
}

export type SendEtcBugReportRequestParams = {
  requestFormData: BugReportFormData,
  application: string,
};

export const sendEtcBugReport = (
  { requestFormData, application }: SendEtcBugReportRequestParams
) => {
  const { email, subject, problem, compressedLogsFile } = requestFormData;
  const { version, os, buildNumber, REPORT_URL } = environment;
  const reportUrl = url.parse(REPORT_URL);
  const { hostname, port } = reportUrl;

  return request({
    hostname,
    method: 'POST',
    path: '/report',
    port,
  }, {
    application,
    version,
    build: buildNumber,
    os,
    compressedLogsFile,
    date: moment().format('YYYY-MM-DDTHH:mm:ss'),
    magic: 2000000000,
    type: {
      type: 'customreport',
      email,
      subject,
      problem,
    }
  });
};
