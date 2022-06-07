import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CompleteWalletAdditionCommand } from "./complete-wallet-addition-command";
import { SignatureAuthenticationRepository } from "../../security/signature-authentication-repository";
import { SignatureValidator } from "./signature-validator";
import { IdGenerator } from "../../infrastructure/id-generator";
import { UserWalletViewRepository } from "../../views/user-wallet/user-wallet-view-repository";
import { UserFactory } from "../../domain/user/user-factory";
import { getLogger } from "../../infrastructure/logging";
import { InternalServerErrorException, Logger, UnauthorizedException } from "@nestjs/common";
import { isNil } from "lodash";
import { UserWalletDto } from "@nft-marketplace/common";
import { EventStore } from "../../infrastructure/event-store";
import { BlockchainRepository } from "../../support/blockchains/blockchain-repository";
import { SignatureTypes } from "../../support/blockchains/signature-types";
import { UserWallet } from "../../domain/user/user-wallet";

@CommandHandler(CompleteWalletAdditionCommand)
export class CompleteWalletAdditionCommandExecutor implements ICommandHandler<CompleteWalletAdditionCommand> {
    private _logger: Logger;

    constructor(
        private readonly _authenticationRepository: SignatureAuthenticationRepository,
        private readonly _validator: SignatureValidator,
        private readonly _idGenerator: IdGenerator,
        private readonly _eventStore: EventStore,
        private readonly _blockchainRepository: BlockchainRepository,
        private readonly _walletViewRepository: UserWalletViewRepository,
        private readonly _userFactory: UserFactory
    ) {
        this._logger = getLogger(CompleteWalletAdditionCommandExecutor);
    }

    async execute(command: CompleteWalletAdditionCommand): Promise<UserWalletDto> {
        const auth = await this._authenticationRepository.findByAddressAndChainAndUserId(
            command.address,
            command.blockchainId,
            command.userId
        );

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
                this._logger.error(
                    `Detected unverified Ethereum signature ${command.signature} for ${command.address}`
                );
                throw new UnauthorizedException("Missing or invalid authentication");
            }
        }

        const userEvents = await this._eventStore.findEventByAggregateId(command.userId);
        const user = this._userFactory.createFromEvents(command.userId, userEvents);
        const wallet = new UserWallet(
            this._idGenerator.generateEntityId(),
            auth.address,
            auth.blockchainId,
            auth.walletId
        );
        user.addWallet(wallet);
        await user.commit();

        await this._authenticationRepository.deleteById(auth.id);

        return new UserWalletDto(user.id, wallet.walletId, wallet.id);
    }
}
