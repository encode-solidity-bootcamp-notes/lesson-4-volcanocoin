//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// use OZ interface to ensure conforming of public interface
// https://docs.openzeppelin.com/contracts/4.x/api/token/erc20#IERC20
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// follow ERC-20 spec for implementation: https://eips.ethereum.org/EIPS/eip-20

struct Payment {
    address to;
    uint256 value;
}

contract VolcanoCoin is IERC20 {
    // -- PUBLIC (GETTERS) -- //
    uint256 public override totalSupply = 10000;

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

    function balanceOf(address _owner)
        public
        view
        override
        returns (uint256 balance)
    {
        return _balances[_owner];
    }

    function paymentsFrom(address _account)
        public
        view
        returns (Payment[] memory)
    {
        return _payments[_account];
    }

    function allowance(address _owner, address _spender)
        public
        view
        override
        returns (uint256 remaining)
    {}

    // -- MUTATING FUNCTIONS -- //

    function increaseSupply() public requireOwner {
        totalSupply += _incrementAmount;

        emit TotalSupplyChange(totalSupply);
    }

    function approve(address _spender, uint256 _value)
        public
        override
        returns (bool success)
    {}

    function transfer(address _to, uint256 _value)
        public
        override
        returns (bool success)
    {
        address from = msg.sender;
        uint256 currentBalance = balanceOf(from);

        require(
            _value <= currentBalance,
            "Transfer amount must be less than or equal to current balance of account"
        );

        _balances[from] -= _value;
        _balances[_to] += _value;

        // only emit and record Payment after successful transfer
        emit Transfer(from, _to, _value);

        _payments[from].push(Payment({to: _to, value: _value}));

        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public override returns (bool success) {}
}
