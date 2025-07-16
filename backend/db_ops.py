import sqlite3
from transaction_model import Transaction, TransactionTypeEnum
import yfinance as yf
import math

DB_FILE = "stocks.db"

#* prepare db
def db_prepare():
    create_user_table()
    create_transactions_table()

#* create user table and default users if not exists
def create_user_table():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE
        )
    """)

    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO users (username) VALUES (?)", ("User1",))
        cursor.execute("INSERT INTO users (username) VALUES (?)", ("User2",))
    conn.commit()
    conn.close()

#* create transaction table if not exists
def create_transactions_table():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            stock_symbol TEXT NOT NULL,
            transaction_type TEXT NOT NULL,
            quantity REAL NOT NULL,
            fee REAL NOT NULL,
            price_per_share REAL NOT NULL,
            dirty_price_per_share REAL NOT NULL,  
            cost_of_shares REAL NOT NULL,         
            total_cost REAL NOT NULL,
            user_id INTEGER NOT NULL,
            transaction_date TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)
    conn.commit()
    conn.close()

#* save transaction
def save_transaction(transaction: Transaction, user_id: int):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO transactions (
            stock_symbol,
            transaction_type,
            quantity,
            fee,
            price_per_share,
            dirty_price_per_share,
            cost_of_shares,    
            total_cost,
            user_id,
            transaction_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, transaction.to_db_tuple(user_id))
    conn.commit()
    conn.close()

#* get users
def get_users():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id, username FROM users")
    users = cursor.fetchall()
    conn.close()
    return [{"id": row[0], "username": row[1]} for row in users]

#* get transactions by user
def get_transactions_by_user(user_id):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT stock_symbol, transaction_type, quantity, fee, price_per_share, total_cost, transaction_date FROM transactions WHERE user_id=?", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "stock_symbol": row[0],
            "transaction_type": row[1],
            "quantity": row[2],
            "fee": round(row[3],2),
            "price_per_share": row[4],
            "total_cost": row[5],
            "transaction_date": row[6]
        } for row in rows
    ]

#* get portfolio by user
def get_portfolio_by_user(user_id):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT stock_symbol, transaction_type, quantity FROM transactions WHERE user_id=? and transaction_type!=?", (user_id,TransactionTypeEnum.DIVIDEND.value,))
    rows = cursor.fetchall()
    conn.close()
    result = [
        {
            "stock_symbol": row[0],
            "transaction_type": row[1],
            "quantity": row[2],
\
        } for row in rows
    ]
    
    stocks = {}
    for item in result:
        symbol = item["stock_symbol"]
        if symbol not in stocks:
            stocks[symbol] = { 'quantity' : 0 }
        
        if item["transaction_type"] == TransactionTypeEnum.BUY.value:
            stocks[symbol]['quantity'] += item['quantity']
        elif item["transaction_type"] == TransactionTypeEnum.SELL.value:
            stocks[symbol]['quantity'] -= item['quantity']
    
    stocks = {
        symbol: data for symbol, data in stocks.items()
        if not math.isclose(data['quantity'], 0.0, abs_tol=1e-10)
    }
    
    response = []
    for symbol, data in stocks.items():
        try:
            ticker = yf.Ticker(symbol)
            last_price = ticker.analyst_price_targets['current']
            current_value = data['quantity'] * last_price
        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}")
            last_price = 0
            current_value = data['quantity'] * last_price
        response.append({
            "stock_symbol": symbol,
            "quantity":  data['quantity'],
            "last_price": round(last_price,2),
            "current_value": round(current_value,2)
        })
        
    return response