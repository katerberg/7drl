import {DIRS, RNG} from 'rot-js';
import {colors, dimensions, modalChoices, movementKeymap, validKeymap, symbols} from './constants';
import Cache from './Cache';
import Ladder from './Ladder';
import Modal from './Modal';
import Menu from './Menu';

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
    this.gear = {
      Weapon: null,
      Armor: null,
      Amulet: null,
    };
    this.currentHp = 5;
    this.xp = 0;
    this.draw(x, y);
    this.resolver = () => {};
  }

  get coordinates() {
    return `${this.x},${this.y}`;
  }

  getDamage() {
    const modifier = this.gear.Weapon ? this.gear.Weapon.modifier : 0;
    return this.stats.strength + modifier;
  }

  handleEvent({keyCode}) {
    if (keyCode === 81 && this.game.devmode) {
      this.game.nextLevel();
    }
    if (!(keyCode in validKeymap)) {
      if (this.game.devmode) {
        console.log(`Keycode is ${keyCode}`); // eslint-disable-line no-console
      }
      return;
    }
    this.game.clearMessage();
    if (keyCode in movementKeymap) {
      this.handleMovement(keyCode);
    } else if (validKeymap[keyCode] === 'Menu') {
      this.handleOpenMenu();
    } else if (validKeymap[keyCode] === 'Gear') {
      this.handleOpenInventory();
    }
  }

  displayStat(stat, gear) {
    return `${this.stats[stat] + (gear ? gear.modifier : 0)}`.padStart(3);
  }

  releaseInput() {
    window.removeEventListener('keydown', this);
  }

  listenForInput() {
    window.addEventListener('keydown', this);
  }

  calculateDamage(incomingDamage, source) {
    const dexDiff = this.stats.dexterity - source.stats.dexterity;
    if (RNG.getPercentage() < dexDiff) {
      return null;
    }
    if (this.gear.Armor) {
      const percent = RNG.getPercentage();
      const damage = Math.ceil(incomingDamage - this.gear.Armor.modifier * percent / 100);
      if (damage < 0) {
        return 0;
      }
      return damage;
    }

    return incomingDamage;
  }

  takeDamage(incomingDamage, enemy) {
    const damage = this.calculateDamage(incomingDamage, enemy);
    this.game.clearMessage();
    if (damage === null) {
      this.game.sendMessage(`You dodged the attack from a ${enemy.type.toLowerCase()}`);
    } else if (damage === 0) {
      this.game.sendMessage(`Your armor absorbed all the damage from a ${enemy.type.toLowerCase()}`);
    } else {
      this.game.sendMessage(`A ${enemy.type.toLowerCase()} hit you for ${damage} damage`);
    }
    this.currentHp -= damage;
    if (this.currentHp <= 0) {
      this.currentHp = 0;
    }
    this.draw();
    if (this.currentHp === 0) {
      this.releaseInput();
      this.game.loseGame(enemy);
    }
  }

  addXp(amount) {
    this.xp += amount;
  }

  buildModalCallback(callback) {
    this.releaseInput();
    return (res) => {
      callback && callback(res);
      this.game.rebuild();
      this.listenForInput();
    };
  }

  handleOpenInventory() {
    const pickupResponse = this.buildModalCallback();
    const gearText = `STR:${this.displayStat('strength', this.gear.Weapon)}    ${getDisplayText(this.gear.Weapon) || 'No weapon'}
    DEX:${this.displayStat('dexterity', this.gear.Armor)}    ${getDisplayText(this.gear.Armor) || 'No armor'}
    HP: ${this.displayStat('maxHp', this.gear.Amulet)}    ${getDisplayText(this.gear.Amulet) || 'No amulet'}
    XP: ${`${this.xp}`.padStart(3)}`;
    new Modal(this.game.display, pickupResponse, gearText, 70, 5, 5);
  }

  handleOpenMenu() {
    new Menu(this.game, this.buildModalCallback());
  }

  equip(gear) {
    if (gear.type === 'Amulet') {
      if (this.gear.Amulet) {
        this.currentHp -= this.gear.Amulet.modifier;
      }
      this.currentHp += gear.modifier;
    }
    this.gear[gear.type] = gear;
    this.game.sendMessage(`New ${gear.type} equipped (${gear.modifier >= 0 ? '+' : ''}${gear.modifier})`);
  }

  handleMovement(keyCode) {
    const [xChange, yChange] = DIRS[4][movementKeymap[keyCode]];
    const newX = this.x + xChange;
    const newY = this.y + yChange;
    const newSpace = `${newX},${newY}`;
    if (this.game.map[newSpace] === undefined) {
      return;
    }
    const enemyInSpace = this.game.getEnemyAt(newSpace);
    if (enemyInSpace) {
      enemyInSpace.takeDamage(this.getDamage(), this);
      return this.resolver();
    }
    this.draw(newX, newY);
    const contents = this.game.retrieveContents(this.coordinates);
    if (contents instanceof Cache) {
      const pickupResponse = this.buildModalCallback(res => {
        if (res) {
          this.game.removeCache(this.coordinates);
          this.equip(contents);
        }
        this.resolver();
      });
      new Modal(this.game.display, pickupResponse, `${contents.display}. Would you like to equip it?`,
        20, 20, 5, modalChoices.yn);
    } else if (contents instanceof Ladder) {
      const nextLevelResponse = this.buildModalCallback(res => {
        if (res) {
          this.game.nextLevel();
        }
      });
      new Modal(this.game.display, nextLevelResponse, 'Are you ready to delve deeper?',
        20, 20, 5, modalChoices.yn);
    } else {
      this.resolver();
    }
  }

  act() {
    return new Promise(resolve => {
      this.listenForInput();
      this.resolver = resolve;
    });
  }

  drawHp() {
    this.game.display.drawText(dimensions.WIDTH - 15, 0, 'HP:');
    const currentHpString = `${this.currentHp}`;
    const maxHpString = `${this.stats.maxHp + (this.gear.Amulet ? this.gear.Amulet.modifier : 0)}`;
    const start = dimensions.WIDTH - 12;
    for (let i = 0; i < currentHpString.length; i++) {
      this.game.display.draw(start + i, 0, currentHpString[i]);
    }
    this.game.display.draw(start + currentHpString.length, 0, '/');
    for (let i = 0; i < maxHpString.length; i++) {
      this.game.display.draw(start + i + 1 + currentHpString.length, 0, maxHpString[i]);
    }
    for (let i = 0; i <= 6 - maxHpString.length - currentHpString.length; i++) {
      this.game.display.draw(start + i + 1 + currentHpString.length + maxHpString.length, 0, ' ');
    }
  }

  draw(x, y) {
    const newX = x || this.x;
    const newY = y || this.y;
    this.game.redrawSpace(this.x, this.y);
    this.game.display.draw(newX, newY, symbols.PLAYER, colors.YELLOW);
    this.x = newX;
    this.y = newY;
    this.drawHp();
  }
}

export default Player;
