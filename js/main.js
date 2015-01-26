
console.log('started')

InitializerPointerLock();
init();
GoToNextLevel();
animate();

var isAnimationEnabled = true
var isControlEnabled = false



var camera, scene, renderer;
var geometry, material, mesh;
var sounds;
var controls;

// For collision detection (cool!)
var verticallyCollidableObjects = [];
var raycaster;

var playerNumber = undefined
var sessionID = undefined

// TODO !!!
// TODO !!!
// TODO !!!
// TODO Listen for window unload, etc. DOM events, call node.js server's 'delete' method.
// TODO !!!
// TODO !!!
// TODO !!!

function GoToNextLevel()
{
	function requestListener()
	{
		var json = JSON.parse(this.responseText)

		playerNumber = json.pid
		sessionID = json.sid

		console.log('Requested new game from server, player',playerNumber,'session ID',sessionID)
/*
		console.log(this.responseText);
		console.log(json)
*/
		// TODO Start spinner.

		WaitForOtherPlayer()
	}

	var xhr = new XMLHttpRequest();
	xhr.onload = requestListener;
	xhr.open('get', '/game', true);
	xhr.send();
}

function WaitForOtherPlayer()
{
	function requestListener()
	{
		var json = JSON.parse(this.responseText)

//		playerNumber = json.pid
//		sessionID = json.sid

		var isReady = json

		console.log(json)

		if (json)
		{
			console.log('Other player is ready - starting game !!!')

//			isAnimationEnabled = true
			isControlEnabled = true
		}
		else
		{
			console.log('Other player is NOT ready')

			// Send another request!
			WaitForOtherPlayer()
		}
	}

	var xhr = new XMLHttpRequest();
	xhr.onload = requestListener;
	xhr.open('get', '/game/ready/' + sessionID + '/' + playerNumber, true);
	xhr.send();
}

function EndSession()
{
/*
	var xhr = new XMLHttpRequest();
	xhr.onload = requestListener;
	xhr.open('get', '/game', true);
	xhr.send();
*/
}

window.addEventListener('beforeunload', function(event)
{
	EndSession()
})

window.addEventListener('unload', function(event)
{
	EndSession()
})

// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

function InitializerPointerLock()
{
	var blocker = document.getElementById( 'blocker' );
	var instructions = document.getElementById( 'instructions' );
	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

	if ( havePointerLock )
	{

		var element = document.body;

		var pointerlockchange = function ( event ) {

			if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

				controlsEnabled = true;
				controls.enabled = true;

				blocker.style.display = 'none';

			} else {

				controls.enabled = false;

				blocker.style.display = '-webkit-box';
				blocker.style.display = '-moz-box';
				blocker.style.display = 'box';

				instructions.style.display = '';

			}

		}

		var pointerlockerror = function ( event ) {

			instructions.style.display = '';

		}

		// Hook pointer lock state change events
		document.addEventListener( 'pointerlockchange', pointerlockchange, false );
		document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
		document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

		document.addEventListener( 'pointerlockerror', pointerlockerror, false );
		document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
		document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

		instructions.addEventListener( 'click', function ( event ) {

			instructions.style.display = 'none';

			// Ask the browser to lock the pointer
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

			if ( /Firefox/i.test( navigator.userAgent ) ) {

				var fullscreenchange = function ( event ) {

					if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

						document.removeEventListener( 'fullscreenchange', fullscreenchange );
						document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

						element.requestPointerLock();
					}

				}

				document.addEventListener( 'fullscreenchange', fullscreenchange, false );
				document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

				element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

				element.requestFullscreen();

			} else {

				element.requestPointerLock();

			}

		}, false );

	}
	else
	{
		instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
	}

}

var controlsEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;

var canJump = true;

var prevTime = performance.now();
var velocity = new THREE.Vector3();


