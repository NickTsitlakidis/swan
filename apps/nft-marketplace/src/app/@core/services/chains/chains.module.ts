import { NgModule } from "@angular/core";
import { BinanceWalletService } from "./evm-services/binance.wallet";
import { CoinBaseWalletService } from "./evm-services/coinbase.wallet.service";
import { EvmService } from "./evm-services/evm.service";
import { MetamaskWalletService } from "./evm-services/metamask.wallet.service";
import { TrustWalletService } from "./evm-services/trust.wallet.service";
import { MetaplexService } from "./solana-services/metaplex.service";
import { PhantomWalletService } from "./solana-services/phantom.wallet.service";
import { SolflareWalletService } from "./solana-services/solflare.wallet.service";
import { WalletRegistryService } from "./wallet-registry.service";
import { HdWalletAdapterModule, WalletStore } from "@heavy-duty/wallet-adapter";

@NgModule({
    providers: [
        BinanceWalletService,
        CoinBaseWalletService,
        EvmService,
        MetamaskWalletService,
        TrustWalletService,
        MetaplexService,
        PhantomWalletService,
        SolflareWalletService,
        WalletStore,
        WalletRegistryService
    ],
    imports: [HdWalletAdapterModule.forRoot({ autoConnect: true })]
})
export class ChainsModule {}
