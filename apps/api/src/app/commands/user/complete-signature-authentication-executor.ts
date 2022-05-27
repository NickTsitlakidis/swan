import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CompleteSignatureAuthenticationCommand } from "./complete-signature-authentication-command";
import { SignatureAuthenticationRepository } from "../../security/signature-authentication-repository";
import { InternalServerErrorException, Logger, UnauthorizedException } from "@nestjs/common";
import { isNil } from "lodash";
import { getLogger, LogAsyncMethod } from "../../infrastructure/logging";
import { UserTokenIssuer } from "../../security/user-token-issuer";
import { TokenDto } from "@nft-marketplace/common";
import { IdGenerator } from "../../infrastructure/id-generator";
import { UserWalletViewRepository } from "../../views/user-wallet/user-wallet-view-repository";
import { SignatureValidator } from "./signature-validator";
import { UserFactory } from "../../domain/user/user-factory";
import { BlockchainRepository } from "../../support/blockchains/blockchain-repository";
import { SignatureTypes } from "../../support/blockchains/signature-types";
import { UserWallet } from "../../domain/user/user-wallet";

@CommandHandler(CompleteSignatureAuthenticationCommand)
export class CompleteSignatureAuthenticationExecutor
    implements ICommandHandler<CompleteSignatureAuthenticationCommand>
{
    private _logger: Logger;

    constructor(
        private readonly _authenticationRepository: SignatureAuthenticationRepository,
        private readonly _validator: SignatureValidator,
        private readonly _idGenerator: IdGenerator,
        private readonly _blockchainRepository: BlockchainRepository,
        private readonly _walletViewRepository: UserWalletViewRepository,
        private readonly _userTokenIssuer: UserTokenIssuer,
        private readonly _userFactory: UserFactory
    ) {
        this._logger = getLogger(CompleteSignatureAuthenticationExecutor);
    }

    @LogAsyncMethod
    async execute(command: CompleteSignatureAuthenticationCommand): Promise<TokenDto> {
        const auth = await this._authenticationRepository.findByAddressAndChain(command.address, command.blockchainId);

        if (isNil(auth)) {
            throw new UnauthorizedException("Missing or invalid authentication");
        }

        const blockchain = await this._blockchainRepository.findById(auth.blockchainId);

        if (isNil(blockchain)) {
            throw new InternalServerErrorException(`Can't find blockchain with id : ${auth.blockchainId}`);
        }

        if (blockchain.signatureType === SignatureTypes.SOLANA) {
            if (!this._validator.validateSolanaSignature(command.signature, auth.address, auth.message)) {
                this._logger.error(`Detected unverified Solana signature ${command.signature} for ${command.address}`);
                throw new UnauthorizedException("Missing or invalid authentication");
            }
        } else {
            if (!this._validator.validateEvmSignature(command.signature, auth.address, auth.message)) {
                this._logger.error(`Detected unverified EVM signature ${command.signature} for ${command.address}`);
                throw new UnauthorizedException("Missing or invalid authentication");
            }
        }

        await this._authenticationRepository.deleteById(auth.id);
        const existingWallet = await this._walletViewRepository.findByAddressAndBlockchain(
            command.address,
            command.blockchainId
        );

        let userId: string;
        if (isNil(existingWallet)) {
            const firstWallet = new UserWallet(
                this._idGenerator.generateEntityId(),
                auth.address,
                auth.blockchainId,
                auth.walletId
            );
            const newUser = this._userFactory.createNew(firstWallet);
            await newUser.commit();
            userId = newUser.id;
        } else {
            userId = existingWallet.userId;
        }

        return this._userTokenIssuer.issueFromId(userId);
    }
}
