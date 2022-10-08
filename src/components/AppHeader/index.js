import React from "react";
import WalletButton from "components/WalletButton";
import { Link } from "react-router-dom";
import MashLogo from "assets/mash-logo.png";
import MashText from "assets/mash-text.png";
import Search from "components/Search";
import style from "./style.module.scss";

export default function AppHeader() {

  return (
    <div className={style.appHeader}>
      <div className={style.logoWrapper}>
        <Link to="/" className={style.logo}>
          <img src={MashLogo} className={style.logoImg} />
          <img src={MashText} className={style.logoText} />
        </Link>
      </div>
      <div
        className={style.headerRight}
      >
        <Search isHeader={true} />
        <WalletButton />
      </div>
    </div>
  );
}
