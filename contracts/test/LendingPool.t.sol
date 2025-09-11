// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/logic/LendingPool.sol";
import "../src/logic/CollateralManager.sol";
import "../src/logic/InterestRateModel.sol";
import "../src/oracles/PriceOracle.sol";
import "./mocks/MockXFI.sol";
import "./mocks/MockUSDC.sol";

import "../src/tokens/AToken.sol";

contract LendingPoolTest is Test {
    LendingPool lendingPool;
    CollateralManager collateralManager;
    InterestRateModel interestRateModel;
    PriceOracle priceOracle;
    MockXFI xfi;
    MockUSDC usdc;

    function setUp() public {
        lendingPool = new LendingPool();
        collateralManager = new CollateralManager();
        interestRateModel = new InterestRateModel();
        priceOracle = new PriceOracle();
        xfi = new MockXFI();
        usdc = new MockUSDC();

        lendingPool.setCollateralManager(address(collateralManager));
        lendingPool.setInterestRateModel(address(interestRateModel));
        lendingPool.setPriceOracle(address(priceOracle));

        collateralManager.setPriceOracle(address(priceOracle));
        collateralManager.setLendingPool(address(lendingPool));
    }

    function testDeposit() public {
        // 1. Add asset
        lendingPool.addAsset(address(xfi), "aXFI", "aXFI");

        // 2. Approve
        xfi.approve(address(lendingPool), 100e18);

        // 3. Deposit
        lendingPool.deposit(address(xfi), 100e18, address(this), false);

        // 4. Check AToken balance
        AToken aToken = AToken(lendingPool.aTokens(address(xfi)));
        assertEq(aToken.balanceOf(address(this)), 100e18);

        // 5. Check lending pool balance
        assertEq(xfi.balanceOf(address(lendingPool)), 100e18);
    }

    function testWithdraw() public {
        // 1. Deposit
        lendingPool.addAsset(address(xfi), "aXFI", "aXFI");
        xfi.approve(address(lendingPool), 100e18);
        lendingPool.deposit(address(xfi), 100e18, address(this), false);

        // 2. Withdraw
        lendingPool.withdraw(address(xfi), 50e18, address(this));

        // 3. Check AToken balance
        AToken aToken = AToken(lendingPool.aTokens(address(xfi)));
        assertEq(aToken.balanceOf(address(this)), 50e18);

        // 4. Check user token balance
        assertEq(xfi.balanceOf(address(this)), 999950e18); // Initial balance is 1_000_000, 100 deposited, 50 withdrawn

        // 5. Check lending pool balance
        assertEq(xfi.balanceOf(address(lendingPool)), 50e18);
    }

    function testBorrow() public {
        // 1. Setup assets
        lendingPool.addAsset(address(xfi), "aXFI", "aXFI"); // Collateral
        lendingPool.addAsset(address(usdc), "aUSDC", "aUSDC"); // Borrowable

        // 2. Deposit collateral
        xfi.approve(address(lendingPool), 100e18);
        lendingPool.deposit(address(xfi), 100e18, address(this), true); // Use as collateral

        // 3. Deposit borrowable asset
        address depositor = makeAddr("depositor");
        vm.prank(depositor);
        usdc.mint(depositor, 1000e18);
        vm.prank(depositor);
        usdc.approve(address(lendingPool), 1000e18);
        vm.prank(depositor);
        lendingPool.deposit(address(usdc), 1000e18, depositor, false); // Dont use as collateral

        // 4. Set prices
        priceOracle.setPrice(address(xfi), 10e18); // 1 XFI = 10 ETH
        priceOracle.setPrice(address(usdc), 1e15); // 1 USDC = 0.001 ETH

        // 5. Set LTV
        lendingPool.setLTV(80); // 80%

        // 6. Borrow
        lendingPool.borrow(address(usdc), 500e18, 0, address(this)); // Borrow 500 USDC

        // 7. Check borrowed balance
        (, uint256 totalDebtETH, , , , ) = lendingPool.getUserAccountData(address(this));
        assertEq(totalDebtETH, 500e15); // 500 USDC * 0.001 ETH/USDC = 0.5 ETH

        // 8. Check user token balance
        assertEq(usdc.balanceOf(address(this)), 1000500e18);

        // 9. Check lending pool balance
        assertEq(usdc.balanceOf(address(lendingPool)), 500e18); // 1000 deposited - 500 borrowed
    }
}