

const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  "main idea": { bg: "#f0f9ff", border: "#0ea5e9", text: "#0c4a6e" },
  "supporting concept": { bg: "#f5f3ff", border: "#8b5cf6", text: "#4c1d95" },
  "example": { bg: "#ecfdf5", border: "#10b981", text: "#064e3b" },
  "method": { bg: "#fffbeb", border: "#f59e0b", text: "#78350f" },
  "result": { bg: "#fef2f2", border: "#ef4444", text: "#7f1d1d" },
};

function getCategoryStyle(category: string) {
  return categoryColors[category] || { bg: "#f8fafc", border: "#94a3b8", text: "#334155" };
}

interface ConceptNodeData {
  id: string;
  label: string;
  category: string;
}

export function ConceptFlowNode({ data }: { data: ConceptNodeData }) {
  const style = getCategoryStyle(data.category);

  return (
    <div className="px-3 py-2 rounded-lg border shadow-sm text-center min-w-[100px] select-none"
      style={{ backgroundColor: style.bg, borderColor: style.border }}
    >
      <span className="text-xs font-semibold" style={{ color: style.text }}>
        {data.label}
      </span>
    </div>
  );
}
