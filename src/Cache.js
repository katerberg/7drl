import {RNG} from 'rot-js';
import {animals} from './static/animals';
import {gearTypes} from './constants';

class Cache {
  constructor(level, type, name, attack = 0, defense = 0, hp = 0) {
    if (type) {
      this.defaultConstructor(type, name, attack, defense, hp);
    } else {
      this.randomConstructor(level);
    }
  }

  defaultConstructor(type, name, attack, defense, hp) {
    this.type = type;
    this.name = name;
    this.modifiers = {
      attack,
      defense,
      hp,
    };
  }

  randomConstructor(level) {
    this.type = RNG.getWeightedValue(gearTypes);
    this.name = RNG.getItem(animals);
    this.modifiers = {
      defense: 0,
      attack: 0,
      hp: 0,
    };
    switch (this.type) { // eslint-disable-line default-case
    case 'Armor':
      this.modifiers.defense = RNG.getUniformInt(level, level + 5);
      break;
    case 'Weapon':
      this.modifiers.attack = RNG.getUniformInt(level, level + 5);
      break;
    case 'Amulet':
      this.modifiers.hp = RNG.getUniformInt(level, level + 20);
      break;
    }
  }

  get display() {
    return `${this.type} of the ${this.name}`;
  }

  get modifier() {
    return this.modifiers.attack || this.modifiers.defense || this.modifiers.hp;
  }
}


export default Cache;
