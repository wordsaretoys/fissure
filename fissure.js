/**

	Fissure: WebGL-based Game
	
	@module fissure
	@author cpgauthier

**/

var FISSURE = new function() {

	/**
		update all game objects that require it
		
		execute on every animation frame
		
		@method update
	**/

	this.update = function() {
		FISSURE.world.update();
		FISSURE.player.update();
		FISSURE.cave.update();
		FISSURE.salvage.update();
	};

	/**
		draw all drawable objects
		
		execute on every animation frame
		
		@method draw
	**/

	this.draw = function() {
		var gl = FOAM.gl;

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		FISSURE.cave.draw();
		FISSURE.salvage.draw();
		FISSURE.cloud.draw();
	};

	/**
		initialize FOAM library and game objects, load resources

		@method init
	**/

	this.init = function() {
		// initialize the Foam API
		if (!FOAM.init("gl", true)) {
			jQuery("#glerror").show();
			return;
		}
		gl = FOAM.gl;

		// set up any webgl stuff that's not likely to change
		gl.clearDepth(1.0);
		gl.depthFunc(gl.LEQUAL);
		gl.enable(gl.DEPTH_TEST);
		
		FISSURE.hud.init();
		FISSURE.hud.showIntro();

		// block until all binary resources loaded
		FOAM.resources.addImage("icons", "res/icons.png");
		FOAM.resources.addImage("noise", "res/noise.png");
		FOAM.resources.addImage("junk", "res/junk.png");
		
		// set up event handler to execute once for every resource loaded
		FOAM.resources.onLoad = function(count, total) {
			FISSURE.hud.advanceIntro(count, total);
		};

		// set up event handler to execute once loading complete
		FOAM.resources.onComplete = function() {

			// compile and link all shaders
			FOAM.shaders.build("cave", "vs-cave", "fs-cave",
								["position", "texturec"],
								["projector", "modelview", "camerapos"], 
								["tex0"] );
			FOAM.shaders.build("salvage", "vs-salvage", "fs-salvage", 
								["position", "texturec"],
								["projector", "modelview", "rotations", "center", "scale"],
								["tex0"] );
			FOAM.shaders.build("cloud", "vs-cloud", "fs-cloud", 
								["position", "texturec"],
								["projector", "modelview", "offset"], 
								["tex0"] );

			// compile textures from loaded images
			FOAM.textures.buildFromSprite("cloud-noise", "noise", 0, 0, 256, 256);
			FOAM.textures.buildFromSprite("cave-noise", "noise", 256, 0, 256, 256);
			FOAM.textures.buildFromSprite("junk0", "junk", 0, 0, 64, 64);
			FOAM.textures.buildFromSprite("junk1", "junk", 64, 0, 64, 64);
			FOAM.textures.buildFromSprite("junk2", "junk", 128, 0, 64, 64);

			FISSURE.cave.init();
			FISSURE.player.init();
			FISSURE.salvage.init();
			FISSURE.cloud.init();
			
			// set up event handler to execute when player starts game
			FISSURE.hud.completeIntro( function() {

				FISSURE.start();

				FOAM.schedule(FISSURE.update, 0, true);
				FOAM.schedule(FISSURE.draw, 0, true);

				// insure that window redraws when paused and resized			
				jQuery(window).bind("resize", function(){ FISSURE.draw() });
			} );
			
		};

		// begin loading
		FOAM.resources.load();
	};
	
	/**
		(re)start game by (re)setting game state to intial conditions

		@method start
	**/

	this.start = function() {
		FISSURE.hud.start();
		FISSURE.world.start();
		FISSURE.player.start();
		FISSURE.salvage.start();
		FISSURE.hud.showMonologue("intro");
		FISSURE.hud.curtainUp();
	};

};

