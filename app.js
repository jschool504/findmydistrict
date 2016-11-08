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

seedDB(connection);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.locals.districtEnding = helpers.districtEnding;

app.get("/", function(request, response) {
	var state_districts = [];
	
	//console.log("starting sql state req");
	
	connection.query("SELECT DISTINCT state_name,state FROM house_election_2014", function(err, rows) {
		rows.forEach(function(row) {
			connection.query("SELECT DISTINCT district FROM house_election_2014 WHERE state_name LIKE '" + row.state_name + "'", function(err, drows) {
				state_districts.push([row.state_name, row.state, drows.length]);
			});
		});
	});
	
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

		response.render("welcome", {republicans: repCount, democrats: demCount, representatives: reps, states: state_districts, title: "Home"});
	});
});

app.get("/index", function(request, response) {
	connection.query("SELECT DISTINCT state,state_name,district FROM house_election_2014 WHERE district NOT LIKE -1", function(err, election_data) {
		response.render("index", {districts: election_data, title: "Index"});
	});
});

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

app.get("/search", function(request, response){
	req("https://maps.googleapis.com/maps/api/geocode/json?address=" + request.query.address + "&key=AIzaSyBiYt7ndq7vKatzXvUY5FIec14xf6DFfYM", function(api_error, api_response, api_body) {
			if (api_error == null) {
				var resBody = JSON.parse(api_response.body);
				if (resBody.status == "ZERO_RESULTS") { // Check if the address returned a google lat/long result. If not don't bother going any further
					response.render("unknown", {title: "Place Not Found"});
				} else {
				var lat = resBody.results[0].geometry.location.lat;
				var lng = resBody.results[0].geometry.location.lng;
				
				req("https://congress.api.sunlightfoundation.com/districts/locate?latitude=" + lat + "&longitude=" + lng + "&apikey=9967b44401de43e58a30a6d8ab3fe1c5", function(s_api_error, s_api_response, s_api_body) {
					if (s_api_error == null) {
						var answer = JSON.parse(s_api_response.body);
						if (answer.count == 0) { // Check if the coordinates have a representative associated with them
							response.render("unknown", {title: "Location Not Found"});
						} else {
							var stateVar = answer.results[0].state;
							var districtVar = answer.results[0].district;
					
							req("https://congress.api.sunlightfoundation.com/legislators?district=" + answer.results[0].district + "&state=" + stateVar + "&apikey=9967b44401de43e58a30a6d8ab3fe1c5", function(l_api_error, l_api_response, l_api_body) {
								var legInfo = JSON.parse(l_api_body);
								if (legInfo.count == 0) {
									response.render("unknown", {title: "Location Not Found"});
								} else if (legInfo.count > 0) {
									var legArray = legInfo.results[0];
									legArray.t_contact_form = helpers.truncateString(legArray.contact_form, 50); //helpers.truncateString(legArray.contact_form, 41);
									
									var districtQuery = "&for=congressional+district:" + districtVar + "&in";
									if (stateVar == "DC") {
										districtQuery = "&for";
									}
									
									var censusQuery = "http://api.census.gov/data/2015/acs1?get=" + reqFields.join(",") + districtQuery +"=state:" + helpers.censusStateNumber(stateVar) + "&key=8b984e052c12d4e2e2322af26f46f3a7674aec46";
									console.log(censusQuery);
									
									req(censusQuery, function(i_api_error, i_api_response, i_api_body) {
										if (i_api_error == null) {
											var err;
											try {
												var acs = JSON.parse(i_api_response.body);
											} catch (e) {
												err = e;
												console.log(i_api_response.body);
												console.log("Error with response from Census...");
											}
											
											if (err == null) {
												acs[1][6] = parseInt((parseInt(acs[1][6]) + parseInt(acs[1][7]))/2);
										
												for (var i in acs[1]) {
													if (acs[1][i] == null) {
														acs[1][i] = "-";
													} else {
														acs[1][i] = parseInt(acs[1][i]);
													}
												}
										
												var data =	{
																avg_earnings: helpers.commify(acs[1][0].toString()),
																white_earnings: acs[1][1],
																black_earnings: acs[1][2],
																asian_earnings: acs[1][3],
																am_earnings: acs[1][4],
																haw_earnings: acs[1][5],
																other_earnings: parseInt((acs[1][6] + acs[1][7]) / 2),
																total_workforce: acs[1][8],
																unemployed_rate: acs[1][9],
																age_under_18: acs[1][10],
																assoc_edu: (acs[1][11] / acs[1][14] * 100).toFixed(1),
																bach_edu: (acs[1][12] / acs[1][14] * 100).toFixed(1),
																grad_edu: (acs[1][13] / acs[1][14] * 100).toFixed(1),
																non_higher_edu: (((acs[1][14] - (acs[1][11] + acs[1][12] + acs[1][13])) / acs[1][14]) * 100).toFixed(1),
																total_pop: acs[1][14],
																white_percent: (acs[1][15] / acs[1][14] * 100).toFixed(1),
																black_percent: (acs[1][16] / acs[1][14] * 100).toFixed(1),
																am_percent: (acs[1][17] / acs[1][14] * 100).toFixed(1),
																asian_percent: (acs[1][18] / acs[1][14] * 100).toFixed(1),
																haw_percent: (acs[1][19] / acs[1][14] * 100).toFixed(1),
																other_percent: ((acs[1][20] + acs[1][21]) / acs[1][14] * 100).toFixed(1)
															};
										
												fs.appendFile("../searches.log", Date.now() + "," + request.query.address + "," + lat + "," + lng + "\n");
												
												var thing = "SELECT candidate_name_first,candidate_name_last,party,general_votes FROM house_election_2014 WHERE state LIKE '" + stateVar + "' AND district LIKE " + districtVar + " AND general_votes NOT LIKE -1";
												
												connection.query(thing, function(err, election_data) {
													console.log(thing);
													election_data.pop = acs[1][14] - acs[1][10];
													election_data.voted = election_data[election_data.length - 1].general_votes;
													
													response.render("district", {
														state: helpers.expandStateName(stateVar),
														stateName: stateVar,
														district: districtVar,
														englishDistrict: helpers.districtEnding(districtVar),
														representative: legArray,
														data: data,
														election_data: election_data,
														title: (stateVar + " " + districtVar)
													});
												});
											} else {
												response.send("There was an error contacting the Census API. Please report this to contactfindmydistrict@gmail.com");
											}
										}
									});
								} else {
									response.send("There was an error contacting the Sunlight Foundation Legislators API. Please report this to contactfindmydistrict@gmail.com");
								}
							});
						}
					} else {
						response.send("There was an contacting the Sunlight Foundation District API. Please report this to contactfindmydistrict@gmail.com");
					}
				});
			}
		} else {
			response.send("There was an error contacting the Google Maps API. Please report this to contactfindmydistrict@gmail.com");
		}
	});
});

