// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PriceOracle is Ownable {
    constructor() Ownable(msg.sender) {}
    mapping(address => uint256) public prices;

    function setPrice(address asset, uint256 price) external onlyOwner {
        prices[asset] = price;
    }

    function getPrice(address asset) external view returns (uint256) {
        return prices[asset];
    }
}