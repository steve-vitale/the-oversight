// test-finishing-instrument-20261105.js — proof for the finishing
// instrument (arm build-finish-instrument): live harness legs (field fight
// + player TB fight against a real wave-4 monster), analyzer fixtures, and
// an off/on neutrality leg via the driver into /tmp (never into evidence/).
// Exit non-zero on any failure.
// Usage: node scripts/test-finishing-instrument-20261105.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'finishing-instrument-analyze-20261105'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

function sum(xs) { return xs.reduce(function (s, x) { return s + (x || 0); }, 0); }

async function liveLegs() {
  const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { Game } = await loadGame({ seed: 99311, mode: 'competent-finish-instrument-proof', fullTelemetry: true });
  await setupGame(Game);

  check('module-loaded', typeof Game.finishLogField === 'function' && typeof Game.finishLogCloseOpen === 'function' && Array.isArray(Game._finishLog),
    'finishLogField=' + typeof Game.finishLogField + ' ring=' + JSON.stringify(Game._finishLog));
  check('ring-empty-at-start', (Game._finishLog || []).length === 0, 'n=' + (Game._finishLog || []).length);

  const mdef4 = (Game.data.monsters || []).find(function (m) { return m && m.id === 'congregation'; });
  const mdef3 = (Game.data.monsters || []).find(function (m) { return m && m.id === 'spool'; });
  check('fixtures-found', !!mdef4 && mdef4.wave === 4 && !!mdef3 && mdef3.wave === 3,
    'w4=' + (mdef4 && mdef4.wave) + ' w3=' + (mdef3 && mdef3.wave));
  const roster = ((Game.state.village || {}).roster || []).slice();
  const vid = roster.find(function (id) { return id && id !== Game.villagerId; });
  check('villager-found', !!vid, 'roster=' + roster.length);

  // ---- live field fight, wave 4 ----
  const ringBefore = Game._finishLog.length;
  let rec = null;
  try { rec = Game.fieldFight(vid, mdef4, null, {}); } catch (e) { check('field-no-throw', false, e.stack); }
  check('field-returned', !!rec && typeof rec.outcome === 'string', 'outcome=' + (rec && rec.outcome));
  check('field-rounds', !!rec && (rec.rounds | 0) >= 1, 'rounds=' + (rec && rec.rounds));
  check('field-roundsDetail-complete', !!rec && Array.isArray(rec.roundsDetail) && rec.roundsDetail.length === (rec.rounds | 0) &&
    rec.roundsDetail.every(function (r, i) { return r.round === i + 1; }),
    'len=' + (rec && rec.roundsDetail && rec.roundsDetail.length) + ' rounds=' + (rec && rec.rounds));
  if (rec && rec.roundsDetail) {
    const dealtSum = sum(rec.roundsDetail.map(function (r) { return r.dealt; }));
    check('field-dealt-book', dealtSum + (rec.flPreRoundDealt | 0) === (rec.mDealt | 0),
      'rounds=' + dealtSum + ' pre=' + (rec.flPreRoundDealt | 0) + ' total=' + rec.mDealt);
    const takenSum = sum(rec.roundsDetail.map(function (r) { return r.taken; }));
    check('field-taken-book', takenSum === (rec.vTaken | 0), 'rounds=' + takenSum + ' total=' + rec.vTaken);
    let chainOk = true;
    for (let i = 1; i < rec.roundsDetail.length; i++) {
      if (rec.roundsDetail[i].vHpStart !== rec.roundsDetail[i - 1].vHpEnd) chainOk = false;
      if (rec.roundsDetail[i].mHpStart !== rec.roundsDetail[i - 1].mHpEnd) chainOk = false;
    }
    check('field-hp-chain', chainOk, JSON.stringify(rec.roundsDetail.map(function (r) { return [r.vHpStart, r.vHpEnd, r.mHpStart, r.mHpEnd]; })));
  }
  check('field-ring-grew', Game._finishLog.length === ringBefore + 1, 'before=' + ringBefore + ' after=' + Game._finishLog.length);
  const frec = Game._finishLog[Game._finishLog.length - 1];
  check('field-record-shape', !!frec && frec.channel === 'field' && frec.mid === 'congregation' && frec.wave === 4 &&
    Array.isArray(frec.last3) && frec.last3.length === Math.min(3, frec.rounds) &&
    ['kill', 'flee', 'death', 'timeout', 'evade', 'other'].indexOf(frec.ending) >= 0,
    JSON.stringify(frec && { channel: frec.channel, ending: frec.ending, rounds: frec.rounds, last3: frec.last3.length }));
  const tele = (Game.state.telemetry || []).filter(function (t) { return t && t.type === 'fight_finish'; });
  check('field-telemetry-event', tele.length >= 1 && tele[tele.length - 1].mid === 'congregation',
    'fight_finish events=' + tele.length);

  // ---- wave-3 field fight must NOT be recorded ----
  const ringMid = Game._finishLog.length;
  let rec3 = null;
  try { rec3 = Game.fieldFight(vid, mdef3, null, {}); } catch (e) { check('field3-no-throw', false, e.stack); }
  check('field3-returned', !!rec3 && typeof rec3.outcome === 'string');
  check('field-wave3-skipped', Game._finishLog.length === ringMid, 'before=' + ringMid + ' after=' + Game._finishLog.length);

  // ---- live player TB fight, wave 4 ----
  const tbBefore = Game._finishLog.length;
  let tbStarted = false;
  try { Game.startCombat('congregation'); tbStarted = !!Game.tbfight; } catch (e) { check('tb-start-no-throw', false, e.stack); }
  check('tb-started', tbStarted, 'tbfight=' + !!Game.tbfight);
  if (tbStarted) {
    let guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 500) {
      try {
        if (Game.tbIsPlayerTurn()) {
          const f = Game.tbfight;
          const mon = (f.fighters || []).find(function (x) { return x && x.kind === 'monster' && x.alive; });
          if (!mon) break;
          try { Game.tbPlayerStrike(mon.key); } catch (e) {}
          try { if (Game.tbfight && !Game.tbfight.over && Game.tbIsPlayerTurn()) Game.tbAdvance(); } catch (e) {}
        } else {
          Game.tbAdvance();
        }
      } catch (e) { check('tb-drive-no-throw', false, e.stack); break; }
    }
    check('tb-ended', !Game.tbfight || !!Game.tbfight.over, 'guard=' + guard + ' over=' + (Game.tbfight && Game.tbfight.over));
    check('tb-ring-grew', Game._finishLog.length === tbBefore + 1, 'before=' + tbBefore + ' after=' + Game._finishLog.length);
    const trec = Game._finishLog[Game._finishLog.length - 1];
    check('tb-record-shape', !!trec && trec.channel === 'player-tb' && trec.mid === 'congregation' && trec.wave === 4 &&
      Array.isArray(trec.roundsDetail) && trec.roundsDetail.length >= 1 &&
      trec.roundsDetail.every(function (r, i) { return i === 0 || r.round === trec.roundsDetail[i - 1].round + 1; }) &&
      Array.isArray(trec.last3) && trec.last3.length === Math.min(3, trec.roundsDetail.length) &&
      ['kill', 'rout', 'flee', 'death', 'other'].indexOf(trec.ending) >= 0,
      JSON.stringify(trec && { ending: trec.ending, outcomeRaw: trec.outcomeRaw, rounds: trec.rounds, rdLen: trec.roundsDetail.length }));
    const tele2 = (Game.state.telemetry || []).filter(function (t) { return t && t.type === 'fight_finish'; });
    check('tb-telemetry-event', tele2.length >= 2, 'fight_finish events=' + tele2.length);
  }
  check('instrument-errors-empty', (Game._finishLogErrors || []).length === 0, JSON.stringify(Game._finishLogErrors));
}

