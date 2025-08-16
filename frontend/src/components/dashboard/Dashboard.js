import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";

import { Helmet } from "react-helmet";

import SpinnerComponent from "../common/SpinnerComponent";

import LogoComponent from "../common/LogoComponent";
import TopMenuComponent from "../common/TopMenuComponent";

import TabsHeaderComponent from "./TabsHeaderComponent";
import PortfolioTabComponent from "./portfolio/PortfolioTabComponent";
import PerformanceTabComponent from "./performance/PerformaceTabComponent";
import TransactionsTabComponent from "./transactions/TransactionsTabComponent";

function Dashboard() {

  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingPerformance, setLoadingPerformance] = useState(false);

  const [portfolio, setPortfolio] = useState([]);

  const fetchPortfolio = () => {

      setLoadingPortfolio(true);
      API.get("/portfolio").then((res) =>
        setPortfolio(res.data)
      ).finally(() => setLoadingPortfolio(false));
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
    setLoadingPerformance(true);
    API.get("/performance").then((res) => setPerformance(res.data))
      .finally(() => setLoadingPerformance(false));
  }

  const fetchTransactions = () => {
    setLoadingTransactions(true);
    API.get("/transactions").then((res) => setTransactions(res.data))
      .finally(() => setLoadingTransactions(false));
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
    <>
    <Helmet>
        <title>StockBook | Dashboard</title>
    </Helmet>
    <div className="min-h-screen bg-gray-100 pt-2">
    
      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-4">
          <LogoComponent />
          <TopMenuComponent />
        </div>

        {/* tabs header */}
        <TabsHeaderComponent tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="h-[calc(100vh-180px)]">
          {/* Portfolio Tab */}
          {activeTab === 0 && (
            loadingPortfolio ? (
              <SpinnerComponent />
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-3xl font-bold text-gray-800">Your Portfolio</h1>
                </div>

                <PortfolioTabComponent portfolio={portfolio} />
              </div>
            )
          )}

          {/* Performance Tab */}
          {activeTab === 1 && (
            loadingPerformance ? 
            (<SpinnerComponent />):
            (
            <PerformanceTabComponent performance={performance}/>
            )
          )}

          {/* Transactions Tab */}
          {activeTab === 2 && (
            loadingTransactions ? 
            (<SpinnerComponent />) :
            (
            <TransactionsTabComponent 
              fileInputRef={fileInputRef}
              handleStatementUpload={handleStatementUpload}
              openFilePicker={openFilePicker}
              searchSymbolTransactions={searchSymbolTransactions} setSearchSymbolTransactions={setSearchSymbolTransactions}
              transactionTypeFilter={transactionTypeFilter} setTransactionTypeFilter={setTransactionTypeFilter}
              transactions={transactions}
            />
            )
          )}
        </div>

      </div>

    </div>
    </>
  );
}

export default Dashboard;
