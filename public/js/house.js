var us_map = document.getElementById("usMap");

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
};
