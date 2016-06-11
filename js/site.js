/////////////////////////////////////////////////
// Map
// Initialise the map, set center, zoom, etc.
/////////////////////////////////////////////////
var map = L.map('map').setView([51.505, -0.09], 13);
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
    var lat = place.geometry.location.lat();
    var lng = place.geometry.location.lng();
    SomersetMobiles.setCurrentDistances(lat, lng);
    var nearest = SomersetMobiles.getNearest();
    var nearestStop = SomersetMobiles.data[nearest];
    $('#divNearest').html('<span class="lead">Nearest stop <strong>' + nearestStop.Location + ', ' + nearestStop.Town + '.  Arriving in ' + nearestStop.Due + ' (' + moment(nearestStop.DueSystem).format('DD/MM/YYYY hh:mm') + ')</span>');
}

//////////////////////////////////////////////////
// Following relies on jQuery etc so wait for page to complete
//////////////////////////////////////////////////
$(function () {
    //////////////////////////////////////////////////
    // Load Data
    // 
    /////////////////////////////////////////////////
    SomersetMobiles.loadData(function () {

        var setCurrentPositions = function () {
            // Set current positions.
            var tauntonCurrent = SomersetMobiles.getCurrentLocation('Taunton');
            var tauntonNext = SomersetMobiles.getNextLocation('Taunton');
            if (tauntonCurrent != null) {
                $('#spTauntonCurrentPosition').html('<span class="lead">Currently at ' + SomersetMobiles.data[tauntonCurrent]['Location'] + ', ' + SomersetMobiles.data[tauntonCurrent]['Town'] + ' for another ' + moment(SomersetMobiles.data[tauntonCurrent]['DepartingSystem']).diff(moment(), 'minutes') + ' minutes</span>');
            } else {
                $('#spTauntonCurrentPosition').html('<span class="lead">Arriving at ' + SomersetMobiles.data[tauntonNext]['Location'] + ', ' + SomersetMobiles.data[tauntonNext]['Town'] + ' ' + SomersetMobiles.data[tauntonNext]['Due'] + '</span>');
            }
            var wellsCurrent = SomersetMobiles.getCurrentLocation('Wells');
            var wellsNext = SomersetMobiles.getNextLocation('Wells');
            if (wellsCurrent != null) {
                $('#spWellsCurrentPosition').html('<span class="lead">Currently at ' + SomersetMobiles.data[wellsCurrent]['Location'] + ', ' + SomersetMobiles.data[wellsCurrent]['Town'] + ' for another ' + moment(SomersetMobiles.data[wellsCurrent]['DepartingSystem']).diff(moment(), 'minutes') + ' minutes</span>');
            } else {
                $('#spWellsCurrentPosition').html('<span class="lead">Arriving at ' + SomersetMobiles.data[wellsNext]['Location'] + ', ' + SomersetMobiles.data[wellsNext]['Town'] + ' ' + SomersetMobiles.data[wellsNext]['Due'] + '</span>');
            }
        };
        setCurrentPositions();
        var markersArrays = {};
        var markersBounds = {};
        $.each(SomersetMobiles.data, function (key, val) {
            // Add items to the map.
            if (val.Lat && val.Lat != 'TODO') {
                var popup = L.popup({
                    maxWidth: 160,
                    maxHeight: 140,
                    closeButton: false,
                    className: ''
                }).setContent('<p>' + val.Location + ', ' + val.Town + '</p><strong>Date </strong>' + moment(val.DueSystem).format('DD MMM YYYY hh:mm') + '');
                var className = 'taunton';

                // Set up the associative arrays for layers and bounds
                if (!markersArrays[val.RouteId]) markersArrays[val.RouteId] = [];
                if (!markersBounds[val.RouteId]) markersBounds[val.RouteId] = [];

                if (val.Library == 'Taunton') className = 'wells';
                var stopIcon = L.divIcon({ html: '<div><span>' + val.Route + '</span></div>', className: "marker-cluster marker-cluster-" + className, iconSize: new L.Point(20, 20) });
                markersArrays[val.RouteId].push(L.marker([val.Lat, val.Lng], { icon: stopIcon }).bindPopup(popup));
                markersArrays[val.RouteId].push([val.Lat, val.Lng]);
            }
        });
        var layers = {};
        layers['taunton'] = L.layerGroup($.map(markersArrays, function (val,key) {
            if (key.indexOf('Taunton') != -1) return val;
        }));
        layers['wells'] = L.layerGroup($.map(markersArrays, function (val, key) {
            if (key.indexOf('Wells') != -1) return val;
        }));


        map.addLayer(layers['taunton']);
        map.addLayer(layers['wells']);
        map.fitBounds($.map(markersBounds, function (key, val) {
            return val;
        }));

        var currentFilter = 'all';

        // Set the stop counts
        $('#spStopCount').text('1');
        $('#spTauntonStopCount').text('2');
        $('#spWellsStopCount').text('3');

        // Set up the option to show either set of library stops
        filterLibrariesMap = function (filter) {
            if (currentFilter == 'all' && filter == 'taunton') {
                map.removeLayer(layers['wells']);
                //map.fitBounds(markersTauntonBounds);
            }
            if (currentFilter == 'all' && filter == 'wells') {
                map.removeLayer(layers['taunton']);
                map.addLayer(layers['wells']);
                //map.fitBounds(markersWellsBounds);
            }
            if (currentFilter == 'wells' && filter == 'taunton') {
                map.removeLayer(layers['wells']);
                map.addLayer(layers['taunton']);
                //map.fitBounds(markersTauntonBounds);
            }
            if (currentFilter == 'taunton' && filter == 'wells') {
                map.removeLayer(layers['taunton']);
                map.addLayer(layers['wells']);
                //map.fitBounds(markersTauntonBounds);
            }
            if (currentFilter == 'wells' && filter == 'all') {
                map.addLayer(layers['taunton']);
                //map.fitBounds(markersAllBounds);
            }
            if (currentFilter == 'taunton' && filter == 'all') {
                map.addLayer(wellsGroup);
                map.fitBounds(markersAllBounds);
            }
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
                                    '<tr class="grouping"><td colspan="5">Due ' + group + '</td></tr>'
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