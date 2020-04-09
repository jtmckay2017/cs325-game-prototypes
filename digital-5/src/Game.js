import { Physics } from "phaser";

// Create your own variables.
var bouncy = null;
var player = null;
var cursors = null;
var reticle = null;
var moveKeys = null;
var solids = null;
var playerBullets = null;
var enemy = null;
var enemies = null;
var baseCore = null;
var baseCoreHealthBar = null;
var rnd = null;
var Bullet = new Phaser.Class({

    Extends: Phaser.GameObjects.Image,

    initialize:

    // Bullet Constructor
    function Bullet (scene)
    {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
        this.speed = 1;
        this.born = 0;
        this.direction = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.setSize(12, 12, true);
    },

    // Fires a bullet from the player to the reticle
    fire: function (shooter, target)
    {
        this.setPosition(shooter.x, shooter.y); // Initial position
        this.direction = Math.atan( (target.x-this.x) / (target.y-this.y));

        // Calculate X and y velocity of bullet to moves it from shooter to target
        if (target.y >= this.y)
        {
            this.xSpeed = this.speed*Math.sin(this.direction);
            this.ySpeed = this.speed*Math.cos(this.direction);
        }
        else
        {
            this.xSpeed = -this.speed*Math.sin(this.direction);
            this.ySpeed = -this.speed*Math.cos(this.direction);
        }

        this.rotation = shooter.rotation; // angle bullet with shooters rotation
        this.born = 0; // Time since new bullet spawned
    },

    // Updates the position of the bullet each cycle
    update: function (time, delta)
    {
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.born += delta;
        if (this.born > 1800)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }

});

var Enemy = new Phaser.Class({

    Extends: Phaser.GameObjects.Sprite,

    initialize:

    // Enemy Constructor
    function Enemy (scene)
    {
        Phaser.GameObjects.Sprite.call(this, scene, 0, 0, 'player_handgun');
        this.speed = 1;
        this.health = 5;
        console.log(baseCore)
    },

    // Updates the position of the bullet each cycle
    update: function (time, delta)
    {

    },
    preUpdate: function () {
    },

    receiveDamage: function(damage) {
        this.health -= damage;           
        console.log('DAMAGE RECEIVED')
        // if hp drops below 0 we deactivate this enemy
        if(this.health <= 0) {
            this.destroy();
        }
    },

});

export class Game extends Phaser.Scene {

    constructor() {
        super("Game");
    }

    enemyHitCallback(enemyHit, bulletHit)
    {
        // Reduce health of enemy
        if (bulletHit.active === true && enemyHit.active === true)
        {
            enemyHit.health = enemyHit.health - 1;
            enemyHit.receiveDamage(1);
            // Destroy bullet
            bulletHit.setActive(false).setVisible(false);
        }
    }


    preload ()
    {
        // Load in images and sprites
    
        this.load.spritesheet('player_handgun', 'assets/player_handgun.png',
            { frameWidth: 66, frameHeight: 60 }
        ); // Made by tokkatrain: https://tokkatrain.itch.io/top-down-basic-set
        this.load.image('target', 'assets/ball.png');
        this.load.tilemapTiledJSON('map', 'assets/desert.json');
        this.load.image('tiles', 'assets/tmw_desert_tilemap.png');

    }
    
