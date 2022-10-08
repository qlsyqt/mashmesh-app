import React, { useEffect, useState } from "react";
import config from "config";
import useWeb3Context from "hooks/useWeb3Context";
import BN from "bignumber.js";
import useErc20Contract from "contract/useErc20Contract";
import style from "./style.module.scss";

export default function ApproveButton({
  tokenAddress,
  contractAddress,
  children,
  skipCheck,
}) {
  const erc20Contract = useErc20Contract();
  const [allowance, setAllowance] = useState(0);
  const [approving, setApproving] = useState(false);
  const { account } = useWeb3Context();

  // default give max allowance
  const MAX_ALLOWANCE = new BN(2 ** 250 - 1).toFixed();

  const checkAllowance = async () => {
    const res = await erc20Contract.allowance(tokenAddress, contractAddress);
    console.log("allowance now is", res);
    setAllowance(res);
  };

  useEffect(() => {
    if (skipCheck || !tokenAddress || !contractAddress || !account) {
      return;
    }
    checkAllowance();
  }, [tokenAddress, contractAddress, account]);

  const doApprove = async () => {
    try {
      setApproving(true);
      await erc20Contract.approve(tokenAddress, contractAddress, MAX_ALLOWANCE);
      setAllowance(MAX_ALLOWANCE);
    } catch (err) {
      console.log("eeeee", err);
    } finally {
      setApproving(false);
    }
  };

  return allowance > 0 || skipCheck ? (
    children
  ) : (
    <a onClick={doApprove} className={style.flowApprove} disabled={approving}>
      {approving ? "Approving" : "Approve"}
    </a>
  );
}
