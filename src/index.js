import 'regenerator-runtime/runtime';
import Game from './Game';

const game = new Game();
game.generateMap();
game.drawWalls();
game.drawMap();
game.init();
