pragma solidity ^0.5.0;

import { CheeseNFT } from "../../CheeseNFT.sol";


contract CheeseNFTFactoryEvents {

    event CheeseNFTCreated (
        address owner,
        CheeseNFT cheeseNFT,
        string nftName, 
        string nftSymbol, 
        uint cheesePrice, 
        string ipfsHashOfCheese
    );

    event AddReputation (
        uint256 tokenId,
        uint256 reputationCount
    );

}
