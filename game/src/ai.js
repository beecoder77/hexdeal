// HEXDEAL — the rival: a duelist whose choices can be read and countered.
//
// The rival watches what the player has already thrown (the discard story
// in the log of played suits) and answers it: it favours the suit that
// beats the player's favourite suit, holds Gloom back until it is behind
// or can finish, reaches for Leech when it is hurt and for Shield when the
// player has been winning big. It never sees the player's hand.

import { SPECIAL_LEECH, SPECIAL_SHIELD, suitBeats } from './cards.js';
import { effectiveValue } from './engine.js';

/** Score every card in the rival's hand against the player's habits; play the best. */
export function chooseRivalCard(duel) {
  const hand = duel.rival.hand;
  const favourite = playersFavouriteSuit(duel);
  let best = hand[0];
  let bestScore = -Infinity;
  for (const card of hand) {
    const score = scoreCard(card, duel, favourite);
    if (score > bestScore) {
      bestScore = score;
      best = card;
    }
  }
  return best;
}

function scoreCard(card, duel, favourite) {
  let score = card.value;
  // Answer the player's favourite suit with the suit that beats it.
  if (card.kind === 'suited' && favourite && suitBeats(card.suit, favourite)) score += 3.5;
  // A special is worth more than its face when its moment has come.
  if (card.kind === 'special' && card.special === SPECIAL_LEECH && duel.rival.hp <= 10) score += 4;
  if (card.kind === 'special' && card.special === SPECIAL_SHIELD && duel.player.hp > duel.rival.hp) score += 2;
  if (card.kind === 'special') score += 1;
  // Gloom is a finisher, not an opener: hold it while ahead, spend it when behind.
  if (card.kind === 'suited' && card.suit === 'gloom') {
    score += duel.rival.hp < duel.player.hp ? 2.5 : -2;
    if (duel.player.hp <= card.value + 3) score += 5;
  }
  // Break exact ties by effective value against a middling opposing card.
  score += effectiveValue(card, { kind: 'suited', suit: 'tide', value: 5 }) / 100;
  return score;
}

/** The suit the player has played most so far this duel, or null before any clash. */
function playersFavouriteSuit(duel) {
  const counts = new Map();
  for (const story of duel.seenPlayerSuits ?? []) counts.set(story, (counts.get(story) ?? 0) + 1);
  let favourite = null;
  let most = 0;
  for (const [suit, count] of counts) {
    if (count > most) {
      most = count;
      favourite = suit;
    }
  }
  return favourite;
}
