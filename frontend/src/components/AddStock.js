import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api";

function AddStock() {
  const navigate = useNavigate();
  const location = useLocation();

  const passedSymbol = location.state?.symbol || ""; // empty if not provided

  const user_id = localStorage.getItem("user_id");
  const [form, setForm] = useState({
    stock_symbol: passedSymbol,
    transaction_type: "BUY",
    quantity: 0,
    price_per_share: 0,
    fee: 0,
    transaction_date: new Date().toISOString().slice(0, 16),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      alert("Error saving transaction");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-xl space-y-4"
      >
        <h2 className="text-2xl font-semibold text-gray-800">Add Stock</h2>
        <div>
          <label className="block text-sm font-medium">Stock Symbol</label>
          <input
            name="stock_symbol"
            value={form.stock_symbol}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Transaction Type</label>
          <select
            name="transaction_type"
            value={form.transaction_type}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border rounded-xl"
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Quantity</label>
            <input
              type="number"
              name="quantity"
              step="any"
              value={form.quantity}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Price per Share</label>
            <input
              type="number"
              name="price_per_share"
              step="any"
              value={form.price_per_share}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-xl"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Fee</label>
          <input
            type="number"
            name="fee"
            step="any"
            value={form.fee}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border rounded-xl"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Transaction Date</label>
          <input
            type="datetime-local"
            name="transaction_date"
            value={form.transaction_date}
            onChange={handleChange}
            className="w-full mt-1 px-3 py-2 border rounded-xl"
            required
          />
        </div>
        <div className="pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            Save Transaction
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddStock;