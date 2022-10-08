import React, { useState, useEffect } from "react";
import cn from "classnames";
import { Tooltip, Checkbox } from "antd";
import OutsideClickHandler from "react-outside-click-handler";
import { LoadingOutlined } from "@ant-design/icons";
import IconQuestion from "assets/icons/question.png";
import IconQuestionDark from "assets/icons/question-dark.svg";
import knn3 from "../../lib/knn3";
import BN from "bignumber.js";
import IconSearch from "assets/icons/search.png";
import IconSearchLight from "assets/icons/search-light.png";
import IconClose from "assets/icons/closer.svg";
import style from "./style.module.scss";

const initResult = {
  ens: [],
  addrs: [],
  lens: [],
};

const filterOptions = [
  {
    title: "Address",
    value: "address",
  },
  {
    title: "Domain",
    value: "domain",
    tooltip: "Include ENS and .bit",
  },
  {
    title: "Lens",
    value: "lens",
  },
];

export default function Search({ isHeader, isTrans }) {
  const [result, setResult] = useState(initResult);
  const [loading, setLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState([
    "address",
    "domain",
    "lens",
  ]);
  const [search, setSearch] = useState("");
  const [timer, setTimer] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [focusing, setFocusing] = useState(false);

  const debounce = (fn, delay) => {
    clearTimeout(timer);
    setTimer(setTimeout(fn, delay));
  };

  const searchByValue = async () => {
    const res = await knn3.searchByValue(search, searchFilters);
    setResult(res);
  };

  const clearSearch = () => {
    setSearch("");
    setResult(initResult);
  };

  const doSearch = async () => {
    if (loading) {
      setResult(initResult);
    }

    await searchByValue();

    setLoading(false);
  };

  const goLink = (url) => {
    setSearch("");
    window.location.href = url;
  };

  const SuggestionItem = ({ title, list, type }) => {
    return (
      <div className={style.section}>
        <div className={style.title}>{title}</div>
        <div className={style.content}>
          {type === "address" &&
            list.map((item) => (
              <a
                onClick={() => goLink(`/dashboard/address/${item.address}`)}
                className={style.item}
                key={item.address}
              >
                {item.address}
              </a>
            ))}

          {type === "ens" &&
            list.map((item) => (
              <a
                onClick={() => goLink(`/dashboard/address/${item.address}`)}
                key={item.ens}
                className={style.item}
              >
                <div>{item.ens}</div>
                {item.address && (
                  <div>
                    {item.address.slice(0, 4)}...{item.address.slice(-4)}
                  </div>
                )}
              </a>
            ))}
          {type === "lens" &&
            list[0].map((item) => (
              <a
                onClick={() => goLink(`/dashboard/lens/${item.handle}`)}
                className={style.item}
                key={item.account}
              >
                <div>{item.handle}</div>
                {item.value && (
                  <div>Pagerank: {new BN(item.value).times(10).toFixed(5)}</div>
                )}
              </a>
            ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (!search) {
      return;
    }
    setLoading(true);
    debounce(doSearch, 1000);
  }, [search]);

  const checkIsEmpty = () => {
    let empty = true;
    if (
      (result.ens && result.ens.length > 0) ||
      (result.addrs && result.addrs.length > 0) ||
      (result.lens && result.lens.length > 0)
    ) {
      empty = false;
    }
    setIsEmpty(empty);
  };

  useEffect(() => {
    checkIsEmpty();
  }, [result]);

  const SearchFilter = ({ lightMode }) => {
    return (
      <div className="text-left">
        <Checkbox.Group value={searchFilters} onChange={setSearchFilters}>
          <div className={style.searchFilter}>
            {filterOptions.map((item) => (
              <div className={style.searchItem} key={item.value}>
                <Checkbox value={item.value}>{item.title}</Checkbox>
                {item.tooltip && (
                  <Tooltip
                    title={item.tooltip}
                    overlayClassName="tooltip-white"
                  >
                    <img src={lightMode ? IconQuestionDark : IconQuestion} />
                  </Tooltip>
                )}
              </div>
            ))}
          </div>
        </Checkbox.Group>
      </div>
    );
  };

  return (
    <OutsideClickHandler
      onOutsideClick={() => {
        setSearch("");
        setFocusing(false);
      }}
    >
      {!isHeader && (
        <div className={style.searchFilterTopWrapper}>
          <SearchFilter />
        </div>
      )}
      <div
        className={cn(
          style.searchWrapper,
          (search || focusing) && style.withResult,
          isHeader && style.isHeader,
          isTrans && style.isTrans
        )}
      >
        <div className={cn(style.search, search && style.withResult)}>
          <img
            src={
              isTrans && !(focusing || search) ? IconSearchLight : IconSearch
            }
            className={style.iconSearch}
            alt="icon-search"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            className={style.input}
            placeholder="Search by Address, avatar or name of projects..."
          />
          {search && (
            <img
              src={IconClose}
              className={style.iconClose}
              onClick={clearSearch}
            />
          )}

          {/* {invalid && <div className={style.invalidHint}>Invalid entity</div>} */}
        </div>
        {isHeader && focusing && (
          <div className={style.searchFilterWrapper}>
            <SearchFilter lightMode={true} />
          </div>
        )}
        {(search || focusing) && (
          <div className={style.suggestion}>
            {loading && (
              <div className={style.hint}>
                <LoadingOutlined /> Loading...
              </div>
            )}
            {isEmpty && !loading && !focusing && (
              <div className={style.hint}>Entity not found</div>
            )}

            <>
              {result.addrs && result.addrs.length > 0 && (
                <SuggestionItem
                  title="Address"
                  list={result.addrs}
                  type="address"
                />
              )}

              {result.ens && result.ens.length > 0 && (
                <SuggestionItem title="ENS" list={result.ens} type="ens" />
              )}

              {result.lens && result.lens.length > 0 && (
                <SuggestionItem title="Lens" list={[result.lens]} type="lens" />
              )}
            </>
          </div>
        )}
      </div>
    </OutsideClickHandler>
  );
}
