#from __main__ import sio
from pysnmp.entity.rfc3413.oneliner import cmdgen
from datetime import datetime
import multiprocessing
import subprocess
import os

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
                    cmdgen.UdpTransportTarget((ip, 161)), #timeout=scanParams['snmpTimeout']/1000.0, retries=scanParams['snmpRetries']
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

def getips(start, end):
    import socket, struct
    start = struct.unpack('>I', socket.inet_aton(start))[0]
    end = struct.unpack('>I', socket.inet_aton(end))[0]
    return [socket.inet_ntoa(struct.pack('>I', i)) for i in range(start, end)]

# Finds devices simultaneously using multithreading. Returns the list of IPs found.
def ScannerTask(scanParams, startAddr, endAddr, wmiCreds, snmpCreds):
    start = startAddr.split(".")
    end = endAddr.split(".")
    pool_size = 30
    jobs = multiprocessing.Queue()
    results = multiprocessing.Queue()
    t1 = datetime.now()

    pool = [ multiprocessing.Process(target=isDeviceValid, args=(jobs,scanParams,wmiCreds,snmpCreds,results)) 
            for i in range(pool_size) ]
    
    for s in range(0, len(start)):
        start[s] = int(start[s])
        end[s] = int(end[s])

    for p in pool:
        p.start()

    ips = getips(startAddr, endAddr)
    for x in ips:
        jobs.put(x)

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