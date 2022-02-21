from glob import glob
from aiohttp import web
import socket
import socketio
import scapy.all as scapy
from mac_vendor_lookup import MacLookup
from threading import Thread

mac = MacLookup()
currentlyScanning = False

sio = socketio.AsyncServer(cors_allowed_origins='*')
app = web.Application()
sio.attach(app)

def getHostName(result, index):
    global mac
    try:
        result[index]["hostname"] = socket.gethostbyaddr(result[index]["ip"])[0]
    except:
        pass
    try:
        result[index]["vendor"] = mac.lookup(result[index]["mac"])
    except:
        pass

@sio.event
def connect(sid, environ):
    print("connect ", sid)

@sio.event
async def scan_network(sid):
    global currentlyScanning, mac
    if(currentlyScanning == True):
        print("Scan already in progress.")
        return
    currentlyScanning = True
    print("Starting network scan...")
    arp_req_frame = scapy.ARP(pdst = '10.4.3.1/24')
    broadcast_ether_frame = scapy.Ether(dst = "ff:ff:ff:ff:ff:ff")
    broadcast_ether_arp_req_frame = broadcast_ether_frame / arp_req_frame
    answered_list = scapy.srp(broadcast_ether_arp_req_frame, timeout = 1, verbose = False)[0]
    result = []
    for i in range(0,len(answered_list)):
        client_dict = {"ip" : answered_list[i][1].psrc, "mac" : answered_list[i][1].hwsrc, "hostname": "N/A", "vendor": "N/A"}
        result.append(client_dict)
    print("Looking up Vendors & Host Names...")
    threads = []
    for g in range(0, len(result)):
        worker = Thread(target = getHostName, args=(result, g))
        worker.start()
        threads.append(worker)
    for x in threads:
        x.join()
    currentlyScanning = False
    print("Scan finished.")
    await sio.emit('scan_results', {'data': result}, room=sid)

@sio.event
def register_device(sid, hid):
    print("Registering {hid} as device.")

def display_result(result):
    print("-----------------------------------\nIP Address\tMAC Address\tHost Name\tVendor\n-----------------------------------")
    for i in result:
        print("{}\t{}\t{}\t{}".format(i["ip"], i["mac"], i["hostname"], i["vendor"]))

@sio.event
def disconnect(sid):
    print('disconnect ', sid)

if __name__ == '__main__':
    web.run_app(app, host='localhost', port=8080)