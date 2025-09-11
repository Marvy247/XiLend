// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract InterestRateModel is Ownable {
    constructor() Ownable(msg.sender) {}
    uint256 public baseRate;
    uint256 public slope;

    function setRates(uint256 _baseRate, uint256 _slope) external onlyOwner {
        baseRate = _baseRate;
        slope = _slope;
    }

    function getBorrowRate(uint256 totalBorrows, uint256 totalLiquidity) external view returns (uint256) {
        if (totalLiquidity == 0) {
            return baseRate;
        }
        uint256 utilization = (totalBorrows * 1e18) / totalLiquidity;
        return baseRate + (utilization * slope) / 1e18;
    }
}