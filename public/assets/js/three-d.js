var camera, scene, light, renderer, bulbLight, bulbMat, ambientLight, object, loader, stats;
var ballMat, cubeMat, floorMat, effect;
var floatingDiv;
var mouseX = 0, mouseY = 0;
var spheres = [];

var path = "/assets/textures/cube/skybox/";
var format = '.jpg';
var urls = [
	path + 'px' + format, path + 'nx' + format,
	path + 'py' + format, path + 'ny' + format,
	path + 'pz' + format, path + 'nz' + format
];

var textureCube = new THREE.CubeTextureLoader().load( urls );

var bulbLuminousPowers = {
	"110000 lm (1000W)": 110000,
	"3500 lm (300W)": 3500,
	"1700 lm (100W)": 1700,
	"800 lm (60W)": 800,
	"400 lm (40W)": 400,
	"180 lm (25W)": 180,
	"20 lm (4W)": 20,
	"Off": 0
};

// ref for solar irradiances: https://en.wikipedia.org/wiki/Lux
var hemiLuminousIrradiances = {
	"0.0001 lx (Moonless Night)": 0.0001,
	"0.002 lx (Night Airglow)": 0.002,
	"0.5 lx (Full Moon)": 0.5,
	"3.4 lx (City Twilight)": 3.4,
	"50 lx (Living Room)": 50,
	"100 lx (Very Overcast)": 100,
	"350 lx (Office Room)": 350,
	"400 lx (Sunrise/Sunset)": 400,
	"1000 lx (Overcast)": 1000,
	"18000 lx (Daylight)": 18000,
	"50000 lx (Direct Sun)": 50000,
};

var clock = new THREE.Clock();

var params = {
	shadows: true,
	exposure: 0.68,
	bulbPower: Object.keys( bulbLuminousPowers )[ 1 ],
	hemiIrradiance: Object.keys( hemiLuminousIrradiances )[0]
};

function addGeometry() {

	for( var i = 0; i < scene.children.length; i++ ) {

		var current = scene.children[ i ];

		if( current instanceof THREE.Mesh ) {

			current.geometry.dispose();
			scene.remove( current );
			i--;
		}
	}

	floorMat = new THREE.MeshStandardMaterial( {
		roughness: 0.8,
		color: 0xffffff,
		metalness: 0.2,
		bumpScale: 0.0005,
	});

	var textureLoader = new THREE.TextureLoader();
	textureLoader.load( "assets/textures/hardwood2_diffuse.jpg", function( map ) {
		map.wrapS = THREE.RepeatWrapping;
		map.wrapT = THREE.RepeatWrapping;
		map.anisotropy = 4;
		map.repeat.set( 10, 24 );
		floorMat.map = map;
		floorMat.needsUpdate = true;
	} );

	textureLoader.load( "assets/textures/hardwood2_bump.jpg", function( map ) {
		map.wrapS = THREE.RepeatWrapping;
		map.wrapT = THREE.RepeatWrapping;
		map.anisotropy = 4;
		map.repeat.set( 10, 34 );
		floorMat.bumpMap = map;
		floorMat.needsUpdate = true;
	} );

	textureLoader.load( "assets/textures/hardwood2_roughness.jpg", function( map ) {
		map.wrapS = THREE.RepeatWrapping;
		map.wrapT = THREE.RepeatWrapping;
		map.anisotropy = 4;
		map.repeat.set( 10, 24 );
		floorMat.roughnessMap = map;
		floorMat.needsUpdate = true;
	} );

	cubeMat = new THREE.MeshStandardMaterial( {
		roughness: 0.7,
		color: 0xffffff,
		bumpScale: 0.002,
		metalness: .2
	});

	textureLoader.load( "assets/textures/brick_diffuse.jpg", function( map ) {
		map.wrapS = THREE.RepeatWrapping;
		map.wrapT = THREE.RepeatWrapping;
		map.anisotropy = 4;
		map.repeat.set( .3, .3 );
		cubeMat.map = map;
		cubeMat.needsUpdate = true;
	} );

	textureLoader.load( "assets/textures/brick_bump.jpg", function( map ) {
		map.wrapS = THREE.RepeatWrapping;
		map.wrapT = THREE.RepeatWrapping;
		map.anisotropy = 4;
		map.repeat.set( 1, 1 );
		cubeMat.bumpMap = map;
		cubeMat.needsUpdate = true;
	} );

	ballMat = new THREE.MeshStandardMaterial( {
		color: 0xffffff,
		roughness: 0.5,
		metalness: 1.0
	});

	textureLoader.load( "assets/textures/planets/earth_atmos_2048.jpg", function( map ) {
		map.anisotropy = 4;
		ballMat.map = map;
		ballMat.needsUpdate = true;
	} );

	textureLoader.load( "assets/textures/planets/earth_specular_2048.jpg", function( map ) {
		map.anisotropy = 4;
		ballMat.metalnessMap = map;
		ballMat.needsUpdate = true;
	} );

	var floorGeometry = new THREE.PlaneBufferGeometry( 20, 20 );
	var floorMesh = new THREE.Mesh( floorGeometry, floorMat );

	floorMesh.receiveShadow = true;
	floorMesh.rotation.x = -Math.PI / 2.0;
	scene.add( floorMesh );

	var geometry = new THREE.ConeBufferGeometry( 0.3, 0.7, 50 );
	var meshMaterial = new THREE.MeshBasicMaterial( {color: 0xffffff, envMap :textureCube} );
	var mesh = new THREE.Mesh(geometry, meshMaterial);	
	mesh.position.set( 1, .85, 2 );
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	scene.add( mesh );

	var geometry2 = new THREE.BoxBufferGeometry( 0.75, 0.75, 0.75 );
	var mesh2 = new THREE.Mesh( geometry2, meshMaterial );
	mesh2.position.set(-0.75, 0.55, 1);
	mesh2.castShadow = true;
	mesh2.receiveShadow = true;
	scene.add( mesh2 );

	var geometry3 = new THREE.SphereBufferGeometry( 0.5, 32, 32);
	var mesh3 = new THREE.Mesh( geometry3, ballMat );
	mesh3.position.set(0.75, 0.65, -2);
	mesh3.castShadow = true;
	mesh3.receiveShadow = true;
	scene.add( mesh3 );

	var geometry4 = new THREE.SphereBufferGeometry( 0.1, 32, 32 );
	var sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube } );

	for ( var i = 0; i < 500; i ++ ) {
		var sphereMesh = new THREE.Mesh( geometry4, sphereMaterial );
		sphereMesh.position.x = Math.random() * 50 - 15;
		sphereMesh.position.y = Math.random() * 50 - 15;
		sphereMesh.position.z = Math.random() * 50 - 15;
		sphereMesh.castShadow = true;
		sphereMesh.receiveShadow = true;
		sphereMesh.scale.x = sphereMesh.scale.y = sphereMesh.scale.z = Math.random() * 2 + 1;
		scene.add( sphereMesh );
		spheres.push( sphereMesh );
	}

	window.addEventListener('keyup', function(e){

		function render1() {
			requestAnimationFrame( render1 );
			switch (e.keyCode){
				case 37:
					mesh.rotation.y -= 0.01;
					mesh2.rotation.y -= 0.01;
					mesh3.rotation.y -= 0.01;
					break;
				case 38:
					mesh.rotation.x -= 0.01;
					mesh2.rotation.x -= 0.01;
					mesh3.rotation.x -= 0.01;
					break;
				case 39:
					mesh.rotation.y += 0.01;
					mesh2.rotation.y += 0.01;
					mesh3.rotation.y += 0.01;
					break;
				case 40:
					mesh.rotation.x += 0.01;
					mesh2.rotation.x += 0.01;
					mesh3.rotation.x += 0.01;
					break;
			}

			renderer.render( scene, camera );
		}
		render1();
	});
	
}

