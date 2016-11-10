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

function seedDB(connection) {
	var data = loadCSV("fecelections_1.csv", "\n", "|");
	
	connection.query("SHOW TABLES LIKE 'house_election_2014'", function(error, rows, fields) {
		if (rows[0] != null) {
			connection.query("DROP TABLE house_election_2014");
		}
	
		// create house_election_2014 table
		connection.query("CREATE TABLE house_election_2014 (id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, state VARCHAR(3), state_name VARCHAR(32), district INT, fec_id VARCHAR(16), candidate_name_first VARCHAR(32), candidate_name_last VARCHAR(32), total_votes VARCHAR(32), party VARCHAR(24), primary_votes VARCHAR(24), general_votes INT)", function(error) {
			// insert new data
			var lastDistrict = 1;
			for (i in data) {
				
				data[i].forEach(function(row, index) {
					if (row == "H" || row == NaN || row == "" || row == "Unopposed" || row == "n/a") {
						
						if (index == 5 || index == 6) {
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
				
				var query = "INSERT INTO house_election_2014 (state, state_name, district, fec_id, candidate_name_first, candidate_name_last, total_votes, party, primary_votes, general_votes) VALUES ('" +
					data[i][0] + "', " +
					"'" + data[i][1] + "', " +
					parseInt(districtNum) + ", " +
					"'" + data[i][3] + "', " +
					"'" + data[i][4] + "', " +
					"'" + data[i][5] + "', " +
					"'" + data[i][6] + "', " +
					"'" + party + "', " + 
					"'" + data[i][8] + "', " +
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
	
	connection.query("SHOW TABLES LIKE 'congress114'", function(error, rows, fields) {
		if (rows[0] != null) {
			connection.query("DROP TABLE congress114");
		}
		
		// create house_election_2014 table
		connection.query("CREATE TABLE congress114 (id INT PRIMARY KEY AUTO_INCREMENT NOT NULL, state VARCHAR(3), district INT, first_name VARCHAR(32), last_name VARCHAR(32), party VARCHAR(24), type VARCHAR(3), website VARCHAR(512), office VARCHAR(512), phone VARCHAR(14), contact_form VARCHAR(512), facebook_id VARCHAR(256), youtube_id VARCHAR(256), twitter_id VARCHAR(256))", function(error) {
			// insert new data
			for (i in legisData) {
				
				var query = "INSERT INTO congress114 (last_name, first_name, type, state, district, party, website, office, phone, contact_form, facebook_id, youtube_id, twitter_id) VALUES ('" +
					legisData[i][0] + "', " +
					"'" + legisData[i][1] + "', " +
					"'" + legisData[i][4] + "', " +
					"'" + legisData[i][5] + "', " +
					"'" + legisData[i][6] + "', " +
					"'" + legisData[i][7] + "', " +
					"'" + legisData[i][8] + "', " +
					"'" + legisData[i][9] + "', " +
					"'" + legisData[i][10] + "', " +
					"'" + legisData[i][11] + "', " +
					"'" + legisData[i][14] + "', " +
					"'" + legisData[i][16] + "', " +
					"'" + legisData[i][13] + "')";
				
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

module.exports = seedDB;
