import {expect} from 'chai';
import sinon from 'sinon';
import Player from './Player';
import {colors} from './constants';

describe('Player', () => {
  describe('constuctor', () => {
    it('populates coordinates', () => {

      const result = new Player({
        redraw: sinon.stub(),
        display: {
          draw: sinon.stub(),
        }}, 1, 5);

      expect(result.x).to.equal(1);
      expect(result.y).to.equal(5);
    });

    it('draws and initializes resolver', () => {
      const draw = sinon.stub();

      const result = new Player({
        redraw: sinon.stub(),
        display: {
          draw,
        }}, 1, 5);

      expect(typeof result.resolver).to.equal('function');
      expect(draw).to.have.been.calledWithExactly(1, 5, '@', colors.YELLOW);
    });
  });

  describe('handleEvent', () => {
    let player;
    let map;
    let drawMock;

    beforeEach(() => {
      drawMock = sinon.stub();
      map = {};
      player = new Player({
        map,
        retrieveCache: sinon.stub(),
        redraw: sinon.stub(),
        display: {draw: drawMock},
      }, 2, 5);
      drawMock.resetHistory();
    });

    it('does nothing with invalid input', () => {
      const input = 23;

      player.handleEvent({keyCode: input});
    });

    it('allows moving if it will be on the map', () => {
      map['2,5'] = '.';
      map['3,5'] = '.';
      map['2,4'] = '.';
      const input = 38; // Up

      player.handleEvent({keyCode: input});

      expect(player.x).to.equal(2);
      expect(player.y).to.equal(4);
      expect(player.game.redraw).to.have.been.calledWithExactly(2, 5);
      expect(drawMock).to.have.been.calledWithExactly(2, 4, '@', colors.YELLOW);
    });

    it('disallows moving if it will be off the map', () => {
      map['2,5'] = '.';
      map['3,5'] = '.';
      map['2,4'] = '.';
      const input = 40; // Down

      player.handleEvent({keyCode: input});

      expect(player.x).to.equal(2);
      expect(player.y).to.equal(5);
      expect(drawMock).to.not.have.been.called;
    });
  });
});
