$(function () {
    // add input listeners
    google.maps.event.addDomListener(window, "load", function () {
        var from_places = new google.maps.places.Autocomplete(
            document.getElementById("from_places")
        );
        var to_places = new google.maps.places.Autocomplete(
            document.getElementById("to_places")
        );
        google.maps.event.addListener(from_places, "place_changed", function () {
            var from_place = from_places.getPlace();
            var from_address = from_place.formatted_address;
            $("#origin").val(from_address);
        });
        google.maps.event.addListener(to_places, "place_changed", function () {
            var to_place = to_places.getPlace();
            var to_address = to_place.formatted_address;
            $("#destination").val(to_address);
        });
    });
    // calculate distance
    function calculateDistance() {
        var origin = $('#origin').val();
        var destination = $('#destination').val();
        var service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix(
            {
                origins: [origin],
                destinations: [destination],
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.metric, // kilometers and meters.
                avoidHighways: false,
                avoidTolls: false
            }, callback);
    }
    function callback(response, status) {
        if (status != google.maps.DistanceMatrixStatus.OK) {
            console.log('Google map response: failed!')
        } else {
            var origin = response.originAddresses[0];
            var destination = response.destinationAddresses[0];
            if (response.rows[0].elements[0].status === "ZERO_RESULTS") {
                console.log("There are no roads between " + origin + " and " + destination);
            } else {
                var distance = response.rows[0].elements[0].distance.value;
                var duration = response.rows[0].elements[0].duration.value;
                var companyName = $('#companyName').val();
                var typeOfCargo = $('#typeOfCargo').val();
                var deliveryInstruction = $('#deliveryInstruction').val();
                var specialNote = $('#specialNote').val();

                const payload = {
                    distance,
                    duration,
                    origin,
                    destination,
                    companyName,
                    deliveryInstruction,
                    typeOfCargo,
                    specialNote
                }
                // console.log(JSON.stringify(payload))

                const sendToserver = async (payload) => {
                    const requestUrl = 'http://127.0.0.1:5000/api/v1/orders';
                    try {
                        const res = await axios({
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            url: requestUrl,
                            data: payload
                        });
                        if (res.data.status === "success") {
                            window.alert('Sent to the server!');
                        }
                    } catch (err) {
                        console.log(err)
                    }

                }
                sendToserver(payload)
            }
        }
    }
    $('#distance_form').submit(function (e) {
        e.preventDefault();
        calculateDistance();
    });

});
