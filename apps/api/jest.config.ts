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
    collectCoverageFrom: ['src/**/*.ts', '!src/app/test-utils/*.ts', '!src/**/*.module.ts'],
    maxConcurrency: 10,
    resetMocks: true,
    verbose: true,
    setupFiles: ["./jest-setup.ts"]
};
