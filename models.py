from app import db

class User (db.Model):
    def __init__(self, username, password):
        self.username = username
        self.password = password

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f"User: {self.id}"