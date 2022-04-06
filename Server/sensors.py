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

@sio.event
async def InsertDeviceSensorData(sid, data):
    now_utc = datetime.now(timezone.utc)
    for channelid in data['channeldata'].keys():
        helpers.executeOnDB("INSERT INTO public.devicesensorchanneldata VALUES ({}, {}, {}, {}, \'{}\', ARRAY {})".format(data['deviceid'], data['sensorid'], data['devicesensorid'], channelid, now_utc, [data['channeldata'][channelid]] ))

@sio.event
async def ReportDeviceSensorStatus(sid, data):
    record = helpers.fetchOneFromDB("SELECT \"status\" FROM public.devicesensor WHERE \"device_id\"={} AND \"sensor_id\"={} AND \"id\"={}".format( data['deviceid'], data['sensorid'], data['devicesensorid'] ))
    if data['up'] == False:
        if record['status'] != 4 and record['status'] != 3:
            helpers.executeOnDB("UPDATE public.devicesensor SET \"status\"=3, \"statusmessage\"=\'Sensor seems to be down.\' WHERE \"device_id\"={} AND \"sensor_id\"={} AND \"id\"={}".format( data['deviceid'], data['sensorid'], data['devicesensorid'] ))
        else:
            helpers.executeOnDB("UPDATE public.devicesensor SET \"status\"=4, \"statusmessage\"=\'Sensor is down.\' WHERE \"device_id\"={} AND \"sensor_id\"={} AND \"id\"={}".format( data['deviceid'], data['sensorid'], data['devicesensorid'] ))
    else:
        helpers.executeOnDB("UPDATE public.devicesensor SET \"status\"=2, \"statusmessage\"=\'Sensor is up.\' WHERE \"device_id\"={} AND \"sensor_id\"={} AND \"id\"={}".format( data['deviceid'], data['sensorid'], data['devicesensorid'] ))