from asyncio.windows_events import NULL
from pickle import NONE
from aiohttp import web
import socketio
import sys
import psycopg2
import json
import sys

sys.path.append('../Probe/')
import subprocess
import asyncio
from datetime import datetime, timedelta, timezone
from aiorun import run
from getmac import get_mac_address

network = 1
localProbeID = 1
hostProbe = NULL
dbConn = NULL

f = open('env.json')
dbLogin = json.load(f)
f.close()
dbConn = psycopg2.connect(dbname=dbLogin["DB_NAME"], user=dbLogin["DB_USER"], password=dbLogin["DB_PASS"], host=dbLogin["DB_HOST"])

sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)

probes = {}
currentSessions = []

import helpers
from devices import * 
from credentials import *
from sensors import *
from discovery import *

@sio.event
async def connect(sid, environ):
    print("connect ", sid)

# Probe requests the server to link it's socket.io connection
# to the probe it's suppose to represent in the database.
@sio.event
async def LinkProbe(sid, probeID):
    if probeID not in probes:
        print("Invalid probe {} trying to link.".format(probeID))
        return
    probes[probeID]['sid'] = sid
    print("SERVER: Linked sid {} to probe {}".format(sid, probeID))

### --- LOGIN AND REGISTRATION --- ###

# Client tries to login with the given credentials. 
# If successful, a sessionID is returned.
@sio.event
async def RequestLogin(sid, data):
    print("Trying to login with given credentials. {}".format(data["username"]))
    sessionID = NULL
    record = helpers.fetchAllFromDB("SELECT username, password FROM public.user WHERE username = '{}' AND password = '{}'".format(data["username"], data["password"]))
    if len(record) == 1:
        sessionID = data["username"]
        currentSessions.append(sessionID)
    print(sessionID)
    await sio.emit('ReceiveLoginResult', {'sessionID': sessionID}, sid)

# Client tries to register with given credentials.
# If successful, returns true.
@sio.event
async def RequestRegistration(sid, data):
    print("Trying to register user.")
    record = helpers.fetchAllFromDB("SELECT username, password FROM user WHERE username = '{}'".format(data["username"]))
    if(len(record) > 0):
        await sio.emit('ReceiveRegistrationResult', {'result': False}, sid)
    # TODO: Register user in db.
    await sio.emit('ReceiveRegistrationResult', {'result': True}, sid)

# Verifies if the given sessionID is valid.
def VerifySession(sessionID):
    return True if sessionID in currentSessions else False

### --- DISCOVERY SCANNING --- ###

# Goes through every registered discovery job and tries to start ones
# whose time to start has passed and isn't an inactive job.
def TryStartDiscoveryJob():
    record = []
    now_utc = datetime.now(timezone.utc)
    record += helpers.fetchAllFromDB("SELECT * FROM public.\"scanParameters\" WHERE \"scanfrequencytype\" = 0 AND \"nextscantime\" != NULL AND \"networkID\"={}".format(network))
    record += helpers.fetchAllFromDB("SELECT * FROM public.\"scanParameters\" WHERE \"scanfrequencytype\" != 0 AND \"nextscantime\" <= \'{}\' AND \"networkID\"={}".format(now_utc, network))
    for x in range(len(record)):
        if record[x]["probeID"] not in probes:
            print("Probe", record[x][12], "is not currently awake, or does not exist.")
            continue
        # Get all SNMP credentials.
        snmpCreds = helpers.fetchAllFromDB("SELECT * FROM public.\"SNMP_Credentials\" WHERE \"id\" = ANY(\'{}\'::int[])".format(helpers.intlst2pgarr(record[x]["snmpCredentials"])))
        # Get all WMI credentials.
        wmiCreds = helpers.fetchAllFromDB("SELECT * FROM public.\"WMI_Credentials\" WHERE \"id\" = ANY(\'{}\'::int[])".format(helpers.intlst2pgarr(record[x]["wmiCredentials"])))
        # Send command to probe to start the scan with given parameters.
        loop = asyncio.get_event_loop()
        loop.create_task(sio.emit('Probe_RunDiscoverScan', {"params": record[x], "snmpCreds": snmpCreds, "wmiCreds": wmiCreds }, probes[record[x]["probeID"]]['sid']))
        # Update the next scan time for the scan.
        cursor = dbConn.cursor()
        if record[x]["scanfrequencytype"] == 0: # One off scan.
            cursor.execute("UPDATE public.\"scanParameters\" SET \"nextscantime\"=NULL WHERE id={}".format(record[x]["id"]))
        elif record[x]['scanfrequencytype'] == 1: # Hourly
            temp = datetime.fromisoformat(record[x]['nextscantime']) + timedelta(hours=1)
            cursor.execute("UPDATE public.\"scanParameters\" SET \"nextscantime\"=\'{}\' WHERE id={}".format(temp, record[x]["id"]))
        elif record[x]['scanfrequencytype'] == 2: # Daily
            temp = datetime.fromisoformat(record[x]['nextscantime']) + timedelta(days=1)
            cursor.execute("UPDATE public.\"scanParameters\" SET \"nextscantime\"=\'{}\' WHERE id={}".format(temp, record[x]["id"]))
        dbConn.commit()
        cursor.close()

