// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDCMock is ERC20 {
    mapping(address => uint256) public lastMinted;

    constructor() ERC20("USD Coin", "USDC") {
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    function mintTo(address to) external {
        require(block.timestamp - lastMinted[to] > 1 days, "Can only mint once per day");
        lastMinted[to] = block.timestamp;
        _mint(to, 1000 * 10 ** decimals());
    }
}
