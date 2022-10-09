import { gql, GraphQLClient } from "graphql-request";
import config from "config";
import { Utils } from "@antv/graphin";
import { message } from "antd";
import { getNodeLabel, filterDuplicateNodes } from "../tool";

const nodeSizeMapping = {
  Min: 24,
  Medium: 48,
  Max: 66,
};

const iconSizeMapping = {
  Min: 16,
  Medium: 32,
  Max: 44,
};

const client = new GraphQLClient(config.knn3Endpoint);

const defaultPagination = {
  limit: 20,
  offset: 0,
  expandable: true,
};

const defaultPaginationObject = {
  followerAddrs: defaultPagination,
  followLens: defaultPagination,
  lensInclude: defaultPagination,
};

const getNode = (nodeInfo, parent = "", parentNodes = []) => {
  const { nodeId, nodeType, nodeLabel, nodeSize, nodeColor, nodeOrigin } =
    nodeInfo;
  let nodeStyle = {};

  if (nodeType === "address") {
    nodeStyle = {
      icon: {
        type: "image",
        value: "/nodeIcon/address.png",
        size: iconSizeMapping[nodeSize],
      },
      keyshape: {
        fill: nodeColor,
        size: nodeSizeMapping[nodeSize],
        fillOpacity: 1,
        stroke: "#575757",
        lineWidth: 2,
      },
    };
  } else if (nodeType === "lens") {
    nodeStyle = {
      icon: {
        type: "image",
        value: "/nodeIcon/lens.png",
        size: iconSizeMapping[nodeSize],
      },
      keyshape: {
        fill: nodeColor,
        size: nodeSizeMapping[nodeSize],
        fillOpacity: 1,
        stroke: "#575757",
        lineWidth: 2,
      },
    };
  }

  return {
    id: nodeId,
    fixed: false,
    nodeId,
    nodeType,
    nodeOrigin,
    // set default pagination for every nodes
    pagination: defaultPaginationObject,
    style: {
      label: {
        value: nodeLabel,
      },
      ...nodeStyle,
    },
    parent,
    parentNodes,
  };
};

const handleMultipleEdges = (edges) => {
  const res = filterDuplicateNodes(edges, "joinedId");
  return Utils.processEdges(res);
};

const getEdge = (
  source,
  target,
  label,
  parent = "",
  parentNodes = []
) => {
  return {
    joinedId: `${source}-${target}`,
    source,
    target,
    style: {
      label: {
        value: label,
      },
    },
    parent,
    parentNodes,
  };
};

const getTargetScript = (val, pagi) => {
  pagi = JSON.stringify({ offset: pagi.offset, limit: pagi.limit + 1 }).replace(
    /"/g,
    ""
  );

  switch (val) {
    case "followerAddrs":
      return `
      followerAddrs(options:${pagi}){
        address,
        name,
        ens,
      }
    `;
    case "lensInclude":
      return `
      lensInclude(options:${pagi}){
        handle,
        profileId,
      }
    `;
    case "followLens":
      return `
      followLens(options:${pagi}){
        handle,
        profileId,
      }
    `;
  }
};

const regenerate = async (entityConfig, highlightNode, graphData) => {
  let highlightFound = false;

  graphData.nodes.forEach((item) => {
    const { nodeType } = item;

    if (highlightNode === item.id) {
      highlightFound = true;
    }

    const nodeConfig = entityConfig[nodeType];
    item.style = {
      // todo, there's a bug with graphin, will not render immediately
      icon: {
        ...item.style.icon,
        size: iconSizeMapping[nodeConfig.size],
      },
      label: {
        value: getNodeLabel(item.originalItem, nodeType, nodeConfig.caption),
      },
      keyshape: {
        fill: nodeConfig.color,
        size: nodeSizeMapping[nodeConfig.size],
      },
    };
    item.status = {
      selected: highlightNode === item.id,
    };
  });

  if (highlightNode && !highlightFound) {
    message.info("Highlight node is not found, please keep expanding.");
  }
  return graphData;
};

