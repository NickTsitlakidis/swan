import { CompleteSignatureAuthenticationDto } from "@swan/dto";
import { CompleteWalletAdditionCommand } from "./complete-wallet-addition-command";

test("fromDto - maps properties to new CompleteWalletAdditionCommand", () => {
    const dto = new CompleteSignatureAuthenticationDto();
    dto.address = "the-address";
    dto.blockchainId = "the-chain";
    dto.signature = "the-signature";

    const command = CompleteWalletAdditionCommand.fromDto(dto);

    expect(command.address).toBe(dto.address);
    expect(command.blockchainId).toBe(dto.blockchainId);
    expect(command.signature).toBe(dto.signature);
});
