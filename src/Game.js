import 'regenerator-runtime/runtime';
import {Display, Map, RNG, Scheduler} from 'rot-js';
import Player from './Player';
import Cache from './Cache';
import {dimensions, symbols} from './constants';

export default class Game {

  constructor() {
    this.display = new Display({width: dimensions.WIDTH, height: dimensions.HEIGHT});
    this.map = {};
    this.player = null;
    this.freeCells = [];
    this.caches = {};
    this.scheduler = new Scheduler.Simple();
    document.body.appendChild(this.display.getContainer());
  }

  rebuild() {
    this.drawWalls();
    this.drawMap();
    this.player.draw();
  }

  generateMap() {
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
    for (let i = 0; i < 10; i++) {
      const space = this.popOpenFreeSpace();
      this.caches[space] = new Cache('helm');
    }
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
      this.display.draw(x, y, this.caches[key] ? symbols.CACHE : symbols.OPEN);
    });
  }

  redraw(x, y) {
    this.display.draw(x, y, this.caches[`${x},${y}`] ? symbols.CACHE : symbols.OPEN);
  }

  sendMessage(message) {
    this.display.drawText(0, 0, message);
  }

  clearMessage() {
    for (let i = 0; i < dimensions.WIDTH; i++) {
      this.display.draw(i, 0, ' ');
    }
  }

  retrieveCache(coordinate) {
    return this.caches[coordinate];
  }

  removeCache(coordinate) {
    delete this.caches[coordinate];
  }

  createPlayer() {
    const key = this.popOpenFreeSpace();
    const parts = key.split(',');
    const x = parseInt(parts[0], 10);
    const y = parseInt(parts[1], 10);
    return new Player(this, x, y);
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
    this.player = this.createPlayer();
    this.scheduler.add(this.player, true);
    while (1) { // eslint-disable-line no-constant-condition
      const good = await this.nextTurn();
      if (!good) {
        break;
      }
    }
  }
}
