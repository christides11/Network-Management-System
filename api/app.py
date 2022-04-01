"""
Main Flask API File.

Run this file with python app.py
"""

from flask import Flask
from flask_cors import CORS
import socketio
import core_server
import asyncio

from user.routes import user
from network.routes import network
from probes.routes import probes
from devices.routes import devices
from sensors.routes import sensors

app = Flask(__name__)
CORS(app)
@app.route('/')
def welcome_message(): 
    return "Welcome to Flask API Server!"

# Register blueprints
app.register_blueprint(user)
app.register_blueprint(network)
app.register_blueprint(probes)
app.register_blueprint(devices)
app.register_blueprint(sensors)


# ==================================
# Socket IO
sio = socketio.AsyncClient()

# Core Server =====================
# login and registration
@sio.on('ReceiveLoginResult')
async def loginResult(result):
    core_server.logInResult = result

@sio.on('ReceiveRegistrationResult')
async def registrationResult(result):
    core_server.signUpResult = result

# discovery scanning
@sio.on('ReceiveDiscoveryScanList')
async def discoveryScanList(scanList):
    core_server.discoveryScanList = scanList

@sio.on('Frontend_RegisterDiscoveryScanResult')
async def frontend_registerDiscoveryScanList(scanList):
    core_server.frontend_registerDiscoveryScanList = scanList

@sio.on('ReceiveScanLogs')
async def receiveScanLogs(scanLogs):
    core_server.scanLogs = scanLogs

# credentials

## snmp
@sio.on('ReceiveSNMPCredentials')
async def receiveSNMPCredentials(record):
    core_server.snmpCredentialsList = record

@sio.on('ReceiveSNMPCredential')
async def receiveSNMPCredentials(record):
    core_server.snmpCredentials = record

# wmi
@sio.on('ReceiveWMICredentials')
async def receiveWMICredentials(record):
    core_server.wmiCredentialsList = record

@sio.on('ReceiveWMICredential')
async def receiveWMICredentials(record):
    core_server.wmiCredentials = record

# devices
@sio.on('ReceiveProbeList')
async def receiveProbeList(probeList):
    core_server.probesList = probeList

@sio.on('ReceiveDeviceList')
async def receiveDeviceList(deviceList):
    core_server.deviceListAttachedToProbe = deviceList

@sio.on('ReceiveDeviceList')
async def receiveFullDeviceList(deviceList):
    core_server.deviceList = deviceList

@sio.on('RegisterDeviceResult')
async def registerDeviceResult(deviceResult):
    core_server.registerDeviceResult = deviceResult

# helper ==========================
@sio.event
def connect():
    print("I'm connected!")

@sio.event
def connect_error(data):
    print("The connection failed! " + data)

@sio.event
def disconnect():
    print("I'm disconnected!")

# =================================
async def connectToCoreServer():
    await sio.connect('http://localhost:8182') # port to core server

# ==================================

if __name__ == '__main__':
    # asyncio is an Python library used to run async coroutines (https://docs.python.org/3/library/asyncio-task.html)
    asyncio.run(connectToCoreServer())
    print("hey")
    app.run(debug=True)