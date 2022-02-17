import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CompleteAuthenticationCommand } from "./complete-authentication-command";
import { TokenDto } from "../../security/token-dto";
import { AddressAuthenticationRepository } from "../../security/address-authentication-repository";
import { UserFactory } from "../../domain/user/user-factory";
import { UserViewRepository } from "../../views/user/user-view-repository";
import { Logger, UnauthorizedException } from "@nestjs/common";
import { isNil } from "lodash";
import { getLogger } from "../../infrastructure/logging";
import { UserTokenIssuer } from "../../security/user-token-issuer";

@CommandHandler(CompleteAuthenticationCommand)
export class CompleteAuthenticationExecutor implements ICommandHandler<CompleteAuthenticationCommand> {
    private _logger: Logger;

    constructor(
        private readonly _authenticationRepository: AddressAuthenticationRepository,
        private readonly _userViewRepository: UserViewRepository,
        private readonly _userTokenIssuer: UserTokenIssuer,
        private readonly _userFactory: UserFactory
    ) {
        this._logger = getLogger(CompleteAuthenticationExecutor);
    }

    async execute(command: CompleteAuthenticationCommand): Promise<TokenDto> {
        const authentications = await this._authenticationRepository.findByAddress(command.address);
        if (authentications.length === 0) {
            throw new UnauthorizedException("Missing or invalid authentication");
        }

        const isValid = false;

        if (!isValid) {
            throw new UnauthorizedException("Missing or invalid authentication");
        }

        const existingUser = await this._userViewRepository.findByWalletAddress(command.address);

        let userId: string;
        if (isNil(existingUser)) {
            const newUser = this._userFactory.createNew(command.address);
            await newUser.commit();
            userId = newUser.id;
        } else {
            userId = existingUser.id;
        }

        return this._userTokenIssuer.issueFromId(userId);
    }
}
