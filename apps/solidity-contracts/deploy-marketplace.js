const hre = require("hardhat");

async function deployMarketplace() {
    const SwanMarketplace = await hre.ethers.getContractFactory("SwanMarketplace");
    const marketplace = await SwanMarketplace.deploy();
    await marketplace.deployed();
    console.log("SwanMarketplace deployed to:", marketplace.address);
}

deployMarketplace()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
