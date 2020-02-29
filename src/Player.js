import {DIRS} from 'rot-js';
import {colors, validKeyMap, symbols} from './constants';
import Modal from './modal';

class Player {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.gear = {};
    this.draw(x, y);
    this.resolver = () => {};
  }

  get coordinates() {
    return `${this.x},${this.y}`;
  }

  handleEvent({keyCode}) {
    if (!(keyCode in validKeyMap)) {
      return;
    }

    const [xChange, yChange] = DIRS[4][validKeyMap[keyCode]];
    const newX = this.x + xChange;
    const newY = this.y + yChange;
    const newSpace = `${newX},${newY}`;
    if (this.game.map[newSpace] === undefined) {
      return;
    }
    window.removeEventListener('keydown', this);
    this.draw(newX, newY);
    const cache = this.game.retrieveCache(this.coordinates);
    if (cache) {
      const pickupResponse = res => {
        if (res) {
          this.game.removeCache(this.coordinates);
          this.gear[cache.type] = cache;
        }
        this.game.rebuild();
      };
      const modal = new Modal(this.game.display, pickupResponse, 'This is an interesting helmet! Would you like to put it on?',
        20, 20, 5);
      this.game.scheduler.add(modal);
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
    const newX = x || this.x;
    const newY = y || this.y;
    this.game.redraw(this.x, this.y);
    this.game.display.draw(newX, newY, symbols.PLAYER, colors.YELLOW);
    this.x = newX;
    this.y = newY;
  }
}


export default Player;
