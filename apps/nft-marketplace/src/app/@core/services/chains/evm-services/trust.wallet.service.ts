import { Injectable } from "@angular/core";
import { ChainsModule } from "../chains.module";
import { EvmService } from "./evm.service";
import { ContractFactory } from "@swan/contracts";
import { SupportedWallets } from "@swan/dto";

@Injectable({
    providedIn: ChainsModule
})
export class TrustWalletService extends EvmService {
    private _walletType = SupportedWallets.TRUST;

    constructor(contractFactory: ContractFactory) {
        super(contractFactory);
    }

    public override async getEthersProvider() {
        if (!this.wallet || this.wallet !== this._walletType) {
            this.wallet = this._walletType;
            if ((window as any).ethereum.isTrust) {
                this._externalProvider = await (window as any).ethereum;
            } else {
                this._externalProvider = await (window as any).ethereum.providers?.find((x: any) => x.isTrust);
            }
        }
        return super.getEthersProvider();
    }
}
