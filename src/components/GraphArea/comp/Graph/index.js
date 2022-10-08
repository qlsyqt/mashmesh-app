import React, { createRef, useEffect } from "react";
import Graphin, { Behaviors, Components } from "@antv/graphin";
import { Menu, message } from "antd";
const { ContextMenu } = Components;

export default function Graph({
  renderData,
  onNodeClick,
  onEdgeClick,
  onFold,
  onExpand,
}) {
  const { ZoomCanvas, Hoverable, FontPaint, BrushSelect } = Behaviors;
  const graphRef = createRef(null);

  const NodeMenu = (value) => {
    const { nodeType, pagination } = value.item._cfg.model;

    let nodeMenuItems = [];

    if (nodeType === "address") {
      const handleChildren = [
        { label: "Lens Follow", key: "followLens" },
        { label: "Lens Profile", key: "lensInclude" },
      ];
      nodeMenuItems = [
        {
          label: "Expand",
          key: "expand",
          children: handleChildren,
        },
        {
          label: "Fold",
          key: "fold",
          children: [...handleChildren, { label: "Fold all", key: "foldAll" }],
        },
      ];
    } else if (nodeType === "lens") {
      const handleChildren = [{ label: "Followers", key: "followerAddrs" }];
      nodeMenuItems = [
        {
          label: "Expand",
          key: "expand",
          children: handleChildren,
        },
        {
          label: "Fold",
          key: "fold",
          children: handleChildren,
        },
      ];
    }

    const handleClick = (e) => {
      const { onClose, id } = value;
      const { key, keyPath } = e;
      if (key === "foldAll") {
        onFold(id);
      } else {
        if (keyPath[1] === "fold") {
          onFold(id, key);
        }

        if (keyPath[1] === "expand") {
          const currentPagination = pagination[key];
          if (!currentPagination.expandable) {
            message.info("You have expanded all nodes.");
            onClose();
            return;
          }
          onExpand({ nodeId: id, nodeType, pagination }, key);
        }
      }
      onClose();
    };
    return <Menu onClick={handleClick} items={nodeMenuItems} />;
  };

  useEffect(() => {
    if (!graphRef || !graphRef.current) {
      return;
    }

    const { graph } = graphRef.current;

    graph.on("node:click", onNodeClick);
    graph.on("edge:click", onEdgeClick);

    return () => {
      graph.off("node:click", onNodeClick);
      graph.off("edge:click", onEdgeClick);
    };
  }, [graphRef]);

  return (
    <>
      <Graphin
        data={renderData}
        layout={{ type: "graphin-force" }}
        fitCenter={true}
        ref={graphRef}
      >
        <ContextMenu style={{ background: "#fff" }} bindType="node">
          {(value) => <NodeMenu {...value} />}
        </ContextMenu>
        <ZoomCanvas enableOptimize maxZoom={1} />
        <Hoverable bindType="node" />
        <Hoverable bindType="edge" />
        <FontPaint />
        <BrushSelect />
      </Graphin>
    </>
  );
}
