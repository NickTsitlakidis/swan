import * as solanaWeb3 from "@solana/web3.js";
import { SignedMessage } from "../interfaces/signedMessage";
import Wallet from "./wallet";

declare const window: Window &
  typeof globalThis & {
    solana: any;
  };

class PhantomWallet extends Wallet {
  constructor() {
    super();
  }

  async connect(): Promise<solanaWeb3.PublicKey> {
    const resp = await window.solana.connect();
    console.log(resp);
    return new solanaWeb3.PublicKey(resp.publicKey.toString());
  }

  disconnect(): void {
    window.solana.disconnect();
  }

  isInstalled(): Boolean {
    return window.solana && window.solana.isPhantom;
  }

  async signTransaction(
    tx: solanaWeb3.Transaction
  ): Promise<solanaWeb3.Transaction> {
    return await window.solana.signTransaction(tx);
  }

  async signMessage(msg: string): Promise<SignedMessage> {
    const encodedMsg = new TextEncoder().encode(msg);
    return await window.solana.signMessage(encodedMsg, "utf8");
  }
}

export default new PhantomWallet();
