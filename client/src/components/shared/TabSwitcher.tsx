import React from "react";

interface TabSwitcherProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabSwitcher: React.FC<TabSwitcherProps> = ({ activeTab, setActiveTab }) => {
  const tabs = ["Student", "Driver", "Teacher"];

  return (
    <div className="flex justify-between mb-6 bg-gray-100 rounded-md">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex-1 py-2 font-semibold transition-all rounded-md ${
            activeTab === tab
              ? "bg-red-500 text-white"
              : "text-gray-600 hover:bg-red-100"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default TabSwitcher;
