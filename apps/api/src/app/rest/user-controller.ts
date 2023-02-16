import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ClientGuard } from "../security/guards/client-guard";
import { StartSignatureAuthenticationCommand } from "../commands/user/start-signature-authentication-command";
import { CompleteSignatureAuthenticationCommand } from "../commands/user/complete-signature-authentication-command";
import {
    CompleteSignatureAuthenticationDto,
    EntityDto,
    NonceDto,
    StartSignatureAuthenticationDto,
    TokenDto,
    UserDto,
    UserWalletDto
} from "@swan/dto";
import { UserGuard } from "../security/guards/user-guard";
import { RequestUserId } from "../security/request-user-id";
import { CompleteWalletAdditionCommand } from "../commands/user/complete-wallet-addition-command";
import { UserTokenIssuer } from "../security/user-token-issuer";
import { UserQueryHandler } from "../queries/user-query-handler";
import { Response, Request } from "express";
import { Token } from "../security/token";
import { DateTime } from "luxon";
import { ConfigService } from "@nestjs/config";

@Controller("user")
export class UserController {
    constructor(
        private readonly _commandBus: CommandBus,
        private readonly _configService: ConfigService,
        private readonly _userQueryHandler: UserQueryHandler,
        private readonly _tokenIssuer: UserTokenIssuer
    ) {}

    @Post("start-signature-authentication")
    @UseGuards(ClientGuard)
    startAuthentication(@Body() body: StartSignatureAuthenticationDto): Promise<NonceDto> {
        return this._commandBus.execute(StartSignatureAuthenticationCommand.fromDto(body));
    }

    @Post("complete-signature-authentication")
    @UseGuards(ClientGuard)
    completeAuthentication(
        @Body() body: CompleteSignatureAuthenticationDto,
        @Res({ passthrough: true }) res: Response
    ) {
        return this._commandBus
            .execute<CompleteSignatureAuthenticationCommand, Token>(
                CompleteSignatureAuthenticationCommand.fromDto(body)
            )
            .then((token) => {
                const expirationMinutes = this._configService.getOrThrow<number>(
                    "USER_REFRESH_TOKEN_EXPIRATION_MINUTES"
                );
                const expiresAt = DateTime.now().toUTC().plus({ minute: expirationMinutes });
                res.cookie("refresher", token.refreshToken, {
                    expires: expiresAt.toJSDate(),
                    httpOnly: true,
                    sameSite: false
                }).json(new TokenDto(token.tokenValue, token.expiresAt));
            });
    }

    @Post("refresh-token")
    @UseGuards(ClientGuard)
    refreshToken(@Req() request: Request): Promise<TokenDto> {
        const refresher = request.cookies["refresher"];
        return this._tokenIssuer.issueFromRefreshToken(refresher);
    }

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

    @Get()
    @UseGuards(UserGuard)
    getUser(@RequestUserId() userId: string): Promise<UserDto> {
        return this._userQueryHandler.getUser(userId);
    }
}
