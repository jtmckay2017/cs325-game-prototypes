var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  } 
};
 
var game = new Phaser.Game(config);
 
function preload() {
  this.load.image('machine', 'assets/washing_machine.png');
  this.load.image('cloth', 'assets/cloth.png');
}
 
function create() {
  var self = this;
  this.socket = io.connect('http://192.168.1.157:25565');

  this.otherPlayers = this.physics.add.group();

  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });

  this.socket.on('newPlayer', function (playerInfo) {
    addOtherPlayers(self, playerInfo);
  });

  this.socket.on('disconnect', function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });
  
  this.socket.on('playerMoved', function (playerInfo) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });

  this.cursors = this.input.keyboard.createCursorKeys();

  this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#ccf5ff' });
  this.redScoreText = this.add.text(584, 16, '', { fontSize: '32px', fill: '#ffdfde' });
    
  this.socket.on('scoreUpdate', function (scores) {
    self.blueScoreText.setText('Blue: ' + scores.blue);
    self.redScoreText.setText('Red: ' + scores.red);
  });

  this.socket.on('clothLocation', function (clothLocation) {
    if (self.cloth) self.cloth.destroy();
    self.cloth = self.physics.add.image(clothLocation.x, clothLocation.y, 'cloth');
    self.physics.add.overlap(self.machine, self.cloth, function () {
      this.socket.emit('clothCollected');
    }, null, self);
  });
}
 
function update() {
  if (this.machine) {
    if (this.cursors.left.isDown) {
      this.machine.setAngularVelocity(-150);
    } else if (this.cursors.right.isDown) {
      this.machine.setAngularVelocity(150);
    } else {
      this.machine.setAngularVelocity(0);
    }
  
    if (this.cursors.up.isDown) {
      this.physics.velocityFromRotation(this.machine.rotation + 1.5, 100, this.machine.body.acceleration);
    } else {
      this.machine.setAcceleration(0);
    }
  
    this.physics.world.wrap(this.machine, 5);

    // emit player movement
    var x = this.machine.x;
    var y = this.machine.y;
    var r = this.machine.rotation;
    if (this.machine.oldPosition && (x !== this.machine.oldPosition.x || y !== this.machine.oldPosition.y || r !== this.machine.oldPosition.rotation)) {
      this.socket.emit('playerMovement', { x: this.machine.x, y: this.machine.y, rotation: this.machine.rotation });
    }

    // save old position data
    this.machine.oldPosition = {
      x: this.machine.x,
      y: this.machine.y,
      rotation: this.machine.rotation
    };
  }}

function addPlayer(self, playerInfo) {
  self.machine = self.physics.add.image(playerInfo.x, playerInfo.y, 'machine').setOrigin(0.5, 0.5).setDisplaySize(100,100);
  if (playerInfo.team === 'blue') {
    self.machine.setTint(0xccf5ff);
  } else {
    self.machine.setTint(0xffdfde);
  }
  self.machine.setDrag(500);
  self.machine.setAngularDrag(100);
  self.machine.setMaxVelocity(200);
}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'machine').setOrigin(0.5, 0.5).setDisplaySize(100,100);
  if (playerInfo.team === 'blue') {
    otherPlayer.setTint(0xccf5ff);
  } else {
    otherPlayer.setTint(0xffdfde);
  }
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}
