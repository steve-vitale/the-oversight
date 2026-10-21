#!/usr/bin/env node
// test-windowreach-r3-20261021.js — proof for the sim-windowreach-r3 instrument
// (round-3 post-unlock-window layer on top of killdisc v2).
//
// E0 shape: install/uninstall on a real harness game; t.window entries carry
//   every field (incl rank/maxRank); uninstall restores Game.sleep exactly.
// E1 det-gate: instrument-on (full r3 windowreach+killdisc stack) vs
//   instrument-off byte-identical trajectories on the armed substrate,
//   2 seeds x 60d, with a noinstr-vs-noinstr stability pre-check.
// E2 RED->GREEN on synthetic fixtures: (RED) the attribute functions flag
//   unresolvable-wave and no-fight-id-no-kill-match engagements as
//   UNEXPLAINED; (GREEN) scripted Game stubs produce correct unlock-day
//   detection, rank/maxRank tracking, and full attribution (kill-join,
//   outcome-join, taxonomy).
// E3 read-only static scan of the NEW r3 instrument source: zero RNG draws,
//   zero Game.state writes, Game.<x> assignments only the install-time wraps.
// E4 + D2: 180d armed run through the REAL r3 sweep completes with the
//   window layer installed, zero instrument errors, winTrack/#760 fields
//   populated when the run wins, and a deterministic re-run (byte-identical
//   per-seed JSON).
// Any gate failure = FAIL LOUDLY, no sweep.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 \
//        VGEAR=1 KILLDISC=1 node scripts/test-windowreach-r3-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT']) {
  if (process.env[k] != null) { console.error(`STOP: ${k} must be unset.`); process.exit(2); }
}

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const VCE = require(path.join(REPO, 'scripts', 'policies', 'vgearconfirm'));
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261021'));
const WI = require(path.join(REPO, 'scripts', 'windowreach-r3-instrument-20261021'));
const WA = require(path.join(REPO, 'scripts', 'windowreach-r3-analyze-20261021'));

const WIN_FIELDS = ['day', 'uw', 'prevUw', 'unlocked', 'raw', 'capped', 'peakRaw', 'peakCapped',
  'r4', 'r5', 'w4faced', 'w5faced', 'veterans5', 'living', 'dead', 'rosterUnknown', 'scholarAlive',
  'rank', 'maxRank'];

async function newGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'windowreach-r3-test', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}
function freshT() {
  return { kills: [], engagements: [], fieldFights: [], spawns: [], tbOutcomes: {}, census: [], dmg: {}, instrumentErrors: [], window: [] };
}

