var express = require("express");
var bodyParser = require("body-parser");
var req = require("request");
var marked = require("marked");

var fs = require("fs");
var app = express();

var helpers = require("./helpers");

var db = require("./models/db");
var seedDB = require("./seed");
db.createConnection();
var connection = db.getConnection();

seedDB(connection);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get("/", function(request, response) {
	req("https://www.govtrack.us/api/v2/role?role_type=representative&limit=450", function(s_api_error, s_api_response, s_api_body) {
		var resBody = JSON.parse(s_api_body);
		var reps = resBody.objects;
		
		var repCount = 0;
		var demCount = 0;
		
		for (i in reps) {
			if (reps[i].party == "Democrat") {
				demCount += 1;
			} else if (reps[i].party == "Republican") {
				repCount += 1;
			}
		}
		
		response.render("welcome", {republicans: repCount, democrats: demCount, title: "Home"});
	});
});

app.get("/search", function(request, response){
	req("https://maps.googleapis.com/maps/api/geocode/json?address=" + request.query.address + "&key=AIzaSyBiYt7ndq7vKatzXvUY5FIec14xf6DFfYM", function(api_error, api_response, api_body) {
			if (api_error == null) {
				var resBody = JSON.parse(api_response.body);
				if (resBody.status == "ZERO_RESULTS") { // Check if the address returned a google lat/long result. If not don't bother going any further
					response.render("unknown");
				} else {
				var lat = resBody.results[0].geometry.location.lat;
				var lng = resBody.results[0].geometry.location.lng;
			
				req("https://congress.api.sunlightfoundation.com/districts/locate?latitude=" + lat + "&longitude=" + lng + "&apikey=9967b44401de43e58a30a6d8ab3fe1c5", function(s_api_error, s_api_response, s_api_body) {
					if (s_api_error == null) {
						var answer = JSON.parse(s_api_response.body);
						if (answer.count == 0) { // Check if the coordinates have a representative associated with them
							response.render("unknown");
						} else {
							var stateVar = answer.results[0].state;
							var districtVar = answer.results[0].district;
					
							req("https://congress.api.sunlightfoundation.com/legislators?district=" + districtVar + "&state=" + stateVar + "&apikey=9967b44401de43e58a30a6d8ab3fe1c5", function(l_api_error, l_api_response, l_api_body) {
								var legInfo = JSON.parse(l_api_body);
								if (legInfo.count == 0) {
									response.render("unknown");
								} else if (legInfo.count > 0) {
									var legArray = legInfo.results[0];
									legArray.t_contact_form = helpers.truncateString(legArray.contact_form, 50); //helpers.truncateString(legArray.contact_form, 41);
									
									var reqFields = [
										"B08121_001E",	// 00. avg earnings
										"B20017A_001E",	// 01. white earnings
										"B20017B_001E",	// 02. black earnings
										"B20017D_001E",	// 03. asian earnings
										"B20017C_001E",	// 04. ntv am earnings
										"B20017E_001E",	// 05. ntv haw earnings
										"B20017F_001E",	// 06. other (1) earnings
										"B20017G_001E",	// 07. other (2+) earnings
										
										"B28007_002E",	// 08. total workforce
										"B28007_009E",	// 09. unemployed
										
										"B09021_008E",	// 10. 18-34
										"B09021_015E",	// 11. 35-64
										"B09021_022E",	// 12. 65+
										"B09001_001E",	// 13. under 18
										
										"B06009_004E",	// 14. assoc/some college
										"B06009_005E",	// 15. bachelor's
										"B06009_006E",	// 16. master/phd
										
										"B01003_001E",	// 17. total pop
										"B02001_002E",	// 18. white pop
										"B02001_003E",	// 19. black pop
										"B02001_004E",	// 20. ntv am income
										"B02001_005E",	// 21. asian income
										"B02001_006E",	// 22. ntv haw income
										"B02001_007E",	// 23. other (1) pop
										"B02001_008E"	// 24. other (2+) pop
									];
									
									req("http://api.census.gov/data/2015/acs1?get=" + reqFields.join(",") + "&for=congressional+district:" + districtVar + "&in=state:" + helpers.censusStateNumber(stateVar) + "&key=8b984e052c12d4e2e2322af26f46f3a7674aec46", function(i_api_error, i_api_response, i_api_body) {
										if (i_api_error == null) {
											var err;
											try {
												var acs = JSON.parse(i_api_response.body);
											} catch (e) {
												err = e;
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
																white_earnings: helpers.commify(acs[1][1].toString()),
																black_earnings: helpers.commify(acs[1][2].toString()),
																asian_earnings: helpers.commify(acs[1][3].toString()),
																am_earnings: helpers.commify(acs[1][4].toString()),
																haw_earnings: helpers.commify(acs[1][5].toString()),
																other_earnings: helpers.commify(parseInt((acs[1][6] + acs[1][7]) / 2).toString()),
																unemployed_rate: (acs[1][9] / acs[1][8] * 100).toFixed(1),
																age_1834: (acs[1][10] / acs[1][17] * 100).toFixed(1),
																age_3564: (acs[1][11] / acs[1][17] * 100).toFixed(1),
																age_over_65: (acs[1][12] / acs[1][17] * 100).toFixed(1),
																age_under_18: (acs[1][13] / acs[1][17] * 100).toFixed(1),
																assoc_edu: (acs[1][14] / acs[1][17] * 100).toFixed(1),
																bach_edu: (acs[1][15] / acs[1][17] * 100).toFixed(1),
																grad_edu: (acs[1][16] / acs[1][17] * 100).toFixed(1),
																higher_edu: ((acs[1][14] + acs[1][15] + acs[1][16]) / acs[1][17] * 100).toFixed(1),
																total_pop: helpers.commify(acs[1][17]),
																white_percent: (acs[1][18] / acs[1][17] * 100).toFixed(1),
																black_percent: (acs[1][19] / acs[1][17] * 100).toFixed(1),
																am_percent: (acs[1][20] / acs[1][17] * 100).toFixed(1),
																asian_percent: (acs[1][21] / acs[1][17] * 100).toFixed(1),
																haw_percent: (acs[1][22] / acs[1][17] * 100).toFixed(1),
																other_percent: ((acs[1][23] + acs[1][24]) / acs[1][17] * 100).toFixed(1)
															};
										
												fs.appendFile("../searches.log", Date.now() + "," + request.query.address + "," + lat + "," + lng + "\n");
												
												var thing = "SELECT party,general_votes FROM house_election_2014 WHERE state LIKE '" + stateVar + "' AND district LIKE " + districtVar + " AND ((party NOT LIKE '') OR total_votes LIKE 'District Votes:')";
												
												connection.query(thing, function(err, election_data) {
													election_data.pop = acs[1][17] - acs[1][13];
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
												response.send("There was an error contacting the Sunlight Foundation Legislators API. Please report this to contactfindmydistrict@gmail.com");
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
