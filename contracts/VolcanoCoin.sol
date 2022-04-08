//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
// use OZ interface to ensure conforming of public interface
// https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#IERC20
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

// follow ERC-20 spec for implementation: https://eips.ethereum.org/EIPS/eip-20

struct Payment {
    address to;
    uint256 amount;
}

contract VolcanoCoin is IERC20, IERC20Metadata {
    // -- PUBLIC (GETTERS) -- //
    string public override symbol = "VLCN";
    string public override name = "Volcano Coin";
    uint256 public override totalSupply = 10000;
    // 18 for matching wei: https://docs.openzeppelin.com/contracts/3.x/api/token/erc20#ERC20-decimals--
    uint8 public override decimals = 18;

    // -- PRIVATE -- //
    address private _contractOwner;
    uint16 private _incrementAmount = 1000;

    mapping(address => uint256) private _balances;
    mapping(address => Payment[]) private _payments;

    // mapping(owner => mapping(spender => allowance))
    // allows owner to have any number of spenders with independent spending allowances
    mapping(address => mapping(address => uint256)) private _allowances;

    constructor() {
        _contractOwner = msg.sender;
        _balances[_contractOwner] = totalSupply;
    }

    // -- EVENTS -- //

    event TotalSupplyChange(uint256 newTotalSupply);

    // -- MODIFIERS -- //

    modifier requireOwner() {
        require(
            msg.sender == _contractOwner,
            "Call must be made from contract owner account"
        );

        _;
    }

    // -- VIEW FUNCTIONS -- //

    function getOwner() public view returns (address) {
        return _contractOwner;
    }

    function balanceOf(address owner)
        public
        view
        override
        returns (uint256 balance)
    {
        return _balances[owner];
    }

    function paymentsFrom(address owner)
        public
        view
        returns (Payment[] memory)
    {
        return _payments[owner];
    }

    function allowance(address owner, address spender)
        public
        view
        override
        returns (uint256 remaining)
    {
        // NOTE: these are the steps broken out for readability
        // however to declare a local variable for spendingAllowances would require it to be held in storage which would waste gas
        // with no data location: Data location must be "storage", "memory" or "calldata" for variable, but none was given.
        // with memory data location: Type mapping(address => uint256) is only valid in storage because it contains a (nested) mapping.

        // mapping(address => uint256) storage spendingAllowances = _allowances[owner];

        // uint256 allowanceRemainingForSpender = spendingAllowances[spender];
        // return allowanceRemainingForSpender;

        return _allowances[owner][spender];
    }

    // -- MUTATING FUNCTIONS -- //

    function increaseSupply() public requireOwner {
        totalSupply += _incrementAmount;

        emit TotalSupplyChange(totalSupply);
    }

    // NOTE: UNSAFE - https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/edit
    function approve(address spender, uint256 value)
        public
        override
        returns (bool success)
    {
        address owner = msg.sender;

        require(
            value <= _balances[owner],
            "Allowance must be less than current account balance"
        );

        _allowances[owner][spender] = value;

        emit Approval(owner, spender, value);

        return true;
    }

    function transfer(address to, uint256 amount)
        public
        override
        returns (bool success)
    {
        address from = msg.sender;

        return _transfer(from, to, amount);
    }

    function transferFrom(
        address owner,
        address to,
        uint256 amount
    ) public override returns (bool success) {
        address spender = msg.sender;
        uint256 spenderAllowance = allowance(owner, spender);

        require(
            amount <= spenderAllowance,
            "Transfer amount must be less than or equal to the spender allowance"
        );

        return _transfer(owner, to, amount);
    }

    // internal transfer function to abstract transfer logic for both transfer and transferFrom
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) private returns (bool success) {
        uint256 currentBalance = balanceOf(from);

        require(
            amount <= currentBalance,
            "Transfer amount must be less than or equal to current balance of account"
        );

        _balances[from] -= amount;
        _balances[to] += amount;

        // only emit and record Payment after successful transfer
        emit Transfer(from, to, amount);

        _payments[from].push(Payment({to: to, amount: amount}));

        return true;
    }
}
