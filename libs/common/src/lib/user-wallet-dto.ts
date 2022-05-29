export class UserWalletDto {
    userId: string;
    walletId: string;
    userWalletId: string;
    address: string;
    blockchainId: string;

    constructor(userId: string, walletId: string, userWalletId: string) {
        this.userId = userId;
        this.walletId = walletId;
        this.userWalletId = userWalletId;
    }
}
