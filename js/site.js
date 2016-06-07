/////////////////////////////////////////////////
// MAP
// Initialise the map, set center, zoom, etc.
/////////////////////////////////////////////////
var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('http://{s}.tiles.mapbox.com/v3/librarieshacked.jefmk67b/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


/////////////////////////////////////////////////
// AUTOCOMPLETE ADRESS SEARCH
/////////////////////////////////////////////////
var placeSearch, autocomplete;
var componentForm = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    country: 'long_name',
    postal_code: 'short_name'
};

function initAutocomplete() {
    autocomplete = new google.maps.places.Autocomplete((document.getElementById('txtAddressSearch')), { types: ['geocode'] });
    autocomplete.addListener('place_changed', fillInAddress);
}

function fillInAddress() {
    $('#divNearest').empty();
    var place = autocomplete.getPlace();
    var lat = place.geometry.location.lat();
    var lng = place.geometry.location.lng();
    SomersetMobiles.setCurrentDistances(lat, lng);
    var nearest = SomersetMobiles.getNearest();
    $('#divNearest').append('<h3>' + nearest.Location + '</h3>');
    $('#divNearest').append('<p>Due ' + nearest.Due + '<p>');

}

// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var geolocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            var circle = new google.maps.Circle({
                center: geolocation,
                radius: position.coords.accuracy
            });
            autocomplete.setBounds(circle.getBounds());
        });
    }
}


$(function () {
    //////////////////////////////////////////////////
    // LOAD DATA
    /////////////////////////////////////////////////
    SomersetMobiles.loadData(function () {

        var markerArray = [];
        $.each(SomersetMobiles.data, function (key, val) {
            // Add items to the map.
            if (val.Lat && val.Lat != 'TODO') {
                markerArray.push(L.circleMarker([val.Lat, val.Lng], {
                    radius: 3
                }).bindPopup('<h4>' + val.Location + '</h4><small>Due ' + val.Due + '</small>'));
            }
        });
        var group = L.featureGroup(markerArray).addTo(map);
        map.fitBounds(group.getBounds());

        // Set up DataTable
        $('#tblFullTimetable').DataTable(
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
    });
});