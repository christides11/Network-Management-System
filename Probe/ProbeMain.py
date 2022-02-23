import nmap
from aiohttp import web
import socketio
import sys

sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)

#testing scannning using nmap code from here: https://www.geeksforgeeks.org/port-scanner-using-python-nmap/  
# assign the target ip to be scanned to
# a variable
target = '127.0.0.1'
   
# instantiate a PortScanner object
scanner = nmap.PortScanner()

#Scan single port
result = scanner.scan(target, str(76))

result = result['scan'][target]['tcp'][76]['state']

print(f'port 76 is {result}.')

@sio.event
def connect(sid, environ):
    print("connect ", sid)

@sio.event
async def DiscoverDevices(sid, probeIP):
    print("Discovering devices...")

@sio.event
def disconnect(sid):
    print('disconnect ', sid)

if __name__ == '__main__':
    probeIP = 'localhost'
    probePort = 8181
    if len(sys.argv) > 1:
        probeIP = str(sys.argv[1])
    if len(sys.argv) > 2:
        probePort = int(sys.argv[2])
    web.run_app(app, host=probeIP, port=probePort)