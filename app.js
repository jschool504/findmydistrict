var express = require("express");
var bodyParser = require("body-parser");
var req = require("request");
var marked = require("marked");
var expState = require("express-state");
var async = require("async");

var fs = require("fs");
var app = express();
expState.extend(app);

var helpers = require("./helpers");

var db = require("./models/db");
var seedDB = require("./seed");
db.createConnection();
var connection = db.getConnection();

//seedDB(connection);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.locals.districtEnding = helpers.districtEnding;
app.locals.expandStateName = helpers.expandStateName;

// Fields for census api request
var reqFields = [
	"B08121_001E",	// 00. avg earnings
	"B20017A_001E",	// 01. white earnings
	"B20017B_001E",	// 02. black earnings
	"B20017D_001E",	// 03. asian earnings
	"B20017C_001E",	// 04. ntv am earnings
	"B20017E_001E",	// 05. ntv haw earnings
	"B20017F_001E",	// 06. other (1) earnings
	"B20017G_001E",	// 07. other (2+) earnings
	
	"B23025_003E",	// 08. total workforce
	"B23025_005E",	// 09. unemployed
	
	"B09001_001E",	// 10. under 18
	
	"B16010_028E",	// 11. assoc/some college
	"B16010_041E",	// 12. bachelor's
	"B06009_006E",	// 13. master/phd
	
	"B01003_001E",	// 14. total pop
	"B02001_002E",	// 15. white pop
	"B02001_003E",	// 16. black pop
	"B02001_004E",	// 17. ntv am pop
	"B02001_005E",	// 18. asian pop
	"B02001_006E",	// 19. ntv haw pop
	"B02001_007E",	// 20. other (1) pop
	"B02001_008E"	// 21. other (2+) pop
];

function renderDistrict(d, request, response) {
	connection.query("select * from districts join states on districts.state_id=states.id join legislators on districts.id=legislators.district_id join statistics on districts.id=statistics.district_id WHERE states.name = '" + d[0] + "' AND districts.number = " + d[1], function(err, data) {
		if (err == null) {
			console.log(data);
			response.render("district", {
				district_data: data[0],
				title: (d[0] + " " + d[1])
			});
		} else {
			console.log(err);
		}
	});
}

app.get("/", function(request, response) {
	
	connection.query("SELECT states.name,legislators.party FROM states join districts on districts.state_id=states.id join legislators on legislators.district_id=districts.id", function(err, rows) {
	
		req("https://www.govtrack.us/api/v2/role?role_type=representative&current=true&limit=6000", function(s_api_error, s_api_response, s_api_body) {
			var resBody = JSON.parse(s_api_body);
			var reps = resBody.objects;
			reps.sort(function(a, b) {
				var x = a.state.toLowerCase();
				var y = b.state.toLowerCase();
				return x < y ? - 1 : x > y ? 1 : 0;
			});

			var repCount = 0;
			var demCount = 0;

			for (i in reps) {
				if (reps[i].party == "Democrat" && reps[i].state !== "VI" && reps[i].state !== "DC") {
					demCount += 1;
				} else if (reps[i].party == "Republican" && reps[i].state !== "VI" && reps[i].state !== "DC") {
					repCount += 1;
				}
			}

			response.render("welcome", {republicans: repCount, democrats: demCount, representatives: reps, states: rows[0], title: "Home"});
		});
	});
});

app.get("/index", function(request, response) {
	connection.query("SELECT DISTINCT state,state_name,district FROM house_election_2014 WHERE district NOT LIKE -1", function(err, election_data) {
		response.render("index", {districts: election_data, title: "Index"});
	});
});

app.get("/search", function(request, response){
	req("https://maps.googleapis.com/maps/api/geocode/json?address=" + request.query.address + "&key=AIzaSyBiYt7ndq7vKatzXvUY5FIec14xf6DFfYM", function(api_error, api_response, api_body) {
			if (api_error == null) {
				var resBody = JSON.parse(api_response.body);
				if (resBody.status == "ZERO_RESULTS") { // Check if the address returned a google lat/long result. If not don't bother going any further
					response.render("unknown", {title: "Place Not Found"});
				} else {
				var coords = {
					lat: resBody.results[0].geometry.location.lat,
					lng: resBody.results[0].geometry.location.lng
				};
				
				connection.query("SELECT * FROM tl_2015_us_cd114 WHERE ST_CONTAINS(tl_2015_us_cd114.SHAPE, Point(" + coords.lng + ", " + coords.lat + "))", function(err, rows) {
					if (rows[0] !== undefined) {
						renderDistrict([helpers.stateAB(rows[0].statefp), parseInt(rows[0].cd114fp), parseInt(rows[0].statefp)], request, response);
					} else {
						response.render("unknown", {title: "Place Not Found"});
					}
				});
			}
		} else {
			response.send("There was an error contacting the Google Maps API. Please report this to contactfindmydistrict@gmail.com");
		}
	});
});

