import unittest
import json

from app import app

class MyTest(unittest.TestCase):

    def test_hello(self):
        tester = app.test_client(self)
        response = tester.get('/')
        self.assertTrue(b"Hey!" in response.data) # b to convert to bytes
    
    def test_hello_2(self):
        tester = app.test_client(self)
        response = tester.get('/user/')

       
        expected_result = json.dumps({"name":"Bob"}).replace(" ", "")
        expected_result_2 = convertResultToBeTested({"name": "Bob"})

        self.assertEqual(response.status_code, 200)
        self.assertTrue(b'{"name":"Bob"}' in response.data, msg="{0} == {1}".format(response.data, "second arg")) # b to convert to bytes
        self.assertTrue(str.encode(expected_result) in response.data, msg="{0} == {1}".format(response.data, expected_result)) # b to convert to bytes
        self.assertTrue(expected_result_2 in response.data, msg="{0} == {1}".format(response.data, expected_result_2)) # b to convert to bytes


def convertResultToBeTested(expected_result):
    # json dumps to turn to a string 
    # we cant have any spaces!
    # encode data into bytes
    return str.encode(json.dumps(expected_result).replace(" ", ""))

if __name__ == '__main__':
    unittest.main()