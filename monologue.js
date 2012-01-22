/**
	store and retrieve monologues text

	@namespace FISSURE
	@class monologue
**/

FISSURE.monologue = new function() {

	/**
		retrieve a monologue
		
		@method getText
		@param id the id of the monologue
		@return the text of the monologue
	**/

	this.getText = function(id) {
		var i, il;
		for (i = 0, il = this.vignette.length; i < il; i++)
			if (this.vignette[i].id == id)
				return this.vignette[i].text;
		return [];
	};

	this.vignette = [
		{ id: "intro", text: [
			"<big>FISSURE</big>",
			"When I write a personals ad, there's one line I always include.",
			"\"You must be able to tolerate my sudden absences.\"",
			"Here I go again, I guess."
		] },
		
		{ id: "salv1", text: [
			"ITEMS SALVAGED: occlusional amplifier",
			"Amanda called me at the spaceport as I was loading the salvage capsule.",
			"She's got the whole <i>until we meet again</i> thing down to a science.",
			"\"Pick up a takeout,\" she said, like it was no big deal. \"Love you, Sarah.\""
		] },
		
		{ id: "salv2", text: [
			"ITEMS SALVAGED: rhombic filibuster, thaw gauge",
			"Investigators never established why Fissure Base blew up, beyond the obvious.",
			"\"A defect in the reactor lining released superheated plasma into the structure.\"",
			"No kidding. What else could have reduced it to a cloud of greasy smoke?"
		] },

		{ id: "salv3", text: [
			"ITEMS SALVAGED: hydrogynetric stablizer",
			"Without the main computer core to query, the investigation stalled.",
			"Shards of data crystal litter the wreckage, but they're not admissible as evidence.",
			"Fragmented and lacking context, they aren't necessarily <i>false</i>, just unreliable."
		] },

		{ id: "salv4", text: [
			"ITEMS SALVAGED: sectrifier, metapedic rationalizer",
			"A sample shard: \"We're on a train, heading for a broken section of track.\"",
			"\"When we strike the break, the train will derail, and we will die.\"",
			"\"We can't change tracks. We can't jump out of the windows, either.\" See?"
		] },

		{ id: "salv5", text: [
			"ITEMS SALVAGED: retrocalibration flange, auric standard",
			"If you're getting away from it all, a cracked moon isn't a bad place to start.",
			"No worries about solar radiation with a billion tons of rock around you.",
			"No worries about anyone dropping by for the scenery, either."
		] },

		{ id: "salv6", text: [
			"ITEMS SALVAGED: metasistor, hubric manifold",
			"Three of the building crew were killed during construction of the base.",
			"Maybe they're still around, in spirit. Faces in the smoke.",
			"The scientists definitely are. Superheated plasma, the great equalizer."
		] },

		{ id: "salv7", text: [
			"ITEMS SALVAGED: manode, Klein engine",
			"Faces in smoke. Reminds me of dating. Blurry faces glimpsed across a table.",
			"Most of them I didn't even make it into bed with. <i>So, you're a scavenger?</i>",
			"<i>No. Salvage.</i> But by that point, we'd both be flagging the waiter for the check."
		] },

		{ id: "salv8", text: [
			"ITEMS SALVAGED: gastroelectric battery assembly, integuum",
			"Amanda wasn't like that. When I met her, she was cleaning my puke off her shoe.",
			"Dirty site, heavy rads. I passed out on the trip back and woke up in the ICU.",
			"The nurse on duty looked up from her shoe and winked. \"Next time, have soup.\""
		] },

		{ id: "salv9", text: [
			"ITEMS SALVAGED: heliobore, microconnubial referometer, approxirotor",
			"I always research the site. Risk versus reward. If they don't balance, I don't go.",
			"Risk exceeds reward: non-starter. Reward exceeds risk: the big firms claim it.",
			"Fissure looked just right. Now I see why: insufficient data."
		] },

		{ id: "salv10", text: [
			"ITEMS SALVAGED: octobelm, pataphonographical orthomiser",
			"I'm not complaining. If I keep finding stuff like this, I can take it easy for a while.",
			"But this place was supposed be all gonzo metaphysics and hippie farts.",
			"Finding this level of technology makes me wonder what else might be lurking."
		] },

		{ id: "salv11", text: [
			"ITEMS SALVAGED: orthovanabriatic clamp, parabolum",
			"No visitors allowed, though they let a reporter from BLAM tour the base once.",
			"Slice of life stuff, nothing heavy. They turned the \"goofy hippie\" vibe up to eleven.",
			"I have to say, the dance they performed in honor of her visit wasn't very good."
		] },

		{ id: "salv12", text: [
			"ITEMS SALVAGED: tediometer, assumptive parahandler, dubious autocorrector",
			"The BLAM reporter was tripping on whimsy by the time she left Fissure.",
			"\"They're harmless,\" she said, before going home to file her story.",
			"Benefit of hindsight: I think she might have missed something."
		] },

		{ id: "salv13", text: [
			"ITEMS SALVAGED: tri-phase spindle, simplifying drone assembly",
			"\"The train's a'coming,\" croons another shard, \"but there's gold on the other side.\"",
			"\"We broke the track, we drilled the crack. Pressure makes diamonds from coal.\"",
			"I won't bother with the extended dance cut. Everyone's thinks they're an artist."
		] },

		{ id: "salv14", text: [
			"ITEMS SALVAGED: moebium, patagraphic projection module",
			"Applied metaphysics is crap. You can't bridge a ravine with good intentions.",
			"If there is a vast unseen world, I bet it's actually too small to notice.",
			"Mice running through the cracks of the universe. <i>Ha!</i> That's how I feel right now."
		] },

		{ id: "salv15", text: [
			"ITEMS SALVAGED: Bose-Einstein condensor",
			"By the time I'd recovered from rad sickness, I knew I liked Amanda.",
			"But you just <i>try</i> asking someone out after you've puked on their shoes.",
			"Anyway, she answered my personal ad a week later. \"That you, Sarah?\""
		] },

		{ id: "salv16", text: [
			"ITEMS SALVAGED: cannister of deoxyaesthetic acid, missionary piston",
			"Not all of the shards are silly and frivolous. Some are dull and boring.",
			"Excerpts of dry academic studies on how working groups perform in isolation.",
			"Conclusions: the riskier the deadline, the more rewarding the outcome."
		] },

		{ id: "salv17", text: [
			"ITEMS SALVAGED: ulterior motivational assembly, continuum assumer",
			"They weren't getting away from it all, were they? Not with this equipment.",
			"The news made Fissure Base sound like a sex-and-drugs romp for nerds.",
			"\"Eminient Scientists Gone Wild.\" No way. This was something else."
		] },

		{ id: "salv18", text: [
			"ITEMS SALVAGED: pecunial morphologic assembly, theodecline",
			"Then, there's the reactor defect. It made sense if you followed the narrative.",
			"A bunch of stoned assholes wouldn't have interpreted the telltales properly.",
			"Once you start doubting that narrative, however, the whole story falls apart."
		] },

		{ id: "salv19", text: [
			"ITEMS SALVAGED: oomphometer, dual-underheaded patadriver",
			"\"Science is broken,\" explains one shard. \"Progress has stalled for a century.\"",
			"\"I went into banking. My colleagues were reduced to praying for enlightenment.\"",
			"\"Well, if you're going that route anyway, how about a little human sacrifice?\""
		] },

		{ id: "salv20", text: [
			"ITEMS SALVAGED: respite penalizer, gynolocator",
			"Every time I climb into this capsule I think, <i>I can't do this.</i>",
			"Once the transport's left and I'm facing the site I think, <i>I have to do this.</i>",
			"Anything's possible when nothing else is."
		] },

		{ id: "salv21", text: [
			"ITEMS SALVAGED: fusionometer, tau omitter",
			"A few weeks after we started dating, Amanda had to deal with an emergency.",
			"Biohazard containment failed on her ward. She calmly wheeled the patients out.",
			"\"It's my job,\" she said, smiling at me through the screen in the quarantine area."
		] },

		{ id: "salv22", text: [
			"ITEMS SALVAGED: octolinear pericompressor",
			"What would you do if your job was to advance knowledge, but it just wouldn't go?",
			"How far would you go to push it?",
			"How far would you push yourself?"
		] },

		{ id: "salv23", text: [
			"ITEMS SALVAGED: amphlaxiometer, barycentrometer",
			"\"The reporter from BLAM has left us,\" says the shard, with a sigh of relief.",
			"\"It was a nice break, but we've got to get back to work.\"",
			"\"Our first order of business is to weld the airlocks shut again.\""
		] },

		{ id: "salv24", text: [
			"ITEMS SALVAGED: barachitor, cannister of protosartoric ester",
			"Did they suceed? No idea. Aren't scientists supposed to report their findings?",
			"Maybe they decided to destroy all their work if they failed.",
			"<i>If</i> they failed. Applied metaphysics...faces in the smoke. I wonder."
		] },

		{ id: "salv25", text: [
			"ITEMS SALVAGED: progentiometer, symbolic void pointer",
			"There's another line I always use in my personal ads.",
			"\"When I make it home, I'll have one hell of a story to tell you.\"",
			"Here I go again."
		] }

	];
};

