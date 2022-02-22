from glob import glob
from aiohttp import web
import socket
import socketio
import scapy.all as scapy
from mac_vendor_lookup import MacLookup
from threading import Thread

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
    print("Run.")
    #web.run_app(app, host='localhost', port=8080)