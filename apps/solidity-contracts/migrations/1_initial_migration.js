const Migrations = artifacts.require("Migrations");
const SwanNft = artifacts.require("SwanNft");
const SwanMarketplace = artifacts.require("SwanMarketplace");

module.exports = function (deployer) {
    deployer.deploy(Migrations);
    deployer.deploy(SwanNft);
    deployer.deploy(SwanMarketplace);
};