(async () => {
  console.log('== E0 shape: install/uninstall on a real harness game ==');
  {
    const Game = await newGame(65001);
    const preSleep = Game.sleep;
    const t = freshT();
    const uninstall = WI.install(Game, t);
    check('Game.sleep wrapped', Game.sleep !== preSleep);
    // one sleep -> one window entry with all fields
    Game.state.scholar.day = 30;
    Game.sleep();
    check('one window entry captured', t.window.length === 1, `got ${t.window.length}`);
    const w = t.window[0];
    check('window fields complete (incl rank/maxRank)', WIN_FIELDS.every(f => f in w), JSON.stringify(Object.keys(w)));
    check('r4/r5 bars shaped', w.r4 && w.r5 && Array.isArray(w.r4.short) && ('ready' in w.r5));
    check('uw is sane', (w.uw | 0) >= 1 && (w.uw | 0) <= 5, 'uw=' + w.uw);
    check('rank/maxRank read', typeof w.rank === 'string' && typeof w.maxRank === 'string',
      `rank=${w.rank} maxRank=${w.maxRank}`);
    check('no instrument errors from one sleep', t.instrumentErrors.length === 0, JSON.stringify(t.instrumentErrors.slice(0, 2)));
    uninstall();
    check('uninstall restores Game.sleep exactly', Game.sleep === preSleep);
  }

  console.log('== E1 det-gate: instrument-on vs off, armed substrate, 2 seeds x 60d ==');
  async function traj(seed, pid, useInstr) {
    const pol = VCE.armedFor(pid);
    const Game = await newGame(seed);
    const t = freshT();
    let uninstall = null;
    if (useInstr) uninstall = WI.install(Game, t);
    const hs = [];
    const wrapped = Object.assign({}, pol, {
      daily(Gm, ctx) { hs.push(Gm.state.scholar.day + ':' + dayHash(Gm)); return pol.daily(Gm, ctx); },
    });
    await quietLog(async () => { await runDays(Game, wrapped, { days: 60, manifest: undefined, sampleEvery: 1 }); });
    if (uninstall) uninstall();
    return { hashes: hs.join('\n'), t };
  }
  {
    let green = 0, total = 0;
    for (const pid of ['leadfeast', 'belongfeast']) {
      let judged = false;
      for (const seed of [65001, 65002, 65003, 65004]) {
        if (judged) break;
        const a = await traj(seed, pid, false);
        const b = await traj(seed, pid, false);
        if (a.hashes !== b.hashes) { console.log(`  .. ${pid} s${seed}: noinstr-vs-noinstr UNSTABLE — skipped`); continue; }
        total++;
        const c = await traj(seed, pid, true);
        const same = c.hashes === a.hashes;
        if (same) green++;
        check(`det ${pid} s${seed} trajectory identical`, same, same ? '' : 'diverged');
        check(`det ${pid} s${seed} window trace captured`, c.t.window.length > 0, `window=${c.t.window.length}`);
        check(`det ${pid} s${seed} killdisc census captured`, c.t.census.length > 0, `census=${c.t.census.length}`);
        check(`det ${pid} s${seed} rank trace captured`, c.t.window.every(w => typeof w.rank === 'string'), 'rank missing');
        judged = true;
      }
      if (!judged) check(`det ${pid}: no stable seed found`, false, 'all 4 flaky');
    }
    check('E1 det-gate all green', green === total && total > 0, `${green}/${total}`);
  }

  console.log('== E2 RED->GREEN on synthetic fixtures ==');
  {
    // RED: the detector fires — unresolvable mid / wave -> UNEXPLAINED.
    const r1 = WA.attributeEng({ mid: 'no_such_monster', wave: 5, started: true, fightIdPresent: true, outcome: 'won' });
    check('RED unresolvable-wave flagged', !r1.attributed && r1.reason === 'unresolvable-wave', JSON.stringify(r1));
    const r2 = WA.attributeEng({ mid: 'cancellation', wave: 5, started: true, fightIdPresent: false, killJoin: false });
    check('RED no-fight-id-no-kill-match flagged', !r2.attributed && r2.reason === 'no-fight-id-and-no-kill-match', JSON.stringify(r2));
    const r3 = WA.attributeFF({ mid: 'cancellation', wave: 5, outcome: 'unresolved' });
    check('RED unresolved fieldFight outcome flagged', !r3.attributed && r3.reason === 'unresolved-outcome', JSON.stringify(r3));
    const r4 = WA.attributeKill({ d: 100, mid: 'cancellation', wave: 5, by: null, via: 'player' });
    check('RED wave-5 kill without killer flagged', !r4.attributed && r4.reason === 'no-killer', JSON.stringify(r4));
    // GREEN: unlock-day detection + rank tracking on a scripted Game stub.
    const uwSeq = [1, 1, 1, 4, 4, 5, 5];
    const rankSeq = ['village', 'village', 'local', 'regional', 'regional', 'national', 'national'];
    let di = 0;
    const G = {
      state: { scholar: { day: 0 }, village: { roster: ['v1', 'v2'] } },
      sleep() { G.state.scholar.day++; di++; },
      unlockedWave: () => uwSeq[Math.min(di, uwSeq.length - 1)],
      scaleRank: () => rankSeq[Math.min(di, rankSeq.length - 1)],
      villageStanding: () => ({ total: 50 * di }),
      standingPlentyCappedTotal: () => 40 * di,
      waveCombatReadiness: () => ({ armored: 1, armed: 2, tricks: 1, veterans: 0, short: [], ready: false }),
      waveEngaged: (w) => (w === 4 && di >= 4 ? 2 : 0),
      getPerson: (id) => ({ dead: id === 'v2' && di >= 5 }),
    };
    const t = { window: [], instrumentErrors: [] };
    const uninstall = WI.installWindowLayer(G, t);
    for (let i = 0; i < 7; i++) G.sleep();
    uninstall();
    check('7 window entries', t.window.length === 7, `got ${t.window.length}`);
    const u4 = t.window.find(w => w.unlocked === 4);
    const u5 = t.window.find(w => w.unlocked === 5);
    check('unlock-day 4 detected', !!u4 && u4.day === 3, JSON.stringify(u4 && { day: u4.day, unlocked: u4.unlocked }));
    check('unlock-day 5 detected', !!u5 && u5.day === 5, JSON.stringify(u5 && { day: u5.day, unlocked: u5.unlocked }));
    check('peak raw/capped tracked', t.window[6].peakRaw === 300 && t.window[6].peakCapped === 240,
      `peakRaw=${t.window[6].peakRaw} peakCapped=${t.window[6].peakCapped}`);
    check('rank/maxRank tracked (national)', t.window[6].rank === 'national' && t.window[6].maxRank === 'national',
      `rank=${t.window[6].rank} maxRank=${t.window[6].maxRank}`);
    check('rank ladder monotonic (village->national)', t.window[0].maxRank === 'village' && t.window[3].maxRank === 'regional',
      JSON.stringify(t.window.map(w => w.maxRank)));
    check('roster read (living/dead)', t.window[6].living === 1 && t.window[6].dead === 1,
      `living=${t.window[6].living} dead=${t.window[6].dead}`);
    check('w4faced read', t.window[6].w4faced === 2 && t.window[6].w5faced === 0,
      `w4=${t.window[6].w4faced} w5=${t.window[6].w5faced}`);
    check('no instrument errors on stub', t.instrumentErrors.length === 0, JSON.stringify(t.instrumentErrors.slice(0, 2)));
    // GREEN: engagement/kill/outcome join attribution.
    const g1 = WA.attributeEng({ mid: 'cancellation', wave: 5, started: true, fightIdPresent: true, outcome: 'won', outcomeSource: 'tbEnd', killJoin: true });
    check('GREEN kill-join attributed', g1.attributed && g1.reason === 'kill-join', JSON.stringify(g1));
    const g2 = WA.attributeEng({ mid: 'editor', wave: 5, started: true, fightIdPresent: true, outcome: 'fled', outcomeSource: 'tbEnd', killJoin: false });
    check('GREEN outcome-join attributed', g2.attributed && g2.reason === 'outcome-join', JSON.stringify(g2));
    const g3 = WA.attributeEng({ mid: 'nielsen', wave: 5, started: false });
    check('GREEN TB-refused attributed (aborted)', g3.attributed && g3.reason === 'aborted', JSON.stringify(g3));
    const g4 = WA.attributeEng({ mid: 'rerun', wave: 5, started: true, fightIdPresent: true, outcome: null, killJoin: false });
    check('GREEN unrecorded attributed (explicit class)', g4.attributed && g4.reason === 'unrecorded', JSON.stringify(g4));
    const g5 = WA.attributeEng({ mid: 'timeslot', wave: 5, started: true, fightIdPresent: false, killJoin: true });
    check('GREEN day+mid fallback attributed', g5.attributed && g5.reason === 'kill-match', JSON.stringify(g5));
    const g6 = WA.attributeKill({ d: 100, mid: 'cancellation', wave: 5, by: 'p', via: 'player' });
    check('GREEN wave-5 kill attributed', g6.attributed && g6.reason === 'via:player', JSON.stringify(g6));
    // GREEN: #760 fields carried through the analyzer.
    const j760 = {
      seed: 1, policyId: 'leadfeast', won: 1, national: 1, table: 1, gameDays: 90,
      winTrack: { path: 'feared', branch: 'light', resolution: 'THE FEARED', finalId: 'f1', phase: 'done' },
      seat: { seat: 'lesser', detail: { rank: 'national' } }, rankAtEnd: 'national',
      maxRank: 'national', everNational: 1, instrumentErrors: [],
      window: [{ day: 85, uw: 5, rank: 'national', maxRank: 'national' }],
      engagements: [], fieldFights: [], kills: [], deaths: {}, deathList: [], maxWave: 5,
    };
    const a760 = WA.analyzeRun(j760);
    check('GREEN #760 carried: winTrack', !!a760.winTrack && a760.winTrack.path === 'feared', JSON.stringify(a760.winTrack));
    check('GREEN #760 carried: seat+rank+everNational', a760.seat.seat === 'lesser' && a760.rankAtEnd === 'national' && a760.everNational === 1,
      JSON.stringify({ seat: a760.seat, rankAtEnd: a760.rankAtEnd, everNational: a760.everNational }));
    check('GREEN #760 unlock detected from trace', a760.unlocked5 && a760.unlockDay5 === 85, `unlocked5=${a760.unlocked5} day=${a760.unlockDay5}`);
  }

  console.log('== E3 read-only static scan of the r3 instrument source ==');
  {
    const fname = 'windowreach-r3-instrument-20261021.js';
    const src = fs.readFileSync(path.join(REPO, 'scripts', fname), 'utf8');
    const lines = src.split('\n');
    const rng = lines.filter(l => !/^\s*\/\//.test(l) && /Math\.random\s*\(/.test(l));
    check(`${fname}: no RNG draws`, rng.length === 0, rng.slice(0, 2).join(' | '));
    const badGame = lines.filter(l => {
      if (/^\s*\/\//.test(l)) return false;
      if (/Game\.sleep = function/.test(l)) return false;      // the sleep wrap (install)
      if (/Game\.sleep = innerSleep/.test(l)) return false;    // uninstall restore
      return /Game\.\w+\s*=(?!=)/.test(l);
    });
    check(`${fname}: no Game.<x> assignments outside install wraps`, badGame.length === 0, badGame.slice(0, 2).join(' | '));
    const badState = lines.filter(l => {
      if (/^\s*\/\//.test(l)) return false;
      if (/t\.(kills|engagements|fieldFights|spawns|tbOutcomes|census|dmg|instrumentErrors|window|_wrPeak)/.test(l)) return false;
      return /Game\.state\.\w+\s*=(?!=)|this\.state\.\w+\s*=(?!=)/.test(l);
    });
    check(`${fname}: no Game.state / this.state writes`, badState.length === 0, badState.slice(0, 2).join(' | '));
  }

  console.log('== E4+D2: 180d armed run through the real r3 sweep + deterministic re-run ==');
  {
    const outDir = '/tmp/wr3-proof-sweep';
    execFileSync('rm', ['-rf', outDir]);
    fs.mkdirSync(outDir, { recursive: true });
    const env = Object.assign({}, process.env, { SEEDS: '65001', POLICIES: 'leadfeast', EVID: outDir, DAYS: '180' });
    const run = () => execFileSync('node', [path.join(REPO, 'scripts', 'windowreach-r3-sweep-20261021.js')], { env, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
    let o1;
    try { o1 = run(); } catch (e) { check('E4 sweep completed', false, String(e && e.message).slice(0, 200)); o1 = null; }
    const fp = path.join(outDir, 'leadfeast', 's65001.json');
    check('E4 sweep wrote per-seed JSON', fs.existsSync(fp));
    let j1 = null;
    try { j1 = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) {}
    check('E4 zero instrument errors', j1 && (j1.instrumentErrors || []).length === 0, JSON.stringify(j1 && j1.instrumentErrors));
    check('E4 window trace populated', j1 && (j1.window || []).length > 0, `window=${j1 && j1.window.length}`);
    check('E4 #760 fields present', j1 && ('winTrack' in j1) && ('seat' in j1) && ('rankAtEnd' in j1) && ('maxRank' in j1) && ('everNational' in j1),
      JSON.stringify(j1 && { won: j1.won, winTrack: j1.winTrack, seat: j1.seat, rankAtEnd: j1.rankAtEnd, maxRank: j1.maxRank, everNational: j1.everNational }));
    const b1 = fs.existsSync(fp) ? fs.readFileSync(fp, 'utf8') : null;
    let b2 = null;
    try { run(); b2 = fs.readFileSync(fp, 'utf8'); } catch (e) { check('E4 re-run completed', false, String(e && e.message).slice(0, 200)); }
    check('E4 re-run byte-identical', b1 != null && b2 != null && b1 === b2, b1 && b2 ? `len ${b1.length} vs ${b2.length}` : 'missing');
    void o1;
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
