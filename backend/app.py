from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
import db_ops as do
from transaction_model import Transaction, TransactionTypeEnum
from revolut_ops import saveStatementData
from datetime import datetime, timedelta
import config
import os

app = Flask(__name__)
app.secret_key = config.SECRET_KEY
app.permanent_session_lifetime = timedelta(minutes=10)
CORS(app, supports_credentials=True)

do.db_prepare()

@app.route("/api/users", methods=["GET"])
def list_users():
    return jsonify(do.get_users())

@app.route("/api/select_user", methods=["POST"])
def select_user():
    user_id = request.json.get("user_id")
    session["user_id"] = user_id
    config.USER_ID = user_id
    return jsonify({"status": "success"})

@app.route("/api/user_logout", methods=["GET"])
def user_logout():
    session.pop("user_id", None)
    return jsonify({"status": "success"})

@app.route("/api/portfolio", methods=["GET"])
def get_portfolio():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify([])
    return jsonify(do.get_portfolio_by_user(user_id))

@app.route("/api/portfolioRowDetail", methods=["GET"])
def get_portfolio_row_detail():
    symbol = request.args.get("symbol") 
    return jsonify(do.get_portfolio_row_detail(symbol))

#TODO: add dividend data
@app.route("/api/performance", methods=["GET"])
def get_performace_data():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify([])
    return jsonify(do.get_performance_data_by_user(user_id))
    
@app.route("/api/transactions", methods=["GET"])
def get_transactions():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify([])
    return jsonify(do.get_transactions_by_user(user_id))

@app.route("/api/add_transaction", methods=["POST"])
def add_transaction():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "User not selected"}), 400

    data = request.json
    remaining_quantity = data["quantity"] if TransactionTypeEnum[data["transaction_type"]] == TransactionTypeEnum.BUY else 0
        
    tx = Transaction(
        stock_symbol = data["stock_symbol"],
        transaction_type = TransactionTypeEnum[data["transaction_type"]],
        quantity = data["quantity"],
        remaining_quantity = remaining_quantity,
        fee = data["fee"],
        price_per_share = data["price_per_share"],
        transaction_date = datetime.fromisoformat(data["transaction_date"]),
        pnl = 0
    )
    do.save_transaction(tx, int(user_id))
    return jsonify({"status": "saved"})

@app.route("/api/upload_statement", methods=["POST"])
def upload_statement():
    file = request.files['file']
    #file_path = os.path.join('backend/uploads', str(config.USER_ID))
    #file.save(file_path)
    saveStatementData(file)
    return jsonify({"status": "uploaded"})

if __name__ == '__main__':
    app.run(debug=True)