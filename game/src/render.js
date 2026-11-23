// HEXDEAL — rendering: the title, the table and the end screens, as DOM.
//
// Cards are real elements (not canvas) so their values stay crisp at any
// size: a big suit glyph in the middle, the value in two corners, the suit
// name along the bottom. Suits read by colour AND shape — ember orange
// triangles, tide blue diamonds, thorn green stars, gloom violet moons —
// and the specials are gold. The rival's hand is a row of card backs.

import { SPECIALS, SUITS, cardColour, cardGlyph, cardTitle } from './cards.js';
import { PHASE_OVER, PHASE_PLAY, PHASE_TITLE } from './engine.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_TABLE = 'table';
export const SCREEN_OVER = 'over';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** One card face (or back) as an element. `onPick` makes the player's cards clickable. */
export function cardElement(card, options = {}) {
  const node = el('div', 'card');
  if (options.back) {
    node.classList.add('card-back');
    node.append(el('span', 'back-glyph', '✦'));
    return node;
  }
  const colour = cardColour(card);
  node.style.setProperty('--card-colour', colour);
  node.classList.add(card.kind === 'special' ? 'card-special' : `card-${card.suit}`);
  const cornerText = card.kind === 'special' ? String(card.value) : cardTitle(card);
  const cornerTop = el('span', 'corner corner-top', cornerText);
  const glyph = el('span', 'glyph', cardGlyph(card));
  const name = el('span', 'card-name', card.kind === 'special' ? SPECIALS[card.special].name : SUITS[card.suit].name);
  const cornerBottom = el('span', 'corner corner-bottom', cornerText);
  node.append(cornerTop, glyph, name, cornerBottom);
  if (options.hotkey) node.append(el('span', 'hotkey', options.hotkey));
  if (options.onPick) {
    node.classList.add('pickable');
    node.addEventListener('click', options.onPick);
  }
  if (options.dealt) node.classList.add('dealt');
  return node;
}

function hpBar(label, hp, max) {
  const wrap = el('div', 'hp');
  const text = el('span', 'hp-text', `${label} · ${Math.max(hp, 0)} HP`);
  const track = el('div', 'hp-track');
  const fill = el('div', 'hp-fill');
  fill.style.width = `${Math.max(0, Math.min(100, (hp / max) * 100))}%`;
  if (hp <= 6) fill.classList.add('hp-low');
  track.append(fill);
  wrap.append(text, track);
  return wrap;
}

function renderTitle(root) {
  const screen = el('section', 'screen screen-title');
  screen.append(el('p', 'kicker', 'A CARD DUEL IN FOUR SUITS'));
  screen.append(el('h1', 'game-title', 'HEXDEAL'));
  const suits = el('div', 'title-suits');
  for (const key of Object.keys(SUITS)) {
    const chip = el('span', 'suit-chip', `${SUITS[key].glyph} ${SUITS[key].name}`);
    chip.style.setProperty('--card-colour', SUITS[key].colour);
    suits.append(chip);
  }
  screen.append(suits);
  screen.append(el('p', 'title-rules',
    'Clash one card a round against the rival. Higher value wins, the difference is damage. '
    + 'Ember burns Thorn, Thorn pricks Tide, Tide douses Ember — a winning suit adds +3. '
    + 'Gloom beats everything but costs you 2 HP. Shield blocks, Surge doubles, Leech steals. '
    + 'First to 0 HP falls.'));
  screen.append(el('p', 'press-start', 'Click or press Enter to duel'));
  root.append(screen);
}

function renderTable(root, duel, onPick) {
  const screen = el('section', 'screen screen-table');
  const rivalZone = el('div', 'zone zone-rival');
  rivalZone.append(hpBar('RIVAL', duel.rival.hp, 20));
  const rivalHand = el('div', 'hand hand-rival');
  for (let i = 0; i < duel.rival.hand.length; i += 1) rivalHand.append(cardElement(null, { back: true }));
  rivalZone.append(rivalHand);
  screen.append(rivalZone);

  const centre = el('div', 'centre');
  const clash = el('div', 'clash');
  if (duel.rival.played) clash.append(cardElement(duel.rival.played, { dealt: true }));
  else clash.append(el('div', 'card card-empty', ''));
  clash.append(el('span', 'versus', duel.lastClash ? `${duel.lastClash.theirValue} ⚔ ${duel.lastClash.myValue}` : '⚔'));
  if (duel.player.played) clash.append(cardElement(duel.player.played, { dealt: true }));
  else clash.append(el('div', 'card card-empty', ''));
  centre.append(clash);
  centre.append(el('p', 'deck-line', `Round ${duel.round + 1} · ${duel.deck.length} cards left in the deck`));
  const log = el('div', 'log');
  for (const line of duel.log) log.append(el('p', 'log-line', line));
  centre.append(log);
  screen.append(centre);

  const playerZone = el('div', 'zone zone-player');
  playerZone.append(hpBar('YOU', duel.player.hp, 20));
  const hand = el('div', 'hand hand-player');
  duel.player.hand.forEach((card, index) => {
    hand.append(cardElement(card, { hotkey: String(index + 1), onPick: () => onPick(index) }));
  });
  playerZone.append(hand);
  playerZone.append(el('p', 'hint', 'Click a card — or press 1–5 — to clash it against the rival.'));
  screen.append(playerZone);
  root.append(screen);
}

function renderOver(root, duel) {
  const screen = el('section', 'screen screen-over');
  const won = duel.winner === 'player';
  const drew = duel.winner === 'draw';
  screen.append(el('p', 'kicker', drew ? 'THE DECK RUNS DRY' : won ? 'THE RIVAL FALLS' : 'YOU FALL'));
  screen.append(el('h1', 'game-title', drew ? 'STALEMATE' : won ? 'VICTORY' : 'DEFEAT'));
  screen.append(el('p', 'final-line',
    `Final score — You ${Math.max(duel.player.hp, 0)} HP · Rival ${Math.max(duel.rival.hp, 0)} HP · ${duel.round} rounds`));
  screen.append(el('p', 'press-start', 'Click or press Enter to duel again'));
  root.append(screen);
}

/** Draw the whole game into `root` for the duel's current phase. */
export function renderGame(root, duel, onPick) {
  root.replaceChildren();
  if (duel.phase === PHASE_TITLE) renderTitle(root);
  else if (duel.phase === PHASE_OVER) renderOver(root, duel);
  else renderTable(root, duel, onPick);
}

export function screenOf(duel) {
  if (duel.phase === PHASE_TITLE) return SCREEN_TITLE;
  if (duel.phase === PHASE_OVER) return SCREEN_OVER;
  return SCREEN_TABLE;
}
