import nmap

#testing scannning using nmap code from here: https://www.geeksforgeeks.org/port-scanner-using-python-nmap/  
# assign the target ip to be scanned to
# a variable
target = '127.0.0.1'
   
# instantiate a PortScanner object
scanner = nmap.PortScanner()

#Scan single port
result = scanner.scan(target, str(76))

result = result['scan'][target]['tcp'][76]['state']

print(f'port 76 is {result}.')