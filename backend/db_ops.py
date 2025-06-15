import sqlite3
from transaction_model import Transaction

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
    cursor.execute("SELECT stock_symbol, transaction_type, quantity, total_cost, transaction_date FROM transactions WHERE user_id=?", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "stock_symbol": row[0],
            "transaction_type": row[1],
            "quantity": row[2],
            "total_cost": row[3],
            "transaction_date": row[4]
        } for row in rows
    ]
