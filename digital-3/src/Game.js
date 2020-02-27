// Create your own variables.
var bouncy = null;
var player = null
var cursors = null;


var solids = null;
import io from 'socket.io-client';

export class Game extends Phaser.Scene {

    constructor() {
        super("Game");
    }
    init(data) {
      this.playerName = data.playerName;
    }

    preload() {
        this.load.image('machine', 'assets/washing_machine.png');
        this.load.image('cloth', 'assets/cloth.png');
      }
       
    create() {
        // Connect to server
        this.socket = io.connect('http://192.168.1.157:25565');
        // Send over the juicy player name
        this.socket.on('connect', () => { 
          this.socket.emit('updateName', this.playerName);
        });
        this.otherPlayers = this.physics.add.group();
      
        this.socket.on('currentPlayers', (players) => {
          Object.keys(players).forEach((id) => {
            if (players[id].playerId === this.socket.id) {
              this.addPlayer(players[id]);
            } else {
              this.addOtherPlayers(players[id]);
            }
          });
        });
      
        this.socket.on('newPlayer', (playerInfo) => {
          this.addOtherPlayers(playerInfo);
        });
      
        this.socket.on('disconnect', (playerId) => {
          this.otherPlayers.getChildren().forEach((otherPlayer) => {
            if (playerId === otherPlayer.playerId) {
              otherPlayer.destroy();
              otherPlayer.nameText.destroy();
            }
          });
        });
        
        this.socket.on('playerMoved', (playerInfo) => {
          this.otherPlayers.getChildren().forEach((otherPlayer) => {
            if (playerInfo.playerId === otherPlayer.playerId) {
              otherPlayer.setRotation(playerInfo.rotation);
              otherPlayer.setPosition(playerInfo.x, playerInfo.y);
              otherPlayer.nameText.setPosition(playerInfo.x, playerInfo.y - 40);
            }


          });
        });
      
        this.cursors = this.input.keyboard.createCursorKeys();
      
        this.blueScoreText = this.add.text(20, 16, '', { fontSize: '32px', fill: '#ccf5ff' });
        this.redScoreText = this.add.text(650, 16, '', { fontSize: '32px', fill: '#ffdfde' });
        this.playersText = this.add.text(400, 32, 'Players', { fontSize: '18px', fill: '#ffffff'}).setOrigin(0.5,0.5);

        this.socket.on('scoreUpdate', (scores) => {
          this.blueScoreText.setText('Blue: ' + scores.blue);
          this.redScoreText.setText('Red: ' + scores.red);
        });
      
        this.socket.on('clothLocation', (clothLocation) => {
          if (this.cloth) this.cloth.destroy();
          this.cloth = this.physics.add.image(clothLocation.x, clothLocation.y, 'cloth');
          this.physics.add.overlap(this.machine, this.cloth, () => {
            this.socket.emit('clothCollected');
          }, null, this);
        });
      }
       
    update() {

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
      
    addPlayer(playerInfo) {
        console.log(playerInfo);
        this.machine = this.physics.add.image(playerInfo.x, playerInfo.y, 'machine').setOrigin(0.5, 0.5).setDisplaySize(50,50);
        if (playerInfo.team === 'blue') {
          this.machine.setTint(0xccf5ff);
        } else {
          this.machine.setTint(0xffdfde);
        }
        this.machine.setDrag(500);
        this.machine.setAngularDrag(100);
        this.machine.setMaxVelocity(200);
      }
      
    addOtherPlayers(playerInfo) {
        console.log(playerInfo);
        const otherPlayer = this.add.sprite(playerInfo.x, playerInfo.y, 'machine').setOrigin(0.5, 0.5).setDisplaySize(50,50);
        if (playerInfo.team === 'blue') {
          otherPlayer.setTint(0xccf5ff);
        } else {
          otherPlayer.setTint(0xffdfde);
        }
        otherPlayer.playerId = playerInfo.playerId;
        this.otherPlayers.add(otherPlayer);
        let name = this.add.text(playerInfo.x,playerInfo.y - 40,playerInfo.playerName,{
          fontFamily:'Arial',
          color:'#ffffff',
          align:'center',
        }).setFontSize(18).setOrigin(0.5, 0.5);
        otherPlayer.nameText = name;
      }
      
}
