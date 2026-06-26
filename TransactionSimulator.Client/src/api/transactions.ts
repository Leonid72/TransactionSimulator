import client from './client';
import type { ApiResponse, Transaction, SubmitRequest } from '../types';

export const getApprovedTransactions = () =>
  client.get<ApiResponse<Transaction[]>>('/transactions/approved');

export const submitTransaction = (payload: SubmitRequest) =>
  client.post<ApiResponse<Transaction>>('/transactions/submit', payload);
