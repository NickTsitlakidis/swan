import * as solanaWeb3 from "@solana/web3.js";

export interface SignedMessage {
  signature: string;
  publicKey: solanaWeb3.PublicKey;
}
