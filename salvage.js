/**

	Salvage Manager Object

**/

FISSURE.salvage = new function() {

	var itemCount = 25;
	var minDistance = 1500;
	var drawDistance = 1000;
	var junkRadius = 2.0;

	this.map = [];
	
	var temp = {
		camarray: new Float32Array(3),
		front: new FOAM.Vector(),
		bline: new FOAM.Vector()
	};

	this.findClosest = function() {
		var p = FISSURE.player.position;
		var i, d, maxd, lasti;
		for (i = 0, maxd = FISSURE.world.radius * 2; i < itemCount; i++) {
			d = p.distance(this.map[i].center);
			if (d < maxd && this.map[i].active) {
				maxd = d;
				lasti = i;
			}
		}
		return this.map[lasti];
	};
	
	this.init = function() {
	
		var i, il, q;
		
		for (i = 0; i < itemCount; i++) {
			q = new FOAM.Vector();
			this.map.push( {
				center: q,
				monologue: "salv" + (i + 1),
				active: false,
				model: null,
				texture: 0
			} );
		}
	};
	
	this.start = function() {

		var prng = new FOAM.Prng(199802);
		var p = new FOAM.Vector();
		var r = FISSURE.world.radius - minDistance;
		var c = FISSURE.world.center;

		var i, j, il, jl, b, item;
		for (i = 0; i < itemCount; ) {

			// we're effectively assigning random points on a known grid
			// to maintain a minimum separation between salvage locations
			p.x = minDistance * Math.round((c.x + prng.getm(r)) / minDistance);
			p.y = 0;
			p.z = minDistance * Math.round((c.z + prng.getm(r)) / minDistance);
			
			// check for duplicates on the grid
			for (j = 0, jl = i, b = false; j < jl; j++)
				if (this.map[j].center.distance(p) < minDistance) {
					b = true;
					break;
				}

			if (!(b || p.distance(c) < minDistance)) {
				p.copy(FISSURE.cave.midpoint(p.x, p.z));
				item = this.map[i++];
				item.center.copy(p);
				item.texture = Math.floor(prng.get() * 3);
				item.active = true;
			}
		}
	};
	
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
				
				// test to see if we need to create the model JIT
				if (d <= minDistance && item.model == null)
					item.model = FISSURE.buildJunk(t + i, 6, 3)

				// test to see if the player's hit the model
				if (d <= pr) {
					FISSURE.player.salvage();
					FISSURE.hud.showMonologue("salv" + FISSURE.player.progress);
					item.active = false;
				}
			
				// dot product related to vector alignment
				// provides rough signal strength measure
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
	
	this.draw = function() {

		var i, il, item, d;
		var gl = FOAM.gl;
		var camera = FOAM.camera;
		var program = FOAM.shaders.activate("salvage");

		gl.uniformMatrix4fv(program.projector, false, camera.projector());
		gl.uniformMatrix4fv(program.modelview, false, camera.modelview());
		gl.uniform1f(program.scale, junkRadius);
		FOAM.textures.bind(0, program.junk0, "junk0");
		FOAM.textures.bind(1, program.junk1, "junk1");
		FOAM.textures.bind(2, program.junk2, "junk2");

		for(i = 0, il = this.map.length; i < il; i++) {
			item = this.map[i];
			if (item.active && item.model != null && 
				item.center.distance(FISSURE.player.position) < drawDistance) {
				FOAM.textures.bind(0, program.tex0, "junk" + item.texture);
				gl.uniform3fv(program.center, item.center.toArray(temp.camarray));
				item.model.draw();
			}
		}
	};

};

