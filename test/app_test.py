import unittest
from app import app

class MyTest(unittest.TestCase):

    def test_hello(self):
        tester = app.test_client(self)
        response = tester.get('/')
        self.assertTrue(b"Hey!" in response.data) # b to convert to bytes

if __name__ == '__main__':
    unittest.main()