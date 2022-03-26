import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CompleteWalletAdditionCommand } from "./complete-wallet-addition-command";
import { SignatureAuthenticationRepository } from "../../security/signature-authentication-repository";
import { SignatureValidator } from "./signature-validator";
import { IdGenerator } from "../../infrastructure/id-generator";
import { WalletViewRepository } from "../../views/wallet/wallet-view-repository";
import { UserFactory } from "../../domain/user/user-factory";
import { getLogger } from "../../infrastructure/logging";
import { Logger, UnauthorizedException } from "@nestjs/common";
import { isNil } from "lodash";
import { Blockchains, WalletDto } from "@nft-marketplace/common";
import { EventStore } from "../../infrastructure/event-store";
import { Wallet } from "../../domain/user/wallet";

@CommandHandler(CompleteWalletAdditionCommand)
export class CompleteWalletAdditionCommandExecutor implements ICommandHandler<CompleteWalletAdditionCommand> {
    private _logger: Logger;

    constructor(
        private readonly _authenticationRepository: SignatureAuthenticationRepository,
        private readonly _validator: SignatureValidator,
        private readonly _idGenerator: IdGenerator,
        private readonly _eventStore: EventStore,
        private readonly _walletViewRepository: WalletViewRepository,
        private readonly _userFactory: UserFactory
    ) {
        this._logger = getLogger(CompleteWalletAdditionCommandExecutor);
    }

    async execute(command: CompleteWalletAdditionCommand): Promise<WalletDto> {
        const auth = await this._authenticationRepository.findByAddressAndChainAndUserId(
            command.address,
            command.blockchain,
            command.userId
        );

        if (isNil(auth)) {
            throw new UnauthorizedException("Missing or invalid authentication");
        }

        if (auth.blockchain === Blockchains.SOLANA) {
            if (!this._validator.validateSolanaSignature(command.signature, auth.address, auth.message)) {
                this._logger.error(`Detected unverified Solana signature ${command.signature} for ${command.address}`);
                throw new UnauthorizedException("Missing or invalid authentication");
            }
        } else {
            if (!this._validator.validateEthereumSignature(command.signature, auth.address, auth.message)) {
                this._logger.error(
                    `Detected unverified Ethereum signature ${command.signature} for ${command.address}`
                );
                throw new UnauthorizedException("Missing or invalid authentication");
            }
        }

        const userEvents = await this._eventStore.findEventByAggregateId(command.userId);
        const user = this._userFactory.createFromEvents(command.userId, userEvents);
        const wallet = new Wallet(this._idGenerator.generateEntityId(), auth.address, auth.blockchain, auth.wallet);
        user.addWallet(wallet);
        await user.commit();

        await this._authenticationRepository.deleteById(auth.id);

        return new WalletDto(wallet.id, wallet.blockchain, wallet.name);
    }
}
