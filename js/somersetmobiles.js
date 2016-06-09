var SomersetMobiles = {
    data: {},
    /////////////////////////////////////
    // Function: loadData
    // Loads the data asynchonously.
    /////////////////////////////////////
    loadData: function (callback) {
        Papa.parse('/data/somersetmobiles_geocoded.csv', {
            download: true,
            complete: function (results) {
                stops = {};
                $.each(results.data.splice(1), function (key, val) {
                    stops[val[0]] = {};
                    stops[val[0]]['Library'] = val[1];
                    stops[val[0]]['RouteId'] = val[1] + val[2];
                    stops[val[0]]['Route'] = val[2];
                    stops[val[0]]['Day'] = val[3];
                    stops[val[0]]['StartDate'] = val[4];
                    stops[val[0]]['Location'] = val[5];
                    stops[val[0]]['Postcode'] = val[6];
                    stops[val[0]]['Start'] = val[7];
                    stops[val[0]]['End'] = val[8];
                    stops[val[0]]['Address'] = val[9];
                    stops[val[0]]['Town'] = val[10];
                    stops[val[0]]['Lat'] = val[11];
                    stops[val[0]]['Lng'] = val[12];
                }.bind(this));
                this.data = stops;
                this.setDueDates();
                callback(results.data);
            }.bind(this)
        })
    },
    /////////////////////////////////////////////////////////////////////////////
    // Function: SetDueDates
    // Sets the next due date/times for all the stops based on start date.
    /////////////////////////////////////////////////////////////////////////////
    setDueDates: function (mobile) {
        var now = moment();
        $.each(this.data, function (key, val) {
            // Each library is on a timescale of once every 4 weeks.
            // Add 4 weeks onto the first stop time until we get a datetime in the future.
            var strStartDate = val['StartDate'] + ' ' + val['Start'];
            var nextDateTime = moment(strStartDate, 'MM/DD/YYYY hh:mm');
            var strEndDate = val['StartDate'] + ' ' + val['End'];
            var nextDateTimeEnd = moment(strEndDate, 'MM/DD/YYYY hh:mm');
            while (now > nextDateTimeEnd) {
                nextDateTime.add(4, 'weeks');
                nextDateTimeEnd.add(4, 'weeks');
            }
            this.data[key]['Due'] = nextDateTime.fromNow();
            this.data[key]['DueSystem'] = nextDateTime.format();
            this.data[key]['Departing'] = nextDateTimeEnd.format();
            this.data[key]['DepartingSystem'] = nextDateTimeEnd.format();
            this.data[key]['Duration'] = nextDateTimeEnd.diff(nextDateTime, 'minutes');
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
        $.each(this.data, function (key, val) {
            if (val.Library == mobile && timeNow.isAfter(val.DueSystem))
            {
                currentLocation = key;
            }
        }.bind(this));
        return currentLocation;
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
        $.each(this.data, function (key, val) {
            if (val.Library == mobile && timeNow.isBefore(val.DueSystem)) {
                if (nextLocation == null) nextLocation = key;
                if (val.DueSystem < this.data[nextLocation].DueSystem) nextLocation = key;
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
        $.each(this.data, function (key, val) {
            // Mobile,Route,Day,Town,Location,Postcode,Due,Duration
            dataArray.push([val.Library, val.RouteId, val.Route, val.Day, val.Town, val.Location, val.Postcode, val.Due, val.DueSystem, val.Duration]);
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
        $.each(this.data, function (key, val) {
            val.CurrentDistance = distance(lat, lng, val.Lat, val.Lng);
            this.data[key] = val;
        }.bind(this));
        return;
    },
    /////////////////////////////////////////////////////////////////////////////
    // Function: GetNearest
    // Get the nearest stop to a particular location.
    // Input: None
    // Output: The Id of the stop.
    /////////////////////////////////////////////////////////////////////////////
    getNearest: function () {
        var currentNearest = null;
        $.each(this.data, function (key, val) {
            if (currentNearest == null || currentNearest.CurrentDistance > val.CurrentDistance) currentNearest = key;
        });
        return currentNearest;
    }
};