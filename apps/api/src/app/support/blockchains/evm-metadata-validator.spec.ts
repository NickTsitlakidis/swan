import { getUnitTestingModule } from "../../test-utils/test-modules";
import { EvmMetadataValidator } from "./evm-metadata-validator";

let validator: EvmMetadataValidator;

beforeEach(async () => {
    const testModule = await getUnitTestingModule(EvmMetadataValidator);
    validator = testModule.get(EvmMetadataValidator);
});

test("validate - returns false for missing name", () => {
    const toValidate = {
        description:
            "The Orbs are 3,333 real time, generative music and art NFTs. Each a unique, meditative, live coded combination of complex visual animations, run-time synthesis, DSP and live MIDI sequencing that will never loop - until the end of the internet.",
        external_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        image: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        background_color: "000000",
        animation_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        attributes: [
            {
                trait_type: "Synthesis Engine 4",
                value: "Killing Fields"
            }
        ]
    };

    expect(validator.validate(toValidate)).toBe(false);
});
