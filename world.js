/**

	World object
		Manage interactions between objects

**/

FISSURE.world = new function() {

	var temp = {
		mid: new FOAM.Vector(),
		pos: new FOAM.Vector(),
		vel: new FOAM.Vector(),
		norm: new FOAM.Vector(),
		coll: new FOAM.Vector()
	};

	//
	// Game status
	//
	
	this.ended = false;

	//
	// Map boundaries
	//
	
	this.center = new FOAM.Vector(50000, 0, 10000);
	this.radius = 5000;

	//
	// Radiation mapping
	//
	
	var maxRadLevel = 1000;
	var maxMeteredRadLevel = 500;
	// arguments: seed, amplitude, source length, period
	this.radLevelMap = new FOAM.Noise2D(5209432, 1, 256, 0.001);
										
	this.radLevel = function(p) {
		return Math.round(maxRadLevel * Math.pow(this.radLevelMap.get(p.x, p.z), 4.0));
	};
	
	//
	// General functions
	//
	
	this.update = function() {
		var dt = FOAM.interval * 0.001;
		var rl;
		
		temp.vel.copy(FISSURE.player.velocity).mul(dt);
		temp.pos.copy(FISSURE.player.position).add(temp.vel);

		if (FISSURE.cave.testWallCollision(temp.pos, FISSURE.player.capsule.radius, temp.norm)) {
			temp.vel.copy(FISSURE.player.velocity);

			FISSURE.player.velocity.sub(temp.norm.mul( 2 * temp.norm.dot(temp.vel) )).mul(0.5);
			FISSURE.player.changeEnergy(-Math.pow(temp.vel.length(), 2) * FISSURE.player.capsule.shieldCollisionFactor);
			
			temp.vel.copy(FISSURE.player.velocity);
			FISSURE.player.position.add(temp.vel.mul(2 * dt));
		}
		
		rl = this.radLevel(FISSURE.player.position);
		FISSURE.hud.setRads(rl, maxMeteredRadLevel);
		FISSURE.player.changeEnergy(-rl * FISSURE.player.capsule.shieldRadiationFactor);
		
		if (FISSURE.player.energy < 1 && !FISSURE.player.dead) {
			FISSURE.player.dead = true;
			FISSURE.hud.curtainDown(function() {
				FISSURE.player.score -= Math.round(FISSURE.player.score * 0.1);
				FISSURE.player.retry();
				FISSURE.hud.curtainUp(function() {
					FISSURE.player.dead = false;
				} );
			} );
		}
		
		if (FISSURE.player.progress == FISSURE.salvage.map.length && !FISSURE.hud.monologuing && !this.ended) {
			this.ended = true;
			FOAM.running = false;
			FISSURE.hud.showCredits( function() {
				FOAM.running = true;
				FISSURE.start();
			} );
		}
		
	};

	this.start = function() {
		this.ended = false;
	};

};

