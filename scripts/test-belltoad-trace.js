#!/usr/bin/env node
// scripts/test-belltoad-trace.js — sim-belltoad-a DIAG (zero src/js changes).
//
// QUESTION: why did two healthy villagers deal 0 damage over multiple
// rounds to the same 40%-HP belltoad on consecutive days (seed 73677,
// d67 nora_wilson 3 rounds 0/105, d68 gen_ed0l37r 2 rounds 0/76)?
//
// Modes:
//   default (--corpus): analyze the corpus of record
//     evidence/2026-10-25/perseed-deathcensus-a (armed rows, fight rows
//     from the deathcensus recorder). Confirms the two rows, prints the
//     full seed-73677 belltoad timeline, and runs the corpus-wide
//     0-damage check (is belltoad special, or is this a general
//     villager state?).
//   --replay: deterministic replay of seed 73677 (tableseat-nowait +
//     deathcensus-diag, same substrate as the corpus) with an RNG-neutral
//     outer wrapper on Game.fieldFight that captures the full fight rec
//     (rec.log, trickLog, trickShouts, volley, packCount) plus the
//     trick-knowledge state at entry (villageKnowsTrick, monsterCounter
//     known, villageCounterObs count). The wrapper only READS state and
//     never draws RNG, so the trajectory must census-match the corpus:
//     days, gameDays, deaths, and every fight key. A mismatch aborts
//     with exit 1 and the captured logs are NOT trusted.
//   --replay also writes nothing to the repo; it prints the captured
//     belltoad fight logs for days 65-68 to stdout for capture.
//
// No src/js is touched. No corpus file is written.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const CORPUS = process.env.CORPUS_DIR || path.join(REPO, 'evidence', '2026-10-25', 'perseed-deathcensus-a');
const SEEDS = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];

function loadArmed(seed) {
  return JSON.parse(fs.readFileSync(path.join(CORPUS, `s${seed}-armed.json`), 'utf8'));
}
function allFightRows(row) {
  const dc = row.deathcensus || {};
  const out = [];
  for (const f of (dc.resolveFights || [])) out.push(Object.assign({ src: 'resolve' }, f));
  for (const f of (dc.directFights || [])) out.push(Object.assign({ src: 'direct' }, f));
  return out;
}

