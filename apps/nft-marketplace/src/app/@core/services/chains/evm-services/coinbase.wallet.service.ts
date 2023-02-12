import { Injectable } from "@angular/core";
import { ChainsModule } from "../chains.module";
import { EvmService } from "./evm.service";
import { ContractFactory } from "@swan/contracts";
import { SupportedWallets } from "@swan/dto";

@Injectable({
    providedIn: ChainsModule
})
export class CoinBaseWalletService extends EvmService {
    private _walletType = SupportedWallets.COINBASE;

    constructor(contractFactory: ContractFactory) {
        super(contractFactory);
    }

    public override async getEthersProvider() {
        if (!this.wallet || this.wallet !== this._walletType) {
            this.wallet = this._walletType;
            this._externalProvider = await (window as any).ethereum.providers.find((x: any) => x.isCoinbaseWallet);
        }

        return super.getEthersProvider();
    }
}
