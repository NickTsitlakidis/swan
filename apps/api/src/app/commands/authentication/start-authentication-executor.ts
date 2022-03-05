import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { StartAuthenticationCommand } from "./start-authentication-command";
import { AddressAuthenticationRepository } from "../../security/address-authentication-repository";
import { IdGenerator } from "../../infrastructure/id-generator";
import { AddressAuthentication } from "../../security/address-authentication";
import { NonceDto } from "@nft-marketplace/common";

@CommandHandler(StartAuthenticationCommand)
export class StartAuthenticationExecutor implements ICommandHandler<StartAuthenticationCommand> {
    constructor(
        private readonly _repository: AddressAuthenticationRepository,
        private readonly _idGenerator: IdGenerator
    ) {}

    async execute(command: StartAuthenticationCommand): Promise<NonceDto> {
        let toSave = new AddressAuthentication();
        toSave.nonce = this._idGenerator.generateUUID();
        toSave.address = command.address;

        toSave = await this._repository.save(toSave);
        return new NonceDto(toSave.nonce);
    }
}
