import { Wallet } from "@heavy-duty/wallet-adapter";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { MetaMaskAuthService } from "../services/chains/metamask.wallet.service";
import { SolanaWalletService } from "../services/chains/solana.wallet.service";

export interface BlockChains {
    chain: { title: string; imageUrl: string; service: SolanaWalletService | MetaMaskAuthService };
    wallets: Wallet[] | { adapter: { name: string; icon: string }; readyState: WalletReadyState }[];
}
