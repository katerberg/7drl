import {DIRS} from 'rot-js';
import {colors, validKeyMap} from './constants';

class Player {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.draw(x, y);
    this.resolver = () => {}; // eslint-disable-line no-empty-function
  }

  handleEvent({keyCode}) {
    if (!(keyCode in validKeyMap)) {
      return;
    }

    const [xChange, yChange] = DIRS[4][validKeyMap[keyCode]];
    const newX = this.x + xChange;
    const newY = this.y + yChange;
    if (!this.game.map[`${newX},${newY}`]) {
      return;
    }
    window.removeEventListener('keydown', this);
    this.draw(newX, newY);
    this.resolver();
  }

  act() {
    return new Promise(resolve => {
      window.addEventListener('keydown', this);
      this.resolver = resolve;
    });
  }

  draw(x, y) {
    this.game.display.draw(this.x, this.y, '.');
    this.game.display.draw(x, y, '@', colors.YELLOW);
    this.x = x;
    this.y = y;
  }
}


export default Player;
