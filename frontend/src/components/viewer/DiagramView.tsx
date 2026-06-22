"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { ConceptFlowNode } from "./ConceptFlowNode";
import { ConceptMap } from "@/lib/api";

interface DiagramViewProps {
  conceptMap: ConceptMap | null;
}

function createMindmapLayout(nodes: Array<{ id: string; label: string; category: string }>, edges: Array<{ from_node: string; to_node: string; label: string }>) {
  if (nodes.length === 0) return [];

  const nodeMap = new Map<string, { id: string; label: string; category: string }>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const children = new Map<string, { id: string; label: string; category: string }[]>();
  const parentMap = new Map<string, string>();

  for (const edge of edges) {
    if (!children.has(edge.from_node)) {
      children.set(edge.from_node, []);
    }
    const childNode = nodeMap.get(edge.to_node);
    if (childNode) {
      children.get(edge.from_node)!.push(childNode);
    }
    parentMap.set(edge.to_node, edge.from_node);
  }

  const roots = nodes.filter((n) => !parentMap.has(n.id));
  if (roots.length === 0 && nodes.length > 1) {
    roots.push(nodes[0]);
  }

  const layoutNodes: Node[] = [];

  function positionSubtree(root: { id: string; label: string; category: string }, x: number, y: number, availableWidth: number) {
    layoutNodes.push({
      id: root.id,
      type: "concept",
      position: { x, y },
      data: { id: root.id, label: root.label, category: root.category },
    });

    const childList = children.get(root.id) || [];
    if (childList.length === 0) return;

    const childSpacing = Math.min(80, availableWidth / (childList.length + 1));
    const startX = x - ((childList.length - 1) * childSpacing) / 2;

    childList.forEach((child, i) => {
      positionSubtree(
        child,
        startX + i * childSpacing,
        y + 100,
        childSpacing * 0.8
      );
    });
  }

  const rootX = 400;
  roots.forEach((root, i) => {
    positionSubtree(root, rootX + (i - (roots.length - 1) / 2) * 300, 50, 600);
  });

  return layoutNodes;
}

function createEdges(edges: Array<{ from_node: string; to_node: string; label: string }>): Edge[] {
  return edges.map((edge, i) => ({
    id: `edge-${i}`,
    source: edge.from_node,
    target: edge.to_node,
    label: edge.label,
    animated: false,
    style: { stroke: "#94a3b8", strokeWidth: 1.5 },
    labelStyle: { fontSize: "10px", fill: "#64748b" },
    labelShowBg: false,
  }));
}

export function DiagramView({ conceptMap }: DiagramViewProps) {
  const flowNodes = useMemo(() => {
    if (!conceptMap || conceptMap.nodes.length === 0) return [];
    return createMindmapLayout(conceptMap.nodes, conceptMap.edges);
  }, [conceptMap]);

  const flowEdges = useMemo(() => {
    if (!conceptMap) return [];
    return createEdges(conceptMap.edges);
  }, [conceptMap]);

  const nodeTypes = useMemo(() => ({ concept: ConceptFlowNode }), []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    console.log("Node clicked:", node.data);
  }, []);

  if (!conceptMap || conceptMap.nodes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        <p className="text-sm text-slate-500">No concept map available for this article.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Concept Map</h3>
        <span className="text-xs text-slate-500">Scroll to zoom · Drag to pan</span>
      </div>
      <div className="h-[500px]">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.2}
          maxZoom={2}
          onNodeClick={onNodeClick}
        >
          <Background color="#e2e8f0" gap={16} size={1} />
          <Controls />
          <MiniMap
            nodeStrokeColor={(n) => {
              const data = n.data as { category?: string };
              const colors: Record<string, string> = {
                "main idea": "#0ea5e9",
                "supporting concept": "#8b5cf6",
                example: "#10b981",
                method: "#f59e0b",
                result: "#ef4444",
              };
              return colors[data.category || ""] || "#94a3b8";
            }}
            nodeColor={() => "#fff"}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
