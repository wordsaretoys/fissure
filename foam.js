/**
	Foam Object Library for Simple 3D Applications

	@module FOAM
	@author cpgauthier
**/

FOAM = new function() {

	if (typeof(Float32Array) == "undefined")
		Float32Array = Array;

	requestAnimationFrame =	window.webkitRequestAnimationFrame ||
							window.mozRequestAnimationFrame ||
							window.oRequestAnimationFrame;

	this.piMul2 = 2.0 * Math.PI;
	this.piDiv2 = Math.PI / 2.0;
	this.degRad = Math.PI / 180.0;
	this.radDeg = 1.0 / this.degRad;
	
	this.KEY = {
		TAB: 9,
		ENTER: 13,
		SHIFT: 16,
		SPACE: 32,
		ESCAPE: 27,
		LEFTARROW: 37,
		UPARROW: 38,
		RIGHTARROW: 39,
		DOWNARROW: 40,
		A: 65, 	B: 66,	C: 67,	D: 68,
		E: 69,	F: 70,	G: 71,	H: 72,
		I: 73,	J: 74,	K: 75,	L: 76,
		M: 77,	N: 78,	O: 79,	P: 80,
		Q: 81,	R: 82,	S: 83,	T: 84,
		U: 85,	V: 86,	W: 87,	X: 88,
		Y: 89,	Z: 90
	};
	
	this.canvas = null;
	this.gl = null;

	this.lastFrame = 0;
	this.interval = 0;
	this.elapsedTime = 0;
	
	this.running = true;

	this.fpsCount = 0;
	this.fpsTime = (new Date).getTime();
	this.fps = 0;

	this.action = [];

	/**
		event handler for window resizing

		@method resize
	**/

	this.resize = function() {

		var aspect, h, d, pr;
	
		this.width = this.canvas.parentNode.clientWidth;
		this.height = this.canvas.parentNode.clientHeight;

		if (this.canvas) {

			this.canvas.width = this.width;
			this.canvas.height = this.height;

			if (this.gl) {
				this.gl.viewport(0, 0, this.width, this.height);
			}
		}
	};
	
	/**
		schedule a function for timed callback

		@method schedule
		@param function to call
		@param number of milliseconds between executions (0 for ASAP)
		@param true if function is to be executed periodically
	**/
	this.schedule = function(func, period, repeat) {
		this.action.push( { func: func, period: period, repeat: repeat, timestamp: this.elapsedTime } );
	};

	/**
		start or stop frame animation
		@method togglePause
	**/
	this.togglePause = function() {
		this.running = !this.running;
	};

	/**
		initialize the engine

		@method init
		@param HTML id of the canvas element to draw to
		@param true if engine should initialize GL context
		@return true if engine initialization succeeded
	**/
	this.init = function(canvasId, useGl) {

		var instance = this;
		if (canvasId) {
	
			this.canvas = document.getElementById(canvasId);
			
			if (useGl) {

				try {
					this.gl = this.canvas.getContext("experimental-webgl");
				}
				catch (e) {
					try {
						this.gl = this.canvas.getContext("webgl");
					}
					catch (e) {
						return false;
					}
				}
		
				// just in case the browser didn't throw an exception in WebGL's absence
				if (!this.gl)
					return false;

			} else {

				try {
					this.context = this.canvas.getContext("2d");
				}
				catch (e) {
					return false;
				}

				if (!this.context)
					return false;
			}

		}

		window.addEventListener("resize", function(){ instance.resize() }, false);
		this.resize();

		this.lastFrame = (new Date()).getTime();
		if (requestAnimationFrame)
			requestAnimationFrame(this.mainloop);				
		else
			setTimeout( this.mainloop, 1000 / 60 );

		return true;
	};

	/**
		main message pump - do not call in app code

		@method mainloop
	**/
	this.mainloop = function() {
	
		var t, dt, i, act;

		if (FOAM.running) {
			t = (new Date).getTime();
			dt = t - FOAM.lastFrame;
		
			FOAM.fpsCount++;
			if ((t - FOAM.fpsTime) >= 1000) {
				FOAM.fps = FOAM.fpsCount;
				FOAM.fpsCount = 0;
				FOAM.fpsTime = t;
			}
		
			// toss out any time delta greater than 1/2 second
			if (dt < 500)
				FOAM.interval = dt;
			FOAM.lastFrame = t;
		
			// we use elapsed time to drive events as it won't
			// update when the application is paused. using the
			// system time throws up all kinds of trouble here.
			FOAM.elapsedTime += FOAM.interval;

			for (i = FOAM.action.length - 1; i >= 0; i--) {
				act = FOAM.action[i];
				if (FOAM.elapsedTime - act.timestamp > act.period) {
					act.func();
					if (act.repeat)
						FOAM.action[i].timestamp = FOAM.elapsedTime;
					else
						FOAM.action[i].slice(i, 1);
				}
			}
		}

		if (requestAnimationFrame)
			requestAnimationFrame(FOAM.mainloop);
		else
			setTimeout(FOAM.mainloop, 1000 / 60);
	};

};

