import React, {  useState } from "react";
import cn from "classnames";

import useWeb3Context from "hooks/useWeb3Context";
import style from "./style.module.scss";

export default function WalletButton({ menuLight, isTrans }) {
  const { account, connectWallet, resetWallet } = useWeb3Context();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  let timer = null;

  const onMouseEnterWalletButton = () => {
    clearTimeout(timer);
    setDropdownVisible(true);
  };

  const onMouseLeaveWalletButton = () => {
    timer = setTimeout(() => {
      setDropdownVisible(false);
    }, 100);
  };

  return account ? (
    <>
      <div
        className={cn(style.walletBtn)}
        onMouseEnter={onMouseEnterWalletButton}
        onMouseLeave={onMouseLeaveWalletButton}
      >
        {account.slice(0, 4)}...{account.slice(-4)}
      </div>
      {dropdownVisible && (
        <div
          className={cn(
            style.walletBtn,
            style.walletMenu,
            menuLight && style.menuLight,
            !menuLight && style.menuHeader
          )}
          onClick={resetWallet}
          onMouseEnter={onMouseEnterWalletButton}
          onMouseLeave={onMouseLeaveWalletButton}
        >
          Disconnect
        </div>
      )}
    </>
  ) : (
    <>
      <div
        className={cn(style.walletBtn, isTrans && style.isTrans)}
        onClick={connectWallet}
      >
        Connect wallet
      </div>
    </>
  );
}
