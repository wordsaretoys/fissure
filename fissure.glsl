/**
	shader programs

	@namespace FISSURE
**/

<script id="vs-cave" type="x-shader/x-vertex">

/**
	cave vertex shader
	O' = P * M * V * O transformation, plus texture coordinates
	
	@param position vertex array of positions
	@param texturec vertex array of texture coordinates
	
	@param projector projector matrix
	@param modelview modelview matrix
	
	(passed to fragment shader for each vertex)
	@param fragmpos position in eye coordinates
	@param uv texture coordinates
	
**/

attribute vec3 position;
attribute vec2 texturec;

uniform mat4 projector;
uniform mat4 modelview;

varying vec4 fragmpos;
varying vec2 uv;

void main(void) {
	fragmpos = modelview * vec4(position,  1.0);
	gl_Position = projector * fragmpos;
	uv = texturec;
}

</script>
<script id="fs-cave" type="x-shader/x-fragment">

/**
	cave fragment shader
	
	@param tex0	cave noise texture

	@param fragmpos	fragment position in eye coordinates
	@param uv texture coordinates of fragment
	
**/

precision mediump float;
 
uniform sampler2D tex0;

varying vec4 fragmpos;
varying vec2 uv;

void main(void) {
	// light factor based on a 500-meter radius shell
	// anything outside the shell has a light factor of zero == total darkness
	// light intensity drops off as the square of the distance
	float lightFactor = pow(clamp((500.0 - length(fragmpos)) / 500.0, 0.0, 1.0), 2.0);

	// create three "new" textures by stretching and coloring the noise texture
	vec3 t0 = texture2D(tex0, uv * 1.0).x * vec3(0.8, 0.4, 0.2);
	vec3 t1 = texture2D(tex0, uv * 5.0).x * vec3(0.3, 0.6, 0.8);
	vec3 t2 = texture2D(tex0, uv * 25.0).x * vec3(0.6, 0.8, 0.5);
	
	// sum textures to create perlin noise texture
	vec3 t  = t0 + t1 + t2;
	gl_FragColor = vec4(t * lightFactor, 1.0); 
}

</script>
<script id="vs-cloud" type="x-shader/x-vertex">

/**
	cloud vertex shader
	O' = P * M * V * O transformation, plus texture coordinates
	
	@param position vertex array of positions
	@param texturec vertex array of texture coordinates
	
	@param projector projector matrix
	@param modelview modelview matrix
	
	(passed to fragment shader for each vertex)
	@param uv texture coordinates
	
**/

attribute vec3 position;
attribute vec2 texturec;

uniform mat4 projector;
uniform mat4 modelview;

varying vec2 uv;

void main(void) {
	gl_Position = projector * modelview * vec4(position, 1.0);
	uv = texturec;
}

</script>
<script id="fs-cloud" type="x-shader/x-fragment">

/**
	cloud fragment shader
	
	@param tex0	cloud noise texture
	@param offset texture coordinate offset

	@param uv texture coordinates of fragment
	
**/

precision mediump float;
 
uniform sampler2D tex0;
uniform vec2 offset;

varying vec2 uv;

void main(void) {
	// offset the texture coordinates by some supplied values
	// (unique and random for each cloud polygon in the stack
	// so each layer of clouds looks different)
	vec2 tt = vec2(uv.x + offset.x, uv.y + offset.y);

	// sum over three stretched copies of the original texture
	// to create a perlin noise texture (all black clouds, so
	// don't worry about coloring the clouds as in cave above)
	float t = 	(texture2D(tex0, tt * 0.0001).x +
				texture2D(tex0, tt * 0.001).x + 
				texture2D(tex0, tt * 0.01).x) * 0.9; 
	
	gl_FragColor = vec4(vec3(0.0, 0.0, 0.0), t); 
}

</script>
<script id="vs-salvage" type="x-shader/x-vertex">

/**
	salvage vertex shader
	O' = P * M * V * ( S x O + C) transformation, plus texture coordinates
	
	@param position vertex array of positions
	@param texturec vertex array of texture coordinates
	
	@param projector projector matrix
	@param modelview modelview matrix
	@param center world coordinates to translate model
	@param scale radius to scale model
	
	(passed to fragment shader for each vertex)
	@param uv texture coordinates
	
**/

attribute vec3 position;
attribute vec2 texturec;

uniform mat4 projector;
uniform mat4 modelview;
uniform vec3 center;
uniform float scale;

varying vec2 uv;

void main(void) {
	vec3 rt = scale * vec4(position, 0.0).xyz + center;
	gl_Position = projector * modelview * vec4(rt, 1.0);
	uv = texturec;
}

</script>
<script id="fs-salvage" type="x-shader/x-fragment">

/**
	salvage fragment shader
	
	@param tex0	salvage texture

	@param uv texture coordinates of fragment
	
**/

precision mediump float;
 
uniform sampler2D tex0;

varying vec2 uv;

void main(void) {
	gl_FragColor = texture2D(tex0, uv * 4.0);
}

</script>

