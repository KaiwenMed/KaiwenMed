let map;
var infowindow = new google.maps.InfoWindow();

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.8, lng: -96 }, // Default center of the map
        zoom: 4
    });
}

$(document).ready(function () {

    let cityData = {
        
        GU: [
            "Tamuning"
        ],
        VI: [
            "ST THOMAS"
        ]
    };


    $('#state').select2({
        placeholder: "Select a state",
        allowClear: true
    });

    $('#city').select2({
        placeholder: "Select a city",
        allowClear: true
    });

    $('#date').datepicker();

    // $("#walkins, #in_stock, #offers_mask").button();

    $('#state').change(function () {
        let state = $(this).val();
        let cities = cityData[state];
        let $city = $('#city');
        $city.empty()
        $city.append(new Option('', '')); // Add an empty option for clear functionality
        $.each(cities, function (index, city) {
            $city.append(new Option(city, city));
        });

        // Update Select2
        $city.trigger('change');
    });

    $('#state').val('NY').trigger('change');
    let states = Object.keys(cityData);
    console.log(states)

    $('#vaccine-form').submit(function (event) {
        event.preventDefault();
        let city = $('#city').val();
        let state = $('#state').val();
        let zip = $('#zip').val();
        let insurance_accepted = $('#insurance').is(':checked');
        let walkins_accepted = $('#walkins').is(':checked');
        let in_stock = $('#in_stock').is(':checked');
        let offers_mask = $('#offers_mask').is(':checked');

        let selectedDate = $('#date').datepicker('getDate');
        let dayOfWeek = selectedDate ? selectedDate.getDay() : null;

        let url = 'https://data.cdc.gov/resource/5jp2-pgaw.json?';


        if (city) {
            city = city.replaceAll(' ', '%20');
            url += 'loc_admin_city=' + city + "&";
        }
        if (state) {
            url += 'loc_admin_state=' + state + "&";
        }
        if (insurance_accepted) {
            url += 'insurance_accepted=' + insurance_accepted + "&";
        }
        if (walkins_accepted) {
            url += 'walkins_accepted=' + walkins_accepted + "&";
        }
        if (in_stock) {
            url += 'in_stock=' + in_stock + "&";
        }
        if (offers_mask) {
            url += 'offers_free_masks=' + offers_mask;
        }


        $.getJSON(url, function (data) {
            console.log(data);

            // Global variable to hold Google map markers
            var markers = [];
            // Clear existing markers
            markers.forEach(function (marker) { marker.setMap(null); });
            markers = [];

            data.forEach(function (item) {
                if (item.latitude && item.longitude) {
                    let markerLocation = new google.maps.LatLng(item.latitude, item.longitude);
                    let marker = new google.maps.Marker({
                        position: markerLocation,
                        map: map,
                        title: item.loc_name
                    });
                    // Add click listener to each marker
                    google.maps.event.addListener(marker, 'click', function () {
                         infowindow.setContent(`<p><b>${item.loc_name}</b></p>
                                    <p>
                                    ${item.loc_admin_street1}, 
                                    ${item.loc_admin_city}, 
                                    ${item.loc_admin_state}
                                    </p>
                                    ${item.web_address ? `<p><b>Store details:</b> <a href="${item.web_address}" target="_blank">${item.web_address}</a></p>` : ''}
                                    ${item.pre_screen ? `<p><b>Pre-screen:</b> <a href="${item.pre_screen}" target="_blank">${item.pre_screen}</a></p>` : ''}
                                    <p><b>Provider note:&nbsp</b>${item.provider_notes}</p>`)
                        
                        infowindow.open(map, marker);
                    });
                    markers.push(marker);
                };
            });
            // Initialize DataTable

            // Check if the DataTable instance already exists
            if ($.fn.DataTable.isDataTable('#vaccine-table')) {
                // Destroy the existing table
                $('#vaccine-table').DataTable().clear().destroy();
            }

            // Filter data based on zip code for partial matching
            if (zip) {
                data = data.filter(function (item) {
                    return item.loc_admin_zip && item.loc_admin_zip.startsWith(zip);
                });
            }

            if (dayOfWeek !== null) {
                let dayList = ['sunday_hours', 'monday_hours', 'tuesday_hours', 'wednesday_hours', 'thursday_hours', 'friday_hours', 'saturday_hours'];
                let dayColumn = dayList[dayOfWeek];

                data = data.map(function (item) {
                    return {
                        ...item,
                        opening_hours: item[dayColumn] || 'Not Available'
                    };
                });
            }

            // Initialize DataTables on the table
            $('#vaccine-table').DataTable({
                "data": data, // Pass the fetched data to DataTables
                "columns": [ // Define columns and map them to data object properties
                    { "data": "loc_name" },
                    { "data": "loc_admin_street1" },
                    { "data": "loc_admin_city" },
                    { "data": "loc_admin_state" },
                    { "data": "loc_admin_zip" },
                    {
                        "data": "opening_hours",
                        "defaultContent": "Please select a date"
                    },
                    { "data": "med_name" },
                    {
                        "data": "in_stock",
                        "render": function (data, type, row) {
                            return data ? 'Yes' : 'No';
                        }
                    },
                    {
                        "data": "offers_free_masks",
                        "render": function (data, type, row) {
                            return data ? 'Yes' : 'No';
                        }
                    },
                    {
                        "data": "walkins_accepted",
                        "defaultContent": "Not Available",
                        "render": function (data, type, row) {
                            return data === true ? 'Yes' : data === false ? 'No' : 'Not Available';
                        }
                    },
                    {
                        "data": "insurance_accepted",
                        "defaultContent": "Not Available",
                        "render": function (data, type, row) {
                            return data === true ? 'Yes' : data === false ? 'No' : 'Not Available';
                        }
                    }
                ],
                // DataTables pagination options
                "paging": true,
                "pageLength": 10,
                "lengthChange": true,
                "lengthMenu": [5, 10, 25, 50, 100],
                "searching": true,
                "ordering": true,
                "info": true,

                "initComplete": function (settings, json) {
                    $('#vaccine-table tbody').on('click', 'tr', function () {
                        let data = $('#vaccine-table').DataTable().row(this).data();
                        if (data.latitude && data.longitude) {
                            var location = new google.maps.LatLng(data.latitude, data.longitude);
                            map.setCenter(location); // Set the center of the map
                            map.setZoom(15); // Set the zoom level


                            markers.forEach(function (marker) {
                                if (marker.getPosition().equals(location)) {
                                    infowindow.setContent(`<p><b>${item.loc_name}</b></p>
                                    <p>
                                    ${item.loc_admin_street1}, 
                                    ${item.loc_admin_city}, 
                                    ${item.loc_admin_state}
                                    </p>
                                    ${item.web_address ? `<p><b>Store details:</b> <a href="${item.web_address}" target="_blank">${item.web_address}</a></p>` : ''}
                                    ${item.pre_screen ? `<p><b>Pre-screen:</b> <a href="${item.pre_screen}" target="_blank">${item.pre_screen}</a></p>` : ''}
                                    <p><b>Provider note:&nbsp</b>${item.provider_notes}</p>`)
                        
                        infowindow.open(map, marker);
                                }
                            });

                        } else {
                            alert("Location coordinates not available for this store.");
                        }
                    });
                }
            });

        });

    });
});