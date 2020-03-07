export const colors = {
  BLACK: '#000',
  YELLOW: '#ff0',
  GREEN: '#0f0',
  RED: '#f00',
  WHITE: '#fefefe',
  ORANGE: '#FF7034',
  FADED_WHITE: '#777',
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
  POTION: 'ɋ',
  WEAPON: 'Ψ',
  ARMOR: 'Θ',
  AMULET: 'ϙ',
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
      dexterity: 1,
      maxHp: 3,
    },
    xp: 1,
    dropPercentage: 10,
    color: colors.RED,
  },
  SKELETON: {
    type: 'Skeleton',
    stats: {
      strength: 2,
      dexterity: 5,
      maxHp: 4,
    },
    xp: 3,
    dropPercentage: 5,
    color: colors.RED,
  },
  TROLL: {
    type: 'Troll',
    stats: {
      strength: 5,
      dexterity: 0,
      maxHp: 25,
    },
    xp: 10,
    dropPercentage: 30,
    color: colors.RED,
  },
  DRAGON: {
    type: 'Dragon',
    stats: {
      strength: 17,
      dexterity: 10,
      maxHp: 40,
    },
    xp: 30,
    dropPercentage: 80,
    color: colors.RED,
  },
  BALROG: {
    type: 'Balrog',
    stats: {
      strength: 25,
      dexterity: 40,
      maxHp: 80,
    },
    xp: 0,
    dropPercentage: 0,
    color: colors.ORANGE,
  },
};

export const xpLevels = {
  1: 2,
  2: 6,
  3: 15,
  4: 45,
  5: 70,
  6: 100,
  7: 155,
  8: 200,
  9: 283,
  10: 334,
  11: 444,
  12: 576,
  13: 733,
  14: 915,
  15: 1125,
  16: 1366,
  17: 4913,
  18: 5832,
  19: 6859,
};
