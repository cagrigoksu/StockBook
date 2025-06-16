import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!userId) return navigate("/");
    API.get("/transactions").then((res) => setTransactions(res.data));
  }, [userId, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Your Transactions</h1>
          <div className="space-x-2">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
              onClick={() => navigate("/add-stock")}
            >
              Add Stock
            </button>
            <button
              className="bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition"
              onClick={() => alert("Upload logic coming soon")}
            >
              Upload Statement
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl shadow bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-800 text-white">
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
                  <td className="text-center">{new Date(t.transaction_date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;