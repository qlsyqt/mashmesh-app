import Web3 from "web3";
import { message } from "antd";
import config from "config";

const web3 = new Web3(config.graphProvider);

export const shortenAddr = (address, length = 3) => {
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

export function copyToClipboard(text) {
  const copied = document.createElement("input");
  copied.setAttribute("value", text);
  document.body.appendChild(copied);
  copied.select();
  document.execCommand("copy");
  document.body.removeChild(copied);
  message.success("Copied");
}

export const getAddrType = async (address) => {
  const code = await web3.eth.getCode(address);
  if (code === "0x") {
    return "EOA";
  } else {
    return "Contract";
  }
};

export const exportCanvasToPNG = (canvasElement) => {
  const downloadLink = document.createElement("a");
  downloadLink.setAttribute("download", "knn3-graph.png");
  downloadLink.setAttribute(
    "href",
    canvasElement
      .toDataURL("image/png")
      .replace(/^data:image\/[^;]/, "data:application/octet-stream")
  );
  downloadLink.click();
};

export const getNodeLabel = (item, nodeType, caption) => {
  caption = String(caption).toLowerCase();

  if (nodeType === "address") {
    if (caption === "ens" && item.ens && item.ens.length > 0) {
      return item.ens[0];
    } else if (item[caption] && caption === "address") {
      return shortenAddr(item[caption]);
    } else if (item[caption] && item[caption].length > 0) {
      return item[caption];
    } else if (item.ens && item.ens.length > 0) {
      return item.ens[0];
    } else if (item.name) {
      return item.name;
    } else if (item.address) {
      return shortenAddr(item.address);
    } else {
      return "";
    }
  } else if (nodeType === "lens") {
    if (item[caption]) {
      return item[caption];
    } else if (item.handle) {
      return item.handle;
    }
  }
};

export const filterDuplicateNodes = (arr, key = "id") => {
  return arr.filter((v, i, a) => a.findIndex((v2) => v2[key] === v[key]) === i);
};

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const switchChain = async (chainId) => {
  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: `0x${chainId.toString(16)}` }],
  });
};
