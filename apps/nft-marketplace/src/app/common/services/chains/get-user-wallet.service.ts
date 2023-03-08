import { Injectable } from "@angular/core";
import { BlockchainWalletDto, UserWalletDto } from "@swan/dto";
import { isNil } from "@nft-marketplace/utils";
import { when } from "mobx";
import { DialogService } from "primeng/dynamicdialog";
import { firstValueFrom } from "rxjs";
import { SelectWalletDialogComponent } from "../../components/select-wallet-dialog/select-wallet-dialog.component";
import { BlockchainWalletsStore } from "../../store/blockchain-wallets-store";
import { UserStore } from "../../store/user-store";

@Injectable()
export class GetUserWalletService {
    private userWallets: UserWalletDto[];
    private blockchains: { name: string; id: string }[];

    constructor(
        private _userStore: UserStore,
        private _dialogService: DialogService,
        private _blockchainWalletsStore: BlockchainWalletsStore
    ) {}

    public async findAvailableWallet(chainId: string): Promise<string> {
        await when(() => !this._userStore.userState.isLoading).then();
        if (!isNil(this._userStore.user)) {
            this.userWallets = this._userStore.user.wallets;
            this.blockchains = this._blockchainWalletsStore.blockchainWallets
                .map((chain) => {
                    return {
                        name: chain.blockchain.name,
                        id: chain.blockchain.id
                    };
                })
                .filter((chain) => this.userWallets.find((wal) => wal.wallet.blockchainId === chain.id));
        }
        let walletId: string | undefined;
        const userWallets = this.userWallets.filter((wallet) => wallet.wallet.blockchainId === chainId);
        console.log(this.userWallets, chainId);
        if (userWallets.length === 1) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: Object is possibly 'undefined'
            walletId = userWallets.at(0).wallet.id;
        } else if (userWallets.length > 1) {
            const allWallets = this._blockchainWalletsStore.blockchainWallets
                .filter((wal) => wal.blockchain.id === chainId)
                .filter((wal) => {
                    wal.wallets = wal.wallets.filter((w) =>
                        userWallets.find((userWallet) => userWallet.wallet.id === w.id)
                    );
                    return wal;
                });
            walletId = await this._getWallet(chainId, allWallets);
        }

        if (!walletId) {
            // TODO Handle
            return "";
        }

        return walletId;
    }

    private async _getWallet(chainId: string, wallets: BlockchainWalletDto[]): Promise<string | undefined> {
        const selectWalletsInput = wallets
            .filter((wallet) => wallet.blockchain.id === chainId)
            .flatMap((wallet) => wallet.wallets)
            .map((wallet) => {
                return {
                    img: `assets/images/${wallet.name}.png`,
                    title: wallet.name,
                    chain: this.blockchains.find((chain) => chain.id === wallet.blockchainId)?.name || ""
                };
            });
        const dialogRef = this._openDialog(selectWalletsInput);
        const walletName = await firstValueFrom(dialogRef.onClose);
        const wallet = wallets
            .filter((wallet) => wallet.blockchain.id === chainId)
            .flatMap((wallet) => wallet.wallets)
            .find((wallet) => wallet.name === walletName);
        return wallet?.id;
    }

    private _openDialog(wallets: { img: string; title: string; chain: string }[]) {
        return this._dialogService.open(SelectWalletDialogComponent, {
            width: "500px",
            data: {
                wallets
            }
        });
    }
}
