var district_map = document.getElementById("districtMap");

district_map.onload = function() {
	var doc = district_map.contentDocument;
	
	var district_name = document.getElementById("districtName").textContent;
	console.log(district_name);
	var district = doc.getElementById(district_name);
	
	var district_party = document.getElementById("party");
	
	district.style.fill = "rgb(67, 67, 67)";
	
	if (district_party != null && district_party.textContent == "Democrat") {
		district.style.fill = "rgb(0, 0, 200)";
	} else if (district_party != null && district_party.textContent == "Republican") {
		district.style.fill = "rgb(200, 0, 0)";
	}
	
};

Chart.defaults.global.legend.display = false;
Chart.defaults.global.tooltips.enabled = false;

var popCtx = document.getElementById("popChart");
var popDataElements = document.getElementsByClassName("pop datum");
var popLabelElements = document.getElementsByClassName("pop_label");
var popColorElements = document.getElementsByClassName("pop color_box");

var popData = [];
var popLabels = [];

var popColors = [];

for (var i = 0; i < popDataElements.length; i++) {
	popLabels[i] = "";
	
	var label = popLabelElements[i].textContent;
	popColors[i] = "#000";

	if (label == "Total Population") {
		popColors[i] = "#6e6";
	} else if (label == "Total Workforce") {
		popColors[i] = "#ee6";
	} else if (label == "Population Under 18") {
		popColors[i] = "#66e";
	} else if (label == "Unemployed") {
		popColors[i] = "#f55";
	}
	
	popData[i] = parseInt(popDataElements[i].textContent);
	popColorElements[i].style.backgroundColor = popColors[i];
}

var popSet = {labels: popLabels, datasets: [{data: popData, backgroundColor: popColors, hoverBackgroundColor: popColors, borderWidth: 1, borderColor: "#000"}]};
var popOpts = {animation: false};

var popBarChart = new Chart(popCtx, {type: "bar", data: popSet, options: popOpts});

//
var raceCtx = document.getElementById("raceChart");
var raceData = [{value: parseFloat(document.getElementById("white_percent").innerText), label: "White"},
			{value: parseFloat(document.getElementById("black_percent").innerText), label: "Black"},
			{value: parseFloat(document.getElementById("asian_percent").innerText), label: "Asian"},
			{value: parseFloat(document.getElementById("am_percent").innerText), label: "Native American/Alaskan"},
			{value: parseFloat(document.getElementById("haw_percent").innerText), label: "Native Hawaiian/Pacific Islander"},
			{value: parseFloat(document.getElementById("other_percent").innerText), label: "Other"}];
//popData.sort(function(a, b) {return b.value-a.value});
		
var backgroundColors = ["#f77", "#aee", "#a50", "#55f", "#ffa", "#fbfbfb"];

var val = [];
var ls = []
for (i in raceData) {
	val[i] = raceData[i].value;
	ls[i] = raceData[i].label;
}

var ds = [{data: val, backgroundColor: backgroundColors, hoverBackgroundColor: backgroundColors, borderColor: "#000", borderWidth: 1}];
var dt = {labels: ls, datasets: ds};
var raceOpts = {animation: false};

var racePieChart = new Chart(raceCtx, {type: "pie", data: dt, options: raceOpts});

//
var electionCtx = document.getElementById("electionChart");
if (electionCtx !== null) {
	var electionDataElements = document.getElementsByClassName("election datum");
	var electionNameElements = document.getElementsByClassName("candidate_name");
	var electionColorElements = document.getElementsByClassName("color_box election");
	var electionPartyElements = document.getElementsByClassName("party");

	var electionData = [];
	var electionLabels = [];
	var backColors = [];
	for (var i = 0; i < electionDataElements.length; i++) {
		electionData[i] = electionDataElements[i].textContent;
		electionLabels[i] = electionNameElements[i].textContent;
		var party = electionPartyElements[i].textContent;
		backColors[i] = "#ccc";
	
		if (party.search("Democratic") > -1) {
			backColors[i] = "#55e";
			electionPartyElements[i].textContent = "Democrat";
		} else if (party.search("Republican") > -1) {
			backColors[i] = "#e55";
		} else if (party.search("Libertarian") > -1) {
			backColors[i] = "#ee5";
		} else if (party.search("Green") > -1) {
			backColors[i] = "#5e5";
		} else if (party.search("Independent") > -1) {
			backColors[i] = "#5ee";
		} else if (party.search("Write-In") > -1) {
			backColors[i] = "#555";
		} else if (electionLabels[i] == "Did not vote") {
			backColors[i] = "#fbfbfb";
		}
	
		electionColorElements[i].style.backgroundColor = backColors[i];
	}

	var elds = [{data: electionData, backgroundColor: backColors, hoverBackgroundColor: backColors, borderColor: "#000", borderWidth: 1}];
	var eldt = {labels: electionLabels, datasets: elds};
	var elecOpt = {animation: false};

	var electionChart = new Chart(electionCtx, {type: "pie", data: eldt, options: elecOpt});
}

//
var earningsCtx = document.getElementById("earningsChart");
var earningsDataElements = document.getElementsByClassName("earnings datum");

var earningsData = [];
var earningsLabels = [];
var earningsColors = backgroundColors;
var index = 0;
for (var i = 0; i < earningsDataElements.length; i++) {
	var txt = earningsDataElements[i].textContent.split("-");
	var splitEntry = parseFloat(txt[0].replace(",", ""));
	
	if (txt[0] !== "") {
		earningsData[index] = splitEntry;
		earningsLabels[index] = "";
		index = index + 1;
	}
}

var eads = [{data: earningsData, backgroundColor: earningsColors, hoverBackgroundColor: earningsColors, borderColor: "#000", borderWidth: 1}];
var eadt = {labels: earningsLabels, datasets: eads};
var earnOpt = {animation: false, scales: {yAxes: [{display: true, ticks: { suggestedMin: 0, suggestedMax: 60000}}]}};

var earningsChart = new Chart(earningsCtx, {type:"bar", data: eadt, options: earnOpt});

//
var eduCtx = document.getElementById("eduChart");
var eduDataElements = document.getElementsByClassName("degree datum");
var eduLabelElements = document.getElementsByClassName("degree_name");
var eduColorElements = document.getElementsByClassName("edu color_box");

var eduData = [];
var eduLabels = [];
var eduColors = [];
for (var i = 0; i < eduDataElements.length; i++) {
	var val = eduDataElements[i].textContent;
	var name_val = eduLabelElements[i].textContent;
	var color_val = (251 - i * 65).toString(16);
	eduColors[i] = "#" + color_val + color_val + color_val;
	eduColorElements[i].style.backgroundColor = eduColors[i];
	eduData[i] = val;
	eduLabels[i] = name_val;
}

var edds = [{data: eduData, backgroundColor: eduColors, hoverBackgroundColor: eduColors, borderColor: "#000", borderWidth: 1}];
var eddt = {labels: eduLabels, datasets: edds};
var eduOpt = {animation: false};

var eduChart = new Chart(eduCtx, {type: "pie", data: eddt, options: eduOpt});

// commify any needed numbers
var commaNums = document.getElementsByClassName("commify");

for (var i = 0; i < commaNums.length; i++) {
	commaNums[i].textContent = commaNums[i].textContent.replace(/(\d)(?=(\d{3})+$)/g, "$1,");
}
