import csv
import requests # pip install requests
import json
import time

with open('../data/somersetmobiles.csv', 'r') as mobilecsv:
    reader = csv.reader(mobilecsv, delimiter=',', quotechar='"')
    next(reader, None)  # skip the headers
    writer = csv.writer(open('../data/somersetmobiles_geocoded.csv', 'w'), delimiter=',',quotechar='"', quoting=csv.QUOTE_MINIMAL)
    writer.writerow(['Id','Mobile','Route','Day','StartDate','Location','Postcode','Start','End','Address','Place','Lat','Lng'])
    
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
        # url = 'http://nominatim.openstreetmap.org/search/' + postcode + '?format=json&addressdetails=1&limit=1'
        url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + location + ',' + postcode  + ' Somerset UK'
        result = requests.get(url).json()
        
        addresses = result['results']
        
        if len(addresses) > 0:
            place = 'TODO'
            for address in addresses[0]['address_components']:
                if 'postal_town' in address['types']:
                    place = address['long_name']
                    
            writer.writerow([id,mobile,route,day,startdate,location,postcode,start,end,addresses[0]['formatted_address'],place,addresses[0]['geometry']['location']['lat'],addresses[0]['geometry']['location']['lng']])
            # because the web service is rate limited, wait for a second before moving onto the next one.
            time.sleep(1)
        else:
            writer.writerow([id,mobile,route,day,startdate,location,postcode,start,end,'TODO','TODO','TODO','TODO'])
 