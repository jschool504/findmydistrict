var mysql	= require("mysql");
var helpers = require("./helpers");
var fs		= require("fs");
var req = require("request");

var sunKey = "&apikey=9967b44401de43e58a30a6d8ab3fe1c5";

function loadCSV(filename, rd, cd) {
	var rows = fs.readFileSync(filename).toString().split(rd);
	rows.splice(0, 1); // remove header
	rows.splice(rows.length - 1, 1);
	var data = [];
	rows.forEach(function(row, index) {
		var tmp_rows = row.split(cd);
		tmp_rows.forEach(function(t_row, i) {
			tmp_rows[i] = helpers.escapeSQLString(t_row);
		});
		
		//console.log(row);
		
		data.push(tmp_rows);
	});
	return data;
}

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

function seedDB(connection) {
	var statsFields = [];
	connection.query("describe statistics", function(err, rs) {
		
		rs.forEach(function(field) {
			if (field["Field"] != "id" && field["Field"] != "state_id" && field["Field"] != "district_id") {
				statsFields.push(field["Field"]);
			}
		});
		
		
		connection.query("SELECT * FROM states join districts on states.id=state_id", function(err, rows) {
			rows.forEach(function(row) {
				//console.log(row);
				if (helpers.censusStateNumber(row.name) !== -1) {
					req("http://api.census.gov/data/2015/acs1?get=" + reqFields.join(",") + "&for=congressional+district:" + row.number + "&in=state:" + helpers.censusStateNumber(row.name) + "&key=8b984e052c12d4e2e2322af26f46f3a7674aec46", function(i_api_error, i_api_response, i_api_body) {
						var t_acs;
						
						try {
							t_acs = JSON.parse(i_api_body);
						} catch (e) {
							console.log("--" + e);
							console.log(i_api_body);
						}
						
						var acs = [];
						
						t_acs[1].forEach(function(t) {
							if (t) {
								acs.push(t);
							} else {
								acs.push('-1');
							}
						});
						
						var data =	{
										average_earnings: parseInt(acs[0]),
										white_earnings: parseInt(acs[1]),
										black_earnings: parseInt(acs[2]),
										asian_earnings: parseInt(acs[3]),
										native_american_earnings: parseInt(acs[4]),
										pacific_islander_earnings: parseInt(acs[5]),
										other_earnings: parseInt((parseInt(acs[6]) + parseInt(acs[7])) / 2),
										workforce: parseInt(acs[8]),
										unemployed: parseInt(acs[9]),
										minor_population: parseInt(acs[10]),
										assoc_some_college_education: parseInt(acs[11]),
										bachelors_degree: parseInt(acs[12]),
										grad_degree: parseInt(acs[13]),
										no_college_education: parseInt(acs[14]) - (parseInt(acs[11]) + parseInt(acs[12]) + parseInt(acs[13])),
										population: parseInt(acs[14]),
										white_population: parseInt(acs[15]),
										black_population: parseInt(acs[16]),
										native_american_population: parseInt(acs[17]),
										asian_population: parseInt(acs[18]),
										pacific_islander_population: parseInt(acs[19]),
										other_population: parseInt(acs[20]) + parseInt(acs[21])
									};
						/*			
						var query = "INSERT INTO statistics (" + statsFields.join(",") + ",district_id) VALUES ("
						+ data[statsFields[0]]
						+ "," + data[statsFields[1]]
						+ "," + data[statsFields[2]]
						+ "," + data[statsFields[3]]
						+ "," + data[statsFields[4]]
						+ "," + data[statsFields[5]]
						+ "," + data[statsFields[6]]
						+ "," + data[statsFields[7]]
						+ "," + data[statsFields[8]]
						+ "," + data[statsFields[9]]
						+ "," + data[statsFields[10]]
						+ "," + data[statsFields[11]]
						+ "," + data[statsFields[12]]
						+ "," + data[statsFields[13]]
						+ "," + data[statsFields[14]]
						+ "," + data[statsFields[15]]
						+ "," + data[statsFields[16]]
						+ "," + data[statsFields[17]]
						+ "," + data[statsFields[18]]
						+ "," + data[statsFields[19]]
						+ "," + data[statsFields[20]]
						+ "," + row.id
						+ ")";
						*/
						var query = "UPDATE statistics SET other_earnings = " + data.other_earnings + " where statistics.district_id = " + row.id;
						connection.query(query, function(err) {
							if (err) {
								console.log(query);
							}
						});
					});
				}
			});
		});
	});
	/*var electionData = loadCSV("fecelections_1.csv", "\n", "|");
	var fdata = [];
	
	electionData.forEach(function(e) {
		if (e[9] !== "" && e[3] !== "n/a" && e[9] !== "#") {
			if (e[9] == "Unopposed") {
				e[9] = -1;
			}
			fdata.push(e);
		}
	});
	
	//console.log(fdata);
	
	connection.query("SELECT states.name,districts.number,districts.id FROM states JOIN districts ON states.id=state_id JOIN legislators ON districts.id=district_id ORDER BY states.name,districts.number ASC", function(err, rows) {
		rows.forEach(function(row) {
			fdata.forEach(function(candidate) {
				if (candidate[0] == row.name && candidate[2] == row.number) {
					var query = "INSERT INTO candidates (first_name,last_name,year,votes,fec_id,party,district_id) VALUES ("
					+ "'" + candidate[4] + "',"
					+ "'" + candidate[5] + "',"
					+ 2014 + ","
					+ candidate[candidate.length - 1] + ","
					+ "'" + candidate[3] + "',"
					+ "'" + candidate[7] + "',"
					+ row.id + ")";
					connection.query(query, function(err, rows) {
						if (err) {
							console.log("ERROR: " + query);
						} else {
							//console.log(query);
						}
					});
				}
			});
		});
	});
	
	/*
	var reps = legisData.filter(function(l) {
		return l[4] !== "sen";
	});
	
	var states = [];
	
	legisData.forEach(function(l) {
		if (states.indexOf(l[5]) == -1) {
			states.push(l[5]);
		}
	});
	
	/*
	states.forEach(function(state) {
		connection.query("INSERT INTO states (name) VALUES ('" + state + "')", function(err) {
			if (err) {
				console.log(err);
			}
		});
	});
	*/
	/*
	connection.query("SELECT * FROM states", function(err, rows) {
		rows.forEach(function(row) {
			reps.forEach(function(rep) {
				if (rep[5] == row.name) {
					connection.query("INSERT INTO districts (number, state_id) VALUES ('" + rep[6] + "', " + row.id + ")");
				}
			})
		});
	});
	*/
	/*
	connection.query("SELECT * FROM states JOIN districts ON states.id=districts.state_id ORDER BY name,number ASC", function(err, rows) {
		rows.forEach(function(district) {
			legisData.forEach(function(l) {
				if (l[5] == district.name && l[6] == district.number) {
					connection.query("INSERT INTO legislators (first_name,last_name,party,facebook,twitter,website,contact_form,phone,address,district_id) VALUES ("
					+ "'" + l[1] + "'," //first name
					+ "'" + l[0] + "'," //last name
					+ "'" + l[7] + "'," //party
					+ "'" + l[14] + "'," //facebook
					+ "'" + l[13] + "'," //twitter
					+ "'" + l[8] + "'," //website
					+ "'" + l[11] + "'," //contact form
					+ "'" + l[10] + "'," //phone
					+ "'" + l[9] + "'," //address
					+ "'" + district.id + "'" //district_id
					+ ")", function(err) {
						console.log(err);
					});
				}
			});
		});
	});
	*/
}

