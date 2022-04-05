from datetime import datetime
import time
from __main__ import dbConn

def create_record(obj, fields):
    ''' given obj from db returns named tuple with fields mapped to values '''
    result = {}
    for x in range(len(fields)):
        resultObj = obj[x]
        if isinstance(obj[x], datetime):
            resultObj = obj[x].__str__()
        result[str(fields[x])] = resultObj
    return result

# Execute the given command on the DB and return a list of results. Each result is a dictionary with the keys being
# the name of the given column.
def fetchAllFromDB(action):
    result = []
    cursor = dbConn.cursor()
    try:
        cursor.execute(action)
        record = cursor.fetchall()
        column_names = [desc[0] for desc in cursor.description]
        if record is None:
            return result
        for row in record:
            result.append(create_record(row, column_names))
    except Exception as e:
        print(e)
        pass
    cursor.close()
    return result

def fetchOneFromDB(action):
    cursor = dbConn.cursor()
    cursor.execute(action)
    record = cursor.fetchone()
    column_names = [desc[0] for desc in cursor.description]
    cursor.close()
    result = None
    if record is None:
        return record
    result = create_record(record, column_names)
    return result

def executeOnDB(action):
    cursor = dbConn.cursor()
    cursor.execute(action)
    dbConn.commit()
    cursor.close()

def lst2pgarr(alist):
    return '{' + ','.join(alist) + '}'

def intlst2pgarr(alist):
    temp = "{"
    for x in range(len(alist)):
        temp += str(alist[x])
        if x < len(alist)-1:
            temp += ","
    temp += "}"
    return temp

def current_milli_time():
    return round(time.time() * 1000)