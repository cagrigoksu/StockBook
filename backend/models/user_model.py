from db import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String, nullable=False, unique=True)

    transactions = db.relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
