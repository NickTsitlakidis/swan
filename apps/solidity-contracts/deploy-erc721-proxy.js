const hre = require("hardhat");

async function deployProxy() {
    const ERC721Factory = await hre.ethers.getContractFactory("SwanERC721V1");
    const proxy = await hre.upgrades.deployProxy(ERC721Factory);
    await proxy.deployed();
    console.log("ERC721 Proxy deployed to:", proxy.address);
}

deployProxy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
