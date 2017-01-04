var state_map = document.getElementById("stateMap");

state_map.onload = function() {
	var doc = state_map.contentDocument;
	var districtRequest = new Request("/api/states/" + document.title.split(" |")[0]);
	fetch(districtRequest).then(function(res) {
		return res.json();
	}).then(function(districts) {
		gDistricts = doc.getElementsByTagName("path");
		for (var i = 0; i < districts.length; i++) {
			var gDistrict = gDistricts[i];
			var gDistrictNum = gDistrict.id.split("-")[1];
			if (districts[i].party == "Democrat") {
				gDistrict.style.fill = "rgb(0, 0, 200)";
			} else if (districts[i].party == "Republican") {
				gDistrict.style.fill = "rgb(200, 0, 0)";
			} else {
				gDistrict.style.fill = "#888888";
			}
			
			gDistrict.orig_color = gDistrict.style.fill;
			
			gDistrict.addEventListener("mouseover", function(e) {
				var rgb = [];
				e.currentTarget.style.fill.split("(")[1].split(")")[0].split(", ").forEach(function(c) {rgb.push(parseInt(c)+32)});
				e.currentTarget.style.fill = "rgb(" + rgb.join(", ") + ")";
			});
			
			gDistrict.addEventListener("mouseout", function(e) {
				e.currentTarget.style.fill = e.currentTarget.orig_color;
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
	document.getElementById("popLabel").parentElement.addEventListener("mouseover", function(e) {
		var gDistricts = state_map.contentDocument.getElementsByTagName("path");
		var districtRequest = new Request("/api/states/" + document.title.split(" |")[0] + "/districts");
		fetch(districtRequest).then(function(res) {
			return res.json();
		}).then(function(district_data) {
			var demo_divs = document.getElementsByClassName("demo_div");
		
			for (var i = 0; i < demo_divs.length; i++) {
				if (demo_divs[i].children[1].id == "popLabel") {
					district_data.forEach(function(district) {
						//find corressponding gDistrict
						for (var g = 0; g < gDistricts.length; g++) {
							if ((district.name + "-" + district.number) == gDistricts[g].id) {
								var color = 0;
								if (district.population < 600000) {
									color = 225;
								} else if (district.population < 650000) {
									color = 205;
								} else if (district.population < 700000) {
									color = 185;
								} else if (district.population < 750000) {
									color = 165;
								} else if (district.population < 800000) {
									color = 145;
								} else if (district.population < 850000) {
									color = 125;
								} else {
									color = 100;
								}
								
								console.log(parseInt(((district.population/1000)*2)-700));
								gDistricts[g].style.fill = "rgb(" + parseInt(((district.population/1000)*2)-1400) + ", " + parseInt(((district.population/1000)*2)-1400) + ", " + parseInt(((district.population/1000)*2)-1400) + ")";
							
								g = gDistricts.length; //end loop
							}
						}
					});
				}
			}
		});
	});
	
	document.getElementById("avgIncomeLabel").textContent = state_data.average_earnings;
	
	document.getElementById("workforceLabel").textContent = state_data.workforce;
	document.getElementById("workforceLabel").parentElement.addEventListener("mouseover", function(e) {
		var gDistricts = state_map.contentDocument.getElementsByTagName("path");
		var districtRequest = new Request("/api/states/" + document.title.split(" |")[0] + "/districts");
		fetch(districtRequest).then(function(res) {
			return res.json();
		}).then(function(district_data) {
			var demo_divs = document.getElementsByClassName("demo_div");
		
			for (var i = 0; i < demo_divs.length; i++) {
				district_data.forEach(function(district) {
					//find corressponding gDistrict
					for (var g = 0; g < gDistricts.length; g++) {
						if ((district.name + "-" + district.number) == gDistricts[g].id) {
							gDistricts[g].style.fill = "rgb(" + parseInt(((district.workforce/1000)*2)-600) + ", " + parseInt(((district.workforce/1000)*2)-600) + ", 0)";
						
							g = gDistricts.length; //end loop
						}
					}
				});
			}
		});
	});
	
	document.getElementById("votingAgeLabel").textContent = state_data.population - state_data.minor_population;
	document.getElementById("votingAgeLabel").parentElement.addEventListener("mouseover", function(e) {
		var gDistricts = state_map.contentDocument.getElementsByTagName("path");
		var districtRequest = new Request("/api/states/" + document.title.split(" |")[0] + "/districts");
		fetch(districtRequest).then(function(res) {
			return res.json();
		}).then(function(district_data) {
			var demo_divs = document.getElementsByClassName("demo_div");
		
			for (var i = 0; i < demo_divs.length; i++) {
				if (demo_divs[i].children[1].id == "popLabel") {
					district_data.forEach(function(district) {
						//find corressponding gDistrict
						for (var g = 0; g < gDistricts.length; g++) {
							if ((district.name + "-" + district.number) == gDistricts[g].id) {
								var d_pop_percent = ((710000 - district.population) / 710000);
								if (Math.abs(d_pop_percent) <= 0.01) {
									gDistricts[g].style.fill = "rgb(0, 215, 0)";
									//gDistricts[g].style.fill = "rgb("+ parseInt(-d_pop_percent * 2800) + ", 0, 0)";
								} else if (Math.abs(d_pop_percent) <= 0.05) {
									gDistricts[g].style.fill = "rgb(0, 160, 0)";
								} else if (Math.abs(d_pop_percent) <= 0.1) {
									gDistricts[g].style.fill = "rgb(160, 0, 0)";
								} else {
									gDistricts[g].style.fill = "rgb(215, 0, 0)";
								}
							
								g = gDistricts.length; //end loop
							}
						}
					});
				}
			}
		});
	});
	
	document.getElementById("unemploymentLabel").textContent = (state_data.unemployed / state_data.workforce * 100).toFixed(1);
	document.getElementById("unemploymentLabel").parentElement.addEventListener("mouseover", function(e) {
		var gDistricts = state_map.contentDocument.getElementsByTagName("path");
		var districtRequest = new Request("/api/states/" + document.title.split(" |")[0] + "/districts");
		fetch(districtRequest).then(function(res) {
			return res.json();
		}).then(function(district_data) {
			var demo_divs = document.getElementsByClassName("demo_div");
		
			for (var i = 0; i < demo_divs.length; i++) {
				if (demo_divs[i].children[1].id == "popLabel") {
					district_data.forEach(function(district) {
						//find corressponding gDistrict
						for (var g = 0; g < gDistricts.length; g++) {
							if ((district.name + "-" + district.number) == gDistricts[g].id) {
								var color = parseInt((district.unemployed / district.workforce) * 2000);
								console.log(color);
								gDistricts[g].style.fill = "rgb(" + color + ", 0, 0)";
							
								g = gDistricts.length; //end loop
							}
						}
					});
				}
			}
		});
	});
	
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
	
	var elements = document.getElementsByClassName("demo_div");
	for (var e = 0; e < elements.length; e++) {
		elements[e].addEventListener("mouseout", function(e) {
			for (var g = 0; g < gDistricts.length; g++) {
				gDistricts[g].style.fill = gDistricts[g].orig_color;
			}
		});
	}
	
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
