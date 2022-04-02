/* eslint-disable no-unused-expressions */
// to play well with chai property access expression assertions
// https://github.com/standard/standard/issues/690#issuecomment-278533482

import { expect } from "chai";
import { ethers } from "hardhat";

import { BigNumber } from "ethers";

import type { Signer, Contract, ContractTransaction } from "ethers";

const CONTRACT_CONSTANTS = {
  initialSupply: BigNumber.from(10000),
  increaseSupplyAmount: BigNumber.from(1000),
  events: {
    transfer: "Transfer",
    totalSupplyChange: "TotalSupplyChange",
  },
};

const expectTotalSupply = async (
  volcanoCoinContract: Contract,
  expectedSupply: BigNumber
) => {
  // https://docs.ethers.io/v5/api/utils/bignumber/
  const totalSupply: BigNumber = await volcanoCoinContract.getTotalSupply();

  expect(totalSupply).to.equal(expectedSupply);

  return totalSupply;
};

describe("VolcanoCoin", function () {
  let ownerAccount: Signer;
  let nonOwnerAccount: Signer;

  let volcanoCoinContract: Contract;
  let currentSupply = CONTRACT_CONSTANTS.initialSupply;

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

  describe("contract creation", () => {
    it("should compile and deploy without error", () =>
      expect(volcanoCoinContract).to.exist);

    it("should assign the owner to the account that created the contract", async () => {
      const owner = await volcanoCoinContract.getOwner();
      const ownerAccountAddress = await ownerAccount.getAddress();

      expect(owner).to.equal(ownerAccountAddress);
    });

    it("should have an initial supply of 10,000 tokens", () => async () => {
      const totalSupply = await expectTotalSupply(
        volcanoCoinContract,
        CONTRACT_CONSTANTS.initialSupply
      );

      // update current supply after assertion for consistency in downstream tests
      // can be done in expectTotalSupply helper but better to be explicit in tests for readability
      currentSupply = totalSupply;
    });

    it("should assign the initial supply to the owner account balance", async () => {
      const ownerAccountAddress = await ownerAccount.getAddress();
      const balance = await volcanoCoinContract.balanceOf(ownerAccountAddress);

      expect(balance).to.equal(CONTRACT_CONSTANTS.initialSupply);
    });
  });

  describe("getTotalSupply should be a publicly accessible function", () => {
    it("when called from the owner account it returns the total supply", () =>
      expectTotalSupply(volcanoCoinContract, CONTRACT_CONSTANTS.initialSupply));

    it("when called from a non-owner account it returns the total supply", () =>
      expectTotalSupply(
        volcanoCoinContract.connect(nonOwnerAccount),
        CONTRACT_CONSTANTS.initialSupply
      ));
  });

  describe("increaseSupply is a publicly accessible function that only the owner account can call", () => {
    it("when called from the owner account it increases the total supply by 1000", async () => {
      // call from owner account (implicit as first account in signers, but done explicitly for testing)
      const increaseSupplyTx: ContractTransaction = await volcanoCoinContract
        .connect(ownerAccount)
        .increaseSupply();

      // wait for tx to be mined
      await increaseSupplyTx.wait();

      const totalSupply = await expectTotalSupply(
        volcanoCoinContract,
        // https://docs.ethers.io/v5/api/utils/bignumber/#BigNumber--BigNumber--methods--math-operations
        currentSupply.add(CONTRACT_CONSTANTS.increaseSupplyAmount)
      );

      currentSupply = totalSupply;
    });

    // NOTE: not in spec but seems logical to include
    // remove skip to include test
    it.skip("[BONUS] when successful it assigns the increased supply to the owner account balance", async () => {
      const balance = await volcanoCoinContract.balanceOf(ownerAccount);
      expect(balance).to.equal(currentSupply);
    });

    // expect to be reverted
    // https://docs.soliditylang.org/en/develop/control-structures.html#revert
    // https://hardhat.org/tutorial/testing-contracts.html#full-coverage
    // https://ethereum-waffle.readthedocs.io/en/latest/matchers.html#revert
    it("when called from a non-owner account it reverts so as not to increase the total supply", () =>
      expect(volcanoCoinContract.connect(nonOwnerAccount).increaseSupply()).to
        .be.reverted);
  });

  describe("transfer is a publicly accessible function", () => {
    it("should revert if the caller account balance is less than the transfer amount", async () => {
      const recipientAddress = await ownerAccount.getAddress();
      const senderAddress = await nonOwnerAccount.getAddress();

      const initialBalanceOfSender = await volcanoCoinContract.balanceOf(
        senderAddress
      );
      // confirm expected initial state
      expect(initialBalanceOfSender).to.equal(BigNumber.from(0));

      expect(
        volcanoCoinContract
          .connect(nonOwnerAccount)
          .transfer(recipientAddress, 1000)
      ).to.be.reverted;
    });

    it("should transfer the amount from the caller balance to the recipient balance if the amount is less than or equal to current caller balance", async () => {
      const amount = 1000;
      const senderAddress = await ownerAccount.getAddress();
      const recipientAddress = await nonOwnerAccount.getAddress();

      expect(
        volcanoCoinContract
          .connect(ownerAccount)
          .transfer(recipientAddress, amount)
      ).to.changeTokenBalances(
        volcanoCoinContract,
        [senderAddress, recipientAddress],
        [-amount, amount]
      );
    });
  });

  describe("contract events", () => {
    it("emits a TotalSupplyChange event with the new total supply as output when the total supply changes", async () => {
      await expect(
        volcanoCoinContract.connect(ownerAccount).increaseSupply()
      ).to.emit(
        volcanoCoinContract,
        CONTRACT_CONSTANTS.events.totalSupplyChange
      );

      currentSupply = await volcanoCoinContract.getTotalSupply();
    });

    it("emits a Transfer event with (recipient address, amount) as output when a transfer occurs", async () => {
      const amount = 1000;
      const recipientAddress = await nonOwnerAccount.getAddress();

      // NOTE: you MUST await the expect
      // without await this will always pass! unintuitive..
      // https://github.com/TrueFiEng/Waffle/pull/684
      await expect(
        volcanoCoinContract
          .connect(ownerAccount)
          .transfer(recipientAddress, amount)
      )
        .to.emit(volcanoCoinContract, CONTRACT_CONSTANTS.events.transfer)
        .withArgs(recipientAddress, amount);
    });
  });
});
