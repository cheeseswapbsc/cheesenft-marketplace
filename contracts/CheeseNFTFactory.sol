pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import { SafeMath } from "./openzeppelin-solidity/contracts/math/SafeMath.sol";
import { Strings } from "./libraries/Strings.sol";
import { CheeseNFTFactoryStorages } from "./cheese-nft-factory/commons/CheeseNFTFactoryStorages.sol";
import { CheeseNFT } from "./CheeseNFT.sol";
import { CheeseNFTMarketplace } from "./CheeseNFTMarketplace.sol";
import { CheeseNFTData } from "./CheeseNFTData.sol";


/**
 * @notice - This is the factory contract for a NFT of cheese
 */
contract CheeseNFTFactory is CheeseNFTFactoryStorages {
    using SafeMath for uint256;
    using Strings for string;    

    address[] public cheeseAddresses;
    address CHEESE_NFT_MARKETPLACE;

    CheeseNFTMarketplace public cheeseNFTMarketplace;
    CheeseNFTData public cheeseNFTData;

    constructor(CheeseNFTMarketplace _cheeseNFTMarketplace, CheeseNFTData _cheeseNFTData) public {
        cheeseNFTMarketplace = _cheeseNFTMarketplace;
        cheeseNFTData = _cheeseNFTData;
        CHEESE_NFT_MARKETPLACE = address(cheeseNFTMarketplace);
    }

    /**
     * @notice - Create a new cheeseNFT when a seller (owner) upload a cheese onto IPFS
     */
    function createNewCheeseNFT(string memory nftName, string memory nftSymbol, uint cheesePrice, string memory ipfsHashOfCheese) public returns (bool) {
        address owner = msg.sender;  /// [Note]: Initial owner of cheeseNFT is msg.sender
        string memory tokenURI = getTokenURI(ipfsHashOfCheese);  /// [Note]: IPFS hash + URL
        CheeseNFT cheeseNFT = new CheeseNFT(owner, nftName, nftSymbol, tokenURI, cheesePrice);
        cheeseAddresses.push(address(cheeseNFT));

        /// Save metadata of a cheeseNFT created
        cheeseNFTData.saveMetadataOfCheeseNFT(cheeseAddresses, cheeseNFT, nftName, nftSymbol, msg.sender, cheesePrice, ipfsHashOfCheese);
        cheeseNFTData.updateStatus(cheeseNFT, "Open");

        emit CheeseNFTCreated(msg.sender, cheeseNFT, nftName, nftSymbol, cheesePrice, ipfsHashOfCheese);
    }


    ///-----------------
    /// Getter methods
    ///-----------------
    function baseTokenURI() public pure returns (string memory) {
        return "https://ipfs.io/ipfs/";
    }

    function getTokenURI(string memory _ipfsHashOfCheese) public view returns (string memory) {
        return Strings.strConcat(baseTokenURI(), _ipfsHashOfCheese);
    }

}
