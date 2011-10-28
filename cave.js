/**

	Cave object

**/

FISSURE.cave = new function() {

	var caveHeight = 100;
	
	var drawLength = 1500;
	var squareLength = 25;
	var redrawRadius = Math.ceil(drawLength / 5);
	var lastRedrawAt = new FOAM.Vector();

	var upperMesh, lowerMesh;

	// arguments: seed, amplitude, source length, period
	var upperWallMap = new FOAM.Noise2D(3939592, 100, 256, 0.01);
	var lowerWallMap = new FOAM.Noise2D(2194828, 100, 256, 0.01);
	var commonGapMap = new FOAM.Noise2D(9147374, 500, 128, 0.002);
	
	var temp = {
		s0: new FOAM.Vector(),
		s1: new FOAM.Vector(),
		s2: new FOAM.Vector(),
		pp: new FOAM.Vector(),
		qq: new FOAM.Vector(),
		camarray: new Float32Array(3),
		mid: new FOAM.Vector()
	};
	
	this.init = function() {
		upperMesh = new FOAM.Mesh(FOAM.gl.TRIANGLE_STRIP);
		lowerMesh = new FOAM.Mesh(FOAM.gl.TRIANGLE_STRIP);
		upperMesh.TEXTURE = 1;
		lowerMesh.TEXTURE = 1;
		upperMesh.add(upperMesh.POSITION, 3);
		upperMesh.add(upperMesh.TEXTURE, 2);
		lowerMesh.add(lowerMesh.POSITION, 3);
		lowerMesh.add(lowerMesh.TEXTURE, 2);
		this.generate(FISSURE.player.position);
		lastRedrawAt.copy(FISSURE.player.position);
	};
	
	this.upperWallHeight = function(x, z) { 
		return commonGapMap.get(x, z) + upperWallMap.get(x, z) + caveHeight; 
	};
	
	this.lowerWallHeight = function(x, z) { 
		return commonGapMap.get(x, z) - lowerWallMap.get(x, z); 
	};
	
	this.upperWallNormal = function(x, z) {
		temp.s0.set(x, this.upperWallHeight(x, z), z);
		temp.s1.set(x + 1, this.upperWallHeight(x + 1, z), z).sub(temp.s0);
		temp.s2.set(x, this.upperWallHeight(x, z + 1), z + 1).sub(temp.s0);
		return temp.s2.cross(temp.s1).norm();
	};
	
	this.lowerWallNormal = function(x, z) {
		temp.s0.set(x, this.lowerWallHeight(x, z), z);
		temp.s1.set(x + 1, this.lowerWallHeight(x + 1, z), z).sub(temp.s0);
		temp.s2.set(x, this.lowerWallHeight(x, z + 1), z + 1).sub(temp.s0);
		return temp.s1.cross(temp.s2).norm();
	};

	this.testWallCollision = function(p, r, t) {
		// test collision with upper wall
		if (this.upperWallHeight(p.x, p.z) - p.y < r) {
			t.collide = true;
			t.normal.copy( this.upperWallNormal(p.x, p.z) );
			return;
		}
		// test collision with lower wall
		if (p.y - this.lowerWallHeight(p.x, p.z) < r) {
			t.collide = true;
			t.normal.copy( this.lowerWallNormal(p.x, p.z) );
			return;
		}
		t.collide = false;
		return;
	};
	
	this.midpoint = function(x, z) {
		return temp.mid.set(x, 
			(this.upperWallHeight(x, z) + this.lowerWallHeight(x, z)) / 2, z);
	};

	this.update = function() {
		temp.pp.copy(FISSURE.player.position);
		if (lastRedrawAt.distance(temp.pp) >= redrawRadius) {
			temp.qq.set(
				Math.round(temp.pp.x / redrawRadius) * redrawRadius, 
				Math.round(temp.pp.y / redrawRadius) * redrawRadius, 
				Math.round(temp.pp.z / redrawRadius) * redrawRadius
			);
			this.generate(temp.qq);
			lastRedrawAt.copy(temp.pp);
		}
	};

	this.generate = function(p) {
		var x, y, z;
		var oddrow = false;

		var x0 = Math.ceil(p.x - drawLength / 2);
		var z0 = Math.ceil(p.z - drawLength / 2);
		var x1 = Math.ceil(p.x + drawLength / 2);
		var z1 = Math.ceil(p.z + drawLength / 2);
		
		var xa, xb, rz, rxa, rxb;
		var uya, uyb, lya, lyb;

		upperMesh.reset();
		lowerMesh.reset();

		// generate the vertex and raster coordinates
		for (x = x0; x <= x1; x += squareLength) {
			for (z = oddrow ? z0 : z1; oddrow ? z <= z1 : z >= z0; z += oddrow ? squareLength : -squareLength) {
				xa = oddrow ? x + squareLength : x;
				xb = oddrow ? x : x + squareLength;
				rz = z / drawLength;
				rxa = xa / drawLength;
				rxb = xb / drawLength;

				uya = this.upperWallHeight(xa, z);
				uyb = this.upperWallHeight(xb, z);
				lya = this.lowerWallHeight(xa, z);
				lyb = this.lowerWallHeight(xb, z);

				upperMesh.set(xa, uya, z, rxa, rz);
				upperMesh.set(xb, uyb, z, rxb, rz);

				lowerMesh.set(xb, lyb, z, rxb, rz);
				lowerMesh.set(xa, lya, z, rxa, rz);

			}
			oddrow = !oddrow;
		}

		// generate the GL buffers
		upperMesh.build();
		lowerMesh.build();
	};

	this.draw = function(projector, modelview) {
		var gl = FOAM.gl;
		var program = FOAM.shaders.activate("cave");
		var camera = FOAM.camera;

		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.FRONT);

		gl.uniformMatrix4fv(program.projector, false, camera.projector());
		gl.uniformMatrix4fv(program.modelview, false, camera.modelview());
		gl.uniform3fv(program.camerapos, camera.position.toArray(temp.camarray));
		FOAM.textures.bind(0, program.tex0, "cave-noise");

		upperMesh.draw();
		lowerMesh.draw();

		gl.disable(gl.CULL_FACE);
	};

};

