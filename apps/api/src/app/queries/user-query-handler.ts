import { Injectable } from "@nestjs/common";
import { UserDto, UserWalletDto, WalletDto } from "@swan/dto";
import { UserWalletViewRepository } from "../views/user-wallet/user-wallet-view-repository";
import { WalletRepository } from "../support/blockchains/wallet-repository";

@Injectable()
export class UserQueryHandler {
    constructor(private _userWalletRepository: UserWalletViewRepository, private _walletRepository: WalletRepository) {}

    async getUserWallets(userId: string): Promise<Array<UserWalletDto>> {
        const [views, wallets] = await Promise.all([
            this._userWalletRepository.findByUserId(userId),
            this._walletRepository.findAll()
        ]);

        return views.map((view) => {
            const walletMatch = wallets.find((supportedWallet) => supportedWallet.id === view.walletId);

            const walletDto = new WalletDto(view.walletId, walletMatch.name, view.blockchainId);
            return new UserWalletDto(view.userId, view.id, view.address, walletDto);
        });
    }

    async getUser(userId: string): Promise<UserDto> {
        const [views, wallets] = await Promise.all([
            this._userWalletRepository.findByUserId(userId),
            this._walletRepository.findAll()
        ]);

        const walletDtos = views
            .filter((view) => wallets.some((w) => w.id === view.walletId))
            .map((view) => {
                const walletMatch = wallets.find((supportedWallet) => supportedWallet.id === view.walletId);

                const walletDto = new WalletDto(view.walletId, walletMatch.name, view.blockchainId);
                return new UserWalletDto(view.userId, view.id, view.address, walletDto);
            });

        return new UserDto(userId, walletDtos);
    }
}
