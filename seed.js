var mysql	= require("mysql");
var helpers = require("./helpers");
var fs		= require("fs");
var req = require("request");

function loadDB() {
	var rows = fs.readFileSync("fecelections_1.csv").toString().split("\n");
	rows.splice(0, 1); // remove header
	rows.splice(rows.length - 1, 1);
	var data = [];
	rows.forEach(function(row, index) {
		var tmp_rows = row.split("|");
		tmp_rows.forEach(function(t_row, i) {
			tmp_rows[i] = helpers.escapeSQLString(t_row);
		});
		
		//console.log(row);
		
		data.push(tmp_rows);
	});
	return data;
}

function seedDB(connection) {
	var data = loadDB();
	connection.query("SHOW TABLES LIKE 'house_election_2014'", function(error, rows, fields) {
		if (rows[0] != null) {
			connection.query("DROP TABLE house_election_2014");
		}
	
		// create Works table
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
}

module.exports = seedDB;
