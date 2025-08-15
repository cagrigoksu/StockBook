import pandas as pd
from transaction_model import Transaction, TransactionTypeEnum
from db_ops import save_transaction
import config
import re
from zoneinfo import ZoneInfo
from dateutil import parser

def saveStatementData(file):
    df = pd.read_csv(file)
    df = df.dropna(subset=['Ticker'])

    type_map = {
        'BUY - MARKET': TransactionTypeEnum.BUY,
        'BUY - LIMIT': TransactionTypeEnum.BUY,
        'SELL - MARKET': TransactionTypeEnum.SELL,
        'SELL - LIMIT': TransactionTypeEnum.SELL,
        'DIVIDEND': TransactionTypeEnum.DIVIDEND
    }

    for idx, row in df.iterrows():
        raw_type = row['Type']
        transaction_type = type_map.get(raw_type)
        if transaction_type is None:
            print(f"Skipping unknown transaction type: {raw_type}")
            continue

        # Parse numeric values safely
        def parse_float(value):
            if isinstance(value, float) or isinstance(value, int):
                return float(value)
            return float(re.sub(r'[^\d\.]', '', str(value).replace(',', '')))

        if transaction_type == TransactionTypeEnum.DIVIDEND:
            quantity = 1
            remaining_quantity = 0
            price_per_share = 0
            total_amount = parse_float(row['Total Amount'])
            fee = 0
            pnl = total_amount  # store dividend received as pnl
        else:
            quantity = parse_float(row['Quantity'])
            remaining_quantity = quantity if transaction_type == TransactionTypeEnum.BUY else 0
            price_per_share = parse_float(row['Price per share'])
            total_amount = parse_float(row['Total Amount'])
            fee = abs(total_amount - (quantity * price_per_share))
            pnl = 0

        # parse date and convert to CET
        dt_utc = parser.parse(row['Date'])
        dt_cet = dt_utc.astimezone(ZoneInfo('Europe/Berlin'))

        stock_symbol = row['Ticker']
        symbol_map = {
            "RHM": "RHM.DE",
            "M0YN": "M0YN.F",
            "SGM": "SGM.SG",
            "DAU0": "DAU0.SG",
        }
        
        stock_symbol = symbol_map.get(stock_symbol, stock_symbol)

        tx = Transaction(
            stock_symbol=stock_symbol,
            quantity=quantity,
            remaining_quantity=remaining_quantity,
            price_per_share=price_per_share,
            transaction_type=transaction_type,
            pnl=pnl,
            fee=fee,
            transaction_date=dt_cet
        )

        save_transaction(tx, config.USER_ID)
