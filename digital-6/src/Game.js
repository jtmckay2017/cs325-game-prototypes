import { Physics } from "phaser";
import { Toast } from 'phaser3-rex-plugins/templates/ui/ui-components.js';


// resource values for tilemap
// 0 stone
// 1 wood
// 2 gold


const COLOR_PRIMARY = 0x4e342e;


// Create your own variables.
// global state variables
var gameOver = false;
var wave = 0;
var spawnDelay = 3000;
var rnd = null;
var waveTime = 120000
var enemyWaveTime = 25000
var waveTimeEvent = null;
var enemySpawnEvent = null;

// resources
var resources = null

// entities
var player = null;
var playerBullets = null;
var enemies = null;
var baseCore = null;


// controls
var moveKeys = null;

// ui
var reticle = null;
var baseCoreHealthBar = null;
var waveText = null;

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
        // this.setSize(12, 12, true);
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
        Phaser.GameObjects.Sprite.call(this, scene, 0, 0, 'player_handgun')
        this.speed = Phaser.Math.Between(100, 400);
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
            this.hitSound.play();
            enemyHit.health = enemyHit.health - 1;
            enemyHit.receiveDamage(1);
            // Destroy bullet
            bulletHit.setActive(false).setVisible(false);
        }
    }


    preload ()
    {
        // Load in images and sprites
    
        this.shootSound = this.sound.add('shoot');
        this.hitSound = this.sound.add('hit');
        this.newWaveSound = this.sound.add('day_to_dark_change');
    }
    
    create ()
    {

        this.cameras.main.zoom = 1.1;



        this.time.timeScale = 1;
        gameOver = false;
        rnd = Phaser.Math.RND;

        // this.add.sprite(0,0,'level1').setOrigin(0, 0).setDisplaySize(5000, 5000);

        baseCoreHealthBar = this.add.graphics();

        var style = { font: "30px Verdana", fill: "#000000", align: "center" };
        waveText = this.add.text(1150, 1285, "", style);

        var mappy = this.make.tilemap({ key: 'map' });
        var terrainTiles = mappy.addTilesetImage('terrain_atlas');
        var itemTiles = mappy.addTilesetImage('items');
        // layer.setScrollFactor(2);
        // layer.setAlpha(0.75);
        //layers
        let botLayer = mappy.createStaticLayer("bot", [terrainTiles], 0, 0).setDepth(-1);
        let topLayer = mappy.createStaticLayer("top", [terrainTiles], 0, 0);
        let top2Layer = mappy.createStaticLayer("top2", [terrainTiles], 0, 0);

        //map collisions
        // this.physics.add.collider(enemies, topLayer);

            //by tile property
        topLayer.setCollisionByProperty({collides:true});
        top2Layer.setCollisionByProperty({collides:true});

        this.cameras.main.setBounds(0, 0, mappy.widthInPixels, mappy.heightInPixels);

        // Create world bounds
        // this.physics.world.setBounds(0, 0, 1280, 720);
    
        playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
        enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });


        // Add background, player, and reticle sprites
        player = this.physics.add.sprite(1250, 900, 'player_handgun');
        baseCore = this.physics.add.staticSprite(1265, 1200);

        // Toasty
        this.toast = this.rexUI.add.toast({
            x: player.x,
            y: player.y,

            background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 20, COLOR_PRIMARY),
            text: this.add.text(0, 0, '', {
                fontSize: '24px'
            }),
            space: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20,
            },

            duration: {
                in: 100,
                hold: 500,
                out: 100,
            },
        })

        reticle = this.physics.add.sprite(800, 700, 'target');

        // Set sprite variables
        player.health = 3;
        baseCore.health = 100;
        player.resources = [0, 0, 0]

        // Set image/sprite properties
        player.setOrigin(0.3, 0.5).setCollideWorldBounds(false).setDrag(2000, 2000).setDisplaySize(60, 50);
        reticle.setOrigin(0.3, 0.5).setDisplaySize(25, 25).setCollideWorldBounds(false);
    
        // Set camera zoom
        // this.input.on('wheel', function (pointer, gameObjects, deltaX, deltaY, deltaZ) {
        //     console.log(deltaY)
        //     console.log(this.cameras.main.zoom)
        //     if (this.cameras.main.zoom <= 1.5 && deltaY < 0) {
        //         this.cameras.main.zoom -= deltaY * 0.001;
        //     } else if (this.cameras.main.zoom >= 0.7 && deltaY > 0) {
        //         this.cameras.main.zoom -= deltaY * 0.001;
        //     } else {
        //         console.log("hit scroll limit")
        //     }
        // });
        // Scroll change weapon
        this.input.on('wheel', function (pointer, gameObjects, deltaX, deltaY, deltaZ) {
            if (deltaY) {
                // Change weapon
            } else if (deltaY > 0) {
                // Change weapon
            }
        });

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

        this.input.keyboard.on('keydown_E', (event) => {
            if (gameOver) {
                this.scene.start('MainMenu')
            }
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
        //
    
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

            this.toast.show((object) => {
                console.log(object)
                object._x = player.x
                object._y = player.y
                object.text = "Test"
            })

            // Get bullet from bullets group
            var bullet = playerBullets.get().setActive(true).setVisible(true);

            if (bullet)
            {
                bullet.fire(player, reticle);
                this.shootSound.play();
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
        this.physics.add.collider(player, topLayer);
        this.physics.add.collider(player, top2Layer);
        this.physics.add.collider(baseCore, player);
        this.physics.add.collider(baseCore, enemies, this.baseCoreHit, null, this);
        this.physics.add.overlap(enemies, playerBullets, this.enemyHitCallback, null, this);
        // wave time event
        this.newWaveStarted()
        waveTimeEvent = this.time.addEvent({
            delay: waveTime-enemyWaveTime,
            callback: this.newWaveStarted,
            callbackScope: this,
            loop: true
        })

        this.updateBaseCoreHealthBar()
        this.cameras.main.startFollow(player, true);

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
        if (baseCore.health > 0) {
            baseCore.health -= 5;
        }
        else {
            this.time.timeScale = 0;
            let gameOverText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Game Over ):\nPress E to restart.', {
                fontSize: '48px',
            }).setOrigin(0.5,0.5)
            gameOver = true;
            baseCore.setVisible(false);
        }
        this.updateBaseCoreHealthBar()
        enemy.destroy();
    }

    newWaveStarted() {
        wave += 1;
        if (enemySpawnEvent != null) {
            enemySpawnEvent.remove();
            enemySpawnEvent = null;
        }
        this.time.addEvent({
            delay:  waveTime-enemyWaveTime,
            callback: () => {
                enemySpawnEvent = this.createEnemySpawnEvent(spawnDelay);
                spawnDelay -= 250;
                this.newWaveSound.play();
            }
        })

    }

    createEnemySpawnEvent(spawnDelay) {
        return this.time.addEvent({
            delay: spawnDelay,
            callback: () => {
                console.log("spawning new enemy")
                var enemy = enemies.get();
                enemy.setDisplaySize(60, 50);
                enemy.setPosition(baseCore.x + 1000 * (rnd.sign()), baseCore.y + 1000 * (rnd.sign()))
                console.log(enemy);
                if (enemy)
                {
                    enemy.setActive(true);
                    enemy.setVisible(true);
                    this.physics.moveToObject(enemy, baseCore, enemy.speed);
                    // // place the enemy at the start of the path
                    // enemy.startOnPath();
                    
                    // this.nextEnemy = time + 2000;
                }   
            },
            loop: true
        })


    }

    update (time, delta)
    {
        // Rotates player to face towards reticle
        player.rotation = Phaser.Math.Angle.Between(player.x, player.y, reticle.x, reticle.y);

        // Camera follows player ( can be set in create )

        // Makes reticle move with player
        reticle.body.velocity.x = player.body.velocity.x;
        reticle.body.velocity.y = player.body.velocity.y;

        // Constrain velocity of player
        this.constrainVelocity(player, 500);

        // Constrain position of reticle
        this.constrainReticle(reticle);

        // Set wave text remaining time
        waveText.setText(`Wave ${wave} | ` + + (waveTime - waveTimeEvent.getElapsed()) / 1000);


    }

    updateBaseCoreHealthBar() {
        baseCoreHealthBar.clear();
        baseCoreHealthBar.fillStyle(0xff0000 , 1);
        baseCoreHealthBar.fillRect(1265-125, 1260, 250 * (baseCore.health / 100), 25);

    }
      

    
}
