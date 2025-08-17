import React, {useState, useEffect} from "react";
import SpinnerComponent from "../../common/SpinnerComponent";
import API from "../../../api";

export default function PerformanceTabComponent() {

  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [performance, setPerformance] = useState({
    total_realized_profit: 0,
    total_realized_loss: 0,
    total_unrealized_profit: 0,
    total_unrealized_loss: 0,
    total_fee: 0,
    total_transactions: { buy: 0, sell: 0 },
    invested_stocks: { total: 0, non_zero_stocks: 0, zero_stocks: 0 }
  });


  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  const fetchPerformanceData = () => {
    setLoadingPerformance(true);
    API.get("/performance").then((res) =>
      setPerformance(res.data)
    ).finally(() => setLoadingPerformance(false));
  };

  useEffect(() => {
    fetchPerformanceData()
  }, []);

  return (
    loadingPerformance ? (<SpinnerComponent />) : (
      <>
        <div className="max-w-7xl h-full">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">
            Performance Dashboard
          </h2>

          <div className="overflow-x-auto max-h-[60vh] pr-3 grid gap-6 lg:grid-cols-2">
            
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Realized Performance
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800 uppercase tracking-wide">
                    Realized Profit
                  </h4>
                  <p className="text-2xl font-bold text-green-900 mt-2">
                    {formatCurrency(performance.total_realized_profit)}
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <h4 className="text-sm font-medium text-red-800 uppercase tracking-wide">
                    Realized Loss
                  </h4>
                  <p className="text-2xl font-bold text-red-900 mt-2">
                    {formatCurrency(performance.total_realized_loss)}
                  </p>
                </div>
              </div>
              
              <div className={`text-center p-4 ${(performance.total_realized_profit - performance.total_realized_loss) > 0 ? "bg-green-200" :"bg-red-200"} rounded-lg border border-gray-200`}>
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                  Net Performance
                </h4>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(performance.total_realized_profit - performance.total_realized_loss)}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Unrealized Performance
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800 uppercase tracking-wide">
                    Unrealized Profit
                  </h4>
                  <p className="text-2xl font-bold text-green-900 mt-2">
                    {formatCurrency(performance.total_unrealized_profit)}
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <h4 className="text-sm font-medium text-red-800 uppercase tracking-wide">
                    Unrealized Loss
                  </h4>
                  <p className="text-2xl font-bold text-red-900 mt-2">
                    {formatCurrency(performance.total_unrealized_loss)}
                  </p>
                </div>
              </div>

              <div className={`text-center p-4 ${(performance.total_unrealized_profit - performance.total_unrealized_loss) > 0 ? "bg-green-200" :"bg-red-200"} rounded-lg border border-gray-200`}>          
                <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                  Net Performance
                </h4>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(performance.total_unrealized_profit - performance.total_unrealized_loss)}
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Additional Metrics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                  <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                    Total Fees
                  </h4>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {formatCurrency(performance.total_fee)}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                  <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                    Transactions
                  </h4>
                  <p className="text-xl font-medium text-gray-900 mt-2">
                    Buy: {performance.total_transactions.buy} • Sell: {performance.total_transactions.sell}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200">
                  <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                    Invested Stocks
                  </h4>
                  <p className="text-xl font-medium text-gray-900 mt-2">
                    Total: {performance.invested_stocks.total} • Own: {performance.invested_stocks.non_zero_stocks} • Sold: {performance.invested_stocks.zero_stocks}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  );
}
