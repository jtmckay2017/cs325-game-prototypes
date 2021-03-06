var express = require('express');
var https = require('https');
var fs = require('fs');
const privateKey = fs.readFileSync('/etc/letsencrypt/live/joelmckay.cloud/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/joelmckay.cloud/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/joelmckay.cloud/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};
var app = express();
var server = https.createServer(credentials, app);
var io = require('socket.io').listen(server);



// SERVER VARS
var players = {};

var cloth = {
  x: Math.floor(Math.random() * 700) + 50,
  y: Math.floor(Math.random() * 500) + 50
};


// app.use(express.static(__dirname + '/public'));
 
// app.get('/', function (req, res) {
//   res.sendFile(__dirname + '/index.html');
// });

io.on('connection', function (socket) {
  console.log('a user connected');
  // create a new player and add it to our players object
  players[socket.id] = {
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id,
    team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue',
    playerName: '',
    score: 0
  };

  // send the players object to the new player
  socket.emit('currentPlayers', players);

  // send the cloth object to the new player
  socket.emit('clothLocation', cloth);
  // send the current scores
  socket.emit('scoreUpdate', players);


  socket.on('updateName', function (name) {
    players[socket.id].playerName = name;
    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);
  })




  socket.on('clothCollected', function () {
    players[socket.id].score += 10;
    // if (players[socket.id].team === 'red') {
    //   scores.red += 10;
    // } else {
    //   scores.blue += 10;
    // }
    cloth.x = Math.floor(Math.random() * 1100) + 50;
    cloth.y = Math.floor(Math.random() * 900) + 50;
    io.emit('clothLocation', cloth);
    io.emit('scoreUpdate', players);
  });

  socket.on('disconnect', function () {
    console.log('user disconnected');
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
  });

  // when a player moves, update the player data
  socket.on('playerMovement', function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].rotation = movementData.rotation;
    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });
});

server.listen(9000, function () {
  console.log(`Listening on ${server.address().port}`);
});