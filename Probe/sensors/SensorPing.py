from sensors.Sensor import Sensor
import asyncio
import multiprocessing
from pysnmp.entity.rfc3413.oneliner import cmdgen

class SensorPing(Sensor):

    def __init__(self):
        super().__init__()
        self.id = 1
        self.results = multiprocessing.Queue()

    def getDeviceData(self, d, results_q):
        try:
            # TODO: Call ping command.
            
            # TODO: If error with data, throw exception

            # TODO: Successful, get channel data
            channelData = {}

            results_q.put( [True, d[0]['device_id'], d[0]['sensor_id'], d[0]['id'], channelData] )
        except Exception as e:
            results_q.put( [False, d[0]['device_id'], d[0]['sensor_id'], d[0]['id'], None] )
            pass

    def runSensor(self, data, onFinishMethod):
        while not self.results.empty():
            deviceResult = self.results.get()
            onFinishMethod( deviceResult[0], deviceResult[1], deviceResult[2], deviceResult[3], deviceResult[4] )
        for d in data:
            tup = (d[0]['device_id'], d[0]['sensor_id'])
            # Sensor task for this device took too long, cancel it and 
            # alert the probe that the task failed & try again.
            if tup in self.jobdata:
                if self.jobdata[tup].is_alive():
                    self.jobdata[tup].terminate()
                    onFinishMethod(False, d[0]['device_id'], d[0]['sensor_id'], d[0]['id'], None)
            self.jobdata[tup] = multiprocessing.Process(target=self.getDeviceData, args=(d, self.results))
            self.jobdata[tup].start()
