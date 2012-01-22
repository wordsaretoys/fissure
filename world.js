/**
	maintain world state and conditions
	manage interaction between player and cave

	@namespace FISSURE
	@class world
**/

FISSURE.world = new function() {

	var temp = {
		mid: new FOAM.Vector(),
		pos: new FOAM.Vector(),
		vel: new FOAM.Vector(),
		norm: new FOAM.Vector(),
		coll: new FOAM.Vector()
	};

	this.ended = false;

	this.center = new FOAM.Vector(50000, 0, 10000);
	this.radius = 5000;

	var maxRadLevel = 1000;
	var maxMeteredRadLevel = 500;
	this.radLevelMap = new FOAM.Noise2D(5209432, 1, 256, 0.001);

	/**
		get the background radiation level
		
		noise function returns value in {0..1} range
		take the fourth power to create sharp fluctuations
		(simulates localized radiation sources)
		
		@method radLevel
		@return radiation level
	**/

	this.radLevel = function(p) {
		return Math.round(maxRadLevel * Math.pow(this.radLevelMap.get(p.x, p.z), 4.0));
	};
	
	/**
		update the world and player's interaction with it
		
		called on each animation frame
		
		@method update
	**/

	this.update = function() {
		var dt = FOAM.interval * 0.001;
		var rl;
		
		temp.vel.copy(FISSURE.player.velocity).mul(dt);
		temp.pos.copy(FISSURE.player.position).add(temp.vel);

		// if player has collided with the cave wall
		if (FISSURE.cave.testWallCollision(temp.pos, FISSURE.player.capsule.radius, temp.norm)) {
			temp.vel.copy(FISSURE.player.velocity);

			// use reflection formula to generate new velocity vector
			FISSURE.player.velocity.sub(temp.norm.mul( 2 * temp.norm.dot(temp.vel) )).mul(0.5);
			// reduce energy to represent shield drain during collision
			FISSURE.player.changeEnergy(-Math.pow(temp.vel.length(), 2) * FISSURE.player.capsule.shieldCollisionFactor);
			
			// push player away from cave wall
			temp.vel.copy(FISSURE.player.velocity);
			FISSURE.player.position.add(temp.vel.mul(2 * dt));
		}
		
		// get local radiation level, display it, drain shield accordingly
		rl = this.radLevel(FISSURE.player.position);
		FISSURE.hud.setRads(rl, maxMeteredRadLevel);
		FISSURE.player.changeEnergy(-rl * FISSURE.player.capsule.shieldRadiationFactor);
		
		// if player has run out of energy
		if (FISSURE.player.energy < 1 && !FISSURE.player.dead) {
			// kill player and restore to center of game space
			FISSURE.player.dead = true;
			FISSURE.hud.curtainDown(function() {
				// deduct 10% of score for death penalty
				FISSURE.player.score -= Math.round(FISSURE.player.score * 0.1);
				FISSURE.player.retry();
				FISSURE.hud.curtainUp(function() {
					FISSURE.player.dead = false;
				} );
			} );
		}
		
		// if player has won the game
		if (FISSURE.player.progress == FISSURE.salvage.map.length && !FISSURE.hud.monologuing && !this.ended) {
			// stop the game, put up the credits and replay prompt
			this.ended = true;
			FOAM.running = false;
			FISSURE.hud.showCredits( function() {
				FOAM.running = true;
				FISSURE.start();
			} );
		}
		
	};

	/**
		reset world flags at game (re)start
		
		@method start
	**/

	this.start = function() {
		this.ended = false;
	};

};

