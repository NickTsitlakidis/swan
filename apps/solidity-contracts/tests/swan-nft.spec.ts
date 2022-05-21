const Migrations = artifacts.require("Migrations");
const SwanNft = artifacts.require("SwanNft");

contract("SwanNft", (accounts) => {
    // it("constructor - sets name and symbol correctly", async () => {
    //     const deployed = await SwanNft.deployed();
    //
    //     const name = await deployed.name();
    //     const symbol = await deployed.symbol();
    //
    //     assert.equal(name, "SwanNft");
    //     assert.equal(symbol, "SNFT");
    // });

    it("createItem - mints with token uri and returns id", async () => {
        const deployed = await SwanNft.deployed();

        const tokenId = await deployed.createItem.call(accounts[2], "http://the-uri");
        assert.equal(tokenId.toNumber(), 1);

        await new Promise((resolve) => setTimeout(resolve, 1000));
        const savedUri = await deployed.tokenURI("1");
        assert.equal(savedUri, "http://the-uri");

        //assert.equal(accounts[2], owner);
    });
});
