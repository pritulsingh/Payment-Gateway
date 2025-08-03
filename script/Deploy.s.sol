// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/USDCMock.sol";
import "../contracts/MockUSDT.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();

        new USDCMock();
        new MockUSDT();

        vm.stopBroadcast();
    }
}
