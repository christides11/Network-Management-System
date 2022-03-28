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
from datetime import datetime
from aiorun import run
from getmac import get_mac_address
import time
from collections import namedtuple

localProbeID = 1
hostProbe = NULL
dbConn = NULL

f = open('env.json')
dbLogin = json.load(f)
f.close()

sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)

probes = {}
currentSessions = []

@sio.event
async def connect(sid, environ):
    print("connect ", sid)

# Probe python script request the server to link it's socket.io connect
# to the probe it's suppose to represent in the database.
@sio.event
async def LinkProbe(sid, probeID):
    if probeID not in probes:
        print("Invalid probe {} trying to link.".format(probeID))
        return
    probes[probeID]['sid'] = sid
    print("SERVER: Linked sid {} to probe {}".format(sid, probeID))


### --- HELPER FUNCTIONS --- ###

def create_record(obj, fields):
    ''' given obj from db returns named tuple with fields mapped to values '''
    result = {}
    for x in range(len(fields)):
        result[str(fields[x])] = obj[x]
    return result

# Execute the given command on the DB and return a list of results. Each result is a dictionary with the keys being
# the name of the given column.
def fetchAllFromDB(action):
    cursor = dbConn.cursor()
    cursor.execute(action)
    record = cursor.fetchall()
    column_names = [desc[0] for desc in cursor.description]
    result = []
    for row in record:
        result.append(create_record(row, column_names))
    cursor.close()
    return result

def fetchOneFromDB(action):
    cursor = dbConn.cursor()
    cursor.execute(action)
    record = cursor.fetchone()
    column_names = [desc[0] for desc in cursor.description]
    cursor.close()
    result = {}
    for row in record:
        result = create_record(row, column_names)
    return result

def lst2pgarr(alist):
    return '{' + ','.join(alist) + '}'

def intlst2pgarr(alist):
    temp = "{"
    for x in range(len(alist)):
        temp += str(alist[x])
        if x < len(alist)-1:
            temp += ","
    temp += "}"
    return temp

### --- LOGIN AND REGISTRATION --- ###

# Client tries to login with the given credentials. 
# If successful, a sessionID is returned.
@sio.event
async def RequestLogin(sid, data):
    print("Trying to login with given credentials. {}".format(data["username"]))
    sessionID = NULL
    record = fetchAllFromDB("SELECT username, password FROM public.user WHERE username = '{}' AND password = '{}'".format(data["username"], data["password"]))
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
    record = fetchAllFromDB("SELECT username, password FROM user WHERE username = '{}'".format(data["username"]))
    if(len(record) > 0):
        await sio.emit('ReceiveRegistrationResult', {'result': False}, sid)
    # TODO: Register user in db.
    await sio.emit('ReceiveRegistrationResult', {'result': True}, sid)

# Verifies if the given sessionID is valid.
def VerifySession(sessionID):
    return True if sessionID in currentSessions else False

### --- DISCOVERY SCANNING --- ###

# Sends a list of all discovery scans currently registered in the database.
@sio.event
async def RequestDiscoveryScanList(sid):
    record = fetchAllFromDB("SELECT * FROM public.\"scanParameters\"")
    await sio.emit('ReceiveDiscoveryScanList', record, sid)

# Add a discovery scan to the database.
@sio.event
async def RegisterDiscoveryScan(sid, data):
    cursor = dbConn.cursor()
    result = False
    try:
        st = 'INSERT INTO public."scanParameters" VALUES (1, {}, \'{}\', {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, ARRAY {}, ARRAY {}, ARRAY {}, ARRAY {}, ARRAY {})'.format(data['network'], data['discoveryName'], data['icmpRespondersOnly'], data['snmpTimeout'], data['scanTimeout'], data['snmpRetries'], data['wmiRetries'], 
            data['hopCount'], data['discoveryTimeout'], data['nextDiscoveryTime'], data['discoveryInterval'], data['probeID'], data['scanType'], data['ipStartRanges'],
            data['ipEndRanges'], data['subnets'], data['snmpCredentials'], data['wmiCredentials'])
        cursor.execute(st)
        dbConn.commit()
        result = True
    except Exception as e:
        print("Error registering scan {}".format(data['discoveryName']))
        print(e)
    finally:
        cursor.close()
        print("Sending result: ", result)
        await sio.emit('Frontend_RegisterDiscoveryScanResult', {'result': result})

