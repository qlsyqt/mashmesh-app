import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { nodeInfoState } from "store/atom";
import ApproveButton from "components/ApproveButton";
import { LoadingOutlined } from "@ant-design/icons";
import useWeb3Context from "hooks/useWeb3Context";
import { switchChain } from "lib/tool";
import useLenshubContract from "contract/useLenshubContract";
import useErc20Contract from "contract/useErc20Contract";
import useErc721Contract, { formatIPFS } from "contract/useErc721Contract";
import style from "../style.module.scss";
import IconHead from "assets/icons/lens-head.png";
import IconCopy from "assets/icons/copy.png";
import { copyToClipboard } from "lib/tool";
import BN from "bignumber.js";
import useFeeFollowContract from "contract/useFeeFollowContract";
import lensApi from "lib/lensApi";
import config from "config";

export default function Lens() {
  const [followBalance, setFollowBalance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nodeInfo] = useRecoilState(nodeInfoState);
  const [isFollowing, setIsFollowing] = useState(true);
  const [profileInfo, setProfileInfo] = useState({});
  const [feeInfo, setFeeInfo] = useState({});
  const [tokenInfo, setTokenInfo] = useState({});
  const lenshubContract = useLenshubContract();
  const erc721Contract = useErc721Contract();
  const erc20Contract = useErc20Contract();
  const feeFollowContract = useFeeFollowContract();
  const { account, chainId } = useWeb3Context();

  const doFollow = async () => {
    const res = await lenshubContract.follow(nodeInfo.profileId, feeInfo);
    if (res) {
      setFollowBalance((prev) => {
        prev.push(res.events.Transfer.returnValues.tokenId);
        return [...prev];
      });
    }
  };

  const doUnfollow = async () => {
    const res = await erc721Contract.burn(
      profileInfo.followNftAddress,
      followBalance[0]
    );
    if (res) {
      setFollowBalance((prev) => {
        prev.splice(0, 1);
        return [...prev];
      });
    }
  };

  const getProfile = async () => {
    setLoading(true);
    const profileInfoRaw = await lensApi.getProfileByHandle(nodeInfo.handle);
    setProfileInfo(profileInfoRaw);
    setLoading(false);

    const followBalanceRaw = await erc721Contract.getAll(
      profileInfoRaw.followNftAddress
    );
    setFollowBalance(followBalanceRaw);

    const feeInfoRaw = await feeFollowContract.getProfileData(
      nodeInfo.profileId
    );

    setFeeInfo(feeInfoRaw);
  };

  const getTokenInfo = async () => {
    const symbol = await erc20Contract.symbol(feeInfo.currency);
    const decimals = await erc20Contract.decimals(feeInfo.currency);
    setTokenInfo({
      symbol,
      decimals,
    });
  };

  useEffect(() => {
    if (!feeInfo.amount || feeInfo.amount === "0") {
      return;
    }
    getTokenInfo();
  }, [feeInfo]);

  useEffect(() => {
    if (!nodeInfo.handle || !account) {
      return;
    }
    getProfile();
  }, [account, nodeInfo.handle, chainId]);

  return (
    <div className={style.lesContent}>
      <div className={style.title}>Lens</div>
      <div>
        {loading ? (
          <LoadingOutlined className={style.loadingIcon} />
        ) : (
          <div className={style.lens}>
            <div className={style.lensHead}>
              {profileInfo?.coverPicture?.original?.url && (
                <img
                  alt=""
                  className={style.lensHeadBac}
                  src={formatIPFS(profileInfo?.coverPicture?.original?.url)}
                />
              )}

              {profileInfo?.picture?.original?.url ? (
                <img
                  alt=""
                  className={style.lensHeadPic}
                  src={formatIPFS(profileInfo?.picture?.original?.url)}
                />
              ) : (
                <img alt="" src={IconHead} className={style.lensHeadPic} />
              )}
            </div>
            <div className={style.lensInfo}>
              <div className={style.lensHeadTit}>{profileInfo.name}</div>
              <div className={style.lensHeadNm}>@{profileInfo.handle}</div>
              <div className={style.lensAmount}>
                <div>
                  <span>{profileInfo?.stats?.totalFollowers}</span> followers
                </div>
                <div>
                  <span>{profileInfo?.stats?.totalFollowing}</span> following
                </div>
              </div>
              <div className={style.lensContent}>{profileInfo.bio}</div>
              {account && (
                <>
                  {followBalance.length === 0 ? (
                    <>
                      <ApproveButton
                        skipCheck={
                          !feeInfo || !feeInfo.amount || feeInfo.amount === "0"
                        }
                        tokenAddress={feeInfo.currency}
                        contractAddress={config.contracts.lenshub}
                      >
                        <div className={style.lensBtn} onClick={doFollow}>
                          Follow
                        </div>
                      </ApproveButton>

                      {feeInfo.amount && tokenInfo.symbol && (
                        <div className="text-center">
                          Price:{" "}
                          {new BN(feeInfo.amount)
                            .shiftedBy(-tokenInfo.decimals)
                            .toString()}{" "}
                          {tokenInfo.symbol}
                        </div>
                      )}
                    </>
                  ) : (
                    <div
                      className={style.lensBtn}
                      onClick={doUnfollow}
                      onMouseEnter={() => setIsFollowing((prev) => !prev)}
                      onMouseLeave={() => setIsFollowing((prev) => !prev)}
                    >
                      {isFollowing ? "Following" : "Unfollow"}
                    </div>
                  )}
                </>
              )}
              {config.chainId !== chainId && (
                <a
                  className={style.switchHint}
                  onClick={() => switchChain(config.chainId)}
                >
                  Switch to polygon to continue.
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {nodeInfo.profileId && (
        <div className={style.lensDes}>
          ID：<span>{nodeInfo.profileId}</span>
        </div>
      )}

      {profileInfo.ownedBy && (
        <div className={style.lensDes}>
          Owner：
          <span>
            {profileInfo.ownedBy.slice(0, 3)}...{profileInfo.ownedBy.slice(-3)}{" "}
          </span>
          <img
            src={IconCopy}
            onClick={() => copyToClipboard(profileInfo.ownedBy)}
            className={style.copyIcon}
          />
        </div>
      )}

      {/* {nodeInfo.handle && (
        <div className={style.lensDes}>Handle：<span>{nodeInfo.handle}</span></div>
      )} */}

      {nodeInfo.value && (
        <div className={style.lensDes}>
          Pagerank：<span>{new BN(nodeInfo.value).times(10).toFixed(5)}</span>
        </div>
      )}

      {/* {profileInfo.imageURI && (
        <PropertyLine
          icon={IconLink}
          title="ImageURL"
          value={profileInfo.imageURI}
          valueType="image"
        />
      )}
      {account && (
        <>
          {followBalance.length === 0 ? (
            <ApproveButton
              tokenAddress={feeInfo.currency}
              contractAddress={config.contracts.lenshub}
            >
              <a onClick={doFollow}>Follow</a>
            </ApproveButton>
          ) : (
            <div>
              You are following this profile, click to{" "}
              <a onClick={doUnfollow}>Unfollow</a>
            </div>
          )}

          {feeInfo.amount && tokenInfo.symbol && (
            <div>
              Price:{" "}
              {new BN(feeInfo.amount).shiftedBy(-tokenInfo.decimals).toString()}{" "}
              {tokenInfo.symbol}
            </div>
          )}
        </>
      )} */}
    </div>
  );
}
