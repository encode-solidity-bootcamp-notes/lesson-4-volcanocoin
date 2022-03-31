import { expect } from "chai";
import { ethers } from "hardhat";

import type { Signer, Contract, ContractTransaction } from "ethers";

const CONTRACT_CONSTANTS = {
  initialSupply: 10000,
  increaseSupplyAmount: 1000,
  events: {
    totalSupplyChange: "TotalSupplyChange",
  },
};

const expectTotalSupply = async (
  volcanoCoinContract: Contract,
  expectedSupply: number
) => {
  const totalSupply = await volcanoCoinContract.getTotalSupply();
  expect(totalSupply).to.equal(expectedSupply);

  return totalSupply;
};

describe("VolcanoCoin", function () {
  let ownerAccount: Signer;
  let nonOwnerAccount: Signer;

  let currentSupply: number;
  let volcanoCoinContract: Contract;

  before("deploy contract and load signer accounts", async () => {
    // get and assign the two signer accounts
    const [first, second] = await ethers.getSigners();
    ownerAccount = first;
    nonOwnerAccount = second;

    const VolcanoCoin = await ethers.getContractFactory("VolcanoCoin");

    // deploy the contract with the owner account as the signer
    // https://hardhat.org/guides/waffle-testing.html#testing-from-a-different-account
    // https://docs.ethers.io/v5/single-page/#/v5/api/contract/contract-factory/-%23-ContractFactory-connect
    volcanoCoinContract = await VolcanoCoin.connect(ownerAccount).deploy(
      CONTRACT_CONSTANTS.initialSupply
    );

    // https://docs.ethers.io/v5/single-page/#/v5/api/contract/contract/-%23-Contract-deployed
    await volcanoCoinContract.deployed();
  });

  it("should set the owner account to the account that created the contract", async () => {
    const owner = await volcanoCoinContract.owner();
    const ownerAccountAddress = await ownerAccount.getAddress();

    expect(owner).to.equal(ownerAccountAddress);
  });

  it("should have a public function [getTotalSupply] to view the total supply", async () => {
    const totalSupply = await expectTotalSupply(
      volcanoCoinContract,
      CONTRACT_CONSTANTS.initialSupply
    );
    // update current supply after assertion for consistency in downstream tests
    // can be done in expectTotalSupply helper but better to be explicit in tests for readability
    volcanoCoinContract.functions.currentSupply = totalSupply;
  });

  it("should have a public function [increaseSupply] that increases the total supply by 1000 when called from the owner account", async () => {
    // call from owner account (implicit as first account in signers, but done explicitly for testing)
    const increaseSupplyTx: ContractTransaction = await volcanoCoinContract
      .connect(ownerAccount)
      .increaseSupply();

    // wait for tx to be mined
    await increaseSupplyTx.wait();

    const totalSupply = await expectTotalSupply(
      volcanoCoinContract,
      currentSupply + CONTRACT_CONSTANTS.increaseSupplyAmount
    );

    currentSupply = totalSupply;
  });

  it("should revert increasing the total supply by 1000 when [increaseSupply] is called from a non-owner account", async () => {
    // to be reverted
    // https://hardhat.org/tutorial/testing-contracts.html#full-coverage
    // https://github.com/NomicFoundation/hardhat-hackathon-boilerplate/blob/master/test/Token.js#L97
    // https://ethereum-waffle.readthedocs.io/en/latest/matchers.html#revert
    await expect(volcanoCoinContract.connect(nonOwnerAccount).increaseSupply())
      .to.be.reverted;
  });

  it("should emit an event [TotalSupplyChange] when the total supply changes", async (done) => {
    volcanoCoinContract.once(
      CONTRACT_CONSTANTS.events.totalSupplyChange,
      (totalSupply) => {
        expect(totalSupply).to.equal(
          currentSupply + CONTRACT_CONSTANTS.increaseSupplyAmount
        );
        done();
      }
    );

    await volcanoCoinContract.connect(ownerAccount).increaseSupply();
  });
});