# Receive a scan log from a probe then add it to the database.
@sio.event
def ReceiveScanLogFromProbe(sid, data):
    print('SERVER:')
    for x in range(len(data["devicesFound"])):
        print(data["devicesFound"][x])
    # No devices found.
    if len(data["devicesFound"]) == 0:
        return
    cursor = dbConn.cursor()
    cursor.execute('INSERT INTO public.\"Scan_Results\" VALUES ({}, \'{}\', ARRAY {})'.format(data["discoveryID"], str(datetime.now()), data["devicesFound"]))
    dbConn.commit()
    cursor.close()

@sio.event
async def RequestScanLogs(sid):
    record = fetchAllFromDB("SELECT * FROM public.\"Scan_Results\"")
    await sio.emit('ReceiveScanLogs', record)

def current_milli_time():
    return round(time.time() * 1000)

# Goes through every registered discovery job and tries to start ones
# whose time to start has passed and isn't an inactive job.
def TryStartDiscoveryJob():
    print("Trying to start a discovery job.")
    record = fetchAllFromDB( "SELECT * FROM public.\"scanParameters\" WHERE \"nextScanTime\" < {} AND \"nextScanTime\" != 0".format(current_milli_time()) )
    for x in range(len(record)):
        if record[x]["probeID"] not in probes:
            print("Probe", record[x][12], "is not currently awake, or does not exist.")
            continue
        # Get all SNMP credentials.
        snmpCreds = fetchAllFromDB("SELECT * FROM public.\"SNMP_Credentials\" WHERE \"id\" = ANY(\'{}\'::int[])".format(intlst2pgarr(record[x]["snmpCredentials"])))
        # Get all WMI credentials.
        wmiCreds = fetchAllFromDB("SELECT * FROM public.\"WMI_Credentials\" WHERE \"id\" = ANY(\'{}\'::int[])".format(intlst2pgarr(record[x]["wmiCredentials"])))
        # Send command to probe to start the scan with given parameters.
        loop = asyncio.get_event_loop()
        loop.create_task(sio.emit('Probe_RunDiscoverScan', {"params": record[x], "snmpCreds": snmpCreds, "wmiCreds": wmiCreds }, probes[record[x]["probeID"]]['sid']))
        print("Discovery Job", record[x]['name'], "starting...")
        # Update the next scan time for the scan.
        cursor = dbConn.cursor()
        # One off scan.
        if record[x]["timeBetweenScans"] == 0:
            cursor.execute("UPDATE public.\"scanParameters\" SET \"nextScanTime\"=0 WHERE id={}".format(record[x]["id"])) #ignore this value. 1648147018069
            dbConn.commit()
            cursor.close()
            continue
        # Set the next scan time to current next scan time + timebetweenscans.
        cursor.execute("UPDATE public.\"scanParameters\" SET \"nextScanTime\"={} WHERE id={}".format(record[x]["nextScanTime"] + record[x]["timeBetweenScans"], record[x]["id"]))
        dbConn.commit()
        cursor.close()


@sio.event
def disconnect(sid):
    for item in probes.items():
        if item[1]['sid'] == sid:
            probes[item[0]]['sid'] = -1
    print('disconnect ', sid)

### --- CREDENTIALS --- ###