/**
	load external resources, with event-based notification
	
	set the onLoad variable to a function of the form
		function(resourceIndex, resourceTotal)
	to receive an event whenever a new resource is loaded
	
	set the onComplete variable to a function of the form
		function()
	to receive an event when all resources are loaded

	@namespace FOAM
	@class resources
**/

FOAM.resources = new function() {

	this.loaded = 0;
	this.toLoad = 0;
	this.image = {};
	this.sound = {};
	this.onLoad = function() {};
	this.onComplete = function() {};

	/**
		add an image file to load
		
		@method addImage
		@param key a string to refer to the image
		@param path URL of the image file
	**/
	this.addImage = function(key, path) {
		this.image[key] = { path: path, data: null };
		this.toLoad++;
	};
	
	/**
		add a sound file to load
		
		@method addSound
		@param key a string to refer to the sound
		@param path URL of the sound file
	**/
	this.addSound = function(key, path) {
		this.sound[key] = { path: path, data: null };
		this.toLoad++;
	}

	/**
		load all resources
		
		@method load
	**/
	this.load = function() {
		var instance = this;

		for (var key in this.image) {
			this.image[key].data = new Image();
			this.image[key].data.onload = function() {
				instance.loaded++;
				instance.onLoad(instance.loaded, instance.toLoad);
				if (instance.loaded == instance.toLoad)
					instance.onComplete();
			};
			this.image[key].data.src = this.image[key].path;
		}

		for (var key in this.sound) {
			this.sound[key].data = new Audio();
			this.sound[key].data.addEventListener("canplaythrough", function() {
				instance.loaded++;
				instance.onLoad(instance.loaded, instance.toLoad);
				if (instance.loaded == instance.toLoad)
					instance.onComplete();
			}, false);
			this.sound[key].data.src = this.sound[key].path;
		}
	};
		
};

/**
	construct a vector from initial values
	
	@namespace FOAM
	@class Vector
	@constructor
	@param x any real number
	@param y any real number
	@param z any real number
**/

FOAM.Vector = function(x, y, z) {
	this.set(x, y, z);
};

FOAM.Vector.prototype = {

	/**
		set the elements of the vector
		
		@method set
		@param x any real number
		@param y any real number
		@param z any real number
		@return the object itself
	**/
	set: function(x, y, z) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
		return this;
	},
	
	/**
		copy elements from another vector

		@method copy
		@param a object to copy from
		@return the object itself
	**/
	copy: function(a) { 
		this.x = a.x;
		this.y = a.y;
		this.z = a.z;
		return this;
	},
	
	/**
		add another vector to this one
		
		@method add
		@param a vector to add
		@return the vector, added
	**/
	add: function(a) {
		this.x += a.x;
		this.y += a.y;
		this.z += a.z;
		return this;
	},
	
	/**
		subtract another vector from this one
		
		@method sub
		@param a vector to subtract
		@return the vector, subtracted
	**/
	sub: function(a) {
		this.x -= a.x;
		this.y -= a.y;
		this.z -= a.z;
		return this;
	},
	
	/**
		multiply this vector by a constant
		
		@method mul
		@param c scalar to multiply
		@return the vector, multiplied
	**/
	mul: function(c) {
		this.x *= c;
		this.y *= c;
		this.z *= c;
		return this;
	},
	
	/**
		divide this vector by a constant
		
		return zero-length vector if constant is zero
		
		@method div
		@param c constant to divide by
		@return the vector, divided
	**/
	div: function(c) {
		if (c)
		{
			this.x /= c;
			this.y /= c;
			this.z /= c;
		}
		else
			this.set(0, 0, 0);
		return this;
	},
	
	/**
		negate this vector
		
		@method neg
		@return the vector, negated
	**/
	neg: function() {
		return this.set(-this.x, -this.y, -this.z); 
	},
	
	/**
		return the length of the vector
		
		@method length
		@return the length of the vector
	**/
	length: function() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	},

	/**
		get distance between this vector and another
		
		@method distance
		@param a vector 
		@return distance between this vector and a
	**/
	distance: function(a) {
		var dx = this.x - a.x;
		var dy = this.y - a.y;
		var dz = this.z - a.z;
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	},

	/**
		get square of distance between this vector and another
		
		@method distsqrd
		@param a vector 
		@return distance^2 between this vector and a
	**/
	distsqrd: function(a) {
		var dx = this.x - a.x;
		var dy = this.y - a.y;
		var dz = this.z - a.z;
		return dx * dx + dy * dy + dz * dz;
	},

	/**
		normalize this vector
		
		@method norm
		@return this vector, normalized
	**/
	norm: function() {
		var l = this.length();
		return this.div(l);
	},

	/**
		obtain dot product between this vector and another
		
		@method dot
		@param a vector
		@return dot product between this vector and a
	**/
	dot: function(a) {
		return this.x * a.x + this.y * a.y + this.z * a.z;
	},

	/**
		obtain cross product between this vector and another
		
		@method cross
		@param a vector
		@return this vector crossed with a
	**/
	cross: function(a) {
		var tx = this.x;
		var ty = this.y;
		var tz = this.z;
		this.x = ty * a.z - tz * a.y;
		this.y = tz * a.x - tx * a.z;
		this.z = tx * a.y - ty * a.x;
		return this;
	},

	/**
		copy vector data into array
		
		@method toArray
		@param a array to copy to, defaults to new empty array
		@return array containing elements [x, y, z]
	**/
	toArray: function(a) {
		a = a || [];
		a[0] = this.x;
		a[1] = this.y;
		a[2] = this.z;
		return a;
	},
	
	/**
		round the vector by a specified factor
		
		@method dejitter
		@param v number to round by
		@param f rounding function, defaults to Math.round
		@return the object, rounded off
	**/
	dejitter: function(v, f) {
		f = f || Math.round;
		this.x = f(this.x / v) * v;
		this.y = f(this.y / v) * v;
		this.z = f(this.z / v) * v;
		return this;
	}
};

