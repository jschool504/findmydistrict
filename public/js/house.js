var us_map = document.getElementById("usMap");

us_map.onload = function() {
	var doc = us_map.contentDocument;
	var stateRequest = new Request("/api/states/");
	fetch(stateRequest).then(function(res) {
		return res.json();
	}).then(function(response) {
		
		var stateRatios = {};
		
		var gStates = doc.getElementsByClassName("state");
		for (var i = 0; i < gStates.length; i++) {
			var gState = gStates[i];
			
			var d_ratio = 0.0, r_ratio = 0.0;
			var dc = 0, rc = 0;
			
			response.forEach(function(d) {
				if (d.state == gState.id) {
			
					if (d.state !== "GU" && d.state !== "VI" && d.state !== "PR" && d.state !== "MP") {
						if (d.party == "Democrat") {
							dc += 1;
						} else if (d.party == "Republican") {
							rc += 1;
						}
					}
				}
			});
			
			d_color = 210 * (dc / (rc + dc));
			r_color = 210 * (rc / (rc + dc));
			gState.style.fill = "rgb(" + parseInt(r_color) + ", 0, " + parseInt(d_color) + ")";
			gState.style.strokeWidth = "1px";
			gState.style.strokeOpacity = "1";
			gState.style.stroke = "#fff";
			
			gState.addEventListener("mouseleave", function(e) {
				e.currentTarget.style.fill = e.currentTarget.style.old_fill;
				e.currentTarget.style.transform = "scale(1)";
			});
			
			gState.addEventListener("mouseenter", function(e) {
				
				e.currentTarget.style.old_fill = e.currentTarget.style.fill;
				var rgb = [];
				e.currentTarget.style.fill.split("(")[1].split(")")[0].split(", ").forEach(function(c) {rgb.push(parseInt(c)+32)});
				e.currentTarget.style.fill = "rgb(" + rgb.join(", ") + ")";
				
				//e.currentTarget.style.transform = "scale(1.2)";
				var svg = e.currentTarget.parentNode;
				//svg.removeChild(e.currentTarget);
				//svg.appendChild(e.currentTarget);
			});
			
			gState.addEventListener("mouseup", function(e) {
				window.location.href = "/states/" + e.currentTarget.id;
			});
		}
	});
}

Chart.defaults.global.legend.display = false;

var repCtx = document.getElementById("repCanvas");

var repData = [247, 188];

var rcds = [{data: repData, backgroundColor: ["#e00", "#00e"], hoverBackgroundColor: ["#f00", "#00f"], borderColor: "#fff", borderWidth: 2}];
var rcdt = {labels: ["Republicans", "Democrats"], datasets: rcds};
var repOpt = {animation: false};

var rep_canvas = new Chart(repCtx, {type: "doughnut", data: rcdt, options: repOpt});

/*
us_map.onload = function() {
	var doc = us_map.contentDocument;
	
	var repStateElements = document.getElementsByClassName("state datum");
	var states = Array.prototype.slice.call(repStateElements);

	states.forEach(function(state, i) {
	
		var districts = Array.prototype.slice.call(state.parentElement.children[1].children);
	
		districts.forEach(function(district) {
			var district_name = district.children[0].textContent;
			if (district_name != "VI-0") {
				var district_party = district.children[1].textContent;
				//var district_pop = parseInt(((parseInt(district.children[2].textContent) - 500000) / 500000) * 60);
				
				var map_district = doc.getElementById(district_name);
				
				if (district_party == "Democrat") {
					map_district.style.fill = "rgb(68, 68, 221)";
				} else if (district_party == "Republican") {
					map_district.style.fill = "rgb(221, 68, 68)";
				} else {
					map_district.style.fill = "#888888";
				}
				
				map_district.addEventListener("mouseenter", function(e) {
					e.currentTarget.style.old_fill = e.currentTarget.style.fill;
					var rgb = [];
					e.currentTarget.style.fill.split("(")[1].split(")")[0].split(", ").forEach(function(c) {rgb.push(parseInt(c)+32)});
					e.currentTarget.style.fill = "rgb(" + rgb.join(", ") + ")";
					var svg = e.currentTarget.parentNode;
					svg.removeChild(e.currentTarget);
					svg.appendChild(e.currentTarget);
					var c_width = e.currentTarget.getBoundingClientRect().width;
					var c_height = e.currentTarget.getBoundingClientRect().height
					var scaleAmount = 1;
					if (c_width > 96 || c_height > 96) {
						scaleAmount = 1.1;
					} else if (c_width > 48 || c_height > 48) {
						scaleAmount = 1.2;
					} else if (c_width > 32 || c_height > 32) {
						scaleAmount = 1.3;
					} else if (c_width > 24 || c_height > 24) {
						scaleAmount = 1.4;
					} else if (c_width > 12 || c_height > 12) {
						scaleAmount = 1.5;
					} else {
						scaleAmount = 1.6;
					}
					
					//console.log([c_width, ((0.0005 * (c_width ^ 2)) + 15),  scaleAmount].join(", "));
					e.currentTarget.style.transform = "scale(" + scaleAmount + ")";
					var p = document.createElement("p");
					p.textContent = e.currentTarget.id;
					//console.log(p.textContent);
					e.currentTarget.appendChild(p);
				});
				
				map_district.addEventListener("mouseleave", function(e) {
					e.currentTarget.style.fill = e.currentTarget.style.old_fill;
					e.currentTarget.style.transform = "scale(1)";
				});
				
				map_district.addEventListener("mouseup", function(e) {
					window.location.href = "/district?q=" + e.currentTarget.id;
				});
			}
		
		});
	});
	
	var districts = document.getElementsByClassName("district datum");
	for (var i = 0; i < districts.length; i++) {
		var district = districts[i].textContent.split("-");
		if (district[0] !== "VI") {
			districts[i].textContent = helpers.expandStateName(district[1]);
		}
	}
};
*/
