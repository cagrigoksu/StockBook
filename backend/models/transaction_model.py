from db import db
from enum import Enum
from datetime import datetime

class TransactionTypeEnum(Enum):
    BUY = "BUY"
    SELL = "SELL"
    SELL_LIMIT = "SELL_LIMIT"
    DIVIDEND = "DIVIDEND"

class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    stock_symbol = db.Column(db.String, nullable=False)
    transaction_type = db.Column(db.Enum(TransactionTypeEnum), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    remaining_quantity = db.Column(db.Float, nullable=False, default=0)
    fee = db.Column(db.Float, nullable=False)
    price_per_share = db.Column(db.Float, nullable=False)
    dirty_price_per_share = db.Column(db.Float, nullable=False)
    cost_of_shares = db.Column(db.Float, nullable=False)
    total_cost = db.Column(db.Float, nullable=False)
    pnl = db.Column(db.Float, nullable=False, default=0)
    transaction_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    user = db.relationship("User", back_populates="transactions")

    def __init__(self, stock_symbol, transaction_type, quantity, remaining_quantity,
                 price_per_share, fee, pnl, transaction_date, user_id):
        self.stock_symbol = stock_symbol
        self.transaction_type = transaction_type
        self.quantity = quantity
        self.remaining_quantity = remaining_quantity
        self.price_per_share = price_per_share
        self.fee = fee
        self.pnl = pnl
        self.transaction_date = transaction_date
        self.user_id = user_id

        self.cost_of_shares = price_per_share * quantity
        self.total_cost = self.cost_of_shares + fee
        self.dirty_price_per_share = self.total_cost / quantity if quantity else 0
