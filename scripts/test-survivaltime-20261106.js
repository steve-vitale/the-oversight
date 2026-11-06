// test-survivaltime-20261106.js — proof for the survival-time lever
// (arm sim-survivaltime-b, run fleshout-loop-b-20261106T1730Z).
//
// The lever: the armor curve's constant 20 -> 6 (Game.armorReduction,
// shared by all four absorb sites). The proof demonstrates the OBSERVABLE
// effect, not just green assertions:
//   1. armorReduction unit values (live Game).
//   2. REAL tbDamage: a wave-4-shaped hit (62 requested, pierce 0.35) on a
//      scholar in median-worn armor (P=27) now takes 16 HP, not 33 — and
//      the same hit repeated kills in 7 hits, not 4. That is the survival
//      time the lever buys, measured through the engine, with the old
//      formula's number computed alongside as the old-code control.
//   3. Villager parity: the same hit on a varmor=27 villager takes 16.
//   4. Wiring: no K=20 curve remains in src/js; all four sites call the helper.
//   5. Analyzer fixtures: log-based wave-4 TB kill rate (the judged metric).
//   6. Live driver legs (unjudged seed 55002, 90d, /tmp only): the
//      instrument still records wave-4 TB fights on the new code with
//      zero errors; determinism and neutrality hold.
// Usage: node scripts/test-survivaltime-20261106.js
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'survivaltime-analyze-20261106'));
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function approx(a, b, eps) { return Math.abs(a - b) <= (eps || 1e-9); }
// The OLD curve, as the control: same shape, K=20.
function oldReduction(prot, pierce) {
  const p = Math.max(0, prot || 0);
  if (!(p > 0)) return 0;
  const pr = Math.min(0.9, Math.max(0, pierce || 0));
  const effP = p * (1 - pr);
  return effP / (effP + 20);
}
function oldApplied(P, hit, pierce) {
  if (!(P > 0) || !(hit > 0)) return hit;
  const r = oldReduction(P, pierce);
  return hit - Math.min(hit - 1, Math.round(hit * r));
}

