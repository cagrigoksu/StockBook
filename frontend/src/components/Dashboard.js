import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Dashboard() {
  const [portfolio, setPortfolio] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const userId = localStorage.getItem("user_id");

  const fetchPortfolio = () => {
    API.get("/portfolio").then((res) => setPortfolio(res.data));
  };

  const fetchTransactions = () => {
    API.get("/transactions").then((res) => setTransactions(res.data));
  };

  useEffect(() => {
    if (!userId) return navigate("/");
    fetchPortfolio();
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

        {/* Overview Tab */}
        {activeTab === 0 && (
          <div className="flex flex-col h-[calc(100vh-180px)]">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-800">Your Portfolio</h1>
            </div>

            <div className="overflow-y-auto flex-grow rounded-xl shadow bg-white mb-8">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-800 text-white sticky top-0">
                  <tr>
                    <th></th>
                    <th></th>
                    <th className="px-4 py-2 text-left">Symbol</th>
                    <th className="px-4 py-2">Quantity</th>
                    <th className="px-4 py-2">Last Price</th>
                    <th className="px-4 py-2">Cost of Shares</th>
                    <th className="px-4 py-2">Current Value</th>
                    <th className="px-4 py-2">Profit/Loss</th>
                    <th className="px-4 py-2">Realized</th>
                    <th className="px-4 py-2">Unrealized</th>
                    <th className="px-4 py-2">Total Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((p, idx) => (
                    <tr
                      key={idx}
                      className="even:bg-gray-100 hover:bg-teal-50 transition"
                    >
                      <td className="py-2 pl-1 pr-0">                        
                        <button
                          type="button"
                          className="bg-teal-700 border border-teal-700 hover:bg-teal-800 hover:text-white font-medium rounded-full text-sm p-2 text-center inline-flex items-center"
                          onClick={() => navigate("/add-stock", { state: { symbol: p.stock_symbol } })}
                        >
                          <svg class="w-6 h-4 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7 7V5"/>
                          </svg> 
                        </button>
                      </td>

                      <td className="py-2 px-0">
                        <button
                          type="button"
                          className="bg-amber-700 border border-amber-700 hover:bg-amber-800 hover:text-white font-medium rounded-full text-sm p-2 text-center inline-flex items-center"
                        >
                        <svg class="w-6 h-4 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4H4m0 0v4m0-4 5 5m7-5h4m0 0v4m0-4-5 5M8 20H4m0 0v-4m0 4 5-5m7 5h4m0 0v-4m0 4-5-5"/>
                        </svg>
                        </button>
                      </td>
                      
                      <td className="px-4 py-2 font-medium text-gray-800">{p.stock_symbol}</td>
                      <td className="text-center">{p.quantity}</td>
                      <td className="text-center">{p.last_price}</td>
                      <td className="text-center">{p.initial_value}</td>
                      <td className="text-center">{p.current_value}</td>
                      <td className="text-center">{p.pl}</td>
                      <td className="text-center">{p.realized}</td>
                      <td className="text-center">{p.unrealized}</td>
                      <td className="text-center">{p.total_fee}</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Performance</h2>
            <p>This is the performance tab content.</p>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 2 && (
          <div className="flex flex-col h-[calc(100vh-180px)]">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-800">Your Transactions</h1>
              <div className="space-x-2">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
                  onClick={() => navigate("/add-stock")}
                >
                  Add Stock
                </button>
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleStatementUpload}
                  style={{ display: "none" }}
                />
                <button
                  onClick={openFilePicker}
                  className="bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition"
                >
                  Upload Statement
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-grow rounded-xl shadow bg-white mb-8">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-800 text-white sticky top-0">
                  <tr>
                    <th></th>
                    <th className="px-4 py-2 text-left">Symbol</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Qty</th>
                    <th className="px-4 py-2">Price</th>
                    <th className="px-4 py-2">Fee</th>
                    <th className="px-4 py-2">Total</th>
                    <th className="px-4 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, idx) => (
                    <tr
                      key={idx}
                      className="even:bg-gray-100 hover:bg-blue-50 transition"
                    >
                      <td className="pl-1 py-2">
                        <button
                          type="button"
                          className="bg-lime-700 border border-teal-700 hover:bg-teal-800 hover:text-white font-medium rounded-full text-sm p-2 text-center inline-flex items-center"
                        >
                          <svg class="w-6 h-4 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M20.29 8.567c.133.323.334.613.59.85v.002a3.536 3.536 0 0 1 0 5.166 2.442 2.442 0 0 0-.776 1.868 3.534 3.534 0 0 1-3.651 3.653 2.483 2.483 0 0 0-1.87.776 3.537 3.537 0 0 1-5.164 0 2.44 2.44 0 0 0-1.87-.776 3.533 3.533 0 0 1-3.653-3.654 2.44 2.44 0 0 0-.775-1.868 3.537 3.537 0 0 1 0-5.166 2.44 2.44 0 0 0 .775-1.87 3.55 3.55 0 0 1 1.033-2.62 3.594 3.594 0 0 1 2.62-1.032 2.401 2.401 0 0 0 1.87-.775 3.535 3.535 0 0 1 5.165 0 2.444 2.444 0 0 0 1.869.775 3.532 3.532 0 0 1 3.652 3.652c-.012.35.051.697.184 1.02ZM9.927 7.371a1 1 0 1 0 0 2h.01a1 1 0 0 0 0-2h-.01Zm5.889 2.226a1 1 0 0 0-1.414-1.415L8.184 14.4a1 1 0 0 0 1.414 1.414l6.218-6.217Zm-2.79 5.028a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2h-.01Z" clip-rule="evenodd"/>
                          </svg>
                        </button>
                      </td>
                      <td className="px-4 py-2 font-medium text-gray-800">{t.stock_symbol}</td>
                      <td 
                        className={`text-center font-semibold 
                          ${t.transaction_type === "SELL" ? "text-red-600" : "text-green-600"}`}
                      >{t.transaction_type}</td>
                      <td className="text-center">{t.quantity}</td>
                      <td className="text-center">{t.price_per_share}</td>
                      <td className="text-center">{t.fee}</td>
                      <td className="text-center">{t.total_cost.toFixed(2)}</td>
                      <td className="text-center">
                        {new Date(t.transaction_date).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

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
