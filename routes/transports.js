
const router = require("express").Router();
const verify = require("./verifyJWTToken");
const Parcel = require("../model/Parcel");
const Transport = require("../model/Transport");
const axios = require('axios')
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY
// Validate trade
// const { tradeValidation } = require("../validation/tradeValidation");

function getDropoffTime(startTime, tripDuration) {
    return new Date(startTime.getTime() + tripDuration * 60000);
  }
  
function getPrice(extra_distance) {
    return 0.5 * extra_distance + 3;
}

function getDistanceFromResponse(response) {
    const distance = parseInt(
        response.rows[0].elements[0].distance.text.split(' ')[0].replace(",", "")
    );
    console.log(distance);
    return distance;
}


async function getDifferenceInDistance(start_location, end_location, package_start_location, package_end_location) {
  const route_with_package_uri_1 = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${start_location}&destinations=${package_start_location}&key=${GOOGLE_MAPS_API_KEY}`;
  const route_with_package_uri_2 = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${package_start_location}&destinations=${package_end_location}&key=${GOOGLE_MAPS_API_KEY}`;
  const route_with_package_uri_3 = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${package_end_location}&destinations=${end_location}&key=${GOOGLE_MAPS_API_KEY}`;
  const route_without_package_uri = `https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${start_location}&destinations=${end_location}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const [response1, response2, response3, response4] = await Promise.all([
      axios.get(route_with_package_uri_1),
      axios.get(route_with_package_uri_2),
      axios.get(route_with_package_uri_3),
      axios.get(route_without_package_uri)
    ]);

    const data1 = response1.data;
    const data2 = response2.data;
    const data3 = response3.data;
    const data4 = response4.data;

    const route_with_package_distance = getDistanceFromResponse(data1) + getDistanceFromResponse(data2) + getDistanceFromResponse(data3);
    const route_without_package_distance = getDistanceFromResponse(data4);
    console.log("A:", route_with_package_distance);
    console.log("B:", route_without_package_distance);
    return route_with_package_distance - route_without_package_distance;
  } catch (error) {
    console.error(error);
  }
}

router.get("/test", async (req, res) => {
    const start_location = "Beverly+Hills";
    const end_location = "Natural+History+Museum+of+Los+Angeles";
    const package_start = "University+of+California+Los+Angeles"
    const package_end = "Culver+City"
    const google_mapr_uri = `https://maps.googleapis.com/maps/api/directions/json?origin=${start_location}&destination=${end_location}&waypoints=via:${package_start}|via:${package_end}&key=${GOOGLE_MAPS_API_KEY}`
    const data = await axios.get(google_mapr_uri)
    console.log(data)
    const route = data['data']['routes'][0]['overview_polyline']['points']
    // let result = await getDifferenceInDistance("Beverly+Hills", "Natural+History+Museum+of+Los+Angeles", "University+of+California+Los+Angeles", "Culver+City");
    return res.send(route)
})

async function getMatchingPackages() {
    console.log("entered");
    const data = request.get_json();
    const start_location = data['start-location'];
    const end_location = data['end-location'];

    // loop over each package and find the package which required the least change in distance 

    let best_package_info = [null, Infinity]; // [package_id, distance]

    const package_collection = db[PACKAGE_COLLECTION_NAME];
    const cursor = package_collection.find({'status': false});

    for await (const package_document of cursor) {
        const package_id = package_document['_id'];
        const package_start = package_document['start_location'];
        const package_end = package_document['end_location'];

        const total_distance = await getDifferenceInDistance(start_location, end_location, package_start, package_end);
        if (total_distance < best_package_info[1]) {
            best_package_info[0] = package_id;
            best_package_info[1] = total_distance;
        }
    }

    return best_package_info[0];
}


// Accept and Post a transport to the trade table 
router.post("/", verify, async (req, res) => {
    // Validating the Data
    // const { error } = tradeValidation(req.body);
    // if (error) return res.status(400).send(error.details[0].message);

    const details = await Parcel.findById(req.body.parcelId).exec();
    const clientId = details.userId

    const route = [] // TODO: fix

    // Creatng a Transport
    const transport = new Transport({
        transporterId: req.user._id,
        clientId: clientId,
        route: route,
        deliveryStatus: "In Progress",
        price: 10, 
        packageId: req.body.parcelId,
        pickupTime: req.body.pickupTime,
        expectedDropoffTime: req.body.pickupTime
    });

    try {
        const savedTransport = await transport.save();
        res.send( transport );
    } catch (err) {
        res.status(400).send(err);
    }
});

// Get a Parcel by Parcel ID
router.get("/byParcelId", verify, async (req, res) => {
    try {
        let parcelId = req.query.parcelId;
        if (!parcelId) {
            res.status(400).send("Wrong Query Paramaters");
            return;
        }
        const details = await Transport.find({
            parcelId: parcelId,
        }).exec();
        res.send(details);
    } catch (err) {
        res.json({ message: err });
    }
});

// Get a Parcel by ClientId
router.get("/byClientId", verify, async (req, res) => {
    try {
        let clientId = req.query.clientId;
        if (!clientId) {
            res.status(400).send("Wrong Query Paramaters");
            return;
        }
        const details = await Transport.find({
            clientId: clientId,
        }).exec();
        res.send(details);
    } catch (err) {
        res.json({ message: err });
    }
});

// Get a Parcel by Transporter ID
router.get("/byTransporterId", verify, async (req, res) => {
    try {
        let transporterId = req.user._id;
        if (!transporterId) {
            res.status(400).send("Error: User not logged in!");
            return;
        }
        const details = await Transport.find({
            transporterId: transporterId,
        }).exec();

        var parcels = []
        for(let i = 0; i < details.length; i++)
        {
            const parcel = await Parcel.findById(details[i].parcelId);
            parcels.push(parcel);
        }
        res.send(parcels);
    } catch (err) {
        res.json({ message: err });
    }
});

module.exports = router;