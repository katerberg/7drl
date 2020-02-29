import 'regenerator-runtime/runtime';
import {Display, Map, RNG, Scheduler} from 'rot-js';
import Player from './Player';
import Cache from './Cache';

export default class Game {

  constructor() {
    this.display = new Display({width: 80, height: 25});
    this.map = {};
    this.engine = null;
    this.freeCells = [];
    this.caches = {};
    this.scheduler = new Scheduler.Simple();
    document.body.appendChild(this.display.getContainer());
  }

  generateMap() {
    const digger = new Map.Digger(80, 25, {dugPercentage: 0.9});

    const digCallback = (x, y, value) => {
      if (value) {
        return;
      } /* Do not store walls */

      const key = `${x},${y}`;
      this.freeCells.push(key);
      this.map[key] = '.';
    };
    digger.create(digCallback.bind(this));
  }

  popOpenFreeSpace() {
    const index = Math.floor(RNG.getUniform() * this.freeCells.length);
    return this.freeCells.splice(index, 1)[0];
  }

  drawMap() {
    for (let i = 0; i < 10; i++) {
      const space = this.popOpenFreeSpace();
      this.caches[space] = new Cache('helm');
    }
    Object.keys(this.map).forEach(key => {
      const parts = key.split(',');
      const x = parseInt(parts[0], 10);
      const y = parseInt(parts[1], 10);
      this.display.draw(x, y, this.caches[key] ? 'x' : '.');
    });
  }

  redraw(x, y) {
    this.display.draw(x, y, this.caches[`${x},${y}`] ? 'x' : '.');
  }

  sendMessage(message) {
    this.display.drawText(0, 0, message);
  }

  clearMessage() {
    for (let i = 0; i < 80; i++) {
      this.display.draw(i, 0, ' ');
    }
  }

  retrieveCache(coordinate) {
    return this.caches[coordinate];
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
