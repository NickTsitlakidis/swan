const Migrations = artifacts.require("Migrations");
const Swan = artifacts.require("Swan");
const TestNft = artifacts.require("TestNft");

module.exports = function (deployer) {
    deployer.deploy(Migrations);
    deployer.deploy(Swan);
    deployer.deploy(TestNft);
};
