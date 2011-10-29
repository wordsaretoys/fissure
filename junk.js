/**

	Junk Factory function

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

	function surface(p) {
		var sx, sy, d;
		temp.norm.copy(p).norm();
		sx = Math.acos(temp.norm.z) / Math.PI;
		sy = Math.atan2(temp.norm.y, temp.norm.x) / (Math.PI * 2);
		// avoid discontinuity in arctangent when we cross x-axis
		sy = (temp.norm.y < 0) ? sy + 1 : sy;
		d = 1.0 + noise.get(sx, sy) - noise.amplitude * 0.5;
		return temp.norm.mul(d);
	}

	function subdivide(level, p0, p1, p2, t0, t1, t2) {
		var p3 = new FOAM.Vector(), 
			p4 = new FOAM.Vector(),
			p5 = new FOAM.Vector(),
			t3 = new FOAM.Vector(), 
			t4 = new FOAM.Vector(),
			t5 = new FOAM.Vector(),
			s;

		if (0 == level) {
			s = surface(p0);
			mesh.set(s.x, s.y, s.z, t0.x, t0.y);
			s = surface(p1);
			mesh.set(s.x, s.y, s.z, t1.x, t1.y);
			s = surface(p2);
			mesh.set(s.x, s.y, s.z, t2.x, t2.y);
			return;
		}
		p3.copy(p0).add(p1).mul(0.5);
		p4.copy(p1).add(p2).mul(0.5);
		p5.copy(p2).add(p0).mul(0.5);

		t3.copy(t0).add(t1).mul(0.5);
		t4.copy(t1).add(t2).mul(0.5);
		t5.copy(t2).add(t0).mul(0.5);

		level--;
	
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

