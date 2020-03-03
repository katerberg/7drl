import 'regenerator-runtime/runtime';
import {Display, Map, RNG, Scheduler} from 'rot-js';
import {demons} from './static/demons';
import Player from './Player';
import Enemy from './Enemy';
import Cache from './Cache';
import Ladder from './Ladder';
import Modal from './modal';
import {dimensions, symbols, colors} from './constants';

export default class Game {

  constructor() {
    this.display = new Display({width: dimensions.WIDTH, height: dimensions.HEIGHT});
    this.resetAll();
    document.body.appendChild(this.display.getContainer());
  }

  resetAll() {
    this.map = {};
    this.level = 0;
    this.player = null;
    this.enemies = [];
    this.exit = null;
    this.freeCells = [];
    this.caches = {};
    this.scheduler = new Scheduler.Simple();
    this.generateMap();
    this.drawWalls();
    this.drawMap();
    this.init();
  }

  rebuild() {
    this.drawWalls();
    this.drawMap();
    this.display.draw(this.exit[0], this.exit[1], symbols.LADDER, colors.WHITE);
    this.player.draw();
    this.enemies.forEach(e => e.draw());
  }

  generateMap() {
    this.freeCells.length = 0;
    this.caches.length = 0;
    this.map = {};
    const digger = new Map.Digger(dimensions.WIDTH, dimensions.HEIGHT - 1, {dugPercentage: 0.9});

    const digCallback = (x, y, value) => {
      if (value) {
        return;
      } /* Do not store walls */

      const key = `${x},${y + 1}`;
      this.freeCells.push(key);
      this.map[key] = symbols.OPEN;
    };
    digger.create(digCallback.bind(this));
    this.addExitLadder();
    for (let i = 0; i < 10; i++) {
      const space = this.popOpenFreeSpace();
      this.caches[space] = new Cache(this.level);
    }
    this.drawLevel();
  }

  drawLevel() {
    this.display.draw(dimensions.WIDTH - 4, 0, 'L');
    const levelString = `${this.level}`.padStart(3, 0);
    for (let i = 3; i > 0; i--) {
      this.display.draw(dimensions.WIDTH - i, 0, levelString[levelString.length - i]);
    }
  }

  addExitLadder() {
    this.exit = new Ladder(...this.popOpenFreeSpace().split(','));
  }

  popOpenFreeSpace() {
    const index = Math.floor(RNG.getUniform() * this.freeCells.length);
    return this.freeCells.splice(index, 1)[0];
  }

  drawWalls() {
    for (let i = 0; i < dimensions.WIDTH; i++) {
      for (let j = 1; j < dimensions.HEIGHT; j++) {
        if (!this.map[`${i},${j}`]) {
          this.display.draw(i, j, symbols.WALL);
        }
      }
    }
  }

  drawMap() {
    Object.keys(this.map).forEach(key => {
      const parts = key.split(',');
      const x = parseInt(parts[0], 10);
      const y = parseInt(parts[1], 10);
      const isCache = this.caches[key];
      this.display.draw(x, y, isCache ? symbols.CACHE : symbols.OPEN, isCache ? colors.GREEN : null);
    });
    this.display.draw(this.exit.x, this.exit.y, symbols.LADDER, colors.WHITE);
  }

  redrawSpace(x, y) {
    let symbol = symbols.OPEN;
    let color = null;
    const keyFormat = `${x},${y}`;
    if (this.caches[keyFormat]) {
      symbol = symbols.CACHE;
      color = colors.GREEN;
    } else if (this.exit.matches(keyFormat)) {
      symbol = symbols.LADDER;
      color = colors.RED;
    } else if (!this.map[keyFormat]) {
      symbol = symbols.WALL;
    }
    this.display.draw(x, y, symbol, color);
  }

  sendMessage(message) {
    this.display.drawText(0, 0, message);
  }

  clearMessage() {
    for (let i = 0; i < dimensions.WIDTH - 15; i++) {
      this.display.draw(i, 0, ' ');
    }
  }

  retrieveContents(coordinate) {
    return this.caches[coordinate] || this.exit.matches(coordinate);
  }

  removeCache(coordinate) {
    delete this.caches[coordinate];
  }


  buildModalCallback() {
    return () => {
      this.resetAll();
    };
  }

  loseGame(enemy) {
    this.scheduler.clear();
    const loseResponse = this.buildModalCallback();
    const text = `You have lost after taking a brutal blow from a roaming ${enemy.type} named ${enemy.name}.`;
    new Modal(this.display, loseResponse, text, 40, 20, 5);
  }

  nextLevel() {
    this.scheduler.clear();
    this.scheduler.add(this.player, true);
    this.level += 1;
    this.enemies.length = 0;
    this.generateMap();
    this.drawWalls();
    this.drawMap();
    for (let i = 0; i < this.level; i++) {
      this.enemies.push(this.createActor(Enemy, ['Demon', RNG.getItem(demons)]));
      this.scheduler.add(this.enemies[i], true);
    }
    if (!this.map[this.player.coordinates]) {
      const key = this.popOpenFreeSpace();
      const [x, y] = key.split(',').map(i => parseInt(i, 10));
      this.player.draw(x, y);
    }
  }

  createActor(Actor, params = []) {
    const key = this.popOpenFreeSpace();
    const [x, y] = key.split(',').map(i => parseInt(i, 10));
    return new Actor(this, x, y, ...params);
  }

  async nextTurn() {
    const actor = this.scheduler.next();
    if (!actor) {
      return false;
    }
    await actor.act();
    return true;
  }

  async init() {
    this.player = this.createActor(Player);
    this.scheduler.add(this.player, true);
    this.enemies.push(this.createActor(Enemy, ['Demon', RNG.getItem(demons)]));
    this.enemies.forEach(e => this.scheduler.add(e, true));
    while (1) { // eslint-disable-line no-constant-condition
      const good = await this.nextTurn();
      if (!good) {
        break;
      }
    }
  }
}
