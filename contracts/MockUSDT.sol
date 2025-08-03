// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    mapping(address => uint256) public lastMinted;

    constructor() ERC20("Mock USDT", "USDT") {
        _mint(msg.sender, 1_000_000 * 10**6);
    }

    function decimals() public view override returns (uint8) {
        return 6;
    }

    function mintTo(address to) external {
        require(block.timestamp - lastMinted[to] > 1 days, "Can only mint once per day");
        lastMinted[to] = block.timestamp;
        _mint(to, 1000 * 10 ** decimals());
    }
}
