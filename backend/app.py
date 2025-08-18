import os
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import timedelta, datetime

import config
from db import db
from services import db_ops as do
from services.revolut_ops import saveStatementData
from models.transaction_model import Transaction, TransactionTypeEnum
from init_db import init_db  


load_dotenv()
load_dotenv(dotenv_path=".env.local", override=True)

app = Flask(__name__)
CORS(app, supports_credentials=True)

#!config
app.secret_key = config.SECRET_KEY
app.permanent_session_lifetime = timedelta(minutes=10)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
init_db(app)

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

@app.route("/api/performance", methods=["GET"])
def get_performance():
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
        stock_symbol=data["stock_symbol"],
        transaction_type=TransactionTypeEnum[data["transaction_type"]],
        quantity=data["quantity"],
        remaining_quantity=remaining_quantity,
        price_per_share=data["price_per_share"],
        fee=data["fee"],
        pnl=0,
        transaction_date=datetime.fromisoformat(data["transaction_date"]),
        user_id=int(user_id)
    )
    do.save_transaction(tx)
    return jsonify({"status": "saved"})

@app.route("/api/upload_statement", methods=["POST"])
def upload_statement():
    file = request.files['file']
    saveStatementData(file)
    return jsonify({"status": "uploaded"})


if __name__ == "__main__":
    app.run(debug=True)
