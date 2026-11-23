// HEXDEAL — the screenshot scenes behind ?shot=title|play|win|loss.
//
// Each scene deals a real duel from its seed and plays the real rules
// forward with an autopilot, so the frame is what a short game truly looks
// like and the same seed always gives the same frame. The win scene's pilot
// plays its best card every round; the loss scene's pilot throws its worst
// card away each round and is duly punished by the rival.

import { chooseRivalCard } from './ai.js';
import { effectiveValue, newDuel, playRound, PHASE_OVER, PHASE_PLAY } from './engine.js';

/** The player's strongest card against a typical opposing card. */
function bestCard(duel) {
  let best = duel.player.hand[0];
  let bestScore = -Infinity;
  for (const card of duel.player.hand) {
    let score = effectiveValue(card, { kind: 'suited', suit: 'thorn', value: 5 });
    if (card.kind === 'suited' && card.suit === 'gloom') score += duel.rival.hp <= card.value + 3 ? 6 : -1;
    if (card.kind === 'special') score += 1.5;
    if (score > bestScore) {
      bestScore = score;
      best = card;
    }
  }
  return best;
}

/** The player's weakest card — the one a careless duelist throws away. */
function worstCard(duel) {
  let worst = duel.player.hand[0];
  let worstScore = Infinity;
  for (const card of duel.player.hand) {
    const score = effectiveValue(card, { kind: 'suited', suit: 'ember', value: 5 });
    if (score < worstScore) {
      worstScore = score;
      worst = card;
    }
  }
  return worst;
}

function playOut(duel, pick, maxRounds) {
  duel.phase = PHASE_PLAY;
  for (let round = 0; round < maxRounds && duel.phase !== PHASE_OVER; round += 1) {
    playRound(duel, pick(duel), chooseRivalCard(duel));
  }
  return duel;
}

/**
 * Build the duel a screenshot name asks for:
 *   title — a fresh duel on its title screen;
 *   play  — six rounds in, mid-table, both hands full;
 *   win   — a duel the best-card pilot has won;
 *   loss  — a duel the worst-card pilot has lost.
 */
export function stageShot(name, seed) {
  if (name === 'play') return playOut(newDuel(seed), bestCard, 6);
  if (name === 'win') return playOut(newDuel(seed), bestCard, 40);
  if (name === 'loss') return playOut(newDuel(seed), worstCard, 40);
  return newDuel(seed);
}
