export const colors = {
  YELLOW: '#ff0',
  GREEN: '#0f0',
  RED: '#f00',
};

export const movementKeymap = {
  38: 0, // Up
  75: 0, // Up
  39: 1, // Right
  76: 1, // Right
  40: 2, // Down
  74: 2, // Down
  37: 3, // Left
  72: 3, // Left
};

export const validKeymap = {
  ...movementKeymap,
  71: 'Gear', // G
  73: 'Gear', // I
};

export const dimensions = {
  HEIGHT: 25,
  WIDTH: 80,
};

export const symbols = {
  WALL: '█',
  CACHE: '$',
  OPEN: ' ',
  PLAYER: '@',
  MODAL_CORNER_TOP_LEFT: '◸',
  MODAL_CORNER_TOP_RIGHT: '◹',
  MODAL_CORNER_BOTTOM_LEFT: '◺',
  MODAL_CORNER_BOTTOM_RIGHT: '◿',
  MODAL_Y: '|',
  MODAL_X: '-',
  LADDER: '▤',
};

export const modalChoices = {
  yn: {
    89: true, // Y
    78: false, // N
  },
};
