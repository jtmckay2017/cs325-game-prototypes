// Create your own variables.
var bouncy = null;
var player = null
var cursors = null;


var solids = null;
export class Game extends Phaser.Scene {

    constructor() {
        super("Game");
    }

    updateScore() {
        console.log("SCORED!")
        this.score += 1;
        this.scoreText.setText("Score: " + this.score);
    }

    hitByBlock() {
        console.log("GameOver")
        this.time.timeScale = 0;
        let gameOverText = this.add.text(600, 500, 'Game Over ):\nPress down arrow to restart.', {
            fontSize: '24px',
        }).setOrigin(0.5,0.5)
        this.gameOver = true;
    }
    preload() {
        this.load.image('machine', 'assets/washing_machine.png');
        this.load.image('cloth', 'assets/cloth.png');
      }
       
    create() {
        this.time.timeScale = 1;
        this.cursors = this.input.keyboard.createCursorKeys();

        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: '24px',
        })

        // Define movement constants
        this.MAX_SPEED = 500; // pixels/second
        this.score = 0;
        this.gameOver = false;
        // Create a player sprite
        this.player = this.physics.add.sprite(600, 500, 'player1');
        this.player.setCollideWorldBounds(true);
        this.player.onWorldBounds = true;

        this.pickupSound = this.sound.add('pickup');
        this.eggGroup = this.add.group();
        // Spawn eggs
        this.time.addEvent({
            delay: 250,
            callback: ()=>{
                var egg = this.physics.add.sprite(Phaser.Math.Between(0, 1200), 0, 'poop').setScale(1);
                this.eggGroup.add(egg)
            },
            loop: true
        })
        // Create some ground
        this.ground = this.add.group();
        for(var x = 10; x < 1500; x += 35) {
            // Add the ground blocks, enable physics on each, make them immovable
            var groundBlock = this.physics.add.sprite(x, 970, 'ground');
            groundBlock.body.immovable = true;
            groundBlock.body.allowGravity = false;
            this.ground.add(groundBlock);
        }
        this.physics.add.collider(this.ground, this.player)
        this.physics.add.overlap(this.eggGroup, this.ground,
            this.updateScore,
            null,
            this
        );
        this.physics.add.overlap(this.player, this.eggGroup,
            this.hitByBlock,
            null,
            this
        );
    }
       



    update() {
        if (this.cursors.left.isDown) {
            // If the LEFT key is down, set the player velocity to move left
            this.player.body.velocity.x = -this.MAX_SPEED * this.time.timeScale;
        } else if (this.cursors.right.isDown) {
            // If the RIGHT key is down, set the player velocity to move right
            this.player.body.velocity.x = this.MAX_SPEED * this.time.timeScale;
        } else {
            // Stop the player from moving horizontally
            this.player.body.velocity.x = 0;
        }

        if (this.cursors.down.isDown && this.gameOver) {
            this.scene.start('MainMenu')
        }
    }
      
}
