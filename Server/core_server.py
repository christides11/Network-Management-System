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

sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)

f = open('env.json')
dbLogin = json.load(f)
f.close()
probes = []

@sio.event
def connect(sid, environ):
    print("connect ", sid)

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
def disconnect(sid):
    print('disconnect ', sid)

if __name__ == '__main__':
    serverIP = 'localhost'
    serverPort = 8080
    if len(sys.argv) > 1:
        serverIP = str(sys.argv[1])
    if len(sys.argv) > 2:
        serverPort = int(sys.argv[2])
    conn = psycopg2.connect(dbname=dbLogin["DB_NAME"], user=dbLogin["DB_USER"], password=dbLogin["DB_PASS"], host=dbLogin["DB_HOST"])
    conn.close()
    web.run_app(app, host=serverIP, port=serverPort)