function corpusMode() {
  let fail = 0;
  const check = (cond, msg) => { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) fail++; };
  // 1. Confirm the two rows.
  const row77 = loadArmed(73677);
  const fights77 = allFightRows(row77);
  const bell77 = fights77.filter(f => f.mid === 'belltoad');
  const nora = bell77.find(f => f.day === 67 && f.vid === 'nora_wilson');
  const gen = bell77.find(f => f.day === 68 && f.vid === 'gen_ed0l37r');
  check(!!nora && nora.outcome === 'vDie' && nora.rounds === 3 && nora.mDealt === 0 && nora.vTaken === 105
    && nora.vHpStartFrac === 1 && nora.mHpStartFrac === 0.4,
    'd67 nora_wilson row reproduced: vDie 3 rounds entry 1.00 dealt 0 taken 105 mHpStart 0.40');
  check(!!gen && gen.outcome === 'vDie' && gen.rounds === 2 && gen.mDealt === 0 && gen.vTaken === 76
    && gen.vHpStartFrac === 0.73 && gen.mHpStartFrac === 0.4,
    'd68 gen_ed0l37r row reproduced: vDie 2 rounds entry 0.73 dealt 0 taken 76 mHpStart 0.40');
  console.log('\n--- seed 73677 full belltoad timeline (both recorder arrays) ---');
  for (const f of bell77.slice().sort((a, b) => a.day - b.day)) {
    console.log(`d${f.day} [${f.src}] ${f.vid} ctx=${f.context} intent=${f.intent} out=${f.outcome} r=${f.rounds} ` +
      `vHp=${f.vHpStart}->${f.vHpLeft} mHp=${f.mHpStart}->${f.mHpLeft} dealt=${f.mDealt} taken=${f.vTaken}`);
  }
  // The learn -> engage flip: last learn-intent belltoad fight before the first engage one.
  const learns = bell77.filter(f => f.intent === 'learn').sort((a, b) => a.day - b.day);
  const engages = bell77.filter(f => f.intent === 'engage').sort((a, b) => a.day - b.day);
  console.log(`\nlearn-intent belltoad fights (73677): ${learns.map(f => 'd' + f.day + ':' + f.vid + ':' + f.outcome).join(', ')}`);
  console.log(`first engage-intent belltoad fight (73677): ${engages.length ? 'd' + engages[0].day + ' ' + engages[0].vid + ' ' + engages[0].outcome : 'none'}`);
  check(learns.length > 0 && engages.length > 0 && learns[learns.length - 1].day < engages[0].day,
    'intent flips learn -> engage between the last learn fight and the first engage fight');
  // The same-entity chain: within one entity, each fight's mHpStart equals
  // the previous fight's mHpLeft (wounds persist on the world entity).
  // Different entities break the chain (a new mHpStart) — that is a new
  // toad, not a chain failure.
  const fieldBell = bell77.filter(f => f.context === 'field').sort((a, b) => a.day - b.day);
  const runs = [];
  for (const f of fieldBell) {
    const last = runs.length ? runs[runs.length - 1] : null;
    if (last && last[last.length - 1].mHpLeft === f.mHpStart) last.push(f);
    else runs.push([f]);
  }
  console.log(`field belltoad mHp runs (73677): ${runs.map(r => r.map(f => 'd' + f.day + ':' + f.mHpStart + '->' + f.mHpLeft).join(' ')).join(' | ')}`);
  const mainRun = runs.find(r => r.some(f => f.day === 67) && r.some(f => f.day === 68));
  check(!!mainRun && mainRun.some(f => f.day === 65) && mainRun.some(f => f.day === 66),
    'the d67/d68 death fights sit on the same mHp chain as d65/d66 (45->18, then 18->18->18->18: one persistent wounded toad)');

  // 2. Corpus-wide 0-damage check (all 8 seeds, armed rows, field context).
  console.log('\n--- corpus-wide field fights (8 seeds, armed) ---');
  let fieldFights = 0, zeroDealt = 0, zeroMulti = 0, zeroMultiDeath = 0;
  const byMonsterZeroMulti = {}, byMonsterZero = {}, byMonsterField = {};
  const zeroMultiRows = [];
  for (const seed of SEEDS) {
    const row = loadArmed(seed);
    for (const f of allFightRows(row)) {
      if (f.context !== 'field') continue;
      if (!['vKill', 'vDie', 'vFlee', 'mFlee'].includes(f.outcome)) continue;
      fieldFights++;
      byMonsterField[f.mid] = (byMonsterField[f.mid] || 0) + 1;
      if (f.mDealt === 0) {
        zeroDealt++;
        byMonsterZero[f.mid] = (byMonsterZero[f.mid] || 0) + 1;
        if (f.rounds >= 2) {
          zeroMulti++;
          byMonsterZeroMulti[f.mid] = (byMonsterZeroMulti[f.mid] || 0) + 1;
          zeroMultiRows.push({ seed, day: f.day, vid: f.vid, mid: f.mid, outcome: f.outcome, rounds: f.rounds, intent: f.intent, taken: f.vTaken });
          if (f.outcome === 'vDie') zeroMultiDeath++;
        }
      }
    }
  }
  console.log(`field fights: ${fieldFights}; 0-dealt: ${zeroDealt}; 0-dealt multi-round (>=2): ${zeroMulti}; of those, deaths: ${zeroMultiDeath}`);
  console.log('0-dealt multi-round by monster: ' + JSON.stringify(byMonsterZeroMulti));
  console.log('0-dealt (any rounds) by monster: ' + JSON.stringify(byMonsterZero));
  console.log('field fights by monster (top): ' + JSON.stringify(Object.entries(byMonsterField).sort((a, b) => b[1] - a[1]).slice(0, 12)));
  console.log('\n0-dealt multi-round field rows:');
  for (const r of zeroMultiRows) {
    console.log(`  s${r.seed} d${r.day} ${r.vid} vs ${r.mid} out=${r.outcome} r=${r.rounds} intent=${r.intent} taken=${r.taken}`);
  }
  // 3. Belltoad corpus-wide: intent vs dealt.
  console.log('\n--- belltoad field fights corpus-wide (intent vs dealt) ---');
  let bLearn = 0, bLearnZero = 0, bEng = 0, bEngZero = 0;
  for (const seed of SEEDS) {
    const row = loadArmed(seed);
    for (const f of allFightRows(row)) {
      if (f.context !== 'field' || f.mid !== 'belltoad') continue;
      if (!['vKill', 'vDie', 'vFlee', 'mFlee'].includes(f.outcome)) continue;
      if (f.intent === 'learn') { bLearn++; if (f.mDealt === 0) bLearnZero++; }
      else if (f.intent === 'engage') { bEng++; if (f.mDealt === 0) bEngZero++; }
    }
  }
  console.log(`belltoad field fights: learn-intent ${bLearn} (0-dealt ${bLearnZero}); engage-intent ${bEng} (0-dealt ${bEngZero})`);
  // Engage-intent belltoad fights that DID deal damage: knowledge alone
  // does not zero damage — the shout gate needs hurt below 75% HP, so a
  // villager acting first at high HP still strikes. List them as the
  // control for the gate.
  console.log('engage-intent belltoad field fights with rounds>=1 (the gate control):');
  for (const seed of SEEDS) {
    const row = loadArmed(seed);
    for (const f of allFightRows(row)) {
      if (f.context !== 'field' || f.mid !== 'belltoad' || f.intent !== 'engage' || f.rounds < 1) continue;
      if (!['vKill', 'vDie', 'vFlee', 'mFlee'].includes(f.outcome)) continue;
      console.log(`  s${seed} d${f.day} ${f.vid} out=${f.outcome} r=${f.rounds} entry=${f.vHpStartFrac} dealt=${f.mDealt} taken=${f.vTaken}`);
    }
  }
  console.log(`\ncorpusMode done. fail=${fail}`);
  if (fail) process.exit(1);
}

