import 'phaser';
import { Game } from './Game'
import { Boot } from './Boot'
import { MainMenu } from './MainMenu'
import { Preloader } from './Preloader'

var config = {
    parent: 'game',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 980 }
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