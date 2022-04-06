class Sensor:
    jobdata = {}

    def __init__(self):
        self.id = 0
        pass
    
    def getid(self):
        return self.id
    
    def runSensor(self, data, onFinishMethod):
        print("base sensor run being called.")
