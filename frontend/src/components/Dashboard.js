import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

import TabsHeaderComponent from "./dashboard/TabsHeaderComponent";
import PortfolioTabComponent from "./dashboard/portfolio/PortfolioTabComponent";
import PortfolioRowDetailsModalComponent from "./dashboard/portfolio/PortfolioRowDetailsModalComponent";
import PerformanceTabComponent from "./dashboard/performance/PerformaceTabComponent";
import TransactionsTabComponent from "./dashboard/transactions/TransactionsTabComponent";

function Dashboard() {
  const [portfolio, setPortfolio] = useState([]);
  const [showAllPortfolio, setShowAllPortfolio] = useState(true);
  const [searchSymbolPortfolio, setSearchSymbolPortfolio] = useState("");
  const [portfolioRowData, setPortfolioRowData] = useState({})
  const [chartData, setChartData] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [searchSymbolTransactions, setSearchSymbolTransactions] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("ALL");

  const [performance, setPerformance] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  const [showPoRowDetailsModal, setShowPoRowDetailsModal ] = useState(false);

  const [selectedPoRowSymbol, setSelectedPoRowSymbol] = useState("");



  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const userId = localStorage.getItem("user_id");

  const fetchPortfolio = () => {
    API.get("/portfolio").then((res) => setPortfolio(res.data));
  };

  const fetchPerformanceData = () => {
    API.get("/performance").then((res) => setPerformance(res.data));
  }

  const fetchTransactions = () => {
    API.get("/transactions").then((res) => setTransactions(res.data));
  };

  const fetchPortfolioRowData = (symbol) => {
    return API.get(`/portfolioRowDetail?symbol=${symbol}`).then((res) => {
      setPortfolioRowData(res.data);
      
      setChartData({
          labels: res.data.stockDailyCloseValues.map(d => new Date(d.datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})),
          datasets: [
            {
              label: `${symbol} Price`,
              data: res.data.stockDailyCloseValues.map(d => d.close),
              fill: true,
              backgroundColor: "rgba(249, 105, 29, 0.36)", 
              borderColor: "rgba(249, 105, 29, 1)",
              tension: 0.1,
            }
          ]
        });
    })
  }

  const handlePoRowDetailsButton = (symbol) => {
    setSelectedPoRowSymbol(symbol);
    fetchPortfolioRowData(symbol).then(() => 
      setShowPoRowDetailsModal(true));
  }

  useEffect(() => {
    if (!userId) return navigate("/");
    fetchPortfolio();
    fetchPerformanceData();
    fetchTransactions();
  }, [userId, navigate]);

  const handleLogout = async () => {
    try {
      const response = await API.get("/user_logout");
      if (response.data.status === "success") {
        navigate("/");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

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

        {/* tabs header */}
        <TabsHeaderComponent tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Overview Tab */}
        {activeTab === 0 && (
          <div className="flex flex-col h-[calc(100vh-180px)]">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-800">Your Portfolio</h1>
            </div>

            <PortfolioTabComponent 
              showAllPortfolio={showAllPortfolio}
              setShowAllPortfolio={setShowAllPortfolio}
              searchSymbolPortfolio={searchSymbolPortfolio}
              setSearchSymbolPortfolio={setSearchSymbolPortfolio}
              portfolio={portfolio}
              handlePoRowDetailsButton={handlePoRowDetailsButton}
              />

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

      {/* PoRowDetailsModal */}
      {showPoRowDetailsModal && (
        <PortfolioRowDetailsModalComponent 
          selectedPoRowSymbol = {selectedPoRowSymbol}
          portfolioRowData = {portfolioRowData}
          chartData = {chartData}
          setShowPoRowDetailsModal = {setShowPoRowDetailsModal}  
        />
      )}

      {/* Logout Button */}
      <div className="fixed bottom-0 w-full bg-gray-200 p-4 flex justify-end">

        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>
    </div>
  );
}

export default Dashboard;
