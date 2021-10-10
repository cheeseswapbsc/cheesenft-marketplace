pragma solidity ^0.5.0;

import { CheeseNFTDataObjects } from "./CheeseNFTDataObjects.sol";


// shared storage
contract CheeseNFTDataStorages is CheeseNFTDataObjects {

    Cheese[] public cheeses;

}

