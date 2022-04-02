> **all credit and rights to the homework questions belong to Laurence Kirk and his team from Extropy**

# homework 4 - VolcanoCoin

you can use this repo to get instant feedback as you implement the requirements from the homework.

> **NOTE**: the test and contract implementations **should not be used as a reference**

this was just an attempt to follow TDD by turning the homework specs into tests and then implementing the contract. when we get to the hardhat and testing lessons we will learn the correct way to use these tools.

if you see a better way to do something just open a PR with changes and an explanation so we can all learn from it. see the contributing section at the end

> tests

```sh
  VolcanoCoin
    contract creation
      ✔ should compile and deploy without error
      ✔ should assign the owner to the account that created the contract
      ✔ should have an initial supply of 10,000 tokens
      ✔ should assign the initial supply to the owner account balance
    publicly accessible view functions
      ✔ getTotalSupply: returns the current total supply
      ✔ balanceOf: returns the current balance of the specified account argument
      paymentsFrom: returns the payments sent from the specified account argument
        ✔ returns an empty array if no payments have been made from the account
        ✔ returns an array of Payment ({ recipient, amount }) when payments have been made from the account (109ms)
    increaseSupply is a publicly accessible function that only the owner account can call
      ✔ when called from the owner account it increases the total supply by 1000 (44ms)
      ✔ when called from a non-owner account it reverts so as not to increase the total supply (51ms)
    transfer is a publicly accessible function
      ✔ should revert if the caller account balance is less than the transfer amount
      ✔ should transfer the amount from the caller balance to the recipient balance if the amount is less than or equal to current caller balance
    contract events
      ✔ emits a TotalSupplyChange event with the new total supply as output when the total supply changes (71ms)
      ✔ emits a Transfer event with (recipient address, amount) as output when a transfer occurs (38ms)
    [BONUS] additional requirements to try implementing
      - increaseTotalSupply: assigns the increased supply to the owner account balance when successful
      - balanceOf: reverts if a non-owner caller requests the balance of someone else's account
```

## usage

> setup

1. clone the repo
```sh
# http
git clone https://github.com/encode-solidity-bootcamp-notes/lesson-4-volcanocoin.git
# ssh
git@github.com:encode-solidity-bootcamp-notes/lesson-4-volcanocoin.git
```

> [OPTIONAL] if you have vscode and docker installed you can use the remote-containers extension to set up the env automatically:

    1. go to extensions and search for `@recommended` to install the extensions
    2. open the command pallet (`CMD/ctrl` + `SHIFT` + `P`) and select `rebuild and reopen in container`
    3. use the integrated terminal to run steps 2-5.

2. install dependencies
```sh
npm install
```

> TDD: follow the red > green > refactor workflow to implement the contract

3. run the tests to see the requirements
```sh
npm test
```

4. implement contract requirements in `contracts/VolcanoCoin.sol` then run tests to make sure you are making forward progress

5. repeat 3. and 4. until all tests pass!

> bonus

there are 2 extra tests at the end of extra things to try out

## branches

> `master`

- contains only the tests (`tests/index.ts`) and the stub for VolcanoCoin (`contracts/VolcanoCoin.sol`)
- the bonus tests are `skip`ped so they dont interfere with progress

> `implementation`

- contains my contract solution (**see note above**)

> `bonus`

- removes the `skip` on bonus tests
- adds implementation of the bonus test requirements  

## contributing

- **test changes**: commit on `master` and rebase the other branches onto it
- **implementation changes**: commit on `implementation` and rebase `bonus` onto it
- **bonus features**: commit on `bonus` 