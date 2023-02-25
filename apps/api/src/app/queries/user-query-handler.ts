import { Injectable } from "@nestjs/common";
import { UserDto, UserWalletDto, WalletDto } from "@swan/dto";
import { UserWalletViewRepository } from "../views/user-wallet/user-wallet-view-repository";
import { WalletRepository } from "../support/blockchains/wallet-repository";
import { Wallet } from "../support/blockchains/wallet";

@Injectable()
export class UserQueryHandler {
    constructor(private _userWalletRepository: UserWalletViewRepository, private _walletRepository: WalletRepository) {}

    async getUser(userId: string): Promise<UserDto> {
        const [userWallets, supportedWallets] = await Promise.all([
            this._userWalletRepository.findByUserId(userId),
            this._walletRepository.findAll()
        ]);

        const walletDtos: Array<UserWalletDto> = userWallets
            .filter((userWallet) =>
                supportedWallets.some((supportedWallet) => supportedWallet.id === userWallet.walletId)
            )
            .map((userWallet) => {
                const walletMatch = supportedWallets.find(
                    (supportedWallet) => supportedWallet.id === userWallet.walletId
                ) as Wallet;
                const walletDto = new WalletDto(userWallet.walletId, walletMatch.name, userWallet.blockchainId);
                return new UserWalletDto(userWallet.userId, userWallet.id, userWallet.address, walletDto);
            });

        return new UserDto(userId, walletDtos);
    }
}
