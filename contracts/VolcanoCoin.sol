//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract VolcanoCoin {
  address private owner;
  uint private totalSupply;
  uint16 private incrementAmount = 1000;
  mapping (address => uint) private balances;

  constructor(uint initialSupply) {
    owner = msg.sender;
    totalSupply = initialSupply;
    balances[owner] = totalSupply;
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

  // TypeError: Data location must be "memory" or "calldata" for return parameter in function, but none was given.
  // function getBalances() public returns (mapping (address => uint)) {
  // balanceOf looks to be a standard name for this type of behavior
  // https://ethereum.org/en/developers/docs/standards/tokens/erc-20/#methods
  function balanceOf(address account) public view returns (uint) {
    return balances[account];
  }

  function transfer(address toAccount, uint amount) public {
    uint currentBalance = balanceOf(msg.sender);
    
    require(
      currentBalance >= amount,
      "Transfer amount must be less than or equal to current balance of account"
    );
    
    balances[msg.sender] -= amount;
    balances[toAccount] += amount;
  }
}
