import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ConfirmListingSaleCommand } from "./confirm-listing-sale-command";

@CommandHandler(ConfirmListingSaleCommand)
export class ConfirmListingSaleCommandExecutor implements ICommandHandler<ConfirmListingSaleCommand> {
    async execute(command: ConfirmListingSaleCommand): Promise<any> {
        return Promise.resolve(undefined);
    }
}