function init() {
	
	var container = document.getElementById( 'container' );

	stats = new Stats();
	container.appendChild( stats.dom );

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 100 );
	camera.position.x = -4;
	camera.position.z = 4;
	camera.position.y = 2;

	scene = new THREE.Scene();
	scene.background = textureCube;

	var bulbGeometry = new THREE.SphereGeometry( 0.02, 16, 8 );
	bulbLight = new THREE.PointLight( 0xffee88, 1, 100, 2 );
	bulbMat = new THREE.MeshStandardMaterial( {
		emissive: 0xffffee,
		emissiveIntensity: 1,
		color: 0x000000
	});

	bulbLight.add( new THREE.Mesh( bulbGeometry, bulbMat ) );
	bulbLight.position.set( 0, 1.5, 0 );
	bulbLight.castShadow = true;
	scene.add( bulbLight );
	hemiLight = new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 0.02 );
	scene.add( hemiLight );

	light = new THREE.DirectionalLight( 0xffffff );
	scene.add( light );

	addGeometry();

	renderer = new THREE.WebGLRenderer();
	renderer.physicallyCorrectLights = true;
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.shadowMap.enabled = true;
	renderer.toneMapping = THREE.ReinhardToneMapping;
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	var width = window.innerWidth || 2;
	var height = window.innerHeight || 2;

	effect = new THREE.WebGLRenderer( renderer );
	effect.setSize( width, height );

	window.addEventListener( 'resize', onWindowResize, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mouseover', onDocumentMouseMove, false );

	floatingDiv = document.createElement( 'div' );
	floatingDiv.className = 'floating';
	container.appendChild( floatingDiv );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

	effect.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;
	mouseX = ( event.clientX - windowHalfX )/50;
	mouseY = ( event.clientY - windowHalfY )/50;

}

function animate() {
	var previousShadowMap = false;

	requestAnimationFrame( animate );

	camera.position.x += ( mouseX - camera.position.x ) * .05;
	camera.position.y += ( -mouseY - camera.position.y ) * .05;
	camera.lookAt( scene.position );

	renderer.toneMappingExposure = Math.pow( params.exposure, 5.0 ); // to allow for very bright scenes.
	renderer.shadowMap.enabled = params.shadows;
	bulbLight.castShadow = params.shadows;
	if( params.shadows !== previousShadowMap ) {
		ballMat.needsUpdate = true;
		cubeMat.needsUpdate = true;
		floorMat.needsUpdate = true;
		previousShadowMap = params.shadows;
	}
	bulbLight.power = bulbLuminousPowers[ params.bulbPower ];
	bulbMat.emissiveIntensity = bulbLight.intensity / Math.pow( 0.02, 2.0 ); // convert from intensity to irradiance at bulb surface
	hemiLight.intensity = hemiLuminousIrradiances[ params.hemiIrradiance ];
	var time = Date.now() * 0.0005;
	var delta = clock.getDelta();
	bulbLight.position.y = Math.cos( time ) * 0.75 + 1.25;
	// bulbLight.position.x = Math.cos( time ) * 1.6 + 1.5;
	// bulbLight.position.z = Math.sin( time ) * 1.1 - .25;
	renderer.render( scene, camera );
	stats.update();

	var timer = 0.0001 * Date.now();

	for ( var i = 0, il = spheres.length; i < il; i ++ ) {
		var sphere = spheres[ i ];
		sphere.position.x = 10 * Math.cos( timer + i );
		sphere.position.y = 10 * Math.sin( timer + i * 1.1 );
	}

}

init();
animate();