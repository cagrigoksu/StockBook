import React from "react";
import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PortfolioRowDetailsModalComponent({
    selectedPoRowSymbol,
    portfolioRowData,
    chartData,
    setShowPoRowDetailsModal,
}){
    return (
    <div>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-xl font-semibold mb-4">{selectedPoRowSymbol ? `${selectedPoRowSymbol} Details` : "Details"}</h2>
            <p className="text-sm font-medium">{portfolioRowData.displayName} - {portfolioRowData.shortName}</p>
            <p className="text-sm font-thin">{portfolioRowData.country} - {portfolioRowData.sector}</p>
            <p className="text-sm font-thin">{portfolioRowData.averageAnalystRating}</p>

            <div class="max-w-sm w-full bg-white rounded-lg shadow-sm pt-4 pb-4">
              <div class="flex flex-col justify-between">
                <div className="flex flex-row justify-between">
                  <h5 class="leading-none text-3xl font-bold text-gray-900 pb-2">{portfolioRowData.currency} {portfolioRowData.currentValue}</h5>
                  <div className={`flex items-center px-2.5 py-0.5 text-base font-semibold text-center 
                    ${portfolioRowData.changePercent < 0 ? 
                      "text-red-500" : "text-green-500"}`}>
                    {portfolioRowData.changePercent.toFixed(2)}%
                    <svg className="w-3 h-3 ms-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 22">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d={portfolioRowData.changePercent < 0 ?
                          "M12 19V5m0 14-4-4m4 4 4-4" : "M12 6v13m0-13 4 4m-4-4-4 4"
                        }/>
                    </svg>
                  </div>
                </div>
                <p class="text-base font-normal text-gray-500 dark:text-gray-400">Trend of {selectedPoRowSymbol}</p>
                
              </div>

              <div id="area-chart" className="h-48">
                {chartData ? <Line data={chartData} options={{responsive: true, plugins:{legend:{display:false}}}} /> : "Loading chart..."}
              </div>


              <p className="text-sm font-thin">{portfolioRowData.quoteSourceName}</p>
            </div>



            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPoRowDetailsModal(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
    </div>
    );
}