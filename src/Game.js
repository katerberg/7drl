import 'regenerator-runtime/runtime';
import {Display, FOV, Map, RNG, Scheduler} from 'rot-js';
import {goblins, dragons, trolls, skeletons} from './static/enemies';
import {buildInstructionsModal} from './modalBuilder';
import tinycolor from 'tinycolor2';
import {v4 as uuid} from 'uuid';
import Player from './Player';
import Enemy from './Enemy';
import Cache from './Cache';
import Ladder from './Ladder';
import Modal from './Modal';
import {dimensions, enemies, symbols, colors, modalChoices} from './constants';

export default class Game {

  constructor() {
    this.display = new Display({width: dimensions.WIDTH, height: dimensions.HEIGHT});
    this.devmode = window.location.href.indexOf('devmode') > -1;
    this.resetAll();
    document.body.appendChild(this.display.getContainer());
    if (!this.devmode) {
      this.player.releaseInput();
      buildInstructionsModal(this.display, () => {
        this.rebuild();
        this.player.listenForInput();
      });
    }
  }

  resetAll() {
    this.map = {};
    this.level = 0;
    this.seenSpaces = {};
    this.player = null;
    this.enemies = [];
    this.exit = null;
    this.freeCells = [];
    this.caches = {};
    this.scheduler = new Scheduler.Simple();
    this.generateMap();
    this.drawWalls();
    this.init();
  }

  rebuild() {
    this.drawWalls();
    this.display.draw(this.exit[0], this.exit[1], symbols.LADDER, colors.WHITE);
    this.player.draw();
    this.enemies.forEach(e => e.draw());
  }

  get digPercentage() {
    return this.level * 0.1;
  }

  generateMap() {
    this.freeCells.length = 0;
    this.caches = {};
    this.map = {};
    const digger = new Map.Digger(Math.ceil(dimensions.WIDTH - 30 + this.level * 3), dimensions.HEIGHT - 1, {dugPercentage: this.digPercentage, corridorLength: [0,5]});

    const digCallback = (x, y, value) => {
      if (value) {
        return;
      }

      const key = `${x},${y + 1}`;
      this.freeCells.push(key);
      this.map[key] = symbols.OPEN;
    };
    digger.create(digCallback.bind(this));
    if (this.level !== 10) {
      this.addExitLadder();
    }
    const numberOfCaches = this.level + 1;
    for (let i = 0; i < numberOfCaches; i++) {
      const space = this.popOpenFreeSpace();
      this.caches[space] = new Cache(this.level);
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
        if (!this.seenSpaces[`${i},${j}`]) {
          this.display.draw(i, j, symbols.WALL);
        }
      }
    }
  }

  lightPasses(x, y) {
    return this.map[`${x},${y}`];
  }

  drawFov() {
    const currentRun = uuid();
    const fov = new FOV.PreciseShadowcasting(this.lightPasses.bind(this));
    fov.compute(this.player.x, this.player.y, 500, (x, y) => {
      const key = `${x},${y}`;
      this.seenSpaces[key] = currentRun;
      this.redrawSpace(x, y, !this.map[key]);
    });
    Object.keys(this.seenSpaces).filter(s => this.seenSpaces[s] !== currentRun).forEach(s => {
      const [x, y] = s.split(',').map(c => parseInt(c, 10));
      this.redrawSpace(x, y, true);
    });
  }


  redrawSpace(x, y, faded) {
    let symbol = symbols.OPEN;
    let color = colors.FADED_WHITE;
    const keyFormat = `${x},${y}`;
    if (this.player.x === x && this.player.y === y) {
      symbol = symbols.PLAYER;
      color = colors.YELLOW;
    } else if (this.caches[keyFormat]) {
      symbol = symbols[this.caches[keyFormat].type.toUpperCase()];
      color = colors.GREEN;
    } else if (!faded && this.enemies.find(e => e.x === x && e.y === y)) {
      const enemy = this.enemies.find(e => e.x === x && e.y === y);
      ({color, symbol} = enemy);
    } else if (this.exit.matches(keyFormat)) {
      symbol = symbols.LADDER;
      color = colors.WHITE;
    } else if (!this.map[keyFormat]) {
      symbol = symbols.WALL;
      color - colors.WHITE;
    }
    color = faded ? tinycolor(color).darken(30).toString() : color;
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
    this.drawFov();
    this.enemies = this.enemies.filter(e => e.id !== enemy.id);
  }

  playAgainCallback(res) {
      this.resetAll();
      if (!res) {
        this.player.handleOpenMenu();
      }
  }

  loseGame(enemy) {
    this.scheduler.clear();
    const text = `You have lost after taking a brutal blow from a roaming ${enemy.type} named ${enemy.name}.\n\nWould you like to play again?`;
    new Modal(this.display, this.playAgainCallback.bind(this), text, 40, 20, 5, modalChoices.yn);
  }

  winGame() {
    this.scheduler.clear();
    const text = 'You have defeated Gothmog, Lord of the Balrogs! Would you like to play again?';
    new Modal(this.display, this.playAgainCallback.bind(this), text, 40, 20, 5, modalChoices.yn);
  }

  populateEnemies() {
    if (this.level < 9) {
      for (let i = 0; i <= (this.level > 5 ? 5 : this.level); i++) {
        const enemy = this.createActor(Enemy, [enemies.GOBLIN, RNG.getItem(goblins)]);
        enemy.draw();
        this.enemies.push(enemy);
        this.scheduler.add(enemy, true);
      }
    }
    if (this.level >= 1 && this.level < 8) {
      const sub = this.level - 5;
      const numberOfSkeletons = sub > 0 ? this.level - sub : this.level;
      for (let i = 0; i < numberOfSkeletons; i++) {
        const enemy = this.createActor(Enemy, [enemies.SKELETON, RNG.getItem(skeletons)]);
        enemy.draw();
        this.enemies.push(enemy);
        this.scheduler.add(enemy, true);
      }
    }
    if (this.level >= 4) {
      for (let i = 0; i < this.level - 3; i++) {
        const enemy = this.createActor(Enemy, [enemies.TROLL, RNG.getItem(trolls)]);
        enemy.draw();
        this.enemies.push(enemy);
        this.scheduler.add(enemy, true);
      }
    }
    if (this.level > 7) {
      for (let i = 0; i <= this.level - 7; i++) {
        const enemy = this.createActor(Enemy, [enemies.DRAGON, RNG.getItem(dragons)]);
        enemy.draw();
        this.enemies.push(enemy);
        this.scheduler.add(enemy, true);
      }
    }
    if (this.level === 10) {
      const enemy = this.createActor(Enemy, [enemies.BALROG, 'Gothmog']);
      enemy.draw();
      this.enemies.push(enemy);
      this.scheduler.add(enemy, true);
    }
  }

  nextLevel() {
    this.scheduler.clear();
    this.scheduler.add(this.player, true);
    this.level += 1;
    this.enemies.length = 0;
    this.generateMap();
    this.populateEnemies();
    this.seenSpaces = {};
    if (!this.map[this.player.coordinates]) {
      const key = this.popOpenFreeSpace();
      const [x, y] = key.split(',').map(i => parseInt(i, 10));
      this.player.draw(x, y);
    }
    this.drawWalls();
    this.drawFov();
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
    this.drawWalls();
    this.drawFov();
    while (1) { // eslint-disable-line no-constant-condition
      const good = await this.nextTurn();
      if (!good) {
        break;
      }
    }
  }
}
