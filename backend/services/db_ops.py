from __future__ import annotations

from typing import Dict, List, Any
from datetime import datetime
import math

import yfinance as yf
from sqlalchemy import asc, desc, and_

from db import db
from models.user_model import User
from models.transaction_model import Transaction, TransactionTypeEnum


# ---------- Helpers ----------

def get_last_price(symbol: str) -> float:
    """Fetch last price; fallback to 0.0 if unavailable."""
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(period="1d", interval="1m")
        if data.empty or "Close" not in data.columns:
            return 0.0
        return round(float(data["Close"].iloc[-1]), 2)
    except Exception:
        return 0.0


# ---------- Persistence ----------

def save_transaction(transaction: Transaction) -> None:
    """
    Persist a transaction and (for SELL) compute realized PnL using FIFO,
    updating the matched BUY rows' remaining_quantity.
    """
    db.session.add(transaction)
    db.session.flush()  # allocate transaction.id, keep in same txn

    if transaction.transaction_type == TransactionTypeEnum.SELL:
        qty_to_sell = float(transaction.quantity)
        total_pnl = 0.0

        # FIFO: earliest BUYs first that still have remaining_quantity > 0
        buy_lots: List[Transaction] = (
            db.session.query(Transaction)
            .filter(
                Transaction.user_id == transaction.user_id,
                Transaction.stock_symbol == transaction.stock_symbol,
                Transaction.transaction_type == TransactionTypeEnum.BUY,
                Transaction.remaining_quantity > 0,
            )
            .order_by(asc(Transaction.id))
            .with_for_update()  # lock rows during deduction
            .all()
        )

        for buy in buy_lots:
            if qty_to_sell <= 0:
                break

            remaining = float(buy.remaining_quantity)
            qty_deduct = min(remaining, qty_to_sell)
            new_remaining = remaining - qty_deduct
            buy.remaining_quantity = new_remaining

            # fees allocated per share from each side
            buy_fee_per_share = (buy.fee / remaining) if remaining else 0.0
            sell_fee_per_share = (transaction.fee / float(transaction.quantity)) if transaction.quantity else 0.0

            # lot-level pnl
            lot_pnl = qty_deduct * (
                (float(transaction.price_per_share) - sell_fee_per_share) -
                (float(buy.price_per_share) + buy_fee_per_share)
            )
            total_pnl += lot_pnl

            qty_to_sell -= qty_deduct

        # store realized pnl on the SELL row
        transaction.pnl = float(total_pnl)

    db.session.commit()


# ---------- Queries for API ----------

def get_users() -> List[Dict[str, Any]]:
    users = db.session.query(User).order_by(asc(User.id)).all()
    return [{"id": u.id, "username": u.username} for u in users]


def get_transactions_by_user(user_id: int) -> List[Dict[str, Any]]:
    txs = (
        db.session.query(Transaction)
        .filter(Transaction.user_id == user_id)
        .order_by(desc(Transaction.id))
        .all()
    )
    return [
        {
            "stock_symbol": t.stock_symbol,
            "transaction_type": t.transaction_type.value,
            "quantity": float(t.quantity),
            "remaining_quantity": float(t.remaining_quantity),
            "fee": round(float(t.fee), 2),
            "price_per_share": float(t.price_per_share),
            "total_cost": float(t.total_cost),
            "transaction_date": t.transaction_date.isoformat(),
        }
        for t in txs
    ]


def get_performance_data_by_user(user_id: int) -> Dict[str, Any]:
    # exclude DIVIDEND from portfolio math but they still exist as transactions (pnl holds dividend amount)
    txs = (
        db.session.query(
            Transaction.stock_symbol,
            Transaction.transaction_type,
            Transaction.quantity,
            Transaction.remaining_quantity,
            Transaction.fee,
            Transaction.price_per_share,
            Transaction.pnl,
        )
        .filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type != TransactionTypeEnum.DIVIDEND,
        )
        .order_by(asc(Transaction.id))
        .all()
    )

    total_fee = 0.0
    total_realized_profit = 0.0
    total_realized_loss = 0.0
    total_unrealized_profit = 0.0
    total_unrealized_loss = 0.0
    total_transactions = {"buy": 0, "sell": 0}
    stocks: Dict[str, Dict[str, float]] = {}
    epsilon = 1e-6

    for (
        symbol,
        transaction_type,
        qty,
        remaining_qty,
        fee,
        pps,
        realized_pnl,
    ) in txs:
        symbol = str(symbol)
        qty = float(qty or 0)
        remaining_qty = float(remaining_qty or 0)
        fee = float(fee or 0)
        pps = float(pps or 0)
        realized_pnl = float(realized_pnl or 0)

        total_fee += fee

        if symbol not in stocks:
            stocks[symbol] = {"remaining_qty": 0.0}
        stocks[symbol]["remaining_qty"] += remaining_qty

        if transaction_type == TransactionTypeEnum.BUY:
            total_transactions["buy"] += 1
        elif transaction_type == TransactionTypeEnum.SELL:
            total_transactions["sell"] += 1

        if realized_pnl > 0:
            total_realized_profit += realized_pnl
        else:
            total_realized_loss += abs(realized_pnl)

        if remaining_qty > 0:
            last_price = get_last_price(symbol)
            fee_per_share = (fee / qty) if qty else 0.0
            net_share_price = pps + fee_per_share
            unrealized = remaining_qty * (last_price - net_share_price)
            if unrealized > 0:
                total_unrealized_profit += unrealized
            else:
                total_unrealized_loss += abs(unrealized)

    total_symbols = len(stocks)
    symbols_with_zero_qty = sum(
        1 for s in stocks.values() if s["remaining_qty"] <= epsilon
    )
    symbols_with_not_zero_qty = sum(
        1 for s in stocks.values() if s["remaining_qty"] > epsilon
    )

    return {
        "total_fee": round(total_fee, 2),
        "total_realized_profit": round(total_realized_profit, 2),
        "total_realized_loss": round(total_realized_loss, 2),
        "total_unrealized_profit": round(total_unrealized_profit, 2),
        "total_unrealized_loss": round(total_unrealized_loss, 2),
        "total_transactions": total_transactions,
        "invested_stocks": {
            "total": total_symbols,
            "zero_stocks": symbols_with_zero_qty,
            "non_zero_stocks": symbols_with_not_zero_qty,
        },
    }


