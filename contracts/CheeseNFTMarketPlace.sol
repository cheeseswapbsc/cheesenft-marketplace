pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

//import { ERC20 } from './openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import { SafeMath } from "./openzeppelin-solidity/contracts/math/SafeMath.sol";
import { CheeseNFT } from "./CheeseNFT.sol";
import { CheeseNFTTradable } from "./CheeseNFTTradable.sol";
import { CheeseNFTMarketplaceEvents } from "./cheese-nft-marketplace/commons/CheeseNFTMarketplaceEvents.sol";
import { CheeseNFTData } from "./CheeseNFTData.sol";


contract CheeseNFTMarketplace is CheeseNFTTradable, CheeseNFTMarketplaceEvents {
    using SafeMath for uint256;

    address public CHEESE_NFT_MARKETPLACE;

    CheeseNFTData public cheeseNFTData;

    constructor(CheeseNFTData _cheeseNFTData) public CheeseNFTTradable(_cheeseNFTData) {
        cheeseNFTData = _cheeseNFTData;
        address payable CHEESE_NFT_MARKETPLACE = address(uint160(address(this)));
    }

    /** 
     * @notice - Buy function is that buy NFT token and ownership transfer. (Reference from IERC721.sol)
     * @notice - msg.sender buy NFT with ETH (msg.value)
     * @notice - CheeseID is always 1. Because each cheeseNFT is unique.
     */
    function buyCheeseNFT(CheeseNFT _cheeseNFT) public payable returns (bool) {
        CheeseNFT cheeseNFT = _cheeseNFT;

        CheeseNFTData.Cheese memory cheese = cheeseNFTData.getCheeseByNFTAddress(cheeseNFT);
        address _seller = cheese.ownerAddress;                     /// Owner
        address payable seller = address(uint160(_seller));  /// Convert owner address with payable
        uint buyAmount = cheese.cheesePrice;
        require (msg.value == buyAmount, "msg.value should be equal to the buyAmount");
 
        /// Bought-amount is transferred into a seller wallet
        seller.transfer(buyAmount);

        /// Approve a buyer address as a receiver before NFT's transferFrom method is executed
        address buyer = msg.sender;
        uint cheeseId = 1;  /// [Note]: CheeseID is always 1. Because each cheeseNFT is unique.
        cheeseNFT.approve(buyer, cheeseId);

        address ownerBeforeOwnershipTransferred = cheeseNFT.ownerOf(cheeseId);

        /// Transfer Ownership of the CheeseNFT from a seller to a buyer
        transferOwnershipOfCheeseNFT(cheeseNFT, cheeseId, buyer);    
        cheeseNFTData.updateOwnerOfCheeseNFT(cheeseNFT, buyer);
        cheeseNFTData.updateStatus(cheeseNFT, "Cancelled");

        /// Event for checking result of transferring ownership of a cheeseNFT
        address ownerAfterOwnershipTransferred = cheeseNFT.ownerOf(cheeseId);
        emit CheeseNFTOwnershipChanged(cheeseNFT, cheeseId, ownerBeforeOwnershipTransferred, ownerAfterOwnershipTransferred);

        /// Mint a cheese with a new cheeseId
        //string memory tokenURI = cheeseNFTFactory.getTokenURI(cheeseData.ipfsHashOfCheese);  /// [Note]: IPFS hash + URL
        //cheeseNFT.mint(msg.sender, tokenURI);
    }


    ///-----------------------------------------------------
    /// Methods below are pending methods
    ///-----------------------------------------------------

    /** 
     * @dev reputation function is that gives reputation to a user who has ownership of being posted cheese.
     * @dev Each user has reputation data in struct
     */
    function reputation(address from, address to, uint256 cheeseId) public returns (uint256, uint256) {

        // Cheese storage cheese = cheeses[cheeseId];
        // cheese.reputation = cheese.reputation.add(1);

        // emit AddReputation(cheeseId, cheese.reputation);

        // return (cheeseId, cheese.reputation);
        return (0, 0);
    }
    

    function getReputationCount(uint256 cheeseId) public view returns (uint256) {
        uint256 curretReputationCount;

        // Cheese memory cheese = cheeses[cheeseId];
        // curretReputationCount = cheese.reputation;

        return curretReputationCount;
    }    

}
