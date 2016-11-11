var helpers = {};

var states = {
	"AL" : "Alabama-1",
	"AK" : "Alaska-2",
	"AZ" : "Arizona-4",
	"AR" : "Arkansas-5",
	"CA" : "California-6",
	"CO" : "Colorado-8",
	"CT" : "Connecticut-9",
	"DE" : "Delaware-10",
	"DC" : "District of Columbia-11",
	"FL" : "Florida-12",
	"GA" : "Georgia-13",
	"HI" : "Hawaii-15",
	"ID" : "Idaho-16",
	"IL" : "Illnois-17",
	"IN" : "Indiana-18",
	"IA" : "Iowa-19",
	"KS" : "Kansas-20",
	"KY" : "Kentucky-21",
	"LA" : "Louisiana-22",
	"ME" : "Maine-23",
	"MD" : "Maryland-24",
	"MA" : "Massachussetts-25",
	"MI" : "Michigan-26",
	"MN" : "Minnesota-27",
	"MS" : "Mississippi-28",
	"MO" : "Missouri-29",
	"MT" : "Montana-30",
	"NE" : "Nebraska-31",
	"NV" : "Nevada-32",
	"NH" : "New Hampshire-33",
	"NJ" : "New Jersey-34",
	"NM" : "New Mexico-35",
	"NY" : "New York-36",
	"NC" : "North Carolina-37",
	"ND" : "North Dakota-38",
	"OH" : "Ohio-39",
	"OK" : "Oklahoma-40",
	"OR" : "Oregon-41",
	"PA" : "Pennsylvania-42",
	"RI" : "Rhode Island-44",
	"SC" : "South Carolina-45",
	"SD" : "South Dakota-46",
	"TN" : "Tennesee-47",
	"TX" : "Texas-48",
	"UT" : "Utah-49",
	"VT" : "Vermont-50",
	"VA" : "Virginia-51",
	"WA" : "Washington-53",
	"WV" : "West Virginia-54",
	"WI" : "Wisconsin-55",
	"WY" : "Wyoming-56"
};

var parties = {
	AE: "Americans Elect",
	AFC: "Allen 4 Congress",
	AIP: "American Independent",
	AKI: "Alaskan Independence",
	ALP: "American Labor Party",
	AM: "American Party",
	AMC: "American Constitution Party",
	BBH: "Bullying Breaks Hearts",
	BP: "By Petition",
	BQT: "Bob Quast for Term Limits",
	CIT: "Citizens Party",
	CN: "Change is Needed",
	CON: "Constitution",
	CRV: "Conservative",
	D: "Democratic",
	DCG: "D.C. Statehood Green",
	DFL: "Democratic-Farmer-Labor",
	DNL: "Democratic-Nonpartisan League",
	DRP: "D-R Party",
	EG: "Economic Growth",
	ENI: "Energy Independence",
	FA: "For Americans",
	FEP: "Flourish Every Person",
	FV: "Future.Vision.",
	GOP: "G.O.P. Party",
	GRE: "Green",
	HRP: "Human Rights Party",
	IAP: "Independent American Party",
	IDP: "Independence",
	IGR: "Independent Green",
	IND: "Independent",
	IP: "Independent Party",
	JP: "José Peñalosa",
	LBF: "Libertarian Party of Florida",
	LBR: "Labor",
	LBU: "Liberty Union",
	LIB: "Libertarian",
	LMP: "Legalize Marijuana Party",
	MSC: "Send Mr. Smith",
	MTP: "Mountain",
	N: "Nonpartisan",
	NAF: "Nonaffiliated",
	NLP: "Natural Law Party",
	NNE: "None",
	NOP: "No Party Preference",
	NPA: "No Party Affiliation",
	NUP: "National Union Party",
	OP: "Of The People",
	PAC: "Politicians are Crooks",
	PAF: "Peace and Freedom",
	PC: "Petitioning Candidate",
	PET: "Petition",
	PG: "Pacific Green",
	PRO: "Progressive",
	R: "Republican",
	REF: "Reform",
	SBP: "Stop Boss Politics",
	SC: "Start the Conversation",
	SI: "Seeking Inclusion",
	TN: "911 Truth Needed",
	TRP: "Tax Revolt",
	TVH: "Truth Vision Hope",
	UN: "Unaffiliated",
	UPC: "Unity Party of Colorado",
	UST: "U.S. Taxpayers Party",
	W: "Write-In",
	WDB: "We Deserve Better",
	WF: "Working Families",
	WU: "Wake Up USA",
	WWP: "Work and Wealth Party"
};

helpers.expandStateName = function(stateLetters) {
	return states[stateLetters].split("-")[0];
}

helpers.expandPartyName = function(partyLetters) {
	var t = parties[partyLetters];
	if (!t) {
		t = "Unknown";
	}
	return t;
}

helpers.censusStateNumber = function(stateLetters) {
	var ret_val = -1;
	
	if (states[stateLetters] != null) {
		ret_val = states[stateLetters].split("-")[1];
	}
	
	return ret_val;
}

helpers.stateAB = function(fipsnum) {
	var ret_val = null;
	
	fipsnum = fipsnum.toString();
	if (fipsnum.indexOf("0") == 0) {
		fipsnum = fipsnum[1];
	}
	
	console.log("hi"+fipsnum);
	for (var stateAB in states) {
		if (states[stateAB].search("-" + fipsnum) > -1) {
			ret_val = stateAB;
		};
	}
	console.log(ret_val);
	
	return ret_val;
}

helpers.commify = function(num) {
	return num.toString().replace(/(\d)(?=(\d{3})+$)/g, "$1,");
}

helpers.truncateString = function(str, length) {
	if (str != null && str != "None" && str.length > length) {
		return str.substring(0, length + 3) + "...";
	} else {
		return str;
	}
}

helpers.districtEnding = function(districtNum) {
	var districtWithEnding;
	
	if (districtNum == 1) {
		districtWithEnding = districtNum + "st";
	} else if (districtNum == 2) {
		districtWithEnding = districtNum + "nd";
	} else if (districtNum == 3) {
		districtWithEnding = districtNum + "rd";
	} else if (districtNum >= 4 && districtNum <= 20) {
		districtWithEnding = districtNum + "th";
	} else if (districtNum >= 21) {
		var secondChar = districtNum.toString().charAt(1);
		if (secondChar == "1") {
			districtWithEnding = districtNum + "st";
		} else if (secondChar == "2") {
			districtWithEnding = districtNum + "nd";
		} else if (secondChar == "3") {
			districtWithEnding = districtNum + "rd";
		} else {
			districtWithEnding = districtNum + "th";
		}
	} else {
		districtWithEnding = "At-large";
	}
	
	return districtWithEnding;
}

helpers.escapeSQLString = function(string) {
	var fixed_string = string.split("'").join("''");
	fixed_string = fixed_string.split("\\").join("\\\\");
	//console.log("PRE FIX: " + string);
	//console.log("POST FIX: " + fixed_string);
	return fixed_string;
};

module.exports = helpers;
