import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ConnectCommand } from "./connect-command";

@CommandHandler(ConnectCommand)
export class ConnectCommandHandler implements ICommandHandler<ConnectCommand> {
    execute(command: ConnectCommand): Promise<string> {
        return Promise.resolve(undefined);
    }
}
