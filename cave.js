/**
	generate and display meshes for the game space
	provide methods to assist in collision detection

	the game space consists of an upper cave wall and a
	lower cave wall, both of "infinite" extent. all the
	game action takes place between these two surfaces.
	they are generated on the fly when the player moves
	outside a predetermined radius.	
	
	@namespace FISSURE
	@class cave
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
		mid: new FOAM.Vector()
	};
	
	/**
		create the cave meshes and generate the initial vertex set
		
		@method init
	**/

	this.init = function() {
		var program;
		upperMesh = new FOAM.Mesh(FOAM.gl.TRIANGLE_STRIP);
		lowerMesh = new FOAM.Mesh(FOAM.gl.TRIANGLE_STRIP);
		program = FOAM.shaders.get("cave");
		upperMesh.add(program.position, 3);
		upperMesh.add(program.texturec, 2);
		lowerMesh.add(program.position, 3);
		lowerMesh.add(program.texturec, 2);
		this.generate(FISSURE.player.position);
		lastRedrawAt.copy(FISSURE.player.position);
	};
	
	/**
		return height of upper cave wall at a point (x, z)
		
		@method upperWallHeight
		@param x the x-coordinate of the point
		@param z the z-coordinate of the point
		@return height of the upper cave wall
	**/

	this.upperWallHeight = function(x, z) { 
		return commonGapMap.get(x, z) + upperWallMap.get(x, z) + caveHeight; 
	};
	
	/**
		return height of lower cave wall at a point (x, z)
		
		@method lowerWallHeight
		@param x the x-coordinate of the point
		@param z the z-coordinate of the point
		@return height of the lower cave wall
	**/

	this.lowerWallHeight = function(x, z) { 
		return commonGapMap.get(x, z) - lowerWallMap.get(x, z); 
	};
	
	/**
		return a vector normal to the upper cave wall at a point (x, z)

		generated by taking cross product of two unit vectors originating
		from the specified point; y-values generated by sampling heights.
		
		@method upperWallNormal
		@param x the x-coordinate of the point
		@param z the z-coordinate of the point
		@return vector normal to the surface
	**/

	this.upperWallNormal = function(x, z) {
		temp.s0.set(x, this.upperWallHeight(x, z), z);
		temp.s1.set(x + 1, this.upperWallHeight(x + 1, z), z).sub(temp.s0);
		temp.s2.set(x, this.upperWallHeight(x, z + 1), z + 1).sub(temp.s0);
		return temp.s2.cross(temp.s1).norm();
	};
	
	/**
		return a vector normal to the lower cave wall at a point (x, z)

		generated by taking cross product of two unit vectors originating
		from the specified point; y-values generated by sampling heights.
		
		@method lowerWallNormal
		@param x the x-coordinate of the point
		@param z the z-coordinate of the point
		@return vector normal to the surface
	**/

	this.lowerWallNormal = function(x, z) {
		temp.s0.set(x, this.lowerWallHeight(x, z), z);
		temp.s1.set(x + 1, this.lowerWallHeight(x + 1, z), z).sub(temp.s0);
		temp.s2.set(x, this.lowerWallHeight(x, z + 1), z + 1).sub(temp.s0);
		return temp.s1.cross(temp.s2).norm();
	};

	/**
		determine if an object has collided with the cave

		the object is modeled as a sphere (point and radius supplied).
		collision occurs if any part of the sphere intersects the cave surface.

		@method testWallCollision
		@param p center of the object to test
		@param r radius of the object to test
		@param t vector object; returns surface normal if collision
		@return true if collision
	**/

	this.testWallCollision = function(p, r, t) {
		// test collision with upper wall
		if (this.upperWallHeight(p.x, p.z) - p.y < r) {
			t.copy( this.upperWallNormal(p.x, p.z) );
			return true;
		}
		// test collision with lower wall
		if (p.y - this.lowerWallHeight(p.x, p.z) < r) {
			t.copy( this.lowerWallNormal(p.x, p.z) );
			return true;
		}
		return false;
	};
	
	/**
		find point halfway between upper and lower cave surfaces at (x, z)

		note that this method returns a static object. don't store it off
		for later usage. use the value returned immediately or copy it.

		@method midpoint
		@param x the x-coordinate of the point
		@param z the z-coordinate of the point
		@return midway point
	**/

	this.midpoint = function(x, z) {
		return temp.mid.set(x, 
			(this.upperWallHeight(x, z) + this.lowerWallHeight(x, z)) / 2, z);
	};

	/**
		regenerate the cave meshes based on player distance
		
		execute on every animation frame
		
		@method update
	**/

	this.update = function() {
		// if the player has traveled far enough since the last mesh generation
		temp.pp.copy(FISSURE.player.position);
		if (lastRedrawAt.distance(temp.pp) >= redrawRadius) {
			// generate new meshes centered around player's new position
			temp.qq.set(
				Math.round(temp.pp.x / redrawRadius) * redrawRadius, 
				Math.round(temp.pp.y / redrawRadius) * redrawRadius, 
				Math.round(temp.pp.z / redrawRadius) * redrawRadius
			);
			this.generate(temp.qq);
			lastRedrawAt.copy(temp.pp);
		}
	};

	/**
		generate the cave meshes around a given point
		
		@method generate
		@param p the point to generate around
	**/

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

		// building a triangle strip-based grid takes some fiddling
		for (x = x0; x <= x1; x += squareLength) {
			// we have to construct the grid in different directions on
			// alternating rows
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

		// retain float array during build so we
		// don't have to reallocate it each time
		upperMesh.build(true);
		lowerMesh.build(true);
	};

	/**
		draw the cave meshes
		
		@method draw
	**/

	this.draw = function() {
		var gl = FOAM.gl;
		var program = FOAM.shaders.activate("cave");
		var camera = FOAM.camera;

		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.FRONT);

		gl.uniformMatrix4fv(program.projector, false, camera.projector());
		gl.uniformMatrix4fv(program.modelview, false, camera.modelview());
		FOAM.textures.bind(0, program.tex0, "cave-noise");

		upperMesh.draw();
		lowerMesh.draw();

		gl.disable(gl.CULL_FACE);
	};

};

