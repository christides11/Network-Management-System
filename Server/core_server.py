from asyncio.windows_events import NULL
from glob import glob
from aiohttp import web
import socket
import socketio
import scapy.all as scapy
from mac_vendor_lookup import MacLookup
from threading import Thread
import sys
import psycopg2
import json
import sys
sys.path.append('../Probe/')
import subprocess

hostProbe = NULL
sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)

f = open('env.json')
dbLogin = json.load(f)
f.close()
probes = []
dbConn = NULL

@sio.event
async def connect(sid, environ):
    print("connect ", sid)

@sio.event
async def RegisterDiscoveryScan(sid, scanName, probeIndex, discoveryOptions):
    print("Registering scan", scanName, "for probe", probes[probeIndex]["nickname"])
    print("Starting scan", scanName, "on probe", probes[probeIndex]["nickname"])
    await sio.emit('StartScan', {})

@sio.event
def ReceiveScanResults(sid, data):
    print('SERVER:')
    for x in range(len(data["resultList"])):
        print(data["resultList"][x])

@sio.event
async def testCall(sid):
    await sio.emit('DiscoverDevicesICMP', {'listIsIPRanges': True, 'searchList': ['10.4.1.10', '10.4.1.100'] })

@sio.event
async def TryRegisterProbe(sid, probeName, probeIP):
    print("Trying to register probe {}.".format(probeIP))
    probes.append({nickname: probeName, ip: probeIP, hid: "dummy"})

@sio.event
async def TryRemoveProbeByIP(sid, probeIP):
    print("Trying to remove probe {}.".format(probbeIP))

@sio.event
async def TryRemoveProbeByName(sid, probeName):
    print("Trying to remove probe {}.".format(probeName))

@sio.event
async def Client_DiscoveryScan(sid):
    print("ccc.")    

@sio.event
def disconnect(sid):
    print('disconnect ', sid)

def main(shouldHostProbe, serverIP, serverPort):
    global hostProbe
    dbConn = psycopg2.connect(dbname=dbLogin["DB_NAME"], user=dbLogin["DB_USER"], password=dbLogin["DB_PASS"], host=dbLogin["DB_HOST"])
    cursor = dbConn.cursor()
    cursor.execute("select version()")
    data = cursor.fetchone()
    print("DB Connection established to: ", data)
    if shouldHostProbe == True:
        hostProbe = subprocess.Popen(['python', '../Probe/ProbeMain.py', "http://{}:{}".format(serverIP, serverPort)])
        probes.append({ "nickname": "Local Probe", "ip": "localhost", "mac": "dummy" })
    web.run_app(app, host=serverIP, port=serverPort)
    dbConn.close()

# example of arguments
# core_server.py HOST_PROBE?:boolean SERVER_IP?:string SERVER_PORT?:string
if __name__ == '__main__':
    shouldHostProbe = False
    serverIP = 'localhost'
    serverPort = 8080
    if len(sys.argv) > 1:
        if sys.argv[1].lower() == 'true':
            shouldHostProbe = True
    if len(sys.argv) > 2:
        serverIP = str(sys.argv[2])
    if len(sys.argv) > 3:
        serverPort = int(sys.argv[3])
    main(shouldHostProbe, serverIP, serverPort)