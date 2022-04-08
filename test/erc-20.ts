import { ethers } from "hardhat";

import { BigNumber, Signer } from "ethers";
import type { VolcanoCoin } from "../typechain";
import { deployTestContract } from "./utils";
import { expect } from "chai";
import { BIG_ZERO } from "./constants";

describe("VolcanoCoin ERC20 adherence", () => {
  let ownerAccount: Signer;
  let spenderAccount: Signer;
  let nonOwnerAccount: Signer;
  let ownerAccountAddress: string,
    spenderAccountAddress: string,
    nonOwnerAccountAddress: string;

  before("get signing accounts", async () => {
    // get and assign the two signer accounts
    [ownerAccount, nonOwnerAccount, spenderAccount] = await ethers.getSigners();

    [ownerAccountAddress, spenderAccountAddress, nonOwnerAccountAddress] =
      await Promise.all(
        [ownerAccount, nonOwnerAccount, spenderAccount].map((signer) =>
          signer.getAddress()
        )
      );
  });

  describe("granting allowance to a spender", () => {
    describe("approve function", () => {
      let volcanoCoinContract: VolcanoCoin;
      before("deploy test contract", async () => {
        volcanoCoinContract = await deployTestContract(ownerAccount);
      });

      it("sets the allowance of the spender account if the value is <= the owner balance", async () => {
        const allowance = 1000;
        await volcanoCoinContract.approve(spenderAccountAddress, 1000);

        const spenderAllowance = await volcanoCoinContract.allowance(
          ownerAccountAddress,
          spenderAccountAddress
        );

        expect(spenderAllowance).to.equal(BigNumber.from(allowance));
      });

      it("reverts if the value is > the owner balance", async () => {
        const balance = await volcanoCoinContract.balanceOf(
          ownerAccountAddress
        );

        const allowance = balance.add(1000);

        await expect(
          volcanoCoinContract.approve(spenderAccountAddress, allowance)
        ).to.be.reverted;
      });
    });

    describe("view allowance", () => {
      let volcanoCoinContract: VolcanoCoin;
      before("deploy test contract", async () => {
        volcanoCoinContract = await deployTestContract(ownerAccount);
      });

      it("returns 0 if the spender has not been approved by the owner", async () => {
        const spenderAllowance = await volcanoCoinContract.allowance(
          ownerAccountAddress,
          spenderAccountAddress
        );

        expect(spenderAllowance).to.equal(BIG_ZERO);
      });

      it("returns the allowance value approved by the owner to the spender", async () => {
        const allowance = 1000;
        await volcanoCoinContract.approve(spenderAccountAddress, allowance);

        const spenderAllowance = await volcanoCoinContract.allowance(
          ownerAccountAddress,
          spenderAccountAddress
        );

        expect(spenderAllowance).to.equal(BigNumber.from(allowance));
      });
    });
  });
});
