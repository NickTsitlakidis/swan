import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ConnectCommand } from "./connect-command";
import { UserViewRepository } from "../../views/user/user-view-repository";
import { UserFactory } from "../../domain/user/user-factory";
import { isNil } from "lodash";

@CommandHandler(ConnectCommand)
export class ConnectCommandHandler implements ICommandHandler<ConnectCommand> {
    constructor(
        private readonly _userViewRepository: UserViewRepository,
        private readonly _userFactory: UserFactory
    ) {}

    async execute(command: ConnectCommand): Promise<string> {
        const existing = await this._userViewRepository.findByWalletAddress(command.walletAddress);

        if (isNil(existing)) {
            const newUser = this._userFactory.createNew(command.walletAddress);
            await newUser.commit();
            return newUser.id;
        }

        return existing.id;
    }
}
