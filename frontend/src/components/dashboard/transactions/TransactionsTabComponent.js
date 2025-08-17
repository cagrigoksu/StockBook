import React, {useState} from "react";
import { useNavigate } from "react-router-dom";

import TransactionsRowRiskProfModalComponent from "./TransactionsRowRiskProfModalComponent";
import AddTransactionModalComponent from "./AddTransactionModalComponent";

export default function TransactionsTabComponent({
    fileInputRef,
    handleStatementUpload,
    openFilePicker,
    searchSymbolTransactions,
    setSearchSymbolTransactions,
    transactionTypeFilter,
    setTransactionTypeFilter,
    transactions
}){

    const navigate = useNavigate();

    const [showAddTransactionModal, setShowAddTransactionModal] = useState(false)
    const [selectedTrRowSymbol, setSelectedTrRowSymbol] = useState("");
    const [selectedRowQty, setSelectedRowQty] = useState(0);
    const [selectedRowPrice, setSelectedRowPrice] = useState(0);
    const [selectedRowFee, setSelectedRowFee] = useState(0);

    const [showTrRowRiskProfModal, setShowTrRowRiskProfModal ] = useState(false);
    
    const handleTrRowRiskProfButton = (symbol, qty, price, fee) => {
      setSelectedTrRowSymbol(symbol);
      setSelectedRowQty(qty);
      setSelectedRowPrice(price);
      setSelectedRowFee(fee);
      setShowTrRowRiskProfModal(true);
    }

    const handleAddTransactionModal = () => {
      setShowAddTransactionModal(true);
    }

    return (
      <>
            <div className="h-full">
              <div className="flex flex-col h-[calc(100vh-180px)]">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-3xl font-bold text-gray-800">Your Transactions</h1>
                  <div className="space-x-2">
                    <button
                      className="bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition"
                      onClick={handleAddTransactionModal}
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
                      className="bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700 transition"
                    >
                      Upload Statement
                    </button>
                  </div>
                </div>
    
                <div className="flex flex-row">      
                  <input type="text" placeholder="Search symbol..." 
                    value={searchSymbolTransactions} onChange={(e)=> setSearchSymbolTransactions(e.target.value)}
                    className="mb-5 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400">
                  </input>
    
                  <select
                    value={transactionTypeFilter}
                    onChange={(e) => setTransactionTypeFilter(e.target.value)}
                    className="mb-5 ml-5 px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block"
                  >
                    <option value="ALL">All types</option>
                    <option value="BUY">Buy</option>
                    <option value="SELL">Sell</option>
                    <option value="DIVIDEND">Dividend</option>
                  </select>
    
                </div>
    
                <div className="overflow-y-auto max-h-[55vh] flex-grow rounded-xl shadow bg-white mb-8">
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
                      {transactions
                      .filter(t => t.stock_symbol.toLowerCase().includes(searchSymbolTransactions.toLowerCase()))
                      .filter(t => transactionTypeFilter === "ALL" || t.transaction_type === transactionTypeFilter)
                      .map((t, idx) => (
                        <tr
                          key={idx}
                          className="even:bg-gray-100 hover:bg-blue-50 transition"
                        >
                          {t.transaction_type === "BUY" && t.remaining_quantity > 1e-6 ? (<td className="pl-1 py-2">
                            <button
                              type="button"
                              className="bg-lime-700 border border-teal-700 hover:bg-teal-800 hover:text-white font-medium rounded-full text-sm p-2 text-center inline-flex items-center"
                              onClick={() => handleTrRowRiskProfButton(t.stock_symbol, t.quantity, t.price_per_share, t.fee)}
                            >
                              <svg className="w-6 h-4 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M20.29 8.567c.133.323.334.613.59.85v.002a3.536 3.536 0 0 1 0 5.166 2.442 2.442 0 0 0-.776 1.868 3.534 3.534 0 0 1-3.651 3.653 2.483 2.483 0 0 0-1.87.776 3.537 3.537 0 0 1-5.164 0 2.44 2.44 0 0 0-1.87-.776 3.533 3.533 0 0 1-3.653-3.654 2.44 2.44 0 0 0-.775-1.868 3.537 3.537 0 0 1 0-5.166 2.44 2.44 0 0 0 .775-1.87 3.55 3.55 0 0 1 1.033-2.62 3.594 3.594 0 0 1 2.62-1.032 2.401 2.401 0 0 0 1.87-.775 3.535 3.535 0 0 1 5.165 0 2.444 2.444 0 0 0 1.869.775 3.532 3.532 0 0 1 3.652 3.652c-.012.35.051.697.184 1.02ZM9.927 7.371a1 1 0 1 0 0 2h.01a1 1 0 0 0 0-2h-.01Zm5.889 2.226a1 1 0 0 0-1.414-1.415L8.184 14.4a1 1 0 0 0 1.414 1.414l6.218-6.217Zm-2.79 5.028a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2h-.01Z" clipRule="evenodd"/>
                              </svg>
                            </button>
                          </td>) : (<td className="pl-1 py-2"></td>)}
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

            {showTrRowRiskProfModal && (
              <TransactionsRowRiskProfModalComponent
                selectedTrRowSymbol={selectedTrRowSymbol}
                selectedRowQty={selectedRowQty}
                selectedRowPrice={selectedRowPrice}
                selectedRowFee={selectedRowFee}
                onClose={() => setShowTrRowRiskProfModal(false)}
              />
            )}

            {showAddTransactionModal && (
              <AddTransactionModalComponent 
                setShowAddTransactionModal={setShowAddTransactionModal}
              />
            )}
            
            </div>
            </>

          
    );
}