/**
	construct a quaternion from initial values
	
	@namespace FOAM
	@class Quaternion
	@constructor
	@param x any real number
	@param y any real number
	@param z any real number
	@param w any real number
**/
FOAM.Quaternion = function(x, y, z, w) {
	this.set(x, y, z, w);
};

FOAM.Quaternion.prototype = {

	/**
		set the elements of the quaternion
		
		@method set
		@param x any real number
		@param y any real number
		@param z any real number
		@param w any real number
		@return the object itself
	**/
	set: function(x, y, z, w) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
		this.w = w || 0;
		return this;
	},

	/**
		copy elements from another quaternion

		@method copy		
		@param a object to copy from
		@return the object itself
	**/
	copy: function(a) { 
		this.x = a.x;
		this.y = a.y;
		this.z = a.z;
		this.w = a.w;
		return this;
	},
	
	/**
		multiply another quaternion by this one
		result = this * a

		@method mul	
		@param a quaternion to multiply
		@return the object itself, multiplied
	**/
	mul: function(a) {
		var tx = this.x;
		var ty = this.y;
		var tz = this.z;
		var tw = this.w;
		this.x = tw * a.x + tx * a.w + ty * a.z - tz * a.y;
		this.y = tw * a.y + ty * a.w + tz * a.x - tx * a.z;
		this.z = tw * a.z + tz * a.w + tx * a.y - ty * a.x;
		this.w = tw * a.w - tx * a.x - ty * a.y - tz * a.z;
		return this;
	},

	/**
		negate the quaternion
		
		@method neg
		@return the object iself, negated
	**/
	neg: function() {
		return this.set(-this.x, -this.y, -this.z, this.w); 
	},

	/**
		normalize the quaternion
		
		@method norm
		@return the object itself, normalized
	**/
	norm: function()
	{
		var mag = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
		return this.set(this.x / mag, this.y / mag, this.z / mag, this.w);
	},

	/**
		copy quaternion data into array
		
		@method toArray
		@param a array to copy to, defaults to new empty array
		@return array containing elements [x, y, z, w]
	**/
	toArray: function(a)
	{
		a = a || [];
		a[0] = this.x;
		a[1] = this.y;
		a[2] = this.z;
		a[3] = this.w;
		return a;
	},
	
	/**
		sets quaternion data from axis-angle representation
		
		@method setFromAxisAngle
		@param x any real number
		@param y any real number
		@param z any real number
		@param ang any real number
		@return the object itself
	**/
	setFromAxisAngle: function(x, y, z, ang) {
		var ha = Math.sin(ang / 2);
		return this.set(x * ha, y * ha, z * ha, Math.cos(ang / 2));
	}
};

/**
	maintains a position and a rotation. useful
	for stuff like cameras and drawable things.

	@namespace FOAM
	@class Thing
**/

