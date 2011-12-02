<script id="vs-cave" type="x-shader/x-vertex">

/**
	cave vertex shader
**/

attribute vec3 position;
attribute vec2 texturec;

uniform mat4 projector;
uniform mat4 modelview;
uniform vec3 camerapos;

varying vec4 lightpos;
varying vec4 fragmpos;
varying vec2 uv;

void main(void) {
	gl_Position = projector * modelview * vec4(position, 1.0);
	fragmpos = modelview * vec4(position,  1.0);
	lightpos = modelview * vec4(camerapos, 1.0);
	uv = texturec;
}

</script>
<script id="fs-cave" type="x-shader/x-fragment">

/**
	cave fragment shader
**/

precision mediump float;
 
uniform sampler2D tex0;

varying vec4 lightpos;
varying vec4 fragmpos;
varying vec2 uv;

void main(void) {
	vec4 lightToFrag = fragmpos - lightpos;
	float lightFactor = pow(clamp((500.0 - length(lightToFrag)) / 500.0, 0.0, 1.0), 2.0);

	vec3 t0 = texture2D(tex0, uv * 1.0).x * vec3(0.8, 0.4, 0.2);
	vec3 t1 = texture2D(tex0, uv * 5.0).x * vec3(0.3, 0.6, 0.8);
	vec3 t2 = texture2D(tex0, uv * 25.0).x * vec3(0.6, 0.8, 0.5);
	vec3 t  = t0 + t1 + t2;
	gl_FragColor = vec4(t * lightFactor, 1.0); 
}

</script>
<script id="vs-cloud" type="x-shader/x-vertex">

/**
	cloud vertex shader
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
**/

precision mediump float;
 
uniform sampler2D tex0;
uniform vec2 offset;

varying vec2 uv;

void main(void) {
	vec2 tt = vec2(uv.x + offset.x, uv.y + offset.y);

	float t = 	(texture2D(tex0, tt * 0.0001).x +
				texture2D(tex0, tt * 0.001).x + 
				texture2D(tex0, tt * 0.01).x) * 0.9; 
	
	gl_FragColor = vec4(vec3(0.0, 0.0, 0.0), t); 
}

</script>
<script id="vs-salvage" type="x-shader/x-vertex">

/**
	salvage vertex shader
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
**/

precision mediump float;
 
uniform sampler2D tex0;

varying vec2 uv;

void main(void) {
	gl_FragColor = texture2D(tex0, uv * 4.0);
}

</script>

