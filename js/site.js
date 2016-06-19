/////////////////////////////////////////////////
// Map
// Initialise the map, set center, zoom, etc.
/////////////////////////////////////////////////
var map = L.map('map').setView(mobilesConfig.mapInitialView, 13);
var filterLibrariesMap = function () { };

L.tileLayer('http://{s}.tiles.mapbox.com/v3/librarieshacked.jefmk67b/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

//////////////////////////////////////////////////////
// Autocomplete address search
// Initial code to set up the autocomplete search box
//////////////////////////////////////////////////////
var placeSearch, autocomplete;

function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete((document.getElementById('txtAddressSearch')), { types: ['geocode'] });
    autocomplete.addListener('place_changed', populateNearest);
}

function populateNearest() {
    $('#divNearest').show();
    $('#divNearest').empty();
    $('#divNearestAdditional').empty();
    var place = autocomplete.getPlace();
    SomersetMobiles.setCurrentDistances(place.geometry.location.lat(), place.geometry.location.lng());
    var nearest = SomersetMobiles.getNearest();
    var nearestRoute = SomersetMobiles.routes[nearest[0]];
    var nearestStop = nearestRoute.stops[nearest[1]];
    $('#divNearest').html('<span class="lead">Nearest stop ' + nearestStop.location + ', ' + nearestStop.town + '. '
        + 'Arriving ' + nearestStop.due + ' (' + moment(nearestStop.dueSystem).format('Do MMM hh:mma') + '). '
        + nearestStop.curentDistance + ' miles away.</span>');
}

/////////////////////////////
// Extend Leaflet Polyline.
/////////////////////////////
L.Polyline = L.Polyline.extend({
    getDistance: function (system) {
        // distance in meters
        var mDistance = 0;
        var length = this._latlngs.length;
        for (var i = 1; i < length; i++) {
            mDistance += this._latlngs[i].distanceTo(this._latlngs[i - 1]);
        }
        // optional
        if (system === 'imperial') {
            return Math.round(mDistance / 1609.34);
        } else {
            return Math.round(mDistance / 1000);
        }
    }
});

