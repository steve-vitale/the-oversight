// strikefall-diag-replay-20261113.js — diagnostic replay for #2304 (arm
// sim-strikefall-a). Re-runs seed 190396 (competent, 150d) and dumps the
// FULL say stream for day 89 (the duplicate square-scream day) with
// sequence numbers, plus the Static Kite fighter's live state
// (telegraph, skDip, altitude, phase, hp) at every line of the kite
// fight. Decides the mechanism: a fresh declare/telegraph cycle between
// the two DIP lines means two honest dips (two attack cycles); no
// declare between them means one kite resolving twice (double-resolve).
// Also prints the two #2303 observation fights (d89 kite kill, d130
// Congregation kill) with their falls/STRIKE adjacency, as a cross-check
// of the analyzer's snapshot classification.
// Usage:
//   node scripts/strikefall-diag-replay-20261113.js [seed] [day]
// Output: evidence/2026-11-13/strikefall-diag-replay.json + .log
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

const SEED = parseInt(process.argv[2] || '190396', 10);
const DAY = parseInt(process.argv[3] || '89', 10);
const DAYS = 150;
const DIP_RE = /The square SCREAMS \u2014 static made solid\. And the kite DIPS/;

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

let fightSeq = 0;
const fightIds = new WeakMap();
function fightId(Game) {
  try {
    const f = Game.tbfight;
    if (!f) return null;
    let id = fightIds.get(f);
    if (id == null) { fightSeq += 1; id = fightSeq; fightIds.set(f, id); }
    return id;
  } catch (e) { return null; }
}

function kiteState(Game) {
  try {
    const f = Game.tbfight;
    if (!f || !Array.isArray(f.fighters)) return null;
    const k = f.fighters.find(function (o) { return (o.mdef && o.mdef.id) === 'statickite'; });
    if (!k) return null;
    return {
      key: k.key, alive: !!k.alive, hp: k.hp, altitude: k.altitude || null,
      skDip: k.skDip || 0,
      telegraph: k.telegraph ? { kind: k.telegraph.kind, turnsLeft: k.telegraph.turnsLeft, attack: k.telegraph.attackName || null } : null,
      phase: k.encPhase || k.phase || null,
    };
  } catch (e) { return { error: String(e.message).slice(0, 80) }; }
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'competent-strikefall-diag', fullTelemetry: false });
  const dayLines = [];
  const dipLines = [];
  let sayCount = 0;
  let kiteFightId = null;
  const origSay = Game.say;
  Game.say = function () {
    try {
      const arg = arguments.length ? arguments[0] : null;
      if (typeof arg === 'string') {
        sayCount++;
        const seq = sayCount;
        const line = String(arg);
        const day = gday(Game);
        const fid = fightId(Game);
        if (DIP_RE.test(line)) {
          dipLines.push({ seq: seq, day: day, fight: fid, line: line, kite: kiteState(Game) });
          if (kiteFightId == null) kiteFightId = fid;
        }
        if (day === DAY) {
          // Kite state on EVERY day-89 line (null when no kite is in the
          // live fight): the declare/telegraph cycle between the two dips
          // reads off these snapshots, not off a filtered line list.
          dayLines.push({ seq: seq, day: day, fight: fid, line: line.slice(0, 600), kite: kiteState(Game) });
        }
      }
    } catch (e) { /* never break the sim */ }
    return origSay.apply(this, arguments);
  };
  await setupGame(Game);
  let result = null;
  await quietLog(async function () { result = await runDays(Game, competent, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });
  const out = {
    seed: SEED, day: DAY, days: result.days, endReason: result.endReason,
    maxWave: result.maxWaveUnlocked || 1, standing: null,
    kiteFightId: kiteFightId,
    dipLines: dipLines,
    dayLines: dayLines,
  };
  try { out.standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  const base = path.join(REPO, 'evidence', '2026-11-13', 'strikefall-diag-replay');
  fs.writeFileSync(base + '.json', JSON.stringify(out, null, 2) + '\n');
  const log = [];
  log.push('seed ' + SEED + ' day ' + DAY + ' days=' + result.days + ' end=' + result.endReason + ' maxWave=' + out.maxWave + ' standing=' + out.standing);
  log.push('kiteFightId=' + kiteFightId + ' dipLines=' + dipLines.length);
  for (const d of dipLines) {
    log.push('DIP seq=' + d.seq + ' day=' + d.day + ' fight=' + d.fight + ' kite=' + JSON.stringify(d.kite));
  }
  log.push('--- day ' + DAY + ' full say stream (' + dayLines.length + ' lines) ---');
  for (const l of dayLines) log.push(l.seq + ' [f' + l.fight + '] ' + l.line);
  fs.writeFileSync(base + '.log', log.join('\n') + '\n');
  console.log(log.slice(0, 8).join('\n'));
  console.log('wrote ' + base + '.json + .log');
}

if (require.main === module) main().catch(function (e) { console.error(e.stack); process.exit(1); });
module.exports = { DIP_RE: DIP_RE };
