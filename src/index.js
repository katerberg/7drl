import 'regenerator-runtime/runtime';
import {Display, Map, RNG, Scheduler} from 'rot-js';
import {colors, validKeyMap} from './constants';

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.draw();
    this.resolver = () => {}; // eslint-disable-line no-empty-function
  }

  handleEvent({keyCode}) {
    if (!(keyCode in validKeyMap)) {
      return;
    }
    console.log(validKeyMap[keyCode]);
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
    game.display.draw(this.x, this.y, '@', colors.YELLOW);
  }
}

class Game {

  constructor() {
    this.display = new Display({width: 80, height: 25});
    this.map = {};
    this.engine = null;
    this.freeCells = [];
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
      this.map[key] = value ? '-' : '.';
    };
    digger.create(digCallback.bind(this));
  }

  popOpenFreeSpace() {
    const index = Math.floor(RNG.getUniform() * this.freeCells.length);
    return this.freeCells.splice(index, 1)[0];
  }

  drawMap() {
    Array(10).fill().forEach(() => {
      this.map[this.popOpenFreeSpace()] = 'x';
    });
    Object.keys(this.map).forEach(key => {
      const parts = key.split(',');
      const x = parseInt(parts[0], 10);
      const y = parseInt(parts[1], 10);
      this.display.draw(x, y, this.map[key]);
    });
  }

  createPlayer() {
    const key = this.popOpenFreeSpace();
    const parts = key.split(',');
    const x = parseInt(parts[0], 10);
    const y = parseInt(parts[1], 10);
    return new Player(x, y);
  }

  async init() {
    this.player = this.createPlayer();
    this.scheduler.add(this.player, true);
    while (1) {
      const actor = this.scheduler.next();
      if (!actor) {
        break;
      }
      await actor.act();
    }
  }
}

const game = new Game();
game.generateMap();
game.drawMap();
game.init();
