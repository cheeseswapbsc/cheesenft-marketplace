const CheeseNFTMarketplace = artifacts.require("./CheeseNFTMarketplace.sol");
const CheeseNFTData = artifacts.require("./CheeseNFTData.sol");

const _cheeseNFTData = CheeseNFTData.address;

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(CheeseNFTMarketplace, _cheeseNFTData);
};
