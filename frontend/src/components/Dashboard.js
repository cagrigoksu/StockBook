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

  useEffect(() => {
    if (!userId) return navigate("/");
    API.get("/portfolio").then((res) => setPortfolio(res.data));
  }, [userId, navigate]);

  useEffect(() => {
    if (!userId) return navigate("/");
    API.get("/transactions").then((res) => setTransactions(res.data));
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
      navigate("/dashboard");
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

        {/* tabs content */}
        {activeTab === 0 && (
          <div className="flex flex-col h-[calc(100vh-180px)]">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-800">Your Portfolio</h1>
              <div className="space-x-2">
                
              </div>
            </div>

            {/* table container */}
            <div className="overflow-y-auto flex-grow rounded-xl shadow bg-white mb-8">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-800 text-white sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Symbol</th>
                    <th className="px-4 py-2">Quantity</th>
                    <th className="px-4 py-2">Last Price</th>
                    <th className="px-4 py-2">Current Value</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((p, idx) => (
                    <tr
                      key={idx}
                      className="even:bg-gray-100 hover:bg-blue-50 transition"
                    >
                      <td className="px-4 py-2 font-medium text-gray-800">{p.stock_symbol}</td>
                      <td className="text-center">{p.quantity}</td>
                      <td className="text-center">{p.last_price}</td>
                      <td className="text-center">{p.current_value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Performance</h2>
            <p>This is the performance tab content.</p>
          </div>
        )}

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

            {/* table container */}
            <div className="overflow-y-auto flex-grow rounded-xl shadow bg-white mb-8">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-800 text-white sticky top-0">
                  <tr>
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
                      <td className="px-4 py-2 font-medium text-gray-800">{t.stock_symbol}</td>
                      <td className="text-center">{t.transaction_type}</td>
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
