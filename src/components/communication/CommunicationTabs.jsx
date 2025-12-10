export default function CommunicationTabs({ selectedTab, setSelectedTab }) {
  const tabs = [
    { id: "grammar-overview", label: "📊 Team Overview" },
    { id: "grammar-individual", label: "👤 Individual Analysis" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-1 border border-gray-200 flex gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setSelectedTab(tab.id)}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedTab === tab.id
              ? "bg-slate-700 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}