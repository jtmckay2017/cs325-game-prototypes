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
        this.pickupSound = this.sound.add('pickup');
        // Connect to server sfa
        console.log('man');
        this.socket = io.connect('https://joelmckay.cloud:9000/', { secure: true });
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
      
        this.socket.on('scoreUpdate', (players) => {
          Object.values(players).forEach(player => {
            console.log(player)

            if (player.playerId == this.socket.id) {
              console.log('my score!')
              this.myScoreText.setText(player.score)
            }
            this.otherPlayers.getChildren().forEach(otherPlayer => {
              if (player.playerId == otherPlayer.playerId) {
                otherPlayer.nameText.setText(player.playerName + " | " + player.score)
              }
            })
          })
        });
      
        this.socket.on('clothLocation', (clothLocation) => {
          if (this.cloth) this.cloth.destroy();
          this.cloth = this.physics.add.image(clothLocation.x, clothLocation.y, 'cloth');
          this.physics.add.overlap(this.machine, this.cloth, () => {
            this.socket.emit('clothCollected');
            this.pickupSound.play();
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
          this.myScoreText.setPosition(this.machine.x, this.machine.y-40);

        }}
      
    addPlayer(playerInfo) {
        console.log(playerInfo);
        this.machine = this.physics.add.image(playerInfo.x, playerInfo.y, 'machine').setOrigin(0.5, 0.5).setDisplaySize(50,50);
        this.myScoreText = this.add.text(playerInfo.x,playerInfo.y - 40,playerInfo.score,{
          fontFamily:'Arial',
          color:'#ffffff',
          align:'center',
        }).setFontSize(18).setOrigin(0.5, 0.5);
        this.machine.setDrag(500);
        this.machine.setAngularDrag(100);
        this.machine.setMaxVelocity(200);
      }
      
    addOtherPlayers(playerInfo) {
        console.log(playerInfo);
        const otherPlayer = this.add.sprite(playerInfo.x, playerInfo.y, 'machine').setOrigin(0.5, 0.5).setDisplaySize(50,50);
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
