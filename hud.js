/**

	HUD Object

**/

FISSURE.hud = new function() {

	// jQuery's fader doesn't use our timebase
	// animation must pause when the game does
	var Fader = function(e) {
		var element = e;
		var time = 0;
		var period;
		var direction = 0;
		var callback = null;
		var nof = function() {};
		this.fadeIn = function(p, f) {
			period = p;
			time = period;
			direction = 1;
			element.css("opacity", "0");
			callback = f || nof;
		};
		this.fadeOut = function(p, f) {
			period = p;
			time = period;
			direction = -1;
			element.css("opacity", "1");
			callback = f || nof;
		};
		this.delay = function(p, f) {
			period = p;
			time = period;
			direction = 0;
			callback = f || nof;
		};
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
	};

	var MLFadeInTime = 500;
	var MLDisplayTime = 9000;
	var MLFadeOutTime = 500;
	var CurtainTime = 4000;

	var canPause = false;
	var dom, fader;
	
	this.monologuing = false;
	
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
		
		jQuery("#help").bind("click", function() {
			FISSURE.hud.togglePause();
		} );

//		FOAM.schedule(this.showDebug, 25, true);
	};
	
	this.start = function() {
		dom.meters.show();
		dom.scorebox.show();
	};

	this.setEnergy = function(energy, total) {
		var pc = Math.round(100 * energy / total);
		dom.emReadout.html( energy + "&nbsp;" );
		if (pc > 25)
			dom.emBar.css("backgroundColor", "#090");
		else if (pc > 10)
			dom.emBar.css("backgroundColor", "#990");
		else
			dom.emBar.css("backgroundColor", "#900");
		dom.emBar.width( pc + "%" );
	};

	this.setRads = function(rads, total) {
		var pc, rd = "";
		if (rads > total) {
			rd = "+";
			rads = total;
		}
		dom.rmReadout.html( rads + rd + "&nbsp;" );
		pc = Math.round(100 * rads / total);
		if (pc <= 50)
			dom.rmBar.css("backgroundColor", "#090");
		else if (pc > 50 && pc <= 75)
			dom.rmBar.css("backgroundColor", "#990");
		else
			dom.rmBar.css("backgroundColor", "#900");
		dom.rmBar.width( pc + "%" );
	};

	this.setSignal = function(level, maxLevel) {
		var pc, rd = "";
		if (level > maxLevel) {
			rd = "+";
			level = maxLevel;
		}
		pc = Math.round(100 * level / maxLevel);
		dom.ssReadout.html( pc + rd + "&nbsp;" );
		dom.ssBar.css("backgroundColor", "#090");
		dom.ssBar.width( pc + "%" );
	};
	
	this.setScore = function(score) {
		dom.score.html(score);
	};
	
	this.setProgress = function(items, maxItems) {
		dom.progress.html(items + " / " + maxItems);
	};

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

	function chop(n, d) {
		var p10 = Math.pow(10, d);
		return Math.round(n * p10) / p10;
	}

	this.showDebug = function() {
		var pos = FISSURE.player.position;
		var vel = FISSURE.player.velocity;

		var s = ""
		s += "fps: " + FOAM.fps + "<br>";
		s += "position: ( " + chop(pos.x, 3) + ", " + chop(pos.y, 3) + ", " + chop(pos.z, 3) + " )<br>";
		s += "velocity: ( " + chop(vel.x, 3) + ", " + chop(vel.y, 3) + ", " + chop(vel.z, 3) + " )<br>";
		jQuery("#debug").html(s);
	};

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
	
	this.update = function() {
		var i, il;
		for (i = 0, il = fader.mono.length; i < il; i++)
			fader.mono[i].update();
		fader.curtain.update();
	};
	
	this.showMonologue = function(id) {
		var text = FISSURE.monologue.getText(id);
		var fade1, fade2, fade3;
		var i, il;

		this.monologuing = true;

		for (i = 0, il = text.length; i < il; i++) {
			dom.mono[i].css("opacity", "0");
			dom.mono[i].html(text[i]);
		}

		// each line fades in once the one above it is finished fading in
		fade3 = function () {
			fader.mono[3].fadeIn(MLFadeInTime, function() {
				fader.mono[3].delay(MLDisplayTime, function() {
					fader.mono[3].fadeOut(MLFadeOutTime, function() {
						FISSURE.hud.monologuing = false;
					} );
				} )
			} );
		};

		fade2 = function () {
			fader.mono[2].fadeIn(MLFadeInTime, function() {
				fade3();
				fader.mono[2].delay(MLDisplayTime, function() {
					fader.mono[2].fadeOut(MLFadeOutTime);
				} )
			} );
		};

		fade1 = function () {
			fader.mono[1].fadeIn(MLFadeInTime, function() {
				fade2();
				fader.mono[1].delay(MLDisplayTime, function() {
					fader.mono[1].fadeOut(MLFadeOutTime);
				} )
			} );
		};

		fader.mono[0].fadeIn(MLFadeInTime, function() {
			fade1();
			fader.mono[0].delay(MLDisplayTime, function() {
				fader.mono[0].fadeOut(MLFadeOutTime);
			} )
		} );
	};
	
	this.curtainDown = function(callback) {
		fader.curtain.fadeIn(CurtainTime, callback);
	};
	
	this.curtainUp = function(callback) {
		fader.curtain.fadeOut(CurtainTime, callback);
	};

	this.showIntro = function() {
		dom.intro.css("visibility", "visible");
	};
	
	this.advanceIntro = function(count, total) {
		var pc = Math.round(100 * count / total) + "%";
		dom.introReadout.html(pc);
		dom.introBar.width(pc);
	};
	
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
				FISSURE.hud.enablePause();
				f();
			}
		};

		jQuery(window).bind("keydown", handler);
	};
	
	this.showCredits = function(f) {
		var handler;
		dom.meters.hide();
		dom.scorebox.hide();	

		dom.creditScore.html("FINAL SCORE: " + FISSURE.player.score);
		dom.credits.css("visibility", "visible");
		this.disablePause();
	
		handler = function(event) {
			if (FOAM.KEY.ENTER == event.keyCode) {
				jQuery(window).unbind("keydown", handler);
				dom.credits.css("visibility", "hidden");
				FISSURE.hud.enablePause();
				f();
			}
		};
		jQuery(window).bind("keydown", handler);

	};
	
	this.enablePause = function() {
		canPause = true;
		jQuery("#help-block").show();
	};
	
	this.disablePause = function() {
		canPause = false;
		jQuery("#help-block").hide();
	};
	
};
