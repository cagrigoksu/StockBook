import sqlite3
from transaction_model import Transaction

DB_FILE = "stocks.db"

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

def db_prepare():
    create_user_table()
    create_transactions_table()

def save_transaction(transaction: Transaction):
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
    """, transaction.to_db_tuple())
    conn.commit()
    conn.close()
