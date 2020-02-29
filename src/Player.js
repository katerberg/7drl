import {DIRS} from 'rot-js';
import {colors, validKeyMap} from './constants';

class Player {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.draw();
    this.resolver = () => {}; // eslint-disable-line no-empty-function
  }

  handleEvent({keyCode}) {
    if (!(keyCode in validKeyMap)) {
      return;
    }

    console.log(DIRS);
    console.log(DIRS[4][validKeyMap[keyCode]]);
    window.removeEventListener('keydown', this);
    this.resolver();
  }

  act() {
    return new Promise(resolve => {
      window.addEventListener('keydown', this);
      this.resolver = resolve;
    });
  }

  draw() {
    this.game.display.draw(this.x, this.y, '@', colors.YELLOW);
  }
}


export default Player;