const getRelations = async (
  nodeInfo,
  target,
  entityConfig,
  originalGraphData
) => {
  const { nodeId, nodeType, pagination } = nodeInfo;
  // force address lowercase
  if (nodeType === "address") {
    return await getAddressRelations(
      nodeId,
      target,
      pagination[target],
      entityConfig,
      originalGraphData
    );
  } else if (nodeType === "lens") {
    return await getLensRelations(
      nodeId,
      target,
      pagination[target],
      entityConfig,
      originalGraphData
    );
  }
};

const foldNodeRelations = async (id, nodeOrigin, originalGraphData) => {
  let nextNodes = [];
  let nextEdges = [];

  let prevNodes = originalGraphData.nodes;
  let prevEdges = originalGraphData.edges;

  // fold all children
  let nodesToRemove = [];
  let edgesToRemove = [];

  // fold certain node type
  if (nodeOrigin) {
    prevNodes.forEach((item) => {
      console.log("origin ", item.nodeOrigin, nodeOrigin);
      if (item.parent === id && item.nodeOrigin === nodeOrigin && !item.fixed) {
        // remove self
        nodesToRemove.push(item.id);
        // remove all children
        prevNodes.forEach((i) => {
          if (i.parentNodes.indexOf(item.id) > -1) {
            nodesToRemove.push(i.id);
          }
        });
      }
    });
  } else {
    prevNodes.forEach((item) => {
      if (
        item.parentNodes.indexOf(id) > -1 &&
        !(item.fixed && item.parent === id)
      ) {
        nodesToRemove.push(item.id);
      }
    });
  }

  prevEdges.forEach((item) => {
    if (
      nodesToRemove.indexOf(item.source) > -1 ||
      nodesToRemove.indexOf(item.target) > -1
    ) {
      edgesToRemove.push(item.id);
    }
  });

  nextNodes = prevNodes.filter((item) => nodesToRemove.indexOf(item.id) === -1);
  nextEdges = prevEdges.filter((item) => edgesToRemove.indexOf(item.id) === -1);

  // clear current pagination
  nextNodes
    .filter((item) => item.id === id)
    .forEach((item) => (item.pagination = defaultPaginationObject));

  return {
    nodes: nextNodes,
    edges: handleMultipleEdges(nextEdges),
  };
};

const getRootNode = async (nodeInfo, entityConfig, originalItem) => {
  const { nodeType } = nodeInfo;
  nodeInfo.nodeSize = entityConfig[nodeType].size;
  nodeInfo.nodeColor = entityConfig[nodeType].color;
  const rootNode = getNode(nodeInfo);
  rootNode.originalItem = originalItem;
  return {
    nodes: [rootNode],
    edges: [],
  };
};

const checkResponseLength = (list) => {
  if (list.length > 0) {
    return true;
  } else {
    throw new Error("You have expanded all nodes.");
  }
};

