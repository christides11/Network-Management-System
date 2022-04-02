from asyncio.windows_events import NULL
import socketio
import sys
import socket
import multiprocessing
import subprocess
import os
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

#SNMP command used for checking if a device can be queried.
SYSNAME = '1.3.6.1.2.1.1.5.0'

# Use a few commands to check if a device is valid to be added to the given scan.
def isDeviceValid(job_q, scanParams, wmiCreds, snmpCreds, results_q):
    DEVNULL = open(os.devnull,'w')
    while True:
        ip = job_q.get()
        if ip is None: break

        try:
            r = {"deviceName": str(ip), "ip": ip}
            # Ping device.
            subprocess.check_call(['ping','-n','1','-w','250',ip],
                                    stdout=DEVNULL)
            # Try to get sysname via snmp.
            snmpCredID = 0
            for snmpCred in snmpCreds:
                auth = cmdgen.CommunityData(snmpCred["communityString"])
                cmdGen = cmdgen.CommandGenerator()
                errorIndication, errorStatus, errorIndex, varBinds = cmdGen.getCmd(
                    auth,
                    cmdgen.UdpTransportTarget((ip, 161)),
                    cmdgen.MibVariable(SYSNAME),
                    lookupMib=False,
                )
                if errorIndication:
                    continue
                for oid, val in varBinds:
                    r["deviceName"] = str(val.prettyPrint())
                snmpCredID = snmpCred["id"]
                break
            # TODO: Wmi credential query
            wmiCredID = 0
            # No credentials worked & we want to ignore those that only respond to pings.
            if snmpCredID == 0 and wmiCredID == 0 and scanParams['allowICMPResponders'] == False:
                raise Exception("creds failed")
            r['snmpCredID'] = snmpCredID 
            r['wmiCredID'] = wmiCredID
            results_q.put(r)
        except:
            # One of the checks failed.
            pass

# Finds devices simultaneously using multithreading. Returns the list of IPs found.
def ScannerTask(scanParams, startAddr, endAddr, wmiCreds, snmpCreds):
    start = startAddr.split(".")
    end = endAddr.split(".")
    pool_size = 30
    jobs = multiprocessing.Queue()
    results = multiprocessing.Queue()
    pool = NULL
    t1 = datetime.now()

    pool = [ multiprocessing.Process(target=isDeviceValid, args=(jobs,scanParams,wmiCreds,snmpCreds,results)) 
            for i in range(pool_size) ]
    
    for s in range(0, len(start)):
        start[s] = int(start[s])
        end[s] = int(end[s])

    for p in pool:
        p.start()

    for x in range(start[0], end[0]+1 if end[0]>=start[0] else 255):
        for y in range(start[1], end[1]+1 if end[1] >= start[1] else 255):
            for z in range(start[2], end[2]+1 if end[2] >= start[2] else 255):
                for w in range(start[3], end[3]+1 if end[3] >= start[3] else 255):
                    jobs.put('{}.{}.{}.{}'.format(x, y, z, w))
    
    for p in pool:
        jobs.put(None)

    for p in pool:
        p.join()

    finalResults = []
    while not results.empty():
        deviceResult = results.get()
        finalResults.append(deviceResult)
    t2 = datetime.now()
    total = t2 - t1
    print ("Scan completed in: ", total)
    return finalResults

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
                result += ScannerTask(data, data['params']["ipStartRange"][x], data['params']["ipEndRange"][x], data['wmiCreds'], data['snmpCreds'])
        case 1:
            #TODO
            print("SCAN TYPE: Subnets")
    await sio.emit('ReceiveScanLogFromProbe', {'discoveryID': data['params']['id'], 'devicesFound': result})

# Probe tries to ping a given IP address, returning information on the device if successful.
@sio.event
async def Probe_TryPingDevice(data):
    print('...')

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