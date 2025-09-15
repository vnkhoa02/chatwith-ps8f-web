import { AUTH_CONFIG } from "@/config/auth";
import type {
  IDeviceCodeResponse,
  IDevicePollingStatus,
  IQrSession,
} from "@/types/login";
import { type KeyPair, signMessage } from "@/utils/ed25519";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";

class QrPairingService {
  private async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return Promise.resolve(null);
    }
  }

  private async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
      return Promise.resolve();
    } catch (e) {
      return Promise.resolve();
    }
  }

  /** Ensure X25519 keypair (nacl.box) exists and is persisted */
  async ensureX25519Keys() {
    const [pubB64, secB64] = await Promise.all([
      this.getItem(AUTH_CONFIG.STORAGE_KEYS.ED_PUB_KEY),
      this.getItem(AUTH_CONFIG.STORAGE_KEYS.ED_PRIV_KEY),
    ]);

    if (pubB64 && secB64) {
      return {
        publicKey: naclUtil.decodeBase64(pubB64),
        secretKey: naclUtil.decodeBase64(secB64),
        publicKeyBase64: pubB64,
      };
    }

    const kp = nacl.box.keyPair();
    const pubBase64 = naclUtil.encodeBase64(kp.publicKey);
    const secBase64 = naclUtil.encodeBase64(kp.secretKey);

    await Promise.all([
      this.setItem(AUTH_CONFIG.STORAGE_KEYS.ED_PUB_KEY, pubBase64),
      this.setItem(AUTH_CONFIG.STORAGE_KEYS.ED_PRIV_KEY, secBase64),
    ]);

    return {
      publicKey: kp.publicKey,
      secretKey: kp.secretKey,
      publicKeyBase64: pubBase64,
    };
  }

  /** Load stored Ed25519 keypair (used for signing approval). Throws if missing. */
  async loadEdKeyPair(): Promise<KeyPair> {
    const [privBase64, pubBase64] = await Promise.all([
      this.getItem(AUTH_CONFIG.STORAGE_KEYS.ED_PRIV_KEY),
      this.getItem(AUTH_CONFIG.STORAGE_KEYS.ED_PUB_KEY),
    ]);

    if (!privBase64 || !pubBase64) {
      throw new Error("Ed25519 key pair not found in storage.");
    }

    return {
      privateKey: naclUtil.decodeBase64(privBase64),
      publicKey: naclUtil.decodeBase64(pubBase64),
      privateKeyBase64: privBase64,
      publicKeyBase64: pubBase64,
    };
  }

  async getDeviceCode() {
    const { publicKeyBase64 } = await this.ensureX25519Keys();

    const params = new URLSearchParams();
    params.set("client_id", "p8-node-desktop");
    params.set("scope", "read write sync");
    if (publicKeyBase64) params.set("mobile_public_key", publicKeyBase64);

    const url = `${AUTH_CONFIG.BASE_URL.replace(/\/$/, "")}/oauth/device/code`;

    const respFetch = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!respFetch.ok) {
      const txt = await respFetch.text();
      throw new Error(
        `Device session creation failed ${respFetch.status}: ${txt}`,
      );
    }

    const resp = (await respFetch.json()) as IDeviceCodeResponse;
    return resp;
  }

  async createQRSession() {
    const url = `${AUTH_CONFIG.BASE_URL.replace(/\/$/, "")}/api/v1/device/qr/create`;
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: "p8-node-desktop",
          device_info: {
            name: "P8 Node Web",
            model: window?.navigator?.userAgent ?? "Unknown",
          },
        }),
      });
      const data = (await resp.json()) as IQrSession;
      if (resp.ok) return data;
    } catch (e) {
      console.error("Create QR session attempt failed", e);
    }
    throw new Error("Create QR session failed");
  }

  async checkDeviceToken(deviceCode: string) {
    const url = `${AUTH_CONFIG.BASE_URL.replace(/\/$/, "")}/api/v1/device/session/${deviceCode}/status`;
    try {
      const resp = await fetch(url);
      const data = (await resp.json()) as IDevicePollingStatus;
      if (resp.ok) return data;
    } catch (e) {
      console.error("checkDeviceToken failed", e);
    }
    throw new Error("Device authorization timed out");
  }

  async approve(userCode: string) {
    const authToken = await this.getItem(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    if (!authToken) {
      throw new Error("No auth token found. Please log in.");
    }

    const edKey = await this.loadEdKeyPair();
    const whatToSign = String(userCode);
    const signatureBase64 = await Promise.resolve(
      signMessage(whatToSign, edKey.privateKey),
    );

    const url = `${AUTH_CONFIG.BASE_URL.replace(/\/$/, "")}/oauth/device/approve`;
    const body = new URLSearchParams();
    body.set("device_code", userCode);
    body.set("signature", signatureBase64);

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${authToken}`,
      },
      body: body.toString(),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Approve failed ${resp.status}: ${txt}`);
    }

    return await resp.json();
  }
}

const qrPairingService = new QrPairingService();
export default qrPairingService;