/*
function seedDB(connection) {
	var data = loadCSV("fecelections_1.csv", "\n", "|");
	
	connection.query("SHOW TABLES LIKE house_election_2014", function(error, rows, fields) {
		if (rows[0] != null) {
			connection.query("DROP TABLE house_election_2014");
		}
	
		// create house_election_2014 table
		connection.query("CREATE TABLE house_election_2014 (id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, state VARCHAR(3), state_name VARCHAR(32), district INT, fec_id VARCHAR(16), candidate_name_first VARCHAR(32), candidate_name_last VARCHAR(32), total_votes VARCHAR(32), party VARCHAR(24), primary_votes VARCHAR(24), general_votes INT)", function(error) {
			// insert new data
			var lastDistrict = 1;
			for (i in data) {
				
				data[i].forEach(function(row, index) {
					if (row == "H" |row == NaN |row == "" |row == "Unopposed" |row == "n/a") {
						
						if (index == 5 |index == 6) {
							data[i][index] = "-1";
						} else if (row == "Unopposed") {
							data[i][index] = "-2";
						} else {
							data[i][index] = "";
						}
					}
				});
				
				var districtNum = data[i][2];
				var primaryNum = data[i][8];
				
				var party = helpers.expandPartyName(data[i][7]);
				
				var query = "INSERT INTO house_election_2014 (state, state_name, district, fec_id, candidate_name_first, candidate_name_last, total_votes, party, primary_votes, general_votes) VALUES (" +
					data[i][0] + ", " +
					"" + data[i][1] + ", " +
					parseInt(districtNum) + ", " +
					"" + data[i][3] + ", " +
					"" + data[i][4] + ", " +
					"" + data[i][5] + ", " +
					"" + data[i][6] + ", " +
					"" + party + ", " + 
					"" + data[i][8] + ", " +
					parseInt(data[i][9]) + ")";
					
					if (error) {
						//console.log(error);
					}
					
				connection.query(query, function(err) {
					if (err !== null) {
						//console.log("Index: " + i);
						//console.log(query);
						//console.log(data[i]);
						//console.log(err);
					}
				});
			}
		});
	});
	
	var legisData = loadCSV("legislators114.csv", "\n", ",");
	console.log(legisData.length);
	
	connection.query("SHOW TABLES LIKE congress114", function(error, rows, fields) {
		if (rows[0] != null) {
			connection.query("DROP TABLE congress114");
		}
		
		// create house_election_2014 table
		connection.query("CREATE TABLE congress114 (id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, state VARCHAR(3), district INT, first_name VARCHAR(32), last_name VARCHAR(32), party VARCHAR(24), type VARCHAR(3), website VARCHAR(512), office VARCHAR(512), phone VARCHAR(14), contact_form VARCHAR(512), facebook_id VARCHAR(256), youtube_id VARCHAR(256), twitter_id VARCHAR(256))", function(error) {
			// insert new data
			for (i in legisData) {
				
				var query = "INSERT INTO congress114 (last_name, first_name, type, state, district, party, website, office, phone, contact_form, facebook_id, youtube_id, twitter_id) VALUES (" +
					legisData[i][0] + ", " +
					"" + legisData[i][1] + ", " +
					"" + legisData[i][4] + ", " +
					"" + legisData[i][5] + ", " +
					"" + legisData[i][6] + ", " +
					"" + legisData[i][7] + ", " +
					"" + legisData[i][8] + ", " +
					"" + legisData[i][9] + ", " +
					"" + legisData[i][10] + ", " +
					"" + legisData[i][11] + ", " +
					"" + legisData[i][14] + ", " +
					"" + legisData[i][16] + ", " +
					"" + legisData[i][13] + ")";
				
					//console.log(query);
				
					if (error) {
						//console.log(error);
					}
				
				connection.query(query, function(err) {
					if (err !== null) {
						console.log("Index: " + i);
						console.log(query);
						console.log(legisData[i]);
						console.log(err);
					}
				});
			}
		});
	});
}
*/
module.exports = seedDB;
