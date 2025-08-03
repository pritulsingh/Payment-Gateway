// src/MockUSDT.sol
// SPDX‑License‑Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    constructor() ERC20("Mock USDT", "USDT") {
        _mint(msg.sender, 1_000_000 * 10**6); // 1 M USDT (6 dec)
    }
    function decimals() public view override returns (uint8) { return 6; }
}
