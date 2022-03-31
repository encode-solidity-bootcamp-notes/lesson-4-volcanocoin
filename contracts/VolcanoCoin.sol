//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract VolcanoCoin {
  address private owner;
  uint private totalSupply;
  uint16 private incrementAmount = 1000;

  constructor(uint initialSupply) {
    owner = msg.sender;
    totalSupply = initialSupply;
  }

  // -- EVENTS -- //

  event TotalSupplyChange(uint newTotalSupply);


  // -- MODIFIERS -- //

  modifier requireOwner() {
    require(
        msg.sender == owner,
        "Call must be made from owner account"
    );
    
    _;
  }

  // -- FUNCTIONS -- //

  function getOwner() public view  returns (address) {
    return owner;
  }

  function getTotalSupply() public view returns (uint) {
    return totalSupply;
  }

  function increaseSupply() public requireOwner {
    totalSupply += incrementAmount;
    
    emit TotalSupplyChange(totalSupply);
  }
}
