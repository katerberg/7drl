class Ladder {
  x: number;
  y: number;
  constructor(x: string, y: string) {
    this.x = parseInt(x, 10);
    this.y = parseInt(y, 10);
  }

  matches(keyFormat: string) {
    const [x, y] = keyFormat.split(',').map(i => parseInt(i, 10));
    return this.x === x && this.y === y ? this : false;
  }
}


export default Ladder;
