import React from "react";

export default function PerformanceTabComponent({performance})
{

    return (
        <div>
            <div className="">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Performance</h2>

                <div className="flex flex-col gap-8 border-2 border-gray-400 rounded-lg p-8 bg-gray-50">

                    {/* Profit & Loss Section */}
                    <div className="flex flex-col md:flex-row gap-6">

                    {/* Realized */}
                    <div className="flex-1 border-2 border-black rounded-lg p-6 flex flex-col justify-between">
                        <div className="flex justify-between mb-4">
                        <div className="text-center flex-1 mx-2">
                            <h2 className="text-xl text-green-800 font-semibold">Total Realized Profit</h2>
                            <p className="text-xl mt-2">{performance.total_realized_profit}</p>
                        </div>
                        <div className="text-center flex-1 mx-2">
                            <h2 className="text-xl text-red-800 font-semibold">Total Realized Loss</h2>
                            <p className="text-xl mt-2">{performance.total_realized_loss}</p>
                        </div>
                        </div>
                        <div className="text-center mt-4 p-2 border-t border-black">
                        <h2 className="text-xl font-semibold">Overall Performance</h2>
                        <p className="text-xl mt-2">{(performance.total_realized_profit-performance.total_realized_loss).toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Unrealized */}
                    <div className="flex-1 border-2 border-black rounded-lg p-6 flex flex-col justify-between">
                        <div className="flex justify-between mb-4">
                        <div className="text-center flex-1 mx-2">
                            <h2 className="text-xl text-green-800 font-semibold">Total Unrealized Profit</h2>
                            <p className="text-xl mt-2">{performance.total_unrealized_profit}</p>
                        </div>
                        <div className="text-center flex-1 mx-2">
                            <h2 className="text-xl text-red-800 font-semibold">Total Unrealized Loss</h2>
                            <p className="text-xl mt-2">{performance.total_unrealized_loss}</p>
                        </div>
                        </div>
                        <div className="text-center mt-4 p-2 border-t border-black">
                        <h2 className="text-xl font-semibold">Overall Performance</h2>
                        <p className="text-xl mt-2">{(performance.total_unrealized_profit-performance.total_unrealized_loss)}</p>
                        </div>
                    </div>

                    </div>

                    {/* Other Metrics */}
                    <div className="border-2 border-black rounded-lg p-6 bg-white">
                    <h2 className="text-2xl font-semibold mb-4">Other Metrics</h2>
                    <div className="flex flex-wrap gap-4">
                        <div className="text-center flex-1 min-w-[150px] p-4 border rounded-md">
                        <h2 className="text-xl text-black font-medium">Total Fee</h2>
                        <p className="text-xl mt-2">{performance.total_fee}</p>
                        </div>
                    </div>
                    </div>

                </div>
            </div>
        </div>
    );
    
}