from sensors.Sensor import Sensor

class SensorSNMPTraffic(Sensor):
    def __init__(self):
        super().__init__()
        self.id = 2

    def runSensor(self, data, onFinishMethod):
        print("SNMP traffic sensor called.")
        print(data)
