const CheeseNFTData = artifacts.require("./CheeseNFTData.sol");

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(CheeseNFTData);
};
