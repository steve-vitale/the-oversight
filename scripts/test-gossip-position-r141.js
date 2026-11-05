#!/usr/bin/env node
// test-gossip-position-r141.js — proof for the haven-news relay
// (journey-social r141; sim-gossipcensus-a DIAG-GO fix).
//
// The census proved the haven-gossip burst reaches a stranded scholar at
// the background rate (2/25 stranded sleep windows = 8.0%) and reads
// wrong: "Back at the haven the argument starts: ... weigh in if you
// want" addressed to someone asleep miles from the haven. The fix gates
// the naming beat's DELIVERY on position: while the scholar is away from
// Haven the lines queue in state.pendingHavenNews and flush at the fire
// on the next night spent at Haven. Mechanics (kick / proposals /
// majority / knowers / tale log) run identically either way.
//
// Checks (all on the shared harness, emit captured):
//   1. STRANDED kick: scholar away -> monsterNewsCheck kicks the debate
//      (namingKicked) but emits 0 word lines; seedMonsterNames seeds
//      proposals but emits 0 debate lines.
//   2. STRANDED settle: majority -> villageName set but 0 settle lines;
//      the word/debate/settle lines sit held in order.
//   3. RETURN: back on the haven tile -> returnToVillage delivers ALL
//      THREE lines verbatim under the catch-up framing line; the queue
//      drains.
//   ROUTING NOTE (sim-awaynaming-cap-a 2026-11-05): burst/settle lines
//   (word/debate/settle) now route through the uncapped awayNaming
//   gate (sayNamingNews / returnToVillage delivery), NOT the relay's
//   pendingHavenNews queue — the relay's stale-opening filter (flush
//   delivers only the settle) does not apply to them. The relay keeps
//   the tale and witness kinds (checks 5–6). Checks 1–3 below assert
//   the awayNaming routing; check 4 asserts in-haven lines still say
//   immediately with both queues empty.
//   4. CONTROL: scholar at Haven -> word/debate said immediately, queue
//      stays empty.
//   5. WITNESS: endDay loop with the scholar away -> the witness branch
//      fires (knowers grows / debate kicks) but 0 witness lines and 0
//      word lines reach the captured stream.
//   6. TALE: queueKillerTale + killerTaleBeat with the scholar away -> 0
//      tale prose lines AND e.reported true (mechanics ran); after
//      return + flush, the tale prose is delivered.
// Usage: node scripts/test-gossip-position-r141.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let checks = 0, fails = 0;
function check(name, cond, detail) {
  checks++;
  if (cond) console.log('ok   ' + name);
  else { fails++; console.log('FAIL ' + name + ' :: ' + (detail || '')); }
}

const WORD_RE = /Word gets around the haven/;
const DEBATE_RE = /Back at the haven the argument starts:/;
const SETTLE_RE = /It's settled\. The village is calling it/;
const WITNESS_RE = /came back from the treeline white-faced/;
const TALE_RE = /The fire settles\./;

function capture(Game) {
  const lines = [];
  const _emit = Game.emit;
  Game.emit = function (...a) {
    try { lines.push(String(a[0] || '')); } catch (e) {}
    try { return _emit.apply(this, a); } catch (e) { return a[0]; }
  };
  return lines;
}
function havenTile(Game) {
  for (let y = 0; y < Game.map.tiles.length; y++) {
    for (let x = 0; x < Game.map.tiles[y].length; x++) {
      const t = Game.tileAt(x, y);
      if (t && (t.type === 'haven' || t.isHaven)) return { x, y };
    }
  }
  return null;
}
function awayTile(Game, hx, hy) {
  for (let y = 0; y < Game.map.tiles.length; y++) {
    for (let x = 0; x < Game.map.tiles[y].length; x++) {
      if (x === hx && y === hy) continue;
      const t = Game.tileAt(x, y);
      if (t && t.type !== 'haven' && !t.isHaven) return { x, y, type: t.type };
    }
  }
  return null;
}
function moveTo(Game, p) {
  Game.map.px = p.x; Game.map.py = p.y;
  try { Game.state.scholar.insideHaven = false; } catch (e) {}
}
function moveHome(Game, p) {
  Game.map.px = p.x; Game.map.py = p.y;
  try { Game.state.scholar.insideHaven = true; } catch (e) {}
}
function livingRoster(Game) {
  const v = Game.state.village || {};
  const fallen = new Set((v.fallen || []).map(f => f.villagerId));
  return (v.roster || []).filter(id => id !== Game.villagerId && !fallen.has(id));
}

