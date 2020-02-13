// Create your own variables.
var bouncy = null;
var player = null
var cursors = null;

var solids = null;
export class Game extends Phaser.Scene {

    constructor() {
        super("Game");
    }

    shootBullet() {
        // Enforce a short delay between shots by recording
        // the time that each bullet is shot and testing if
        // the amount of time since the last shot is more than
        // the required delay.
        if (this.lastBulletShotAt === undefined) this.lastBulletShotAt = 0;
        if (this.time.now - this.lastBulletShotAt < this.SHOT_DELAY) return;
        this.lastBulletShotAt = this.time.now;

        // Get a dead bullet from the pool
        var bullet = this.physics.add.sprite(0, 0, 'toilet_paper').setScale(0.1);
        this.bulletPool.add(bullet);

        // Set its pivot point to the center of the bullet
        bullet.setOrigin(0.5, 0.5);;

        // If there aren't any bullets available then don't shoot
        if (bullet === null || bullet === undefined) return;

        // Revive the bullet
        // This makes the bullet "alive"
        bullet.setActive(true).setVisible(true);

        // Bullets should kill themselves when they leave the world.
        // Phaser takes care of this for me by setting this flag
        // but you can do it yourself by killing the bullet if
        // its x,y coordinates are outside of the world.
        bullet.checkWorldBounds = true;
        bullet.outOfBoundsKill = true;

        // Set the bullet position to the gun position.
        bullet.setPosition(this.gun.x, this.gun.y);
        bullet.rotation = this.gun.rotation;

        // Shoot it in the right direction
        bullet.body.velocity.x = Math.cos(bullet.rotation) * this.BULLET_SPEED;
        bullet.body.velocity.y = Math.sin(bullet.rotation) * this.BULLET_SPEED;
        this.sound.play('throwSound')
    }

    quitGame() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    }

    create() {         
        // solids = this.physics.add.staticGroup();
        this.cameras.main.setBackgroundColor(0xbababa)



        console.log(this)
        // player = this.physics.add.sprite(100, 450, 'mainPlayer');
        //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
        // player = game.add.sprite(game.world.centerX, game.world.centerY, 'mainPlayer');
        // game.physics.enable( player, Phaser.Physics.ARCADE );
        // player.body.collideWorldBounds = true;
        console.log(this.physics)

        this.wallGroup = this.add.group();
        // Build White Border
        for(var y = 0; y < 500; y += 35) {
            // Add the ground blocks, enable physics on each, make them immovable
            var block = this.physics.add.sprite(20, y, 'white_block').setScale(0.5);
            block.body.immovable = true;
            block.body.allowGravity = false;
            this.wallGroup.add(block);
        }

        
        // Add some text using a CSS style.
        // Center it in X, and position its top 15 pixels from the top of the world.
        var style = { font: "20px Verdana", fill: "#ffffff", align: "center" };
        var text = this.add.text( 225, 15, "Stop the poop with your toilet paper!.", style );

        // Set initial score
        this.score = 0;
        var style = { font: "20px Verdana", fill: "#ffffff", align: "center" };
        this.scoreText = this.add.text( 370, 45, "Score: 0", style );

        // Set stage background color
        this.cameras.main.backgroundColor = 0x4488cc;

        // Define constants
        this.SHOT_DELAY = 300; // milliseconds (10 bullets/3 seconds)
        this.BULLET_SPEED = 800; // pixels/second
        this.NUMBER_OF_BULLETS = 20;
        this.GRAVITY = 980; // pixels/second/second


        // Create an object representing our gun
        this.gun = this.add.sprite(60, 420, 'mainPlayer');

        // Set the pivot point to the center of the gun
        this.gun.setOrigin(0.5, 0.5);

        // Create an object pool of bullets
        this.bulletPool = this.add.group();



        // Create some ground
        this.ground = this.add.group();
        for(var x = 0; x < 900; x += 224) {
            // Add the ground blocks, enable physics on each, make them immovable
            var groundBlock = this.physics.add.sprite(x, 550, 'ground');
            groundBlock.body.immovable = true;
            groundBlock.body.allowGravity = false;
            this.ground.add(groundBlock);
        }
        // Create a group for explosions
        this.explosionGroup = this.add.group();

        // Simulate a pointer click/tap input at the center of the stage
        // when the example begins running.
        // this.input.activePointer.x = this.width/2;
        // this.input.activePointer.y = this.height/2 - 100;

        
        this.poopGroup = this.add.group();
        // Spawn poops
        this.time.addEvent({
            delay: 1000,
            callback: ()=>{
                var poop = this.physics.add.sprite(780, Phaser.Math.Between(0, 350), 'poop').setScale(0.05);
                this.poopGroup.add(poop)
            },
            loop: true
        })

        // Set collisions
        // Check if bullets have collided with the ground
        this.physics.add.overlap(this.bulletPool, this.ground,
            this.disableBullet,
            null,
            this
        );
        this.physics.add.overlap(this.poopGroup, this.bulletPool,
            this.bulletHitPoop,
            null,
            this)
        this.physics.add.overlap(this.poopGroup, this.wallGroup,
            this.endGame,
            null,
            this)
        this.physics.add.collider(this.ground, this.poopGroup)
    


    }

    disableBullet(bullet) {
        bullet.destroy();
    }

    endGame() {
        this.scene.start('MainMenu')
    }

    bulletHitPoop(poop, bullet) {
        this.score += 1
        this.scoreText.setText('Score: ' + this.score);
        this.disableBullet(bullet);
        poop.destroy();
    }
    
    update(time, delta) {
        Phaser.Actions.Call(this.poopGroup.getChildren(), function(poop) {
            poop.setVelocityX(Phaser.Math.Between(-50, -150))
            if(Phaser.Math.Between(0, 10) === 10) {
                poop.setVelocityY(Phaser.Math.Between(20, -225))
            }
        })
        // Rotate all living bullets to match their trajectory
        this.bulletPool.getChildren(function(bullet) {
            bullet.rotation = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x);
        }, this);

        // Aim the gun at the pointer.
        // All this function does is calculate the angle using
        // Math.atan2(yPointer-yGun, xPointer-xGun)
        this.input.on('pointermove', (pointer) => {
            let cursor = pointer;
            let angle = Phaser.Math.Angle.Between(this.gun.x, this.gun.y, cursor.x + this.cameras.main.scrollX, cursor.y + this.cameras.main.scrollY)
            this.gun.rotation = angle
        }, this);

        // Shoot bullet
        this.input.on('pointerdown', () => {
            this.shootBullet();
        }, this);

    }
}
