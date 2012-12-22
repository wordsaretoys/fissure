<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Fissure</title>
		<link rel="stylesheet" type="text/css" media="screen" href="fissure.css">
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>

		<script type="text/javascript" src="foam.js"></script>
		<script type="text/javascript" src="fissure.js"></script>
		<script type="text/javascript" src="world.js"></script>
		<script type="text/javascript" src="player.js"></script>
		<script type="text/javascript" src="hud.js"></script>
		<script type="text/javascript" src="cave.js"></script>
		<script type="text/javascript" src="monologue.js"></script>
		<script type="text/javascript" src="salvage.js"></script>
		<script type="text/javascript" src="cloud.js"></script>
		<script type="text/javascript" src="junk.js"></script>

<?php
include("fissure.glsl");
?>
		<script type="text/javascript">
			jQuery(window).bind("load", function() {
				FISSURE.init();
			});
		</script>
    </head>
	<body>
		<canvas id="gl"></canvas>
		<div id="hud">
			<?php include("hud.html"); ?>
		</div>
	</body>
</html>
