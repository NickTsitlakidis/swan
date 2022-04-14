const Swan = artifacts.require("Swan");

contract("Swan", (accounts) => {
    it("getSwanWallet - returns deployer wallet", async () => {
        const deployed = await Swan.deployed();

        const swanWallet = await deployed.getSwanWallet.call();
        assert.equal(swanWallet, accounts[0]);
    });
});
