/* eslint-disable no-unused-expressions */
// to play well with chai property access expression assertions
// https://github.com/standard/standard/issues/690#issuecomment-278533482

import { expect } from "chai";
import { ethers } from "hardhat";

import { BigNumber } from "ethers";

import type { Signer } from "ethers";
import { BIG_ZERO, CONTRACT_CONSTANTS } from "./constants";

// NOTE: this will recognize all the typings of the contract
// if you just use Contract type it is generic
import { VolcanoCoin } from "../typechain";

describe("VolcanoCoin", function () {
  let ownerAccount: Signer;
  let nonOwnerAccount: Signer;

  let volcanoCoinContract: VolcanoCoin;
  before("compile and deploy the contract", async () => {
    // get and assign the two signer accounts
    const [first, second] = await ethers.getSigners();
    ownerAccount = first;
    nonOwnerAccount = second;

    const VolcanoCoin = await ethers.getContractFactory("VolcanoCoin");

    // deploy the contract with the owner account as the signer
    // https://hardhat.org/guides/waffle-testing.html#testing-from-a-different-account
    // https://docs.ethers.io/v5/single-page/#/v5/api/contract/contract-factory/-%23-ContractFactory-connect
    volcanoCoinContract = await VolcanoCoin.connect(ownerAccount).deploy();

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

    it("should have an initial supply of 10,000 tokens", () => async () =>
      expect(await volcanoCoinContract.totalSupply()).to.equal(
        CONTRACT_CONSTANTS.initialSupply
      ));

    it("should assign the initial supply to the owner account balance", async () => {
      const ownerAccountAddress = await ownerAccount.getAddress();
      const balance = await volcanoCoinContract.balanceOf(ownerAccountAddress);

      expect(balance).to.equal(CONTRACT_CONSTANTS.initialSupply);
    });
  });

  describe("publicly accessible view functions", () => {
    it("totalSupply: returns the current total supply", async () => {
      expect(await volcanoCoinContract.totalSupply()).to.equal(
        CONTRACT_CONSTANTS.initialSupply
      );

      expect(
        await volcanoCoinContract.connect(nonOwnerAccount).totalSupply()
      ).to.equal(CONTRACT_CONSTANTS.initialSupply);
    });

    it("balanceOf: returns the current balance of the specified account argument", async () => {
      const ownerAccountAddress = await ownerAccount.getAddress();
      const nonOwnerAccountAddress = await nonOwnerAccount.getAddress();

      const ownerBalance = await volcanoCoinContract
        .connect(ownerAccount)
        .balanceOf(ownerAccountAddress);

      expect(ownerBalance).to.equal(CONTRACT_CONSTANTS.initialSupply);

      const nonOwnerBalance = await volcanoCoinContract
        .connect(nonOwnerAccount)
        .balanceOf(nonOwnerAccountAddress);

      expect(nonOwnerBalance).to.equal(BIG_ZERO);
    });

    describe("paymentsFrom: returns the payments sent from the specified account argument", () => {
      it("returns an empty array if no payments have been made from the account", async () => {
        const ownerAccountAddress = await ownerAccount.getAddress();
        const payments = await volcanoCoinContract.paymentsFrom(
          ownerAccountAddress
        );

        expect(payments).to.have.lengthOf(0);
      });

      it("returns an array of Payment ({ recipient, amount }) when payments have been made from the account", async () => {
        const amount = 1000;
        const ownerAccountAddress = await ownerAccount.getAddress();
        const nonOwnerAccountAddress = await nonOwnerAccount.getAddress();

        await volcanoCoinContract
          .connect(ownerAccount)
          .transfer(nonOwnerAccountAddress, amount);

        const ownerPayments = await volcanoCoinContract.paymentsFrom(
          ownerAccountAddress
        );

        expect(ownerPayments).to.have.lengthOf(1);

        const [ownerPayment] = ownerPayments;
        expect(ownerPayment.to).to.equal(nonOwnerAccountAddress);
        expect(ownerPayment.amount).to.equal(BigNumber.from(amount));

        // send back to confirm same behavior from non owner account

        await volcanoCoinContract
          .connect(nonOwnerAccount)
          .transfer(ownerAccountAddress, amount);

        const nonOwnerPayments = await volcanoCoinContract.paymentsFrom(
          nonOwnerAccountAddress
        );

        expect(nonOwnerPayments).to.have.lengthOf(1);

        const [nonOwnerPayment] = nonOwnerPayments;
        expect(nonOwnerPayment.to).to.equal(ownerAccountAddress);
        expect(nonOwnerPayment.amount).to.equal(BigNumber.from(amount));
      });
    });
  });

  describe("increaseSupply is a publicly accessible function that only the owner account can call", () => {
    it("when called from the owner account it increases the total supply by 1000", async () => {
      const previousTotalSupply: BigNumber =
        await volcanoCoinContract.totalSupply();

      // call from owner account (implicit as first account in signers, but done explicitly for testing)
      await volcanoCoinContract.connect(ownerAccount).increaseSupply();

      const currentTotalSupply: BigNumber =
        await volcanoCoinContract.totalSupply();

      // https://docs.ethers.io/v5/api/utils/bignumber/#BigNumber--BigNumber--methods--math-operations
      const expectedSupply = previousTotalSupply.add(
        CONTRACT_CONSTANTS.increaseSupplyAmount
      );

      expect(currentTotalSupply).to.equal(expectedSupply);
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
      expect(initialBalanceOfSender).to.equal(BIG_ZERO);

      expect(
        volcanoCoinContract
          .connect(nonOwnerAccount)
          .transfer(recipientAddress, 1000)
      ).to.be.reverted;
    });

    it("should transfer the amount from the caller balance to the recipient balance if the amount is less than or equal to current caller balance", async () => {
      const amount = 1000;
      const recipientAddress = await nonOwnerAccount.getAddress();

      // NOTE: you MUST pass a callback that invokes the transfer function
      // otherwise get cryptic error: TypeError: transactionCall is not a function
      // https://ethereum-waffle.readthedocs.io/en/latest/matchers.html#change-token-balance
      await expect(() =>
        volcanoCoinContract
          .connect(ownerAccount)
          .transfer(recipientAddress, amount)
      ).to.changeTokenBalances(
        volcanoCoinContract,
        [ownerAccount, nonOwnerAccount],
        [-amount, amount]
      );
    });
  });

  describe("contract events", () => {
    it("emits a TotalSupplyChange event with the new total supply as output when the total supply changes", () =>
      expect(
        volcanoCoinContract.connect(ownerAccount).increaseSupply()
      ).to.emit(
        volcanoCoinContract,
        volcanoCoinContract.interface.events["TotalSupplyChange(uint256)"].name
      ));

    it("emits a Transfer event with (from, to, amount) as output when a transfer occurs", async () => {
      const amount = 1000;
      const fromAddress = await ownerAccount.getAddress();
      const toAddress = await nonOwnerAccount.getAddress();

      // NOTE: you MUST await (or return the promise) the expect
      // without await this will always pass! unintuitive..
      // https://github.com/TrueFiEng/Waffle/pull/684
      await expect(
        volcanoCoinContract.connect(ownerAccount).transfer(toAddress, amount)
      )
        .to.emit(
          volcanoCoinContract,
          volcanoCoinContract.interface.events[
            "Transfer(address,address,uint256)"
          ].name
        )
        .withArgs(fromAddress, toAddress, amount);
    });
  });

  // remove .skip to run
  describe.skip("[BONUS] additional requirements to try implementing", () => {
    it("increaseTotalSupply: assigns the increased supply to the owner account balance when successful", async () => {
      const ownerAccountAddress = await ownerAccount.getAddress();
      const initialBalance: BigNumber = await volcanoCoinContract.balanceOf(
        ownerAccountAddress
      );

      await volcanoCoinContract.connect(ownerAccount).increaseSupply();
      const balanceAfterIncrease = await volcanoCoinContract.balanceOf(
        ownerAccountAddress
      );

      const expectedBalance = initialBalance.add(
        CONTRACT_CONSTANTS.increaseSupplyAmount
      );

      expect(balanceAfterIncrease).to.equal(expectedBalance);
    });

    // THINK: does this actually make balances private? can they be determined by other means?
    it("balanceOf: reverts if a non-owner caller requests the balance of someone else's account", async () => {
      const ownerAccountAddress = await ownerAccount.getAddress();

      await expect(
        volcanoCoinContract
          .connect(nonOwnerAccount)
          .balanceOf(ownerAccountAddress)
      ).to.be.reverted;
    });
  });
});
