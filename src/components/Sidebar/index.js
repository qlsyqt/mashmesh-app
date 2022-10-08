import React from "react";
import { useRecoilState } from "recoil";
import { LoadingOutlined } from "@ant-design/icons";
import { nodeInfoState, nodeInfoLoadingState } from "store/atom";
import cn from "classnames";
import Address from "./comp/Address";
import Lens from "./comp/Lens";
import style from "./style.module.scss";

export default function Sidebar() {
  const [nodeInfo] = useRecoilState(nodeInfoState);
  const [nodeInfoLoading] = useRecoilState(nodeInfoLoadingState);

  return (
    <div className={cn(style.sidebar)}>
      <div className={style.sidebarWrapper}>
        {nodeInfoLoading ? (
          <div>
            <LoadingOutlined className={style.loadingIcon} />
          </div>
        ) : (
          <div>
            {nodeInfo.nodeType === "address" && <Address />}
            {nodeInfo.nodeType === "lens" && <Lens />}
          </div>
        )}
      </div>
    </div>
  );
}
