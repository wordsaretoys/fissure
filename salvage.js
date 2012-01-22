/**
	maintain collection of salvage objects

	this object was originally written with the intent
	that the salvage would be randomly distributed on
	each playthrough, but late in development I caught
	on that it would make score comparison meaningless.
	so, there's a little cruft left over from that.

	@namespace FISSURE
	@class salvage
**/

FISSURE.salvage = new function() {

	var itemCount = 25;
	var minDistance = 1500;
	var drawDistance = 1000;
	var junkRadius = 2.0;

	this.map = [];
	
	var temp = {
		center: new Float32Array(3),
		front: new FOAM.Vector(),
		bline: new FOAM.Vector()
	};

	/**
		create the salvage collection
		
		@method init
	**/

	this.init = function() {
	
		var i, il;
		
		for (i = 0; i < itemCount; i++) {
			this.map.push( {
				center: new FOAM.Vector(),
				active: false,
				model: null,
				texture: 0
			} );
		}
	};
	
	/**
		assign locations to all salvage objects
		
		@method start
	**/

	this.start = function() {

		var prng = new FOAM.Prng(199802);
		var p = new FOAM.Vector();
		var r = FISSURE.world.radius - minDistance;
		var c = FISSURE.world.center;

		var i, j, il, jl, b, item;
		for (i = 0; i < itemCount; ) {

			// pick a random *discrete* point on the XZ plane
			// to minimize separation between salvage locations
			p.x = minDistance * Math.round((c.x + prng.getm(r)) / minDistance);
			p.y = 0;
			p.z = minDistance * Math.round((c.z + prng.getm(r)) / minDistance);
			
			// insure we haven't duplicated an existing location
			for (j = 0, jl = i, b = false; j < jl; j++)
				if (this.map[j].center.distance(p) < minDistance) {
					b = true;
					break;
				}

			// if we haven't, add the location to the collection
			// and pick out a texture for it; go to next object
			if (!(b || p.distance(c) < minDistance)) {
				p.copy(FISSURE.cave.midpoint(p.x, p.z));
				item = this.map[i++];
				item.center.copy(p);
				item.texture = Math.floor(prng.get() * 3);
				item.active = true;
			}
		}
	};
	
	/**
		handles salvage state changes in response to player
		
		actual model meshes are generated "just in time"
		(probably wouldn't do this again; no real savings)
		
		@method update
	**/

	this.update = function() {

		temp.front.copy(FOAM.camera.orientation.front);
		var pr = FISSURE.player.capsule.radius + junkRadius;
		var t = new Date().getTime();
		var dp, is, ss = 0, sc = 0;
		var i, il, item, d;
		
		for (i = 0, il = this.map.length; i < il; i++)
			if (this.map[i].active) {
				item = this.map[i];
				d = item.center.distance(FISSURE.player.position);

				// if player is within visual distance of model and
				// it doesn't exist yet, create it				
				if (d <= minDistance && item.model == null)
					item.model = FISSURE.buildJunk(t + i, 6, 3)

				// test to see if the player's hit the model
				if (d <= pr) {
					FISSURE.player.salvage();
					FISSURE.hud.showMonologue("salv" + FISSURE.player.progress);
					item.active = false;
				}
			
				// calculate a total "signal strength" for all salvage objects
				// the dot product measures vector alignment -> rough measure
				temp.bline.copy(FISSURE.player.position).sub(item.center).norm();
				dp = temp.bline.dot(temp.front);
				if (dp > 0) {
					// clamp inverse square of distance so some signal is always detectable
					is = Math.max(FISSURE.player.capsule.detectorRange / 99, 1 / (d * d));
					// fourth power of dot product slims the signal spread a bit
					ss += Math.pow(dp, 4) * is;
					sc++;
				}
			}
		
		ss = (sc > 0) ? ss / sc : 0;
		FISSURE.hud.setSignal(ss, FISSURE.player.capsule.detectorRange);
	};
	
	/**
		draws all salvage objects the player can see
		
		@method draw
	**/

	this.draw = function() {

		var i, il, item, d;
		var gl = FOAM.gl;
		var camera = FOAM.camera;
		var program = FOAM.shaders.activate("salvage");

		gl.uniformMatrix4fv(program.projector, false, camera.projector());
		gl.uniformMatrix4fv(program.modelview, false, camera.modelview());
		gl.uniform1f(program.scale, junkRadius);

		for(i = 0, il = this.map.length; i < il; i++) {
			item = this.map[i];
			if (item.active && item.model != null && 
				item.center.distance(FISSURE.player.position) < drawDistance) {
				FOAM.textures.bind(0, program.tex0, "junk" + item.texture);
				gl.uniform3fv(program.center, item.center.toArray(temp.center));
				item.model.draw();
			}
		}
	};

};

