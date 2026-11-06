// sweep-pocketsand-20261105.js — forced-holding mechanism panel for the
// pocket_sand flee-order fix (build-smallfixes, Steve order 2026-11-05).
// Prereg: evidence/2026-11-05/smallfixes-pocketsand-prereg.md.
//
// Policy competent VERBATIM except for the observation/grant wraps below:
//  - GRANT: at the first policy.fight() call of each TB fight, the scholar
//    is force-granted pocket_sand (godpath lib giveAbility, {force:true}).
//    Wild acquisition is OUT OF SCOPE per the prereg; the panel measures the
//    ORDER fix given a held sand, not whether villagers ever earn one.
//    Both arms grant identically, so control-vs-armed stays clean; absolute
//    survival numbers are not comparable to unforced runs.
//  - OBSERVE: every policy.fight() entry records turn-start HP (the
//    prereg's pre-empted zone is turn-start HP < 35%), sand held /
//    already-pressed-this-fight / engine-available, and whether the turn
//    ended in a flee (scholar fled flag read right after fight() returns).
//    Every useAbility call is logged with the acting fighter's HP at call
//    time (within one player turn HP cannot change, so press HP ==
//    turn-start HP).
//
// CONTROL vs ARMED is by code root, not by flag: control = master
// e5e6aa59b's scripts/policies/competent.js (three files swapped to master
// for the control run — competent.js + src/js/game.js + src/js/hierarchy.js
// — then restored); armed = this branch. RUN only tags the output file.
// The trickcensus instrument rides along for exposure/flee cross-checks.
//
// PRIMARY (prereg): presses in the pre-empted zone (turn-start HP < 35%,
// sand held and available) — armed >= 50% of such turns; control expected 0.
// GO iff armed >= 50% AND control = 0.
// GUARDRAIL NOTE: "flees at <35% with NO losing ability held" is vacuous
// under forced holding (sand is held in every fight of both arms). It is
// reported instead as: flee rate on zone turns where no losing control was
// AVAILABLE (sand already spent that fight) — armed >= 0.8x control.
// Also reported: sand presses per fight (<= 1), median survival armed vs
// control (-10d), and any new loss mode (endReason census).
//
// Seeds 99421-99428 (fresh band per prereg), 140d death-aware horizon.
// Per-seed JSON to evidence/2026-11-05/perseed-smallfixes-pocketsand/;
// refuses to overwrite.
// Usage (from the worktree root):
//   SEEDS=99421,99422 RUN=control node scripts/sweep-pocketsand-20261105.js
//   SEEDS=99421,99422 RUN=armed   node scripts/sweep-pocketsand-20261105.js
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const INST = require(path.join(REPO, 'scripts', 'trickcensus-instrument-20261104'));
const LIB = require(path.join(REPO, 'scripts', 'godpath', 'lib'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '140', 10) || 140;
const RUN = process.env.RUN || 'control';
if (!SEEDS.length) { console.error('POCKETSAND STOP: SEEDS required.'); process.exit(2); }
if (RUN !== 'control' && RUN !== 'armed') { console.error('POCKETSAND STOP: RUN must be control|armed.'); process.exit(2); }
let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) {}

