from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:test@localhost/nim"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# Create tables
# Must be in this file so that DB can access it and find it
from models import User
db.create_all() 


@app.route('/')
def hello(): 
    return "Hey!"

@app.route('/user', methods=['POST'])
def create_user():
    username = request.json['username']
    password = request.json['password']

    user = User(username, password)

    db.session.add(user)
    db.session.commit()
    
    return format_user(user);


def format_user(user):
    return {
        "id": user.id,
        "username": user.username,
        "password": user.password
    }




if __name__ == '__main__':
    app.run()