FOAM.Thing = function() {
	this.position = new FOAM.Vector();
	this.rotation = new FOAM.Quaternion(0, 0, 0, 1);
	this.orientation = {
		right: new FOAM.Vector(1, 0, 0),
		up: new FOAM.Vector(0, 1, 0),
		front: new FOAM.Vector(0, 0, 1)
	};
	this.unitquat = {
		x: new FOAM.Quaternion(1, 0, 0, 0),
		y: new FOAM.Quaternion(0, 1, 0, 0),
		z: new FOAM.Quaternion(0, 0, 1, 0)
	};
	this.spinquat = {
		x: new FOAM.Quaternion(),
		y: new FOAM.Quaternion(),
		z: new FOAM.Quaternion()
	};
	this.scratch = {
		qr: new FOAM.Quaternion(),
		nr: new FOAM.Quaternion(),
		rr: new FOAM.Quaternion()
	};
	this.matrix = {
		transpose: new Float32Array(16),
		rotations: new Float32Array(16)
	};
};
FOAM.Thing.prototype = {

	/**
		rotate the thing
		
		@method turn
		@param rx rotation around x-axis in radians
		@param ry rotation around y-axis in radians
		@param rz rotation around z-axis in radians
	**/
	turn: function(rx, ry, rz) {

		var qr = this.scratch.qr;
		var nr = this.scratch.nr;
		var rr = this.scratch.rr;
		var sq = this.spinquat;
		var uq = this.unitquat;
		var o = this.orientation;
		var ro = this.matrix.rotations;
		var tr = this.matrix.transpose;

		// generate new rotation quaternion
		sq.x.setFromAxisAngle(1, 0, 0, rx);
		sq.y.setFromAxisAngle(0, 1, 0, ry);
		sq.z.setFromAxisAngle(0, 0, 1, rz);
		qr.copy(sq.x).mul(sq.y).mul(sq.z);
		this.rotation.mul(qr).norm();
		
		// generate new orientation vectors
		nr.copy(this.rotation).neg();
		rr.copy(this.rotation).mul(uq.x).mul(nr);
		o.right.copy(rr).norm();
		rr.copy(this.rotation).mul(uq.y).mul(nr);
		o.up.copy(rr).norm();
		rr.copy(this.rotation).mul(uq.z).mul(nr);
		o.front.copy(rr).norm();

		// generate new rotation and transpose matrices
		ro[0] = o.right.x;
		ro[1] = o.up.x;
		ro[2] = o.front.x;
		
		ro[4] = o.right.y;
		ro[5] = o.up.y;
		ro[6] = o.front.y;
		
		ro[8] = o.right.z;
		ro[9] = o.up.z;
		ro[10] = o.front.z;
	
		ro[3]  = ro[7] = ro[11] = 0;
		ro[12] = ro[13] = ro[14] = 0;
		ro[15] = 1;
		
		tr[0] = o.right.x;
		tr[4] = o.up.x;
		tr[8] = o.front.x;
		
		tr[1] = o.right.y;
		tr[5] = o.up.y;
		tr[9] = o.front.y;
		
		tr[2] = o.right.z;
		tr[6] = o.up.z;
		tr[10] = o.front.z;
		
		tr[3]  = tr[7]  = tr[11] = 0;
		tr[12] = tr[13] = tr[14] = 0;
		tr[15] = 1;
	}

};

/**
	maintain all shader programs
	
	@namespace FOAM
	@class shaders
**/

FOAM.shaders = new function() {

	var shaderList = {};

	/**
		build a shader program
		
		compiles the code and adds the program to a reference object
		references to all specified uniforms and samples are also
		added to this object

		when adding attributes to the mesh (using mesh.add), put them
		in the same order they are listed in the attributes array!		
		
		@method build
		@param pname label to refer to the compiled shader program
		@param vertex string containing the vertex shader code to compile
		@param fragment string containing the fragment shader code to compile
		@param attributes array of all attribute variables referenced in vertex shader
		@param uniforms array of all uniform variables referenced in the shaders
		@param samplers array of all sampler variables referenced in the shaders
	**/
	this.build = function(pname, vertex, fragment, attributes, uniforms, samplers) {
		var gl = FOAM.gl;
		var shader = {};
		var vobj, vsrc, fobj, fsrc, i, il, n;
		
		attributes = attributes || [];
		uniforms = uniforms || [];
		samplers = samplers || [];

		// compile the vertex shader
		vobj = gl.createShader(gl.VERTEX_SHADER);
		vsrc = document.getElementById(vertex).innerHTML;
		gl.shaderSource(vobj, vsrc);
		gl.compileShader(vobj);
		if (!gl.getShaderParameter(vobj, gl.COMPILE_STATUS)) {
			console.log(gl.getShaderInfoLog(vobj));
			return null;
		}

		// compile the fragment shader
		fobj = gl.createShader(gl.FRAGMENT_SHADER);
		fsrc = document.getElementById(fragment).innerHTML;
		gl.shaderSource(fobj, fsrc);
		gl.compileShader(fobj);
		if (!gl.getShaderParameter(fobj, gl.COMPILE_STATUS)) {
			console.log(gl.getShaderInfoLog(fobj));
			return null;
		}

		// create and link the shader program
		shader.program = gl.createProgram();

		gl.attachShader(shader.program, vobj);
		gl.attachShader(shader.program, fobj);
		gl.linkProgram(shader.program);

		if (!gl.getProgramParameter(shader.program, gl.LINK_STATUS)) {
			console.log(gl.getProgramInfoLog(shader.program));
			return null;
		}

		// add attribute variables
		for (i = 0, il = attributes.length; i < il; i++) {
			n = attributes[i];
			shader[n] = gl.getAttribLocation(shader.program, n);
		}

		// add uniform variables
		for (i = 0, il = uniforms.length; i < il; i++) {
			n = uniforms[i];
			shader[n] = gl.getUniformLocation(shader.program, n);
		}

		// add sampler variables
		for (i = 0, il = samplers.length; i < il; i++) {
			n = samplers[i];
			shader[n] = gl.getUniformLocation(shader.program, n);
		}

		shaderList[pname] = shader;
	};

	/**
		activates the specified shader and returns its reference object
		
		@method activate
		@param pname label of the shader assigned in build method
		@return reference object
	**/
	this.activate = function(pname) {
		var shader = shaderList[pname];
		FOAM.gl.useProgram(shader.program);
		return shader;
	};

	/**
		returns the reference object for a specified shader
		
		@method get
		@param pname label of the shader assigned in build method
		@return reference object
	**/
	this.get = function(pname) {
		return shaderList[pname];
	}
};

