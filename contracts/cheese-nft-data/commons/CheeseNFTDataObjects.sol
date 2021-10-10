pragma solidity ^0.5.0;

import { CheeseNFT } from "../../CheeseNFT.sol";


contract CheeseNFTDataObjects {

    struct Cheese {  /// [Key]: index of array
        CheeseNFT cheeseNFT;
        string cheeseNFTName;
        string cheeseNFTSymbol;
        address ownerAddress;
        uint cheesePrice;
        string ipfsHashOfCheese;
        string status;  /// "Open" or "Cancelled"
        uint256 reputation;
    }

}
