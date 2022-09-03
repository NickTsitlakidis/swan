import { getUnitTestingModule } from "../../test-utils/test-modules";
import { MetadataValidator } from "./metadata-validator";

let validator: MetadataValidator;

beforeEach(async () => {
    const testModule = await getUnitTestingModule(MetadataValidator);
    validator = testModule.get(MetadataValidator);
});

test("validate - returns false for missing name", () => {
    const toValidate = {
        description:
            "The Orbs are 3,333 real time, generative music and art NFTs. Each a unique, meditative, live coded combination of complex visual animations, run-time synthesis, DSP and live MIDI sequencing that will never loop - until the end of the internet.",
        external_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        image: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
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

test("validate - returns true with unknown fields", () => {
    const toValidate = {
        name: "spinner",
        description:
            "The Orbs are 3,333 real time, generative music and art NFTs. Each a unique, meditative, live coded combination of complex visual animations, run-time synthesis, DSP and live MIDI sequencing that will never loop - until the end of the internet.",
        external_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        image: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        animation_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        attributes: [
            {
                trait_type: "Synthesis Engine 4",
                value: "Killing Fields"
            }
        ],
        one: "one",
        two: 2
    };

    expect(validator.validate(toValidate)).toBe(true);
});

test("validate - returns false for non-string name", () => {
    const toValidate = {
        name: 55,
        description: "description",
        external_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        image: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
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

test("validate - returns false for missing description", () => {
    const toValidate = {
        name: "the-nft",
        external_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        image: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
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

test("validate - returns true for empty description", () => {
    const toValidate = {
        name: "the-nft",
        description: "",
        external_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        image: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        animation_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        attributes: [
            {
                trait_type: "Synthesis Engine 4",
                value: "Killing Fields"
            }
        ]
    };

    expect(validator.validate(toValidate)).toBe(true);
});

test("validate - returns false for non-string description", () => {
    const toValidate = {
        name: "the-nft",
        description: 45,
        external_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        image: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
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

test("validate - returns false for non-uri image", () => {
    const toValidate = {
        name: "the-nft",
        description: "the-description",
        external_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        image: "something",
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

test("validate - returns false for non-string image", () => {
    const toValidate = {
        name: "the-nft",
        description: "the-description",
        external_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        image: 4,
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

test("validate - returns false for missing image", () => {
    const toValidate = {
        name: "the-nft",
        description: "the-description",
        external_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
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

test("validate - returns false for non-string animation_url", () => {
    const toValidate = {
        name: "the-name",
        description:
            "The Orbs are 3,333 real time, generative music and art NFTs. Each a unique, meditative, live coded combination of complex visual animations, run-time synthesis, DSP and live MIDI sequencing that will never loop - until the end of the internet.",
        external_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        image: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        animation_url: 4,
        attributes: [
            {
                trait_type: "Synthesis Engine 4",
                value: "Killing Fields"
            }
        ]
    };

    expect(validator.validate(toValidate)).toBe(false);
});

test("validate - returns false for non-uri animation_url", () => {
    const toValidate = {
        description:
            "The Orbs are 3,333 real time, generative music and art NFTs. Each a unique, meditative, live coded combination of complex visual animations, run-time synthesis, DSP and live MIDI sequencing that will never loop - until the end of the internet.",
        external_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        image: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        animation_url: "d",
        attributes: [
            {
                trait_type: "Synthesis Engine 4",
                value: "Killing Fields"
            }
        ]
    };

    expect(validator.validate(toValidate)).toBe(false);
});

test("validate - returns false for non-uri external_url", () => {
    const toValidate = {
        description:
            "The Orbs are 3,333 real time, generative music and art NFTs. Each a unique, meditative, live coded combination of complex visual animations, run-time synthesis, DSP and live MIDI sequencing that will never loop - until the end of the internet.",
        external_url: "4",
        image: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
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

test("validate - returns false for non-string external_url", () => {
    const toValidate = {
        description:
            "The Orbs are 3,333 real time, generative music and art NFTs. Each a unique, meditative, live coded combination of complex visual animations, run-time synthesis, DSP and live MIDI sequencing that will never loop - until the end of the internet.",
        external_url: 4,
        image: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
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

test("validate - returns true for null external_url", () => {
    const toValidate = {
        name: "the-name",
        description:
            "The Orbs are 3,333 real time, generative music and art NFTs. Each a unique, meditative, live coded combination of complex visual animations, run-time synthesis, DSP and live MIDI sequencing that will never loop - until the end of the internet.",
        external_url: null,
        image: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        animation_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        attributes: [
            {
                trait_type: "Synthesis Engine 4",
                value: "Killing Fields"
            }
        ]
    };

    expect(validator.validate(toValidate)).toBe(true);
});

test("validate - returns true for null animation_url", () => {
    const toValidate = {
        name: "the-name",
        description:
            "The Orbs are 3,333 real time, generative music and art NFTs. Each a unique, meditative, live coded combination of complex visual animations, run-time synthesis, DSP and live MIDI sequencing that will never loop - until the end of the internet.",
        animation_url: null,
        image: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        external_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        attributes: [
            {
                trait_type: "Synthesis Engine 4",
                value: "Killing Fields"
            }
        ]
    };

    expect(validator.validate(toValidate)).toBe(true);
});

test("validate - returns true for null attributes", () => {
    const toValidate = {
        name: "the-name",
        description:
            "The Orbs are 3,333 real time, generative music and art NFTs. Each a unique, meditative, live coded combination of complex visual animations, run-time synthesis, DSP and live MIDI sequencing that will never loop - until the end of the internet.",
        animation_url: "https://google.com",
        image: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        external_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        attributes: null
    };

    expect(validator.validate(toValidate)).toBe(true);
});

test("validate - returns true for missing attributes", () => {
    const toValidate = {
        name: "the-nft",
        description:
            "The Orbs are 3,333 real time, generative music and art NFTs. Each a unique, meditative, live coded combination of complex visual animations, run-time synthesis, DSP and live MIDI sequencing that will never loop - until the end of the internet.",
        external_url: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        image: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        animation_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0"
    };

    expect(validator.validate(toValidate)).toBe(true);
});

test("validate - returns false for missing attributes trait_type", () => {
    const toValidate = {
        name: "the-nft",
        description:
            "The Orbs are 3,333 real time, generative music and art NFTs. Each a unique, meditative, live coded combination of complex visual animations, run-time synthesis, DSP and live MIDI sequencing that will never loop - until the end of the internet.",
        external_url: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        image: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        animation_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        attributes: [
            {
                display_type: "Synthesis Engine 4",
                value: "Killing Fields"
            }
        ]
    };

    expect(validator.validate(toValidate)).toBe(false);
});

test("validate - returns false for non-string attributes trait_type", () => {
    const toValidate = {
        name: "the-nft",
        description:
            "The Orbs are 3,333 real time, generative music and art NFTs. Each a unique, meditative, live coded combination of complex visual animations, run-time synthesis, DSP and live MIDI sequencing that will never loop - until the end of the internet.",
        external_url: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        image: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        animation_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        attributes: [
            {
                trait_type: 5,
                value: "Killing Fields"
            }
        ]
    };

    expect(validator.validate(toValidate)).toBe(false);
});

test("validate - returns false for missing attributes value", () => {
    const toValidate = {
        name: "the-nft",
        description:
            "The Orbs are 3,333 real time, generative music and art NFTs. Each a unique, meditative, live coded combination of complex visual animations, run-time synthesis, DSP and live MIDI sequencing that will never loop - until the end of the internet.",
        external_url: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        image: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        animation_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        attributes: [
            {
                display_type: "Synthesis Engine 4",
                trait_type: "Killing Fields"
            }
        ]
    };

    expect(validator.validate(toValidate)).toBe(false);
});

test("validate - returns false for non-string attributes value", () => {
    const toValidate = {
        name: "the-nft",
        description:
            "The Orbs are 3,333 real time, generative music and art NFTs. Each a unique, meditative, live coded combination of complex visual animations, run-time synthesis, DSP and live MIDI sequencing that will never loop - until the end of the internet.",
        external_url: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        image: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        animation_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        attributes: [
            {
                value: 5,
                trait_type: "Killing Fields"
            }
        ]
    };

    expect(validator.validate(toValidate)).toBe(false);
});

test("validate - returns false for non-string display_type value", () => {
    const toValidate = {
        name: "the-nft",
        description:
            "The Orbs are 3,333 real time, generative music and art NFTs. Each a unique, meditative, live coded combination of complex visual animations, run-time synthesis, DSP and live MIDI sequencing that will never loop - until the end of the internet.",
        external_url: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        image: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        animation_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        attributes: [
            {
                value: "345",
                display_type: 4,
                trait_type: "Killing Fields"
            }
        ]
    };

    expect(validator.validate(toValidate)).toBe(false);
});

test("validate - returns true for empty attributes", () => {
    const toValidate = {
        name: "the-nft",
        description:
            "The Orbs are 3,333 real time, generative music and art NFTs. Each a unique, meditative, live coded combination of complex visual animations, run-time synthesis, DSP and live MIDI sequencing that will never loop - until the end of the internet.",
        external_url: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        image: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        animation_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        attributes: []
    };

    expect(validator.validate(toValidate)).toBe(true);
});

test("validate - returns true for all valid fields", () => {
    const toValidate = {
        name: "the-nft",
        description:
            "The Orbs are 3,333 real time, generative music and art NFTs. Each a unique, meditative, live coded combination of complex visual animations, run-time synthesis, DSP and live MIDI sequencing that will never loop - until the end of the internet.",
        external_url: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        image: "https://arweave.net/2Mp91FnPuc4qKrBrR3VJo29lYMCEH7G6ljfvA53qCmU/pyun9lb3.png",
        animation_url: "https://arweave.net/X4d71Aqlt191JZcdzmP5j-omSyqEZyLFIM7kpL-ZDc0",
        attributes: [
            {
                value: "5",
                trait_type: "Killing Fields",
                display_type: "display"
            }
        ]
    };

    expect(validator.validate(toValidate)).toBe(true);
});