/**
	maintain all textures
	
	@namespace FOAM
	@class textures
**/

FOAM.textures = new function() {

	this.texture = {};

	/**
		generate a GL texture from an object containing pixel data
		
		internal use, called by public methods
		
		@method generateTexture
		@param tname label to refer to the texture in future
		@param obj object containing pixel data
	**/
	function generateTexture(tname, obj) {
		var gl = FOAM.gl;
		var t = gl.createTexture();
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.bindTexture(gl.TEXTURE_2D, t);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, obj);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
		return t;
	}	

	/**
		generate a GL texture from a loaded image resource
		
		image must have been loaded using the resources object
		texture will be generated with the resource key as its name
		
		@method build
		@param key name of the image resource
	**/
	this.build = function(key) {
		this.texture[key] = generateTexture(key, FOAM.resources.image[key].data);
	};

	/**
		generate a GL texture from a loaded image strip resource
		
		allows a set of separate textures to be generated from a
		single image resource containing multiple patterns
		image must have been loaded using the resources object
		
		@method buildFromSprite
		@param tname label to refer to the texture in future
		@param key name of the image resource
		@param x the x position of the texture in the image strip
		@param y the y position of the texture in the image strip
		@param w the width of the texture in the image strip
		@param h the height of the texture in the image strip
	**/
	this.buildFromSprite = function(tname, key, x, y, w, h) {
		var img = FOAM.resources.image[key].data;
		var pixels;

		if (!this.canvas) {
			this.canvas = document.createElement("canvas");
			this.canvas.context = this.canvas.getContext("2d");
		}
		this.canvas.width = img.width;
		this.canvas.height = img.height;
		this.canvas.context.drawImage(img, 0, 0);
		pixels = this.canvas.context.getImageData(x, y, w, h);

		this.texture[tname] = generateTexture(tname, pixels);
	};

	/**
		builds a texture from an ImageData object
		
		@method buildFromImageData
		@param tname label to refer to the texture in future
		@param obj the ImageData object to generate texture from
	**/
	this.buildFromImageData = function(tname, obj) {
		if (this.texture[tname])
			FOAM.gl.deleteTexture(this.texture[tname]);
		this.texture[tname] = generateTexture(tname, obj);
	};

	/**
		binds a texture to a specified texture unit

		used in conjunction with shaders.activate()
		the sampler parameter is supplied by the activated shader
		
		@method bind
		@param index the index of the GL texture unit, range {0..MAX_TEXTURE_IMAGE_UNITS}
		@param sampler object reference to the sampler variable
		@param tname label that refers to the texture to bind
	**/
	this.bind = function(index, sampler, tname) {
		var gl = FOAM.gl;
		gl.uniform1i(sampler, index);
		gl.activeTexture(gl.TEXTURE0 + index);
		gl.bindTexture(gl.TEXTURE_2D, this.texture[tname]);  
	};
};

/**
	maintain a camera
	inherits from Thing

	@namespace FOAM
	@class camera
**/

FOAM.Camera = function() {

	this.viewAngle = 30.0;
	this.nearLimit = 0.5;
	this.farLimit = 1000.0;

	this.matrix.projector = new Float32Array(16);	
	this.matrix.modelview = new Float32Array(16);
	
	/**
		return rotations matrix

		@method rotations
		@return internal rotations matrix as Float32Array(16)
	**/
	this.rotations = function() {
		return this.matrix.rotations;
	};
	
	/**
		return transpose matrix

		@method transpose
		@return internal transposed matrix as Float32Array(16)
	**/
	this.transpose = function() {
		return this.matrix.transpose;
	};

	/**
		generate projection matrix

		@method projector
		@return projection matrix as Float32Array(16)
	**/
	this.projector = function() {
		var pr = this.matrix.projector;
		var aspect, h, d;
				
		aspect = FOAM.width / FOAM.height;
		h = 1 / Math.tan(this.viewAngle * FOAM.degRad);
		d = this.nearLimit - this.farLimit;

		pr[0] = h / aspect;
		pr[1] = pr[2] = pr[3] = 0;

		pr[5] = h;
		pr[4] = pr[6] = pr[7] = 0;

		pr[10] = (this.farLimit + this.nearLimit) / d;
		pr[8] = pr[9] = 0;
		pr[11] = -1;

		pr[14] = 2 * this.nearLimit * this.farLimit / d;
		pr[12] = pr[13] = pr[15] = 0;
		
		return pr;
	};
	
	/**
		generate modelview matrix

		@method modelview
		@return modelview matrix as Float32Array(16)
	**/
	this.modelview = function() {
		var o = this.orientation;
		var p = this.position;
		var mv = this.matrix.modelview;

		mv[0] = o.right.x;
		mv[1] = o.up.x;
		mv[2] = o.front.x;
		
		mv[4] = o.right.y;
		mv[5] = o.up.y;
		mv[6] = o.front.y;
		
		mv[8] = o.right.z;
		mv[9] = o.up.z;
		mv[10] = o.front.z;
	
		mv[12] = -(o.right.x * p.x + o.right.y * p.y + o.right.z * p.z);
		mv[13] = -(o.up.x * p.x + o.up.y * p.y + o.up.z * p.z);
		mv[14] = -(o.front.x * p.x + o.front.y * p.y + o.front.z * p.z);

		mv[3]  = mv[7] = mv[11] = 0;
		mv[15] = 1;
		
		return mv;
	};
};
// create legacy camera object
FOAM.Camera.prototype = new FOAM.Thing();
FOAM.camera = new FOAM.Camera();

