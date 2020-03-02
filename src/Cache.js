class Cache {
  constructor(type, name, attack = 0, defense = 0, hp = 0) {
    this.type = type;
    this.name = name;
    this.modifiers = {
      attack,
      defense,
      hp,
    };
  }

  get display() {
    return `${this.type} of ${this.name}`;
  }

  get modifier() {
    return this.attack || this.defense || this.hp;
  }
}


export default Cache;
