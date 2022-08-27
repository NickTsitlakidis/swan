import { sign_detached } from "tweetnacl-ts";
import { getUnitTestingModule } from "../../test-utils/test-modules";
import { SignatureValidator } from "./signature-validator";
import { encode } from "bs58";
import { Keypair } from "@solana/web3.js";

let validator: SignatureValidator;

beforeEach(async () => {
    const moduleRef = await getUnitTestingModule(SignatureValidator);
    validator = moduleRef.get(SignatureValidator);
});

test("validateSolanaSignature - returns false for different message", () => {
    const keyPair = Keypair.generate();
    const signedMessage = sign_detached(new TextEncoder().encode("isolation tank"), keyPair.secretKey);

    expect(validator.validateSolanaSignature(encode(signedMessage), keyPair.publicKey.toBase58(), "isolation")).toBe(
        false
    );
});

test("validateSolanaSignature - returns true for different address", () => {
    const keyPair = Keypair.generate();
    const keyPair2 = Keypair.generate();
    const signedMessage = sign_detached(new TextEncoder().encode("isolation tank"), keyPair.secretKey);

    expect(
        validator.validateSolanaSignature(encode(signedMessage), keyPair2.publicKey.toBase58(), "isolation tank")
    ).toBe(false);
});

test("validateSolanaSignature - returns true for valid signature", () => {
    const keyPair = Keypair.generate();
    const signedMessage = sign_detached(new TextEncoder().encode("isolation tank"), keyPair.secretKey);

    expect(
        validator.validateSolanaSignature(encode(signedMessage), keyPair.publicKey.toBase58(), "isolation tank")
    ).toBe(true);
});
