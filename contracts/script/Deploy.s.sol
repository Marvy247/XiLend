// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/oracles/PriceOracle.sol";
import "../src/logic/InterestRateModel.sol";
import "../src/logic/CollateralManager.sol";
import "../src/logic/LendingPool.sol";
import "../src/tokens/AToken.sol";
import "../test/mocks/MockUSDC.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy MockUSDC
        MockUSDC usdc = new MockUSDC();

        // Deploy PriceOracle
        PriceOracle priceOracle = new PriceOracle();

        // Deploy InterestRateModel
        InterestRateModel interestRateModel = new InterestRateModel();

        // Deploy CollateralManager
        CollateralManager collateralManager = new CollateralManager();

        // Deploy LendingPool
        LendingPool lendingPool = new LendingPool();

        // Set up relationships
        lendingPool.setPriceOracle(address(priceOracle));
        lendingPool.setCollateralManager(address(collateralManager));
        lendingPool.setInterestRateModel(address(interestRateModel));

        collateralManager.setPriceOracle(address(priceOracle));
        collateralManager.setLendingPool(address(lendingPool));

        // Add USDC as asset
        lendingPool.addAsset(address(usdc), "aUSDC", "aUSDC", 6);

        // Set price for USDC (1 USD = 1e18 wei)
        priceOracle.setPrice(address(usdc), 1e18);

        // Set decimals in CollateralManager
        collateralManager.setAssetDecimals(address(usdc), 6);

        // Set LTV to 75%
        lendingPool.setLTV(75);

        // Set liquidation threshold for USDC to 80%
        lendingPool.setLiquidationThreshold(address(usdc), 80);

        // Set liquidation bonus for USDC to 5%
        lendingPool.setLiquidationBonus(address(usdc), 5);

        // Set interest rates (baseRate 2%, slope 10%)
        interestRateModel.setRates(0.02e18, 0.1e18);

        vm.stopBroadcast();

        // Log deployed addresses
        console.log("MockUSDC deployed at:", address(usdc));
        console.log("PriceOracle deployed at:", address(priceOracle));
        console.log("InterestRateModel deployed at:", address(interestRateModel));
        console.log("CollateralManager deployed at:", address(collateralManager));
        console.log("LendingPool deployed at:", address(lendingPool));
    }
}
