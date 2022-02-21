from glob import glob
from aiohttp import web
import socket
import socketio
import scapy.all as scapy
from mac_vendor_lookup import MacLookup
from threading import Thread

if __name__ == '__main__':
    print("Run.")
    #web.run_app(app, host='localhost', port=8080)