import React from "react";

export default function TabsHeaderComponent({ tabs, activeTab, setActiveTab})
{
    return (
        
        <div className="mb-6 border-b flex space-x-6">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`py-2 px-4 text-lg font-medium ${
                activeTab === idx
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
    );
}