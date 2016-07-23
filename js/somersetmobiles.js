var SomersetMobiles = {
    routes: {},
    /////////////////////////////////////
    // Function: loadData
    // Loads the data asynchonously.
    /////////////////////////////////////
    loadData: function (callback) {
        Papa.parse('/data/somersetmobiles_geocoded.csv', {
            download: true,
            complete: function (results) {
                $.each(results.data.splice(1), function (key, val) {
                    var stopId = val[0];
                    var routeId = val[1] + val[2];
                    if (!this.routes[routeId]) this.routes[routeId] = { library: val[1], route: val[2], day: val[3], startDate: val[4], stops: {} };
                    this.routes[routeId].stops[stopId] = {};
                    this.routes[routeId].stops[stopId]['location'] = val[5];
                    this.routes[routeId].stops[stopId]['postcode'] = val[6];
                    this.routes[routeId].stops[stopId]['start'] = val[7];
                    this.routes[routeId].stops[stopId]['end'] = val[8];
                    this.routes[routeId].stops[stopId]['address'] = val[9];
                    this.routes[routeId].stops[stopId]['town'] = val[10];
                    this.routes[routeId].stops[stopId]['lat'] = val[11];
                    this.routes[routeId].stops[stopId]['lng'] = val[12];
                }.bind(this));
                this.setDueDates();
                callback(results.data);
            }.bind(this)
        });
    },
    /////////////////////////////////////
    // Function: loadRoute
    // Loads the route line data for a particular route
    /////////////////////////////////////
    loadRoute: function (routeId, callback) {
        $.ajax({
            type: 'GET',
            url: '../data/' + routeId + '.xml',
            dataType: 'xml',
            success: function (xml) {
                this.routes[routeId].routeLine = [];
                $(xml).find("xls\\:RouteGeometry, RouteGeometry").find("gml\\:pos, pos").each(function (i, x) {
                    this.routes[routeId].routeLine.push([x.textContent.split(' ')[1], x.textContent.split(' ')[0]]);
                }.bind(this));
                callback();
            }.bind(this),
            error: function () { }
        });
    },
    /////////////////////////////////////////////////////////////////////////////
    // Function: SetDueDates
    // Sets the next due date/times for all the stops based on start date.
    /////////////////////////////////////////////////////////////////////////////
    setDueDates: function (mobile) {
        var now = moment();
        $.each(this.routes, function (key, val) {
            $.each(val.stops, function (k, v) {
                // Each library is on a timescale of once every 4 weeks.
                // Add 4 weeks onto the first stop time until we get a datetime in the future.
                var strStartDate = val.startDate + ' ' + v.start;
                var nextDateTime = moment(strStartDate, 'MM/DD/YYYY hh:mm');
                var strEndDate = val.startDate + ' ' + v.end;
                var nextDateTimeEnd = moment(strEndDate, 'MM/DD/YYYY hh:mm');
                while (now > nextDateTimeEnd) {
                    nextDateTime.add(4, 'weeks');
                    nextDateTimeEnd.add(4, 'weeks');
                }
                this.routes[key].stops[k]['due'] = nextDateTime.fromNow();
                this.routes[key].stops[k]['dueSystem'] = nextDateTime.format();
                this.routes[key].stops[k]['departing'] = nextDateTimeEnd.format();
                this.routes[key].stops[k]['departingSystem'] = nextDateTimeEnd.format();
                this.routes[key].stops[k]['duration'] = nextDateTimeEnd.diff(nextDateTime, 'minutes');
            }.bind(this));
        }.bind(this));
    },
    /////////////////////////////////////////////////////////////////////////////
    // Function: GetCurentLocation
    // Get the current stop for the mobile library.
    /////////////////////////////////////////////////////////////////////////////
    getCurrentLocation: function (mobile) {
        var timeNow = moment();
        // Refresh the due dates.
        this.setDueDates();
        var currentLocation = null;
        $.each(this.routes, function (key, val) {
            if (val.library == mobile) {
                $.each(val.stops, function (k, v) {
                    if (timeNow.isAfter(v.dueSystem)) currentLocation = [key, k];
                });
            }
        }.bind(this));
        return currentLocation;
    },
    /////////////////////////////////////////////////////////////////////////////
    // Function: GetLibraries
    // Get an array of libraries
    /////////////////////////////////////////////////////////////////////////////
    getLibraries: function () {
        var libs = [];
        $.each(this.routes, function (key, val) {
            if (libs.indexOf(val.library) == -1) libs.push(val.library);
        });
        return libs;
    },
    /////////////////////////////////////////////////////////////////////////////
    // Function: GetNextLocation
    // Get the next stop for the mobile library.
    /////////////////////////////////////////////////////////////////////////////
    getNextLocation: function (mobile) {
        var timeNow = moment();
        // Refresh the due dates.
        this.setDueDates();
        var nextLocation = null;
        $.each(this.routes, function (key, val) {
            if (val.library == mobile) {
                $.each(val.stops, function (k, v) {
                    if (nextLocation == null) nextLocation = [key, k];
                    if (v.dueSystem < this.routes[nextLocation[0]].stops[nextLocation[1]].dueSystem) nextLocation = [key, k];
                }.bind(this));
            }
        }.bind(this));
        return nextLocation;
    },
    /////////////////////////////////////////////////////////////////////////////
    // Function: GetDataTable
    // Gets all the current data in the format suitable for DataTables display
    // Input: None
    // Output: DataArray
    /////////////////////////////////////////////////////////////////////////////
    getDataTable: function () {
        var dataArray = [];
        $.each(this.routes, function (key, val) {
            $.each(val.stops, function (k, v) {
                dataArray.push([val.library, k, val.route, val.day, v.town, v.location, v.postcode, v.due, v.dueSystem, v.duration]);
            });
        });
        return dataArray;
    },
    /////////////////////////////////////////////////////////////////////////////
    // Function: SetCurrentDistances
    // Get the nearest stop to a particular location.
    // Input: Lat/Lng
    // Output: None
    /////////////////////////////////////////////////////////////////////////////
    setCurrentDistances: function (lat, lng) {
        var distance = function (lat1, lon1, lat2, lon2, unit) {
            var radlat1 = Math.PI * lat1 / 180;
            var radlat2 = Math.PI * lat2 / 180;
            var radlon1 = Math.PI * lon1 / 180;
            var radlon2 = Math.PI * lon2 / 180;
            var theta = lon1 - lon2;
            var radtheta = Math.PI * theta / 180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            dist = Math.acos(dist);
            dist = dist * 180 / Math.PI;
            dist = dist * 60 * 1.1515;
            if (unit == "K") dist = dist * 1.609344;
            if (unit == "N") dist = dist * 0.8684;
            return dist;
        };
        $.each(this.routes, function (key, val) {
            $.each(val.stops, function (k, v) {
                this.routes[key].stops[k].currentDistance = Math.round(distance(lat, lng, v.lat, v.lng));
            }.bind(this));
        }.bind(this));
        return;
    },
    /////////////////////////////////////////////////////////////////////////////
    // Function: GetNearest
    // Get the nearest stop to a particular location.
    // Input: None
    // Output: The route Id and stopId of the stop ([TauntonA, 3]).
    /////////////////////////////////////////////////////////////////////////////
    getNearest: function () {
        var currentNearest = null;
        $.each(this.routes, function (key, val) {
            $.each(val.stops, function (k, v) {
                if (currentNearest == null || v.currentDistance < this.routes[currentNearest[0]].stops[currentNearest[1]].currentDistance) currentNearest = [key, k];
            }.bind(this));
        }.bind(this));
        return currentNearest;
    },
    /////////////////////////////////////////////////////////////////////////////
    // Function: GetLibraryTotalHours
    // Gets the total hours of a mobile library (over the timetable duration).
    // Input: Library Name
    // Output: The route Id and stopId of the stop ([TauntonA, 3]).
    /////////////////////////////////////////////////////////////////////////////
    getLibraryTotalHours: function (lib) {
        var duration = 0;
        $.each(this.routes, function (key, val) {
            if (val.library == lib) {
                $.each(val.stops, function (k, v) {
                    duration += v.duration;
                }.bind(this));
            }
        }.bind(this));
        return duration;
    }
};