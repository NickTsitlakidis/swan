import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { StartSignatureAuthenticationCommand } from "./start-signature-authentication-command";
import { SignatureAuthenticationRepository } from "../../security/signature-authentication-repository";
import { IdGenerator } from "../../infrastructure/id-generator";
import { SignatureAuthentication } from "../../security/signature-authentication";
import { NonceDto, SupportedWallets } from "@nft-marketplace/common";
import { ConfigService } from "@nestjs/config";
import { BadRequestException } from "@nestjs/common";

@CommandHandler(StartSignatureAuthenticationCommand)
export class StartSignatureAuthenticationExecutor implements ICommandHandler<StartSignatureAuthenticationCommand> {
    private _signatureWallets: Array<SupportedWallets> = [
        SupportedWallets.METAMASK,
        SupportedWallets.SOLFLARE,
        SupportedWallets.PHANTOM
    ];
    constructor(
        private readonly _repository: SignatureAuthenticationRepository,
        private readonly _configService: ConfigService,
        private readonly _idGenerator: IdGenerator
    ) {}

    async execute(command: StartSignatureAuthenticationCommand): Promise<NonceDto> {
        if (!this._signatureWallets.includes(command.wallet)) {
            throw new BadRequestException(`${command.wallet} doesn't support signature authentication`);
        }

        await this._repository.deleteByAddressAndChain(command.address, command.blockchain);

        let toSave = new SignatureAuthentication();
        toSave.message = `${this._configService.get("SIGNATURE_MESSAGE")} ${this._idGenerator.generateUUID()}`;
        toSave.address = command.address;
        toSave.wallet = command.wallet;
        toSave.blockchain = command.blockchain;

        toSave = await this._repository.save(toSave);
        return new NonceDto(toSave.message);
    }
}
