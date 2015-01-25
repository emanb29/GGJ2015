
var GAME = { };

GAME.Wall = 0
GAME.Floor = 1
GAME.Pit = 2
//GAME.Door = 3
GAME.Trap = 4
GAME.Start = 5
GAME.End = 6


//   _____ _                        _ 
//  / ____| |                      | |
// | (___ | |__   __ _ _ __ ___  __| |
//  \___ \| '_ \ / _` | '__/ _ \/ _` |
//  ____) | | | | (_| | | |  __/ (_| |
// |_____/|_| |_|\__,_|_|  \___|\__,_| Shared

function LoadFile(url)
{
	var asynchronous = false;	// TODO

	var client = new XMLHttpRequest();
	client.open('GET', url, asynchronous);
	var result
	client.onreadystatechange = function()
	{
		result = client.responseText
	}
	client.send();
	return result
}





function ParseLevel(levelString)
{
	asciiToEnum = {
		'#': GAME.Wall,
		'.': GAME.Floor,
		'o': GAME.Pit,
		'w': GAME.Trap,
		'@': GAME.Start,
		'$': GAME.End
	}

	function ConvertMapASCIIToEnum(ascii)
	{
		return asciiToEnum[ascii]
	}

	// Get dimensions
	var rows = levelString.replace( /\n/g, " " ).split( " " )
	var height = rows.length;
	var width = rows[0].length;

	// Flatten the string, process it into objects, build 2D array from those objects.
	var flattenedLevelCharacterArray = levelString.replace( /\n/g, "").split('')
	var flattenedLevelEnums = _.map(flattenedLevelCharacterArray, ConvertMapASCIIToEnum)

	// Create 2D array from flat one.
	var levelEnums = []
	for (var y = 0; y < height; y++)
	{
		var row = []
		levelEnums.push(row)
		for (var x = 0; x < height; x++)
		{
			row.push(flattenedLevelEnums[y*width+x])
		}
	}

	return levelEnums
}

function LoadLevel(truth, p1, p2)
{
	// Turn into 3x 2D arrays of stuff.
	var level_truth = ParseLevel(LoadFile(truth))
	var level_p1 = ParseLevel(LoadFile(p1))
	var level_p2 = ParseLevel(LoadFile(p2))

	return [level_truth, level_p1, level_p2]
}



//   _____                          
//  / ____|                         
// | (___   ___ _ ____   _____ _ __ 
//  \___ \ / _ \ '__\ \ / / _ \ '__|
//  ____) |  __/ |   \ V /  __/ |   
// |_____/ \___|_|    \_/ \___|_|   Server

SERVER = {}


/*

Authoritative server.

*/

// rooms/puzzleRooms/puzzleRoom1/puzzle
// rooms/puzzleRooms/puzzleRoom1/puzzleRoom1
// rooms/puzzleRooms/puzzleRoom1/puzzleRoom1P1
// rooms/puzzleRooms/puzzleRoom1/puzzleRoomP2
// rooms/puzzleRooms/puzzleRoom2/puzzle
// rooms/puzzleRooms/puzzleRoom2/puzzleRoom2
// rooms/puzzleRooms/puzzleRoom2/puzzleRoom2P1
// rooms/puzzleRooms/puzzleRoom2/puzzleRoom2P2

rooms = [
	{
		truth: 'rooms/testRoom/testRoom.txt',
		p1: 'rooms/testRoom/testRoomP1.txt',
		p2: 'rooms/testRoom/testRoomP2.txt'
	},

	{
		description: 'rooms/room1/do-you-see-what-i-see',
		truth: 'rooms/room1/room1',
		p1: 'rooms/room1/room1P1',
		p2: 'rooms/room1/room1P2'
	},

	{
		description: 'rooms/room2/trust-(not)-fall',
		truth: 'rooms/room2/room2',
		p1: 'rooms/room2/room2P1',
		p2: 'rooms/room2/room2P2'
	},

	{
		description: 'rooms/room3/stop-short',
		truth: 'rooms/room3/room3',
		p1: 'rooms/room3/room3P1',
		p2: 'rooms/room3/room3P2'
	},

	{
		description: 'rooms/room4/which-way-around',
		truth: 'rooms/room4/room4',
		p1: 'rooms/room4/room4P1',
		p2: 'rooms/room4/room4P2'
	},

	{
		description: 'rooms/room5/is-it-my-turn',
		truth: 'rooms/room5/room5',
		p1: 'rooms/room5/room5P1',
		p2: 'rooms/room5/roomP2'
	},

	{
		description: 'rooms/room6/switchback',
		truth: 'rooms/room6/room6',
		p1: 'rooms/room6/room6P1',
		p2: 'rooms/room6/room6P2'
	}
]


