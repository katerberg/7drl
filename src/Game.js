import 'regenerator-runtime/runtime';
import {Display, Map, RNG, Scheduler} from 'rot-js';
import {goblins, dragons, trolls} from './static/enemies';
import Player from './Player';
import Enemy from './Enemy';
import Cache from './Cache';
import Ladder from './Ladder';
import Modal from './modal';
import {dimensions, enemies, symbols, colors, modalChoices} from './constants';

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
    this.caches = {};
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
    const numberOfCaches = this.level + 1;
    for (let i = 0; i < numberOfCaches; i++) {
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

  getEnemyAt(key) {
    const [x, y] = key.split(',').map(i => parseInt(i, 10));
    return this.enemies.filter(e => e.x === x && e.y === y)[0];
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
      const [x, y] = key.split(',').map(i => parseInt(i, 10));
      const isCache = this.caches[key];
      this.display.draw(x, y, isCache ? symbols.CACHE : symbols.OPEN, isCache ? colors.GREEN : colors.FADED_WHITE);
    });
    this.display.draw(this.exit.x, this.exit.y, symbols.LADDER, colors.WHITE);
  }

  redrawSpace(x, y) {
    let symbol = symbols.OPEN;
    let color = colors.FADED_WHITE;
    const keyFormat = `${x},${y}`;
    if (this.caches[keyFormat]) {
      symbol = symbols.CACHE;
      color = colors.GREEN;
    } else if (this.exit.matches(keyFormat)) {
      symbol = symbols.LADDER;
      color = colors.WHITE;
    } else if (!this.map[keyFormat]) {
      symbol = symbols.WALL;
      color - colors.WHITE;
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

  removeEnemy(enemy) {
    this.sendMessage(`${enemy.type} died`);
    this.scheduler.remove(enemy);
    this.redrawSpace(enemy.x, enemy.y);
    this.enemies = this.enemies.filter(e => e.id !== enemy.id);
  }

  loseGame(enemy) {
    this.scheduler.clear();
    const text = `You have lost after taking a brutal blow from a roaming ${enemy.type} named ${enemy.name}.\n\nWould you like to play again?`;
    new Modal(this.display, () => this.resetAll(), text, 40, 20, 5, modalChoices.yn);
  }

  populateEnemies() {
    if (this.level < 10) {
      for (let i = 0; i <= this.level; i++) {
        const enemy = this.createActor(Enemy, [enemies.GOBLIN, RNG.getItem(goblins)]);
        this.enemies.push(enemy);
        this.scheduler.add(enemy, true);
      }
    }
    if (this.level >= 5 && this.level < 15) {
      for (let i = 0; i <= this.level - 5; i++) {
        const enemy = this.createActor(Enemy, [enemies.TROLL, RNG.getItem(trolls)]);
        this.enemies.push(enemy);
        this.scheduler.add(enemy, true);
      }
    }
    if (this.level > 10) {
      for (let i = 0; i <= this.level - 10; i++) {
        const enemy = this.createActor(Enemy, [enemies.DRAGON, RNG.getItem(dragons)]);
        this.enemies.push(enemy);
        this.scheduler.add(enemy, true);
      }
    }
  }

  nextLevel() {
    this.scheduler.clear();
    this.scheduler.add(this.player, true);
    this.level += 1;
    this.enemies.length = 0;
    this.generateMap();
    this.drawWalls();
    this.drawMap();
    this.populateEnemies();
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
    this.populateEnemies();
    while (1) { // eslint-disable-line no-constant-condition
      const good = await this.nextTurn();
      if (!good) {
        break;
      }
    }
  }
}
