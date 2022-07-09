import { WalletDto } from "./wallet-dto";
import { Type } from "class-transformer";

export class UserWalletDto {
    userId: string;
    userWalletId: string;
    address: string;

    @Type(() => WalletDto)
    wallet: WalletDto;

    constructor(userId: string, userWalletId: string, address: string, wallet: WalletDto) {
        this.userId = userId;
        this.userWalletId = userWalletId;
        this.address = address;
        this.wallet = wallet;
    }
}
