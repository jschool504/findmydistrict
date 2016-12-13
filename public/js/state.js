var state_map = document.getElementById("stateMap");

state_map.onload = function() {
	var doc = state_map.contentDocument;
	var districtRequest = new Request("/api/states/" + document.title.split(" |")[0]);
	fetch(districtRequest).then(function(res) {
		return res.json();
	}).then(function(districts) {
		gDistricts = doc.getElementsByTagName("path");
		for (var i = 0; i < gDistricts.length; i++) {
			var gDistrict = gDistricts[i];
			var gDistrictNum = gDistrict.id.split("-")[1];
			if (districts[i].party == "Democrat") {
				gDistrict.style.fill = "rgb(0, 0, 200)";
			} else if (districts[i].party == "Republican") {
				gDistrict.style.fill = "rgb(200, 0, 0)";
			} else {
				gDistrict.style.fill = "#888888";
			}
			
			gDistrict.addEventListener("mouseenter", function(e) {
				e.currentTarget.style.old_fill = e.currentTarget.style.fill;
				var rgb = [];
				e.currentTarget.style.fill.split("(")[1].split(")")[0].split(", ").forEach(function(c) {rgb.push(parseInt(c)+32)});
				e.currentTarget.style.fill = "rgb(" + rgb.join(", ") + ")";
			});
			
			gDistrict.addEventListener("mouseleave", function(e) {
				e.currentTarget.style.fill = e.currentTarget.style.old_fill;
			});
			
			gDistrict.addEventListener("mouseup", function(e) {
				window.location.href = "/states/" + document.title.split(" |")[0] + "/districts/" + e.currentTarget.id.split("-")[1];
			});
		}
	});
}

document.getElementById("stateTitle").textContent = helpers.expandStateName(document.title.split(" |")[0]);

var stateRequest = new Request("/api/states/" + document.title.split(" |")[0]);
fetch(stateRequest).then(function(res) {
	return res.json();
}).then(function(districts) {
	var state_data = districts[0];
	document.getElementById("popLabel").textContent = state_data.population;
	document.getElementById("avgIncomeLabel").textContent = state_data.average_earnings;
	document.getElementById("workforceLabel").textContent = state_data.workforce;
	document.getElementById("votingAgeLabel").textContent = state_data.population - state_data.minor_population;
	document.getElementById("unemploymentLabel").textContent = (state_data.unemployed / state_data.workforce * 100).toFixed(1);
	
	var rc = 0, dc = 0, ivc = 0;
	
	districts.forEach(function(district) {
		if (district.party == "Democrat") {
			dc++;
		} else if (district.party == "Republican") {
			rc++;
		} else {
			ivc++;
		}
	});
	
	document.getElementById("repNumLabel").textContent = rc;
	document.getElementById("demNumLabel").textContent = dc;
	
	document.getElementById("repLabel").textContent = "Republican";
	document.getElementById("demLabel").textContent = "Democrat";
	
	if (rc > 1 || rc == 0) {
		document.getElementById("repLabel").textContent += "s";
	}
	
	if (dc > 1 || dc == 0) {
		document.getElementById("demLabel").textContent += "s";
	}
	
	document.getElementById("repHeaderLabel").style.fontWeight = "bold";
	document.getElementById("popHeaderLabel").style.fontWeight = "bold";
	document.getElementById("empHeaderLabel").style.fontWeight = "bold";
	
	var demo_divs = document.getElementsByClassName("demo_div");
	var gDistricts = state_map.contentDocument.getElementsByTagName("path");
	
	for (var i = 0; i < demo_divs.length; i++) {
		if (demo_divs[i].children[1].id == "popLabel") {
			state.district_data.forEach(function(district) {
				//find corressponding gDistrict
				for (var g = 0; g < gDistricts.length; g++) {
					if ((district.state + "-" + district.district) == gDistricts[g].id) {
						console.log(district);
						g = gDistricts.length; //end loop
					}
				}
			});
		}
	}
	
	// commify any needed numbers
	var commaNums = document.getElementsByClassName("commify");
	for (var i = 0; i < commaNums.length; i++) {
		commaNums[i].textContent = commaNums[i].textContent.replace(/(\d)(?=(\d{3})+$)/g, "$1,");
	}
});
