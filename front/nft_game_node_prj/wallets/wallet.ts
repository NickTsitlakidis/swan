import * as solanaWeb3 from "@solana/web3.js";
import { SignedMessage } from "../interfaces/signedMessage";

abstract class Wallet {
  constructor() {}

  abstract connect(): Promise<solanaWeb3.PublicKey>;

  abstract disconnect(): void;

  abstract isInstalled(): Boolean;

  abstract signTransaction(
    tx: solanaWeb3.Transaction
  ): Promise<solanaWeb3.Transaction>;

  abstract signMessage(msg: string): Promise<SignedMessage>;
}

export default Wallet;