// ---- analyzer fixtures ----
(function () {
  function seedOut(fights, log) {
    return { seed: 1, days: 100, endReason: 'horizon', won: false, maxWave: 4, standing: 120,
      fights: fights, teleFinishCount: fights.length,
      teleFinish: fights.map(function (f) { return { type: 'fight_finish', channel: f.channel, day: f.day, mid: f.mid, rounds: f.rounds }; }),
      waveKillLog: log || [], instrumentErrors: [] };
  }
  function fieldFight(o) {
    const base = { channel: 'field', day: 20, fighter: 'leader', fighters: ['leader'], mid: 'congregation', wave: 4,
      entryHp: 1000, entryVHp: 100, rounds: 3, roundsDetail: [
        { round: 1, vHpStart: 100, mHpStart: 1000, allyHpStart: null, vHpEnd: 90, mHpEnd: 990, allyHpEnd: null, mHpTotalEnd: 990, dealt: 10, taken: 10, allyDealt: 0, allyTaken: 0, abilities: [], tricks: [] },
        { round: 2, vHpStart: 90, mHpStart: 990, allyHpStart: null, vHpEnd: 75, mHpEnd: 970, allyHpEnd: null, mHpTotalEnd: 970, dealt: 20, taken: 15, allyDealt: 0, allyTaken: 0, abilities: [], tricks: [] },
        { round: 3, vHpStart: 75, mHpStart: 970, allyHpStart: null, vHpEnd: 60, mHpEnd: 940, allyHpEnd: null, mHpTotalEnd: 940, dealt: 30, taken: 15, allyDealt: 0, allyTaken: 0, abilities: [], tricks: [] },
      ],
      last3: null, outcomeRaw: 'vFlee', ending: 'flee', roundCap: false, damageDealt: 60, damageFrac: 0.06,
      preRoundDealt: 0, vTaken: 40, allyDealt: 0, allyTaken: 0, abilitiesUsed: [], tricks: [] };
    const f = Object.assign(base, o || {});
    f.last3 = f.roundsDetail.slice(-3);
    return f;
  }
  const good = seedOut([fieldFight()]);
  const s = AN.analyzeSeed(JSON.parse(JSON.stringify(good)));
  check('analyzer-good-clean', s.coverageProblems.length === 0 && s.fights[0].coverageProblems.length === 0,
    JSON.stringify(s.coverageProblems));
  check('analyzer-kill-rate', s.w4killsLog === 0, 'log=' + s.w4killsLog);

  const broken = fieldFight();
  broken.roundsDetail[1].vHpStart = 999; // breaks the HP chain
  const s2 = AN.analyzeSeed(seedOut([broken]));
  check('analyzer-flags-broken-chain', s2.coverageProblems.length === 1 && /vHp-chain/.test(s2.coverageProblems[0]),
    JSON.stringify(s2.coverageProblems));

  const short = fieldFight();
  short.roundsDetail = short.roundsDetail.slice(0, 2); // 2 entries for 3 rounds
  short.last3 = short.roundsDetail.slice(-3);
  const s3 = AN.analyzeSeed(seedOut([short]));
  check('analyzer-flags-short-rounds', s3.coverageProblems.some(function (p) { return /roundsDetail-length/.test(p); }),
    JSON.stringify(s3.coverageProblems));

  // Strict kill cross-check: a same-day same-monster log row with a killer
  // outside the fight's fighters is unmatched, never assigned.
  const killRow = { d: 20, mid: 'congregation', w: 4, by: 'outsider', via: 'wild', trick: null };
  const s4 = AN.analyzeSeed(seedOut([fieldFight({ ending: 'kill', outcomeRaw: 'vKill' })], [killRow]));
  check('analyzer-unmatched-kill', s4.unmatchedKills.length === 1, JSON.stringify(s4.unmatchedKills));
  const s5 = AN.analyzeSeed(seedOut([fieldFight({ ending: 'kill', outcomeRaw: 'vKill', fighters: ['leader', 'outsider'] })], [killRow]));
  check('analyzer-matched-kill', s5.unmatchedKills.length === 0, JSON.stringify(s5.unmatchedKills));

  check('analyzer-exports', typeof AN.analyzeDir === 'function' && typeof AN.analyzeSeed === 'function');
})();

