// HEXDEAL — the table itself: boot, input and the clash beat.
//
// A duel runs in phases: title, play, over. In play, clicking one of your
// cards (or pressing its number key) clashes it against the rival's hidden
// pick; both cards land in the centre, the story line says what happened,
// and your hand refills. Enter (or a click on a title/end screen) starts
// the next duel. A ?shot=title|play|win|loss&seed=N address stages a fixed
// scene instead — that is how the screenshots are taken.

import { chooseRivalCard } from './ai.js';
import { newDuel, playRound, PHASE_OVER, PHASE_PLAY, PHASE_TITLE } from './engine.js';
import { renderGame } from './render.js';
import { stageShot } from './shots.js';

const root = document.getElementById('app');
const status = document.getElementById('status');
const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed') ?? '7') || 7;

let duel = params.has('shot') ? stageShot(params.get('shot'), seed) : newDuel(seed);
let clashTimer = 0;

function announce(text) {
  if (status) status.textContent = text;
}

function draw() {
  renderGame(root, duel, pickCard);
  if (duel.phase === PHASE_OVER) {
    announce(duel.winner === 'player' ? 'Victory.' : duel.winner === 'rival' ? 'Defeat.' : 'Stalemate.');
  }
}

function startDuel() {
  duel = newDuel((Math.random() * 1_000_000) | 0);
  duel.phase = PHASE_PLAY;
  draw();
  announce('A new duel begins. Pick a card.');
}

function pickCard(index) {
  if (duel.phase !== PHASE_PLAY) return;
  const card = duel.player.hand[index];
  if (!card) return;
  const report = playRound(duel, card, chooseRivalCard(duel));
  draw();
  announce(report.story);
  window.clearTimeout(clashTimer);
  clashTimer = window.setTimeout(() => {
    if (duel.phase === PHASE_PLAY) draw();
  }, 1200);
}

root.addEventListener('click', () => {
  if (duel.phase === PHASE_TITLE || duel.phase === PHASE_OVER) startDuel();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    if (duel.phase === PHASE_TITLE || duel.phase === PHASE_OVER) startDuel();
    return;
  }
  const index = Number(event.key) - 1;
  if (Number.isInteger(index) && index >= 0 && index < 5) pickCard(index);
});

draw();
