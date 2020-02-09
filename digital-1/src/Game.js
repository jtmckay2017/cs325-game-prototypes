// Create your own variables.
var bouncy = null;
var player = null
var cursors = null;

var solids = null;
export class Game extends Phaser.Scene {

    constructor() {
        super("Game");
    }

    quitGame() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        game.state.start('MainMenu');

    }

    create() {         
        // solids = this.physics.add.staticGroup();

        this.cameras.main.backgroundColor = "#2fd44a";
        console.log(game)
        player = this.physics.add.sprite(100, 450, 'mainPlayer');
        //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
        // player = game.add.sprite(game.world.centerX, game.world.centerY, 'mainPlayer');
        // game.physics.enable( player, Phaser.Physics.ARCADE );
        player.body.collideWorldBounds = true;
        console.log(this.physics)

        
        // Add some text using a CSS style.
        // Center it in X, and position its top 15 pixels from the top of the world.
        var style = { font: "25px Verdana", fill: "#ffffff", align: "center" };
        var text = this.add.text( 230, 15, "Build something amazing.", style );

        cursors = this.input.keyboard.createCursorKeys();
    }
    
    update(time, delta) {

        // player.body.setVelocity(0);

        // Horizontal movement
        if (cursors.left.isDown)
        {
            player.body.setVelocityX(-120);
        }
        else if (cursors.right.isDown)
        {
            player.body.setVelocityX(120);
        } else {
            player.setVelocityX(0);
        }

        // Vertical movement
        if (cursors.up.isDown && player.body.touching.down)
        {
            player.body.setVelocityY(-100);
        }
    }
}
