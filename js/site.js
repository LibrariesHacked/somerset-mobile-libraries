/////////////////////////////////////////////////
// MAP
// Initialise the map, set center, zoom, etc.
/////////////////////////////////////////////////
var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
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
    var place = autocomplete.getPlace();
    for (var component in componentForm) {
        //document.getElementById(component).value = '';
        //document.getElementById(component).disabled = false;
    }

    // Get each component of the address from the place details
    // and fill the corresponding field on the form.
    for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        if (componentForm[addressType]) {
            var val = place.address_components[i][componentForm[addressType]];
            //document.getElementById(addressType).value = val;
        }
    }
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
                    // We're expecting displayname, surname, givenname, jobtitle, manager, department, location, telephoneNumber, mobile, mail
                    columns: [
                        { title: "Job title" },
                        { title: "Manager" },
                        { title: "Department" },
                        { title: "Location" },
                        { title: "Telephone" },
                        { title: "Mobile" },
                        { title: "Email" }
                    ],
                    order: [[2, 'asc']],
                    drawCallback: function (settings) {
                        var api = this.api();
                        var rows = api.rows({ page: 'current' }).nodes();
                        var last = null;
                        api.column(2, { page: 'current' }).data().each(function (group, i) {
                            if (group != '' && last !== group) {
                                $(rows).eq(i).before(
                                    '<tr class="grouping"><td colspan="5">Route: ' + group + '</td></tr>'
                                );
                                last = group;
                            }
                        });
                    }
                });
    });
});