import React, {useState} from "react";

export default function TransactionsRowRiskProfModalComponent({
    selectedTrRowSymbol,
    selectedRowFee,
    selectedRowPrice,
    selectedRowQty,
    onClose
    }) {

    const [checkboxTrRowRiskProfModal, setCheckboxTrRowRiskProfModal] = useState(false);
      
    const handleCheckboxTrRowRiskProf = (checked) => {
      setCheckboxTrRowRiskProfModal(prev => !prev);
    }

    return (
    <div>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">

          <div className="bg-white rounded-lg shadow-lg w-200 p-6">

            <h2 className="text-xl font-semibold mb-4">{selectedTrRowSymbol ? `Risk and Profit Thresholds for ${selectedTrRowSymbol}` : "Risk and Profit Thresholdss"}</h2>
            
            <div className="mb-5">

              <div className="flex">

                  <div className="flex items-center h-5">

                      <input type="checkbox" value="" className="w-4 h-4 rounded-sm" 
                      onChange={handleCheckboxTrRowRiskProf}/>

                  </div>

                  <div className="ms-2 text-sm">
                      <label for="helper-checkbox" className="font-medium">Include fees in calculations</label>
                      <p id="helper-checkbox-text" className="text-xs font-normal text-gray-800">Considered sell fee is equal to {selectedRowFee} buy fee.</p>
                  </div>

              </div>

            </div>

            <div className="flex">

              <div className="pl-2 pr-2.5">

                <label className="text-red-800 block text-sm font-bold">5% Risk @{(((((selectedRowPrice * selectedRowQty)+ (checkboxTrRowRiskProfModal ? selectedRowFee : 0 ))*0.95)/selectedRowQty).toFixed(2))}</label>
                <input
                  type="number"
                  step="any"
                  readOnly
                  value={(((selectedRowPrice * selectedRowQty)+ (checkboxTrRowRiskProfModal ? selectedRowFee : 0 ))*0.95).toFixed(2)}
                  className="mt-1 px-3 py-2 mb-3 border rounded-xl"
                />
                <label className="text-red-700 block text-sm font-bold">7% Risk @{(((((selectedRowPrice * selectedRowQty)+ (checkboxTrRowRiskProfModal ? selectedRowFee : 0 ))*0.93)/selectedRowQty).toFixed(2))}</label>
                <input
                  type="number"
                  step="any"
                  readOnly
                  value={(((selectedRowPrice * selectedRowQty)+ (checkboxTrRowRiskProfModal ? selectedRowFee : 0 ))*0.93).toFixed(2)}
                  className="mt-1 px-3 py-2 mb-3 border rounded-xl"
                />
                <label className="text-red-600 block text-sm font-bold">10% Risk @{(((((selectedRowPrice * selectedRowQty)+ (checkboxTrRowRiskProfModal ? selectedRowFee : 0 ))*0.90)/selectedRowQty).toFixed(2))}</label>
                <input
                  type="number"
                  step="any"
                  readOnly
                  value={(((selectedRowPrice * selectedRowQty)+ (checkboxTrRowRiskProfModal ? selectedRowFee : 0 ))*0.9).toFixed(2)}
                  className="mt-1 px-3 py-2 mb-3 border rounded-xl"
                />

              </div>

              <div className="pl-2 pr-2.5">

                <label className="text-green-800 block text-sm font-bold">5% Profit @{(((((selectedRowPrice * selectedRowQty)+ (checkboxTrRowRiskProfModal ? selectedRowFee : 0 ))*1.05)/selectedRowQty).toFixed(2))}</label>
                <input
                  type="number"
                  step="any"
                  readOnly
                  value={(((selectedRowPrice * selectedRowQty)+ (checkboxTrRowRiskProfModal ? selectedRowFee : 0 ))*1.05).toFixed(2)}
                  className="mt-1 px-3 py-2 mb-3 border rounded-xl"
                />
                <label className="text-green-700 block text-sm font-bold">7% Profit @{(((((selectedRowPrice * selectedRowQty)+ (checkboxTrRowRiskProfModal ? selectedRowFee : 0 ))*1.07)/selectedRowQty).toFixed(2))}</label>
                <input
                  type="number"
                  step="any"
                  readOnly
                  value={(((selectedRowPrice * selectedRowQty)+ (checkboxTrRowRiskProfModal ? selectedRowFee : 0 ))*1.07).toFixed(2)}
                  className="mt-1 px-3 py-2 mb-3 border rounded-xl"
                />
                <label className="text-green-600 block text-sm font-bold">10% Profit @{(((((selectedRowPrice * selectedRowQty)+ (checkboxTrRowRiskProfModal ? selectedRowFee : 0 ))*1.1)/selectedRowQty).toFixed(2))}</label>
                <input
                  type="number"
                  step="any"
                  readOnly
                  value={(((selectedRowPrice * selectedRowQty)+ (checkboxTrRowRiskProfModal ? selectedRowFee : 0 ))*1.1).toFixed(2)}
                  className="mt-1 px-3 py-2 mb-3 border rounded-xl"
                />

              </div>

            </div>

            <div className="mt-6 flex justify-end">

              <button
                onClick={onClose}
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