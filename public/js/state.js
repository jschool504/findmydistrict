var state_map = document.getElementById("stateMap");

state_map.onload = function() {
	var doc = state_map.contentDocument;
	var stateRequest = new Request("/api/states/" + document.title.split(" |")[0] + "/districts");
	fetch(stateRequest).then(function(res) {
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
