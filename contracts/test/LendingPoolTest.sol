// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/logic/LendingPool.sol";
import "../src/logic/CollateralManager.sol";
import "../src/oracles/PriceOracle.sol";
import "../src/logic/InterestRateModel.sol";
import "../src/tokens/AToken.sol";
import "./mocks/MockUSDC.sol";

contract LendingPoolTest is Test {
    LendingPool lendingPool;
    CollateralManager collateralManager;
    PriceOracle priceOracle;
    InterestRateModel interestRateModel;
    MockUSDC usdc;
    AToken aUsdc;

    address user1 = address(0x1);
    address user2 = address(0x2);

    function setUp() public {
        // Deploy contracts
        lendingPool = new LendingPool();
        collateralManager = new CollateralManager();
        priceOracle = new PriceOracle();
        interestRateModel = new InterestRateModel();
        usdc = new MockUSDC();

        // Set up relationships
        lendingPool.setCollateralManager(address(collateralManager));
        lendingPool.setPriceOracle(address(priceOracle));
        lendingPool.setInterestRateModel(address(interestRateModel));
        collateralManager.setPriceOracle(address(priceOracle));
        collateralManager.setLendingPool(address(lendingPool));

        // Set prices
        priceOracle.setPrice(address(usdc), 1e18); // 1 USDC = 1 ETH

        // Add asset
        lendingPool.addAsset(address(usdc), "aUSDC", "aUSDC");
        aUsdc = AToken(lendingPool.aTokens(address(usdc)));

        // Mint tokens to users
        usdc.mint(user1, 1000e18);
        usdc.mint(user2, 1000e18);

        // Approve lending pool
        vm.prank(user1);
        usdc.approve(address(lendingPool), type(uint256).max);
        vm.prank(user2);
        usdc.approve(address(lendingPool), type(uint256).max);

        // Set LTV and liquidation threshold
        lendingPool.setLTV(80); // 80%
        lendingPool.setLiquidationThreshold(address(usdc), 75); // 75%
    }

    function testDeposit() public {
        vm.prank(user1);
        lendingPool.deposit(address(usdc), 100e18, user1, true);

        assertEq(usdc.balanceOf(user1), 900e18);
        assertEq(usdc.balanceOf(address(lendingPool)), 100e18);
        assertEq(aUsdc.balanceOf(user1), 100e18);
        assertEq(collateralManager.userCollateral(user1, address(usdc)), 100e18);
    }

    function testWithdraw() public {
        vm.prank(user1);
        lendingPool.deposit(address(usdc), 100e18, user1, true);

        vm.prank(user1);
        lendingPool.withdraw(address(usdc), 50e18, user1);

        assertEq(usdc.balanceOf(user1), 950e18);
        assertEq(usdc.balanceOf(address(lendingPool)), 50e18);
        assertEq(aUsdc.balanceOf(user1), 50e18);
        assertEq(collateralManager.userCollateral(user1, address(usdc)), 50e18);
    }

    function testBorrow() public {
        vm.prank(user1);
        lendingPool.deposit(address(usdc), 100e18, user1, true);

        vm.prank(user1);
        lendingPool.borrow(address(usdc), 50e18, 1, user1);

        assertEq(usdc.balanceOf(user1), 950e18);
        assertEq(lendingPool.userBorrows(user1, address(usdc)), 50e18);
    }

    function testRepay() public {
        vm.prank(user1);
        lendingPool.deposit(address(usdc), 100e18, user1, true);

        vm.prank(user1);
        lendingPool.borrow(address(usdc), 50e18, 1, user1);

        vm.prank(user1);
        lendingPool.repay(address(usdc), 25e18, user1);

        assertEq(usdc.balanceOf(user1), 925e18);
        assertEq(lendingPool.userBorrows(user1, address(usdc)), 25e18);
    }

    function testLiquidationCall() public {
        vm.prank(user1);
        lendingPool.deposit(address(usdc), 100e18, user1, true);

        vm.prank(user1);
        lendingPool.borrow(address(usdc), 80e18, 1, user1);

        // Drop price to trigger liquidation
        priceOracle.setPrice(address(usdc), 0.5e18);

        vm.prank(user2);
        lendingPool.liquidationCall(address(usdc), address(usdc), user1, 40e18, false);

        assertEq(lendingPool.userBorrows(user1, address(usdc)), 40e18);
        assertEq(usdc.balanceOf(user1), 980e18); // 1000 -100 +80
        assertEq(usdc.balanceOf(user2), 1000e18); // 1000 -40 +40
    }

    function testGetUserAccountData() public {
        vm.prank(user1);
        lendingPool.deposit(address(usdc), 100e18, user1, true);

        (uint256 totalCollateralETH, uint256 totalDebtETH, uint256 availableBorrowsETH, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor) = lendingPool.getUserAccountData(user1);

        assertEq(totalCollateralETH, 100e18);
        assertEq(totalDebtETH, 0);
        assertEq(availableBorrowsETH, 80e18);
        assertEq(currentLiquidationThreshold, 75);
        assertEq(ltv, 80);
        assertEq(healthFactor, type(uint256).max);
    }
}