@sio.event
async def RequestSNMPCredentials(sid):
    cursor = dbConn.cursor()
    cursor.execute("SELECT * FROM public.\"SNMP_Credentials\"")
    record = cursor.fetchall()
    await sio.emit('ReceiveSNMPCredentials', record)

@sio.event
async def RequestWMICredentials(sid):
    cursor = dbConn.cursor()
    cursor.execute("SELECT * FROM public.\"WMI_Credentials\"")
    record = cursor.fetchall()
    await sio.emit('ReceiveWMICredentials', record)

### --- DEVICES --- ###

# returns a list of devices that are probes.
@sio.event
async def RequestProbeList(sid):
    cursor = dbConn.cursor()
    cursor.execute("SELECT * FROM public.device WHERE \"parent\" IS NULL")
    record = cursor.fetchall()
    li = []
    for x in range(len(record)):
        li.append({"id": record[x][0], "name": record[x][1], "networkID": record[x][6]})
    cursor.close()
    await sio.emit('ReceiveProbeList', li)

# returns a list of all devices attached to the given probe.
@sio.event
async def RequestDeviceListFromProbe(sid, probeID):
    result = fetchAllFromDB("SELECT * FROM public.device WHERE \"parent\" = {}".format(probeID))
    await sio.emit('ReceiveDeviceList', result)

# returns a list of all devices in the database.
@sio.event
async def RequestDeviceList(sid):
    result = fetchAllFromDB("SELECT * FROM public.device")
    await sio.emit('ReceiveDeviceList', result)


### --- INITIALIZATION --- ###

# Grabs various data from the database.
def Initialize():
    global localProbeID
    cursor = dbConn.cursor()
    # Create default local network.
    cursor.execute("SELECT * FROM public.network")
    record = cursor.fetchall()
    if len(record) == 0:
        cursor.execute("INSERT INTO public.network(name) VALUES ('default network')")
    # Create local probe device.
    cursor.execute("SELECT * FROM public.device WHERE \"macAddress\"=\'{}\'"
        .format(str(get_mac_address(hostname="localhost"))))
    record = cursor.fetchall()
    if len(record) == 0:
        cursor.execute('INSERT INTO public.device("name", "dateAdded", "ipAddress", "macAddress", "networkID") VALUES (\'{}\', \'{}\', \'{}\', \'{}\', 1)'
            .format('local probe', str(datetime.now()), 'localhost', str(get_mac_address(hostname="localhost"))) )    
    dbConn.commit()
    # Get list of probes.
    cursor.execute("SELECT * FROM public.device WHERE \"parent\" IS NULL")
    record = cursor.fetchall()
    for item in record:
        probes[int(item[0])] = { "nickname": item[1], "ip": item[3], "mac": item[4], "network": item[6], "sid": -1 }
        # Find local probe ID.
        if item[4] == str(get_mac_address(hostname="localhost")):
            localProbeID = int(item[0])
    cursor.close()

async def main(shouldHostProbe, serverIP, serverPort):
    global hostProbe, dbConn, localProbeID
    dbConn = psycopg2.connect(dbname=dbLogin["DB_NAME"], user=dbLogin["DB_USER"], password=dbLogin["DB_PASS"], host=dbLogin["DB_HOST"])
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
    while True:
        await asyncio.sleep(5)  # sleep for 1 minute.
        TryStartDiscoveryJob()
    cursor.close()
    await runner.shutdown()

# example of arguments.
# core_server.py HOST_PROBE?:boolean SERVER_IP?:string SERVER_PORT?:string
if __name__ == '__main__':
    shouldHostProbe = False
    serverIP = 'localhost'
    serverPort = 8182
    if len(sys.argv) > 1:
        if sys.argv[1].lower() == 'true':
            shouldHostProbe = True
    if len(sys.argv) > 2:
        serverIP = str(sys.argv[2])
    if len(sys.argv) > 3:
        serverPort = int(sys.argv[3])
    run(main(shouldHostProbe, serverIP, serverPort))
    dbConn.close()