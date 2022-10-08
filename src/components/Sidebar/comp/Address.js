import React, { useEffect, useState } from "react";
import { Switch } from "antd";
import config from "config";
import { useRecoilState } from "recoil";
import { nodeInfoState } from "store/atom";
import { getAddrType, copyToClipboard, shortenAddr } from "lib/tool";
import IconCopy from "assets/icons/copy.png";
import cn from "classnames";
import style from "../style.module.scss";

export default function Address() {
  const [nodeInfo] = useRecoilState(nodeInfoState);
  const [ensVisible, setEnsVisible] = useState(false);
  const [lensVisible, setLensVisible] = useState(false);
  const [addressType, setAddressType] = useState("");

  const checkAddrType = async () => {
    setAddressType(await getAddrType(nodeInfo.address));
  };

  useEffect(() => {
    if (!nodeInfo.address) {
      return;
    }
    checkAddrType();
  }, [nodeInfo]);

  return (
    <div>
      <div>
        <div className={style.title}>Address</div>
        <div className={style.account}>
          <a
            href={`${config.graphScan}/address/${nodeInfo.address}`}
            target="_blank"
          >
            {shortenAddr(nodeInfo.address, 10)}
          </a>
          <img
            src={IconCopy}
            onClick={() => copyToClipboard(nodeInfo.address)}
            className={style.copyIcon}
          />
        </div>
        <div>
          {nodeInfo.ens && nodeInfo.ens.length > 0 && (
            <>
              <div className={style.infoLine}>
                <div className={style.info}>
                  <strong>ENS:</strong> {nodeInfo.ens[0]}
                </div>
              </div>
              {nodeInfo.ens.length > 1 && (
                <div className={style.switchWrapper}>
                  <Switch
                    checked={ensVisible}
                    onChange={setEnsVisible}
                    size="small"
                  />
                  Show all ENS
                </div>
              )}
            </>
          )}

          {ensVisible && (
            <div className={style.ensList}>
              {nodeInfo.ens.map((item) => (
                <div className={style.ensItem} key={item}>
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ marginTop: "12px" }}>
          {nodeInfo.lensInclude && nodeInfo.lensInclude.length > 0 && (
            <>
              <div className={style.infoLine}>
                <div className={style.info}>
                  <strong>LENS:</strong> {nodeInfo.lensInclude[0].handle}
                </div>
              </div>
              {nodeInfo.lensInclude.length > 1 && (
                <div className={style.switchWrapper}>
                  <Switch
                    checked={lensVisible}
                    onChange={setLensVisible}
                    size="small"
                  />
                  Show all LENS
                </div>
              )}
            </>
          )}

          {lensVisible && (
            <div className={style.ensList}>
              {nodeInfo.lensInclude.map((item) => (
                <div className={style.ensItem} key={item}>
                  {item.handle}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={cn(style.info, style.accountType)}>
          <strong>Type:</strong> {addressType}
        </div>
      </div>
    </div>
  );
}
