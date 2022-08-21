import { CompleteSignatureAuthenticationDto } from "@swan/dto";
import { CompleteSignatureAuthenticationCommand } from "./complete-signature-authentication-command";

test("fromDto - maps properties to new CompleteSignatureAuthenticationCommand command", () => {
    const dto = new CompleteSignatureAuthenticationDto();
    dto.address = "the-address";
    dto.blockchainId = "the-chain";
    dto.signature = "the-signature";

    const command = CompleteSignatureAuthenticationCommand.fromDto(dto);

    expect(command.address).toBe(dto.address);
    expect(command.blockchainId).toBe(dto.blockchainId);
    expect(command.signature).toBe(dto.signature);
});
