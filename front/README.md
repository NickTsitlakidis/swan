# A POC for Solana application connecting to Solflare & Phantom wallet

##### Prerequisites

 - Node v14.19.0
 - Flutter v2.10.1

##### Local installation and execution
```
npm install
npm run webpack
flutter run -d chrome
```

##### Build
`flutter build web`

##### Directory structure

## lib folder

 - js: This folder will contain all functions imported from node project and solana web3 packages
 
 - Screens: This folder will contain the application UI files rendered on the device screen.

 - Utils: This folder contains the functions used to implement the application’s business logic.

 - Widgets: This folder contains widgets that are used repeatedly in the application.

 - Data: The data folder contains data collections that are fetched from services or databases.

 - Services: Services folder should handle the application’s networking logic. For example, once a user gets authenticated, the application needs to update the backend with the access token. The service folder will contain the implementation of the logic responsible for handling this functionality.


## Basic approach to connect to the wallets via flutter

We need to create a Node project that imports the `@solana/web3.js` and also takes advantage of the exposed `window.solana` and `window.solflare` global object that is made available by Phantom & Solflare wallets' extensions.