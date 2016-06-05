import csv
import requests # pip install requests
import json
import time

with open('../data/somersetmobiles.csv', 'r') as mobilecsv:
    reader = csv.reader(mobilecsv, delimiter=',', quotechar='"')
    next(reader, None)  # skip the headers
    writer = csv.writer(open('../data/somersetmobiles_geocoded.csv', 'w'), delimiter=',',quotechar='"', quoting=csv.QUOTE_MINIMAL)
    writer.writerow(['Id','Mobile','Route','Day','StartDate','Location','Postcode','Start','End','Address','Lat','Lng'])
    
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
        # use the postcode in the geocoder.  will most likely have to manually edit a few later anyway.
        url = 'http://nominatim.openstreetmap.org/search/' + postcode + '?format=json&addressdetails=1&limit=1'
        result = requests.get(url).json()
        
        writer.writerow([id,mobile,route,day,startdate,location,postcode,start,end,result[0]['display_name'],result[0]['lat'],result[0]['lon']])
        # because the web service is rate limited, wait for a second before moving onto the next one.
        time.sleep(1)