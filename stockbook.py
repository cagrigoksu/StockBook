from transaction_model import Transaction, TransactionTypeEnum
from db_ops import save_transaction, db_prepare
import config
import sqlite3
from datetime import datetime

config.USER_ID = 1

#test
tx = Transaction(
    stock_symbol="GOOGL",
    transaction_type=TransactionTypeEnum.BUY,
    quantity= 10,
    price_per_share=10,    
    fee=1,
    transaction_date=datetime.now()
)

db_prepare()
save_transaction(tx)
print(tx)