def get_portfolio_by_user(user_id: int) -> List[Dict[str, Any]]:
    # Fetch all non-dividend txs ordered by id to reproduce previous logic
    txs = (
        db.session.query(
            Transaction.stock_symbol,
            Transaction.transaction_type,
            Transaction.quantity,
            Transaction.remaining_quantity,
            Transaction.fee,
            Transaction.transaction_date,
            Transaction.price_per_share,
            Transaction.pnl,
        )
        .filter(
            Transaction.user_id == user_id,
            Transaction.transaction_type != TransactionTypeEnum.DIVIDEND,
        )
        .order_by(asc(Transaction.id))
        .all()
    )

    stocks: Dict[str, Dict[str, float]] = {}

    for (
        symbol,
        transaction_type,
        quantity,
        remaining_qty,
        fee,
        _dt,
        pps,
        pnl,
    ) in txs:
        symbol = str(symbol)
        quantity = float(quantity or 0)
        remaining_qty = float(remaining_qty or 0)
        fee = float(fee or 0)
        pps = float(pps or 0)
        pnl = float(pnl or 0)

        if symbol not in stocks:
            stocks[symbol] = {
                "quantity": 0.0,
                "realized": 0.0,
                "unrealized": 0.0,
                "total_fee": 0.0,
            }

        if remaining_qty > 0:
            last_price = get_last_price(symbol)
            fee_per_share = (fee / quantity) if quantity else 0.0
            net_share_price = pps + fee_per_share
            unrealized = remaining_qty * (last_price - net_share_price)
            stocks[symbol]["unrealized"] += unrealized

        if transaction_type == TransactionTypeEnum.BUY:
            stocks[symbol]["quantity"] += quantity
            stocks[symbol]["total_fee"] += fee
        elif transaction_type == TransactionTypeEnum.SELL:
            stocks[symbol]["quantity"] -= quantity
            stocks[symbol]["realized"] += pnl
            stocks[symbol]["total_fee"] += fee

    response: List[Dict[str, Any]] = []
    for symbol, data in stocks.items():
        try:
            last_price = get_last_price(symbol)
            current_value = data["quantity"] * last_price
        except Exception:
            last_price = 0.0
            current_value = 0.0

        response.append(
            {
                "stock_symbol": symbol,
                "quantity": round(float(data["quantity"]), 5),
                "last_price": round(float(last_price), 2),
                "current_value": round(float(current_value), 2),
                "pl": round(float(data["realized"] + data["unrealized"]), 2),
                "realized": round(float(data["realized"]), 2),
                "unrealized": round(float(data["unrealized"]), 2),
                "total_fee": round(float(data["total_fee"]), 2),
            }
        )

    return response


def get_portfolio_row_detail(symbol: str) -> Dict[str, Any]:
    last_price = get_last_price(symbol)
    ticker = yf.Ticker(symbol)
    info = {}
    try:
        info = ticker.info or {}
    except Exception:
        # yfinance sometimes raises for .info; keep defaults
        info = {}

    # intraday close samples
    try:
        data = ticker.history(period="1d", interval="15m")
    except Exception:
        data = None

    stockDailyCloseValues: List[Dict[str, Any]] = []
    if data is not None and not data.empty:
        for dt, row in data.iterrows():
            stockDailyCloseValues.append(
                {"datetime": dt.isoformat(), "close": float(row["Close"])}
            )

    return {
        "shortName": info.get("shortName"),
        "displayName": info.get("displayName"),
        "quoteSourceName": info.get("quoteSourceName"),
        "currentValue": last_price,
        "changePercent": info.get("regularMarketChangePercent"),
        "country": info.get("country"),
        "sector": info.get("sector"),
        "currency": info.get("financialCurrency"),
        "averageAnalystRating": info.get("averageAnalystRating"),
        "stockDailyCloseValues": stockDailyCloseValues,
    }
