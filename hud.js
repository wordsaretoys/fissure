/**
	handle heads-up display and general ui functions

	@namespace FISSURE
	@class hud
**/

FISSURE.hud = new function() {

	/**
		provides a fader for UI elements that works
		on the same timebase as the rest of the code
		
		jQuery's fader uses its own timebase, so its
		animations won't reliably pause when mine do

		@param e jQuery element to fade
		@method Fader

	**/
	var Fader = function(e) {
		var element = e;
		var time = 0;
		var period;
		var direction = 0;
		var callback = null;
		var nof = function() {};

		/**
			start fading the element in
		
			@method fadeIn
			@param p time period for fade
			@param f function to call when fade completed
		**/
		
		this.fadeIn = function(p, f) {
			period = p;
			time = period;
			direction = 1;
			element.css("opacity", "0");
			callback = f || nof;
		};

		/**
			start fading the element out
	
			@method fadeOut
			@param p time period for fade
			@param f function to call when fade completed
		**/
		
		this.fadeOut = function(p, f) {
			period = p;
			time = period;
			direction = -1;
			element.css("opacity", "1");
			callback = f || nof;
		};

		/**
			simple delay: wait, then call a function
		
			@method delay
			@param p time period to delay
			@param f function to call when delay over
		**/
		
		this.delay = function(p, f) {
			period = p;
			time = period;
			direction = 0;
			callback = f || nof;
		};

		/**
			called by the FOAM framework to update the fader
			do not call in user code
		
			@method update
		**/
		
		this.update = function() {
			var op;
			if (time > 0) {
				time = Math.max(0, time - FOAM.interval);
				if (direction) {
					op = Math.min(1, (period - time) / period);
					if (direction == -1)
						op = 1 - op;
					element.css("opacity", op + "");
				}
				if (time == 0)
					callback();
			}
		};

		// schedule the update
		FOAM.schedule(this.update, 0, true);
	};

	var MLFadeInTime = 500;
	var MLDisplayTime = 9000;
	var MLFadeOutTime = 500;
	var CurtainTime = 4000;

	var canPause = false;
	var dom, fader;
	
	this.monologuing = false;
	
	/**
		establish jQuery shells around UI DOM objects &
		assign methods for simple behaviors like size &
		initialize meters
		
		@method init
	**/
	
	this.init = function() {

		dom = {
			hud: jQuery("#hud"),

			meters: jQuery("#meters"),

			emFrame: jQuery("#emFrame"),
			emReadout: jQuery("#emReadout"),
			emBar: jQuery("#emBar"),

			rmFrame: jQuery("#rmFrame"),
			rmReadout: jQuery("#rmReadout"),
			rmBar: jQuery("#rmBar"),
			
			ssFrame: jQuery("#ssFrame"),
			ssReadout: jQuery("#ssReadout"),
			ssBar: jQuery("#ssBar"),
			
			mono: [
				jQuery("#mono0"),
				jQuery("#mono1"),
				jQuery("#mono2"),
				jQuery("#mono3")
			],

			curtain: jQuery("#curtain"),

			scorebox: jQuery("#scorebox"),
			progress: jQuery("#progress"),
			score: jQuery("#score"),

			credits: jQuery("#credits"),
			creditScore: jQuery("#final-score"),

			intro: jQuery("#intro"),
			introBox: jQuery("#intro-box"),
			introBar: jQuery("#intro-bar"),
			introReadout: jQuery("#intro-readout"),
			introStart: jQuery("#intro-start-button"),
			introPause: jQuery("#intro-pause-button")
		};
		
		fader = {
			curtain: new Fader(dom.curtain),
			mono: [
				new Fader(dom.mono[0]),
				new Fader(dom.mono[1]),
				new Fader(dom.mono[2]),
				new Fader(dom.mono[3])
			]
		};
		
		this.setEnergy(0, 0);
		this.setRads(0, 0);
		this.setSignal(0, 1);
		this.resize();
		
		var instance = this;
		jQuery(window).bind("resize", function(){ instance.resize() });
		jQuery(window).bind("keydown", instance.onKeyDown);
		
		dom.meters.hide();
		dom.scorebox.hide();
	};
	
	/**
		insure meters and scores are shown at game start
		
		@method start
	**/

	this.start = function() {
		dom.meters.show();
		dom.scorebox.show();
	};

	/**
		set the level to display in the energy meter
		
		@method setEnergy
		@param energy current player energy
		@param total maximum player energy
	**/

	this.setEnergy = function(energy, total) {
		var pc = Math.round(100 * energy / total);
		dom.emReadout.html( energy );

		// display energy bar as red, yellow, or green
		// depending how critical the energy level is
		if (pc > 25)
			dom.emBar.css("backgroundColor", "#090");
		else if (pc > 10)
			dom.emBar.css("backgroundColor", "#990");
		else
			dom.emBar.css("backgroundColor", "#900");
		dom.emBar.width( pc + "%" );
	};

	/**
		set the level to display in the radiation meter
		
		@method setRads
		@param rads ambient radiation level
		@param total maximum displayable radiation level
	**/

	this.setRads = function(rads, total) {
		var pc, rd = "";

		// cap ambient rads at total and append "+" if it exceeds
		if (rads > total) {
			rd = "+";
			rads = total;
		}
		dom.rmReadout.html( rads + rd );
		pc = Math.round(100 * rads / total);
		
		// display rads bar as green, yellow, red
		// depending on how critical rad level is
		if (pc <= 50)
			dom.rmBar.css("backgroundColor", "#090");
		else if (pc > 50 && pc <= 75)
			dom.rmBar.css("backgroundColor", "#990");
		else
			dom.rmBar.css("backgroundColor", "#900");
		dom.rmBar.width( pc + "%" );
	};

	/**
		set the level to display in the signal meter
		
		@method setSignal
		@param level current signal level
		@param maxLevel maximum displayable signal level
	**/

	this.setSignal = function(level, maxLevel) {
		var pc, rd = "";

		// cap signal level at total and append "+" if it exceeds
		if (level > maxLevel) {
			rd = "+";
			level = maxLevel;
		}
		pc = Math.round(100 * level / maxLevel);
		dom.ssReadout.html( pc + rd );
		dom.ssBar.css("backgroundColor", "#090");
		dom.ssBar.width( pc + "%" );
	};
	
	/**
		set the score to display
		
		@method setScore
		@param score current score
	**/

	this.setScore = function(score) {
		dom.score.html(score);
	};
	
	/**
		set progress level (items collected) to display
		
		@method setProgress
		@param items number of items collected
		@param maxItems number of items in game
	**/

	this.setProgress = function(items, maxItems) {
		dom.progress.html(items + " / " + maxItems);
	};

	/**
		adjust UI elements in response to browser window resize

		some elements are attached to the edges via CSS, and do
		not require manual resizing or recentering
		
		@method resize
	**/

	this.resize = function() {
		dom.hud.width(FOAM.width);
		dom.hud.height(FOAM.height);
		
		dom.curtain.width(FOAM.width);
		dom.curtain.height(FOAM.height);

		dom.intro.offset( { top: (FOAM.height - dom.intro.height()) / 2,
							left: (FOAM.width - dom.intro.width()) / 2 } );
							
		dom.credits.offset( {
			top: (FOAM.height - dom.credits.height()) / 2, 
			left: (FOAM.width - dom.credits.width()) / 2 } );
	};

	/**
		handle a keypress
		
		note that the hud object only handles keys related to 
		HUD activity. see player.js for motion control keys
		
		@method onKeyDown
		@param event browser object containing event information
		@return true to enable default key behavior
	**/

	this.onKeyDown = function(event) {
		switch(event.keyCode) {
			case FOAM.KEY.ESCAPE:
				FISSURE.hud.togglePause();
				break;
			default:
				//window.alert(event.keyCode);
				break;
		}
	};

	/**
		toggle between running and non-running game states
		
		non-running means put up the "pause curtain" to darken scene,
		stop the FOAM engine, and put up the instructions/game intro
		
		@method togglePause
	**/

	this.togglePause = function() {
		if (canPause) {
			if (FOAM.running) {
				FOAM.running = false;
				dom.curtain.oldOpacity = dom.curtain.css("opacity");
				dom.curtain.css("opacity", "0.75");
				dom.intro.css("visibility", "visible");
			}
			else {
				FOAM.running = true;
				dom.curtain.css("opacity", dom.curtain.oldOpacity);
				dom.intro.css("visibility", "hidden");
			}
		}
	};
	
	/**
		display a particular monologue on screen
		
		monologues are faded in one line at a time, then after a
		delay, they are faded out one line at a time. each line
		is responsible for kicking off the one immediately below
		
		@method showMonologue
		@param id monologue to display
	**/

	this.showMonologue = function(id) {
		var text = FISSURE.monologue.getText(id);
		var fade1, fade2, fade3;
		var i, il;

		this.monologuing = true;

		for (i = 0, il = text.length; i < il; i++) {
			dom.mono[i].css("opacity", "0");
			dom.mono[i].html(text[i]);
		}

		// set up fade pattern for the LAST line of the monologue
		// fade in -> delay -> fade out
		fade3 = function () {
			fader.mono[3].fadeIn(MLFadeInTime, function() {
				fader.mono[3].delay(MLDisplayTime, function() {
					fader.mono[3].fadeOut(MLFadeOutTime, function() {
						FISSURE.hud.monologuing = false;
					} );
				} )
			} );
		};

		// set up fade pattern for the 3RD line of monologue
		// fade in -> start LAST line pattern, delay -> fade out
		fade2 = function () {
			fader.mono[2].fadeIn(MLFadeInTime, function() {
				fade3();
				fader.mono[2].delay(MLDisplayTime, function() {
					fader.mono[2].fadeOut(MLFadeOutTime);
				} )
			} );
		};

		// set up fade pattern for the 2ND line of monologue
		// fade in -> start 3RD line pattern, delay -> fade out
		fade1 = function () {
			fader.mono[1].fadeIn(MLFadeInTime, function() {
				fade2();
				fader.mono[1].delay(MLDisplayTime, function() {
					fader.mono[1].fadeOut(MLFadeOutTime);
				} )
			} );
		};

		// set up fade pattern for the FIRST line of monologue
		// fade in -> start 2ND line pattern, delay -> fade out
		fader.mono[0].fadeIn(MLFadeInTime, function() {
			fade1();
			fader.mono[0].delay(MLDisplayTime, function() {
				fader.mono[0].fadeOut(MLFadeOutTime);
			} )
		} );
	};
	
	/**
		fades in the pause curtain
		
		@method curtainDown
		@param callback method to call after curtain down
	**/

	this.curtainDown = function(callback) {
		fader.curtain.fadeIn(CurtainTime, callback);
	};
	
	/**
		fades out the pause curtain
		
		@method curtainUp
		@param callback method to call after curtain up
	**/

	this.curtainUp = function(callback) {
		fader.curtain.fadeOut(CurtainTime, callback);
	};

	/**
		displays the intro/help screen
		
		@method showIntro
	**/

	this.showIntro = function() {
		dom.intro.css("visibility", "visible");
	};
	
	/**
		advances the progress meter on the intro/help screen
		
		@method advanceIntro
		@param count how many resources have been loaded
		@param total total numbers of resources to load
	**/

	this.advanceIntro = function(count, total) {
		var pc = Math.round(100 * count / total) + "%";
		dom.introReadout.html(pc);
		dom.introBar.width(pc);
	};
	
	/**
		indicates that resource load is complete and
		prompts user to press Enter to start game
		
		@method completeIntro
		@param f method to call when player presses Enter
	**/

	this.completeIntro = function(f) {
		var handler;
		dom.introBox.hide();
		dom.introStart.show();

		handler = function(event) {
			if (FOAM.KEY.ENTER == event.keyCode) {
				jQuery(window).unbind("keydown", handler);
				dom.introStart.hide();
				dom.introPause.show();
				dom.intro.css("visibility", "hidden");
				canPause = true;
				f();
			}
		};

		jQuery(window).bind("keydown", handler);
	};
	
	/**
		displays the game credits and gives player option of replay
		
		@method showCredits
		@param f method to call if player chooses replay
	**/

	this.showCredits = function(f) {
		var handler;
		dom.meters.hide();
		dom.scorebox.hide();	

		dom.creditScore.html("FINAL SCORE: " + FISSURE.player.score);
		dom.credits.css("visibility", "visible");
		canPause = false;
	
		handler = function(event) {
			if (FOAM.KEY.ENTER == event.keyCode) {
				jQuery(window).unbind("keydown", handler);
				dom.credits.css("visibility", "hidden");
				canPause = true;
				f();
			}
		};
		jQuery(window).bind("keydown", handler);

	};

};
