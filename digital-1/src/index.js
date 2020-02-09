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
            gravity: { y: 0 }
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



// window.onload = function() {

// 	//	Create your Phaser game and inject it into the 'game' div.
// 	//	We did it in a window.onload event, but you can do it anywhere (requireJS load, anonymous function, jQuery dom ready, - whatever floats your boat)
// 	var game = 

// 	//	Add the States your game has.
// 	//	You don't have to do this in the html, it could be done in your Boot state too, but for simplicity I'll keep it here.
	
// 	// An object for shared variables, so that them main menu can show
// 	// the high score if you want.
// 	var shared = {};
	
// 	game.scene.add( 'Boot', Boot );
// 	game.scene.add( 'Preloader', Preloader );
// 	game.scene.add( 'MainMenu', MainMenu );
// 	game.scene.add( 'Game', Game );
// 	//	Now start the Boot scene.
// 	game.scene.start('Boot');

// };