const getAddressRelations = async (
  address,
  target,
  pagi,
  entityConfig,
  originalGraphData
) => {
  // add pagination config here
  const targetScript = getTargetScript(target, pagi);

  // get element who triggered expand
  const triggerNode = originalGraphData.nodes.filter(
    (item) => item.id === address
  )[0];

  const query = gql`
      {
        addrs(where: { address: "${address}"}) {
          address,
          name,
          ens,
          ${targetScript},
        }
      }
    `;

  let res = (await client.request(query)).addrs[0];

  if (res) {
    originalGraphData.nodes
      .filter((item) => item.id === address)
      .forEach((targetNode) => {
        const previousPaginationOffset = targetNode?.pagination[target]?.offset;
        targetNode.pagination = {
          ...targetNode.pagination,
          [target]: {
            offset: previousPaginationOffset + defaultPagination.limit,
            limit: defaultPagination.limit,
            expandable: res[target].length > defaultPagination.limit,
          },
        };
      });

    const parentNodes = triggerNode.parentNodes
      ? triggerNode.parentNodes.concat(res.address)
      : [res.address];

    const allNodesOnGraph = originalGraphData.nodes.map((item) => item.id);

    if (target === "lensInclude") {
      if (!checkResponseLength(res[target])) {
        return;
      }
      res[target].forEach((item) => {
        if (allNodesOnGraph.indexOf(item.handle) === -1) {
          originalGraphData.nodes.push({
            ...getNode(
              {
                nodeId: item.handle,
                nodeType: "lens",
                nodeLabel: getNodeLabel(
                  item,
                  "lens",
                  entityConfig["lens"].caption
                ),
                nodeSize: entityConfig["lens"].size,
                nodeColor: entityConfig["lens"].color,
                nodeOrigin: target,
              },
              res.address,
              parentNodes
            ),
            originalItem: item,
          });
        }

        originalGraphData.edges.push(
          getEdge(res.address, item.handle, "Own", res.address, parentNodes)
        );
      });
    }

    if (target === "followLens") {
      if (!checkResponseLength(res[target])) {
        return;
      }
      res[target].forEach((item) => {
        if (allNodesOnGraph.indexOf(item.handle) === -1) {
          originalGraphData.nodes.push({
            ...getNode(
              {
                nodeId: item.handle,
                nodeType: "lens",
                nodeLabel: getNodeLabel(
                  item,
                  "lens",
                  entityConfig["lens"].caption
                ),
                nodeSize: entityConfig["lens"].size,
                nodeColor: entityConfig["lens"].color,
                nodeOrigin: target,
              },
              res.address,
              parentNodes
            ),
            originalItem: item,
          });
        }
        originalGraphData.edges.push(
          getEdge(res.address, item.handle, "Follow", res.address, parentNodes)
        );
      });
    }

  }

  originalGraphData.edges = handleMultipleEdges(originalGraphData.edges);

  return originalGraphData;
};

const getLensRelations = async (
  id,
  target,
  pagi,
  entityConfig,
  originalGraphData
) => {
  const targetScript = getTargetScript(target, pagi);

  const triggerNode = originalGraphData.nodes.filter(
    (item) => item.id === id
  )[0];

  const query = gql`
    {
      lens(where: { handle: "${id}" }) {
        handle,
        ${targetScript}
      }
    }
  `;

  const res = (await client.request(query)).lens[0];

  if (res) {
    const parentNodes = triggerNode.parentNodes
      ? triggerNode.parentNodes.concat(res.handle)
      : [res.handle];

    const allNodesOnGraph = originalGraphData.nodes.map((item) => item.id);

    // find current active node and add pagination to it. todo, handle pagination later
    originalGraphData.nodes
      .filter((item) => item.id === id)
      .forEach((targetNode) => {
        const previousPaginationOffset = targetNode?.pagination[target]?.offset;
        targetNode.pagination = {
          ...targetNode.pagination,
          [target]: {
            offset: previousPaginationOffset + defaultPagination.limit,
            limit: defaultPagination.limit,
            expandable: res[target].length > defaultPagination.limit,
          },
        };
      });

    if (target === "followerAddrs") {
      if (!checkResponseLength(res[target])) {
        return;
      }
      res[target].forEach((item) => {
        if (allNodesOnGraph.indexOf(item.address) === -1) {
          originalGraphData.nodes.push({
            ...getNode(
              {
                nodeId: item.address,
                nodeType: "address",
                nodeLabel: getNodeLabel(
                  item,
                  "address",
                  entityConfig["address"].caption
                ),
                nodeSize: entityConfig["address"].size,
                nodeColor: entityConfig["address"].color,
                nodeOrigin: target,
              },
              res.handle,
              parentNodes
            ),
            originalItem: item,
          });
        }
        originalGraphData.edges.push(
          getEdge(item.address, res.handle, "Follow", res.handle, parentNodes)
        );
      });
    }
  }
  originalGraphData.edges = handleMultipleEdges(originalGraphData.edges);

  return originalGraphData;
};

export default {
  regenerate,
  getRootNode,
  getRelations,
  getAddressRelations,
  foldNodeRelations,
};