const outDir = path.join(REPO, 'evidence', '2026-11-05', 'perseed-smallfixes-pocketsand');
fs.mkdirSync(outDir, { recursive: true });
for (const seed of SEEDS) {
  const file = path.join(outDir, 'pocketsand-s' + seed + '-' + RUN + '.json');
  if (fs.existsSync(file)) { console.error('POCKETSAND STOP: refusing to overwrite ' + file); process.exit(3); }
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function hpPctOf(Game) {
  try {
    const p = Game.tbFighter ? Game.tbFighter('p') : null;
    if (!p) return null;
    return (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1);
  } catch (e) { return null; }
}
function scholarHolds(Game, aid) {
  try {
    const list = ((Game.state || {}).scholar || {}).abilities || [];
    return list.some(function (a) { return (typeof a === 'string' ? a : a && a.id) === aid; });
  } catch (e) { return false; }
}
function sandEngineAvailable(Game) {
  try {
    if (typeof Game.activatableAbilities !== 'function') return null;
    const list = Game.activatableAbilities() || [];
    for (const a of list) {
      if (a && (a.abilityId === 'pocket_sand' || a.id === 'pocket_sand')) return !!a.available;
    }
    return false;
  } catch (e) { return null; }
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'pocketsand-' + RUN, fullTelemetry: false });
  const errors = [];
  await setupGame(Game);
  const inst = INST.install(Game);
  const t = inst.t;
  const obs = { turns: [], presses: [], grants: 0, grantFails: 0, grantedFights: {} };

  // --- useAbility (OUTER wrap, outside the instrument's): log every press.
  const origUseAbility = Game.useAbility;
  if (typeof origUseAbility === 'function') {
    Game.useAbility = function (aid, act) {
      try {
        const fight = Game.tbfight || null;
        obs.presses.push({ day: gday(Game), fightId: fight ? (fight.id || null) : null,
          round: fight ? (fight.round != null ? fight.round : null) : null,
          hpPct: hpPctOf(Game), aid: aid != null ? String(aid) : null,
          act: act != null ? String(act) : null });
      } catch (e) { errors.push('press-log: ' + String(e.message).slice(0, 80)); }
      return origUseAbility.apply(this, arguments);
    };
  } else { errors.push('useAbility not a function at sweep install'); }

  let lastSnapDay = -1;
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) { lastSnapDay = d; inst.snapshotDaily(); }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
    fight: function (Gm, ctx) {
      let rec = null;
      try {
        const f = Game.tbfight;
        if (f && !f.over && Game.tbIsPlayerTurn && Game.tbIsPlayerTurn()) {
          // Grant once per fight, before the first decision of the fight.
          if (!obs.grantedFights[f.id]) {
            let ok = false;
            try { ok = LIB.giveAbility(Game, 'pocket_sand', { force: true }); } catch (e) { errors.push('grant: ' + String(e.message).slice(0, 80)); }
            obs.grantedFights[f.id] = !!ok;
            if (ok) obs.grants++; else obs.grantFails++;
          }
          rec = { day: gday(Game), fightId: f.id || null,
            round: (f.round != null ? f.round : null),
            hpPct: hpPctOf(Game), scholarVid: Game.villagerId || null,
            sandHeld: scholarHolds(Game, 'pocket_sand'),
            sandPressedAlready: !!(ctx && ctx._abPressed && ctx._abPressed.pocket_sand),
            sandEngineAvailable: sandEngineAvailable(Game),
            freezeHeld: scholarHolds(Game, 'freeze_tag'),
            fearHeld: scholarHolds(Game, 'fear_aura'),
            fled: false };
          obs.turns.push(rec);
        }
      } catch (e) { errors.push('fight.pre: ' + String(e.message).slice(0, 80)); }
      let r = false;
      try { r = competent.fight(Gm, ctx); } catch (e) { errors.push('fight.call: ' + String(e.message).slice(0, 80)); throw e; }
      try {
        if (rec) {
          const p = Game.tbFighter ? Game.tbFighter('p') : null;
          if (p && p.fled) rec.fled = true;
          // A barrier push that ends the fight also ends in a flee.
          if (Game.tbfight && Game.tbfight.over && p && p.fled) rec.fled = true;
        }
      } catch (e) { errors.push('fight.post: ' + String(e.message).slice(0, 80)); }
      return r;
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  try { inst.snapshotDaily(); } catch (e) {}
  try { inst.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }
  Game.useAbility = origUseAbility;

  // --- per-seed summary (all counts from the observation wraps) ---
  const zoneTurns = obs.turns.filter(function (x) { return x.hpPct != null && x.hpPct < 0.35; });
  const zoneAvail = zoneTurns.filter(function (x) { return x.sandHeld && !x.sandPressedAlready && x.sandEngineAvailable !== false; });
  const zoneNoAvail = zoneTurns.filter(function (x) { return !(x.sandHeld && !x.sandPressedAlready && x.sandEngineAvailable !== false); });
  const zonePresses = obs.presses.filter(function (x) { return x.aid === 'pocket_sand' && x.hpPct != null && x.hpPct < 0.35; });
  const zoneFlees = zoneTurns.filter(function (x) { return x.fled; });
  const zoneNoAvailFlees = zoneNoAvail.filter(function (x) { return x.fled; });
  const pressesByFight = {};
  for (const pr of obs.presses) {
    if (pr.aid !== 'pocket_sand') continue;
    const k = String(pr.fightId);
    pressesByFight[k] = (pressesByFight[k] || 0) + 1;
  }
  const sandPressFights = Object.keys(pressesByFight).length;
  const maxPressPerFight = Object.keys(pressesByFight).reduce(function (m, k) { return Math.max(m, pressesByFight[k]); }, 0);
  const st = Game.state || {};
  return {
    seed: seed, arm: 'pocketsand', run: RUN, anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost,
    maxWave: result.maxWaveUnlocked || 1,
    fightsObserved: Object.keys(obs.grantedFights).length,
    grants: obs.grants, grantFails: obs.grantFails,
    turns: obs.turns.length,
    zoneTurns: zoneTurns.length, zoneAvailTurns: zoneAvail.length,
    zoneNoAvailTurns: zoneNoAvail.length,
    zonePresses: zonePresses.length,
    pressRateZoneAvail: zoneAvail.length ? (zonePresses.length / zoneAvail.length) : null,
    zoneFlees: zoneFlees.length,
    zoneNoAvailFlees: zoneNoAvailFlees.length,
    fleeRateZoneNoAvail: zoneNoAvail.length ? (zoneNoAvailFlees.length / zoneNoAvail.length) : null,
    sandPressFights: sandPressFights, maxPressPerFight: maxPressPerFight,
    exposureCount: (t.exposures || []).length,
    instrumentErrors: (t.instrumentErrors || []).concat(errors),
    turnLog: obs.turns, pressLog: obs.presses,
    exposures: t.exposures,
  };
}

(async function () {
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'pocketsand-s' + seed + '-' + RUN + '.json');
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, run: RUN, days: out.days, end: out.endReason,
      fights: out.fightsObserved, turns: out.turns,
      zoneTurns: out.zoneTurns, zoneAvail: out.zoneAvailTurns,
      zonePresses: out.zonePresses, pressRate: out.pressRateZoneAvail,
      zoneFlees: out.zoneFlees, zoneNoAvailFlees: out.zoneNoAvailFlees,
      fleeRateNoAvail: out.fleeRateZoneNoAvail,
      maxPressPerFight: out.maxPressPerFight,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
