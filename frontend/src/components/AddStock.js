import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function AddStock() {
  const [form, setForm] = useState({
    stock_symbol: "",
    transaction_type: "BUY",
    quantity: 0,
    price_per_share: 0,
    fee: 0,
    transaction_date: new Date().toISOString().slice(0, 16), 
  });

  const navigate = useNavigate();
  const user_id = localStorage.getItem("user_id");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/add_transaction", {
        ...form,
        quantity: parseFloat(form.quantity),
        price_per_share: parseFloat(form.price_per_share),
        fee: parseFloat(form.fee),
        transaction_date: new Date(form.transaction_date).toISOString(),
        user_id: parseInt(user_id),
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Error saving transaction", err);
      alert("Failed to save transaction");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Add Stock Transaction</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Symbol</label>
          <input className="form-control" name="stock_symbol" value={form.stock_symbol} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Type</label>
          <select className="form-select" name="transaction_type" value={form.transaction_type} onChange={handleChange}>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>
        <div className="mb-3">
          <label>Quantity</label>
          <input type="number" step="any" className="form-control" name="quantity" value={form.quantity} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Price Per Share</label>
          <input type="number" step="any" className="form-control" name="price_per_share" value={form.price_per_share} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Fee</label>
          <input type="number" step="any" className="form-control" name="fee" value={form.fee} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label>Date</label>
          <input type="datetime-local" className="form-control" name="transaction_date" value={form.transaction_date} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-success">Save</button>
      </form>
    </div>
  );
}

export default AddStock;
