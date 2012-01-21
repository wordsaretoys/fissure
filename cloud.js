/**
	generate and display debris clouds

	the clouds are represented by a "stack" of transparent polygons.
	unlike the "infinite" cave surfaces, the clouds are limited to a
	radius defined in the world object. the actual cloud images are
	generated via shader.

	@namespace FISSURE
	@class cloud
**/

FISSURE.cloud = new function() {

	var cloudCount = 32;
	var cloud = [];
	
	
	var temp = {
		pp: new FOAM.Vector(),
		camarray: new Float32Array(3),
		farray2: new Float32Array(2)
	};
	
	/**
		create the cloud meshes
		
		@method init
	**/

	this.init = function() {

		var p = FISSURE.player.position;
		
		var c = FISSURE.world.center;
		var r = FISSURE.world.radius;
		
		var lbound = new FOAM.Vector(c.x - r, -100, c.z - r);
		var ubound = new FOAM.Vector(c.x + r, 700, c.z + r);
		var dbound = new FOAM.Vector();
		dbound.copy(ubound).sub(lbound);
	
		var i, y, mesh;
		var prng = new FOAM.Prng();
		var program = FOAM.shaders.get("cloud");
		for (i = 0; i < cloudCount; i++) {

			// calculate a y-position for each cloud in the stack
			// we want them evenly distributed from top to bottom		
			y = Math.round( dbound.y * (i / cloudCount) + lbound.y );

			cloud[i] = {
				mesh: new FOAM.Mesh(),
				y: y,
				offset: {
					x: prng.getm(dbound.x),
					z: prng.getm(dbound.z)
				}			
			};

			mesh = cloud[i].mesh;
			
			mesh.add(program.position, 3);
			mesh.add(program.texturec, 2);

			mesh.set(lbound.x, y, lbound.z, lbound.x, lbound.z);
			mesh.set(lbound.x, y, ubound.z, lbound.x, ubound.z);
			mesh.set(ubound.x, y, ubound.z, ubound.x, ubound.z);

			mesh.set(lbound.x, y, lbound.z, lbound.x, lbound.z);
			mesh.set(ubound.x, y, ubound.z, ubound.x, ubound.z);
			mesh.set(ubound.x, y, lbound.z, ubound.x, lbound.z);

			mesh.build();
		}
	};
	
	/**
		draw the cave meshes
		
		@method draw
	**/

	this.draw = function() {
		var gl = FOAM.gl;
		var program = FOAM.shaders.activate("cloud");
		var camera = FOAM.camera;
		var p = FISSURE.player.position;
		var i;

		gl.uniformMatrix4fv(program.projector, false, camera.projector());
		gl.uniformMatrix4fv(program.modelview, false, camera.modelview());
		FOAM.textures.bind(0, program.tex0, "cloud-noise");

		// we use a rather odd alpha-blending function here that insures
		// the final result is BLACK clouds that fade into transparency.
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.SRC_ALPHA);

		// sadly, alpha-blending only works when the polygons are drawn back to front
		// so we have to draw all the polygons below the player from the bottom up--
		for (i = 0; i < cloudCount; i++)
			if (cloud[i].y <= p.y) {
				gl.uniform2f(program.offset, cloud[i].offset.x, cloud[i].offset.z);
				cloud[i].mesh.draw();
			}

		// --then draw all polygons above the player from the top down
		for (i = cloudCount - 1; i >= 0; i--)
			if (cloud[i].y > p.y) {
				gl.uniform2f(program.offset, cloud[i].offset.x, cloud[i].offset.z);
				cloud[i].mesh.draw();
			}

		gl.disable(gl.BLEND);
	};

};

