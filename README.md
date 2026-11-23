# hexdeal

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/beecoder77/hexdeal/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/beecoder77/hexdeal/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

**HEXDEAL** is an original 1v1 card duel for the desktop browser. You and a rival duelist start at 20 HP each, hold five cards, and clash one card a round: the higher effective value wins and the difference lands as damage. First to 0 HP falls; if the deck runs dry, the higher HP wins.

## The deck — 40 cards

- **4 suits**, told apart by colour and shape: Ember ▲ (orange), Tide ◆ (blue), Thorn ✦ (green), Gloom ☾ (violet).
- **37 suited cards**: Ember, Tide and Thorn run 1–10; the rare Gloom suit runs 1–7.
- **3 special cards**, one of each: **Shield** (value 3 — blocks all clash damage you would take), **Surge** (value 5 — win the clash and the damage is doubled), **Leech** (value 4 — win the clash and steal the damage as HP).

## The rules

- **Suit cycle**: Ember burns Thorn, Thorn pricks Tide, Tide douses Ember — a card whose suit beats the other earns **+3**.
- **Gloom beats every suit**, but playing a Gloom card costs its own player **2 HP**.
- Both cards in a clash are spent; hands refill to five while the deck lasts.
- The rival reads your habits: it answers your favourite suit, holds Gloom for a finish, and reaches for Leech when hurt — so vary your suits and bait its specials out early.
- Play with the mouse (click a card) or the keyboard (1–5 to clash, Enter to start or duel again).

## Screens

Title screen, the table mid-duel (both hands, HP bars, the clash and its story), a victory screen and a defeat screen — see `screenshots/`, all real renders of the game itself.

## Source layout

- `game/src/cards.js` — the deck: suits, the advantage cycle, the three specials, the 40-card build.
- `game/src/engine.js` — the duel state, clash resolution and the end-of-game rules.
- `game/src/ai.js` — the rival's readable policy.
- `game/src/render.js` — the title, table and end screens as DOM.
- `game/src/shots.js` — the staged scenes behind the screenshots.
- `game/src/main.js` — boot and input (mouse and keyboard).

## Run it

```sh
node serve.ts            # serves game/ at http://localhost:8080
node main.ts             # hands the game in: copies game/ + screenshots/ to /output and writes dossier.json
```

The game is plain static files under `game/` — no build step, no network requests. `main.ts` (Node 22, standard library only) is the hand-in program; `vendor/makefun-game.ts` is make.fun's dossier library, vendored unchanged.

---

<sub>Entered on [make.fun](https://make.fun/?ref=ws337zp2&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
