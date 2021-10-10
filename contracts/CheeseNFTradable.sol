pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import { CheeseNFT } from "./CheeseNFT.sol";
import { CheeseNFTData } from "./CheeseNFTData.sol";


/**
 * @title - CheeseNFTTradable contract
 * @notice - This contract has role that put on sale of cheeseNFTs
 */
contract CheeseNFTTradable {
    event TradeStatusChange(uint256 ad, bytes32 status);

    CheeseNFT public cheeseNFT;
    CheeseNFTData public cheeseNFTData;

    struct Trade {
        address seller;
        uint256 cheeseId;  /// CheeseNFT's token ID
        uint256 cheesePrice;
        bytes32 status;   /// Open, Executed, Cancelled
    }
    mapping(uint256 => Trade) public trades;  /// [Key]: CheeseNFT's token ID

    uint256 tradeCounter;

    constructor(CheeseNFTData _cheeseNFTData) public {
        cheeseNFTData = _cheeseNFTData;
        tradeCounter = 0;
    }

    /**
     * @notice - This method is only executed when a seller create a new CheeseNFT
     * @dev Opens a new trade. Puts _cheeseId in escrow.
     * @param _cheeseId The id for the cheeseId to trade.
     * @param _cheesePrice The amount of currency for which to trade the cheeseId.
     */
    function openTradeWhenCreateNewCheeseNFT(CheeseNFT cheeseNFT, uint256 _cheeseId, uint256 _cheesePrice) public {
        cheeseNFT.transferFrom(msg.sender, address(this), _cheeseId);

        tradeCounter += 1;    /// [Note]: New. Trade count is started from "1". This is to align cheeseId
        trades[tradeCounter] = Trade({
            seller: msg.sender,
            cheeseId: _cheeseId,
            cheesePrice: _cheesePrice,
            status: "Open"
        });
        //tradeCounter += 1;  /// [Note]: Original
        emit TradeStatusChange(tradeCounter - 1, "Open");
    }

    /**
     * @dev Opens a trade by the seller.
     */
    function openTrade(CheeseNFT cheeseNFT, uint256 _cheeseId) public {
        cheeseNFTData.updateStatus(cheeseNFT, "Open");

        Trade storage trade = trades[_cheeseId];
        require(
            msg.sender == trade.seller,
            "Trade can be open only by seller."
        );
        cheeseNFT.transferFrom(msg.sender, address(this), trade.cheeseId);
        trades[_cheeseId].status = "Open";
        emit TradeStatusChange(_cheeseId, "Open");
    }

    /**
     * @dev Cancels a trade by the seller.
     */
    function cancelTrade(CheeseNFT cheeseNFT, uint256 _cheeseId) public {
        cheeseNFTData.updateStatus(cheeseNFT, "Cancelled");
        
        Trade storage trade = trades[_cheeseId];
        require(
            msg.sender == trade.seller,
            "Trade can be cancelled only by seller."
        );
        require(trade.status == "Open", "Trade is not Open.");
        cheeseNFT.transferFrom(address(this), trade.seller, trade.cheeseId);
        trades[_cheeseId].status = "Cancelled";
        emit TradeStatusChange(_cheeseId, "Cancelled");
    }

    /**
     * @dev Executes a trade. Must have approved this contract to transfer the amount of currency specified to the seller. Transfers ownership of the cheeseId to the filler.
     */
    function transferOwnershipOfCheeseNFT(CheeseNFT _cheeseNFT, uint256 _cheeseId, address _buyer) public {
        CheeseNFT cheeseNFT = _cheeseNFT;

        Trade memory trade = getTrade(_cheeseId);
        require(trade.status == "Open", "Trade is not Open.");

        _updateSeller(_cheeseNFT, _cheeseId, _buyer);

        cheeseNFT.transferFrom(address(this), _buyer, trade.cheeseId);
        getTrade(_cheeseId).status = "Cancelled";
        emit TradeStatusChange(_cheeseId, "Cancelled");
    }

    function _updateSeller(CheeseNFT cheeseNFT, uint256 _cheeseId, address _newSeller) internal {
        Trade storage trade = trades[_cheeseId];
        trade.seller = _newSeller;
    }


    /**
     * @dev - Returns the details for a trade.
     */
    function getTrade(uint256 _cheeseId) public view returns (Trade memory trade_) {
        Trade memory trade = trades[_cheeseId];
        return trade;
        //return (trade.seller, trade.cheeseId, trade.cheesePrice, trade.status);
    }
}
