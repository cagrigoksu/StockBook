from db import db
from models.user_model import User
from models.transaction_model import Transaction, TransactionTypeEnum

def init_db(app):
    """Initialize DB and seed default users"""
    with app.app_context():
        db.create_all()

        if not User.query.first():
            user1 = User(username="User1")
            user2 = User(username="User2")
            db.session.add_all([user1, user2])
            db.session.commit()
            print("Database initialized with default users")
        else:
            print("Database already initialized")
