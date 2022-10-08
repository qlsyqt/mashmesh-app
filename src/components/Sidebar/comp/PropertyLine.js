import React, { useState } from "react";
import config from "config";
import { copyToClipboard } from "lib/tool";
import IconCopy from "assets/icons/copy.png";
import style from "../style.module.scss";

export default function PropertyLine({ icon, title, value, valueType }) {
  const [imgPos, setImgPos] = useState([-400, -400]);
  // const onEnterImg = (e) => {
  //   setImgPos((prev) => {
  //     prev[0] = e.pageX + 24;
  //     prev[1] = e.pageY + 24;
  //     return [...prev];
  //   });
  // };

  // const onLeaveImg = (e) => {
  //   setImgPos((prev) => {
  //     prev[0] = -400;
  //     prev[1] = -400;
  //     return [...prev];
  //   });
  // };

  return (
    <div className={style.propertyLine}>
      <img src={icon} className={style.icon} />
      <div className={style.title}>{title}</div>
      {valueType === "image" && (
        <>
          <img
            src={value}
            className={style.valueIcon}
            // onMouseEnter={onEnterImg}
            // onMouseLeave={onLeaveImg}
          />
{/* 
          <img
            src={value}
            className={style.valueIconBig}
            style={{ left: imgPos[0], top: imgPos[1] }}
          /> */}
        </>
      )}
      {valueType === "contract" && (
        <>
          <a
            href={`${config.graphScan}/address/${value}`}
            className={style.valueContract}
            target="_blank"
          >
            {value.slice(0, 3)}...{value.slice(-3)}{" "}
          </a>
          <img
            src={IconCopy}
            onClick={() => copyToClipboard(value)}
            className={style.copyIcon}
          />
        </>
      )}
      {!valueType && <div className={style.value}>{value}</div>}
    </div>
  );
}
