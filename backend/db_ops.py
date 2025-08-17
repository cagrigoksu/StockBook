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
            remaining_quantity Real NOT NULL,
            fee REAL NOT NULL,
            price_per_share REAL NOT NULL,
            dirty_price_per_share REAL NOT NULL,  
            cost_of_shares REAL NOT NULL,         
            total_cost REAL NOT NULL,
            pnl REAL NOT NULL,
            user_id INTEGER NOT NULL,
            transaction_date TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)
    conn.commit()
    conn.close()

def get_last_price(symbol):
    ticker = yf.Ticker(symbol)
    data = ticker.history(period="1d", interval="1m")
    if data.empty or 'Close' not in data.columns:
        return 0.0
    
    result = data['Close'].iloc[-1]
    return round(result, 2)

#* save transaction
def save_transaction(transaction: Transaction, user_id: int):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO transactions (
            stock_symbol,
            transaction_type,
            quantity,
            remaining_quantity,
            fee,
            price_per_share,
            dirty_price_per_share,
            cost_of_shares,    
            total_cost,
            pnl,
            user_id,
            transaction_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, transaction.to_db_tuple(user_id))

    last_id = cursor.lastrowid  

    if transaction.transaction_type.value == TransactionTypeEnum.SELL.value: 
        qty_to_sell = transaction.quantity
        total_pnl = 0.0

        cursor.execute("""
            SELECT id, remaining_quantity, price_per_share, fee
            FROM transactions
            WHERE user_id = ? 
              AND stock_symbol = ? 
              AND transaction_type = ?
              AND remaining_quantity > 0
            ORDER BY id ASC
        """, (user_id, transaction.stock_symbol, TransactionTypeEnum.BUY.value))  

        buy_rows = cursor.fetchall()

        for buy_id, remaining, buy_price, buy_fee in buy_rows:  
            if qty_to_sell <= 0:
                break

            qty_deduct = min(remaining, qty_to_sell)
            new_remaining = remaining - qty_deduct

            cursor.execute("""
                UPDATE transactions
                SET remaining_quantity = ?
                WHERE id = ?
            """, (new_remaining, buy_id))

            buy_fee_per_share = buy_fee / remaining if remaining else 0  
            sell_fee_per_share = transaction.fee / transaction.quantity  
            lot_pnl = qty_deduct * (
                (transaction.price_per_share - sell_fee_per_share) -
                (buy_price + buy_fee_per_share)
            )  

            total_pnl += lot_pnl  

            qty_to_sell -= qty_deduct

        cursor.execute("""
            UPDATE transactions
            SET pnl = ?
            WHERE id = ?
        """, (total_pnl, last_id))

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
    cursor.execute("SELECT stock_symbol, transaction_type, quantity, remaining_quantity, fee, price_per_share, total_cost, transaction_date FROM transactions WHERE user_id=? ORDER BY id DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "stock_symbol": row[0],
            "transaction_type": row[1],
            "quantity": row[2],
            "remaining_quantity": row[3],
            "fee": round(row[4],2),
            "price_per_share": row[5],
            "total_cost": row[6],
            "transaction_date": row[7]
        } for row in rows
    ]

