import { Wallet } from "@heavy-duty/wallet-adapter";
import { SolanaWalletService } from "../services/chains/solana.wallet.service";

export interface BlockChains {
    chain: { title: string; imageUrl: string; service: SolanaWalletService };
    wallets: Wallet[];
}
