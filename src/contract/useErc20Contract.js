import useWeb3Context from "hooks/useWeb3Context";
import Erc20Abi from "./abi/ERC20.json";
import BN from "bignumber.js";

export default function useErc20Contract() {
  const { web3, account, sendTx } = useWeb3Context();

  return {
    async allowance(tokenAddress, contractAddress) {
      const tokenContract = new web3.eth.Contract(Erc20Abi, tokenAddress);

      return await tokenContract.methods
        .allowance(account, contractAddress)
        .call();
    },

    async symbol(tokenAddress) {
      const tokenContract = new web3.eth.Contract(Erc20Abi, tokenAddress);
      return await tokenContract.methods.symbol().call();
    },

    async decimals(tokenAddress) {
      const tokenContract = new web3.eth.Contract(Erc20Abi, tokenAddress);
      return await tokenContract.methods.decimals().call();
    },

    async balanceOf(tokenAddress) {
      const tokenContract = new web3.eth.Contract(Erc20Abi, tokenAddress);
      const res = await tokenContract.methods.balanceOf(account).call();
      return new BN(res).shiftedBy(-18).toString();
    },

    async totalSupply(token) {
      const tokenContract = new web3.eth.Contract(Erc20Abi, token.address);
      return new Promise((resolve, reject) => {
        tokenContract.methods
          .totalSupply()
          .call()
          .then((res) => {
            resolve(new BN(res).shiftedBy(-token.decimals).toString());
          })
          .catch((err) => {
            console.log("Error", err);
            reject(err);
          });
      });
    },

    async approve(tokenAddress, contractAddress, amount) {
      const tokenContract = new web3.eth.Contract(Erc20Abi, tokenAddress);
      const func = tokenContract.methods.approve(contractAddress, amount);
      return await sendTx(func);
    },
  };
}