#* get performance data by user
def get_performance_data_by_user(user_id):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute(
        """select stock_symbol, transaction_type, quantity, remaining_quantity, fee, price_per_share, pnl
        from transactions
        where user_id = ? and transaction_type != ? order by id asc
        """, (user_id, TransactionTypeEnum.DIVIDEND.value))
    
    rows = cursor.fetchall()
    conn.close()
    
    total_fee = 0.0
    total_realized_profit = 0.0
    total_realized_loss = 0.0
    total_unrealized_profit = 0.0
    total_unrealized_loss = 0.0
    total_transactions = {"buy":0, "sell":0}
    stocks = {}
    epsilon = 1e-6
    
    for r in rows:
        symbol = r[0]
        transaction_type = r[1]
        qty = r[2]
        remaining_qty = r[3]
        fee = r[4]
        pps = r[5]
        total_fee += fee
        
        if symbol not in stocks:
            stocks[symbol] = {'remaining_qty': 0}
        else:
            stocks[symbol]['remaining_qty'] += remaining_qty
        
        if transaction_type == TransactionTypeEnum.BUY.value:
            total_transactions['buy'] += 1
        elif transaction_type == TransactionTypeEnum.SELL.value:
            total_transactions['sell'] += 1        
        
        realized_return = r[6]
        if realized_return > 0:
            total_realized_profit += realized_return
        else:
            total_realized_loss += abs(realized_return)
            
        last_price = get_last_price(symbol)
        
        if remaining_qty > 0:
            fee_per_share = fee / qty
            net_share_price = pps + fee_per_share
            unrealized = remaining_qty * (last_price - net_share_price)
            if unrealized > 0:
                total_unrealized_profit += unrealized
            else:
                total_unrealized_loss += abs(unrealized)
    
    total_symbols = len(stocks)
    symbols_with_zero_qty = sum(1 for s in stocks.values() if s['remaining_qty'] <= epsilon)
    symbols_with_not_zero_qty = sum(1 for s in stocks.values() if s['remaining_qty'] > epsilon)
            
    response = {
        "total_fee": round(total_fee,2),
        "total_realized_profit": round(total_realized_profit,2),
        "total_realized_loss": round(total_realized_loss,2),
        "total_unrealized_profit": round(total_unrealized_profit,2),
        "total_unrealized_loss": round(total_unrealized_loss,2),
        "total_transactions": total_transactions,
        "invested_stocks": {'total': total_symbols, "zero_stocks": symbols_with_zero_qty, "non_zero_stocks": symbols_with_not_zero_qty},
    }
    
    return response    

#* get portfolio by user
def get_portfolio_by_user(user_id):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT stock_symbol, transaction_type, quantity, remaining_quantity, fee, transaction_date, price_per_share, pnl "
        "FROM transactions WHERE user_id=? AND transaction_type!=? ORDER BY id ASC",
        (user_id, TransactionTypeEnum.DIVIDEND.value)
    )
    rows = cursor.fetchall()
    conn.close()

    stocks = {}

    for row in rows:
        symbol = row[0]
        transaction_type = row[1]
        quantity = row[2]
        remaining_qty = row[3]
        fee = row[4]
        pps = row[6]
        pnl = row[7]

        if symbol not in stocks:
            stocks[symbol] = {'quantity': 0, 'realized': 0, 'unrealized': 0, 'total_fee': 0}
        
        if remaining_qty > 0:
            last_price = get_last_price(symbol)
            fee_per_share = fee / quantity
            net_share_price = pps + fee_per_share
            unrealized = remaining_qty * (last_price - net_share_price)
            stocks[symbol]['unrealized'] += unrealized

        if transaction_type == TransactionTypeEnum.BUY.value:
            stocks[symbol]['quantity'] += quantity
            stocks[symbol]['total_fee'] += fee

        elif transaction_type == TransactionTypeEnum.SELL.value:
            stocks[symbol]['quantity'] -= quantity
            stocks[symbol]['realized'] += pnl
            stocks[symbol]['total_fee'] += fee

    response = []
    for symbol, data in stocks.items():
        try:
            last_price = get_last_price(symbol)
            current_value = data['quantity'] * last_price            
            
        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}")
            last_price = 0
            current_value = 0

        response.append({
            "stock_symbol": symbol,
            "quantity": round(data['quantity'], 5),
            "last_price": round(last_price, 2),
            "current_value": round(current_value, 2),
            "pl": round(data['realized'] + data['unrealized'], 2),  # use stored pnl
            "realized": round(data['realized'], 2),
            "unrealized": round(data['unrealized'], 2),
            "total_fee": round(data['total_fee'], 2),
        })

    return response

#* get portfolio row data for detail modal
def get_portfolio_row_detail(symbol):
    last_price = get_last_price(symbol)
    
    ticker = yf.Ticker(symbol)
    info = ticker.info   
    
    data = ticker.history(period="1d", interval="15m")
    stockDailyCloseValues = []
    for dt, row in data.iterrows():
        stockDailyCloseValues.append({
            "datetime": dt.isoformat(), 
            "close": row['Close']
        })
    
    return {
        "shortName": info.get('shortName'),
        "displayName": info.get('displayName'),
        "quoteSourceName": info.get('quoteSourceName'),
        "currentValue": last_price,
        "changePercent": info.get('regularMarketChangePercent'),
        "country": info.get("country"),
        "sector": info.get("sector"),
        "currency": info.get("financialCurrency"),
        "averageAnalystRating": info.get("averageAnalystRating"),
        "stockDailyCloseValues": stockDailyCloseValues
        }