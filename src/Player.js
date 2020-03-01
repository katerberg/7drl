import {DIRS} from 'rot-js';
import {colors, validKeyMap, symbols} from './constants';
import Cache from './Cache';
import Ladder from './Ladder';
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
    this.draw(newX, newY);
    const contents = this.game.retrieveContents(this.coordinates);
    if (contents instanceof Cache) {
      const pickupResponse = res => {
        if (res) {
          this.game.removeCache(this.coordinates);
          this.gear[contents.type] = contents;
        }
        this.game.rebuild();
      };
      const modal = new Modal(this.game.display, pickupResponse, 'This is an interesting helmet! Would you like to put it on?',
        20, 20, 5);
      this.game.scheduler.add(modal);
    } else if (contents instanceof Ladder) {
      const nextLevelResponse = res => {
        if (res) {
          this.game.nextLevel();
        }
        this.game.rebuild();
      };
      const modal = new Modal(this.game.display, nextLevelResponse, 'Are you ready to climb higher?',
        20, 20, 5);
      this.game.scheduler.add(modal);
    }
    window.removeEventListener('keydown', this);
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
