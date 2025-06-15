import sqlite3
from transaction_model import Transaction

def create_user_table():
    conn = sqlite3.connect("stocks.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL
        )""")
    conn.commit()
    
    conn.execute("INSERT INTO users (username) VALUES (?)", ("goksu",))
    conn.execute("INSERT INTO users (username) VALUES (?)", ("shahrud",))
    conn.commit()  

def create_transactions_table():
    conn = sqlite3.connect("stocks.db")
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
            user_id INT NOT NULL,
            transaction_date TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()

def save_transaction(transaction: Transaction):

    conn = sqlite3.connect("stocks.db")
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


def db_prepare():
    create_user_table()
    create_transactions_table()

if __name__ == "__main__":
    db_prepare()
    print("Database tables created successfully.")
