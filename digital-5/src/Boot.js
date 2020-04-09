"use strict";

export class Boot extends Phaser.Scene {
    constructor() {
        super("Boot");
    }
    init() {

        //  Unless you specifically know your game needs to support multi-touch I would recommend setting this to 1
        this.input.maxPointers = 1;
        // //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
        // game.stage.disableVisibilityChange = true;
    }

    preload() {

        //  Here we load the assets required for our Preloader state (in this case a background and a loading bar)

    }

    create() {

        //  By this point the preloader assets have loaded to the cache, we've set the game settings
        //  So now let's start the real preloader going
        this.cameras.main.backgroundColor = Phaser.Display.Color.HexStringToColor("#3498db");

        this.scene.start('Preloader');

    }
}
