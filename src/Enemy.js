class Enemy {
  constructor(game) {
    this.game = game;
  }

  get coordinates() {
    return `${this.x},${this.y}`;
  }

  act() {
    console.log('moving enemy');
  }
}


export default Enemy;
