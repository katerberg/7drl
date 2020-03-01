import {symbols} from './constants';
export default class Modal {
  constructor(display, callback, text, width, positionX, positionY) {
    this.display = display;
    this.callback = callback;
    this.width = width;
    this.height = this.addText(text) + 2;
    this.positionX = positionX;
    this.positionY = positionY;
    this.addOutline();
    this.clear();
    this.addText(text);
    this.resolver = () => {};
  }

  act() {
    return new Promise(resolve => {
      window.addEventListener('keydown', this);
      this.resolver = resolve;
    });
  }

  handleEvent({keyCode}) {
    const modalChoices = {
      89: true, // Y
      78: false, // N
    };
    if (!(keyCode in modalChoices)) {
      return;
    }
    this.callback(modalChoices[keyCode]);
    window.removeEventListener('keydown', this);
    this.resolver();
  }

  addOutline() {
    for (let x = this.positionX + 1; x < this.positionX + this.width; x++) {
      this.display.draw(x, this.positionY, symbols.MODAL_X);
      this.display.draw(x, this.positionY + this.height, symbols.MODAL_X);
    }
    for (let y = this.positionY + 1; y < this.positionY + this.height; y++) {
      this.display.draw(this.positionX, y, symbols.MODAL_Y);
      this.display.draw(this.positionX + this.width, y, symbols.MODAL_Y);
    }
    this.display.draw(this.positionX, this.positionY, symbols.MODAL_CORNER_TOP_LEFT);
    this.display.draw(this.positionX, this.positionY + this.height, symbols.MODAL_CORNER_BOTTOM_LEFT);
    this.display.draw(this.positionX + this.width, this.positionY, symbols.MODAL_CORNER_TOP_RIGHT);
    this.display.draw(this.positionX + this.width, this.positionY + this.height, symbols.MODAL_CORNER_BOTTOM_RIGHT);
  }

  addText(text) {
    return this.display.drawText(this.positionX + 1, this.positionY + 1, text, this.width - 2);
  }

  clear() {
    for (let x = this.positionX + 1; x < this.positionX + this.width; x++) {
      for (let y = this.positionY + 1; y < this.positionY + this.height; y++) {
        this.display.draw(x, y, ' ');
      }
    }
  }
}