//////////////////////////////////////////////////
// Following relies on jQuery etc so wait for page to complete
//////////////////////////////////////////////////
$(function () {
    //////////////////////////////////////////////////
    // Load Data
    // 
    /////////////////////////////////////////////////
    SomersetMobiles.loadData(function () {

        // First get how many mobile libraries we have.
        var libraries = SomersetMobiles.getLibraries();

        // Set up the HTML departure for each library
        $.each(libraries, function (key, lib) {
            $('#divDepartures').append('<div class="col col-lg-4 col-md-4">'
                + '<div class="alert alert-' + mobilesConfig.libBootswatchClass[lib] + '">'
                + lib + '<br />'
                + '<span id="sp' + lib + 'CurrentPosition"></span>'
                + '</div></div>');

            $('#divMapFilters').append('<div class="btn-group">'
                    + '<a href="#" class="btn btn-' + mobilesConfig.libBootswatchClass[lib] + '" onclick="filterLibrariesMap(\'' + lib + '\')">' + lib + ' Stops  <span class="badge" id="sp' + lib + 'StopCount"></span></a>'
                    + '<a href="#" class="btn btn-' + mobilesConfig.libBootswatchClass[lib] + ' dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><span class="caret"></span></a>'
                    + '<ul class="dropdown-menu" id="ul' + lib + 'Filter">'
                    + '<li><a href="#" onclick="filterLibrariesMap(\'' + lib + '\')">All ' + lib + ' stops</a></li>'
                    + '<li class="divider"></li>'
                    + '</ul></div>');
        });

        /////////////////////////////////////////////
        // Function: SetCurrentPositions
        // Sets the current positions for each library on the
        // departures board.
        ////////////////////////////////////////////////
        var setCurrentPositions = function () {
            $.each(libraries, function (key, lib) {
                // Get current and next positions.
                var current = SomersetMobiles.getCurrentLocation(lib);
                if (current) var currentRoute = SomersetMobiles.routes[current[0]];
                if (current) var currentStop = currentRoute.stops[current[1]];
                var next = SomersetMobiles.getNextLocation(lib);
                var nextRoute = SomersetMobiles.routes[next[0]];
                var nextStop = nextRoute.stops[next[1]];

                if (current != null) {
                    $('#sp' + lib + 'CurrentPosition').html('<span class="lead">Currently at ' + currentStop.location + ', ' + currentStop.town + ' for another ' + moment(currentStop.departingSystem).diff(moment(), 'minutes') + ' minutes</span>');
                } else {
                    $('#sp' + lib + 'CurrentPosition').html('<span class="lead">Expected at ' + nextStop.location + ', ' + nextStop.town + ' ' + nextStop.due + '</span>');
                }
            });
        };
        setCurrentPositions();
        var markersArrays = {};
        var markerGroups = {};
        var markersBounds = {};
        var routes = {};

        $.each(SomersetMobiles.routes, function (key, val) {
            $.each(val.stops, function (k, v) {
                // Add items to the map.
                if (v.lat) {
                    var popup = L.popup({
                        maxWidth: 160,
                        maxHeight: 140,
                        closeButton: false,
                        className: ''
                    }).setContent('<h4>' + v.location + ', ' + v.town + '</h4>' + moment(v.dueSystem).format('Do MMM hh:mma') + '<br/>' + 'Route ' + val.route + '<br/>' + v.duration + ' minute stop');

                    // Set up the associative arrays for layers and bounds
                    if (!markersArrays[key]) markersArrays[key] = [];
                    if (!markersBounds[key]) markersBounds[key] = [];

                    var stopIcon = L.divIcon({ html: '<div><span>' + val.route + '</span></div>', className: "marker-cluster marker-cluster-" + val.library.toLowerCase(), iconSize: new L.Point(20, 20) });
                    markersArrays[key].push(L.marker([v.lat, v.lng], { icon: stopIcon }).bindPopup(popup, { className: val.library.toLowerCase() + '-popup' }));
                    markersBounds[key].push([v.lat, v.lng]);
                }
            });
        });

        // Add marker groups for all the routes (and overall library)
        $.each(SomersetMobiles.routes, function (key, val) {
            // Add the library marker group
            if (!markerGroups[val.library]) {
                markerGroups[val.library] = L.featureGroup($.map(markersArrays, function (x, y) {
                    if (y.indexOf(val.library) != -1) return x;
                }));
            }
            // Add the route marker group
            if (!markerGroups[val.library + val.route]) {
                markerGroups[val.library + val.route] = L.featureGroup($.map(markersArrays, function (x, y) {
                    if (y == (val.library + val.route)) return x;
                }));
            }
            $('#ul' + val.library + 'Filter').append('<li><a href="#" onclick="filterLibrariesMap(\'' + val.library + val.route + '\')">Route ' + val.route + '</a></li>');
        });

        // Initial setup - Add all libraries and the overall bounds
        $.each(libraries, function (key, lib) {
            map.addLayer(markerGroups[lib]);
            $('#sp' + lib + 'StopCount').text($.map(markersArrays, function (v, k) { if (k.indexOf(lib) != -1) return v; }).length);
        });
        $('#spStopCount').text($.map(markersArrays, function (v, k) { return v; }).length);

        map.fitBounds($.map(markersBounds, function (val, key) {
            return val;
        }));
        var currentFilter = 'All';

        // Set up the option to show either set of library stops
        filterLibrariesMap = function (filter) {
            $('#spQuickStats').html('');
            this.event.preventDefault();
            if (currentFilter == filter) return false;
            if (currentFilter == 'All') {
                $.each(libraries, function (key, lib) {
                    map.removeLayer(markerGroups[lib]);
                });
            } else if (libraries.indexOf(currentFilter) != -1){
                map.removeLayer(markerGroups[currentFilter]);
            } else {
                map.removeLayer(markerGroups[currentFilter]);
                // Only the individual routes have route lines on
                map.removeLayer(routes[currentFilter]);
            }
            if (filter == 'All') {
                $.each(libraries, function (key, lib) {
                    map.addLayer(markerGroups[lib]);
                });
                map.fitBounds($.map(markersBounds, function (val, key) {
                    return val;
                }));
            } else {
                map.addLayer(markerGroups[filter]);
                var updateQuickStats = function (filter) {
                    var className = mobilesConfig.libBootswatchClass[filter.substring(0, filter.length - 1)];
                    $('#spQuickStats').html('<span class="text-' + className + '">' + SomersetMobiles.routes[filter].library + ' Route ' + SomersetMobiles.routes[filter].route + ' quick stats.</span> '
                        + 'Distance travelled: <span class="text-' + className + '">' + routes[filter].getDistance('imperial') + ' miles</span>. '
                        + 'Number of stops: <span class="text-' + className + '">' + markersArrays[filter].length + '</span>');
                };
                if (libraries.indexOf(filter) != -1) {
                    map.fitBounds($.map(markersBounds, function (val, key) {
                        if (key.indexOf(filter) != -1) return val;
                    }));
                } else {
                    // We also want to add the route lines
                    if (!routes[filter]) {
                        var routeLatLngs = [];
                        var lineColour = mobilesConfig.routeColour[filter.substring(0, filter.length -1)];
                        SomersetMobiles.loadRoute(filter, function () {
                            $.each(SomersetMobiles.routes[filter].routeLine, function (i, latlng) {
                                routeLatLngs.push(L.latLng(latlng[0], latlng[1]));
                            });
                            var routeLine = L.polyline(routeLatLngs, { color: lineColour, dashArray: '20,15', opacity: 0.4 });
                            routes[filter] = routeLine;
                            map.addLayer(routes[filter]);
                            // Update the quick stats bar
                            updateQuickStats(filter);
                        });
                    } else {
                        map.addLayer(routes[filter]);
                    }
                    map.fitBounds($.map(markersBounds, function (val, key) {
                        if (key == filter) return val;
                    }));
                }
            }
            currentFilter = filter;
            return false;
        };

        // Set up DataTable
        var table = $('#tblFullTimetable').dataTable(
                {
                    processing: true,
                    dom: 'Bfrtip',
                    buttons: [
                        {
                            extend: 'print',
                            text: 'Print',
                            className: 'btn-sm'
                        },
                        {
                            extend: 'excelHtml5',
                            text: 'Export Excel',
                            className: 'btn-sm'
                        }
                    ],
                    deferRender: true,
                    data: SomersetMobiles.getDataTable(),
                    // We're expecting Mobile,Route,Day,Town,Location,Postcode,Due,Duration
                    columns: [
                        { title: "Library" },
                        { title: "RouteID", visible: false },
                        { title: "Route" },
                        { title: "Day" },
                        { title: "Town" },
                        { title: "Location" },
                        { title: "Postcode" },
                        { title: "Due" },
                        { title: "DueSystem", visible: false },
                        { title: "Duration" }
                    ],
                    order: [[8, 'asc']],
                    drawCallback: function (settings) {
                        var api = this.api();
                        var rows = api.rows({ page: 'current' }).nodes();
                        var last = null;
                        api.column(7, { page: 'current' }).data().each(function (group, i) {
                            if (group != '' && last !== group) {
                                $(rows).eq(i).before(
                                    '<tr class="grouping"><td colspan="8">Due ' + group + '</td></tr>'
                                );
                                last = group;
                            }
                        });
                    }
                });
        // Set an interval to refresh all the page data (that we want to refresh).
        setInterval(function () {
            setCurrentPositions();
            // table.fnDraw();
        }, 5000);

    });
});