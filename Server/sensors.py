from __main__ import sio
from __main__ import dbConn
from __main__ import helpers
from datetime import datetime, timezone
import json

# returns a list of all sensors in the db.
@sio.event
async def RequestSensorList(sid):
    results = helpers.fetchAllFromDB("SELECT * FROM public.sensor")
    await sio.emit('ReceiveSensorList', results, sid)

# returns the sensor with the given id.
@sio.event
async def RequestSensor(sid, sensorID):
    result = helpers.fetchOneFromDB("SELECT * FROM public.sensor WHERE \"id\"={}".format(sensorID))
    await sio.emit('ReceiveSensor', result, sid)

@sio.event
async def RegisterDeviceSensor(sid, data):
    cursor = dbConn.cursor()
    try:
        now_utc = datetime.now(timezone.utc)
        cursor.execute("INSERT INTO public.devicesensor VALUES ({}, {}, {}, \'{}\', ARRAY {}, {}, \'{}\', \'{}\', \'{}\')".format(data['deviceid'], data['sensorid'], 'DEFAULT', data['settings']['name'], ['sensor'], 1, '', json.dumps(data['sensorSettings']), now_utc ))
    except Exception as e:
        print(e)
        pass
    cursor.close()
    dbConn.commit()
    await sio.emit('RegisterDeviceSensorResult', {"result": True}, sid)

@sio.event
async def RequestDeviceSensors(sid, deviceid):
    result = helpers.fetchAllFromDB("SELECT * FROM public.devicesensor WHERE \"device_id\"={}".format(deviceid))
    await sio.emit("ReceiveDeviceSensorList", result, sid)