#!/usr/bin/env node
// test-trustdrift-voice-20261021.js — RED→GREEN proof for the trust-drift
// warning leg (sim-trustdrift-voice, backlogs #751 + #753).
//
// Scenario: a Haven-primary (lead) link, 35 days old (seasoned age met),
// trust forced across the trust-40 seasoned bar (hierarchy.js:_linkSeasoned:
// 30+ days AND trust 40+), then Game.hierarchyDaily().
//   RED  (pre-fix):  the crossing is silent — zero drift-warning beats.
//   GREEN (post-fix): exactly one "drifting" beat with honest person-noticing
//                    text; no repeat on subsequent days; re-arms only when
//                    trust climbs back >= 40.
// Also asserts the engine-visible tend refusal already voices (bare pantry)
// and prints a SHA-256 digest of the full say-log per scenario for the
// det-gate (paired same-seed pre/post digests must differ ONLY by the new
// beat lines; the no-crossing scenario must be byte-identical).
//
// Usage: node scripts/test-trustdrift-voice-20261021.js
// Exit 0 on GREEN, 1 on RED/failure. Prints transcript excerpts for the
// evidence file's sense-testing section.

const crypto = require('crypto');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = 64908; // DIAG seed (leadfeast-s64908)

function logText(Game) {
  return (Game.log || []).map((e) => {
    if (e && typeof e === 'object') return e.text || e.msg || e.message || '';
    return String(e == null ? '' : e);
  }).filter((t) => t);
}

function digest(lines) {
  return crypto.createHash('sha256').update(lines.join('\n'), 'utf8').digest('hex').slice(0, 16);
}

function makeLink(Game, day, trust) {
  const m = Game.mshipState();
  m.links = m.links || [];
  // silence linkTick's own weekly trust math for isolation — this scenario
  // is about the watch, not the tick
  const week = Game._week ? Game._week() : 0;
  m.lastLinkWeek = week;
  const link = {
    id: 'link_driftproof', primary: 'haven', subordinate: 'thornfield',
    trust: trust, tributeKcalPerWeek: 4000, tributePaidWeek: week, arrears: 0,
    obligations: ['tribute', 'aid'], history: [], status: 'active', day: day - 35,
    pendingDemand: null, theirSpeaker: { id: 'sp1', name: 'Mara' },
  };
  m.links.push(link);
  return link;
}

function setup(Game, day) {
  Game.state.scholar = Game.state.scholar || {};
  Game.state.scholar.day = day;
  Game.state.otherVillages = Game.state.otherVillages || [];
  if (!Game.state.otherVillages.find((v) => v.id === 'thornfield'))
    Game.state.otherVillages.push({ id: 'thornfield', name: 'Thornfield', alive: true });
}

function countDrift(Game) {
  return logText(Game).filter((t) => /drift/i.test(t)).length;
}
function driftLines(Game) {
  return logText(Game).filter((t) => /drift/i.test(t));
}

async function scenarioCross() {
  // trust 45 -> 39: crosses the trust-40 bar
  const { Game } = await loadGame({ seed: SEED, mode: 'drift-proof', narration: true });
  await setupGame(Game);
  const day = 100;
  setup(Game, day);
  const link = makeLink(Game, day, 45);
  // observe the above-bar state first (real erosion is gradual — the watch
  // sees the link above the bar on earlier days)
  Game.hierarchyDaily();
  link.trust = 39;
  Game.hierarchyDaily();
  const c1 = countDrift(Game);
  const lines1 = driftLines(Game);
  // next day, still below — must NOT repeat
  Game.state.scholar.day = day + 1;
  Game.hierarchyDaily();
  const c2 = countDrift(Game);
  // re-arm: climb back above, then cross again
  link.trust = 45;
  Game.state.scholar.day = day + 2;
  Game.hierarchyDaily();
  const c3 = countDrift(Game);
  link.trust = 38;
  Game.state.scholar.day = day + 3;
  Game.hierarchyDaily();
  const c4 = countDrift(Game);
  const lines = logText(Game);
  if (process.env.DUMP) { console.log('--- full say-log CROSS ---'); lines.forEach((l) => console.log('  ' + l)); }
  return { c1, c2, c3, c4, beatLines: lines1, digest: digest(lines) };
}

