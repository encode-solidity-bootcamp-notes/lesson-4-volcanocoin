import { BigNumber } from "ethers";

export const CONTRACT_CONSTANTS = {
  // NOTE: use BigNumber for compatability with call response values and waffle matchers
  initialSupply: BigNumber.from(10000),
  increaseSupplyAmount: BigNumber.from(1000),
  events: {
    transfer: "Transfer",
    totalSupplyChange: "TotalSupplyChange",
  },
};
