import * as solanaWeb3 from "@solana/web3.js";
import { SignedMessage } from "../interfaces/signedMessage";
import Wallet from "./wallet";

declare const window: Window &
  typeof globalThis & {
    solflare: any;
  };

class SolflareWallet extends Wallet {
  constructor() {
    super();
  }

  async connect(): Promise<solanaWeb3.PublicKey> {
    const resp = await window.solflare.connect();
    console.log(resp);
    return new solanaWeb3.PublicKey(window.solflare.publicKey.toString());
  }

  disconnect(): void {
    window.solflare.disconnect();
  }

  isInstalled(): Boolean {
    return window.solflare && window.solflare.isSolflare;
  }

  async signTransaction(
    tx: solanaWeb3.Transaction
  ): Promise<solanaWeb3.Transaction> {
    return await window.solflare.signTransaction(tx);
  }

  async signMessage(msg: string): Promise<SignedMessage> {
    const encodedMsg = new TextEncoder().encode(msg);
    return await window.solflare.signMessage(encodedMsg, "utf8");
  }
}

export default new SolflareWallet();
