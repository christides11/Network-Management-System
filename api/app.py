from flask import Flask

from user.routes import user
from network.routes import network
from probes.routes import probes
from devices.routes import devices
from sensors.routes import sensors

app = Flask(__name__)
app.register_blueprint(user)
app.register_blueprint(network)
app.register_blueprint(probes)
app.register_blueprint(devices)
app.register_blueprint(sensors)

@app.route('/')
def hello(): 
    return "Hey!"

if __name__ == '__main__':
    app.run(debug=True)