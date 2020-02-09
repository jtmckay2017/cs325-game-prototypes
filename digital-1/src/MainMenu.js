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

        

        this.scene.backgroundColor = "#34cceb";

        playButton = new TextButton(
            this, 100, 100,
            'Start Game', 
            { fill: '#0f0'}, 
            () => {
                //	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
                music.stop();
        
                //	And start the actual game
                this.scene.start('Game');
            }
        );
        this.add.existing(playButton)

    }

    update() {

        //	Do some nice funky main menu effect here

    }
        
}
