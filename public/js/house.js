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
