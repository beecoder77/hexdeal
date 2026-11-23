// HEXDEAL — hand-in program (Node 22, standard library only).
//
// The game itself is the static site in game/ (index.html plus its ES modules
// and stylesheet; no build step, no network). This program copies game/ and
// screenshots/ from beside this file into the output directory and writes
// dossier.json there with buildDossier from the vendored make.fun library,
// byte for byte what the scorer rebuilds and compares.
//
// Run it the way the grader does, with MAKEFUN_OUTPUT_DIR standing in for
// /output outside the container:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(from: string, to: string): void {
  mkdirSync(to, { recursive: true });
  if (existsSync(from)) cpSync(from, to, { recursive: true });
}

copyTree(join(repoDir, 'game'), join(outputDir, 'game'));
copyTree(join(repoDir, 'screenshots'), join(outputDir, 'screenshots'));

// The dossier caps are the scorer's own (its gate refuses anything past
// them): the source text the judge reads is capped, screenshots are at most
// 4 files of 256 KiB, and game/ is at most 993 entries, 48 MiB in all, with
// no path over 1,000 bytes.
const DOSSIER_CAPS = {
  text_max_bytes: 163_840,
  screenshots: { max: 4, max_bytes: 262_144 },
  game_max_files: 993,
  game_max_bytes: 50_331_648,
  game_path_max_bytes: 1_000,
};

writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, DOSSIER_CAPS));
