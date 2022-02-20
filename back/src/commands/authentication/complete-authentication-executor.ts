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
import { sign_detached_verify } from "tweetnacl-ts";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bs58 = require("bs58");

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

        const verifiedMatches = authentications.filter((auth) => {
            const decodedSignature = bs58.decode(command.signature);
            const encodedNonce = new TextEncoder().encode(auth.nonce);
            const pubKey = bs58.decode(auth.address);
            try {
                return sign_detached_verify(encodedNonce, decodedSignature, pubKey);
            } catch {
                return false;
            }
        });

        if (verifiedMatches.length == 0) {
            this._logger.error(`Detected unverified signature ${command.signature} for ${command.address}`);
            throw new UnauthorizedException("Missing or invalid authentication");
        }

        await this._authenticationRepository.deleteById(verifiedMatches[0].id);
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
