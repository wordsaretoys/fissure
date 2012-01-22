/**
	generate salvage mesh

	@namespace FISSURE
	@method buildJunk
	@param seed noise function seed
	@param roughness measure of how bumpy the model is
	@param detail measure of how detailed the model is
	@return mesh containing salvage model
**/

FISSURE.buildJunk = function(seed, roughness, detail) {

	var mesh = new FOAM.Mesh();
	var noise = new FOAM.Noise2D(seed, 0.5, roughness, roughness);
	var temp = {
		norm: new FOAM.Vector()
	};
	var program = FOAM.shaders.get("salvage");
	mesh.add(program.position, 3);
	mesh.add(program.texturec, 2);

	// prevent "puckered anus" effect at poles
	var i, il;
	for (i = 0, il = noise.map.length; i < il; i++)
		noise.map[0][i] = 0.5;
	
	/**
		calculate the surface of the salvage model
		
		points supplied to this function should be roughly coincident
		with a sphere of a consistent radius centered around (0, 0, 0)

		@method surface
		@param p point to calculate surface
		@return point defining surface
	**/

	function surface(p) {
		var sx, sy, d;
		// normalize the point into a unit vector pointing
		// away from the center of a sphere at (0, 0, 0)
		temp.norm.copy(p).norm();
		// calculate mock "surface coordinates" based on that sphere
		sx = Math.acos(temp.norm.z) / Math.PI;
		sy = Math.atan2(temp.norm.y, temp.norm.x) / (Math.PI * 2);
		// avoid discontinuity in arctangent when we cross x-axis
		sy = (temp.norm.y < 0) ? sy + 1 : sy;
		// use the noise function to modulate the unit vector
		d = 1.0 + noise.get(sx, sy) - noise.amplitude * 0.5;
		return temp.norm.mul(d);
	}

	/**
		recursively generate surface vertexes by subdividing triangles
		
		operates on mesh defined in closure

		@method subdivide
		@param level integer level of detail
		@param p0 point denoting corner of triangle
		@param p1 point denoting corner of triangle
		@param p2 point denoting corner of triangle
		@param t0 texture coordinates of p0
		@param t1 texture coordinates of p1
		@param t2 texture coordinates of p2
	**/

	function subdivide(level, p0, p1, p2, t0, t1, t2) {
		var p3 = new FOAM.Vector(), 
			p4 = new FOAM.Vector(),
			p5 = new FOAM.Vector(),
			t3 = new FOAM.Vector(), 
			t4 = new FOAM.Vector(),
			t5 = new FOAM.Vector(),
			s;

		// if our triangles are small enough, 
		// shift them into position and exit
		if (0 === level) {
			s = surface(p0);
			mesh.set(s.x, s.y, s.z, t0.x, t0.y);
			s = surface(p1);
			mesh.set(s.x, s.y, s.z, t1.x, t1.y);
			s = surface(p2);
			mesh.set(s.x, s.y, s.z, t2.x, t2.y);
			return;
		}
		
		// determine points to define 4 smaller triangles
		p3.copy(p0).add(p1).mul(0.5);
		p4.copy(p1).add(p2).mul(0.5);
		p5.copy(p2).add(p0).mul(0.5);

		t3.copy(t0).add(t1).mul(0.5);
		t4.copy(t1).add(t2).mul(0.5);
		t5.copy(t2).add(t0).mul(0.5);

		level--;
	
		// recurse into the new triangles
		subdivide(level, p0, p3, p5, t0, t3, t5);
		subdivide(level, p3, p1, p4, t3, t1, t4);
		subdivide(level, p5, p4, p2, t5, t4, t2);
		subdivide(level, p4, p5, p3, t4, t5, t3);
	}

	// define the vertices of a unit octohedron
	var ppx = new FOAM.Vector(1, 0, 0);
	var pnx = new FOAM.Vector(-1, 0, 0);
	var ppy = new FOAM.Vector(0, 1, 0);
	var pny = new FOAM.Vector(0, -1, 0);
	var ppz = new FOAM.Vector(0, 0, 1);
	var pnz = new FOAM.Vector(0, 0, -1);

	// define the texture coordinates
	var tpx = new FOAM.Vector(0, 0.5);
	var tnx = new FOAM.Vector(0.5, 0.5);
	var tpy = new FOAM.Vector(0.5, 1);
	var tny = new FOAM.Vector(0.5, 0);
	var tpz = new FOAM.Vector(0.25, 0.5);
	var tnz = new FOAM.Vector(0.75, 0.5);

	// organize as faces and split
	subdivide(detail, ppy, ppz, pnx, tpy, tpz, tnx);
	subdivide(detail, ppy, ppx, ppz, tpy, tpx, tpz);
	subdivide(detail, ppy, pnz, ppx, tpy, tnz, tpx);
	subdivide(detail, ppy, pnx, pnz, tpy, tnx, tnz);

	subdivide(detail, pny, pnx, ppz, tny, tnx, tpz);
	subdivide(detail, pny, ppz, ppx, tny, tpz, tpx);
	subdivide(detail, pny, ppx, pnz, tny, tpx, tnz);
	subdivide(detail, pny, pnz, pnx, tny, tnz, tnx);

	mesh.build();
	
	return mesh;
};

