from __main__ import sio
from __main__ import dbConn
from __main__ import helpers
from datetime import datetime, timezone
import json

# Sends a list of all discovery scans currently registered in the database.
@sio.event
async def RequestDiscoveryScanList(sid):
    record = helpers.fetchAllFromDB("SELECT * FROM public.\"scanParameters\"")
    await sio.emit('ReceiveDiscoveryScanList', record, sid)

# Add a discovery scan to the database.
@sio.event
async def RegisterDiscoveryScan(sid, data):
    cursor = dbConn.cursor()
    result = False
    resultReason = ""
    try:
        if not data['discoveryName'] or not data['ipStartRanges'] or not data['ipEndRanges']:
            raise Exception("Empty input is not valid.")
        dt = datetime.fromtimestamp(data['nextscantime'] / 1000.0, tz = timezone.utc)
        st = 'INSERT INTO public."scanParameters" VALUES (DEFAULT, {}, \'{}\', {}, {}, {}, {}, {}, {}, {}, {}, \'{}\', {}, {}, ARRAY {}, ARRAY {}, ARRAY {}, ARRAY {}, ARRAY {})'.format(data['network'], data['discoveryName'], data['icmpRespondersOnly'], data['snmpTimeout'], data['scanTimeout'], data['snmpRetries'], data['wmiRetries'], 
            data['hopCount'], data['discoveryTimeout'], data['scanfrequencytype'], dt, data['probeID'], data['scanType'], data['ipStartRanges'],
            data['ipEndRanges'], data['subnets'], data['snmpCredentials'], data['wmiCredentials'])
        cursor.execute(st)
        dbConn.commit()
        result = True
    except Exception as e:
        resultReason = str(e)
        #print("Error registering scan {}".format(data['discoveryName']))
        #print(e)
    finally:
        cursor.close()
        print("Sending result: ", result)
        await sio.emit('Frontend_RegisterDiscoveryScanResult', {'result': result, 'reason': resultReason}, sid)

# Receive a scan log from a probe then add it to the database.
@sio.event
def ReceiveScanLogFromProbe(sid, data):
    print('SERVER:')
    print(data)
    if len(data["devicesFound"]) == 0:
        #TODO: find way to insert empty array.
        print("NO DEVICES FOUND!")
        return
    cursor = dbConn.cursor()
    cursor.execute('INSERT INTO public.\"Scan_Results\" VALUES ({}, DEFAULT, \'{}\', \'{}\')'.format(data["discoveryID"], datetime.now().strftime("%m/%d/%Y, %H:%M:%S"), json.dumps(data["devicesFound"]) ))
    dbConn.commit()
    cursor.close()

@sio.event
async def RequestScanLogs(sid):
    record = helpers.fetchAllFromDB("SELECT * FROM public.\"Scan_Results\"")
    await sio.emit('ReceiveScanLogs', record, sid)