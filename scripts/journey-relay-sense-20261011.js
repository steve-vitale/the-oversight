#!/usr/bin/env node
// journey-relay-sense-20261011.js — SENSE harness for the relay dialogue rework
// (Steve 2026-10-11 SENSE-TESTING LAW): plays ALL 18 relay scenes through the
// REAL commune path (relayCommuneScene -> pending -> relayAnswer) on two
// bearer profiles and dumps FULL transcripts for sense-reading.
//
//   PROFILE=bare    fresh relay claim: no locket, no sanctuary, no rewrite uses
//   PROFILE=kitted  locket in inventory, sanctuary learned+used, rewrite used x2
//   PROFILE=both    (default) runs both, transcripts to stdout (markdown)
//
// The sense questions: does every scene's premise hold against the actual
// world state (real villages? real items? real abilities used?), or does it
// fabricate history/nouns? Do choices engage/deflect with real consequences?
// Usage: [SEED=424242] [COMMUNES=24] node scripts/journey-relay-sense-20261011.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '424242', 10);
const COMMUNES = parseInt(process.env.COMMUNES || '24', 10);
const PROFILE = process.env.PROFILE || 'both';

function setupRelay(Game) {
  Game.state.switchboard = {
    holderId: Game.villagerId, bearerHeld: true, stage: 'village relay',
    routed: 0, delayed: 0, edited: 0, skimmed: 0, log: [],
  };
  Game.state.scholar.relay = {
    lean: 0, communes: 0, checkins: 0, sceneIdx: 0, lightIdx: 0, darkIdx: 0,
    probes: 0, reroutes: 0, deepens: 0, holderDays: 0, backfires: 0,
    translated: [], systemWantsTalk: false,
  };
}

async function walk(profile) {
  const { Game } = await loadGame({ seed: SEED, mode: 'relay-sense-' + profile });
  await setupGame(Game);
  setupRelay(Game);
  if (profile === 'kitted') {
    Game.state.scholar.inventory = Game.state.scholar.inventory || [];
    Game.state.scholar.inventory.push({ itemId: 'locket', units: 1 });
    Game.state.scholar.relayAbils = {
      sanctuary: { unlocked: true, uses: 1 },
      rewrite: { unlocked: true, uses: 2 },
    };
  }
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  const out = [];
  const fired = [];
  out.push(`# Relay dialogue sense walk — profile: ${profile} (seed ${SEED})`);
  out.push('');
  out.push(`Bearer <redacted>: ${profile === 'kitted' ? 'locket in pack, sanctuary learned+used, rewrite used x2' : 'no locket, no sanctuary, no rewrite uses'}`);
  out.push(`Villages in world: ${(Game.state.otherVillages || []).map(v => v.name + ' (pantry ' + v.pantryKcal + ')').join(', ')}`);
  out.push('');
  for (let i = 1; i <= COMMUNES; i++) {
    const before = said.length;
    const id = Game.relayCommuneScene();
    const sysLines = said.slice(before);
    const pend = Game.pendingRelayScene();
    const answerId = (i % 2 === 1) ? 'engage' : 'deflect'; // alternate for coverage
    const leanBefore = Game.relayLean();
    const ansBefore = said.length;
    const res = pend ? Game.relayAnswer(answerId) : '(no pending scene)';
    const ansLines = said.slice(ansBefore);
    const leanAfter = Game.relayLean();
    fired.push(id);
    out.push(`## Commune ${i} — scene \`${id}\` (answered: ${answerId}, result: ${res})`);
    out.push(`lean ${leanBefore} -> ${leanAfter} (${Game.relayLeanLabel()}), band ${Game.relayBand()}`);
    out.push('');
    sysLines.forEach(l => out.push('> ' + l));
    out.push('');
    out.push(`**You choose:** ${answerId}`);
    out.push('');
    ansLines.forEach(l => out.push('> ' + l));
    out.push('');
  }
  out.push(`Fired scenes (${fired.length}): ${fired.join(', ')}`);
  // world-honesty scan
  const all = said.join('\n');
  const flags = [];
  if (/river crossing/i.test(all)) flags.push('FABRICATED-NOUN: "River Crossing" (no such village in state.otherVillages)');
  if (/my sister's/i.test(all)) flags.push('FABRICATED-HISTORY: "my sister\'s" (bearer kinship asserted, never checked)');
  if (/\{vname|\{keepsake|\{vnames/.test(all)) flags.push('UNSUBSTITUTED template token left in transcript');
  if (/seven villages/i.test(all)) flags.push('FABRICATED-NUMBER: "seven villages"');
  if (/regional moot/i.test(all)) flags.push('FABRICATED-EVENT: "regional moot" (no such mechanic)');
  out.push('');
  out.push(`World-honesty flags: ${flags.length ? '' : '(none)'}`);
  flags.forEach(f => out.push(`- ${f}`));
  return { text: out.join('\n'), fired, flags };
}

(async () => {
  const profiles = PROFILE === 'both' ? ['bare', 'kitted'] : [PROFILE];
  for (const p of profiles) {
    const r = await walk(p);
    console.log(r.text);
    console.log('');
  }
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
