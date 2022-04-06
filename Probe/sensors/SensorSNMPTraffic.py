from sensors.Sensor import Sensor
import asyncio
import multiprocessing

class SensorSNMPTraffic(Sensor):
    def __init__(self):
        super().__init__()
        self.id = 2

    def getDeviceData(self, d, onFinishMethod):
        try:
            print(d)
        except Exception as e:
            print("Caught exception...")
            pass

    def runSensor(self, data, onFinishMethod):
        print("SNMP traffic sensor called.")
        for d in data:
            tup = (d[0]['device_id'], d[0]['sensor_id'])
            # Sensor task for this device took too long, cancel it and 
            # alert the probe that the task failed & try again.
            if tup in self.jobdata:
                print("Last task took too long.")
                self.jobdata[tup].terminate()
            self.jobdata[tup] = multiprocessing.Process(target=self.getDeviceData, args=(d, onFinishMethod))
            self.jobdata[tup].start()
