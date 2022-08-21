import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { StartSignatureAuthenticationCommand } from "./start-signature-authentication-command";
import { SignatureAuthenticationRepository } from "../../security/signature-authentication-repository";
import { IdGenerator } from "../../infrastructure/id-generator";
import { SignatureAuthentication } from "../../security/signature-authentication";
import { NonceDto } from "@swan/dto";
import { ConfigService } from "@nestjs/config";
import { BadRequestException } from "@nestjs/common";
import { WalletRepository } from "../../support/blockchains/wallet-repository";
import { BlockchainWalletRepository } from "../../support/blockchains/blockchain-wallet-repository";
import { isNil } from "lodash";
import { LogAsyncMethod } from "../../infrastructure/logging";

@CommandHandler(StartSignatureAuthenticationCommand)
export class StartSignatureAuthenticationExecutor implements ICommandHandler<StartSignatureAuthenticationCommand> {
    constructor(
        private readonly _authenticationRepository: SignatureAuthenticationRepository,
        private readonly _configService: ConfigService,
        private readonly _walletRepository: WalletRepository,
        private readonly _chainWalletRepository: BlockchainWalletRepository,
        private readonly _idGenerator: IdGenerator
    ) {}

    @LogAsyncMethod
    async execute(command: StartSignatureAuthenticationCommand): Promise<NonceDto> {
        const pair = await this._chainWalletRepository.findByWalletIdAndBlockchainId(
            command.walletId,
            command.blockchainId
        );
        if (isNil(pair)) {
            throw new BadRequestException(`Invalid combination of blockchain and wallet`);
        }

        const wallet = await this._walletRepository.findById(pair.walletId);

        if (isNil(wallet) || !wallet.supportsSignatureAuthentication) {
            throw new BadRequestException(`Wallet doesn't support signature authentication`);
        }

        await this._authenticationRepository.deleteByAddressAndChain(command.address, command.blockchainId);

        let toSave = new SignatureAuthentication();
        toSave.message = `${this._configService.get("SIGNATURE_MESSAGE")} ${this._idGenerator.generateUUID()}`;
        toSave.address = command.address;
        toSave.walletId = command.walletId;
        toSave.blockchainId = command.blockchainId;
        toSave.userId = command.userId;

        toSave = await this._authenticationRepository.save(toSave);
        return new NonceDto(toSave.message);
    }
}
