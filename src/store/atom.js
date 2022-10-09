import { atom } from "recoil";

export const nodeInfoState = atom({
  key: "nodeInfo",
  default: {},
});

// cache nodeInfo list
export const nodeInfoListState = atom({
  key: "nodeInfoList",
  default: {},
});

export const nodeInfoLoadingState = atom({
  key: "nodeInfoLoading",
  default: false,
});

export const currentHighlightNodeState = atom({
  key: "currentHighlightNode",
  default: "",
});

export const entityConfigState = atom({
  key: "entityConfigState",
  default: {
    address: {
      size: "Medium",
      color: "#313131",
      caption: "ENS",
    },
    nft: {
      size: "Medium",
      color: "#188D90",
      caption: "Name",
    },
    token: {
      size: "Medium",
      color: "#DEA600",
      caption: "Symbol",
    },
    event: {
      size: "Medium",
      color: "#95BAAD",
      caption: "Name",
    },
    twitter: {
      size: "Medium",
      color: "#1DA1F2",
      caption: "Name",
    },
    avatar: {
      size: "Medium",
      color: "#4600AB",
      caption: "ID",
    },
    space: {
      size: "Medium",
      color: "#00D0FF ",
      caption: "Name",
    },
    bit: {
      size: "Medium",
      color: "#00B871",
      caption: "Account",
    },
    lens: {
      size: "Medium",
      color: "#00B871",
      caption: "Handle",
    },
  },
});
