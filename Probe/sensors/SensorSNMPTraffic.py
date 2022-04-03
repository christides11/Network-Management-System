from sensors.Sensor import Sensor

class SensorSNMPTraffic(Sensor):
    def __init__(self):
        super().__init__()
        self.id = 2