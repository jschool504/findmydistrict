var state_map = document.getElementById("stateMap");

state_map.onload = function() {
	var doc = state_map.contentDocument;
	var districtRequest = new Request("/api/states/" + document.title.split(" |")[0] + "/districts");
	fetch(districtRequest).then(function(res) {
		return res.json();
	}).then(function(districts) {
		gDistricts = doc.getElementsByTagName("path");
		for (var i = 0; i < gDistricts.length; i++) {
			var gDistrict = gDistricts[i];
			var gDistrictNum = gDistrict.id.split("-")[1];
			console.log(districts);
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
}).then(function(state) {
	document.getElementById("popLabel").textContent = state.state_data.total_pop;
	document.getElementById("avgIncomeLabel").textContent = state.state_data.avg_earnings;
	document.getElementById("workforceLabel").textContent = state.state_data.total_workforce;
	document.getElementById("votingAgeLabel").textContent = state.state_data.total_pop - state.state_data.age_under_18;
	document.getElementById("unemploymentLabel").textContent = (state.state_data.unemployed_rate / state.state_data.total_workforce * 100).toFixed(1);
	
	var rc = 0, dc = 0, ivc = 0;
	
	state.district_data.forEach(function(district) {
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
	
	// commify any needed numbers
	var commaNums = document.getElementsByClassName("commify");
	for (var i = 0; i < commaNums.length; i++) {
		commaNums[i].textContent = commaNums[i].textContent.replace(/(\d)(?=(\d{3})+$)/g, "$1,");
	}
});
