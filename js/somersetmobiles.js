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
                stops = results.data;

                $.each(stops, function (key, val) {
                    // Each library is on a timescale of once every 4 weeks.
                    // Add 4 weeks onto the first stop time until we get a datetime in the future.
                    var nextDateTime = new Date(val.StartDate + val.StartTime);
                    var now = new Date();
                    while (now > nextDateTime) {
                        nextDateTime.setDate(nextDateTime.getDate() + 28);
                    }
                    stops.Due = nextDateTime;
                });
                this.data = results.data;
                callback(results.data);
            }.bind(this)
        });
    },

    /////////////////////////////////////
    // Function: GetCurentLocation
    // Get the current id stop for the mobile library.
    /////////////////////////////////////
    getCurrentLocation: function (mobile) { },


    getDataTable: function () {
        var dataArray = [];
        $.each(this.data, function (key, val) {
            dataArray.push(['','','','','','']);
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