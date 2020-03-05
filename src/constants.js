export const colors = {
  YELLOW: '#ff0',
  GREEN: '#0f0',
  RED: '#f00',
  WHITE: '#fefefe',
  ORANGE: '#FF7034',
  FADED_WHITE: '#444',
};

export const movementKeymap = {
  38: 0, // Up
  75: 0, // Up (vim)
  87: 0, // Up (wsad)
  39: 1, // Right
  76: 1, // Right (vim)
  68: 1, // Right (wsad)
  40: 2, // Down
  74: 2, // Down (vim)
  83: 2, // Down (wsad)
  37: 3, // Left
  72: 3, // Left (vim)
  65: 3, // Left (wsad)
};

export const validKeymap = {
  ...movementKeymap,
  71: 'Gear', // G
  73: 'Gear', // I
  27: 'Menu', // Esc
  77: 'Menu', // M
};

export const validMenuKeymap = {
  ...movementKeymap,
  27: 'Cancel', // Esc
  77: 'Cancel', // M
  13: 'Select', // Enter
  32: 'Select', // Space
};

export const dimensions = {
  HEIGHT: 25,
  WIDTH: 80,
};

export const symbols = {
  WALL: '█',
  CACHE: '$',
  OPEN: '.',
  PLAYER: '@',
  ENEMY: 'D',
  MODAL_CORNER_TOP_LEFT: '◸',
  MODAL_CORNER_TOP_RIGHT: '◹',
  MODAL_CORNER_BOTTOM_LEFT: '◺',
  MODAL_CORNER_BOTTOM_RIGHT: '◿',
  MODAL_Y: '|',
  MODAL_X: '-',
  LADDER: '▤',
  BULLET: '▶',
};

export const modalChoices = {
  yn: {
    89: true, // Y
    78: false, // N
  },
};

export const gearTypes = {
  Armor: 5,
  Weapon: 5,
  Amulet: 1,
};

export const enemies = {
  GOBLIN: {
    type: 'Goblin',
    stats: {
      strength: 1,
      dexterity: 0,
      maxHp: 3,
    },
    color: colors.RED,
  },
  TROLL: {
    type: 'Troll',
    stats: {
      strength: 5,
      dexterity: 0,
      maxHp: 25,
    },
    color: colors.RED,
  },
  DRAGON: {
    type: 'Dragon',
    stats: {
      strength: 20,
      dexterity: 10,
      maxHp: 200,
    },
    color: colors.RED,
  },
  BALROG: {
    type: 'Balrog',
    stats: {
      strength: 40,
      dexterity: 40,
      maxHp: 500,
    },
    color: colors.ORANGE,
  },
};