app.get("/district", function(request, response) {
	var info = request.query.q.split("-");
	var stateVar = info[0];
	var districtVar = info[1];

	req("https://congress.api.sunlightfoundation.com/legislators?district=" + districtVar + "&state=" + stateVar + "&apikey=9967b44401de43e58a30a6d8ab3fe1c5", function(l_api_error, l_api_response, l_api_body) {
		var legInfo = JSON.parse(l_api_body).results[0];
		
		if (legInfo == null) {
			legInfo = "Vacant";
		}
		console.log(legInfo);
		var districtQuery = "&for=congressional+district:" + districtVar + "&in";
		if (stateVar == "DC") {
			districtQuery = "&for";
		}
		
		var censusQuery = "http://api.census.gov/data/2015/acs1?get=" + reqFields.join(",") + districtQuery +"=state:" + helpers.censusStateNumber(stateVar) + "&key=8b984e052c12d4e2e2322af26f46f3a7674aec46";
		console.log(censusQuery);
		req(censusQuery, function(i_api_error, i_api_response, i_api_body) {
			if (i_api_error == null) {
				var err;
				try {
					var acs = JSON.parse(i_api_response.body);
				} catch (e) {
					err = e;
					console.log(i_api_response.body);
					console.log("Error with response from Census...");
				}
				
				if (err == null) {
					acs[1][6] = parseInt((parseInt(acs[1][6]) + parseInt(acs[1][7]))/2);
			
					for (var i in acs[1]) {
						if (acs[1][i] == null) {
							acs[1][i] = "-";
						} else {
							acs[1][i] = parseInt(acs[1][i]);
						}
					}
			
					var data =	{
									avg_earnings: helpers.commify(acs[1][0].toString()),
									white_earnings: acs[1][1],
									black_earnings: acs[1][2],
									asian_earnings: acs[1][3],
									am_earnings: acs[1][4],
									haw_earnings: acs[1][5],
									other_earnings: parseInt((acs[1][6] + acs[1][7]) / 2),
									total_workforce: acs[1][8],
									unemployed_rate: acs[1][9],
									age_under_18: acs[1][10],
									assoc_edu: (acs[1][11] / acs[1][14] * 100).toFixed(1),
									bach_edu: (acs[1][12] / acs[1][14] * 100).toFixed(1),
									grad_edu: (acs[1][13] / acs[1][14] * 100).toFixed(1),
									non_higher_edu: (((acs[1][14] - (acs[1][11] + acs[1][12] + acs[1][13])) / acs[1][14]) * 100).toFixed(1),
									total_pop: acs[1][14],
									white_percent: (acs[1][15] / acs[1][14] * 100).toFixed(1),
									black_percent: (acs[1][16] / acs[1][14] * 100).toFixed(1),
									am_percent: (acs[1][17] / acs[1][14] * 100).toFixed(1),
									asian_percent: (acs[1][18] / acs[1][14] * 100).toFixed(1),
									haw_percent: (acs[1][19] / acs[1][14] * 100).toFixed(1),
									other_percent: ((acs[1][20] + acs[1][21]) / acs[1][14] * 100).toFixed(1)
								};
			
					fs.appendFile("../searches.log", Date.now() + "," + request.query.q + "\n");
					
					var thing = "SELECT candidate_name_first,candidate_name_last,party,general_votes FROM house_election_2014 WHERE state LIKE '" + stateVar + "' AND district LIKE " + districtVar + " AND general_votes NOT LIKE -1";
					
					connection.query(thing, function(err, election_data) {
						try {
							election_data.pop = acs[1][14] - acs[1][10];
							election_data.voted = election_data[election_data.length - 1].general_votes;
						} catch (e) {
							console.log(e);
							console.log(election_data);
						}
						
						response.render("district", {
							state: helpers.expandStateName(stateVar),
							stateName: stateVar,
							district: districtVar,
							englishDistrict: helpers.districtEnding(districtVar),
							representative: legInfo,
							data: data,
							election_data: election_data,
							title: (stateVar + " " + districtVar)
						});
					});
				} else {
					response.send("There was an error contacting the Census API. Please report this to contactfindmydistrict@gmail.com");
				}
			}
		});
	});
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

app.listen(80, function() {
	console.log("Listening on port 80...");
});
