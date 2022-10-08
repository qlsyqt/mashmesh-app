import React, { useEffect, useState } from "react";
import style from "./style.module.scss";
import Graph from "./comp/Graph";
import { LoadingOutlined } from "@ant-design/icons";
import { useRecoilState } from "recoil";
import {
  currentHighlightNodeState,
  nodeInfoState,
  nodeInfoListState,
  nodeInfoLoadingState,
  entityConfigState,
} from "store/atom";
import { filterDuplicateNodes, getNodeLabel } from "lib/tool";
import knn3 from "lib/knn3";
import { message } from "antd";

export default function GraphArea({ category, value }) {
  const [nodeInfo, setNodeInfo] = useRecoilState(nodeInfoState);
  const [currentHighlightNode] = useRecoilState(currentHighlightNodeState);
  const [nodeInfoList, setNodeInfoList] = useRecoilState(nodeInfoListState);
  const [entityConfig] = useRecoilState(entityConfigState);
  const [, setNodeInfoLoading] = useRecoilState(nodeInfoLoadingState);
  const [rootNodeExpanded, setRootNodeExpanded] = useState(false);
  const [graphData, setGraphData] = useState("");
  const [renderData, setRenderData] = useState("");

  const expandRootNode = async (_nodeInfo) => {
    switch (_nodeInfo.nodeType) {
      case "address":
        onExpand(_nodeInfo, "holdNfts", true);
        break;
      case "lens":
        onExpand(_nodeInfo, "followerAddrs", true);
        break;
    }
  };

  const generateRootNode = async (currentNodeInfo, originalItem) => {
    let result = await knn3.graph.getRootNode(
      currentNodeInfo,
      entityConfig,
      originalItem
    );
    if (result) {
      setGraphData(result);
    }
  };

  const generateRelation = async (currentNodeInfo, target) => {
    let result = await knn3.graph.getRelations(
      currentNodeInfo,
      target,
      entityConfig,
      graphData
    );
    if (result) {
      setGraphData(JSON.parse(JSON.stringify(result)));
    }
  };

  const regenerateGraph = async () => {
    if (!graphData) {
      return;
    }
    let result = await knn3.graph.regenerate(
      entityConfig,
      currentHighlightNode,
      graphData
    );

    if (result) {
      setGraphData(JSON.parse(JSON.stringify(result)));
    }
  };

  const getNodeInfo = async (nodeId, nodeType, generateRoot) => {
    const cachedNodeInfo = nodeInfoList[nodeId];
    if (cachedNodeInfo) {
      setNodeInfo(cachedNodeInfo);
      return;
    }

    let rootNodeLabel = "";
    let currentNodeInfo = {};
    let res = "";
    setNodeInfoLoading(true);
    if (nodeType === "address") {
      res = (await knn3.getAddress(nodeId, true))[0];
      rootNodeLabel = getNodeLabel(
        res,
        nodeType,
        entityConfig[nodeType].caption
      );
      currentNodeInfo = {
        nodeId,
        nodeType,
        ...res,
      };
      setNodeInfo(currentNodeInfo);
    } else if (nodeType === "lens") {
      res = (await knn3.getLens(nodeId, true))[0];
      console.log("111", res);
      rootNodeLabel = getNodeLabel(
        res,
        nodeType,
        entityConfig[nodeType].caption
      );

      currentNodeInfo = {
        nodeId,
        nodeType,
        ...res,
      };

      setNodeInfo(currentNodeInfo);
    }
    setNodeInfoLoading(false);
    setNodeInfoList((prev) => {
      return {
        ...prev,
        [nodeId]: currentNodeInfo,
      };
    });

    if (generateRoot) {
      localStorage.setItem(
        "storageSidebarInfo",
        JSON.stringify(currentNodeInfo)
      );
      generateRootNode(
        {
          nodeId,
          nodeType,
          nodeLabel: rootNodeLabel,
        },
        res
      );
    }
  };

  useEffect(() => {
    getNodeInfo(value, category, true);
  }, [category, value]);

  useEffect(() => {
    regenerateGraph();
  }, [entityConfig, currentHighlightNode]);

  useEffect(() => {
    if (!graphData) {
      return;
    }

    // todo, this condition is not quite accurate
    if (!rootNodeExpanded) {
      expandRootNode(graphData.nodes[0]);
      setRootNodeExpanded(true);
    }

    const formattedData = JSON.stringify({
      pathname: window.location.pathname,
      nodes: filterDuplicateNodes(graphData.nodes),
      edges: graphData.edges,
    });

    setRenderData(JSON.parse(formattedData));
  }, [graphData]);

  const onExpand = async (currentNodeInfo, target, muted) => {
    if (!muted) {
      message.loading({
        key: currentNodeInfo.nodeId,
        content: `Expanding`,
        duration: 0,
      });
    }

    try {
      await generateRelation(currentNodeInfo, target);
      if (!muted) {
        message.success({
          key: currentNodeInfo.nodeId,
          content: `Expanded`,
        });
      }
    } catch (err) {
      if (!muted) {
        message.info({
          key: currentNodeInfo.nodeId,
          content: err.message,
        });
      }
    }
  };

  const onFold = async (nodeId, nodeOrigin) => {
    let result = await knn3.graph.foldNodeRelations(
      nodeId,
      nodeOrigin,
      graphData
    );
    setGraphData(JSON.parse(JSON.stringify(result)));
    message.success(`Folded`);
  };

  const onNodeClick = async (e) => {
    const { nodeId, nodeType } = e.item._cfg.model;
    if (nodeInfo.nodeId === nodeId) {
      return;
    }
    getNodeInfo(nodeId, nodeType, false);
  };

  const onEdgeClick = async (e) => {
    console.log("Edge click", e.item._cfg.model);
  };

  if (!renderData) {
    return (
      <div className={style.loading}>
        <LoadingOutlined className={style.loadingIcon} />
      </div>
    );
  }

  return (
    <div className={style.graphArea}>
      <Graph
        renderData={renderData}
        onFold={onFold}
        onExpand={onExpand}
        onEdgeClick={onEdgeClick}
        onNodeClick={onNodeClick}
      />
    </div>
  );
}
