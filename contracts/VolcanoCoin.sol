//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

struct Payment {
  uint amount;
  address recipient;
}

contract VolcanoCoin {
  address private owner;
  uint private totalSupply;
  uint16 private incrementAmount = 1000;

  mapping (address => uint) private balances;
  mapping (address => Payment[]) private payments;

  constructor(uint initialSupply) {
    owner = msg.sender;
    totalSupply = initialSupply;
    balances[owner] = totalSupply;
  }

// -- EVENTS -- //

  event TotalSupplyChange(uint newTotalSupply);

  event Transfer(address recipient, uint amount);

// -- MODIFIERS -- //

  modifier requireOwner() {
    require(
        msg.sender == owner,
        "Call must be made from owner account"
    );
    
    _;
  }

// -- VIEW FUNCTIONS -- //

  function getOwner() public view  returns (address) {
    return owner;
  }

  function getTotalSupply() public view returns (uint) {
    return totalSupply;
  }

  // TypeError: Data location must be "memory" or "calldata" for return parameter in function, but none was given.
  // function getBalances() public returns (mapping (address => uint)) {
  // balanceOf looks to be a standard name for this type of behavior
  // https://ethereum.org/en/developers/docs/standards/tokens/erc-20/#methods
  function balanceOf(address account) public view returns (uint) {
    return balances[account];
  }

  // must return from memory: WHY?
  // otherwise: TypeError: Data location must be "memory" or "calldata" for return parameter in function, but none was given.
  function paymentsFrom(address account) public view returns (Payment[] memory) {
    return payments[account];
  }

// -- MUTATING FUNCTIONS -- //

  function increaseSupply() public requireOwner {
    totalSupply += incrementAmount;
    
    emit TotalSupplyChange(totalSupply);
  }

  function transfer(address recipient, uint amount) public {
    uint currentBalance = balanceOf(msg.sender);
    
    require(
      currentBalance >= amount,
      "Transfer amount must be less than or equal to current balance of account"
    );
    
    balances[msg.sender] -= amount;
    balances[recipient] += amount;

    // only emit after successful transfer
    emit Transfer(recipient, amount);
  }
}
