const Swan = artifacts.require("Swan");

contract("Swan", (accounts) => {
    it("should put 10000 MetaCoin in the first account", async () => {
        const deployed = await Swan.deployed();

        const swanWallet = await deployed.getSwanWallet.call();
        expect(swanWallet).to.be(accounts[0]);
    });
});