/**
	construct a mesh
	
	@namespace FOAM
	@class Mesh
	@constructor
	@param dp draw primitive, defaults to gl.TRIANGLES
**/
FOAM.Mesh = function(dp) {

	this.startLength = 1024;

	this.data = new Float32Array(this.startLength);
	this.drawPrimitive = dp || FOAM.gl.TRIANGLES;
	this.length = 0;

	this.drawCount = 0;
	this.stride = 0;
	this.buffer = null;

	this.attribute = [];

};

FOAM.Mesh.prototype = {

	/**
		add an attribute to the mesh

		attribute indexes should be retrieved from the shader. example:
		
			FOAM.shaders.build(
				"sample", "vs-sample", "fs-sample", 
				["position", "texture"],
				["projector", "modelview"],
				[] );
		
			...
		
			var program = FOAM.shader.get("sample");
			mesh.add(program.position, 3);
			mesh.add(program.texture, 2);
		
		attributes may only contain floats, no integer/boolean types
		
		@method add
		@param index numeric id of the attribute
		@param number of floats represented by the atttribute
	**/
	add: function(index, size) {
		var i, il;
		this.attribute.push({
			index: index,
			size: size
		});
		for (this.stride = 0, i = 0, il = this.attribute.length; i < il; i++)
			this.stride += this.attribute[i].size;
	},
	
	/**
		increase the number of vertices available to the mesh
		
		@method grow
		@param n number of floats to grow by
	**/
	grow: function(n) {
		var newSize = this.length + n;
		var newBuffer, i, il, l;
		if (newSize > this.data.length) {
			// find smallest power of 2 greater than newSize
			l = Math.pow(2, Math.ceil(Math.log(newSize) / Math.LN2));
			newBuffer = new Float32Array(l);
			for (i = 0, il = this.length; i < il; i++)
				newBuffer[i] = this.data[i];
			this.data = newBuffer;
		}
	},

	/**
		specify a collection of vertex data for the mesh
		
		data must be specified in the SAME ORDER as the 
		attributes that were specified by the mesh.add
		example:
		
			mesh.add(program.position, 3)
			mesh.add(program.texture, 2);
			...
			mesh.set(pos.x, pos.y, pos.z, tex.u, tex.v);
		
		@method set
		@param variable argument list, floats only
	**/
	set: function() {
		var i, il = arguments.length;
		this.grow(il);
		for (i = 0; i < il; i++) {
			this.data[this.length++] = arguments[i];
		}
	},

	/**
		load an array of vertex data into the mesh
		
		@method load
		@param data array of float
	**/
	load: function(data) {
		var i, j, il;
		this.grow(data.length);
		for (i = this.length, j = 0, il = this.length + data.length; i < il; i++, j++)
			this.data[i] = data[j];
		this.length = il;
	},

	/**
		reset a mesh object for use with new vertex data
		
		@method reset
	**/
	reset: function() {
		this.length = 0;
	},

	/**
		generate a GL buffer from the vertex data
		
		@method build
		@param retain true if vertex data is to be kept around
		@param dynamic true if vertex buffer will be modified
	**/
	build: function(retain, dynamic) {
		var gl = FOAM.gl;
		var usage = (dynamic) ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;

		if (this.buffer != null)
			gl.deleteBuffer(this.buffer);
		this.buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.data, usage);
		
		this.drawCount = Math.ceil(this.length / this.stride);
		
		if (!retain)
			delete this.data;
	},

	/**
		draw the mesh

		If draw() is called by itself, it will draw the entire buffer. Pass an offset and
		length to draw a particular area of the mesh. The mesh.length variable tracks the
		current size of the mesh; store it off while setting up the vertices of different
		models, and determine offsets and sizes from the stored values. Note that offsets
		and lengths must be divided by mesh.stride before submitting to the draw method!!
		
			model1.index = mesh.length / mesh.stride;
			mesh.load(...);
			model1.size = mesh.length / mesh.stride - model1.index;
			model2.index = mesh.length / mesh.stride;
			mesh.load(...);
			model2.size = mesh.length / mesh.stride - model2.index;
			
			... (set up shader for model 1)
			mesh.draw(model1.index, model1.size);
			... (set up shader for model 2)
			mesh.draw(model2.index, model2.size);
		
		@method draw
		@param offset starting vertex to draw, defaults to 0
		@param length number of verticies to draw, defaults to all
	**/
	draw: function(offset, length) {
		var gl = FOAM.gl;
		var i, il, attr, acc;
		
		offset = offset || 0;
		length = length || this.drawCount;
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		for (acc = 0, i = 0, il = this.attribute.length; i < il; i++) {
			attr = this.attribute[i];
			gl.enableVertexAttribArray(attr.index);
			gl.vertexAttribPointer(attr.index, attr.size, gl.FLOAT, false, 
				this.stride * Float32Array.BYTES_PER_ELEMENT, acc * Float32Array.BYTES_PER_ELEMENT);
			acc += attr.size;
		}
		
		gl.drawArrays(this.drawPrimitive, offset, length);

		for (i = 0, il = this.attribute.length; i < il; i++)
			gl.disableVertexAttribArray(this.attribute[i].index);
	},
	
	/**
		append the contents of another mesh, offset by specified position
		
		WARNING! this function assumes that the two meshes have the same 
		stride pattern (the data in both are interlaced the same way) and
		that the position data is contained in the first three verticies.
		
		@method append
		@param mesh source mesh to copy from
		@param offset position to translate the source mesh
	**/
	append: function(mesh, offset) {
		var i, il, sl, f, phase = 0, lp = this.stride - 1;
		sl = this.length;
		this.grow(mesh.length);
		for (i = 0, il = mesh.length; i < il; i++) {
			f = mesh.data[i];
			if (offset) {
				if (phase === 0)
					f += offset.x;
				if (phase === 1)
					f += offset.y;
				if (phase === 2)
					f += offset.z;
			}
			this.data[sl + i] = f;
			phase = (phase < lp) ? phase + 1 : 0;
		}
		this.length += mesh.length;
	},
	
	/**
		modify the GL buffer
		
		@method mofify
		@param offset position at which to write new data
		@param data a Float32Array containing the data to write
	**/
	modify: function(offset, data) {
		var gl = FOAM.gl;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferSubData(gl.ARRAY_BUFFER, offset, data);
	}
	
};

