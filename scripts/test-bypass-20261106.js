// test-bypass-20261106.js — proof for the bypass-damage mitigation lever
// (arm sim-bypass-b, run fleshout-loop-b-20261106T2300Z).
//
// The lever: scripted lethal hits (Eulogy narrated ending, Finale title
// card) are flagged opts.bypassDamage by their callers and capped in
// Game.tbDamage — after ALL mitigation, before HP is removed — at 50%
// of the target's max HP. The proof demonstrates the OBSERVABLE effect,
// not just green assertions:
//   1. REAL tbDamage: a Eulogy-shaped doom hit (9999 requested, P=27,
//      pierce 0.3) on a 100-HP scholar takes 50 HP, not ~2409 — the
//      scholar survives the ending at half health. A second firing
//      takes the other half: doom still kills within two firings.
//   2. The Finale-shaped card (175 requested, P=27, pierce 0.75) takes
//      50, not 82; at godhood armor (P=138) it takes 26, under the cap,
//      unchanged.
//   3. The flag gates the cap: the SAME 9999 hit WITHOUT the flag takes
//      2409. Ordinary hits (62 requested) take 16 with or without it.
//   4. The cap is the TARGET's half-life: a maxHp-80 fighter caps at
//      40; a naked scholar caps at 50 too (the cap is a property of
//      the scripted hit, not of gear). Villager parity where present.
//   5. Wiring: exactly two call sites flag bypassDamage (Eulogy doom,
//      Finale card); the cap lives in tbDamage after mitigation.
//   6. Analyzer fixtures: legs group by run.run (not policy — the
//      survivaltime analyzer merged both legs); the pyrrhic match is
//      the midnightkill ±1-day join with a same-beast guard.
//   7. Live driver legs (unjudged seed 55002, 90d, /tmp only): the
//      instrument still records wave-4 TB fights on the new code with
//      zero errors; determinism and neutrality hold.
// Usage: node scripts/test-bypass-20261106.js
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'bypass-analyze-20261106'));
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// The UNCAPPED number, as the control: armor curve K=6, same shape as
// Game.armorReduction (prot*(1-pierce), K=6), min(hit-1, ...) clamp.
function uncappedApplied(P, hit, pierce) {
  const p = Math.max(0, P || 0);
  if (!(p > 0) || !(hit > 0)) return hit;
  const pr = Math.min(0.9, Math.max(0, pierce || 0));
  const effP = p * (1 - pr);
  const r = effP / (effP + 6);
  return hit - Math.min(hit - 1, Math.round(hit * r));
}

