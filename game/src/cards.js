// HEXDEAL — the deck: four suits, forty cards, three kinds of special.
//
// Ember, Tide and Thorn are the common suits and run 1 to 10. Gloom is the
// rare suit: it runs only 1 to 7, beats every other suit in a clash, and
// costs its own player 2 HP the moment it is played. On top of the 37 suited
// cards sit three one-of-a-kind specials — Shield, Surge and Leech — for a
// deck of exactly 40.

export const SUIT_EMBER = 'ember';
export const SUIT_TIDE = 'tide';
export const SUIT_THORN = 'thorn';
export const SUIT_GLOOM = 'gloom';

export const SUITS = {
  ember: { name: 'Ember', glyph: '▲', colour: '#ff7a3c' },
  tide: { name: 'Tide', glyph: '◆', colour: '#3ec6ff' },
  thorn: { name: 'Thorn', glyph: '✦', colour: '#7be495' },
  gloom: { name: 'Gloom', glyph: '☾', colour: '#c99aff' },
};

/** The advantage cycle: Ember burns Thorn, Thorn pricks Tide, Tide douses Ember. */
const BEATS = { ember: 'thorn', thorn: 'tide', tide: 'ember' };

/** Clash bonus a card earns when its suit beats the other card's suit. */
export const SUIT_BONUS = 3;
/** HP the player of a Gloom card pays for its power. */
export const GLOOM_COST = 2;

export const SPECIAL_SHIELD = 'shield';
export const SPECIAL_SURGE = 'surge';
export const SPECIAL_LEECH = 'leech';

export const SPECIALS = {
  shield: { name: 'Shield', glyph: '⛨', value: 3, blurb: 'Blocks all clash damage you would take.' },
  surge: { name: 'Surge', glyph: '⚡', value: 5, blurb: 'Win the clash and the damage is doubled.' },
  leech: { name: 'Leech', glyph: '♥', value: 4, blurb: 'Win the clash and steal the damage as HP.' },
};

let nextCardId = 1;

function suitedCard(suit, value) {
  return { id: nextCardId++, kind: 'suited', suit, value };
}

function specialCard(special) {
  return { id: nextCardId++, kind: 'special', special, value: SPECIALS[special].value };
}

/** A fresh, ordered 40-card deck: 10 Ember, 10 Tide, 10 Thorn, 7 Gloom, 3 specials. */
export function buildDeck() {
  nextCardId = 1;
  const deck = [];
  for (const suit of [SUIT_EMBER, SUIT_TIDE, SUIT_THORN]) {
    for (let value = 1; value <= 10; value += 1) deck.push(suitedCard(suit, value));
  }
  for (let value = 1; value <= 7; value += 1) deck.push(suitedCard(SUIT_GLOOM, value));
  deck.push(specialCard(SPECIAL_SHIELD), specialCard(SPECIAL_SURGE), specialCard(SPECIAL_LEECH));
  return deck;
}

/** True when suit `a` beats suit `b` in a clash (Gloom beats all but itself). */
export function suitBeats(a, b) {
  if (a === b) return false;
  if (a === SUIT_GLOOM) return true;
  if (b === SUIT_GLOOM) return false;
  return BEATS[a] === b;
}

/** The short label printed on a card's face: "8" for suited, the name for specials. */
export function cardTitle(card) {
  return card.kind === 'special' ? SPECIALS[card.special].name : String(card.value);
}

/** The suit or special glyph printed large on a card's face. */
export function cardGlyph(card) {
  return card.kind === 'special' ? SPECIALS[card.special].glyph : SUITS[card.suit].glyph;
}

/** The colour a card is drawn in. */
export function cardColour(card) {
  return card.kind === 'special' ? '#ffd76a' : SUITS[card.suit].colour;
}
