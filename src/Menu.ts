import {buildInstructionsModal} from './modalBuilder';
import {symbols, validMenuKeymap} from './constants';
import {Display} from 'rot-js';
import Game from './Game'

export default class Menu implements EventListenerObject {
  display: Display;
  game: Game;
  bulletPosition: number;
  width: 40;
  height: 10;
  positionX: 20;
  positionY: 5;
  cancelCallback: () => void;

  constructor(game: Game, cancelCallback: () => void) {
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
    buildInstructionsModal(this.game.display, this.buildModalCallback());
  }

  handleCancel() {
    this.releaseInput();
    this.cancelCallback();
  }

  handleEvent(evt: KeyboardEvent) {
    const keyCode: number = evt.keyCode;
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
      this.display.draw(this.positionX + 19, y, null, null ,null);
      this.display.draw(this.positionX + 20, y, null, null ,null);
      this.display.draw(this.positionX + 21, y, null, null ,null);
    }
    this.display.draw(this.positionX + 20, this.positionY + 6 + this.bulletPosition, symbols.BULLET, null ,null);
  }

  addOutline() {
    for (let x = this.positionX + 1; x < this.positionX + this.width; x++) {
      this.display.draw(x, this.positionY, symbols.MODAL_X, null ,null);
      this.display.draw(x, this.positionY + this.height, symbols.MODAL_X, null ,null);
    }
    for (let y = this.positionY + 1; y < this.positionY + this.height; y++) {
      this.display.draw(this.positionX, y, symbols.MODAL_Y, null ,null);
      this.display.draw(this.positionX + this.width, y, symbols.MODAL_Y, null ,null);
    }
    this.display.draw(this.positionX, this.positionY, symbols.MODAL_CORNER_TOP_LEFT, null ,null);
    this.display.draw(this.positionX, this.positionY + this.height, symbols.MODAL_CORNER_BOTTOM_LEFT, null ,null);
    this.display.draw(this.positionX + this.width, this.positionY, symbols.MODAL_CORNER_TOP_RIGHT, null ,null);
    this.display.draw(this.positionX + this.width, this.positionY + this.height, symbols.MODAL_CORNER_BOTTOM_RIGHT, null ,null);
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
        this.display.draw(x, y, ' ', null ,null);
      }
    }
  }
}
