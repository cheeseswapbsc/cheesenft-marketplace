pragma solidity ^0.5.0;

import { CheeseNFT } from "../../CheeseNFT.sol";


contract CheeseNFTMarketplaceEvents {

    event CheeseNFTOwnershipChanged (
        CheeseNFT cheeseNFT,
        uint cheeseId, 
        address ownerBeforeOwnershipTransferred,
        address ownerAfterOwnershipTransferred
    );

}