(async () => {
  const { Game } = await loadGame({ seed: 7, mode: 'test' });
  await setupGame(Game);
  const osay = Game.say; Game.say = function () {};

  // ---------- 1. armorReduction unit values ----------
  check('reduction-naked', Game.armorReduction(0, 0.35) === 0);
  check('reduction-bark', approx(Game.armorReduction(10, 0), 10 / 16));
  check('reduction-P6-halves', approx(Game.armorReduction(6, 0), 0.5));
  check('reduction-median-worn-w4', approx(Game.armorReduction(27, 0.35), 17.55 / 23.55, 1e-9),
    'got ' + Game.armorReduction(27, 0.35));
  check('reduction-P100', approx(Game.armorReduction(100, 0), 100 / 106, 1e-9));
  check('reduction-pierce-clamped', approx(Game.armorReduction(40, 1.5), 4 / 10, 1e-9));
  check('reduction-beats-old-everywhere',
    Game.armorReduction(10, 0) > oldReduction(10, 0) &&
    Game.armorReduction(27, 0.35) > oldReduction(27, 0.35) &&
    Game.armorReduction(60, 0.45) > oldReduction(60, 0.45));

  // ---------- 2/3. Live tbDamage: the observable effect ----------
  Game.startCombat('hummice');
  if (!Game.tbfight) { console.log('FAIL setup: no fight'); process.exit(1); }
  const p = Game.tbFighter('p');
  const m = Game.tbfight.fighters.find(x => x.kind === 'monster');
  function hitScholar(P, hit, pierce, hp) {
    Game.armorBonus = () => P;
    try { if (m && m.mdef) m.mdef.pierce = pierce; } catch (e) {}
    p.hp = hp; p.maxHp = Math.max(hp, 5000); p.alive = true;
    return Game.tbDamage('p', hit, 'test-blade', m ? m.key : null, { undodgeable: true, quiet: true });
  }
  // The wave-4-shaped hit: median requested 62.5, median worn P=27, pierce 0.35.
  const taken = hitScholar(27, 62, 0.35, 5000);
  check('live-w4-hit-takes-16', taken === 16, 'took ' + taken);
  check('live-w4-hit-old-was-33', oldApplied(27, 62, 0.35) === 33, 'old ' + oldApplied(27, 62, 0.35));
  check('live-w4-hit-halved', taken < oldApplied(27, 62, 0.35) / 1.9, 'new ' + taken + ' old ' + oldApplied(27, 62, 0.35));
  // Bark vs a 20-hit: 7 now, 13 before.
  const barkTaken = hitScholar(10, 20, 0, 5000);
  check('live-bark-hit-takes-7', barkTaken === 7, 'took ' + barkTaken);
  check('live-bark-old-was-13', oldApplied(10, 20, 0) === 13);
  // Hits to kill a 100-HP scholar at the wave-4 hit: 7 now, 4 before.
  // (Arithmetic from the measured per-hit applied: ceil(100/16)=7, ceil(100/33)=4;
  // verified by repeated live calls below.)
  let hitsToKill = 0;
  p.hp = 100; p.maxHp = 100; p.alive = true;
  Game.armorBonus = () => 27;
  try { if (m && m.mdef) m.mdef.pierce = 0.35; } catch (e) {}
  while (p.hp > 0 && hitsToKill < 20) {
    Game.tbDamage('p', 62, 'test-blade', m ? m.key : null, { undodgeable: true, quiet: true });
    hitsToKill++;
    if (p.hp > 100) break; // something healed/cheated — do not spin
  }
  check('live-hits-to-kill-7-not-4', hitsToKill === 7, 'hits=' + hitsToKill + ' hp=' + p.hp);
  check('live-hits-to-kill-beats-old', hitsToKill > Math.ceil(100 / oldApplied(27, 62, 0.35)));
  // Chip clamp: at least 1 always lands; naked: untouched.
  check('live-chip-1-lands', hitScholar(27, 1, 0.35, 5000) === 1);
  check('live-naked-untouched', hitScholar(0, 62, 0.35, 5000) === 62);

  // Villager parity: varmor=27 takes the same 16.
  const v = Game.tbfight.fighters.find(x => x.kind === 'villager');
  if (v) {
    v.varmor = 27; v.hp = 5000; v.maxHp = 5000; v.alive = true;
    try { if (m && m.mdef) m.mdef.pierce = 0.35; } catch (e) {}
    const vTaken = Game.tbDamage(v.key, 62, 'test-blade', m ? m.key : null, { undodgeable: true, quiet: true });
    check('live-villager-same-16', vTaken === 16, 'took ' + vTaken);
  } else {
    console.log('(no villager fighter in test fight — villager block covered by the wiring check + pilot corpus)');
  }
  Game.say = osay;

  // ---------- 4. Wiring: no K=20 curve left; four sites call the helper ----------
  const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
  check('wire-no-old-curve-game', !/effP \+ 20/.test(gameSrc));
  check('wire-no-old-curve-field', !/effP[A]? \+ 20/.test(ffSrc));
  check('wire-helper-defined', /armorReduction\(prot, pierce\)/.test(gameSrc));
  check('wire-game-calls-helper-twice', (gameSrc.match(/this\.armorReduction\(/g) || []).length === 2,
    'calls=' + (gameSrc.match(/this\.armorReduction\(/g) || []).length);
  check('wire-field-calls-helper-twice', (ffSrc.match(/this\.armorReduction\(/g) || []).length === 2,
    'calls=' + (ffSrc.match(/this\.armorReduction\(/g) || []).length);

  // ---------- 5. Analyzer fixtures: the judged metric ----------
  function hit(r, actor, actorKind, tgtKind, dmg) {
    return { r: r, actor: actor, actorKind: actorKind, src: actor, srcLabel: 'test', tgt: tgtKind === 'monster' ? 'm_0' : 'p', tgtKind: tgtKind, req: dmg, dmg: dmg, hpAfter: 100, maxHp: 100 };
  }
  function trace(opts) {
    const o = opts || {};
    return Object.assign({
      seq: 1, tbSeq: 1, day: 80, mid: 'the_congregation', mids: ['the_congregation'], wave: 4,
      entryHp: 1000, entryMaxHp: 1000, entryFrac: 1, fighters: ['scholar', 'ally1'],
      alliesAtEntry: 1, partyAtEntry: 1, hits: [], turns: [], verbs: [],
      outcome: 'lost', ending: 'scholar-death', mHpLeft: 800, mHpLeftFrac: 0.8,
      rounds: 6, scholarHpEnd: 0, scholarHpFracEnd: 0,
      rallyRound: null, rallyOk: null, scholarStruckRallyRound: null,
    }, o);
  }
  check('trace-present-turns', AN.tracePresent(trace({ turns: [{ r: 1, actor: 'm_0' }] })) === true);
  check('trace-absent-empty', AN.tracePresent(trace({ turns: [], verbs: [] })) === false);
  (function () {
    const tr = trace({ hits: [
      hit(1, 'p', 'player', 'monster', 40),
      hit(1, 'm_0', 'monster', 'player', 25),
      hit(2, 'a1', 'ally', 'monster', 15),
      hit(2, 'm_0', 'monster', 'ally', 10),
      hit(2, null, null, 'monster', 5),
    ] });
    const by = AN.damageByRound(tr);
    check('dmg-round1-sides', by[1].player === 40 && by[1].monster === 25, JSON.stringify(by[1]));
    check('dmg-round2-unknown-other', by[2].other === 5, JSON.stringify(by[2]));
  })();
  (function () {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'survivaltime-fixture-'));
    function runFile(seed, policy, tbFights, traces, kills) {
      return {
        seed: seed, policy: policy, days: 100, endReason: 'village-lost', won: false,
        scaleRank: 'regional', unlockedWave: 4, standing: 150, readiness5: { veterans: 0 },
        waveKillLog: kills || [], daily: [], instrumentErrors: [], tbFights: tbFights, traces: traces,
        wavesFaced: { strike: 2 },
      };
    }
    const tbRow = { seq: 1, day: 80, mid: 'the_congregation', wave: 4, alliesAtEntry: 1, partyAtEntry: 1, outcome: 'lost', rounds: 6 };
    const tr = trace({ tbSeq: 1, turns: [{ r: 1, actor: 'm_0' }] });
    const f1 = path.join(dir, 'a.json');
    fs.writeFileSync(f1, JSON.stringify(runFile(1, 'baseline', [tbRow], [tr])));
    const tbRow2 = { seq: 2, day: 90, mid: 'the_strike', wave: 4, alliesAtEntry: 0, partyAtEntry: 0, outcome: 'won', rounds: 3 };
    const tr2 = trace({ seq: 2, tbSeq: 2, day: 90, mid: 'the_strike', mids: ['the_strike'], entryHp: 1000,
      outcome: 'won', ending: 'kill', mHpLeft: 0, mHpLeftFrac: 0, rounds: 3, scholarHpEnd: 80, scholarHpFracEnd: 0.8,
      turns: [{ r: 1, actor: 'm_0' }] });
    const f2 = path.join(dir, 'b.json');
    fs.writeFileSync(f2, JSON.stringify(runFile(2, 'baseline', [tbRow, tbRow2], [tr, tr2],
      [{ day: 90, w: 4, by: 'scholar', mid: 'the_strike' },
       { day: 91, w: 4, by: 'scholar', mid: 'the_eater' }])));
    const legs = AN.analyzeLeg([f1, f2]);
    const L = legs.baseline;
    check('analyze-tb-fight-count', L.tbFights === 3, 'tbFights=' + L.tbFights);
    check('analyze-matched-kill-rate', L.tbKillRate === 1 / 3, 'tbKillRate=' + L.tbKillRate);
    check('analyze-log-kills-counted', L.logW4Kills === 2, 'logW4Kills=' + L.logW4Kills);
    // The prereg primary is the LOG rate (log kills / traced TB fight rows),
    // not the matched-trace rate — the two differ on midnight-spanning kills
    // (the day-91 Eater kill has no matching trace here, as in the real
    // 87004 d117/118 case): log rate 2/3 vs matched rate 1/3.
    check('analyze-log-rate-primary', L.logW4Kills / L.tbFights === 2 / 3, 'logRate=' + (L.logW4Kills / L.tbFights));
    fs.rmSync(dir, { recursive: true, force: true });
  })();

  // ---------- 6. Live driver legs (unjudged seed 55002, 90d, /tmp only) ----------
  // Seed 55002 reaches wave-4 TB fights by day 72 on the finishprobe band
  // (day-72 Congregation, 18 rounds) — a 90d smoke proves the recorder on
  // the new code without touching the judged band.
  (function () {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'survivaltime-live-'));
    const env = Object.assign({}, process.env, { REPO: REPO });
    function runDriver(extraEnv) {
      return execFileSync('node', [path.join(REPO, 'scripts', 'survivaltime-driver-20261106.js')], {
        cwd: REPO, env: Object.assign({}, env, extraEnv || {}),
        encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 600000,
      });
    }
    try {
      runDriver({ SEEDS: '55002', DAYS: '90', RUN: 'proof-baseline', OUTDIR: path.join(tmp, 'baseline') });
      const baseFile = path.join(tmp, 'baseline', 'survivaltime-s55002-proof-baseline.json');
      check('live-baseline-wrote', fs.existsSync(baseFile));
      const base = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
      const w4 = (base.traces || []).filter(function (x) { return (x.wave | 0) >= 4; });
      check('live-baseline-wave4-traces', w4.length >= 1, 'w4 traces=' + w4.length);
      check('live-baseline-traces-have-hits', w4.filter(function (x) { return (x.hits || []).length > 0; }).length >= 1);
      check('live-baseline-all-traces-classified', w4.filter(function (x) { return AN.ENDINGS.indexOf(x.ending) >= 0; }).length === w4.length);
      check('live-baseline-zero-instrument-errors', (base.instrumentErrors || []).length === 0, JSON.stringify((base.instrumentErrors || []).slice(0, 3)));

      // Determinism: same seed, second run must be byte-identical.
      runDriver({ SEEDS: '55002', DAYS: '90', RUN: 'proof-baseline', OUTDIR: path.join(tmp, 'baseline2') });
      const base2File = path.join(tmp, 'baseline2', 'survivaltime-s55002-proof-baseline.json');
      const b1 = fs.readFileSync(baseFile, 'utf8');
      const b2 = fs.readFileSync(base2File, 'utf8');
      check('live-determinism-identical', b1 === b2, 'lengths ' + b1.length + ' vs ' + b2.length);

      // Neutrality: instrument OFF must match ON on days/endReason/kill-log length.
      runDriver({ SEEDS: '55002', DAYS: '90', RUN: 'proof-baseline', OUTDIR: path.join(tmp, 'off'), SURVIVETIME_OFF: '1' });
      const off = JSON.parse(fs.readFileSync(path.join(tmp, 'off', 'survivaltime-s55002-proof-baseline.json'), 'utf8'));
      check('live-neutrality-days', off.days === base.days, 'off=' + off.days + ' on=' + base.days);
      check('live-neutrality-end', off.endReason === base.endReason, 'off=' + off.endReason + ' on=' + base.endReason);
      check('live-neutrality-kills', (off.waveKillLog || []).length === (base.waveKillLog || []).length,
        'off=' + (off.waveKillLog || []).length + ' on=' + (base.waveKillLog || []).length);
    } catch (e) {
      fail++;
      console.log('FAIL live-legs :: ' + (e && e.message ? String(e.message).slice(0, 400) : String(e)));
      if (e && e.stdout) console.log('--- driver stdout (tail) ---\n' + String(e.stdout).slice(-2000));
      if (e && e.stderr) console.log('--- driver stderr (tail) ---\n' + String(e.stderr).slice(-2000));
    } finally {
      try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
    }
  })();

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
