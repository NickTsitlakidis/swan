import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ClientGuard } from "../security/guards/client-guard";
import { StartSignatureAuthenticationCommand } from "../commands/user/start-signature-authentication-command";
import { CompleteSignatureAuthenticationCommand } from "../commands/user/complete-signature-authentication-command";
import {
    CompleteSignatureAuthenticationDto,
    NonceDto,
    StartSignatureAuthenticationDto,
    TokenDto,
    WalletDto
} from "@nft-marketplace/common";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { UserGuard } from "../security/guards/user-guard";
import { RequestUserId } from "../security/request-user-id";
import { CompleteWalletAdditionCommand } from "../commands/user/complete-wallet-addition-command";

@Controller("user")
export class UserController {
    constructor(private readonly _commandBus: CommandBus) {}

    @ApiOperation({ summary: "Starts the signature authentication process for a user by generating a nonce" })
    @ApiOkResponse({ description: "The generated nonce", type: NonceDto })
    @Post("start-signature-authentication")
    @UseGuards(ClientGuard)
    startAuthentication(@Body() body: StartSignatureAuthenticationDto): Promise<NonceDto> {
        return this._commandBus.execute(new StartSignatureAuthenticationCommand(body));
    }

    @ApiOperation({ summary: "Completes the authentication process for a user and returns user token" })
    @ApiOkResponse({ description: "The token information for the user", type: TokenDto })
    @Post("complete-signature-authentication")
    @UseGuards(ClientGuard)
    completeAuthentication(@Body() body: CompleteSignatureAuthenticationDto): Promise<TokenDto> {
        return this._commandBus.execute(new CompleteSignatureAuthenticationCommand(body));
    }

    @ApiOkResponse({ description: "The generated nonce", type: NonceDto })
    @Post("start-wallet-addition")
    @UseGuards(UserGuard)
    startWalletAddition(
        @RequestUserId() userId: string,
        @Body() body: StartSignatureAuthenticationDto
    ): Promise<NonceDto> {
        return this._commandBus.execute(new StartSignatureAuthenticationCommand(body, userId));
    }

    @ApiOkResponse({ description: "The added wallet", type: WalletDto })
    @Post("complete-wallet-addition")
    @UseGuards(UserGuard)
    completeWalletAddition(
        @RequestUserId() userId: string,
        @Body() body: CompleteSignatureAuthenticationDto
    ): Promise<WalletDto> {
        return this._commandBus.execute(new CompleteWalletAdditionCommand(body, userId));
    }
}