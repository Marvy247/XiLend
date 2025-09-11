// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../oracles/PriceOracle.sol";

contract CollateralManager is Ownable {
    constructor() Ownable(msg.sender) {}

    address public lendingPool;

    modifier onlyLendingPool() {
        require(msg.sender == lendingPool, "Only lending pool can call");
        _;
    }

    function setLendingPool(address _lendingPool) external onlyOwner {
        lendingPool = _lendingPool;
    }

    PriceOracle public priceOracle;

    function setPriceOracle(address _priceOracle) external onlyOwner {
        priceOracle = PriceOracle(_priceOracle);
    }

    function setAssetDecimals(address asset, uint8 decimals) external onlyOwner {
        assetDecimals[asset] = decimals;
    }

    mapping(address => mapping(address => uint256)) public userCollateral;
    mapping(address => address[]) public userCollateralAssets;
    mapping(address => uint8) public assetDecimals;

    function depositCollateral(address user, address asset, uint256 amount) external onlyLendingPool {
        if (userCollateral[user][asset] == 0) {
            userCollateralAssets[user].push(asset);
        }
        userCollateral[user][asset] += amount;
    }

    function withdrawCollateral(address user, address asset, uint256 amount) external onlyLendingPool {
        require(amount <= userCollateral[user][asset], "Withdraw amount exceeds collateral");
        userCollateral[user][asset] -= amount;
        // TODO: Remove asset from array if balance is 0
    }

    function getUserCollateralValue(address user) external view returns (uint256) {
        uint256 totalCollateralValue = 0;
        for (uint i = 0; i < userCollateralAssets[user].length; i++) {
            address collateralAsset = userCollateralAssets[user][i];
            uint256 amount = userCollateral[user][collateralAsset];
            uint256 price = priceOracle.getPrice(collateralAsset);
            uint256 decimals = assetDecimals[collateralAsset];
            totalCollateralValue += (amount * price) / (10 ** decimals);
        }
        return totalCollateralValue;
    }

    function getUserCollateralAssets(address user) external view returns (address[] memory) {
        return userCollateralAssets[user];
    }
}
