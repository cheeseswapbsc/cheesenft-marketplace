const CheeseNFTFactory = artifacts.require("./CheeseNFTFactory.sol");
const CheeseNFTMarketPlace = artifacts.require("./CheeseNFTMarketPlace.sol");
const CheeseNFTData = artifacts.require("./CheeseNFTData.sol");

const _cheeseNFTMarketPlace = CheeseNFTMarketPlace.address;
const _cheeseNFTData = CheeseNFTData.address;

module.exports = async function(deployer, network, accounts) {
    await deployer.deploy(CheeseNFTFactory, _cheeseNFTMarketPlace, _cheeseNFTData);
};
