export interface IDeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
  qr_data: any;
}

export interface IDevicePollingStatus {
  status: string;
  message?: string;
  user_code: string;
  expires_in: number;
}

export interface IQrSession {
  session_id: string;
  public_key: string;
  expires_in: number;
}

export interface ILoginSession extends IDeviceCodeResponse, IQrSession {}
