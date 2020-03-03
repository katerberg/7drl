import {v4 as uuid} from 'uuid';
import {colors, symbols} from './constants';

class Enemy {
  constructor(game, x, y) {
    this.game = game;
    this.id = uuid();
    this.x = x;
    this.y = y;
    this.draw(x, y);
  }

  get coordinates() {
    return `${this.x},${this.y}`;
  }

  act() {
    this.draw();
  }

  draw(x, y) {
    const newX = x || this.x;
    const newY = y || this.y;
    this.game.redraw(this.x, this.y);
    this.game.display.draw(newX, newY, symbols.ENEMY, colors.RED);
    this.x = newX;
    this.y = newY;
  }
}


export default Enemy;
