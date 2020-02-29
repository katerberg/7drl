import {expect} from 'chai';
import sinon from 'sinon';
import Player from './Player';
import {colors} from './constants';

describe('Player', () => {
  describe('constuctor', () => {
    it('populates coordinates', () => {

      const result = new Player({display: {draw: sinon.stub()}}, 1, 5);

      expect(result.x).to.equal(1);
      expect(result.y).to.equal(5);
    });

    it('draws and initializes resolver', () => {
      const draw = sinon.stub();

      const result = new Player({display: {draw}}, 1, 5);

      expect(typeof result.resolver).to.equal('function');
      expect(draw).to.have.been.calledWithExactly(1, 5, '@', colors.YELLOW);
    });
  });

  describe('handleEvent', () => {
    let player;

    beforeEach(() => {
      player = new Player({display: {draw: sinon.stub()}}, 5, 5);
    });

    it('does nothing with invalid input', () => {
      const input = 23;

      player.handleEvent({keyCode: input});
    });

    it('calls resolver', () => {
      const input = 40;
      player.resolver = sinon.stub();

      player.handleEvent({keyCode: input});

      expect(player.resolver).to.have.been.calledWithExactly();
    });
  });
});


