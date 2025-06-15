// src/components/Dashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const userId = localStorage.getItem("user_id");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return navigate("/");
    API.get("/transactions").then((res) => setTransactions(res.data));
  }, [userId]);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-4">
        <h2>Transactions</h2>
        <div>
          <button className="btn btn-primary me-2" onClick={() => navigate("/add-stock")}>
            Add Stock
          </button>
          <button className="btn btn-secondary" onClick={() => alert("Upload logic soon")}>
            Upload Revolut Statement
          </button>
        </div>
      </div>
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>Symbol</th>
            <th>Type</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Fee</th>
            <th>Total</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, idx) => (
            <tr key={idx}>
              <td>{t.stock_symbol}</td>
              <td>{t.transaction_type}</td>
              <td>{t.quantity}</td>
              <td>{t.price_per_share}</td>
              <td>{t.fee}</td>
              <td>{t.total_cost.toFixed(2)}</td>
              <td>{new Date(t.transaction_date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;
