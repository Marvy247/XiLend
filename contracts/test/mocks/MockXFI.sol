// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockXFI is ERC20 {
    constructor() ERC20("Mock XFI", "mXFI") {
        _mint(msg.sender, 1_000_000 * 10**18);
    }
}