//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract VolcanoCoin {
  address private owner;
  uint private totalSupply;

  constructor(uint initialSupply) {
    owner = msg.sender;
    totalSupply = initialSupply;
  }

  function getOwner() public view  returns (address) {
    return owner;
  }
}
