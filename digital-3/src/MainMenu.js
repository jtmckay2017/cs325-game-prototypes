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
        music.play({loop:true});

        
        let text = this.add.text(400, 200, 'Laundromat.io', {
            fontSize: '64px',
        }).setOrigin(0.5)
        let text2 = this.add.text(400, 280, 'Enter your name!', {
            fontSize: '24px',
        }).setOrigin(0.5)
        let nameForm = this.add.dom(400, 320).createFromCache('nameForm');


        this.scene.backgroundColor = "#34cceb";

        playButton = new TextButton(
            this, 400, 400,
            'Join Game', 
            { 
                fill: '#0f0',
                fontSize: '24px'
            }, 
            () => {

                let inputText = nameForm.getChildByName('nameField');
    
                //  Have they entered anything?
                if (inputText.value !== '')
                {
                    //	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
                    // music.stop();
            
                    //	And start the actual game
                    this.scene.start('Game', { playerName: inputText.value });
                }

            }
        ).setOrigin(0.5);
        this.add.existing(playButton)

    }

    update() {

        //	Do some nice funky main menu effect here

    }
        
}
