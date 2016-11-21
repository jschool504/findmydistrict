var mysql = require("mysql");
var seedDB = require("../seed.js");

var connection;

module.exports = {
	getConnection: function() {
		return connection
	},
	createConnection: function() {
		connection = mysql.createConnection({
			host: "localhost",
			user: "root",
			password: "Jeremydelta5",
			database: "congressional_districts"
		});
	}
};
