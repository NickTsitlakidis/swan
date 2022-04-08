

# Swan Marketplace

## Apps and libraries description
### Api 
`./apps/api`

This is the main back end module of Swan. The module is based on [Nest.js](https://nestjs.com/) and exposes a REST api for clients to interact with.

### Marketplace
`./apps/nft-marketplace`

The main front end application of Swan. The module is based on Angular. The module's configuration is located in the
`project.json` because the build process is handled by [NX](https://nx.dev/)nes.

### Marketplace end-to-end tests
`./apps/nft-marketplace-e2e`

A standalone module to include e2e tests for the marketplace angular app.

### Solidity contracts
`./apps/solidity-contracts`

A basic module to include all the smart contracts which are written with Solidity. The module is structured to work
with the [Truffle](https://trufflesuite.com/) framework.

### Common library
`./libs/common`

A Typescript library that can be shared across all modules. A main use case for code included here would be the classes
which describe HTTP requests and responses (DTO)


## Docker build

`docker build -t <tag> .`<br />
`docker run --env-file ./.env -p 3310:3310 <tag>`


## Api build

Run `npm run build-api` to build the api moduel. The build artifacts will be stored in the `dist/` directory.

## Api unit tests

Run `npm run test-api` to execute the api unit tests via [Jest](https://jestjs.io).

## Api serve
Run `npm run start-api` to compile and run the api module. During serve, files are watched and changes are automatically compiled

## Marketplace build
Run `npm run build` to create a production build of the marketplace module. The build artifacts will be stored in the `dist/` directory.

## Marketplace serve
Run `npm start` to compile and run the marketplace module and serve it in the browser. During serve, files are watched and changes are automatically compiled


## Understand your workspace

Run `nx graph` to see a diagram of the dependencies of your projects.
