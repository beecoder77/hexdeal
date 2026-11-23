// HEXDEAL — the duel engine: state, clashes and the end of the game.
//
// Both duelists start at 20 HP and hold 5 cards from the shared 40-card
// deck. Each round both play one card face down, the cards flip, and the
// higher effective value wins the clash: the loser takes the difference as
// damage. A suit that beats the other adds +3. Specials bend the result
// (Shield blocks, Surge doubles, Leech steals). Playing Gloom costs 2 HP.
// The duel ends at 0 HP, or when deck and hands run out — then the higher
// HP wins.

import {
  GLOOM_COST, SPECIAL_LEECH, SPECIAL_SHIELD, SPECIAL_SURGE, SUIT_BONUS, buildDeck, suitBeats,
} from './cards.js';

export const START_HP = 20;
export const HAND_SIZE = 5;

export const PHASE_TITLE = 'title';
export const PHASE_PLAY = 'play';
export const PHASE_OVER = 'over';

/** A seeded shuffle (mulberry32) so a seed always deals the same duel. */
export function shuffledDeck(seed) {
  const deck = buildDeck();
  let state = seed >>> 0 || 1;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function newDuel(seed) {
  const deck = shuffledDeck(seed);
  const duel = {
    phase: PHASE_TITLE,
    deck,
    player: { hp: START_HP, hand: [], played: null },
    rival: { hp: START_HP, hand: [], played: null },
    round: 0,
    seenPlayerSuits: [],
    log: [],
    lastClash: null,
    winner: null,
  };
  drawUpTo(duel.player, duel);
  drawUpTo(duel.rival, duel);
  return duel;
}

function drawUpTo(side, duel) {
  while (side.hand.length < HAND_SIZE && duel.deck.length > 0) side.hand.push(duel.deck.pop());
}

/** A card's effective clash value: its face value plus the suit bonus where earned. */
export function effectiveValue(card, other) {
  let value = card.value;
  if (card.kind === 'suited' && other.kind === 'suited' && suitBeats(card.suit, other.suit)) {
    value += SUIT_BONUS;
  }
  return value;
}

function isSpecial(card, special) {
  return card.kind === 'special' && card.special === special;
}

/**
 * Resolve one clash. `mine` is the player's card, `theirs` the rival's.
 * Returns a report: both effective values, the damage each side takes, the
 * HP each side steals, and a one-line story for the table log.
 */
export function resolveClash(mine, theirs) {
  const myValue = effectiveValue(mine, theirs);
  const theirValue = effectiveValue(theirs, mine);
  const report = {
    mine, theirs, myValue, theirValue,
    damageToPlayer: 0, damageToRival: 0, stealByPlayer: 0, stealByRival: 0,
    gloomPaidByPlayer: isGloom(mine) ? GLOOM_COST : 0,
    gloomPaidByRival: isGloom(theirs) ? GLOOM_COST : 0,
    story: '',
  };
  if (myValue > theirValue) {
    let damage = myValue - theirValue;
    if (isSpecial(mine, SPECIAL_SURGE)) damage *= 2;
    if (isSpecial(theirs, SPECIAL_SHIELD)) damage = 0;
    report.damageToRival = damage;
    if (isSpecial(mine, SPECIAL_LEECH)) report.stealByPlayer = damage;
    report.story = damage > 0 ? `Your ${label(mine)} beats ${label(theirs)} — ${damage} damage.` : `Your ${label(mine)} beats ${label(theirs)}, but Shield blocks it.`;
  } else if (theirValue > myValue) {
    let damage = theirValue - myValue;
    if (isSpecial(theirs, SPECIAL_SURGE)) damage *= 2;
    if (isSpecial(mine, SPECIAL_SHIELD)) damage = 0;
    report.damageToPlayer = damage;
    if (isSpecial(theirs, SPECIAL_LEECH)) report.stealByRival = damage;
    report.story = damage > 0 ? `Their ${label(theirs)} beats ${label(mine)} — you take ${damage}.` : `Their ${label(theirs)} beats ${label(mine)}, but your Shield blocks it.`;
  } else {
    report.story = `${label(mine)} and ${label(theirs)} clash even — no damage.`;
  }
  return report;
}

function isGloom(card) {
  return card.kind === 'suited' && card.suit === 'gloom';
}

function label(card) {
  return card.kind === 'special' ? card.special : `${card.suit} ${card.value}`;
}

/** Play one full round: both cards leave their hands, the clash lands, hands refill. */
export function playRound(duel, playerCard, rivalCard) {
  duel.player.hand = duel.player.hand.filter((c) => c.id !== playerCard.id);
  duel.rival.hand = duel.rival.hand.filter((c) => c.id !== rivalCard.id);
  duel.player.played = playerCard;
  duel.rival.played = rivalCard;
  duel.round += 1;
  if (playerCard.kind === 'suited') duel.seenPlayerSuits.push(playerCard.suit);
  const report = resolveClash(playerCard, rivalCard);
  duel.player.hp -= report.damageToPlayer + report.gloomPaidByPlayer;
  duel.rival.hp -= report.damageToRival + report.gloomPaidByRival;
  duel.player.hp += report.stealByPlayer;
  duel.rival.hp += report.stealByRival;
  duel.lastClash = report;
  duel.log.unshift(report.story);
  if (duel.log.length > 4) duel.log.length = 4;
  drawUpTo(duel.player, duel);
  drawUpTo(duel.rival, duel);
  settleEnd(duel);
  return report;
}

function settleEnd(duel) {
  const p = duel.player.hp;
  const r = duel.rival.hp;
  const cardsGone = duel.deck.length === 0 && (duel.player.hand.length === 0 || duel.rival.hand.length === 0);
  if (p <= 0 || r <= 0 || cardsGone) {
    duel.phase = PHASE_OVER;
    duel.winner = p === r ? 'draw' : p > r ? 'player' : 'rival';
  }
}
