// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    applicationId: "139dbf30-c92f-4305-8002-a1758894aa12",
    applicationSecret: "NkxsnKEnkBjUs7JGBy5k",
    serverUrl: "http://localhost:3310/api",
    solanaNetwork: "http://api.devnet.solana.com",
    lambdaS3Uri: "https://tv9z1bfxrb.execute-api.eu-central-1.amazonaws.com/dev/test-presignedUrl"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
