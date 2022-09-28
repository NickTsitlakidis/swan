import { check } from "jest-verify-node-version";

check({ engines: { node: ">= 16.15.1" } });
/* eslint-disable */
export default {
    displayName: "api",
    preset: "../../jest.preset.js",
    globals: {
        "ts-jest": {
            tsconfig: "<rootDir>/tsconfig.spec.json"
        }
    },
    testEnvironment: "node",
    transform: {
        "^.+\\.[tj]s$": "ts-jest"
    },
    moduleFileExtensions: ["ts", "js", "html"],
    coverageDirectory: "../../coverage/apps/api",
    collectCoverage: true,
    collectCoverageFrom: ["src/app/**/*.ts", "!src/app/test-utils/*.ts", "!src/**/*.module.ts", "!src/**/*.module.ts"],
    maxConcurrency: 10,
    resetMocks: true,
    verbose: true,
    setupFiles: ["./jest-setup.ts"]
};
