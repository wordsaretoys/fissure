/**

	Player object

**/

FISSURE.player = new function() {

	var SPIN_RATE = -0.007;

	var capsule = {
		G: 9.81,
		thrust: 4.0,
		radius: 2,
		burnRate: 5.0,
		shieldCollisionFactor: 0.01,
		shieldRadiationFactor: 0.00005,
		maxEnergy: 1000,
		detectorRange: 0.000001
	};

	var motion = { 
		moveleft: false, moveright: false, movefore: false, moveback: false
	};
	
	var mouse = {
		down: false,
		x: 0,
		y: 0
	};

	this.position = new FOAM.Vector();
	this.velocity = new FOAM.Vector();
	this.energy = capsule.maxEnergy;
	this.score = 0;
	this.progress = 0;
	this.dead = false;

	var temp = {
		spinangs: new FOAM.Vector(),
		acc: new FOAM.Vector(),
		vel: new FOAM.Vector(),
		front: new FOAM.Vector(),
		right: new FOAM.Vector(),
		pos: new FOAM.Vector()
	};
	
	this.init = function() {
		jQuery(window).bind("keydown", this.onKeyDown);
		jQuery(window).bind("keyup", this.onKeyUp);
		jQuery(window).bind("mousedown", this.onMouseDown);
		jQuery(window).bind("mouseup", this.onMouseUp);
		jQuery(window).bind("mousemove", this.onMouseMove);
		FOAM.camera.farLimit = 2000.0;
	};
	
	this.retry = function() {
		this.energy = capsule.maxEnergy;
		this.velocity.set(0, 0, -1);

		this.position.copy(
			FISSURE.cave.midpoint(
				FISSURE.world.center.x,
				FISSURE.world.center.z
			)
		);

		FOAM.camera.rotation.set(0, 0, 0, 1);
		FOAM.camera.turn(0, 0, 0);
		FISSURE.hud.setScore(this.score);
		FISSURE.hud.setProgress(this.progress, FISSURE.salvage.map.length);
	}
	
	this.start = function() {
		this.progress = 0;
		this.score = 0;
		this.retry();
	};

	this.update = function() {
		var dt = FOAM.interval * 0.001;

		// determine and apply thrust
		temp.acc.set();
		if (motion.movefore && this.energy > 0) {
			temp.front.copy(FOAM.camera.orientation.front);
			temp.acc.sub(temp.front.mul(capsule.thrust));
			this.changeEnergy(-capsule.burnRate * capsule.thrust * dt);
		}
		if (motion.moveback && this.energy > 0) {
			temp.front.copy(FOAM.camera.orientation.front);
			temp.acc.add(temp.front.mul(capsule.thrust));
			this.changeEnergy(-capsule.burnRate * capsule.thrust * dt);
		}
		if (motion.moveleft && this.energy > 0) {
			temp.right.copy(FOAM.camera.orientation.right);
			temp.acc.sub(temp.right.mul(capsule.thrust));
			this.changeEnergy(-capsule.burnRate * capsule.thrust * dt);
		}
		if (motion.moveright && this.energy > 0) {
			temp.right.copy(FOAM.camera.orientation.right);
			temp.acc.add(temp.right.mul(capsule.thrust));
			this.changeEnergy(-capsule.burnRate * capsule.thrust * dt);
		}

		// update velocity and position
		temp.vel.copy(this.velocity).add(temp.acc.mul(dt * capsule.G));
		this.velocity.copy(temp.vel);
		this.position.add(temp.vel.mul(dt));
		
		FOAM.camera.position.copy(this.position);
		
		FISSURE.hud.setEnergy(Math.floor(this.energy), capsule.maxEnergy);
	};
	
	this.changeEnergy = function(de) {
		this.energy = Math.max(0, Math.min(this.energy + de, capsule.maxEnergy));
	};

	this.salvage = function() {
		this.progress++;
		this.score += Math.round(this.energy);
		this.energy = 1000;
		FISSURE.hud.setScore(this.score);
		FISSURE.hud.setProgress(this.progress, FISSURE.salvage.map.length);
	};

	this.onKeyDown = function(event) {
		switch(event.keyCode) {

			case FOAM.KEY.W:
				motion.movefore = true;
				break;
			case FOAM.KEY.S:
				motion.moveback = true;
				break;
			case FOAM.KEY.A:
				motion.moveleft = true;
				break;
			case FOAM.KEY.D:
				motion.moveright = true;
				break;
/*

	Cheat/Testing codes for removed for release
			
			case FOAM.KEY.X:
				FISSURE.player.velocity.set(0, 0, 0);
				break;
			case FOAM.KEY.R:
				temp.pos.copy(FISSURE.salvage.findClosest().center);
				temp.pos.z += 10;
				FISSURE.player.position.copy(temp.pos);
*/
			default:
				//window.alert(event.keyCode);
				break;
		}
	};

	this.onKeyUp = function(event) {
		switch(event.keyCode) {
		
			case FOAM.KEY.W:
				motion.movefore = false;
				break;
			case FOAM.KEY.S:
				motion.moveback = false;
				break;
			case FOAM.KEY.A:
				motion.moveleft = false;
				break;
			case FOAM.KEY.D:
				motion.moveright = false;
				break;
			default:
				break;
		}
	};

	this.onMouseDown = function(event) {
		mouse.down = true;
		return false;
	};
	
	this.onMouseUp = function(event) {
		mouse.down = false;
		return false;
	};

	this.onMouseMove = function(event) {
		var dx, dy;
		if (mouse.down) {
			dx = SPIN_RATE * (event.pageX - mouse.x);
			dy = SPIN_RATE * (event.pageY - mouse.y);
			FOAM.camera.turn(dy, dx, 0);
		}
		mouse.x = event.pageX;
		mouse.y = event.pageY;
		return false;
	};
	
	this.capsule = capsule;
};

