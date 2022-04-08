import { ethers } from "hardhat";

import type { Signer } from "ethers";
import { VolcanoCoin } from "../typechain";

/**
 * Deploys the VolcanoCoin contract and returns an instance of it for tests
 * @param ownerAccount the signer that deploys the contract
 * @param constructorArgs optional args to pass to .deploy()
 */
export const deployTestContract = async (
  ownerAccount: Signer,
  constructorArgs: any[] = []
) => {
  const VolcanoCoin = await ethers.getContractFactory("VolcanoCoin");

  const volcanoCoinContract: VolcanoCoin = await VolcanoCoin.connect(
    ownerAccount
  ).deploy(...constructorArgs);

  await volcanoCoinContract.deployed();

  return volcanoCoinContract;
};

/**
 * Destructure as many accounts as needed for tests
 * @note the first signer is the default signing account (if none is specified when deploying or calling a contract)
 *
 * For just signers:
 * @example
 * ```js
 * [[firstSigner], [secondSigner], ...] = await getTestSigningAccounts();
 * ```
 *
 * For signers and their addresses
 * @example
 * ```js
 * [
 *  [firstSigner, firstSignerAddress],
 *  [secondSigner, secondSignerAddress],
 *  ...
 * ] = await getTestSigningAccounts();
 * ```
 *
 * @returns signer and address pairs
 */
export const getTestSigningAccounts: () => Promise<
  [Signer, string][]
> = async () => {
  const signers = await ethers.getSigners();

  return Promise.all(
    signers.map(async (signer) => [signer, await signer.getAddress()])
  );
};