async function replayMode() {
  process.env.LEANLINKRESCUE = '1';
  process.env.TABLESEATNOWAIT = '1';
  process.env.DEATHCENSUS = '1';
  const { loadGame, setupGame, runDays } = require('./sim-harness');
  const { tableseatNowait } = require('./policies/tableseat-nowait');
  const { newStore, installDeathcensusDiag, withDeathcensusDiag } = require('./policies/deathcensus-diag');
  const store = newStore();
  const base = withDeathcensusDiag(tableseatNowait, 'deathcensus-diag', 'tableseat-nowait + villager death-context census recorder', store);
  const { Game } = await loadGame({ seed: 73677, mode: 'deathcensus-diag-armed', fullTelemetry: false });
  await setupGame(Game);
  installDeathcensusDiag(Game, store);
  // RNG-neutral outer wrapper: reads only, never draws, never mutates.
  const captured = [];
  const orig = Game.fieldFight;
  Game.fieldFight = function (vid, mdef, m, opts) {
    const isBell = mdef && mdef.id === 'belltoad';
    let pre = null;
    if (isBell) {
      try {
        pre = {
          day: (Game.state.scholar || {}).day,
          knows: Game.villageKnowsTrick ? Game.villageKnowsTrick('belltoad') : null,
          counterKnown: Game.monsterCounterKnown ? Game.monsterCounterKnown('belltoad') : null,
          obs: ((Game.state.villageCounterObs || {}).belltoad || 0),
          vHp: ((Game.state.village || {}).health || {})[vid],
          vSpeed: Game.villagerSpeed ? Game.villagerSpeed(vid) : null,
          mHp: m ? m.hp : null,
        };
      } catch (e) { pre = { err: String(e).slice(0, 100) }; }
    }
    const rec = orig.apply(this, arguments);
    if (isBell) {
      let postObs = null;
      try { postObs = ((Game.state.villageCounterObs || {}).belltoad || 0); } catch (e) {}
      captured.push({ vid, pre, postObs, rec: {
        outcome: rec.outcome, rounds: rec.rounds, vTaken: rec.vTaken, mDealt: rec.mDealt,
        vHpLeft: rec.vHpLeft, mHpLeft: rec.mHpLeft, packCount: rec.packCount,
        volley: rec.volley || null, trickLog: rec.trickLog || null, trickShouts: rec.trickShouts || 0,
        intent: rec.intent, intentWhy: rec.intentWhy, log: rec.log || [],
      } });
    }
    return rec;
  };
  const result = await runDays(Game, base, { days: 180, manifest: undefined, sampleEvery: 10 });
  // Census-match against the corpus (same keys as the transcript mode).
  const corpus = loadArmed(73677);
  const deaths = (result.samples.deaths || []).map(d => {
    let player = false;
    try { player = !!d.player; } catch (e) {}
    return { day: d.day | 0, kind: d.kind || null, who: (d.who != null) ? String(d.who) : null, cause: (d.cause != null) ? String(d.cause) : null, player };
  });
  const fightKey = (f) => [f.day, f.vid, f.mid, f.outcome, f.rounds, f.mHpStart, f.mHpLeft].join('|');
  const sameDays = corpus.days === result.days && corpus.gameDays === result.gameDays;
  const sameDeaths = JSON.stringify(corpus.deathcensus.deaths) === JSON.stringify(deaths);
  const sameResolve = JSON.stringify((corpus.deathcensus.resolveFights || []).map(fightKey)) === JSON.stringify((store.resolveFights || []).map(fightKey));
  const sameDirect = JSON.stringify((corpus.deathcensus.directFights || []).map(fightKey)) === JSON.stringify((store.directFights || []).map(fightKey));
  console.log(`REPLAY-CENSUS seed=73677 days=${result.days} gameDays=${result.gameDays} daysMatch=${sameDays} deathsMatch=${sameDeaths} resolveMatch=${sameResolve} directMatch=${sameDirect}`);
  if (!(sameDays && sameDeaths && sameResolve && sameDirect)) {
    console.error('REPLAY REPRODUCTION FAILURE — captured logs are NOT trusted');
    process.exit(1);
  }
  console.log('REPLAY-CENSUS MATCH — captured belltoad fight logs are on-trajectory');
  for (const c of captured) {
    const r = c.rec;
    console.log(`\n=== belltoad fight d${c.pre.day} ${c.vid} preKnows=${c.pre.knows} preCounterKnown=${c.pre.counterKnown} preObs=${c.pre.obs} postObs=${c.postObs} vHpEntry=${c.pre.vHp} vSpeed=${c.pre.vSpeed} mHpEntry=${c.pre.mHp} ===`);
    console.log(`outcome=${r.outcome} rounds=${r.rounds} dealt=${r.mDealt} taken=${r.vTaken} vHpLeft=${r.vHpLeft} mHpLeft=${r.mHpLeft} packCount=${r.packCount} volley=${JSON.stringify(r.volley)} trickLog=${JSON.stringify(r.trickLog)} trickShouts=${r.trickShouts} intent=${r.intent} (${r.intentWhy})`);
    for (const line of r.log) console.log('  LOG ' + line);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--replay')) return replayMode();
  return corpusMode();
}
main().catch(e => { console.error('BELLTOAD-TRACE FAILED:', (e && e.stack) || e); process.exit(1); });