/**
	objects for generating smooth interpolated random noise

	the NoisexD functions interpolate between random numbers
	in a source matrix, which is generated from a seed value
	
	@namespace FOAM
**/


FOAM.linearInterpolate = function(y1, y2, mu) {
	return (y1 * (1.0 - mu) + y2 * mu);
};

FOAM.cosineInterpolate = function(y1, y2, mu) {
	var mu2 = (1.0 - Math.cos(mu * Math.PI)) / 2.0;
	return (y1 * (1.0 - mu2) + y2 * mu2);
};

FOAM.interpolate = FOAM.cosineInterpolate;

/**
	construct a linear congruential random number generator
	
	@namespace FOAM
	@class Prng
	@constructor
	@param seed initial value, defaults to current time in ms
**/
FOAM.Prng = function(seed) {
	this.reseed(seed);
	this.modu = Math.pow(2, 32);
};

FOAM.Prng.prototype = {

	/**
		return the next random number
		
		@method get
		@return random float in the range {0...1}
	**/
	get: function() {
		this.seed = (this.seed * 1664525 + 1013904223) % this.modu;
		return this.seed / this.modu;
	},
	
	/**
		return the next random number
		
		@method getm
		@return random float in the range {-m...m}
	**/
	getm: function(m) {
		return m * (this.get() - this.get());
	},
	
	/**
		reset the generator with a new seed
		
		@method reseed
		@param seed initial value, defaults to current time in ms
	**/
	reseed: function(seed) {
		this.seed = seed || new Date().getTime();
	}
};

/**
	construct a 1D noise function

	@namespace FOAM
	@class Noise1D
	@constructor
	@param seed initial value for prng
	@param ampl maximum amplitude of function
	@param sz length of source matrix
	@param per period of noise function
**/
FOAM.Noise1D = function(seed, ampl, sz, per) {
	var x;
	this.size = sz;
	this.period = per;
	this.amplitude = ampl;
	this.prng = new FOAM.Prng(seed);
	this.map = new Float32Array(sz);

	for (x = 0; x < sz; x++)
		this.map[x] = this.prng.get();
};
FOAM.Noise1D.prototype = {

	/**
		get the function value at x
		
		@method get
		@param x any real number
		@return value of function at x
	**/
	get: function(x) {
		var xf = this.xPeriod * Math.abs(x);
		var xi = Math.floor(xf);
		var mu = xf - xi;

		var xi0 = xi % this.xSize;
		var xi1 = (xi + 1) % this.xSize;

		return this.amplitude * FOAM.interpolate(this.map[xi0], this.map[xi1], mu);
	}
};