// Load the level
var room = rooms[0]
var level = LoadLevel(room.truth, room.p1, room.p2)
SERVER.LevelTruth = level[0]; SERVER.LevelP1 = level[1]; SERVER.LevelP2 = level[2]


// TODO Send level to clients - all 3 versions (just make it easier).
CLIENT = {} 					// TODO TEMPORARY - REMOVE WHEN WE HAVE PROPER CLIENT / SERVER
CLIENT.LevelTruth = SERVER.LevelTruth; CLIENT.LevelP1 = SERVER.LevelP1; CLIENT.LevelP2 = SERVER.LevelP2;	// TODO TEMPORARY - REMOVE WHEN WE HAVE PROPER CLIENT / SERVER

// TODO Accept player inputs



//   _____ _ _            _   
//  / ____| (_)          | |  
// | |    | |_  ___ _ __ | |_ 
// | |    | | |/ _ \ '_ \| __|
// | |____| | |  __/ | | | |_ 
//  \_____|_|_|\___|_| |_|\__| Client

//var CLIENT = {}		// TODO TEMPORARY - UNCOMMENT AFTER WE SETUP CLIENT / SERVER
var playerNumber = 1;	// Either 1 or 2.  This is sent to the client by the server at startup.


/*

Get all state from server:
	level
	player
Simulate input & physics locally, but overwrite with whatever server sends across
Send inputs to server

*/

function PutLevelIntoSceneGraph()
{
	var displayedLevel = CLIENT.playerNumber == 1 ? CLIENT.LevelP1: CLIENT.LevelP2;

	var blockLength = 20;
	var blockHeight = 40;

	var geometries = {}
	geometries[GAME.Wall] = new THREE.BoxGeometry( blockLength, blockHeight, blockLength )
	geometries[GAME.Floor] = new THREE.BoxGeometry( blockLength, blockHeight / 2.0, blockLength ); 
	geometries[GAME.Pit] = undefined
	geometries[GAME.Trap] = new THREE.CylinderGeometry( 0, blockLength * 0.25, blockHeight / 2.0, 8, 1, false );
	geometries[GAME.Start] = new THREE.SphereGeometry( blockLength * 0.2)
	geometries[GAME.End] = new THREE.SphereGeometry( blockLength * 0.25 )


	var materials = {}
	materials[GAME.Wall] = new THREE.MeshBasicMaterial( { color: 0x777777 })
	materials[GAME.Floor] = undefined
	materials[GAME.Pit] = new THREE.MeshBasicMaterial( { color: 0x000000 })
	materials[GAME.Door] = new THREE.MeshBasicMaterial( { color: 0xff0000 })

	var offsets = {}
	offsets[GAME.Wall] = 0.0
	offsets[GAME.Floor] = -blockHeight / 2.0
	offsets[GAME.Pit] = -blockHeight / 2.0
	offsets[GAME.Trap] = 0.0
	offsets[GAME.Start] = 0.0
	offsets[GAME.End] = 0.0


	// material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
//	material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
	material = new THREE.MeshBasicMaterial( { color: 0xff0000 });

	// Store 
	var startingMazeX = 0
	var startingMazeZ = 0

	for (var z = 0; z < displayedLevel.length; z++)
	{
		for (var x = 0; x < displayedLevel[0].length; x++)
		{
			var block = displayedLevel[x][z]

			var geometry = geometries[block]
			var material = materials[block]

			mesh = new THREE.Mesh( geometry, material );
			scene.add( mesh );
			mesh.position.x = x * blockLength
			mesh.position.z = z * blockLength
			mesh.position.y = offsets[block]
//			mesh.position.y = blockHeight / 2.0

			if (block == GAME.Start)
			{
				startingMazeX = x
				startingMazeZ = z
			}

			verticallyCollidableObjects.push(mesh);
		}
	}


	// Move player to their starting location.
	var startingX = startingMazeX * blockLength
	var startingZ = startingMazeZ * blockLength
	controls.getObject().position.x = startingX
	controls.getObject().position.z = startingZ


}

PutLevelIntoSceneGraph()		// TODO Do this in response to level changes.

// TODO Clear level out of scene graph.

// TODO Get state from server - v1, just grab it locally.



