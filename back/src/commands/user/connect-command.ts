import { ConnectDto } from "./connect-dto";

export class ConnectCommand {
    walletAddress: string;

    constructor(dto: ConnectDto) {
        this.walletAddress = dto.walletAddress;
    }
}
