from flask import Flask

from user.routes import user

app = Flask(__name__)
app.register_blueprint(user)

@app.route('/')
def hello(): 
    return "Hey!"

if __name__ == '__main__':
    app.run()