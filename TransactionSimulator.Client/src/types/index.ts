export interface Transaction {
  id: string;
  cardHolder: string;
  currency: string;
  region: string;
  status: 'Approved' | 'Rejected';
  rejectionReason: string;
  localTime: string;
  submittedAtUtc: string;
}

export interface ApiResponse<T> {
  isSuccessful: boolean;
  data: T;
  message: string;
  traceId: string;
}

export interface AuthData {
  accessToken: string;
  expiresAtUtc: string;
  userId: string;
  email: string;
}

export interface SubmitRequest {
  region: string;
  hour: number;
  minute: number;
}
