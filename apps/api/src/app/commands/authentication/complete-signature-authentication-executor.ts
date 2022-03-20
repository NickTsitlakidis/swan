import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CompleteSignatureAuthenticationCommand } from "./complete-signature-authentication-command";
import { SignatureAuthenticationRepository } from "../../security/signature-authentication-repository";
import { UserViewRepository } from "../../views/user/user-view-repository";
import { Logger, UnauthorizedException } from "@nestjs/common";
import { isNil } from "lodash";
import { getLogger } from "../../infrastructure/logging";
import { UserTokenIssuer } from "../../security/user-token-issuer";
import { sign_detached_verify } from "tweetnacl-ts";
import { Blockchains, TokenDto } from "@nft-marketplace/common";
import { User } from "../../domain/user/user";
import { IdGenerator } from "../../infrastructure/id-generator";
import { EventStore } from "../../infrastructure/event-store";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bs58 = require("bs58");

@CommandHandler(CompleteSignatureAuthenticationCommand)
export class CompleteSignatureAuthenticationExecutor
    implements ICommandHandler<CompleteSignatureAuthenticationCommand>
{
    private _logger: Logger;

    constructor(
        private readonly _authenticationRepository: SignatureAuthenticationRepository,
        private readonly _idGenerator: IdGenerator,
        private readonly _userViewRepository: UserViewRepository,
        private readonly _userTokenIssuer: UserTokenIssuer,
        private readonly _eventStore: EventStore
    ) {
        this._logger = getLogger(CompleteSignatureAuthenticationExecutor);
    }

    async execute(command: CompleteSignatureAuthenticationCommand): Promise<TokenDto> {
        const authentication = await this._authenticationRepository.findByAddressAndChain(
            command.address,
            command.blockchain
        );

        if (isNil(authentication)) {
            throw new UnauthorizedException("Missing or invalid authentication");
        }

        if (authentication.blockchain === Blockchains.SOLANA) {
            const decodedSignature = bs58.decode(command.signature);
            const encodedNonce = new TextEncoder().encode(authentication.message);
            const pubKey = bs58.decode(authentication.address);
            try {
                sign_detached_verify(encodedNonce, decodedSignature, pubKey);
            } catch {
                this._logger.error(`Detected unverified signature ${command.signature} for ${command.address}`);
                throw new UnauthorizedException("Missing or invalid authentication");
            }

            await this._authenticationRepository.deleteById(authentication.id);
            const existingUser = await this._userViewRepository.findByWalletAddress(command.address);

            let userId: string;
            if (isNil(existingUser)) {
                const newUser = this._eventStore.connectEntity(
                    new User(this._idGenerator.generateEntityId(), command.address)
                );
                await newUser.commit();
                userId = newUser.id;
            } else {
                userId = existingUser.id;
            }

            return this._userTokenIssuer.issueFromId(userId);
        }
    }
}
