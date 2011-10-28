/**

	Cloud object

**/

FISSURE.cloud = new function() {

	var cloudCount = 32;
	var cloud = [];
	
	
	var temp = {
		pp: new FOAM.Vector(),
		camarray: new Float32Array(3),
		farray2: new Float32Array(2)
	};
	
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
		for (i = 0; i < cloudCount; i++) {
		
			y = Math.round( dbound.y * (i / cloudCount) + lbound.y );

			cloud[i] = {};
			cloud[i].mesh = new FOAM.Mesh();
			cloud[i].y = y;
			cloud[i].offset = { 
				x: prng.getm(dbound.x),
				z: prng.getm(dbound.z)
			};

			mesh = cloud[i].mesh;
			
			mesh.TEXTURE = 1;
			mesh.add(mesh.POSITION, 3);
			mesh.add(mesh.TEXTURE, 2);

			mesh.set(lbound.x, y, lbound.z, lbound.x, lbound.z);
			mesh.set(lbound.x, y, ubound.z, lbound.x, ubound.z);
			mesh.set(ubound.x, y, ubound.z, ubound.x, ubound.z);

			mesh.set(lbound.x, y, lbound.z, lbound.x, lbound.z);
			mesh.set(ubound.x, y, ubound.z, ubound.x, ubound.z);
			mesh.set(ubound.x, y, lbound.z, ubound.x, lbound.z);

			mesh.build();
		}
	};
	
	this.draw = function(projector, modelview) {
		var gl = FOAM.gl;
		var program = FOAM.shaders.activate("cloud");
		var camera = FOAM.camera;
		var p = FISSURE.player.position;
		var i;

		gl.uniformMatrix4fv(program.projector, false, camera.projector());
		gl.uniformMatrix4fv(program.modelview, false, camera.modelview());
		FOAM.textures.bind(0, program.tex0, "cloud-noise");
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.SRC_ALPHA);
		
		for (i = 0; i < cloudCount; i++)
			if (cloud[i].y <= p.y) {
				gl.uniform2f(program.offset, cloud[i].offset.x, cloud[i].offset.z);
				cloud[i].mesh.draw();
			}
			
		for (i = cloudCount - 1; i >= 0; i--)
			if (cloud[i].y > p.y) {
				gl.uniform2f(program.offset, cloud[i].offset.x, cloud[i].offset.z);
				cloud[i].mesh.draw();
			}

		gl.disable(gl.BLEND);
	};

};

