import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ClientGuard } from "../security/client-guard";
import { ConnectDto } from "../../commands/user/connect-dto";
import { TokenDto } from "../security/token-dto";
import { ConnectCommand } from "../../commands/user/connect-command";
import { UserTokenIssuer } from "../security/user-token-issuer";

@Controller("user")
export class UserController {
    constructor(
        private readonly _commandBus: CommandBus,
        private readonly _tokenIssuer: UserTokenIssuer
    ) {}

    @Post("connect")
    @UseGuards(ClientGuard)
    async connect(@Body() connectBody: ConnectDto): Promise<TokenDto> {
        const userId: string = await this._commandBus.execute(new ConnectCommand(connectBody));
        return this._tokenIssuer.issueFromId(userId);
    }
}
