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
    UserDto,
    UserWalletDto
} from "@swan/dto";
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

    @Post("start-signature-authentication")
    @UseGuards(ClientGuard)
    startAuthentication(@Body() body: StartSignatureAuthenticationDto): Promise<NonceDto> {
        return this._commandBus.execute(StartSignatureAuthenticationCommand.fromDto(body));
    }

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
