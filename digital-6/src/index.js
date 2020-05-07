import 'phaser';
import { Game } from './Game'
import { Boot } from './Boot'
import { MainMenu } from './MainMenu'
import { Preloader } from './Preloader'
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

var config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 1280,
    height: 720,
    pixelArt: false,
    antialias: true,
    backgroundColor: '#df9f71',
    seed: "1234",
    dom: {
        createContainer: true
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    plugins: {
        scene: [{
            key: 'rexUI',
            plugin: UIPlugin,
            mapping: 'rexUI'
        },
        ]
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