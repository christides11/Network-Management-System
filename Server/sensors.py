from __main__ import sio
from __main__ import dbConn
from __main__ import helpers

### --- SENSORS --- ###

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