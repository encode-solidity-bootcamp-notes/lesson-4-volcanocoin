> **all credit and rights to the homework questions belong to Laurence Kirk and his team from Extropy**

# homework 4 - VolcanoCoin

you can use this repo to get instant feedback as you implement the requirements from the homework.

> **NOTE**: the test and contract implementations **should not be used as a reference**

this was just an attempt to follow TDD by turning the homework specs into tests and then implementing the contract. when we get to the hardhat and testing lessons we will learn the correct way to use these tools.

if you see a better way to do something just open a PR with changes and an explanation so we can all learn from it. see the contributing section at the end

## usage

> setup

1. clone the repo
```sh
# http
git clone https://github.com/encode-solidity-bootcamp-notes/lesson-4-volcanocoin.git
# ssh
git@github.com:encode-solidity-bootcamp-notes/lesson-4-volcanocoin.git
```
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