import { useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import axios from "axios";
import Erc721Abi from "./abi/ERC721.json";

export const formatIPFS = (val) => {
  if (!val) {
    return val;
  }
  if (val.indexOf("ipfs://") > -1) {
    return val.replace("ipfs://", "https://lens.infura-ipfs.io/ipfs/");
  } else {
    return val;
  }
};

export default function useERC721Contract() {
  const { account, sendTx, web3 } = useContext(Web3Context);

  return {
    async isApprovedForAll(nftAddress, spender) {
      const contract = new web3.eth.Contract(Erc721Abi, nftAddress);

      return await contract.methods.isApprovedForAll(account, spender).call();
    },
    async transferFrom(nftAddress, toAddress, tokenId) {
      const contract = new web3.eth.Contract(Erc721Abi, nftAddress);
      const func = contract.methods.transferFrom(account, toAddress, tokenId);
      sendTx(func);
    },
    async setApprovalForAll(nftAddress, spender) {
      const contract = new web3.eth.Contract(Erc721Abi, nftAddress);

      const func = contract.methods.setApprovalForAll(spender, true);
      return await sendTx(func);
    },
    async tokenURI(nftAddress, id) {
      const contract = new web3.eth.Contract(Erc721Abi, nftAddress);

      return await contract.methods.tokenURI(id).call();
    },
    async balanceOf(nftAddress) {
      const contract = new web3.eth.Contract(Erc721Abi, nftAddress);

      const balance = await contract.methods.balanceOf(account).call();
      return balance;
    },
    async getNftInfo(nftAddress, tokenId) {
      const contract = new web3.eth.Contract(Erc721Abi, nftAddress);

      const tokenURIRaw = await contract.methods.tokenURI(tokenId).call();

      const tokenURI = formatIPFS(tokenURIRaw);
      const res = (await axios.get(tokenURI)).data;
      // const res = {"name":"ChaChaSwapPassTest","image":"ipfs://bafybeiflkkftflvs7hszhsqhhb7lqimoiinc4o5ootnjwpsv7jltrnkona","external_url":"","attributes":[],"description":"test nft # 15"}
      res.imageUri = formatIPFS(res.image);
      res.name = res.name.replace(/#\d*$/, "");
      return res;
    },
    //TODO.need optimize , move to store
    async getAll(nftAddress) {
      const contract = new web3.eth.Contract(Erc721Abi, nftAddress);
      // get total num
      const num = await contract.methods.balanceOf(account).call();

      let list = [];

      for (let i = 0; i < num; i++) {
        const tokenId = await contract.methods
          .tokenOfOwnerByIndex(account, i)
          .call();

        console.log('to id', tokenId)

        list.push(tokenId);

        // todo, need backend add tokenURI
        // const nftInfo = await this.getNftInfo(nftAddress, tokenId);
        // list.push(nftInfo);
      }

      return list;
    },
    async totalSupply(nftAddress) {
      const contract = new web3.eth.Contract(Erc721Abi, nftAddress);
      return await contract.methods.totalSupply().call();
    },
    async getName(nftAddress) {
      const contract = new web3.eth.Contract(Erc721Abi, nftAddress);
      return await contract.methods.name().call();
    },
    async burn(nftAddress, tokenId) {
      const contract = new web3.eth.Contract(Erc721Abi, nftAddress);
      const func = contract.methods.burn(tokenId);
      return await sendTx(func);
    },
    async mint(nftAddress, to, tokenId) {
      const contract = new web3.eth.Contract(Erc721Abi, nftAddress);

      const func = contract.methods.mint(to, tokenId);
      return await sendTx(func);
    },
  };
}