(async () => {
  const { Game } = await loadGame({ seed: 7, mode: 'test' });
  await setupGame(Game);
  const osay = Game.say; Game.say = function () {};

  Game.startCombat('hummice');
  if (!Game.tbfight) { console.log('FAIL setup: no fight'); process.exit(1); }
  const p = Game.tbFighter('p');
  const m = Game.tbfight.fighters.find(x => x.kind === 'monster');
  function capHit(P, hit, pierce, hp, maxHp, flagged) {
    Game.armorBonus = () => P;
    try { if (m && m.mdef) m.mdef.pierce = pierce; } catch (e) {}
    p.hp = hp; p.maxHp = maxHp; p.alive = true;
    const opts = { undodgeable: true, quiet: true };
    if (flagged) opts.bypassDamage = true;
    return Game.tbDamage('p', hit, 'test-doom', m ? m.key : null, opts);
  }

  // ---------- 1. The Eulogy-shaped doom hit ----------
  const doomUncapped = uncappedApplied(27, 9999, 0.3);
  check('doom-uncapped-control-is-2409', doomUncapped === 2409, 'control ' + doomUncapped);
  const doomTaken = capHit(27, 9999, 0.3, 100, 100, true);
  check('live-doom-hit-takes-50', doomTaken === 50, 'took ' + doomTaken);
  check('live-doom-scholar-survives-at-half', p.hp === 50, 'hp=' + p.hp);
  // A second firing takes the other half: doom still kills within two firings.
  const doomTaken2 = capHit(27, 9999, 0.3, 50, 100, true);
  check('live-doom-second-firing-takes-50', doomTaken2 === 50, 'took ' + doomTaken2);
  check('live-doom-second-firing-kills', p.hp === 0, 'hp=' + p.hp);

  // ---------- 2. The Finale-shaped title card ----------
  const cardUncapped = uncappedApplied(27, 175, 0.75);
  check('card-uncapped-control-is-82', cardUncapped === 82, 'control ' + cardUncapped);
  const cardTaken = capHit(27, 175, 0.75, 100, 100, true);
  check('live-card-takes-50', cardTaken === 50, 'took ' + cardTaken);
  // Godhood armor: the card lands under the cap, unchanged.
  const cardGodUncapped = uncappedApplied(138, 175, 0.75);
  check('card-godhood-control-is-26', cardGodUncapped === 26, 'control ' + cardGodUncapped);
  const cardGodTaken = capHit(138, 175, 0.75, 100, 100, true);
  check('live-card-godhood-takes-26-unchanged', cardGodTaken === 26, 'took ' + cardGodTaken);

  // ---------- 3. The flag gates the cap ----------
  const doomUnflagged = capHit(27, 9999, 0.3, 5000, 5000, false);
  check('live-unflagged-doom-takes-2409', doomUnflagged === 2409, 'took ' + doomUnflagged);
  const ordinary = capHit(27, 62, 0.35, 100, 100, false);
  check('live-ordinary-hit-takes-16', ordinary === 16, 'took ' + ordinary);
  const ordinaryFlagged = capHit(27, 62, 0.35, 100, 100, true);
  check('live-ordinary-flagged-still-16', ordinaryFlagged === 16, 'took ' + ordinaryFlagged);

  // ---------- 4. The cap is the target's half-life; naked caps too ----------
  const smallTaken = capHit(27, 9999, 0.3, 80, 80, true);
  check('live-maxhp-80-caps-at-40', smallTaken === 40, 'took ' + smallTaken);
  const nakedTaken = capHit(0, 9999, 0.3, 100, 100, true);
  check('live-naked-doom-caps-at-50', nakedTaken === 50, 'took ' + nakedTaken);
  check('live-chip-1-lands', capHit(27, 1, 0.3, 100, 100, true) === 1);
  const v = Game.tbfight.fighters.find(x => x.kind === 'villager');
  if (v) {
    v.varmor = 27; v.hp = 80; v.maxHp = 80; v.alive = true;
    try { if (m && m.mdef) m.mdef.pierce = 0.3; } catch (e) {}
    const vTaken = Game.tbDamage(v.key, 9999, 'test-doom', m ? m.key : null,
      { undodgeable: true, quiet: true, bypassDamage: true });
    check('live-villager-maxhp-80-caps-at-40', vTaken === 40, 'took ' + vTaken);
  } else {
    console.log('(no villager fighter in test fight — villager cap covered by the maxHp-80 player leg + wiring check)');
  }
  Game.say = osay;

  // ---------- 5. Wiring: exactly two flagged call sites ----------
  const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  const sigW4Src = fs.readFileSync(path.join(REPO, 'src', 'js', 'sigW4.js'), 'utf8');
  const sigW5Src = fs.readFileSync(path.join(REPO, 'src', 'js', 'sigW5.js'), 'utf8');
  check('wire-cap-in-tbdamage', /opts\.bypassDamage/.test(gameSrc));
  check('wire-cap-is-half-maxhp', /Math\.floor\(\(t\.maxHp \|\| 100\) \/ 2\)/.test(gameSrc));
  check('wire-eulogy-flagged', /the narrated ending', m\.key \|\| 'm0', \{ quiet: true, bypassDamage: true \}/.test(sigW4Src));
  check('wire-finale-flagged', /the falling title card', m\.key, \{ undodgeable: true, sigW5NoMult: true, bypassDamage: true \}/.test(sigW5Src));
  // Three occurrences of the flag across two scripted hits: the Eulogy
  // doom carries it in BOTH branches of its maybeCheatDeath if/else
  // (only one fires per execution), the Finale card once.
  let flaggedW4 = (sigW4Src.match(/bypassDamage: true/g) || []).length;
  let flaggedW5 = (sigW5Src.match(/bypassDamage: true/g) || []).length;
  check('wire-eulogy-both-branches-flagged', flaggedW4 === 2, 'sites=' + flaggedW4);
  check('wire-finale-once-flagged', flaggedW5 === 1, 'sites=' + flaggedW5);
  let flaggedSites = 0;
  ['game.js', 'sigW4.js', 'sigW5.js', 'finale-campaign.js'].forEach(function (f) {
    const s = fs.readFileSync(path.join(REPO, 'src', 'js', f), 'utf8');
    flaggedSites += (s.match(/bypassDamage: true/g) || []).length;
  });
  check('wire-three-flagged-occurrences-total', flaggedSites === 3, 'sites=' + flaggedSites);
  check('wire-no-other-bypass-flag', !/bypassDamage/.test(fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8')));

  // ---------- 6. Analyzer fixtures: leg split + ±1-day join ----------
  function trace(opts) {
    const o = opts || {};
    return Object.assign({
      seq: 1, tbSeq: 1, day: 80, mid: 'the_congregation', mids: ['the_congregation'], wave: 4,
      entryHp: 1000, entryMaxHp: 1000, entryFrac: 1, fighters: ['scholar', 'ally1'],
      alliesAtEntry: 1, partyAtEntry: 1, hits: [], turns: [{ r: 1, actor: 'm_0' }], verbs: [],
      outcome: 'lost', ending: 'scholar-death', mHpLeft: 800, mHpLeftFrac: 0.8,
      rounds: 6, scholarHpEnd: 0, scholarHpFracEnd: 0,
      rallyRound: null, rallyOk: null, scholarStruckRallyRound: null,
    }, o);
  }
  (function () {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bypass-fixture-'));
    function runFile(seed, run, tbFights, traces, kills) {
      return {
        seed: seed, run: run, policy: 'baseline', arm: 'bypass', days: 100,
        endReason: 'village-lost', won: false, scaleRank: 'regional',
        unlockedWave: 4, standing: 150, readiness5: { veterans: 0 },
        waveKillLog: kills || [], daily: [], instrumentErrors: [],
        tbFights: tbFights, traces: traces, wavesFaced: {},
      };
    }
    const tbRow = { seq: 1, day: 80, mid: 'the_congregation', wave: 4, alliesAtEntry: 1, partyAtEntry: 1, outcome: 'lost', rounds: 6 };
    const f1 = path.join(dir, 'a.json');
    fs.writeFileSync(f1, JSON.stringify(runFile(1, 'bypass-baseline', [tbRow], [trace({})])));
    const f2 = path.join(dir, 'b.json');
    fs.writeFileSync(f2, JSON.stringify(runFile(2, 'bypass-armed', [tbRow], [trace({})])));
    const legs = AN.analyzeLeg([f1, f2]);
    // LEG GROUPING FIX: same policy on both files must NOT merge them.
    check('analyze-legs-split-by-run', Object.keys(legs).sort().join(',') === 'bypass-armed,bypass-baseline',
      'legs=' + Object.keys(legs).join(','));
    check('analyze-baseline-one-fight', legs['bypass-baseline'] && legs['bypass-baseline'].tbFights === 1);
    check('analyze-armed-one-fight', legs['bypass-armed'] && legs['bypass-armed'].tbFights === 1);
    fs.rmSync(dir, { recursive: true, force: true });
  })();
  (function () {
    // ±1-DAY PYRRHIC JOIN: an 'unfinished' trace on day 80 with a log kill
    // on day 81 (same beast, killer fought here) counts; a day-81 kill of
    // a DIFFERENT beast does not; same-day still counts.
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bypass-fixture2-'));
    function runFile(seed, traces, kills) {
      return {
        seed: seed, run: 'bypass-armed', policy: 'baseline', arm: 'bypass', days: 100,
        endReason: 'village-lost', won: false, scaleRank: 'regional',
        unlockedWave: 4, standing: 150, readiness5: { veterans: 0 },
        waveKillLog: kills || [], daily: [], instrumentErrors: [],
        tbFights: [{ seq: 1, day: 80, mid: 'eulogy', wave: 4, alliesAtEntry: 0, partyAtEntry: 0, outcome: 'won', rounds: 6 }],
        traces: traces, wavesFaced: {},
      };
    }
    const trMidnight = trace({ seq: 1, tbSeq: 1, day: 80, mid: 'eulogy', mids: ['eulogy'],
      outcome: 'won', ending: 'unfinished', rounds: 6 });
    const f1 = path.join(dir, 'a.json');
    fs.writeFileSync(f1, JSON.stringify(runFile(1, [trMidnight],
      [{ d: 81, mid: 'eulogy', w: 4, by: 'scholar' }])));
    const legs1 = AN.analyzeLeg([f1]);
    check('analyze-midnight-kill-matched', legs1['bypass-armed'].tbKillMatched === 1,
      'matched=' + legs1['bypass-armed'].tbKillMatched);
    const trWrongBeast = trace({ seq: 1, tbSeq: 1, day: 80, mid: 'eulogy', mids: ['eulogy'],
      outcome: 'won', ending: 'unfinished', rounds: 6 });
    const f2 = path.join(dir, 'b.json');
    fs.writeFileSync(f2, JSON.stringify(runFile(2, [trWrongBeast],
      [{ d: 81, mid: 'the_strike', w: 4, by: 'scholar' }])));
    const legs2 = AN.analyzeLeg([f2]);
    check('analyze-wrong-beast-not-matched', legs2['bypass-armed'].tbKillMatched === 0,
      'matched=' + legs2['bypass-armed'].tbKillMatched);
    const trSameDay = trace({ seq: 1, tbSeq: 1, day: 80, mid: 'eulogy', mids: ['eulogy'],
      outcome: 'won', ending: 'unfinished', rounds: 6 });
    const f3 = path.join(dir, 'c.json');
    fs.writeFileSync(f3, JSON.stringify(runFile(3, [trSameDay],
      [{ d: 80, mid: 'eulogy', w: 4, by: 'scholar' }])));
    const legs3 = AN.analyzeLeg([f3]);
    check('analyze-same-day-still-matched', legs3['bypass-armed'].tbKillMatched === 1,
      'matched=' + legs3['bypass-armed'].tbKillMatched);
    fs.rmSync(dir, { recursive: true, force: true });
  })();

  // ---------- 7. Live driver legs (unjudged seed 55002, 90d, /tmp only) ----------
  (function () {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bypass-live-'));
    const env = Object.assign({}, process.env, { REPO: REPO });
    function runDriver(extraEnv) {
      return execFileSync('node', [path.join(REPO, 'scripts', 'bypass-driver-20261106.js')], {
        cwd: REPO, env: Object.assign({}, env, extraEnv || {}),
        encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 600000,
      });
    }
    try {
      runDriver({ SEEDS: '55002', DAYS: '90', RUN: 'proof-baseline', OUTDIR: path.join(tmp, 'baseline') });
      const baseFile = path.join(tmp, 'baseline', 'bypass-s55002-proof-baseline.json');
      check('live-baseline-wrote', fs.existsSync(baseFile));
      const base = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
      const w4 = (base.traces || []).filter(function (x) { return (x.wave | 0) >= 4; });
      check('live-baseline-wave4-traces', w4.length >= 1, 'w4 traces=' + w4.length);
      check('live-baseline-traces-have-hits', w4.filter(function (x) { return (x.hits || []).length > 0; }).length >= 1);
      check('live-baseline-all-traces-classified', w4.filter(function (x) { return AN.ENDINGS.indexOf(x.ending) >= 0; }).length === w4.length);
      check('live-baseline-zero-instrument-errors', (base.instrumentErrors || []).length === 0, JSON.stringify((base.instrumentErrors || []).slice(0, 3)));

      // Determinism: same seed, second run must be byte-identical.
      runDriver({ SEEDS: '55002', DAYS: '90', RUN: 'proof-baseline', OUTDIR: path.join(tmp, 'baseline2') });
      const base2File = path.join(tmp, 'baseline2', 'bypass-s55002-proof-baseline.json');
      const b1 = fs.readFileSync(baseFile, 'utf8');
      const b2 = fs.readFileSync(base2File, 'utf8');
      check('live-determinism-identical', b1 === b2, 'lengths ' + b1.length + ' vs ' + b2.length);

      // Neutrality: instrument OFF must match ON on days/endReason/kill-log length.
      runDriver({ SEEDS: '55002', DAYS: '90', RUN: 'proof-baseline', OUTDIR: path.join(tmp, 'off'), BYPASS_OFF: '1' });
      const off = JSON.parse(fs.readFileSync(path.join(tmp, 'off', 'bypass-s55002-proof-baseline.json'), 'utf8'));
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
