import { TextButton } from './game-objects/text-button';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super("MainMenu")
    }


    create() {
        var music = null;
        var playButton = null;

        //	We've already preloaded our assets, so let's kick right into the Main Menu itself.
        //	Here all we're doing is playing some music and adding a picture and button
        //	Naturally I expect you to do something significantly better :)

        music = this.sound.add('titleMusic');
        music.play();

        
        let text = this.add.text(400, 200, 'Fartastic!', {
            fontSize: '64px',
        }).setOrigin(0.5)

        this.scene.backgroundColor = "#34cceb";

        playButton = new TextButton(
            this, 400, 400,
            'Start Game', 
            { 
                fill: '#0f0',
                fontSize: '24px'
            }, 
            () => {
                //	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
                music.stop();
        
                //	And start the actual game
                this.scene.start('Game');
            }
        ).setOrigin(0.5);
        this.add.existing(playButton)

    }

    update() {

        //	Do some nice funky main menu effect here

    }
        
}