async function neutralityLeg() {
  const tmp = '/tmp/finish-proof-' + process.pid;
  fs.mkdirSync(tmp, { recursive: true });
  const envBase = Object.assign({}, process.env, { REPO: REPO, DAYS: '10', SEEDS: '99311', OUTDIR: tmp });
  execSync('node scripts/finishing-instrument-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-off', FINISHLOG_OFF: '1' }), stdio: 'pipe' });
  execSync('node scripts/finishing-instrument-driver-20261105.js', { cwd: REPO, env: Object.assign({}, envBase, { RUN: 'proof-on' }), stdio: 'pipe' });
  const off = JSON.parse(fs.readFileSync(path.join(tmp, 'finish-instrument-s99311-proof-off.json'), 'utf8'));
  const on = JSON.parse(fs.readFileSync(path.join(tmp, 'finish-instrument-s99311-proof-on.json'), 'utf8'));
  check('neutrality-off-on', off.days === on.days && off.endReason === on.endReason &&
    (off.waveKillLog || []).length === (on.waveKillLog || []).length &&
    on.instrumentErrors.length === 0 && off.fights.length === 0,
    'off=' + off.days + '/' + off.endReason + '/' + (off.waveKillLog || []).length +
    ' on=' + on.days + '/' + on.endReason + '/' + (on.waveKillLog || []).length +
    ' errs=' + JSON.stringify(on.instrumentErrors) + ' offFights=' + off.fights.length);
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}

  console.log(pass + '/' + (pass + fail) + ' PASS');
  process.exit(fail ? 1 : 0);
}

liveLegs().then(neutralityLeg).catch(function (e) { console.error(e.stack); process.exit(1); });
