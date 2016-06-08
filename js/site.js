/////////////////////////////////////////////////
// Map
// Initialise the map, set center, zoom, etc.
/////////////////////////////////////////////////
var map = L.map('map').setView([51.505, -0.09], 13);

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
    $('#divNearest').empty();
    $('#divNearestAdditional').empty();
    var place = autocomplete.getPlace();
    var lat = place.geometry.location.lat();
    var lng = place.geometry.location.lng();
    SomersetMobiles.setCurrentDistances(lat, lng);
    var nearest = SomersetMobiles.getNearest();
    var nearestStop = SomersetMobiles.data[nearest];
    $('#divNearestAdditional').html('<span class="lead">Nearest stop <strong>' + nearestStop.Location + ', ' + nearestStop.Town + '.  Arriving in ' + nearestStop.Due + '</span>');
    $('#divNearestAdditional').append('<h4>' + nearestStop.Location + ', ' + nearestStop.Town + '</h4>');
    $('#divNearestAdditional').append('<p><strong>Next due</strong> ' + nearest.Due + '<p>');
    $('#divNearestAdditional').append('<p><strong>Departing</strong> ' + nearest.Due + '<p>');
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
                $('#spTauntonCurrentPosition').html('<span class="lead">Currently at <strong>' + SomersetMobiles.data[tauntonCurrent]['Location'] + ', ' + SomersetMobiles.data[tauntonNext]['Town'] + '</strong> for another ' + moment().diff(moment(SomersetMobiles.data[tauntonCurrent]['DepartingSystem']), 'minutes') + '</span> minutes');
            } else {
                $('#spTauntonCurrentPosition').html('<span class="lead">Arriving at <strong>' + SomersetMobiles.data[tauntonNext]['Location'] + ', ' + SomersetMobiles.data[tauntonNext]['Town'] + '</strong> ' + SomersetMobiles.data[tauntonNext]['Due'] + '</span>');
            }
            var wellsCurrent = SomersetMobiles.getCurrentLocation('Wells');
            var wellsNext = SomersetMobiles.getNextLocation('Wells');
            if (wellsCurrent != null) {
                $('#spWellsCurrentPosition').html('<span class="lead">Currently at <strong>' + SomersetMobiles.data[wellsCurrent]['Location'] + ', ' + SomersetMobiles.data[wellsNext]['Town'] + '</strong> for another ' + moment().diff(SomersetMobiles.data[wellsCurrent]['DepartureSystem']) + '</span> minutes');
            } else {
                $('#spWellsCurrentPosition').html('<span class="lead">Arriving at <strong>' + SomersetMobiles.data[wellsNext]['Location'] + ', ' + SomersetMobiles.data[wellsNext]['Town'] + '</strong> ' + SomersetMobiles.data[wellsNext]['Due'] + '</span>');
            }
        };
        setCurrentPositions();
        

        var markerArrayTaunton = [];
        var markerArrayWells = [];
        $.each(SomersetMobiles.data, function (key, val) {
            // Add items to the map.
            if (val.Lat && val.Lat != 'TODO') {
                var popup = L.popup({
                    maxWidth: 160,
                    maxHeight: 140,
                    closeButton: false,
                    className: ''
                }).setContent('');
                var className = 'taunton';
                if (val.Library == 'Taunton') className = 'wells';
                var stopIcon = L.divIcon({ html: '<div><span>' + val.Route + '</span></div>', className: "marker-cluster marker-cluster-" + className, iconSize: new L.Point(20, 20) });
                if (val.Library == 'Taunton') markerArrayTaunton.push(L.marker([val.Lat, val.Lng], { icon: stopIcon }).bindPopup(popup));
                if (val.Library == 'Wells') markerArrayWells.push(L.marker([val.Lat, val.Lng], { icon: stopIcon }).bindPopup(popup));
            }
        });
        var tauntonGroup = L.layerGroup(markerArrayTaunton);
        var wellsGroup = L.layerGroup(markerArrayWells);
        map.addLayers(tauntonGroup);
        map.addLayers(wellsGroup);
        
        
        // Set up the option to show either set of library stops
        var filterLibrariesMap = function(filter) {
        
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
                            className: ''
                        },
                        {
                            extend: 'excelHtml5',
                            text: 'Export Excel',
                            className: ''
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
                setInterval(function() {
                					setCurrentPositions();
                					table.fnDraw();
                }, 5000);

    });
});