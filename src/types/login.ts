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
  user_code: string;
  expires_in: number;
}
