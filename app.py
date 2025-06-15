from flask import Flask, render_template, request, redirect, url_for, session, flash
import sqlite3
from datetime import datetime
import config
from db_ops import db_prepare, save_transaction
from transaction_model import Transaction, TransactionTypeEnum

app = Flask(__name__)
app.secret_key = config.SECRET_KEY
DB_FILE = "stocks.db"

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

@app.before_request
def initialize():
     if not hasattr(app, 'started'):
        db_prepare()
        print("DB initialized and App started!")
        app.started = True

@app.route("/", methods=["GET", "POST"])
def select_user():
    if "user_id" in session:
        return redirect(url_for("stocks"))

    conn = get_db_connection()
    users = conn.execute("SELECT * FROM users ORDER BY username").fetchall()
    conn.close()

    if request.method == "POST":
        user_id = request.form.get("user_id")
        if user_id:
            conn = get_db_connection()
            user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
            conn.close()
            if user:
                session["user_id"] = user["id"]
                session["username"] = user["username"]
                config.USER_ID = user["id"]
                return redirect(url_for("stocks"))

    return render_template("user_select.html", users=users)

@app.route("/stocks")
def stocks():
    if "user_id" not in session:
        return redirect(url_for("select_user"))

    config.USER_ID = session["user_id"]
    conn = get_db_connection()
    rows = conn.execute(
        "SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC",
        (session["user_id"],),
    ).fetchall()
    conn.close()

    stocks = []
    for r in rows:
        stocks.append({
            "stock_symbol": r["stock_symbol"],
            "transaction_type": r["transaction_type"],
            "quantity": r["quantity"],
            "price_per_share": r["price_per_share"],
            "fee": r["fee"],
            "total_cost": r["total_cost"],
            "transaction_date": datetime.fromisoformat(r["transaction_date"]),
        })

    return render_template("stocks.html", stocks=stocks)

@app.route("/add_stock", methods=["GET", "POST"])
def add_stock():
    if "user_id" not in session:
        return redirect(url_for("select_user"))

    if request.method == "POST":
        stock_symbol = request.form.get("stock_symbol").upper()
        transaction_type = request.form.get("transaction_type")
        quantity = float(request.form.get("quantity"))
        price_per_share = float(request.form.get("price_per_share"))
        fee = float(request.form.get("fee") or 0)
        transaction_datetime_str = request.form.get("transaction_datetime")
        transaction_datetime_obj = datetime.strptime(transaction_datetime_str, "%Y-%m-%dT%H:%M")

        config.USER_ID = session["user_id"]

        tx = Transaction(
            stock_symbol=stock_symbol,
            transaction_type=TransactionTypeEnum(transaction_type),
            quantity=quantity,
            price_per_share=price_per_share,
            fee=fee,
            transaction_date=transaction_datetime_obj
        )
        save_transaction(tx)
        return redirect(url_for("stocks"))

    today_datetime_local = datetime.now().strftime("%Y-%m-%dT%H:%M")
    return render_template("add_stock.html", today_datetime_local=today_datetime_local)

# TODO Revolut statement upload
@app.route("/upload_revolut", methods=["POST"])
def upload_revolut():
    if "user_id" not in session:
        return redirect(url_for("select_user"))

    if "revolut_file" not in request.files:
        flash("No file part", "danger")
        return redirect(url_for("stocks"))

    file = request.files["revolut_file"]
    if file.filename == "":
        flash("No file selected", "warning")
        return redirect(url_for("stocks"))

    if file:
        content = file.read().decode("utf-8")

        flash("Revolut statement uploaded and processed successfully!", "success")
    else:
        flash("File upload failed", "danger")

    return redirect(url_for("stocks"))

@app.route("/logout")
def logout():
    session.clear()
    config.USER_ID = None
    return redirect(url_for("select_user"))

if __name__ == "__main__":
    app.run(debug=True)
