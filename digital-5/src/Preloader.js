export class Preloader extends Phaser.Scene {
    constructor() {
        super("Preloader");
    }
    preload() {

        var background = null;
        var preloadBar = null;
    
        var ready = false;
        
        //	These are the assets we loaded in Boot.js
        //	A nice sparkly background and a loading progress bar

        this.scene.backgroundColor = "#34cceb";

        // Loading Bar
        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(this.scale.width / 2- 250, this.scale.height / 2 + 20, 500, 50);
        // Text for loading...
        var width = this.cameras.main.width;
        var height = this.cameras.main.height;
        var loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        // Text for percent done      
        var percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        // Text for what has been loaded
        var assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 45,
            text: '',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        assetText.setOrigin(0.5, 0.5);

        this.load.on('progress', (value) => {
            console.log(value);
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(this.scale.width / 2 + 10 - 250, this.scale.height / 2 + 30, 480 * value, 30);
            percentText.setText(parseInt(value * 100) + '%');
        });

        this.load.on('fileprogress', function (file) {
            assetText.setText('Loading asset: ' + file.key);
        });
        
        this.load.on('complete', function (value) {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });

        //	Here we load the rest of the assets our this needs.
        //	As this is just a Project Template I've not provided these assets, swap them for your own.
        this.load.image('titlePage', 'assets/title.jpg');
        this.load.atlas('playButton', 'assets/play_button.png', 'assets/play_button.json');
        this.load.audio('day_desert_ambient', ['assets/day_desert_ambient.mp3']);
        this.load.audio('dark_desert_ambient', ['assets/dark_desert_ambient.mp3']);
        this.load.audio('day_to_dark_change', ['assets/day_to_dark_change_sfx.mp3']);
        this.load.audio('shoot', ['assets/shoot.wav']);
        this.load.audio('hit', ['assets/hit.wav']);

        //	+ lots of other required assets here
        this.load.html('nameForm', 'assets/text/nameForm.html');

    }

    create() {
        this.scene.start('MainMenu');
    };

    update() {

        //	You don't actually need to do this, but I find it gives a much smoother this experience.
        //	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
        //	You can jump right into the menu if you want and still play the music, but you'll have a few
        //	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
        //	it's best to wait for it to decode here first, then carry on.
        
        //	If you don't have any music in your this then put the this.state.start line into the create function and delete
        //	the update function completely.
        
        // if (this.cache.isSoundDecoded('titleMusic') && ready == false)
        // {
        //     ready = true;
        // }


    }
    
}