app.get("/states/:name/districts/:num", function(request, response) {
	renderDistrict([request.params.name, request.params.num, helpers.censusStateNumber(request.params.name)], request, response);
});

app.get("/states/:name", function(request, response) {
	if (helpers.censusStateNumber(request.params.name) !== -1) {
		response.render("state", {title: request.params.name});
	} else {
		response.render("unknown", {title: "Place Not Found"});
	}
});

app.get("/district", function(request, response) {
	var district = request.query.q.split("-");
	district.push(helpers.censusStateNumber(district[0]));
	console.log(district);
	
	renderDistrict(district, request, response);
});

app.get("/about", function(request, response) {
	response.render("about", {title: "About"});
});

app.get("/speaker", function(request, response) {
	response.render("article", {content: marked(fs.readFileSync("public/articles/speaker.md").toString()), title: "Speaker of the House"});
});

app.get("/committees", function(request, response) {
	response.render("article", {content: marked(fs.readFileSync("public/articles/committees.md").toString()), title: "House Committees"});
});

app.get("/atlarge", function(request, response) {
	response.render("article", {content: marked(fs.readFileSync("public/articles/atlarge.md").toString()), title: "At Large"});
});

app.get("/sitemap.xml", function(request, response) {
	var map = fs.readFileSync("sitemap.xml").toString();
	response.send(map);
});

//api

app.get("/api/states/:name/districts/:num", function(request, response) {
	var district_query = "SELECT * FROM congress114 WHERE type LIKE 'rep' AND state LIKE '" + request.params.name + "' AND district LIKE " + request.params.num;

	connection.query(district_query, function(err, rows) {
		response.send(rows[0]);
	});
});

app.get("/api/states/:name/districts", function(request, response) {
	var district_query = "SELECT * FROM congress114 WHERE type LIKE 'rep' AND state LIKE '" + request.params.name + "' ORDER BY district ASC";

	connection.query(district_query, function(err, rows) {
		response.send(rows);
	});
});

app.get("/api/states", function(request, response) {
	var state_query = "SELECT * FROM states JOIN districts ON districts.state_id=states.id JOIN legislators ON legislators.district_id=districts.id JOIN statistics ON statistics.state_id=states.id";

	connection.query(state_query, function(err, rows) {
		
		var state_districts = []; // form [[state,rcount,dcount],[state,rcount,dcount], ...]
		
		rows.forEach(function(res_district) {
			// search for state name in state_districts
			var l = state_districts.length;
			var foundState = false;
			for (var i = 0; i < l && foundState == false; i++) {
				var state = state_districts[i];
				if (state.name == res_district.name) {
					if (res_district.party == "Republican") {
						state.reps++;
					} else if (res_district.party == "Democrat") {
						state.dems++;
					}
					foundState = true;
				}
			}
			
			if (foundState == false) {
				if (res_district.party == "Republican") {
					state_districts.push({name: res_district.name, reps: 1, dems: 0});
				} else if (res_district.party == "Democrat") {
					state_districts.push({name: res_district.name, reps: 0, dems: 1});
				}
			}
		});
		
		response.send(state_districts);
	});
});

app.get("/api/states/:name", function(request, response) {
	
	var state_query = "SELECT * FROM states JOIN districts ON states.id=districts.state_id JOIN legislators ON districts.id=legislators.district_id JOIN statistics ON states.id=statistics.state_id WHERE states.name = '" + request.params.name.toUpperCase() + "' ORDER BY districts.number ASC";
	
	connection.query(state_query, function(err, rows) {
		response.send(rows);
	});
});

app.listen(80, function() {
	console.log("Listening on port 80...");
});
