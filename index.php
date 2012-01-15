<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Fissure</title>
		<link rel="stylesheet" type="text/css" media="screen" href="fissure.css">
		<link rel="stylesheet" type="text/css" media="screen" href="/shared/toybox.css">
		<script type="text/javascript" src="/shared/jquery-1.6.2.js"></script>

		<script type="text/javascript" src="/debug/foam/foam.js"></script>
		<script type="text/javascript" src="/debug/foam/resources.js"></script>
		<script type="text/javascript" src="/debug/foam/vector.js"></script>
		<script type="text/javascript" src="/debug/foam/quaternion.js"></script>
		<script type="text/javascript" src="/debug/foam/thing.js"></script>
		<script type="text/javascript" src="/debug/foam/shaders.js"></script>
		<script type="text/javascript" src="/debug/foam/textures.js"></script>
		<script type="text/javascript" src="/debug/foam/camera.js"></script>
		<script type="text/javascript" src="/debug/foam/mesh.js"></script>
		<script type="text/javascript" src="/debug/foam/noise.js"></script>
		
		<script type="text/javascript" src="/debug/fissure/fissure.js"></script>
		<script type="text/javascript" src="/debug/fissure/world.js"></script>
		<script type="text/javascript" src="/debug/fissure/player.js"></script>
		<script type="text/javascript" src="/debug/fissure/hud.js"></script>
		<script type="text/javascript" src="/debug/fissure/cave.js"></script>
		<script type="text/javascript" src="/debug/fissure/monologue.js"></script>
		<script type="text/javascript" src="/debug/fissure/salvage.js"></script>
		<script type="text/javascript" src="/debug/fissure/cloud.js"></script>
		<script type="text/javascript" src="/debug/fissure/junk.js"></script>

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
		<?php include($_SERVER["DOCUMENT_ROOT"] . "/shared/toybox.php"); ?>
		<canvas id="gl"></canvas>
		<div id="hud">
			<?php include("hud.html"); ?>
		</div>
	</body>
</html>
