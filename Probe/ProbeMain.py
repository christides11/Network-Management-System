from asyncio.windows_events import NULL
from glob import glob
import inspect
import socketio
import sys
import socket
import multiprocessing
from threading import Thread
import subprocess
import os
import asyncio
from datetime import datetime
from aiorun import run
from getmac import get_mac_address
from pysnmp.entity.rfc3413.oneliner import cmdgen
if sys.platform.startswith("win"):
    import wmi as wmi
elif sys.platform.startswith("linux"):
    import wmi_client_wrapper as wmi

sio = socketio.AsyncClient()
socket.setdefaulttimeout(0.25)

probeID = 1

sensors = {}
from sensors.SensorPing import SensorPing
sensorPing = SensorPing()
sensors[sensorPing.id] = sensorPing
from sensors.SensorSNMPTraffic import SensorSNMPTraffic
sensorSNMPTraffic = SensorSNMPTraffic()
sensors[sensorSNMPTraffic.id] = sensorSNMPTraffic

import discovery

@sio.event
async def connect():
    print("CLIENT: {}: connection established. Trying link.".format(probeID))
    await sio.emit('LinkProbe', probeID)

@sio.event
async def Probe_RunDiscoverScan(data):
    print('Probe received discovery job, starting...')
    result = []
    match data['params']['scanType']:
        case 0:
            print("SCAN TYPE: Address Ranges")
            for x in range(len(data['params']["ipStartRange"])):
                result += discovery.ScannerTask(data, data['params']["ipStartRange"][x], data['params']["ipEndRange"][x], data['wmiCreds'], data['snmpCreds'])
        case 1:
            #TODO
            print("SCAN TYPE: Subnets")
    await sio.emit('ReceiveScanLogFromProbe', {'discoveryID': data['params']['id'], 'devicesFound': result})

@sio.event
async def Probe_TryPingAllDevices(data):
    print("...")

# Probe tries to ping a given IP address, returning information on the device if successful.
@sio.event
async def Probe_TryPingDevice(data):
    DEVNULL = open(os.devnull,'w')
    success = False
    try:
        subprocess.check_call(['ping','-n','2','-w','250', data["ip"]], stdout=DEVNULL)
        success = True
    except:
        pass
    await sio.emit('ReportDevicePingResult', {"ip": data["ip"], "result": success})

@sio.event
async def Probe_RunDeviceSensors(data):
    for d in data:
        if d[0]['sensor_id'] not in sensors:
            print("Sensor", d[0]['sensor_id'], "does not exist or is not registered.")
            return
        sensors[d[0]['sensor_id']].runSensor([d], OnDeviceSensorFinished)

def OnDeviceSensorFinished(success, deviceid, sensorid, devicesensorid, channelData):
    loop = asyncio.get_event_loop()
    loop.create_task(sio.emit('ReportDeviceSensorStatus', {'deviceid': deviceid, 'sensorid': sensorid, 'devicesensorid': devicesensorid, 'up': success}))
    if success == False: return
    loop.create_task( sio.emit('InsertDeviceSensorData', {'deviceid': deviceid, 'sensorid': sensorid, 'devicesensorid': devicesensorid, 'channeldata': channelData}) )

@sio.event
async def disconnect():
    print('disconnected from server.')

async def probeMain(serverIP):
    await sio.connect(serverIP)
    await sio.wait()

if __name__ == '__main__':
    serverIP = 'http://localhost:5000'
    if len(sys.argv) > 1:
        serverIP = str(sys.argv[1])
    if len(sys.argv) > 2:
        probeID = int(sys.argv[2])
    run(probeMain(serverIP))