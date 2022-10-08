import config from "../config";
import useErc721Contract from "./useErc721Contract";
import useWeb3Context from "hooks/useWeb3Context";
import useContract from "hooks/useContract";
import FeeFollowAbi from "./abi/FeeFollow.json";

export default function useLenshubContract() {
  const { web3, sendTx, account } = useWeb3Context();
  const contract = useContract(FeeFollowAbi, config.contracts.feeFollow);

  return {
    async invite(addresses, profileId) {
      const func = contract.methods.invite(addresses, profileId);
      return await sendTx(func);
    },
    async getProfileData(profileId) {
      return await contract.methods.getProfileData(profileId).call();
    },
  };
}
