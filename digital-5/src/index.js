import 'phaser';
import { Game } from './Game'
import { Boot } from './Boot'
import { MainMenu } from './MainMenu'
import { Preloader } from './Preloader'

var config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 1280,
    height: 720,
    pixelArt: true,
    antialias: false,
    backgroundColor: '#df9f71',
    seed: "1234",
    dom: {
        createContainer: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    },
	scene: [
		Boot,
		Preloader,
		MainMenu,
		Game
	]
};

new Phaser.Game( config );