    create ()
    {
        rnd = Phaser.Math.RND;

        baseCoreHealthBar = this.add.graphics();
        baseCoreHealthBar.setScrollFactor(0);


        var map = this.make.tilemap({ key: 'map' });
        var tiles = map.addTilesetImage('tiles');
        var layer = map.createStaticLayer(0, tiles, 0, 0);
        // layer.setScrollFactor(2);
        // layer.setAlpha(0.75);
        layer.setScale(2,2);

        // Create world bounds
        // this.physics.world.setBounds(0, 0, 1280, 720);
    
        playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
        enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });


        // Add background, player, and reticle sprites
        player = this.physics.add.sprite(800, 600, 'player_handgun');
        baseCore = this.physics.add.staticSprite(800, 700, 'baseCore');

        reticle = this.physics.add.sprite(800, 700, 'target');

        // Set sprite variables
        player.health = 3;
        baseCore.health = 100;

        // Set image/sprite properties
        player.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(false).setDrag(2000, 2000);
        reticle.setOrigin(0.5, 0.5).setDisplaySize(25, 25).setCollideWorldBounds(false);
    
        // Set camera zoom
        this.cameras.main.zoom = 0.5;
    
        // Creates object for input with WASD kets
        moveKeys = this.input.keyboard.addKeys({
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D
        });
    
        // Enables movement of player with WASD keys
        this.input.keyboard.on('keydown_W', (event) => {
            player.setAccelerationY(-1000);
        });
        this.input.keyboard.on('keydown_S', (event) => {
            player.setAccelerationY(1000);
        });
        this.input.keyboard.on('keydown_A', (event) => {
            player.setAccelerationX(-1000);
        });
        this.input.keyboard.on('keydown_D', (event) => {
            player.setAccelerationX(1000);
        });
    
        // Stops player acceleration on uppress of WASD keys
        this.input.keyboard.on('keyup_W', (event) => {
            if (moveKeys['down'].isUp)
                player.setAccelerationY(0);
        });
        this.input.keyboard.on('keyup_S', (event) => {
            if (moveKeys['up'].isUp)
                player.setAccelerationY(0);
        });
        this.input.keyboard.on('keyup_A', (event) => {
            if (moveKeys['right'].isUp)
                player.setAccelerationX(0);
        });
        this.input.keyboard.on('keyup_D', (event) => {
            if (moveKeys['left'].isUp)
                player.setAccelerationX(0);
        });
    
        // Locks pointer on mousedown
        this.game.canvas.addEventListener('mousedown', () => {
            this.game.input.mouse.requestPointerLock();
        });
    
        // Exit pointer lock when Q or escape (by default) is pressed.
        this.input.keyboard.on('keydown_Q', (event) => {
            if (this.input.mouse.locked)
                this.input.mouse.releasePointerLock();
        }, 0, this);

        // Fires bullet from player on left click of mouse
        this.input.on('pointerdown', (pointer, time, lastFired) => {
            if (player.active === false)
                return;

            // Get bullet from bullets group
            var bullet = playerBullets.get().setActive(true).setVisible(true);

            if (bullet)
            {
                bullet.fire(player, reticle);
            }
        }, this);
    
        // Move reticle upon locked pointer move
        this.input.on('pointermove', (pointer) => {
            if (this.input.mouse.locked)
            {
                reticle.x += pointer.movementX;
                reticle.y += pointer.movementY;
            }
        }, this);

        this.physics.add.collider(baseCore, player);
        this.physics.add.collider(baseCore, enemies, this.baseCoreHit, null, this);
        this.physics.add.overlap(enemies, playerBullets, this.enemyHitCallback, null, this);
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                console.log("spawning new enemy")
                var enemy = enemies.get();
                enemy.setPosition(baseCore.x + 100 * (rnd.sign()), baseCore.y + 100 * (rnd.sign()))
                console.log(enemy);
                if (enemy)
                {
                    enemy.setActive(true);
                    enemy.setVisible(true);
                    this.physics.moveToObject(enemy, baseCore, 100);
                    // // place the enemy at the start of the path
                    // enemy.startOnPath();
                    
                    // this.nextEnemy = time + 2000;
                }   
            },
            loop: true
        })
    
    }

    // Ensures sprite speed doesnt exceed maxVelocity while update is called
    constrainVelocity(sprite, maxVelocity)
    {
        if (!sprite || !sprite.body)
        return;

        var angle, currVelocitySqr, vx, vy;
        vx = sprite.body.velocity.x;
        vy = sprite.body.velocity.y;
        currVelocitySqr = vx * vx + vy * vy;

        if (currVelocitySqr > maxVelocity * maxVelocity)
        {
            angle = Math.atan2(vy, vx);
            vx = Math.cos(angle) * maxVelocity;
            vy = Math.sin(angle) * maxVelocity;
            sprite.body.velocity.x = vx;
            sprite.body.velocity.y = vy;
        }
    }

    // Ensures reticle does not move offscreen relative to player
    constrainReticle(reticle)
    {
        var distX = reticle.x-player.x; // X distance between player & reticle
        var distY = reticle.y-player.y; // Y distance between player & reticle

        // Ensures reticle cannot be moved offscreen
        if (distX > 800)
            reticle.x = player.x+800;
        else if (distX < -800)
            reticle.x = player.x-800;

        if (distY > 600)
            reticle.y = player.y+600;
        else if (distY < -600)
            reticle.y = player.y-600;
    }

    baseCoreHit (baseCore, enemy) {
        console.log('attacking core')
        if (baseCore.health > 0)
            baseCore.health -= 5;
        enemy.destroy();
    }

    update (time, delta)
    {
        // Rotates player to face towards reticle
        player.rotation = Phaser.Math.Angle.Between(player.x, player.y, reticle.x, reticle.y);

        // Camera follows player ( can be set in create )
        this.cameras.main.startFollow(player);

        // Makes reticle move with player
        reticle.body.velocity.x = player.body.velocity.x;
        reticle.body.velocity.y = player.body.velocity.y;

        // Constrain velocity of player
        this.constrainVelocity(player, 500);

        // Constrain position of reticle
        this.constrainReticle(reticle);

        baseCoreHealthBar.clear();
        baseCoreHealthBar.fillStyle(0xff0000 , 1);
        baseCoreHealthBar.fillRect(this.scale.width + 75, this.scale.height + 250, 500 * (baseCore.health / 100), 50);
    }
      

    
}
