import { ethers } from "hardhat";

import type { Signer } from "ethers";
import { VolcanoCoin } from "../typechain";

export const deployTestContract = async (ownerAccount: Signer) => {
  const VolcanoCoin = await ethers.getContractFactory("VolcanoCoin");

  const volcanoCoinContract: VolcanoCoin = await VolcanoCoin.connect(
    ownerAccount
  ).deploy();

  await volcanoCoinContract.deployed();

  return volcanoCoinContract;
};
