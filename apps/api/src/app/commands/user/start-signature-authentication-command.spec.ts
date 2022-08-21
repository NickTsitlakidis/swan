import { StartSignatureAuthenticationDto } from "@swan/dto";
import { StartSignatureAuthenticationCommand } from "./start-signature-authentication-command";

test("fromDto - maps properties to new StartSignatureAuthenticationCommand", () => {
    const dto = new StartSignatureAuthenticationDto();
    dto.address = "the-address";
    dto.blockchainId = "the-chain";
    dto.walletId = "the-wallet";

    const command = StartSignatureAuthenticationCommand.fromDto(dto);

    expect(command.address).toBe(dto.address);
    expect(command.blockchainId).toBe(dto.blockchainId);
    expect(command.walletId).toBe(dto.walletId);
});