function onKeyDown(event)
{
	switch (event.keyCode)
	{
		case 38: // up
		case 87: // w
			moveForward = true;
			break;
		case 37: // left
		case 65: // a
			moveLeft = true; break;
		case 40: // down
		case 83: // s
			moveBackward = true;
			break;
		case 39: // right
		case 68: // d
			moveRight = true;
			break;
		case 32: // space
			if ( canJump === true ) velocity.y += 350;
			canJump = false;
			break;
	}
}

function onKeyUp(event)
{
	switch( event.keyCode )
	{
		case 38: // up
		case 87: // w
			moveForward = false;
			break;
		case 37: // left
		case 65: // a
			moveLeft = false;
			break;
		case 40: // down
		case 83: // s
			moveBackward = false;
			break;
		case 39: // right
		case 68: // d
			moveRight = false;
			break;
	}
}

function init()
{
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

	var ambientLight = new THREE.AmbientLight( 0xffffff )
	scene.add(ambientLight)
/*
	var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
	light.position.set( 0.5, 1, 0.75 );
	scene.add( light );
*/
	controls = new THREE.PointerLockControls( camera );
	scene.add( controls.getObject() );

	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

	//

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0xffffff );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	//

	window.addEventListener( 'resize', onWindowResize, false );
	
	//Sound stuff.
	sounds = function(name, src, loop, volume) 
	{
		sounds[name] = document.createElement('audio');
		sounds[name].setAttribute('src', src);
		sounds[name].setAttribute('loop', loop);
		sounds[name].setAttribute('volume', volume);
		sounds[name].setAttribute('autoplay', true);
		sounds[name].load();
	}
	sounds('cave', 'sounds/cave.mp3', true, 0.5);
	sounds('walking', 'sounds/walking.mp3', true, 1);
	sounds('running', 'sounds/running.mp3', true, 1);
	sounds.running.pause();
	sounds.walking.pause();
}

function onWindowResize()
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate()
{
/*
	if (!isAnimationEnabled)
	{
		// Just render, don't simulate / animate.
		renderer.render( scene, camera );
		return;
	}
*/

	requestAnimationFrame(animate)


	if (isControlEnabled && controlsEnabled)
	{
		raycaster.ray.origin.copy( controls.getObject().position );
		raycaster.ray.origin.y -= 10;

		var intersections = raycaster.intersectObjects( verticallyCollidableObjects );

		var isOnObject = intersections.length > 0;

		var time = performance.now();
		var delta = ( time - prevTime ) / 1000;

		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;

		velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

		if ( moveForward ) velocity.z -= 400.0 * delta;
		if ( moveBackward ) velocity.z += 400.0 * delta;

		if ( moveLeft ) velocity.x -= 400.0 * delta;
		if ( moveRight ) velocity.x += 400.0 * delta;

		if ( isOnObject === true )
		{
			velocity.y = Math.max( 0, velocity.y );
			canJump = true;
		}

		controls.getObject().translateX( velocity.x * delta );
		controls.getObject().translateY( velocity.y * delta );
		controls.getObject().translateZ( velocity.z * delta );

		// TODO Don't disable gravity :-)
		controls.getObject().position.y = 25
		if ( controls.getObject().position.y < -50 )
		{
			velocity.y = 0;
			// controls.getObject().position.y = -50;
			controls.getObject().position.y = 0;

			canJump = true;
		}

		prevTime = time;
		
		//Plays walking sound effect.
		if (controls.getObject().position.y <= 0 && (Math.abs(velocity.x) > 0.1 || Math.abs(velocity.z) > 0.1)) {
			if (sounds.walking.paused) {
				sounds.walking.currentTime = 0.75;
				sounds.walking.play();
			}
		} else {
			sounds.walking.pause();
		}
	}



	renderer.render( scene, camera );
	SendPositionToServer(controls.getObject().position.x, controls.getObject().position.z);

function SendPositionToServer()
{
	function requestListener()
	{
		var json = JSON.parse(this.responseText)
		console.log('other player location:', json)
	}
	var xhr = new XMLHttpRequest();
	xhr.onload = requestListener;
	xhr.open('post', '/game/' + sessionID + '/' + playerNumber + '/' + x + '/' + z, true);
	xhr.send();

}
