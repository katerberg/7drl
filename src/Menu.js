import Modal from './Modal';
import {symbols, validMenuKeymap} from './constants';

export default class Menu {
  constructor(game, cancelCallback) {
    this.game = game;
    this.display = game.display;
    this.cancelCallback = cancelCallback;
    this.bulletPosition = 0;
    this.width = 40;
    this.height = 10;
    this.positionX = 20;
    this.positionY = 5;
    this.reset();
    this.listenForInput();
  }

  reset() {
    this.game.rebuild();
    this.addOutline();
    this.clear();
    this.drawTitle();
    this.addOptions();
    this.redrawBullet();
  }

  listenForInput() {
    window.addEventListener('keydown', this);
  }

  releaseInput() {
    window.removeEventListener('keydown', this);
  }

  buildModalCallback() {
    this.releaseInput();
    return () => {
      this.reset();
      this.listenForInput();
    };
  }

  handleOpenInstructions() {
    const insructions = `
    Wander the depths of the dungeon collecting items and defeating foes to grant you experience until you find and are able to defeat the dark master of the pit...

    Movement: ▲ ▼ ◄ ► / WSAD / KJHL
    `;
    new Modal(this.game.display, this.buildModalCallback(), insructions, 40, 20, 5);
  }

  handleCancel() {
    this.releaseInput();
    this.cancelCallback();
  }

  handleEvent({keyCode}) {
    if (!(keyCode in validMenuKeymap)) {
      return;
    }
    const selection = validMenuKeymap[keyCode];
    if (selection === 0 || selection === 2) {
      const contain = val => (val + 3) % 3;
      if (selection === 0) {
        this.bulletPosition = contain(this.bulletPosition - 1);
      }
      if (selection === 2) {
        this.bulletPosition = contain(this.bulletPosition + 1);
      }
      this.redrawBullet();
    } else if (selection === 'Select') {
      if (this.bulletPosition === 0) {
        this.handleCancel();
      }
      if (this.bulletPosition === 1) {
        this.handleOpenInstructions();
      }
      if (this.bulletPosition === 2) {
        this.releaseInput();
        this.game.resetAll();
      }
    } else if (selection === 'Cancel') {
      this.handleCancel();
    }
  }

  redrawBullet() {
    for (let y = this.positionY + 5; y < this.positionY + 10; y++) {
      this.display.draw(this.positionX + 19, y);
      this.display.draw(this.positionX + 20, y);
      this.display.draw(this.positionX + 21, y);
    }
    this.display.draw(this.positionX + 20, this.positionY + 6 + this.bulletPosition, symbols.BULLET);
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

  drawTitle() {
    let yCursor = this.positionY + 1;
    const xCursor = this.positionX + 1;
    const line0 = '/\\/\\   ___ _ __  _   _ ';
    const line1 = '/    \\ / _ \\ \'_ \\| | | |';
    const line2 = '/ /\\/\\ \\  __/ | | | |_| |';
    const line3 = '\\/    \\/\\___|_| |_|\\__,_|';
    this.display.drawText(xCursor + 9, yCursor++, line0, this.width - 2);
    this.display.drawText(xCursor + 8, yCursor++, line1, this.width - 2);
    this.display.drawText(xCursor + 7, yCursor++, line2, this.width - 2);
    this.display.drawText(xCursor + 7, yCursor++, line3, this.width - 2);
  }

  addOptions() {

    const options = `
    Continue
    Instructions
    New Game
    `;
    this.display.drawText(this.positionX + 22, this.positionY + 5, options, this.width - 2);
  }

  clear() {
    for (let x = this.positionX + 1; x < this.positionX + this.width; x++) {
      for (let y = this.positionY + 1; y < this.positionY + this.height; y++) {
        this.display.draw(x, y, ' ');
      }
    }
  }
}

