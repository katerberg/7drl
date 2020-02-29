import {DIRS} from 'rot-js';
import {colors, validKeyMap} from './constants';

class Player {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.gear = {};
    this.draw(x, y);
    this.resolver = () => {}; // eslint-disable-line no-empty-function
  }

  get coordinates() {
    return `${this.x},${this.y}`;
  }

  handleEvent({keyCode}) {
    if (!(keyCode in validKeyMap)) {
      return;
    }
    this.game.clearMessage();

    const [xChange, yChange] = DIRS[4][validKeyMap[keyCode]];
    const newX = this.x + xChange;
    const newY = this.y + yChange;
    const newSpace = `${newX},${newY}`;
    if (!this.game.map[newSpace]) {
      return;
    }
    window.removeEventListener('keydown', this);
    this.draw(newX, newY);
    const cache = this.game.retrieveCache(this.coordinates);
    if (cache) {
      this.game.sendMessage(`New Gear!${Math.random()}`);
      console.log(this.gear.helm);
      this.gear[cache.type] = cache;
    }
    this.resolver();
  }

  act() {
    return new Promise(resolve => {
      window.addEventListener('keydown', this);
      this.resolver = resolve;
    });
  }

  draw(x, y) {
    this.game.redraw(this.x, this.y);
    this.game.display.draw(x, y, '@', colors.YELLOW);
    this.x = x;
    this.y = y;
  }
}


export default Player;
