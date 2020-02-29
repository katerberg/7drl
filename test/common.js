import { JSDOM } from 'jsdom';
const chai = require('chai');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>');

global.window = dom.window;

