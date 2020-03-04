import {v4 as uuid} from 'uuid';
import {Path} from 'rot-js';
import {colors, symbols} from './constants';

class Enemy {
  constructor(game, x, y, type, name) {
    this.game = game;
    this.id = uuid();
    this.x = x;
    this.y = y;
    this.name = name;
    this.type = type;
    this.stats = {
      strength: 1,
      dexterity: 0,
      maxHp: 3,
    };
    this.currentHp = this.stats.maxHp;
    this.draw(x, y);
  }

  get coordinates() {
    return `${this.x},${this.y}`;
  }

  act() {
    const playerX = this.game.player.x;
    const playerY = this.game.player.y;
    const aStarCallback = (x, y) => `${x},${y}` in this.game.map;
    const aStar = new Path.AStar(playerX, playerY, aStarCallback, {topology: 8});
    const path = [];
    const pathCallback = (x, y) => path.push([x, y]);
    aStar.compute(this.x, this.y, pathCallback);
    path.shift();
    if (path[0]) {
      const [[nextX, nextY]] = path;
      if (nextX === playerX && nextY === playerY) {
        this.game.player.takeDamage(this.stats.strength, this);
      } else {
        this.draw(nextX, nextY);
      }
    }
  }

  draw(x, y) {
    const newX = x || this.x;
    const newY = y || this.y;
    this.game.redrawSpace(this.x, this.y);
    this.game.display.draw(newX, newY, symbols.ENEMY, colors.RED);
    this.x = newX;
    this.y = newY;
  }

  takeDamage(damage) {
    this.currentHp -= damage;
    if (this.currentHp <= 0) {
      this.game.removeEnemy(this);
    }
  }
}


export default Enemy;

