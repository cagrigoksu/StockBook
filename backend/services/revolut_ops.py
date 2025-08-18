from __future__ import annotations

import re
import pandas as pd
from zoneinfo import ZoneInfo
from dateutil import parser

import config
from db import db
from models.transaction_model import Transaction, TransactionTypeEnum
from services.db_ops import save_transaction


def _parse_float(value) -> float:
    if isinstance(value, (int, float)):
        return float(value)
    # keep only digits and dot; also handle commas
    return float(re.sub(r"[^\d\.]", "", str(value).replace(",", "")) or 0)


def saveStatementData(file) -> None:
    """
    Reads a Revolut CSV (as uploaded FileStorage), maps to Transaction rows,
    and saves them for the currently selected user (config.USER_ID).
    - BUY/SELL: compute fee as |Total - qty*price|
    - DIVIDEND: store received amount in pnl
    - Convert timestamps to CET/CEST (Europe/Berlin)
    - Map a few custom tickers to exchange-specific symbols as before
    """
    user_id = config.USER_ID
    if not user_id:
        raise ValueError("No user selected. Please select a user before uploading.")

    df = pd.read_csv(file)
    df = df.dropna(subset=["Ticker"])

    type_map = {
        "BUY - MARKET": TransactionTypeEnum.BUY,
        "BUY - LIMIT": TransactionTypeEnum.BUY,
        "SELL - MARKET": TransactionTypeEnum.SELL,
        "SELL - LIMIT": TransactionTypeEnum.SELL,
        "DIVIDEND": TransactionTypeEnum.DIVIDEND,
    }

    symbol_map = {
        "RHM": "RHM.DE",
        "M0YN": "M0YN.F",
        "SGM": "SGM.SG",
        "DAU0": "DAU0.SG",
    }

    for _, row in df.iterrows():
        raw_type = str(row["Type"])
        tx_type = type_map.get(raw_type)
        if tx_type is None:
            # Skip unknown types but keep the import robust
            print(f"Skipping unknown transaction type: {raw_type}")
            continue

        if tx_type == TransactionTypeEnum.DIVIDEND:
            quantity = 1.0
            remaining_quantity = 0.0
            price_per_share = 0.0
            total_amount = _parse_float(row["Total Amount"])
            fee = 0.0
            pnl = total_amount  # dividend received
        else:
            quantity = _parse_float(row["Quantity"])
            remaining_quantity = quantity if tx_type == TransactionTypeEnum.BUY else 0.0
            price_per_share = _parse_float(row["Price per share"])
            total_amount = _parse_float(row["Total Amount"])
            fee = abs(total_amount - (quantity * price_per_share))
            pnl = 0.0

        # Parse date to timezone-aware CET/CEST
        dt_utc = parser.parse(str(row["Date"]))
        dt_cet = dt_utc.astimezone(ZoneInfo("Europe/Berlin"))

        stock_symbol = str(row["Ticker"])
        stock_symbol = symbol_map.get(stock_symbol, stock_symbol)

        tx = Transaction(
            stock_symbol=stock_symbol,
            quantity=quantity,
            remaining_quantity=remaining_quantity,
            price_per_share=price_per_share,
            transaction_type=tx_type,
            pnl=pnl,
            fee=fee,
            transaction_date=dt_cet,
            user_id=int(user_id),
        )

        save_transaction(tx)
