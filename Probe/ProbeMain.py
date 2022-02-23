from aiohttp import web
import asyncio
import socketio
import sys
import socket

sio = socketio.AsyncClient()

def Scan(target, port):
    #create new socket
    socketObject = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    socket.setdefaulttimeout(1)
    result = socketObject.connect((target, 76))
    print(" This is the start of the result")
    print(result)
    print(" This is the end of the result")
    socketObject.close()

@sio.event
def connect():
    print("connection established")

@sio.event
async def DiscoverDevicesICMP(listIsIPRanges, searchList):
    print("Discovering devices using ICMP (ping) scan.")

@sio.event
async def DiscoverDevicesTCP(listIsIPRanges, searchList):
    print("Discovering devices using TCP port scan.")

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
    asyncio.run(probeMain(serverIP))
