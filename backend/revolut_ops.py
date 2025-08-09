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

    for idx, row in df.iterrows():

        if row['Type'] == 'DIVIDEND':
            quantity = 1
            pps = 0
            #TODO : IMPORTANT FIX
            #! total amount comes 0, transaction_model.py, line 21
            total_amount = row['Total Amount'] if isinstance(row['Total Amount'], float)  else float(re.sub(r'[^\d\.]', '', row['Total Amount'].replace(',', '')))
            fee_ = 0
            taction_type = TransactionTypeEnum.DIVIDEND
        else:
            quantity = row['Quantity']
            pps = row['Price per share'] if isinstance(row['Price per share'], float)  else float(re.sub(r'[^\d\.]', '', row['Price per share'].replace(',', '')))
            total_amount = row['Total Amount'] if isinstance(row['Total Amount'], float)  else float(re.sub(r'[^\d\.]', '', row['Total Amount'].replace(',', '')))
            fee_ = total_amount - (quantity * pps)
            taction_type = TransactionTypeEnum.BUY if row['Type'] == "BUY - MARKET" else TransactionTypeEnum.SELL
            if row['Type'] == 'BUY - MARKET' or row['Type'] == 'BUY - LIMIT':
                taction_type = TransactionTypeEnum.BUY
            elif row['Type'] == 'SELL - MARKET' or row['Type'] == 'SELL - LIMIT':
                taction_type = TransactionTypeEnum.SELL
            
        dt_utc = parser.parse(row['Date'])
        dt_cet = dt_utc.astimezone(ZoneInfo('Europe/Berlin'))

        tx = Transaction(
            stock_symbol=row['Ticker'],
            quantity= quantity,
            price_per_share= pps,
            transaction_type= taction_type,
            fee= fee_,
            transaction_date=dt_cet
        )
        
        #TODO : optimize here
        if tx.stock_symbol == "RHM":
            tx.stock_symbol = "RHM.DE"   
        
        if tx.stock_symbol == "M0YN":
            tx.stock_symbol = "M0YN.F"  
        
        if tx.stock_symbol == "SGM":
            tx.stock_symbol = "SGM.SG"        
        
        save_transaction(tx, config.USER_ID)