(async () => {
  // ---- 1+2+3: stranded kick/settle/return (seed 41801) ----
  {
    const { Game } = await loadGame({ seed: 41801, mode: 'test-gossip-position-r141', fullTelemetry: true, narration: true });
    const lines = capture(Game);
    await setupGame(Game);
    const hv = havenTile(Game);
    const aw = awayTile(Game, hv.x, hv.y);
    check('setup: haven tile found', !!hv, JSON.stringify(hv));
    check('setup: away tile found', !!aw, JSON.stringify(aw));
    moveTo(Game, aw);
    check('stranded: scholarAtHaven false away', Game.scholarAtHaven() === false);
    const roster = livingRoster(Game);
    const mid = 'hushwolf';
    const e = Game.ensureMonsterEntry(mid);
    e.reported = true;
    e.knowers = roster.slice(0, 3);
    Game.monsterNewsCheck(mid);
    check('stranded kick: namingKicked true (mechanics ran)', e.namingKicked === true);
    check('stranded kick: 0 word lines emitted', !lines.some(l => WORD_RE.test(l)), 'word lines: ' + JSON.stringify(lines.filter(l => WORD_RE.test(l))));
    check('stranded kick: 0 debate lines emitted', !lines.some(l => DEBATE_RE.test(l)), 'debate lines: ' + JSON.stringify(lines.filter(l => DEBATE_RE.test(l))));
    check('stranded kick: proposals seeded (mechanics ran)', Object.keys(e.proposals || {}).length > 0, 'proposals=' + Object.keys(e.proposals || {}).length);
    const q1 = (Game.state.scholar || {}).awayNaming || [];
    check('stranded kick: word+debate held in awayNaming', q1.map(i => i.kind).join(',') === 'word,debate', 'queue=' + JSON.stringify(q1.map(i => i.kind)));
    check('stranded kick: nothing in the relay queue (burst/settle bypass the relay)', (Game.state.pendingHavenNews || []).length === 0, 'relay=' + JSON.stringify((Game.state.pendingHavenNews || []).map(i => i.kind)));
    // force a majority, then settle while still away
    for (const vid of roster) e.proposals[vid] = 'Old Loud';
    e.proposals[Game.villagerId] = 'Old Loud';
    Game.monsterNamingCheck(mid);
    check('stranded settle: villageName set (mechanics ran)', e.villageName === 'Old Loud', 'villageName=' + e.villageName);
    check('stranded settle: 0 settle lines emitted', !lines.some(l => SETTLE_RE.test(l)));
    const q2 = (Game.state.scholar || {}).awayNaming || [];
    check('stranded settle: queue is word,debate,settle', q2.map(i => i.kind).join(',') === 'word,debate,settle', 'queue=' + JSON.stringify(q2.map(i => i.kind)));
    check('stranded settle: relay queue still empty', (Game.state.pendingHavenNews || []).length === 0);
    // return to Haven: returnToVillage delivers the held lines verbatim.
    moveHome(Game, hv);
    check('return: scholarAtHaven true at haven', Game.scholarAtHaven() === true);
    const heldTexts = q2.map(i => i.text);
    Game.returnToVillage();
    check('return: framing line on return', lines.some(l => /While you were away, the haven argued over what to call it/.test(l)));
    check('return: held word line delivered verbatim', lines.includes(heldTexts[0]), 'held=' + JSON.stringify(heldTexts));
    check('return: held debate line delivered verbatim', lines.includes(heldTexts[1]));
    check('return: held settle line delivered verbatim', lines.includes(heldTexts[2]));
    check('return: awayNaming queue drained', ((Game.state.scholar || {}).awayNaming || []).length === 0);
    check('return: relay flush delivers nothing (burst/settle bypass the relay)', Game.flushHavenNews() === 0);
  }

  // ---- 4: control at Haven (seed 41801) ----
  {
    const { Game } = await loadGame({ seed: 41801, mode: 'test-gossip-position-r141', fullTelemetry: true, narration: true });
    const lines = capture(Game);
    await setupGame(Game);
    const hv = havenTile(Game);
    moveHome(Game, hv);
    check('control: scholarAtHaven true at haven', Game.scholarAtHaven() === true);
    const roster = livingRoster(Game);
    const mid = 'hushwolf';
    const e = Game.ensureMonsterEntry(mid);
    e.reported = true;
    e.knowers = roster.slice(0, 3);
    Game.monsterNewsCheck(mid);
    check('control: word line said immediately', lines.some(l => WORD_RE.test(l)));
    check('control: debate line said immediately', lines.some(l => DEBATE_RE.test(l)));
    check('control: queue stays empty', (Game.state.pendingHavenNews || []).length === 0);
    check('control: awayNaming stays empty (in-haven lines are said, not held)', ((Game.state.scholar || {}).awayNaming || []).length === 0);
  }

  // ---- 5: witness via endDay (seed 41801; 0.15/night branch) ----
  {
    let fired = false, firedSeed = null, firedNights = 0, witnessLines = 0, wordLines = 0;
    for (const seed of [41801, 41802, 41803]) {
      const { Game } = await loadGame({ seed, mode: 'test-gossip-position-r141', fullTelemetry: true, narration: true });
      const lines = capture(Game);
      await setupGame(Game);
      const hv = havenTile(Game);
      const aw = awayTile(Game, hv.x, hv.y);
      moveTo(Game, aw);
      const roster = livingRoster(Game);
      const mid = 'mirrormoth';
      const e = Game.ensureMonsterEntry(mid);
      e.reported = true;
      e.knowers = [roster[0]];
      let nights = 0;
      for (let n = 0; n < 40; n++) {
        try { Game.endDay(); } catch (err) { break; }
        nights = n + 1;
        if (Game.over) break;
        if ((e.knowers || []).length > 1 || e.namingKicked) { fired = true; break; }
      }
      witnessLines = lines.filter(l => WITNESS_RE.test(l)).length;
      wordLines = lines.filter(l => WORD_RE.test(l)).length;
      firedSeed = seed; firedNights = nights;
      if (fired) break;
    }
    check('witness: branch fired on some seed (knowers grew / kicked)', fired, 'seed=' + firedSeed + ' nights=' + firedNights);
    check('witness: 0 witness lines while away', witnessLines === 0, 'witness lines=' + witnessLines);
    check('witness: 0 word lines while away', wordLines === 0, 'word lines=' + wordLines);
  }

  // ---- 6: killer tale (seed 41801) ----
  {
    const { Game } = await loadGame({ seed: 41801, mode: 'test-gossip-position-r141', fullTelemetry: true, narration: true });
    const lines = capture(Game);
    await setupGame(Game);
    const hv = havenTile(Game);
    const aw = awayTile(Game, hv.x, hv.y);
    const roster = livingRoster(Game);
    const mid = 'bulldozer';
    const e = Game.ensureMonsterEntry(mid);
    check('tale setup: monster unreported', !e.reported);
    const killer = roster[0];
    Game.queueKillerTale(mid, killer);
    moveTo(Game, aw);
    Game.killerTaleBeat();
    check('tale away: 0 tale prose lines', !lines.some(l => TALE_RE.test(l)), 'tale lines: ' + JSON.stringify(lines.filter(l => TALE_RE.test(l))));
    check('tale away: report still wired (mechanics ran)', e.reported === true && (e.knowers || []).includes(killer), 'reported=' + e.reported + ' knowers=' + JSON.stringify(e.knowers));
    check('tale away: tale log kept (record, not narration)', (Game.state.killerTaleLog || []).length >= 1);
    check('tale away: tale queued', (Game.state.pendingHavenNews || []).some(i => i.kind === 'tale'), 'queue=' + JSON.stringify((Game.state.pendingHavenNews || []).map(i => i.kind)));
    moveHome(Game, hv);
    const n = Game.flushHavenNews();
    check('tale return: flush delivers the tale', n >= 1 && lines.some(l => TALE_RE.test(l)), 'delivered=' + n);
  }

  console.log('---');
  console.log('gossip-position proof: ' + (checks - fails) + '/' + checks + ' checks pass');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error('PROOF CRASH', e && (e.stack || e)); process.exit(2); });