/**
	construct a 2D noise function

	@namespace FOAM
	@class Noise2D
	@constructor
	@param seed initial value for prng
	@param ampl maximum amplitude of function
	@param xsz length of source matrix in x
	@param xper period of noise function in x
	@param ysz length of source matrix in y (defaults to xsz)
	@param yper period of noise function in y (defaults to xper)
**/
FOAM.Noise2D = function(seed, ampl, xsz, xper, ysz, yper) {
	var x, xl;

	this.xSize = xsz;
	this.ySize = ysz || xsz;
	this.xPeriod = xper;
	this.yPeriod = yper || xper;
	this.amplitude = ampl;
	this.prng = new FOAM.Prng(seed);
	this.map = new Float32Array(this.xSize * this.ySize);

	for (x = 0, xl = this.map.length; x < xl; x++)
		this.map[x] = this.prng.get();
};
FOAM.Noise2D.prototype = {

	/**
		get the function value at (x, y)
		
		@method get
		@param x any real number
		@param y any real number
		@return value of function at (x, y)
	**/
	get: function(x, y) {
		var xf = this.xPeriod * Math.abs(x);
		var xi = Math.floor(xf);
		var mux = xf - xi;

		var yf = this.yPeriod * Math.abs(y);
		var yi = Math.floor(yf);
		var muy = yf - yi;

		var xi0 = xi % this.xSize;
		var yi0 = yi % this.ySize;
		var xi1 = (xi + 1) % this.xSize;
		var yi1 = (yi + 1) % this.ySize;

		var v1, v2, v3, v4;
		var i1, i2;

		v1 = this.map[xi0 + yi0 * this.xSize];
		v2 = this.map[xi0 + yi1 * this.xSize];
		i1 = FOAM.interpolate(v1, v2, muy);
		
		v3 = this.map[xi1 + yi0 * this.xSize];
		v4 = this.map[xi1 + yi1 * this.ySize];
		i2 = FOAM.interpolate(v3, v4, muy);

		return this.amplitude * FOAM.interpolate(i1, i2, mux);
	}
};

/**
	construct a 3D noise function

	@namespace FOAM
	@class Noise3D
	@constructor
	@param seed initial value for prng
	@param ampl maximum amplitude of function
	@param xsz length of source matrix in x
	@param xper period of noise function in x
	@param ysz length of source matrix in y (defaults to xsz)
	@param yper period of noise function in y (defaults to xper)
	@param zsz length of source matrix in z (defaults to xsz)
	@param zper period of noise function in z (defaults to xper)
**/
FOAM.Noise3D = function(seed, ampl, xsz, xper, ysz, yper, zsz, zper) {
	var x, xl;

	this.xSize = xsz;
	this.ySize = ysz || xsz;
	this.zSize = zsz || ysz || xsz;
	this.xPeriod = xper;
	this.yPeriod = yper || xper;
	this.zPeriod = zper || yper || xper;
	this.amplitude = ampl;
	this.prng = new FOAM.Prng(seed);
	this.map = new Float32Array(this.xSize * this.ySize * this.zSize);

	for (x = 0, xl = this.map.length; x < xl; x++)
		this.map[x] = this.prng.get();
};
FOAM.Noise3D.prototype = {

	/**
		get the function value at (x, y, z)
		
		@method get
		@param x any real number
		@param y any real number
		@param z any real number
		@return value of function at (x, y, z)
	**/
	get: function(x, y, z) {
		var xf = this.xPeriod * Math.abs(x);
		var xi = Math.floor(xf);
		var mux = xf - xi;

		var yf = this.yPeriod * Math.abs(y);
		var yi = Math.floor(yf);
		var muy = yf - yi;

		var zf = this.zPeriod * Math.abs(z);
		var zi = Math.floor(zf);
		var muz = zf - zi;

		var xi0 = xi % this.xSize;
		var yi0 = yi % this.ySize;
		var zi0 = zi % this.zSize;
		var xi1 = (xi + 1) % this.xSize;
		var yi1 = (yi + 1) % this.ySize;
		var zi1 = (zi + 1) % this.zSize;

		var v1, v2, v3, v4;
		var i1, i2, i3, i4;
		var xysz = this.xSize * this.ySize;

		v1 = this.map[xi0 + yi0 * this.xSize + zi0 * xysz];
		v2 = this.map[xi0 + yi0 * this.xSize + zi1 * xysz];
		i1 = FOAM.interpolate(v1, v2, muz);
		
		v3 = this.map[xi0 + yi1 * this.xSize + zi0 * xysz];
		v4 = this.map[xi0 + yi1 * this.xSize + zi1 * xysz];
		i2 = FOAM.interpolate(v3, v4, muz);

		i3 = FOAM.interpolate(i1, i2, muy);

		v1 = this.map[xi1 + yi0 * this.xSize + zi0 * xysz];
		v2 = this.map[xi1 + yi0 * this.xSize + zi1 * xysz];
		i1 = FOAM.interpolate(v1, v2, muz);
		
		v3 = this.map[xi1 + yi1 * this.xSize + zi0 * xysz];
		v4 = this.map[xi1 + yi1 * this.xSize + zi1 * xysz];
		i2 = FOAM.interpolate(v3, v4, muz);

		i4 = FOAM.interpolate(i1, i2, muy);

		return this.amplitude * FOAM.interpolate(i3, i4, mux);
	}
};


