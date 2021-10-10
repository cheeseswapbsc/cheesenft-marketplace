const CheeseNFTTradable = artifacts.require("./CheeseNFTTradable.sol");

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(CheeseNFTTradable);
};
