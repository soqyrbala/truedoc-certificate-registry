require("@nomicfoundation/hardhat-toolbox");

/** Local development network only (Hardhat Network). No real funds, no public networks. */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
};
