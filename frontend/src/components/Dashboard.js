import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

import LogoComponent from "./dashboard/LogoComponent";
import TopMenuComponent from "./dashboard/TopMenuComponent";

import TabsHeaderComponent from "./dashboard/TabsHeaderComponent";
import PortfolioTabComponent from "./dashboard/portfolio/PortfolioTabComponent";
import PerformanceTabComponent from "./dashboard/performance/PerformaceTabComponent";
import TransactionsTabComponent from "./dashboard/transactions/TransactionsTabComponent";

function Dashboard() {

  const [portfolio, setPortfolio] = useState([]);

  const fetchPortfolio = () => {
      API.get("/portfolio").then((res) => setPortfolio(res.data));
    };

  const [transactions, setTransactions] = useState([]);
  const [searchSymbolTransactions, setSearchSymbolTransactions] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("ALL");

  const [performance, setPerformance] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const userId = localStorage.getItem("user_id");

  const fetchPerformanceData = () => {
    API.get("/performance").then((res) => setPerformance(res.data));
  }

  const fetchTransactions = () => {
    API.get("/transactions").then((res) => setTransactions(res.data));
  };

  useEffect(() => {
    if (!userId) return navigate("/");
    fetchPortfolio();
    fetchPerformanceData();
    fetchTransactions();
  }, [userId, navigate]);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleStatementUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await API.post("/upload_statement", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      alert(res.data.message || "Upload succeeded!");
      fetchPortfolio();
      fetchPerformanceData();
      fetchTransactions(); // Reload table data
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      e.target.value = "";
    }
  };

  const tabs = ["Overview", "Performance", "Transactions"];

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <LogoComponent />
          <TopMenuComponent />
        </div>
        {/* tabs header */}
        <TabsHeaderComponent tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Overview Tab */}
        {activeTab === 0 && (
          <div className="flex flex-col h-[calc(100vh-180px)]">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-800">Your Portfolio</h1>
            </div>

            <PortfolioTabComponent portfolio={portfolio}/>

          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 1 && (
          <PerformanceTabComponent performance={performance}/>
        )}

        {/* Transactions Tab */}
        {activeTab === 2 && (
          <TransactionsTabComponent 
            fileInputRef={fileInputRef}
            handleStatementUpload={handleStatementUpload}
            openFilePicker={openFilePicker}
            searchSymbolTransactions={searchSymbolTransactions} setSearchSymbolTransactions={setSearchSymbolTransactions}
            transactionTypeFilter={transactionTypeFilter} setTransactionTypeFilter={setTransactionTypeFilter}
            transactions={transactions}
          />
        )}
      </div>

    </div>
  );
}

export default Dashboard;
