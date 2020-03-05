import { TextButton } from './game-objects/text-button';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super("MainMenu")
        this.music = null;
    }


    create() {
        var playButton = null;

        //	We've already preloaded our assets, so let's kick right into the Main Menu itself.
        //	Here all we're doing is playing some music and adding a picture and button
        //	Naturally I expect you to do something significantly better :)
        if (!this.music) {
            this.music = this.sound.add('titleMusic');
            this.music.play({loop:true});
        }


        
        let text = this.add.text(640, 200, 'Egg Dodge', {
            fontSize: '64px',
        }).setOrigin(0.5)
        text.alpha = 0.1;
        this.tweens.add({
            targets: text,
            alphaTopLeft: { value: 1, duration: 5000, ease: 'Power1' },
            alphaBottomRight: { value: 1, duration: 10000, ease: 'Power1' },
            alphaBottomLeft: { value: 1, duration: 5000, ease: 'Power1', delay: 5000 },
            yoyo: true,
            loop: -1
    
        });        
        
        let text2 = this.add.text(640, 280, 'Time to get YOKED', {
            fontSize: '24px',
        }).setOrigin(0.5)


        this.scene.backgroundColor = "#34cceb";

        playButton = new TextButton(
            this, 640, 400,
            'Start Game', 
            { 
                fill: '#0f0',
                fontSize: '24px'
            }, 
            () => {

                this.scene.start('Game');


            }
        ).setOrigin(0.5);
        this.add.existing(playButton)
        this.tweens.add({
            targets: playButton,
            duration: 1000,
            y: 415,
            delay: 1,
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: true
        });

    }

    update() {

        //	Do some nice funky main menu effect here

    }
        
}
