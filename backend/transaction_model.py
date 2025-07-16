from dataclasses import dataclass
from datetime import datetime
from enum import Enum
import config

class TransactionTypeEnum(Enum):
    BUY = "BUY"
    SELL = "SELL"
    SELL_LIMIT = "SELL_LIMIT"
    DIVIDEND = "DIVIDEND"

@dataclass
class Transaction:
    stock_symbol: str      
    transaction_type: TransactionTypeEnum
    quantity: float         
    price_per_share: float 
    fee: float
    transaction_date: datetime 

    def to_db_tuple(self, user_id: int):
        total_cost = (self.price_per_share * self.quantity) + self.fee
        cost_of_shares = (self.price_per_share * self.quantity)
        dirty_price_per_share = total_cost / self.quantity
        return (
            self.stock_symbol,
            self.transaction_type.value,
            self.quantity,
            self.fee,
            self.price_per_share,
            dirty_price_per_share,
            cost_of_shares,    
            total_cost,
            user_id,
            self.transaction_date.isoformat()
        )

