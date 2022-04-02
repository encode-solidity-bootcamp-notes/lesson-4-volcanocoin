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
    address caller = msg.sender;

    require(
      caller == owner || caller == account,
      "Only the contract owner can request the balance of another acount"
    );

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
    // BONUS: assign the increased supply to the owner
    balances[msg.sender] += incrementAmount;
    
    emit TotalSupplyChange(totalSupply);
  }

  function transfer(address recipient, uint amount) public {
    address sender = msg.sender;
    uint currentBalance = balanceOf(msg.sender);
    
    require(
      currentBalance >= amount,
      "Transfer amount must be less than or equal to current balance of account"
    );
    
    balances[sender] -= amount;
    balances[recipient] += amount;

    // only emit and record Payment after successful transfer
    emit Transfer(recipient, amount);

    // working with arrays: https://docs.soliditylang.org/en/develop/types.html#arrays
    // NOTE: the entry and the array value are pre-allocated? do not need to define as empty before being able to push
    
    // NOTE: NOT like js shorthand for object properties, payments[sender] = Payment({ recipient, amount });
    payments[sender].push(Payment({ recipient: recipient, amount: amount }));

    // NOTE: can also give struct fields in DEFINED order Payment { uint amount; address recipient; }
    // treats the struct name like a constructor function with ordered params
    // payments[sender].push(Payment(amount, recipient));
  }
}
