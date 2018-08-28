// @flow
import hash from 'hash.js';
import faker from 'faker';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import WalletAddress from '../../../source/renderer/app/domains/WalletAddress';

import type {
  TransactionState,
  TransactionType,
} from '../../../source/renderer/app/domains/WalletTransaction';
import WalletTransaction, {
  transactionStates,
  transactionTypes,
} from '../../../source/renderer/app/domains/WalletTransaction';

export const generateHash = () => {
  const now = new Date().valueOf().toString();
  const random = Math.random().toString();
  return hash
    .sha512()
    .update(now + random)
    .digest('hex');
};

export const generateTransaction = (
  type: TransactionType,
  date: Date,
  amount: BigNumber,
  confirmations: number = 1,
  state: TransactionState = transactionStates.OK,
) =>
  new WalletTransaction({
    id: faker.random.uuid(),
    title: '',
    type,
    amount,
    date,
    state,
    description: '',
    numberOfConfirmations: confirmations,
    addresses: {
      from: [faker.random.uuid()],
      to: [faker.random.uuid()],
    },
  });

export const generateRandomTransaction = (index: number) =>
  generateTransaction(
    transactionTypes.INCOME,
    moment()
      .subtract(index, 'days')
      .toDate(),
    new BigNumber(faker.random.number(5)),
  );

export const generateAddress = (isUsed: boolean = false): WalletAddress => new WalletAddress({
  id: generateHash(),
  amount: new BigNumber(faker.random.number(5)),
  isUsed,
});

export const promise = <T>(returnValue: T): Promise<T> =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(returnValue);
    }, 2000);
  });
