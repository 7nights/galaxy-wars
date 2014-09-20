var App = {
		sprites: [],
		stages: [],
		freq: 40
	};

var planetStage = new Stage({ // planet stage
	canvas: document.getElementById('stage-planet'),
	onclick: function(planet){
		if(myPlanet.getFocus()){
			planet.setFocus(true);
			myPlanet.untargetPlanet();
		} else {
			if(planet === myPlanet) myPlanet.setFocus(true);
		}
	},
	onmouseover: function(planet){
		planet.setMouseover(true);
		if(myPlanet.getFocus()){
			myPlanet.targetPlanet(planet);
		}
	},
	onmouseout: function(planet){
		planet.setMouseover(false);
	}
});
var shipStage = new Stage({ // ship stage
	canvas: document.getElementById('stage-ship')
});

App.stages = [planetStage, shipStage];

var planet = new Planet({
	stage: planetStage,
	x: 100,
	y: 100,
	img: document.getElementById('planet1')
});
var planet2 = new Planet({
	stage: planetStage,
	x: 250,
	y: 250,
	img: document.getElementById('planet1')
});
var planet3 = new Planet({
	stage: planetStage,
	x: 400,
	y: 100,
	img: document.getElementById('planet1')
});
var planet4 = myPlanet = new Planet({
	stage: planetStage,
	x: 250,
	y: 50,
	img: document.getElementById('planet1')
});
var ship = new Ship({
	stage: shipStage,
	x: 250,
	y: 50,
	img: document.getElementById('planet2')
});
var ship2 = new Ship({
	stage: shipStage,
	x: 300,
	y: 50,
	img: document.getElementById('planet2')
});

planetStage.addSprites([planet, planet2, planet3, planet4]);
shipStage.addSprites([ship, ship2]);

setTimeout(function(){
	var callee = arguments.callee;
	clearCanvas();
	drawSprites();
	setTimeout(function(){
		callee();
	}, App.freq);
}, App.freq);

function clearCanvas(){
	App.stages.map(function(stage){
		stage.clearCanvas();
	});
}
function drawSprites(){
	planetStage.sprites.map(function(planet){
		planet.draw();
	});
	shipStage.sprites.map(function(ship){
		ship.draw();
	});
}