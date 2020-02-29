import {RNG} from 'rot-js';

class Cache {
  constructor(type) {
    this.type = type;
    this.modifiers = {
      attack: RNG.getPercentage() - 50,
      defense: RNG.getPercentage() - 50,
      hp: RNG.getPercentage() - 50,
    };
  }
}


export default Cache;
