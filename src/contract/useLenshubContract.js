import config from "../config";
import useErc721Contract from "./useErc721Contract";
import useWeb3Context from "hooks/useWeb3Context";
import useContract from "hooks/useContract";
import LenshubAbi from "./abi/Lenshub.json";

export default function useLenshubContract() {
  const { web3, sendTx, account } = useWeb3Context();
  const contract = useContract(LenshubAbi, config.contracts.lenshub);
  const erc721Contract = useErc721Contract();

  return {
    async getProfile(profileId) {
      return await contract.methods.getProfile(profileId).call();
    },
    async follow(profileId, feeInfo) {
      const initData = web3.eth.abi.encodeParameters(
        ["address", "uint256"],
        [feeInfo.currency, feeInfo.amount]
      );
      const func = contract.methods.follow([profileId], [initData]);
      return sendTx(func);
    },
    async unfollow(nftAddress, to, tokenId) {
      await erc721Contract.transferFrom(nftAddress, to, tokenId);
    },
    async getFollowNFT(profileId) {
      return await contract.methods.getFollowNFT(profileId).call();
    },
  };
}
