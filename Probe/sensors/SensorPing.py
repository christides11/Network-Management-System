from sensors.Sensor import Sensor
import asyncio
import multiprocessing
import subprocess
from pysnmp.entity.rfc3413.oneliner import cmdgen
import json
import pingparsing

class SensorPing(Sensor):

    def __init__(self):
        super().__init__()
        self.id = 1
        self.results = multiprocessing.Queue()

    def getDeviceData(self, d, results_q):
        try:
            ping_parser = pingparsing.PingParsing()
            transmitter = pingparsing.PingTransmitter()
            transmitter.destination = d[0]['ipAddress']
            transmitter.packet_size = d[0]['settings']['packetsize']
            pingTime = d[0]['settings']['timeout']
            if pingTime != 0: transmitter.timeout = str(pingTime) + "sec"

            channelData = {}
            # Single Ping
            if d[0]['settings']['method'] == 0:
                transmitter.count = 1
                result = transmitter.ping()
                rJson = ping_parser.parse(result).as_dict()
                channelData[0] = rJson['rtt_avg'] # Ping Time
                channelData[1] = rJson['rtt_min'] # Min
                channelData[2] = rJson['rtt_max'] # Max
                channelData[3] = int(rJson['packet_loss_rate']) # Packet Loss
            else: # Multi ping
                transmitter.count = d[0]['settings']['pingcount']
                result = transmitter.ping()
                rJson = ping_parser.parse(result).as_dict()
                channelData[0] = rJson['rtt_avg'] # Ping Time
                channelData[1] = rJson['rtt_min'] # Min
                channelData[2] = rJson['rtt_max'] # Max
                channelData[3] = int(rJson['packet_loss_rate']) # Packet Loss
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
