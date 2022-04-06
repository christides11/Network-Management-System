from datetime import datetime, timezone
from __main__ import sio
from __main__ import dbConn
from __main__ import helpers

# returns a list of devices that are probes.
@sio.event
async def RequestProbeList(sid):
    cursor = dbConn.cursor()
    cursor.execute("SELECT * FROM public.device WHERE \"parent\" IS NULL")
    record = cursor.fetchall()
    li = []
    for x in range(len(record)):
        li.append({"id": record[x][0], "name": record[x][1], "networkID": record[x][6], "ipAddress": record[x][3]})
    cursor.close()
    await sio.emit('ReceiveProbeList', li, sid)

# returns a list of all devices attached to the given probe.
@sio.event
async def RequestDeviceListFromProbe(sid, probeID):
    result = helpers.fetchAllFromDB("SELECT * FROM public.device WHERE \"parent\" = {}".format(probeID))
    await sio.emit('ReceiveDeviceList', {"devices": result, "probeID": probeID}, sid)

# returns a list of all devices in the database.
@sio.event
async def RequestDeviceList(sid):
    result = helpers.fetchAllFromDB("SELECT * FROM public.device")
    await sio.emit('ReceiveDeviceList', result, sid)

# Returns a device with the given id.
@sio.event
async def RequestDevice(sid, deviceId):
    result = helpers.fetchOneFromDB("SELECT * FROM public.device WHERE id = {}".format(deviceId))
    await sio.emit('ReceiveDevice', result, sid)

# Register the given device to the database for tracking.
@sio.event
async def RegisterDevice(sid, data):
    result = {"result": False, "ip": data["ip"], "reason": "Duplicate entry."}
    try:
        now_utc = datetime.now(timezone.utc)
        d = helpers.fetchOneFromDB("SELECT * FROM public.device WHERE \"ipAddress\" = \'{}\'".format(data["ip"]))
        if d is None:
            print("Registering device {}".format(data["deviceName"]))
            cursor = dbConn.cursor()
            cursor.execute("INSERT INTO public.device VALUES (DEFAULT, \'{}\', \'{}\', \'{}\', {}, {}, {}, {}, {}, 1, \'Device has been setup but not pinged yet by probe.\')".format(data['deviceName'], now_utc, data['ip'], 'NULL', data['parentProbe'], 1, data['snmpCredential'] if data['snmpCredential'] > 0 else 'NULL', data['wmiCredential'] if data['wmiCredential'] > 0 else 'NULL' ))
            cursor.close()
            dbConn.commit()
            result['result'] = True
    except Exception as e:
        result['result'] = False
        result['reason'] = str(e)
        pass
    await sio.emit('RegisterDeviceResult', result, sid)