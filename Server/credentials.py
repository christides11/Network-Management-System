from __main__ import sio
from __main__ import dbConn
from __main__ import helpers

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
async def RegisterSNMPCredentials(sid, data):
    result = {"result": True, "reason": "", "data": data}
    if not data["name"] or not data["community"]:
        result["result"] = False
        result["reason"] = "Invalid name or community."
    else:
        helpers.executeOnDB("INSERT INTO public.\"SNMP_Credentials\" VALUES (DEFAULT, \'{}\', {}, \'{}\')".format(data["name"], data["version"], data["community"]))
    await sio.emit('RegisterSNMPCredentialsResult', result, sid)

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

@sio.event
async def RegisterWMICredentials(sid, data):
    result = {"result": True, "reason": ""}
    if not data["name"] or not data["username"] or not data["password"]:
        result["result"] = False
        result["reason"] = "Invalid name, username, or password."
    else:
        helpers.executeOnDB("INSERT INTO public.\"WMI_Credentials\" VALUES (DEFAULT, \'{}\', \'{}\', \'{}\')".format(data["name"], data["username"], data["password"]))
    await sio.emit('RegisterWMICredentialsResult', result, sid)