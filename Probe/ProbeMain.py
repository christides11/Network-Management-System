from asyncio.windows_events import NULL
from re import search
from aiohttp import web
import asyncio
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
import wmi_client_wrapper as wmi

sio = socketio.AsyncClient()
socket.setdefaulttimeout(0.25)

probeID = 9

SYSNAME = '1.3.6.1.2.1.1.5.0'

# Use a few commands to check if a device is valid to be added to the given scan.
def isDeviceValid(job_q, scanParams, wmiCreds, snmpCreds, results_q):
    DEVNULL = open(os.devnull,'w')
    while True:
        ip = job_q.get()
        if ip is None: break

        try:
            # Ping device.
            subprocess.check_call(['ping','-n','1','-w','250',ip],
                                    stdout=DEVNULL)
            # Try to get sysname via snmp.
            snmpCredID = -1
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
                snmpCredID = snmpCred["id"]
                break
            # TODO: Wmi credential query
            wmICredID = -1
            # No credentials worked & we want to ignore those that only respond to pings.
            if snmpCredID == -1 and wmICredID == -1 and scanParams['allowICMPResponders'] == False:
                raise Exception("creds failed")
            results_q.put(str(ip))
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

    for x in range(start[0], end[0]+1):
        for y in range(start[1], end[1]+1):
            for z in range(start[2], end[2]+1):
                for w in range(start[3], end[3]+1):
                    jobs.put('{}.{}.{}.{}'.format(x, y, z, w))
    
    for p in pool:
        jobs.put(None)

    for p in pool:
        p.join()

    finalResults = []
    while not results.empty():
        ip = results.get()
        finalResults.append(str(ip))
    t2 = datetime.now()
    total = t2 - t1
    print ("Scan completed in: ",total)
    return finalResults

@sio.event
async def connect():
    print("CLIENT: {}: connection established. Trying link.".format(probeID))
    await sio.emit('LinkProbe', probeID)

@sio.event
async def Probe_RunDiscoverScan(data):
    print('Probe received discovery job, starting...')
    print(data["wmiCreds"])
    print(data["snmpCreds"])
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