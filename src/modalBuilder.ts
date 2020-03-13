import Modal from './Modal';

export function buildInstructionsModal(display, callback) {
  const instructions = `
  Wander the depths of the dungeon collecting items and defeating foes to grant you experience until you find and are able to defeat the dark master of the pit...

  Movement: ▲ ▼ ◄ ► / WSAD / KJHL
  Inventory: I/G
  Help: M/Esc
  `;
  new Modal(display, callback, instructions, 40, 20, 5, null);
}