async function scenarioNoCross() {
  // trust 50 -> 41: erodes but never crosses the bar — must stay silent
  const { Game } = await loadGame({ seed: SEED, mode: 'drift-proof', narration: true });
  await setupGame(Game);
  const day = 100;
  setup(Game, day);
  const link = makeLink(Game, day, 50);
  link.trust = 41;
  Game.hierarchyDaily();
  const c1 = countDrift(Game);
  const lines = logText(Game);
  if (process.env.DUMP) { console.log('--- full say-log NOCROSS ---'); lines.forEach((l) => console.log('  ' + l)); }
  return { c1, digest: digest(lines) };
}

async function tendRefusal() {
  // engine-visible tend skip: tendLink called with a bare pantry must voice
  const { Game } = await loadGame({ seed: SEED, mode: 'drift-proof', narration: true });
  await setupGame(Game);
  const day = 100;
  setup(Game, day);
  const link = makeLink(Game, day, 60);
  Game.state.village = Game.state.village || {};
  Game.state.village.pantry = []; // bare
  const before = logText(Game).length;
  let ret = null;
  try { ret = Game.tendLink(link.id); } catch (e) { return { error: String(e) }; }
  const after = logText(Game).slice(before);
  return { ret, lines: after };
}

async function main() {
  const fails = [];
  console.log('=== scenario CROSS (45 -> 39, across the trust-40 bar) ===');
  const x = await scenarioCross();
  console.log('drift beats after crossing:', x.c1);
  console.log('drift beats next day (must stay 1):', x.c2);
  console.log('drift beats after re-arm climb (must stay 1):', x.c3);
  console.log('drift beats after re-cross (must be 2):', x.c4);
  console.log('digest:', x.digest);
  if (x.c1 !== 1) fails.push(`RED: crossing emitted ${x.c1} drift beats (expected exactly 1)`);
  if (x.c2 !== 1) fails.push(`SPAM: next-day count ${x.c2} (expected still 1)`);
  if (x.c3 !== 1) fails.push(`REARM-NOISE: re-arm climb produced a beat (count ${x.c3}, expected 1)`);
  if (x.c4 !== 2) fails.push(`REARM: re-cross count ${x.c4} (expected 2)`);
  const beat = x.beatLines[0] || '';
  if (beat && /\btrust\s*(40|\+|-|\d)/i.test(beat)) fails.push('METER: beat reads like a meter readout: ' + beat);
  console.log('--- beat transcript ---');
  x.beatLines.forEach((l) => console.log('  ' + l));

  console.log('=== scenario NOCROSS (50 -> 41, bar never crossed) ===');
  const n = await scenarioNoCross();
  console.log('drift beats:', n.c1, 'digest:', n.digest);
  if (n.c1 !== 0) fails.push(`NOISE: no-crossing scenario emitted ${n.c1} drift beats`);

  console.log('=== engine-visible tend refusal (bare pantry) ===');
  const t = await tendRefusal();
  if (t.error) { fails.push('TEND-ERROR: ' + t.error); }
  else {
    const voiced = t.lines.some((l) => /bare/i.test(l) && /pantry/i.test(l));
    console.log('tendLink returned:', t.ret);
    t.lines.forEach((l) => console.log('  ' + l));
    if (!voiced) fails.push('TEND-SILENT: bare-pantry refusal not voiced');
  }

  console.log(fails.length ? 'RESULT: RED/FAIL' : 'RESULT: GREEN');
  fails.forEach((f) => console.log('  FAIL: ' + f));
  process.exit(fails.length ? 1 : 0);
}

main().catch((e) => { console.error('HARNESS-ERROR: ' + (e && e.stack || e)); process.exit(2); });
