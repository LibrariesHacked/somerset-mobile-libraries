import csv
import urllib
import json

with open('data/somersetmobiles.csv', 'rb') as mobilecsv:
    reader = csv.reader(mobilecsv, delimiter=',', quotechar='"')
    next(reader, None)  # skip the headers
    for row in reader:
        # Id,Mobile,Route,Day,StartDate,Location,Postcode,Start,End
        id = row[0]
        mobile = row[1]
        route = row[2]
        day = row[3]
        startdate = row[4]
        location = row[5]
        postcode = row[6]
        start = row[7]
        end = row[8]
        url = ''
        response = urllib.urlopen(url)
        data = json.loads(response.read())
        
        # because the web service is rate limited, wait for a second before moving onto the next one.
        time.sleep(1)