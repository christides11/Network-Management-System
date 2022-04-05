class Sensor:
    def __init__(self):
        self.id = 0
        pass
    
    def getid(self):
        return self.id
    
    def runSensor(self, data, onFinishMethod):
        print(data)
        onFinishMethod("hehe")
