import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ClientGuard } from "../../security/guards/client-guard";
import { TokenDto } from "../../security/token-dto";
import { StartAuthenticationDto } from "./start-authentication-dto";
import { NonceDto } from "../../commands/authentication/nonce-dto";
import { StartAuthenticationCommand } from "../../commands/authentication/start-authentication-command";
import { CompleteAuthenticationDto } from "./complete-authentication-dto";
import { CompleteAuthenticationCommand } from "../../commands/authentication/complete-authentication-command";

@Controller("user")
export class UserController {
    constructor(private readonly _commandBus: CommandBus) {}

    @Post("start-authentication")
    @UseGuards(ClientGuard)
    async startAuthentication(@Body() body: StartAuthenticationDto): Promise<NonceDto> {
        return this._commandBus.execute(new StartAuthenticationCommand(body.walletAddress));
    }

    @Post("complete-authentication")
    @UseGuards(ClientGuard)
    async completeAuthentication(@Body() body: CompleteAuthenticationDto): Promise<TokenDto> {
        return this._commandBus.execute(new CompleteAuthenticationCommand(body));
    }
}
