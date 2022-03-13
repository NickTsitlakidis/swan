import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ClientGuard } from "../../security/guards/client-guard";
import { StartAuthenticationCommand } from "../../commands/authentication/start-authentication-command";
import { CompleteAuthenticationCommand } from "../../commands/authentication/complete-authentication-command";
import { CompleteAuthenticationDto, NonceDto, StartAuthenticationDto, TokenDto } from "@nft-marketplace/common";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";

@Controller("user")
export class UserController {
    constructor(private readonly _commandBus: CommandBus) {}

    @ApiOperation({ summary: "Starts the authentication process for a user by generating a nonce" })
    @ApiOkResponse({
        description: "The generated nonce",
        type: NonceDto
    })
    @Post("start-authentication")
    @UseGuards(ClientGuard)
    async startAuthentication(@Body() body: StartAuthenticationDto): Promise<NonceDto> {
        return this._commandBus.execute(new StartAuthenticationCommand(body.walletAddress));
    }

    @ApiOperation({ summary: "Completes the authentication process for a user and returns user token" })
    @ApiOkResponse({
        description: "The token information for the user",
        type: TokenDto
    })
    @Post("complete-authentication")
    @UseGuards(ClientGuard)
    async completeAuthentication(@Body() body: CompleteAuthenticationDto): Promise<TokenDto> {
        return this._commandBus.execute(new CompleteAuthenticationCommand(body));
    }
}
