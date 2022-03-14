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
import asyncio

hostProbe = NULL
sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)

f = open('env.json')
dbLogin = json.load(f)
f.close()
probes = {}
dbConn = NULL

# TEMPORARY DATA.
# These shouild be in the database idealy
registeredScans = []
scanResults = []

@sio.event
async def connect(sid, environ):
    print("connect ", sid)

# Connects the probe SID to the probe it's suppose to represent.
@sio.event
async def LinkProbe(sid, probeID):
    if probeID not in probes:
        print("Invalid probe {} trying to link.".format(probeID))
        return
    probes[probeID]['sid'] = sid
    print("SERVER: Linked sid {} to probe {}".format(sid, probeID))

# Register a discovery scan to the list of scans.
@sio.event
async def RegisterDiscoveryScan(sid, data):
    print("Registering scan {} for probe {}.".format(data['discoveryName'], data['probeID']))
    registeredScans.append(data)
    await sio.emit('Frontend_RegisterDiscoveryScanResult', {'result': True})

@sio.event
async def RequestRegisteredDiscoveryScans(sid):
    await sio.emit('ReceiveRegisteredDiscoveryScans', registeredScans, sid)

#@sio.event
#def ReceiveScanResults(sid, data):
#    print('SERVER:')
#    for x in range(len(data["resultList"])):
#        print(data["resultList"][x])

#@sio.event
#async def TryRegisterProbe(sid, probeName, probeIP):
#    print("Trying to register probe {}.".format(probeIP))
#    probes.append({nickname: probeName, ip: probeIP, hid: "dummy"})

#@sio.event
#async def TryRemoveProbeByIP(sid, probeIP):
#    print("Trying to remove probe {}.".format(probbeIP))

#@sio.event
#async def TryRemoveProbeByName(sid, probeName):
#    print("Trying to remove probe {}.".format(probeName))

#@sio.event
#async def testCall(sid):
#    await sio.emit('DiscoverDevicesICMP', {'listIsIPRanges': True, 'searchList': ['10.4.1.10', '10.4.1.100'] })

def TryStartDiscoveryJob():
    print("Trying to start a discovery job.")
    #for item in registeredScans:
        #print(item)

@sio.event
def disconnect(sid):
    for item in probes.items():
        if item[1]['sid'] == sid:
            probes[item[0]]['sid'] = -1
    print('disconnect ', sid)

async def main(shouldHostProbe, serverIP, serverPort):
    global hostProbe
    dbConn = psycopg2.connect(dbname=dbLogin["DB_NAME"], user=dbLogin["DB_USER"], password=dbLogin["DB_PASS"], host=dbLogin["DB_HOST"])
    cursor = dbConn.cursor()
    cursor.execute("select version()")
    data = cursor.fetchone()
    print("DB Connection established to: ", data)
    if shouldHostProbe == True:
        localProbeID = "12345"
        hostProbe = subprocess.Popen(['python', '../Probe/ProbeMain.py', "http://{}:{}".format(serverIP, serverPort), localProbeID])
        probes[localProbeID] = { "nickname": "Local Probe", "ip": "localhost", "mac": "dummy", "sid": -1 }
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, serverIP, serverPort)
    await site.start()
    while True:
        await asyncio.sleep(60)  # sleep for 1 minute.
        TryStartDiscoveryJob()
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
    asyncio.run(main(shouldHostProbe, serverIP, serverPort))