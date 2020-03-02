import {DIRS} from 'rot-js';
import {colors, dimensions, modalChoices, movementKeymap, validKeymap, symbols} from './constants';
import Cache from './Cache';
import Ladder from './Ladder';
import Modal from './modal';

function getDisplayText(gear) {
  if (gear) {
    return `${gear.display} (+${gear.modifier})`;
  }
}

class Player {
  constructor(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.stats = {
      maxHp: 5,
      strength: 1,
      dexterity: 1,
    };
    this.gear = {};
    this.currentHp = 5;
    this.xp = 0;
    this.draw(x, y);
    this.resolver = () => {};
  }

  get coordinates() {
    return `${this.x},${this.y}`;
  }

  handleEvent({keyCode}) {
    if (!(keyCode in validKeymap)) {
      console.log(`Keycode is ${keyCode}`); // eslint-disable-line no-console
      return;
    }
    if (keyCode in movementKeymap) {
      this.handleMovement(keyCode);
    } else if (validKeymap[keyCode] === 'Gear') {
      this.handleOpenInventory();
    }
    window.removeEventListener('keydown', this);
    this.resolver();
  }

  displayStat(stat) {
    return `${this.stats[stat]}`.padStart(3);
  }

  handleOpenInventory() {

    const pickupResponse = () => {
      this.game.rebuild();
    };
    const gearText = `STR:${this.displayStat('strength')}    ${getDisplayText(this.gear.Weapon) || 'No weapon'}
    DEX:${this.displayStat('dexterity')}    ${getDisplayText(this.gear.Armor) || 'No armor'}
    HP: ${this.displayStat('maxHp')}    ${getDisplayText(this.gear.Amulet) || 'No amulet'}
    XP: ${`${this.xp}`.padStart(3)}
`;
    const modal = new Modal(this.game.display, pickupResponse, gearText, 70, 5, 5);
    this.game.scheduler.add(modal);
  }

  handleMovement(keyCode) {
    const [xChange, yChange] = DIRS[4][movementKeymap[keyCode]];
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
      const modal = new Modal(this.game.display, pickupResponse, `${contents.display}. Would you like to equip it?`,
        20, 20, 5, modalChoices.yn);
      this.game.scheduler.add(modal);
    } else if (contents instanceof Ladder) {
      const nextLevelResponse = res => {
        if (res) {
          this.game.nextLevel();
        }
        this.game.rebuild();
      };
      const modal = new Modal(this.game.display, nextLevelResponse, 'Are you ready to climb higher?',
        20, 20, 5, modalChoices.yn);
      this.game.scheduler.add(modal);
    }
  }

  act() {
    return new Promise(resolve => {
      window.addEventListener('keydown', this);
      this.resolver = resolve;
    });
  }

  drawHp() {
    this.game.display.drawText(dimensions.WIDTH - 15, 0, 'HP:');
    const currentHpString = `${this.currentHp}`;
    const maxHpString = `${this.stats.maxHp}`;
    const start = dimensions.WIDTH - 12;
    for (let i = 0; i < currentHpString.length; i++) {
      this.game.display.draw(start + i, 0, currentHpString[i]);
    }
    this.game.display.draw(start + currentHpString.length, 0, '/');
    for (let i = 0; i < maxHpString.length; i++) {
      this.game.display.draw(start + i + 1 + currentHpString.length, 0, maxHpString[i]);
    }
  }

  draw(x, y) {
    const newX = x || this.x;
    const newY = y || this.y;
    this.game.redraw(this.x, this.y);
    this.game.display.draw(newX, newY, symbols.PLAYER, colors.YELLOW);
    this.x = newX;
    this.y = newY;
    this.drawHp();
  }
}


export default Player;
