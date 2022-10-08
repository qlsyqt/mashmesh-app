import React from "react";
import Search from "../../components/Search";
import WalletButton from "components/WalletButton";
import LogoRed from "../../assets/logo-red.png";
import LogoHome from "../../assets/logo.gif";
import style from "./style.module.scss";

export default function Home() {
  return (
    <div className={style.homepage}>
      <div className={style.top}>
        <div className={style.slogan}>
          <div>Web3 Relationship Explorer</div>
          <div className={style.poweredBy}>
            Powered by <img src={LogoRed} className={style.logoRed} />
          </div>
        </div>

        <div className={style.walletWrapper}>
          <WalletButton menuLight={true} isTrans={true} />
        </div>
      </div>

      <div className="container">
        <div className={style.sloganWrapper}>
          <img src={LogoHome} className={style.logoHome} />
        </div>

        <Search isTrans={true} />
      </div>
    </div>
  );
}
