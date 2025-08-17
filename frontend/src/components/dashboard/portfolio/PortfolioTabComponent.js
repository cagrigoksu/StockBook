import React, { useState, useEffect } from "react";

import API from "../../../api";
import SpinnerComponent from "../../common/SpinnerComponent";

import PortfolioRowDetailsModalComponent from "./PortfolioRowDetailsModalComponent";
import AddTransactionModalComponent from "../transactions/AddTransactionModalComponent";

export default function PortfolioTabComponent() {
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [portfolio, setPortfolio] = useState([]);
  const [showAllPortfolio, setShowAllPortfolio] = useState(true);
  const [searchSymbolPortfolio, setSearchSymbolPortfolio] = useState("");
  const [selectedPoRowSymbol, setSelectedPoRowSymbol] = useState("");
  const [showPoRowDetailsModal, setShowPoRowDetailsModal] = useState(false);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [portfolioRowData, setPortfolioRowData] = useState({});
  const [chartData, setChartData] = useState(null);

  const fetchPortfolio = () => {
    setLoadingPortfolio(true);
    API.get("/portfolio")
      .then((res) => setPortfolio(res.data))
      .finally(() => setLoadingPortfolio(false));
  };

  const fetchPortfolioRowData = (symbol) => {
    return API.get(`/portfolioRowDetail?symbol=${symbol}`).then((res) => {
      setPortfolioRowData(res.data);
      setChartData({
        labels: res.data.stockDailyCloseValues.map((d) =>
          new Date(d.datetime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        ),
        datasets: [
          {
            label: `${symbol} Price`,
            data: res.data.stockDailyCloseValues.map((d) => d.close),
            fill: true,
            backgroundColor: "rgba(249, 105, 29, 0.36)",
            borderColor: "rgba(249, 105, 29, 1)",
            tension: 0.1,
          },
        ],
      });
    });
  };

  const handlePoRowDetailsButton = (symbol) => {
    setSelectedPoRowSymbol(symbol);
    fetchPortfolioRowData(symbol).then(() => setShowPoRowDetailsModal(true));
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  useEffect(() => {
    if (!showAddTransactionModal) {
      fetchPortfolio();
    }
  }, [showAddTransactionModal]);

  return loadingPortfolio ? (
    <SpinnerComponent />
  ) : (
    <>
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Your Portfolio</h1>
        </div>
        <div className="portfolio-table-component">
          <div className="flex flex-wrap items-center mb-4 gap-4">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showAllPortfolio}
                onChange={(e) => setShowAllPortfolio(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gray-300 rounded-full peer dark:bg-gray-700 
                peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
                peer-checked:bg-amber-700 relative"
              ></div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                Show sold stocks
              </span>
            </label>
            <input
              type="text"
              placeholder="Search symbol..."
              value={searchSymbolPortfolio}
              onChange={(e) => setSearchSymbolPortfolio(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div className="overflow-y-auto max-h-[55vh] flex-grow rounded-xl shadow bg-white mb-8">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-800 text-white sticky top-0 z-10">
                <tr>
                  <th></th>
                  <th></th>
                  <th className="px-4 py-2 text-left">Symbol</th>
                  <th className="px-4 py-2">Quantity</th>
                  <th className="px-4 py-2">Last Price</th>
                  <th className="px-4 py-2">Current Value</th>
                  <th className="px-4 py-2">Profit/Loss</th>
                  <th className="px-4 py-2">Realized</th>
                  <th className="px-4 py-2">Unrealized</th>
                  <th className="px-4 py-2">Total Fee</th>
                </tr>
              </thead>
              <tbody>
                {portfolio
                  .filter(
                    (p) => showAllPortfolio || p.quantity > 0
                  )
                  .filter((p) =>
                    p.stock_symbol
                      .toLowerCase()
                      .includes(searchSymbolPortfolio.toLowerCase())
                  )
                  .map((p, idx) => (
                    <tr
                      key={idx}
                      className="even:bg-gray-100 hover:bg-teal-50 transition"
                    >
                      <td className="py-2 pl-1 pr-0">
                        <button
                          type="button"
                          className="bg-teal-700 border border-teal-700 hover:bg-teal-800 hover:text-white font-medium rounded-full text-sm p-2 text-center inline-flex items-center"
                          onClick={() => {
                            setSelectedPoRowSymbol(p.stock_symbol);
                            setShowAddTransactionModal(true);
                          }}
                        >
                          <svg
                            className="w-6 h-4 text-gray-800 dark:text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 12h14m-7 7V5"
                            />
                          </svg>
                        </button>
                      </td>
                      <td className="py-2 px-0">
                        <button
                          type="button"
                          className="bg-amber-700 border border-amber-700 hover:bg-amber-800 hover:text-white font-medium rounded-full text-sm p-2 text-center inline-flex items-center"
                          onClick={() =>
                            handlePoRowDetailsButton(p.stock_symbol)
                          }
                        >
                          <svg
                            className="w-6 h-4 text-gray-800 dark:text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 4H4m0 0v4m0-4 5 5m7-5h4m0 0v4m0-4-5 5M8 20H4m0 0v-4m0 4 5-5m7 5h4m0 0v-4m0 4-5-5"
                            />
                          </svg>
                        </button>
                      </td>
                      <td className="px-4 py-2 font-medium text-gray-800">
                        {p.stock_symbol}
                      </td>
                      <td className="text-center">{p.quantity}</td>
                      <td className="text-center">{p.last_price}</td>
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
          {showAddTransactionModal && (
            <AddTransactionModalComponent
              symbol={selectedPoRowSymbol}
              setShowAddTransactionModal={setShowAddTransactionModal}
            />
          )}
          {showPoRowDetailsModal && (
            <PortfolioRowDetailsModalComponent
              selectedPoRowSymbol={selectedPoRowSymbol}
              portfolioRowData={portfolioRowData}
              chartData={chartData}
              setShowPoRowDetailsModal={setShowPoRowDetailsModal}
            />
          )}
        </div>
      </div>
    </>
  );
}
