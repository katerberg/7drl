import {expect} from 'chai';
import * as sinon from 'sinon';
import Enemy from './Enemy';

describe('Enemy', () => {
  describe('calculateDamage', () => {

    function getEnemy(stats) {
      return new Enemy({redrawSpace: sinon.stub(), display: {draw: sinon.stub()}}, 2, 5, {type: '', stats: stats || {}}, '');
    }

    it('hands back str by default', () => {
      const enemy = getEnemy();

      const result = enemy.calculateDamage(4, {stats: {}});

      expect(result).to.equal(4);
    });
  });
});
