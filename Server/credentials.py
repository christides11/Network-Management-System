from __main__ import sio
from __main__ import dbConn
from __main__ import helpers

### --- CREDENTIALS --- ###

@sio.event
async def RequestSNMPCredentials(sid):
    cursor = dbConn.cursor()
    cursor.execute("SELECT * FROM public.\"SNMP_Credentials\"")
    record = cursor.fetchall()
    cursor.close()
    await sio.emit('ReceiveSNMPCredentials', record, sid)

@sio.event
async def RequestSNMPCredential(sid, credentialId):
    cursor = dbConn.cursor()
    cursor.execute("SELECT * FROM public.\"SNMP_Credentials\" WHERE \"id\"={}".format(credentialId))
    record = cursor.fetchone()
    cursor.close()
    await sio.emit('ReceiveSNMPCredential', record, sid)

@sio.event
async def RequestWMICredentials(sid):
    cursor = dbConn.cursor()
    cursor.execute("SELECT * FROM public.\"WMI_Credentials\"")
    record = cursor.fetchall()
    await sio.emit('ReceiveWMICredentials', record, sid)

@sio.event
async def RequestWMICredential(sid, credentialId):
    cursor = dbConn.cursor()
    cursor.execute("SELECT * FROM public.\"WMI_Credentials\" WHERE \"id\"={}".format(credentialId))
    record = cursor.fetchone()
    cursor.close()
    await sio.emit('ReceiveWMICredential', record, sid)