import 'phaser';
import { Game } from './Game'
import { Boot } from './Boot'
import { MainMenu } from './MainMenu'
import { Preloader } from './Preloader'

var config = {
    parent: 'game',
    width: 800,
    height: 600,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 }
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