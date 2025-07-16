from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
from db_ops import get_users, get_transactions_by_user, save_transaction, db_prepare
from transaction_model import Transaction, TransactionTypeEnum
from revolut_ops import saveStatementData
from datetime import datetime
import config
import os

app = Flask(__name__)
app.secret_key = config.SECRET_KEY
CORS(app, supports_credentials=True)

db_prepare()

@app.route("/api/users", methods=["GET"])
def list_users():
    return jsonify(get_users())

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
    
@app.route("/api/transactions", methods=["GET"])
def get_transactions():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify([])
    return jsonify(get_transactions_by_user(user_id))

@app.route("/api/add_transaction", methods=["POST"])
def add_transaction():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "User not selected"}), 400

    data = request.json
    tx = Transaction(
        stock_symbol=data["stock_symbol"],
        transaction_type=TransactionTypeEnum[data["transaction_type"]],
        quantity=data["quantity"],
        price_per_share=data["price_per_share"],
        fee=data["fee"],
        transaction_date=datetime.fromisoformat(data["transaction_date"])
    )
    save_transaction(tx, int(user_id))
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