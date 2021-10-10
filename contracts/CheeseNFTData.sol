pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import { CheeseNFTDataStorages } from "./cheese-nft-data/commons/CheeseNFTDataStorages.sol";
import { CheeseNFT } from "./CheeseNFT.sol";


/**
 * @notice - This is the storage contract for cheeseNFTs
 */
contract CheeseNFTData is CheeseNFTDataStorages {

    address[] public cheeseAddresses;

    constructor() public {}

    /**
     * @notice - Save metadata of a cheeseNFT
     */
    function saveMetadataOfCheeseNFT(
        address[] memory _cheeseAddresses, 
        CheeseNFT _cheeseNFT, 
        string memory _cheeseNFTName, 
        string memory _cheeseNFTSymbol, 
        address _ownerAddress, 
        uint _cheesePrice, 
        string memory _ipfsHashOfCheese
    ) public returns (bool) {
        /// Save metadata of a cheeseNFT of cheese
        Cheese memory cheese = Cheese({
            cheeseNFT: _cheeseNFT,
            cheeseNFTName: _cheeseNFTName,
            cheeseNFTSymbol: _cheeseNFTSymbol,
            ownerAddress: _ownerAddress,
            cheesePrice: _cheesePrice,
            ipfsHashOfCheese: _ipfsHashOfCheese,
            status: "Open",
            reputation: 0
        });
        cheeses.push(cheese);

        /// Update cheeseAddresses
        cheeseAddresses = _cheeseAddresses;     
    }

    /**
     * @notice - Update owner address of a cheeseNFT by transferring ownership
     */
    function updateOwnerOfCheeseNFT(CheeseNFT _cheeseNFT, address _newOwner) public returns (bool) {
        /// Identify cheese's index
        uint cheeseIndex = getCheeseIndex(_cheeseNFT);

        /// Update metadata of a cheeseNFT of cheese
        Cheese storage cheese = cheeses[cheeseIndex];
        require (_newOwner != address(0), "A new owner address should be not empty");
        cheese.ownerAddress = _newOwner;  
    }

    /**
     * @notice - Update status ("Open" or "Cancelled")
     */
    function updateStatus(CheeseNFT _cheeseNFT, string memory _newStatus) public returns (bool) {
        /// Identify cheese's index
        uint cheeseIndex = getCheeseIndex(_cheeseNFT);

        /// Update metadata of a cheeseNFT of cheese
        Cheese storage cheese = cheeses[cheeseIndex];
        cheese.status = _newStatus;  
    }


    ///-----------------
    /// Getter methods
    ///-----------------
    function getCheese(uint index) public view returns (Cheese memory _cheese) {
        Cheese memory cheese = cheeses[index];
        return cheese;
    }

    function getCheeseIndex(CheeseNFT cheeseNFT) public view returns (uint _cheeseIndex) {
        address CHEESE_NFT = address(cheeseNFT);

        /// Identify member's index
        uint cheeseIndex;
        for (uint i=0; i < cheeseAddresses.length; i++) {
            if (cheeseAddresses[i] == CHEESE_NFT) {
                cheeseIndex = i;
            }
        }

        return cheeseIndex;   
    }

    function getCheeseByNFTAddress(CheeseNFT cheeseNFT) public view returns (Cheese memory _cheese) {
        address CHEESE_NFT = address(cheeseNFT);

        /// Identify member's index
        uint cheeseIndex;
        for (uint i=0; i < cheeseAddresses.length; i++) {
            if (cheeseAddresses[i] == CHEESE_NFT) {
                cheeseIndex = i;
            }
        }

        Cheese memory cheese = cheeses[cheeseIndex];
        return cheese;
    }

    function getAllCheeses() public view returns (Cheese[] memory _cheeses) {
        return cheeses;
    }

}
