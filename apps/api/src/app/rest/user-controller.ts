import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ClientGuard } from "../security/guards/client-guard";
import { StartSignatureAuthenticationCommand } from "../commands/user/start-signature-authentication-command";
import { CompleteSignatureAuthenticationCommand } from "../commands/user/complete-signature-authentication-command";
import {
    CompleteSignatureAuthenticationDto,
    EntityDto,
    NonceDto,
    RefreshTokenDto,
    StartSignatureAuthenticationDto,
    TokenDto,
    UserWalletDto
} from "@swan/dto";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { UserGuard } from "../security/guards/user-guard";
import { RequestUserId } from "../security/request-user-id";
import { CompleteWalletAdditionCommand } from "../commands/user/complete-wallet-addition-command";
import { UserTokenIssuer } from "../security/user-token-issuer";
import { UserQueryHandler } from "../queries/user-query-handler";

@Controller("user")
export class UserController {
    constructor(
        private readonly _commandBus: CommandBus,
        private readonly _userQueryHandler: UserQueryHandler,
        private readonly _tokenIssuer: UserTokenIssuer
    ) {}

    @ApiOperation({ summary: "Starts the signature authentication process for a user by generating a nonce" })
    @ApiOkResponse({ description: "The generated nonce", type: NonceDto })
    @Post("start-signature-authentication")
    @UseGuards(ClientGuard)
    startAuthentication(@Body() body: StartSignatureAuthenticationDto): Promise<NonceDto> {
        return this._commandBus.execute(StartSignatureAuthenticationCommand.fromDto(body));
    }

    @ApiOperation({ summary: "Completes the authentication process for a user and returns user token" })
    @ApiOkResponse({ description: "The token information for the user", type: TokenDto })
    @Post("complete-signature-authentication")
    @UseGuards(ClientGuard)
    completeAuthentication(@Body() body: CompleteSignatureAuthenticationDto): Promise<TokenDto> {
        return this._commandBus.execute(CompleteSignatureAuthenticationCommand.fromDto(body));
    }

    @Post("refresh-token")
    @UseGuards(ClientGuard)
    refreshToken(@Body() body: RefreshTokenDto): Promise<TokenDto> {
        return this._tokenIssuer.issueFromRefreshToken(body.token);
    }

    @ApiOkResponse({ description: "The generated nonce", type: NonceDto })
    @Post("start-wallet-addition")
    @UseGuards(UserGuard)
    startWalletAddition(
        @RequestUserId() userId: string,
        @Body() body: StartSignatureAuthenticationDto
    ): Promise<NonceDto> {
        const mapped = StartSignatureAuthenticationCommand.fromDto(body);
        mapped.userId = userId;
        return this._commandBus.execute(mapped);
    }

    @ApiOkResponse({ description: "The added wallet", type: UserWalletDto })
    @Post("complete-wallet-addition")
    @UseGuards(UserGuard)
    completeWalletAddition(
        @RequestUserId() userId: string,
        @Body() body: CompleteSignatureAuthenticationDto
    ): Promise<EntityDto> {
        const mapped = CompleteWalletAdditionCommand.fromDto(body);
        mapped.userId = userId;
        return this._commandBus.execute(mapped);
    }

    @Get("user-wallets")
    @UseGuards(UserGuard)
    getUserWallets(@RequestUserId() userId: string): Promise<Array<UserWalletDto>> {
        return this._userQueryHandler.getUserWallets(userId);
    }
}