@sio.event
def disconnect(sid):
    for item in probes.items():
        if item[1]['sid'] == sid:
            probes[item[0]]['sid'] = -1
    print('disconnect ', sid)

### --- NETWORK --- ###

# Returns the network with the given id.
@sio.event
async def RequestNetwork(sid, networkId):
    result = helpers.fetchOneFromDB("SELECT * FROM public.network WHERE id = {}".format(networkId))
    await sio.emit('ReceiveNetwork', result, sid)

### --- DEVICE STATUS --- ###

# After a set amount of time, ask every probe to ping all the devices attached to them to check their status.
async def DeviceStatusJob():
    while True:
        for item in probes.keys():
            record = helpers.fetchAllFromDB("SELECT \"ipAddress\" FROM public.device WHERE \"parent\"={} AND \"networkID\"={}".format(item, network))
            for r in record:
                loop = asyncio.get_event_loop()
                loop.create_task(sio.emit('Probe_TryPingDevice', {"ip": r['ipAddress']}, probes[item]["sid"]))
        await asyncio.sleep(300)

# Probe reports the status of a single device.
# TODO: Should have a probe collect the status of multiple devices and return them all at once instead.
@sio.event
async def ReportDevicePingResult(sid, data):
    record = helpers.fetchOneFromDB("SELECT \"id\", \"status\" FROM public.device WHERE \"ipAddress\"=\'{}\' AND \"networkID\"={}".format(data["ip"], network))
    if record is NONE:
        return
    if data["result"] == True:
        cursor = dbConn.cursor()
        cursor.execute("UPDATE public.device SET \"status\"=2, \"statusmessage\"=\'Device is up.\' WHERE \"id\"={}".format(record["id"]))
        dbConn.commit()
        cursor.close()
    else:
        cursor = dbConn.cursor()
        if record["status"] != 4:
            cursor.execute("UPDATE public.device SET \"status\"=3, \"statusmessage\"=\'Device seems to be down.\' WHERE \"id\"={}".format(record["id"]))
        else:
            cursor.execute("UPDATE public.device SET \"status\"=4, \"statusmessage\"=\'Device seems to be down.\' WHERE \"id\"={}".format(record["id"]))
        dbConn.commit()
        cursor.close()


### --- INITIALIZATION --- ###

# Grabs various data from the database.
def Initialize():
    global localProbeID, network
    cursor = dbConn.cursor()
    # Create default local network.
    cursor.execute("SELECT * FROM public.network WHERE \"id\"={}".format(network))
    record = cursor.fetchall()
    if len(record) == 0:
        cursor.execute("INSERT INTO public.network(name) VALUES ('default network')")
    # Create local probe device.
    cursor.execute("SELECT * FROM public.device WHERE \"macAddress\"=\'{}\' AND \"networkID\"={}"
        .format(str(get_mac_address(hostname="localhost")), network))
    record = cursor.fetchall()
    if len(record) == 0:
        cursor.execute('INSERT INTO public.device("name", "dateAdded", "ipAddress", "macAddress", "networkID", "status") VALUES (\'{}\', \'{}\', \'{}\', \'{}\', {}, 2)'
            .format('local probe', datetime.now().strftime("%m/%d/%Y, %H:%M:%S"), 'localhost', str(get_mac_address(hostname="localhost")), network) )    
    dbConn.commit()
    # Get list of probes.
    cursor.execute("SELECT * FROM public.device WHERE \"parent\" IS NULL AND \"networkID\"={}".format(network))
    record = cursor.fetchall()
    for item in record:
        probes[int(item[0])] = { "nickname": item[1], "ip": item[3], "mac": item[4], "network": item[6], "sid": -1 }
        # Find local probe ID.
        if item[4] == str(get_mac_address(hostname="localhost")):
            localProbeID = int(item[0])
    cursor.close()

async def main(shouldHostProbe, serverIP, serverPort):
    global hostProbe, dbConn, localProbeID
    cursor = dbConn.cursor()
    cursor.execute("select version()")
    data = cursor.fetchone()
    print("DB Connection established to: ", data)
    Initialize()
    if shouldHostProbe == True:
        hostProbe = subprocess.Popen(['python', '../Probe/ProbeMain.py', "http://{}:{}".format(serverIP, serverPort), str(localProbeID)])
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, serverIP, serverPort)
    await site.start()
    loop = asyncio.get_event_loop()
    loop.create_task(DeviceStatusJob())
    while True:
        await asyncio.sleep(5)  # sleep for 1 minute.
        TryStartDiscoveryJob()
    cursor.close()
    await runner.shutdown()

# example of arguments.
# core_server.py HOST_PROBE?:boolean NETWORK?:int SERVER_IP?:string SERVER_PORT?:string
if __name__ == '__main__':
    shouldHostProbe = False
    serverIP = 'localhost'
    serverPort = 8182
    if len(sys.argv) > 1:
        if sys.argv[1].lower() == 'true':
            shouldHostProbe = True
    if len(sys.argv) > 2:
        network = int(sys.argv[2])
    if len(sys.argv) > 3:
        serverIP = str(sys.argv[3])
    if len(sys.argv) > 4:
        serverPort = int(sys.argv[4])
    run(main(shouldHostProbe, serverIP, serverPort))
    dbConn.close()