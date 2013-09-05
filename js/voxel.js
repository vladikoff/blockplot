var createGame = require('voxel-hello-world')
var fly = require('voxel-fly')
var worker = require('webworkify')

var blockInfo = require('minecraft-blockinfo')
var walk = require('voxel-walk')
var voxelLevel = require('voxel-level')
var createDebugger = require('voxel-debug')
var dat = require('dat-gui')
var bodyPosition;

oculusBridge = new OculusBridge({
  "debug" : true,
  "onOrientationUpdate" : bridgeOrientationUpdated,
  "onConfigUpdate"      : bridgeConfigUpdated,
  "onConnect"           : bridgeConnected,
  "onDisconnect"        : bridgeDisconnected
});


function bridgeConnected(){
  console.log('bridgeConnected');
}

function bridgeDisconnected(){
  console.log('bridgeDisconnected');
}

function bridgeConfigUpdated(config){
  console.log("Oculus config updated.");
  //riftCam.setHMD(config);
}

var headquat;

function bridgeOrientationUpdated(quatValues) {

  // Do first-person style controls (like the Tuscany demo) using the rift and keyboard.

  // TODO: Don't instantiate new objects in here, these should be re-used to avoid garbage collection.

  // make a quaternion for the the body angle rotated about the Y axis.
  var quat = new THREE.Quaternion();
  quat.setFromAxisAngle(bodyAxis, bodyAngle);

  // make a quaternion for the current orientation of the Rift
  var quatCam = new THREE.Quaternion(quatValues.x, quatValues.y, quatValues.z, quatValues.w);

  // multiply the body rotation by the Rift rotation.
  quat.multiply(quatCam);


  // Make a vector pointing along the Z axis and rotate it accoring to the combined look/body angle.
  var xzVector = new THREE.Vector3(0, 0, 1);
  xzVector.applyQuaternion(quat);

  // Compute the X/Z angle based on the combined look/body angle.  This will be used for FPS style movement controls
  // so you can steer with a combination of the keyboard and by moving your head.
  viewAngle = Math.atan2(xzVector.z, xzVector.x) + Math.PI;

  // Apply the combined look/body angle to the camera.
  game.view.camera.useQuaternion = true;
  game.view.camera.quaternion.copy(quat);
}

var loadDelay = 1000 // milliseconds

module.exports = {
  initGame: initGame
}

function getState(game) {
  var state = {}
  var target = game.controls.target()
  state.player = {
    position: target.avatar.position,
    rotation: target.avatar.rotation
  }
  return state
}

function storeState(user, game, worldID, seed, cb) {
  if (!cb) cb = function noop(){}
  return setInterval(function() {
    var state = getState(game)
    var worlds = user.db.sublevel('worlds')
    worlds.get(worldID, {valueEncoding: 'json'}, function(err, world) {
      world.state = state
      if (seed) world.seed = seed
      world.lastUpdate = new Date()
      worlds.put(worldID, world, cb)
    })
  }, 5000)
}

function initGame(user, options) {
  $('.content').hide()
  
  var textures = "http://commondatastorage.googleapis.com/voxeltextures/painterly/"

  var materials = []
  var colors = []
  
  Object.keys(blockInfo.blocks).map(function(b) {
    var type = blockInfo.blocks[b].type
    var id = blockInfo.blocks[b].id
    var color = blockInfo.blocks[b].color
    materials[id - 1] = type
    colors[id - 1] = color
  })
  
  var pos = [0, 0, 0]
  var chunkDimensions = [16, 16, 16]
  var gameChunkSize = 16
  
  var game = createGame({
    generateChunks: false,
    texturePath: textures,
    playerSkin: options.playerSkin || textures + '../player.png',
    chunkSize: gameChunkSize,
    chunkDistance: 4,
    removeDistance: 10,
    arrayType: Uint8Array,
    worldOrigin: pos,
    materials: options.textures ? materials : colors,
    materialFlatColor: options.textures ? false : true,
    controls: { jumpTimer: 3 }
  })

  window.game = game // for console debugging
  window.THREE = game.THREE
  bodyPosition  = new THREE.Vector3(0, 15, 0);
  var target = game.controls.target()
  
  var debug = createDebugger(game)
  debug.gui.constructor.toggleHide()
  
  //game.view.renderer.setClearColorHex( 0xBFD9EA, 1 )

  var level = voxelLevel(user.db)

  var worldWorker = worker(require('./world-worker.js'))
  worldWorker.addEventListener('message', function (ev) {
    var data = ev.data
    if (!data) return
    if (data.ready && game.paused) return startGame(game, user, level, options, worldWorker)
    if (data.log) return console.log(data)
    var chunk = {
      position: data.position,
      voxels: new Uint8Array(data.buffer),
      dims: data.dimensions
    }
    setTimeout(function() {
      game.showChunk(chunk)
    }, 10 + ~~(Math.random() * loadDelay))
  });
  worldWorker.postMessage({ dbName: 'blocks' })

  return game
}

function startGame(game, user, level, options, worldWorker) {
  options.state = options.state || {}
  game.once('tick', function() {
    bodyAngle     = 0;
    bodyAxis      = new THREE.Vector3(0, 1, 0);
    oculusBridge.connect();
    game.camera.position.set(bodyPosition.x, bodyPosition.y, bodyPosition.z);

  });

  game.voxels.on('missingChunk', function(p) {
    worldWorker.postMessage({
      worldID: options.id,
      position: p,
      gameChunkSize: game.chunkSize,
      seed: options.seed
    })
  })
  
  game.on('dirtyChunkUpdate', function(chunk) {
    var storableChunk = {
      position: chunk.position.map(function(p) { return p * game.chunkSize }),
      voxels: chunk.voxels,
      dimensions: chunk.dimensions
    }
    level.store(options.id, storableChunk, function afterStore(err) {
      if (err) console.error('chunk store error', err)
    })
  })
  
  if (!options.state.player) options.state.player = {
    position: {x: 0, y: 10, z: 0},
    rotation: {x: 0, y: 0, z: 0}
  }

  game.paused = false
  game.flyer.startFlying()
  var avatar = game.controls.target().avatar
  avatar.position.copy(options.state.player.position)
  avatar.rotation.copy(options.state.player.rotation)
  storeState(user, game, options.id, options.seed)
}

