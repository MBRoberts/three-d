var camera, scene, renderer, bulbLight, bulbMat;
var ballMat, cubeMat, floorMat;
var mouseX = 0, mouseY = 0;
var spheres = [];

var path = "/assets/textures/cube/skybox/";
var format = '.jpg';
var urls = [
	path + 'px' + format, 
	path + 'nx' + format,
	path + 'py' + format, 
	path + 'ny' + format,
	path + 'pz' + format, 
	path + 'nz' + format
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

var params = {
	shadows: true,
	exposure: 0.68,
	bulbPower: Object.keys( bulbLuminousPowers )[1],
	hemiIrradiance: Object.keys( hemiLuminousIrradiances )[0]
};

var clock = new THREE.Clock();

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
	});

	textureLoader.load( "assets/textures/hardwood2_bump.jpg", function( map ) {
		map.wrapS = THREE.RepeatWrapping;
		map.wrapT = THREE.RepeatWrapping;
		map.anisotropy = 4;
		map.repeat.set( 10, 34 );
		floorMat.bumpMap = map;
		floorMat.needsUpdate = true;
	});

	textureLoader.load( "assets/textures/hardwood2_roughness.jpg", function( map ) {
		map.wrapS = THREE.RepeatWrapping;
		map.wrapT = THREE.RepeatWrapping;
		map.anisotropy = 4;
		map.repeat.set( 10, 24 );
		floorMat.roughnessMap = map;
		floorMat.needsUpdate = true;
	});

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
	});

	textureLoader.load( "assets/textures/brick_bump.jpg", function( map ) {
		map.wrapS = THREE.RepeatWrapping;
		map.wrapT = THREE.RepeatWrapping;
		map.anisotropy = 4;
		map.repeat.set( 1, 1 );
		cubeMat.bumpMap = map;
		cubeMat.needsUpdate = true;
	});

	ballMat = new THREE.MeshStandardMaterial( {
		color: 0xffffff,
		roughness: 0.5,
		metalness: 1.0
	});

	textureLoader.load( "assets/textures/planets/earth_atmos_2048.jpg", function( map ) {
		map.anisotropy = 4;
		ballMat.map = map;
		ballMat.needsUpdate = true;
	});

	textureLoader.load( "assets/textures/planets/earth_specular_2048.jpg", function( map ) {
		map.anisotropy = 4;
		ballMat.metalnessMap = map;
		ballMat.needsUpdate = true;
	});

	var floorGeometry = new THREE.PlaneBufferGeometry( 50, 50 );
	var floorMesh = new THREE.Mesh( floorGeometry, floorMat );
	floorMesh.receiveShadow = true;
	floorMesh.rotation.x = -Math.PI / 2.0;
	scene.add( floorMesh );

	var geometry = new THREE.ConeBufferGeometry( 0.3, 0.7, 50 );
	var mesh = new THREE.Mesh(geometry, floorMat);	
	mesh.position.set( 2.75, .35, -6 );
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	scene.add( mesh );

	var geometry2 = new THREE.BoxBufferGeometry( 0.75, 0.75, 0.75 );
	var mesh2 = new THREE.Mesh( geometry2, cubeMat );
	mesh2.position.set(-4, 0.36, -1);
	mesh2.castShadow = true;
	mesh2.receiveShadow = true;
	scene.add( mesh2 );

	var geometry3 = new THREE.SphereBufferGeometry( 0.5, 32, 32);
	var mesh3 = new THREE.Mesh( geometry3, ballMat );
	mesh3.position.set(1.75, 0.5, -1.5);
	mesh3.castShadow = true;
	mesh3.receiveShadow = true;
	scene.add( mesh3 );

	var geometry4 = new THREE.SphereBufferGeometry( 0.1, 32, 32 );
	var sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube, metalness: 1, needsUpdate: true } );

	for ( var i = 0; i < 500; i ++ ) {
		var sphereMesh = new THREE.Mesh( geometry4, ballMat );
		sphereMesh.position.x = (Math.random() * 5) - 2;
		sphereMesh.position.y = (Math.random() * 5) - 2;
		sphereMesh.position.z = (Math.random() * 5) + 5;
		sphereMesh.castShadow = true;
		sphereMesh.receiveShadow = true;
		sphereMesh.scale.x = sphereMesh.scale.y = sphereMesh.scale.z = Math.random() * 2 + 1;
		scene.add( sphereMesh );
		spheres.push( sphereMesh );
	}

}

function init() {
	
	var container = document.getElementById( 'container' );
	var bulbGeometry = new THREE.SphereGeometry( 0.05, 32, 16 );
	var width = window.innerWidth || 2;
	var height = window.innerHeight || 2;

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.physicallyCorrectLights = true;
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.shadowMap.enabled = true;
	renderer.toneMapping = THREE.ReinhardToneMapping;
	container.appendChild( renderer.domElement );

	camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.8, 50 );
	camera.position.x = 60;
	camera.position.z = 3;
	camera.position.y = 2;

	scene = new THREE.Scene();
	scene.background = textureCube;

	bulbLight = new THREE.PointLight( 0xffee88, 1, 100, 1.5 );
	bulbMat = new THREE.MeshStandardMaterial( {
		emissive: 0xffffee,
		emissiveIntensity: 100,
		color: 0xFFFFFF
	});

	bulbLight.add( new THREE.Mesh( bulbGeometry, bulbMat ) );
	bulbLight.position.set( 0, 1.75, 0 );
	bulbLight.castShadow = true;
	scene.add( bulbLight );
	
	hemiLight = new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 0.02 );
	scene.add( hemiLight );

	addGeometry();

	window.addEventListener( 'resize', onWindowResize, false );

	track();

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function track( ) {

	var viewport = document.getElementById('viewport');
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	var tracker = new tracking.ObjectTracker('face');
	tracker.setInitialScale(4);
	tracker.setStepSize(2);

	tracking.track('#video', tracker, { camera: true });

	tracker.on('track', function(event) {
    var maxRectArea = 0;
    var maxRect;

    event.data.forEach(function(rect) {
		
		if (rect.width * rect.height > maxRectArea){
			maxRectArea = rect.width * rect.height;
			maxRect = rect;
		}

		context.clearRect(0, 0, canvas.width, canvas.height);
		context.strokeStyle = 'lime';
		context.strokeRect(rect.x, rect.y, rect.width, rect.height);
		context.font = '11px Helvetica';
		context.fillStyle = "#fff";
		context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
		context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
    });

    if(maxRectArea > 0) {
		var rectCenterX = maxRect.x + (maxRect.width/2);
		var rectCenterY = maxRect.y + (maxRect.height/2);
		mouseX = -(rectCenterX - 160) / (window.innerWidth/320)/ 2;
		mouseY = (rectCenterY - 120) / (window.innerHeight/240) / 2;
    }
  });


}

function animate() {

	var previousShadowMap = false;
	var timer = 0.001 * Date.now();

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
	
	// bulbLight.position.y = Math.cos( timer ) * 0.75 + 1.25;
	bulbLight.position.x = Math.cos( timer ) * 3.5 + 2.5;
	bulbLight.position.z = Math.sin( timer ) * 3.5 - .75;
	
	renderer.render( scene, camera );
	
	for ( var i = 0, il = spheres.length; i < il; i++ ) {
		var sphere = spheres[ i ];
		sphere.position.x = 25 * Math.cos( (timer/20) + i / 1.1);
		sphere.position.y = 15 * Math.sin( (timer/20) + i * 1.1 );
		sphere.position.z = 25 * Math.sin( (timer/20) + i );
	}

}

init();
animate();