const envConf = require("./polygon");

export default {
  knn3Endpoint: "https://master.graphql.knn3.xyz/graphql",
  knn3Credentials: "https://credentials.knn3.xyz/api/#/",
  graphScan: "https://www.etherscan.com",
  graphProvider:
    "https://eth-mainnet.g.alchemy.com/v2/K9UhC2MV5uPm_j7WIRSWCrSJyaKg6Ggm",
  ...envConf,
};
