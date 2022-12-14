import { UserWalletDto } from "./user-wallet-dto";
import { WalletDto } from "./wallet-dto";
import { Type } from "class-transformer";

export class UserDto {
    id: string;

    @Type(() => WalletDto)
    wallets: Array<UserWalletDto>;

    constructor(id: string, wallets: Array<UserWalletDto>) {
        this.id = id;
        this.wallets = wallets;
    }
}
