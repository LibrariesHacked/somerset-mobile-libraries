import csv
import collections
import urllib

with open('../data/somersetmobiles_geocoded.csv', 'rb') as mobilecsv:
    reader = csv.reader(mobilecsv, delimiter=',', quotechar='"')
    next(reader, None)  # skip the headers
    routes = collections.OrderedDict()
    for row in reader:
        library = row[1]
        route = row[2]
        routeId = library + route
        if routes.get(routeId) is None:
            routes[routeId] = collections.OrderedDict()
        latitude = row[11]
        longitude = row[12]
        id = row[0]
        routes[routeId][id] = [latitude,longitude]

url = ''
for route in routes:
    for idx,trip in enumerate(routes[route]):

        if idx == 0:
            waypoints = ''
            url = 'http://openls.geog.uni-heidelberg.de/route?start=' + routes[route][trip][1] + ',' + routes[route][trip][0]
        elif idx == 1:
            waypoints = routes[route][trip][1] + ',' + routes[route][trip][0]
        elif idx == (len(routes[route]) -1):
            url = url + '&end=' + routes[route][trip][1] + ',' + routes[route][trip][0] + '&via='
            url = url + waypoints + '&lang=en&distunit=KM&routepref=Car&weighting=Fastest&avoidAreas=&useTMC=false&noMotorways=false&noTollways=false&noUnpavedroads=false&noSteps=false&noFerries=false&instructions=false'
            gmlFile = urllib.URLopener()
            gmlFile.retrieve(url, '../data/' + route + '.xml')
        else:
            waypoints = waypoints + ' ' + routes[route][trip][1] + ',' + routes[route][trip][0]
