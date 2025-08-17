import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Helmet } from "react-helmet";

import LogoComponent from "../common/LogoComponent";
import TopMenuComponent from "../common/TopMenuComponent";

import TabsHeaderComponent from "./TabsHeaderComponent";
import PortfolioTabComponent from "./portfolio/PortfolioTabComponent";
import PerformanceTabComponent from "./performance/PerformaceTabComponent";
import TransactionsTabComponent from "./transactions/TransactionsTabComponent";
import FooterComponent from "../common/FooterComponent";

function Dashboard() {

  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["Overview", "Performance", "Transactions"];

  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!userId) return navigate("/");
  }, [userId, navigate]);

  return (
    <>
      <Helmet>
        <title>StockBook | Dashboard</title>
      </Helmet>
      <div className="min-h-screen  bg-gray-100 pt-2">
        <div className="max-w-7xl mx-auto">

          <div className="flex justify-between items-center mb-4">
            <LogoComponent />
            <TopMenuComponent />
          </div>

          {/* Tabs header */}
          <TabsHeaderComponent tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="h-[calc(100vh-224px)]">
            {/* Portfolio Tab */}
            {activeTab === 0 && (
              <PortfolioTabComponent />
            )}

            {/* Performance Tab */}
            {activeTab === 1 && (
              <PerformanceTabComponent />
            )}

            {/* Transactions Tab */}
            {activeTab === 2 && (
              <TransactionsTabComponent />
            )}
          </div>
        </div>

        {/* Footer */}
        <FooterComponent />
      </div>
    </>
  );
}

export default Dashboard;
