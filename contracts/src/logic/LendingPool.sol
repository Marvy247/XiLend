// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/ILendingPool.sol";

import "../tokens/AToken.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./CollateralManager.sol";

import "../oracles/PriceOracle.sol";

import "./InterestRateModel.sol";

contract LendingPool is ILendingPool, Ownable, ReentrancyGuard {
    constructor() Ownable(msg.sender) {}

    event Deposit(address indexed reserve, address indexed user, address indexed onBehalfOf, uint256 amount, uint16 referralCode);
    event Withdraw(address indexed reserve, address indexed user, uint256 amount);
    event Borrow(address indexed reserve, address indexed user, address indexed onBehalfOf, uint256 amount, uint256 interestRateMode, uint256 borrowRate, uint16 referralCode);
    event Repay(address indexed reserve, address indexed user, address indexed repayer, uint256 amount);

    InterestRateModel public interestRateModel;

    function setInterestRateModel(address _interestRateModel) external onlyOwner {
        interestRateModel = InterestRateModel(_interestRateModel);
    }

    PriceOracle public priceOracle;

    function setPriceOracle(address _priceOracle) external onlyOwner {
        priceOracle = PriceOracle(_priceOracle);
    }

    CollateralManager public collateralManager;

    function setCollateralManager(address _collateralManager) external onlyOwner {
        collateralManager = CollateralManager(_collateralManager);
    }

    mapping(address => uint256) public liquidationBonuses;

    function setLiquidationBonus(address asset, uint256 bonus) external onlyOwner {
        liquidationBonuses[asset] = bonus;
    }

    mapping(address => uint256) public liquidationThresholds;

    function setLiquidationThreshold(address asset, uint256 threshold) external onlyOwner {
        liquidationThresholds[asset] = threshold;
    }

    uint256 public ltv;

    function setLTV(uint256 _ltv) external onlyOwner {
        ltv = _ltv;
    }

    mapping(address => address) public aTokens;
    mapping(address => uint8) public assetDecimals;

    function addAsset(address asset, string memory aTokenName, string memory aTokenSymbol, uint8 decimals) external onlyOwner {
        AToken aToken = new AToken(aTokenName, aTokenSymbol, address(this));
        aTokens[asset] = address(aToken);
        assetDecimals[asset] = decimals;
    }
    function deposit(address asset, uint256 amount, address onBehalfOf, bool useAsCollateral) external override nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        AToken(aTokens[asset]).mint(onBehalfOf, amount);

        if (useAsCollateral) {
            collateralManager.depositCollateral(onBehalfOf, asset, amount);
        }

        emit Deposit(asset, msg.sender, onBehalfOf, amount, 0);
    }

    function withdraw(address asset, uint256 amount, address to) external override nonReentrant returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        AToken(aTokens[asset]).burn(msg.sender, amount);
        if (collateralManager.userCollateral(msg.sender, asset) >= amount) {
            collateralManager.withdrawCollateral(msg.sender, asset, amount);
        }
        IERC20(asset).transfer(to, amount);

        emit Withdraw(asset, msg.sender, amount);
        return amount;
    }

    mapping(address => uint256) public totalBorrows;
    mapping(address => uint256) public userTotalBorrowedValue;
    mapping(address => mapping(address => uint256)) public userBorrows;

    function borrow(
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        address onBehalfOf
    ) external override nonReentrant {
        // 1. Get user's collateral value
        uint256 collateralValue = collateralManager.getUserCollateralValue(onBehalfOf);

        // 2. Get price of asset to be borrowed
        uint256 borrowAssetPrice = priceOracle.getPrice(asset);
        uint256 decimals = assetDecimals[asset];
        uint256 borrowValue = (amount * borrowAssetPrice) / (10 ** decimals);

        // 3. Calculate max borrowable amount
        uint256 maxBorrowableAmountInValue = (collateralValue * ltv) / 100; // Assuming LTV is in percentage

        // 4. Check if requested amount is within limit
        require(userTotalBorrowedValue[onBehalfOf] + borrowValue <= maxBorrowableAmountInValue, "Borrow amount exceeds LTV");

        // 5. Check for liquidity
        require(IERC20(asset).balanceOf(address(this)) >= amount, "Not enough liquidity");

        // 6. Transfer asset
        IERC20(asset).transfer(onBehalfOf, amount);

        // 7. Record loan
        userBorrows[onBehalfOf][asset] += amount;
        userTotalBorrowedValue[onBehalfOf] += borrowValue;
        totalBorrows[asset] += amount;

        // 8. Emit event
        emit Borrow(asset, onBehalfOf, onBehalfOf, amount, interestRateMode, 0, 0);
    }

    function repay(address asset, uint256 amount, address onBehalfOf) external override returns (uint256) {
        // 1. Get price of asset being repaid
        uint256 repayAssetPrice = priceOracle.getPrice(asset);
        uint256 decimals = assetDecimals[asset];
        uint256 repayValue = (amount * repayAssetPrice) / (10 ** decimals);

        // 2. Transfer asset from user to contract
        IERC20(asset).transferFrom(msg.sender, address(this), amount);

        // 3. Update user's total borrowed value
        userTotalBorrowedValue[onBehalfOf] -= repayValue;
        totalBorrows[asset] -= amount;
        userBorrows[onBehalfOf][asset] -= amount;

        emit Repay(asset, onBehalfOf, msg.sender, amount);
        return amount;
    }

    function liquidationCall(
        address collateralAsset,
        address debtAsset,
        address user,
        uint256 debtToCover,
        bool receiveAToken
    ) external override {
        // 1. Check health factor
        (, , , , , uint256 healthFactor) = this.getUserAccountData(user);
        require(healthFactor < 1e18, "Health factor is not below 1");

        // 2. Check debt to cover
        require(debtToCover <= userBorrows[user][debtAsset], "Debt to cover exceeds user's debt");

        // 3. Repay debt
        // This is a simplified implementation. A real implementation would need to handle interest.
        IERC20(debtAsset).transferFrom(msg.sender, address(this), debtToCover);
        uint256 decimals = assetDecimals[debtAsset];
        uint256 debtValue = (debtToCover * priceOracle.getPrice(debtAsset)) / (10 ** decimals);
        userTotalBorrowedValue[user] -= debtValue;
        totalBorrows[debtAsset] -= debtToCover;
        userBorrows[user][debtAsset] -= debtToCover;

        // 4. Transfer collateral
        uint256 bonus = liquidationBonuses[collateralAsset];
        uint256 collateralToLiquidateInValue = (debtValue * (100 + bonus)) / 100;
        uint256 collateralAmount = (collateralToLiquidateInValue * 1e18) / priceOracle.getPrice(collateralAsset);

        collateralManager.withdrawCollateral(user, collateralAsset, collateralAmount);

        if (receiveAToken) {
            AToken(aTokens[collateralAsset]).mint(msg.sender, collateralAmount);
        } else {
            IERC20(collateralAsset).transfer(msg.sender, collateralAmount);
        }
    }

    function getUserAccountData(address user) external view override returns (
        uint256 totalCollateralETH,
        uint256 totalDebtETH,
        uint256 availableBorrowsETH,
        uint256 currentLiquidationThreshold,
        uint256 _ltv,
        uint256 healthFactor
    ) {
        totalCollateralETH = collateralManager.getUserCollateralValue(user);
        totalDebtETH = userTotalBorrowedValue[user];

        // This is a simplified implementation. A real implementation would calculate
        // a weighted average of the liquidation thresholds of the user's collateral assets.
        // For now, we will just use the LTV of the first collateral asset.
        address[] memory collateralAssets = collateralManager.getUserCollateralAssets(user);
        if (collateralAssets.length > 0) {
            currentLiquidationThreshold = liquidationThresholds[collateralAssets[0]];
        } else {
            currentLiquidationThreshold = 0;
        }

        _ltv = this.ltv(); // The global LTV

        if (totalDebtETH == 0) {
            healthFactor = type(uint256).max;
        } else {
            healthFactor = (totalCollateralETH * currentLiquidationThreshold) / totalDebtETH;
        }

        uint256 maxBorrow = (totalCollateralETH * _ltv) / 100;
        availableBorrowsETH = totalDebtETH > maxBorrow ? 0 : maxBorrow - totalDebtETH;
    }
}