from sensors.Sensor import Sensor
import asyncio
import multiprocessing
from pysnmp.entity.rfc3413.oneliner import cmdgen

class SensorSNMPTraffic(Sensor):

    def __init__(self):
        super().__init__()
        self.id = 2
        self.trafficInSysname = '1.3.6.1.2.1.31.1.1.1.6'
        self.trafficOutSysname = '1.3.6.1.2.1.31.1.1.1.10'
        self.results = multiprocessing.Queue()

    def getDeviceData(self, d, results_q):
        try:
            interfaceStr = "." + str(d[0]['settings']['interface'])
            oids = (self.trafficInSysname + interfaceStr , self.trafficOutSysname + interfaceStr)
            auth = cmdgen.CommunityData(d[1]["communityString"])
            cmdGen = cmdgen.CommandGenerator()
            errorIndication, errorStatus, errorIndex, varBinds = cmdGen.getCmd(
                    auth,
                    cmdgen.UdpTransportTarget((d[0]['ipAddress'], 161)),
                    *[cmdgen.MibVariable(oid) for oid in oids],
                    lookupMib=False,
                )
            if errorIndication:
                raise
            channelData = {}
            channelData[0] = int(varBinds[0][1].prettyPrint()) # Traffic In
            channelData[1] = int(varBinds[1][1].prettyPrint()) # Traffic Out
            channelData[-1] = channelData[0] + channelData[1]  # Traffic Total 
            results_q.put( [True, d[0]['device_id'], d[0]['sensor_id'], d[0]['id'], channelData] )
        except Exception as e:
            results_q.put( [False, d[0]['device_id'], d[0]['sensor_id'], d[0]['id'], None] )
            pass

    def runSensor(self, data, onFinishMethod):
        while not self.results.empty():
            deviceResult = self.results.get()
            onFinishMethod( deviceResult[0], deviceResult[1], deviceResult[2], deviceResult[3], deviceResult[4] )
        # TODO cancel any jobs that are still running & Report that they failed.
        for d in data:
            tup = (d[0]['device_id'], d[0]['sensor_id'])
            # Sensor task for this device took too long, cancel it and 
            # alert the probe that the task failed & try again.
            if tup in self.jobdata:
                if self.jobdata[tup].is_alive():
                    print("Last task took too long.")
                    self.jobdata[tup].terminate()
                    onFinishMethod(False, d[0]['device_id'], d[0]['sensor_id'], d[0]['id'], None)
                else:
                    print("process already ended.")
            self.jobdata[tup] = multiprocessing.Process(target=self.getDeviceData, args=(d, self.results))
            self.jobdata[tup].start()
