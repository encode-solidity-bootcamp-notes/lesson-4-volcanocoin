import { expect } from "chai";
import { BigNumber } from "ethers";

import { deployTestContract, getTestSigningAccounts } from "./utils";
import { BIG_ZERO, CONTRACT_CONSTANTS } from "./constants";

import type { Signer } from "ethers";
import type { VolcanoCoin } from "../typechain";

describe("VolcanoCoin ERC20 compliance", () => {
  let ownerAccount: Signer;
  let spenderAccount: Signer;
  let otherAccount: Signer;
  let ownerAccountAddress: string,
    spenderAccountAddress: string,
    otherAccountAddress: string;

  before("get signing accounts", async () => {
    // get and assign the two signer accounts
    [
      [ownerAccount, ownerAccountAddress],
      [spenderAccount, spenderAccountAddress],
      [otherAccount, otherAccountAddress],
    ] = await getTestSigningAccounts();
  });

  describe("ERC20 Metadata view functions", () => {
    let volcanoCoinContract: VolcanoCoin;
    before("deploy test contract", async () => {
      volcanoCoinContract = await deployTestContract(ownerAccount);
    });

    it("name: returns the token name", async () =>
      expect(await volcanoCoinContract.name()).to.equal(
        CONTRACT_CONSTANTS.metadata.name
      ));

    it("symbol: returns the token symbol", async () =>
      expect(await volcanoCoinContract.symbol()).to.equal(
        CONTRACT_CONSTANTS.metadata.symbol
      ));

    it("decimals: returns the decimals of the token", async () =>
      expect(await volcanoCoinContract.decimals()).to.equal(
        CONTRACT_CONSTANTS.metadata.decimals
      ));

    it("totalSupply: returns the total (initial) supply of the token", async () =>
      expect(await volcanoCoinContract.totalSupply()).to.equal(
        CONTRACT_CONSTANTS.initialSupply
      ));
  });

  describe("approval and allowance of spender accounts", () => {
    describe("approve function", () => {
      let volcanoCoinContract: VolcanoCoin;
      before("deploy test contract", async () => {
        volcanoCoinContract = await deployTestContract(ownerAccount);
      });

      it("sets the allowance of the spender account if the value is less than or equal to the owner balance", async () => {
        const allowance = 1000;
        await volcanoCoinContract.approve(spenderAccountAddress, 1000);

        const spenderAllowance = await volcanoCoinContract.allowance(
          ownerAccountAddress,
          spenderAccountAddress
        );

        expect(spenderAllowance).to.equal(BigNumber.from(allowance));
      });

      it("when successful it emits an Approval event with (owner, spender, value) as output", async () => {
        const allowance = 1000;

        return expect(
          volcanoCoinContract.approve(spenderAccountAddress, allowance)
        )
          .to.emit(
            volcanoCoinContract,
            volcanoCoinContract.interface.events[
              "Approval(address,address,uint256)"
            ].name
          )
          .withArgs(ownerAccountAddress, spenderAccountAddress, allowance);
      });

      it("reverts if the allowance value is greater than the owner balance", async () => {
        const balance = await volcanoCoinContract.balanceOf(
          ownerAccountAddress
        );

        const allowance = balance.add(1000);

        return expect(
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

  describe("transferFrom function", () => {
    let volcanoCoinContract: VolcanoCoin;
    const spenderAllowance = BigNumber.from(1000);
    const transferAmount = BigNumber.from(100);

    before("deploy test contract", async () => {
      volcanoCoinContract = await deployTestContract(ownerAccount);
    });

    it("reverts if the caller (spender) does not have an allowance approved by the owner", async () =>
      expect(
        volcanoCoinContract
          .connect(spenderAccount)
          .transferFrom(ownerAccountAddress, otherAccountAddress, 1000)
      ).to.be.reverted);

    it("reverts if the allowance of the caller (spender) is less than the amount to be transferred", async () => {
      const currentBalance = await volcanoCoinContract.balanceOf(
        ownerAccountAddress
      );

      const amount = currentBalance.add(1000);

      return expect(
        volcanoCoinContract
          .connect(spenderAccount)
          .transferFrom(ownerAccountAddress, otherAccountAddress, amount)
      ).to.be.reverted;
    });

    it("transfers successfully if the caller (spender) allowance is less than or equal to the transfer amount", async () => {
      await volcanoCoinContract.approve(
        spenderAccountAddress,
        spenderAllowance
      );

      const allowance = await volcanoCoinContract.allowance(
        ownerAccountAddress,
        spenderAccountAddress
      );

      // sanity check of state
      expect(allowance).to.be.gte(transferAmount);

      return expect(() =>
        volcanoCoinContract
          .connect(spenderAccount)
          .transferFrom(
            ownerAccountAddress,
            otherAccountAddress,
            transferAmount
          )
      ).to.changeTokenBalances(
        volcanoCoinContract,
        [ownerAccount, otherAccount],
        [-transferAmount, transferAmount]
      );
    });

    it("when successful it emits a Transfer event with (from, to, amount) as output", async () => {
      // stateful based on previous test allowance
      const allowance = await volcanoCoinContract.allowance(
        ownerAccountAddress,
        spenderAccountAddress
      );

      // confirm expected state
      await expect(allowance).to.be.gte(transferAmount);

      return expect(
        volcanoCoinContract
          .connect(spenderAccount)
          .transferFrom(
            ownerAccountAddress,
            otherAccountAddress,
            transferAmount
          )
      )
        .to.emit(
          volcanoCoinContract,
          volcanoCoinContract.interface.events[
            "Transfer(address,address,uint256)"
          ].name
        )
        .withArgs(ownerAccountAddress, otherAccountAddress, transferAmount);
    });
  });
});
