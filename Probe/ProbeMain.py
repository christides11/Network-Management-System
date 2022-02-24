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

sio = socketio.AsyncClient()
socket.setdefaulttimeout(0.25)

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

def singleTcpScan(job_q, results_q):
    DEVNULL = open(os.devnull,'w')
    while True:
        ip = job_q.get()
        if ip is None: break

        s = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
        # TRY WINDOWS PORT
        try:
            con = s.connect((ip, 445))
            results_q.put(ip)
            con.close()
        except:
            pass

def pingScanner(startAddr, endAddr, tcpScan):
    start = startAddr.split(".")
    end = endAddr.split(".")
    pool_size = 30
    jobs = multiprocessing.Queue()
    results = multiprocessing.Queue()
    pool = NULL
    t1 = datetime.now()
    
    if tcpScan == False:
        pool = [ multiprocessing.Process(target=singlePing, args=(jobs,results)) 
                for i in range(pool_size) ]
    else:
        pool = [ multiprocessing.Process(target=singleTcpScan, args=(jobs,results)) 
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

    while not results.empty():
        ip = results.get()
        print(ip)
    t2 = datetime.now()
    total = t2 - t1
    print ("Scan completed in: ",total)

@sio.event
def connect():
    print("connection established")

@sio.event
def DiscoverDevicesICMP(listIsIPRanges, searchList):
    print("Discovering devices using ICMP (ping) scan.")
    pingScanner(searchList[0], searchList[1], False)


@sio.event
def DiscoverDevicesTCP(listIsIPRanges, searchList):
    print("Discovering devices using TCP port scan.")
    pingScanner(searchList[0], searchList[1], True)

@sio.event
def disconnect():
    print('disconnected from server.')

async def probeMain(serverIP):
    await sio.connect(serverIP)
    await sio.wait()

if __name__ == '__main__':
    serverIP = 'http://localhost:5000'
    if len(sys.argv) > 1:
        serverIP = str(sys.argv[1])
    DiscoverDevicesICMP(0, ["10.4.1.10", "10.4.1.100"])
    #DiscoverDevicesTCP(0, ["10.4.3.150", "10.4.3.250"])
    #asyncio.run(probeMain(serverIP))
