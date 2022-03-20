import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ClientGuard } from "../../security/guards/client-guard";
import { StartSignatureAuthenticationCommand } from "../../commands/authentication/start-signature-authentication-command";
import { CompleteSignatureAuthenticationCommand } from "../../commands/authentication/complete-signature-authentication-command";
import {
    CompleteAuthenticationDto,
    NonceDto,
    StartSignatureAuthenticationDto,
    TokenDto
} from "@nft-marketplace/common";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";

@Controller("user")
export class UserController {
    constructor(private readonly _commandBus: CommandBus) {}

    @ApiOperation({ summary: "Starts the signature authentication process for a user by generating a nonce" })
    @ApiOkResponse({
        description: "The generated nonce",
        type: NonceDto
    })
    @Post("start-signature-authentication")
    @UseGuards(ClientGuard)
    async startAuthentication(@Body() body: StartSignatureAuthenticationDto): Promise<NonceDto> {
        return this._commandBus.execute(new StartSignatureAuthenticationCommand(body));
    }

    @ApiOperation({ summary: "Completes the authentication process for a user and returns user token" })
    @ApiOkResponse({
        description: "The token information for the user",
        type: TokenDto
    })
    @Post("complete-authentication")
    @UseGuards(ClientGuard)
    async completeAuthentication(@Body() body: CompleteAuthenticationDto): Promise<TokenDto> {
        return this._commandBus.execute(new CompleteSignatureAuthenticationCommand(body));
    }
}
