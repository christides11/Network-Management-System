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

sio = socketio.AsyncClient()
socket.setdefaulttimeout(0.25)

probeID = 9

def singlePing(job_q, results_q):
    DEVNULL = open(os.devnull,'w')
    while True:
        ip = job_q.get()
        if ip is None: break

        try:
            subprocess.check_call(['ping','-n','1','-w','250',ip],
                                    stdout=DEVNULL)
            results_q.put(ip)
        except:
            pass

def pingScanner(startAddr, endAddr):
    start = startAddr.split(".")
    end = endAddr.split(".")
    pool_size = 30
    jobs = multiprocessing.Queue()
    results = multiprocessing.Queue()
    pool = NULL
    t1 = datetime.now()

    pool = [ multiprocessing.Process(target=singlePing, args=(jobs,results)) 
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
    #match data['scanType']:
    #    case 0:
    #        print("SCAN TYPE: Address Ranges")
    #        result = pingScanner(data["addressRanges"][0][0], data["addressRanges"][0][1])
    #        await sio.emit('ReceiveScanLogFromProbe', {'discoveryName': data['discoveryName'], "resultList": result})
    #    case 1:
    #        print("SCAN TYPE: Subnets")

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