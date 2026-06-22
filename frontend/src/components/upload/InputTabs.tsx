type InputType = "text" | "url" | "pdf" | "docx";

interface InputTabsProps {
  activeTab: InputType;
  onTabChange: (tab: InputType) => void;
}

const tabs: { key: InputType; label: string }[] = [
  { key: "text", label: "Text" },
  { key: "url", label: "URL" },
  { key: "pdf", label: "PDF" },
  { key: "docx", label: "DOCX" },
];

export function InputTabs({ activeTab, onTabChange }: InputTabsProps) {
  return (
    <div className="flex gap-1 border-b border-slate-200">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === tab.key
              ? "border-primary-500 text-primary-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
