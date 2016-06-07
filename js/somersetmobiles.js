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

                // Now we start adding some additional data.
                // We need the next datetime for each stop.
                stops = {};

                $.each(results.data.splice(1), function (key, val) {
                    // Each library is on a timescale of once every 4 weeks.
                    // Add 4 weeks onto the first stop time until we get a datetime in the future.
                    var strStartDate = val[4] + ' ' + val[7];
                    var nextDateTime = moment(strStartDate, 'MM/DD/YYYY hh:mm');
                    var strEndDate = val[4] + ' ' + val[8];
                    var nextDateTimeEnd = moment(strEndDate, 'MM/DD/YYYY hh:mm');
                    var now = moment();
                    while (now > nextDateTime) {
                        nextDateTime.add(4, 'weeks');
                    }
                    while (now > nextDateTimeEnd) {
                        nextDateTimeEnd.add(4, 'weeks');
                    }
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
                    stops[val[0]]['Due'] = nextDateTime.fromNow();
                    stops[val[0]]['DueSystem'] = nextDateTime.format();
                    stops[val[0]]['Duration'] = nextDateTimeEnd.diff(nextDateTime, 'minutes');

                })
                this.data = stops;
                callback(results.data);
            }.bind(this)
        })
    },

    /////////////////////////////////////
    // Function: GetCurentLocation
    // Get the current id stop for the mobile library.
    /////////////////////////////////////
    getCurrentLocation: function (mobile) { },


    getDataTable: function () {
        var dataArray = [];
        $.each(this.data, function (key, val) {
            // Mobile,Route,Day,Town,Location,Postcode,Due,Duration
            dataArray.push([val.Library, val.RouteId, val.Route, val.Day, val.Town, val.Location, val.Postcode, val.Due, val.DueSystem, val.Duration]);
        });
        return dataArray;
    },


    getCalendar: function (mobile, route, stop) { },


    getCSVRoute: function (mobile, route) { },


    getExcelRoute: function (mobile, route) { },




    setCurrentDistances: function (lat, lng) {
        var distance = function (lat1, lon1, lat2, lon2, unit) {
            var radlat1 = Math.PI * lat1 / 180
            var radlat2 = Math.PI * lat2 / 180
            var radlon1 = Math.PI * lon1 / 180
            var radlon2 = Math.PI * lon2 / 180
            var theta = lon1 - lon2
            var radtheta = Math.PI * theta / 180
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            dist = Math.acos(dist)
            dist = dist * 180 / Math.PI
            dist = dist * 60 * 1.1515
            if (unit == "K") { dist = dist * 1.609344 }
            if (unit == "N") { dist = dist * 0.8684 }
            return dist
        };
        
        $.each(this.data, function(key,val){
            val.CurrentDistance = distance(lat, lng, val.lat, val.lng);
            this.data[key] = val;
        });
    }

};