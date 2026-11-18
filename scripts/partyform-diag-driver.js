// partyform-diag-driver.js — DIAGNOSTIC instrument, arm sim-partyform-diag-a
// Finding #2547: why a party-stage plan with a willing, geared holder
// finds NO companion in 35 days (Yuki Mori, seed 104607, d106-140).
//
// DIAGNOSTIC-ONLY harness: run ONLY with the seedplan fix staged in
// the worktree (src/js/game.js WILDSEEDPLAN call sites, env-gated,
// HELD on branch sim-wildavoid-seedplan-b, NOT on master). The driver
// itself changes no game code: every wrap is a pure read + counter
// (no state writes, no RNG). The staged game.js diff is REVERTED
// before any commit carrying diag results.
//
// Instruments, per wave-4 plan holder per day:
//   - dawn-path call counters: objRefreshPick (dawn?), objPick,
//     vbrainShouldRefresh (+result), vbrainScorePick (win-plan
//     candidates carried), winPlanDepart (+result), winPlanHavenTick,
//     vbrainExecuteDepart (+result), winPlanSeedFromFight (seeds)
//   - daily holder snapshot: away entry (purpose/sinceDay/duration),
//     objective (kind/state/purpose/indoor), node vs Haven, profile,
//     range (npcMaxDist), health, sick, gear, plan stage/target/party,
//     companion-pool first-fail counts + eligible list (poolReplica),
//     holder launch block (deriveLaunchBlock)
// Policy: competent verbatim, 150d death-aware.
// Env (same as the seedplan-b arm leg):
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 WILDAVOID=1 WILDSEEDPLAN=1 MODE=arm OUTDIR=perseed-partyform-diag-a SEEDS=104601,...,104608 RUN=partyform-a node scripts/partyform-diag-driver.js
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'partyform-a';
const MODE = process.env.MODE || 'arm';
const OUTDIR = process.env.OUTDIR || ('perseed-partyform-diag-a');

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex').slice(0, 12); } catch (e) {}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) { const t0 = process.hrtime.bigint(); while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {} }
}
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 480; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
        const back = fs.readFileSync(filePath, 'utf8');
        if (back.length !== data.length) throw new Error('readback length mismatch');
        return;
      }
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return;
    } catch (e) {
      if (i === 479) { process.stdout.write('@@FALLBACK ' + filePath + '\n' + data + '\n'); return; }
      sleepMs(250);
    }
  }
}

const W4_IDS_FROZEN = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'];
function loadWave4Ids() {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    return list.filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) { return W4_IDS_FROZEN.slice().sort(); }
}
const W4_SET = new Set(loadWave4Ids());
function planIsWave4(Game, plan) {
  if (!plan) return false;
  if ((plan.needWave | 0) >= 4) return true;
  return !!(plan.target && W4_SET.has(plan.target));
}

// gearOfReplica / poolReplica / deriveLaunchBlock: pure-read replicas
// copied from scripts/wildavoid-driver-seedplan-b.js (same check order,
// same defaults) so the diag counts are comparable with the seedplan-b
// corpus. NEVER call findCompanion — module-internal in both
// villager-brain.js and win-plan.js.
function gearOfReplica(Game, vid) {
  try {
    const person = (Game.getPerson ? Game.getPerson(vid) : null) || (Game.vpOf ? Game.vpOf(vid) : null);
    if (!person) return { armed: false, armored: false, armorP: 0, weaponB: 0 };
    const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
    const eq = S.equipment || null;
    const items = Game.data ? Game.data.items : [];
    let armorP = 0, weaponB = 0;
    try { armorP = (eq && eq.armorOf) ? (eq.armorOf(person, items) || 0) : 0; } catch (e) {}
    try { weaponB = (eq && eq.weaponBonusOf) ? (eq.weaponBonusOf(person, items) || 0) : 0; } catch (e) {}
    let carriesWeapon = false;
    try {
      for (let i = 0; i < ((person.items || []).length); i++) {
        const iid = person.items[i] && (person.items[i].itemId || person.items[i].id || person.items[i]);
        let def = null;
        for (let j = 0; j < items.length; j++) if (items[j] && items[j].id === iid) { def = items[j]; break; }
        if (def && def.weapon) { carriesWeapon = true; break; }
      }
    } catch (e) {}
    return { armed: !!(weaponB > 0 || carriesWeapon), armored: armorP > 0, armorP: armorP, weaponB: weaponB };
  } catch (e) { return { armed: false, armored: false, armorP: 0, weaponB: 0 }; }
}
function poolReplica(Game, vid) {
  try {
    const v = (Game.state || {}).village || null;
    if (!v) return null;
    const roster = v.roster || [];
    const trust = v.trust || {};
    const away = v.away || {};
    const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
    const counts = { selfOrScholar: 0, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 0 };
    const fails = {};
    const eligible = [];
    const members = [];
    let agency = null;
    try { agency = (Game.agencyState && Game.agencyState()) || null; } catch (e) { agency = null; }
    for (let i = 0; i < roster.length; i++) {
      const cid = roster[i];
      if (!cid || cid === vid || cid === Game.villagerId) {
        counts.selfOrScholar++;
        if (cid) fails[cid] = 'selfOrScholar';
        members.push({ id: cid || null, profile: null, trust: 10, trustRaw: null, node: null,
          away: false, engaged: false, onExped: false, alive: true, firstFail: 'selfOrScholar' });
        continue;
      }
      let dead = false;
      try { const p = Game.getPerson ? Game.getPerson(cid) : null; dead = !!(p && p.dead); } catch (e) { dead = false; }
      const isAway = !!away[cid];
      const trustRaw = (trust[cid] === undefined ? null : trust[cid]);
      const t = (trustRaw === null ? 10 : trustRaw);
      let node = null;
      try { const n = Game.npcNode ? Game.npcNode(cid) : null; if (n) node = { nx: n.nx, ny: n.ny }; } catch (e) { node = null; }
      const atHaven = !!(node && node.nx === hx && node.ny === hy);
      let engaged = false;
      try { engaged = !!(Game.isEngaged && Game.isEngaged(cid)); } catch (e) { engaged = false; }
      let prof = null;
      try { prof = Game.npcRangeProfile ? Game.npcRangeProfile(cid) : null; } catch (e) { prof = null; }
      const onExped = !!(agency && agency.exped && agency.exped[cid]);
      let firstFail = null;
      if (dead) { counts.dead++; firstFail = 'dead'; }
      else if (isAway) { counts.away++; firstFail = 'away'; }
      else if (t < 15) { counts.trustLow++; firstFail = 'trustLow'; }
      else if (!atHaven) { counts.notAtHaven++; firstFail = 'notAtHaven'; }
      else if (engaged) { counts.engaged++; firstFail = 'engaged'; }
      else if (prof !== 'wanderer' && prof !== 'explorer') { counts.notRanger++; firstFail = 'notRanger'; }
      else if (onExped) { counts.onExped++; firstFail = 'onExped'; }
      else { counts.eligible++; firstFail = 'eligible'; eligible.push(cid); }
      fails[cid] = firstFail;
      members.push({ id: cid, profile: prof, trust: t, trustRaw: trustRaw, node: node,
        away: isAway, engaged: engaged, onExped: onExped, alive: !dead, firstFail: firstFail });
    }
    let rankedOrder = [];
    let rankedPick = null;
    let rankedVia = 'roster-fallback';
    if (eligible.length) {
      try {
        if (Game.companionRank) {
          const ranked = Game.companionRank(vid, eligible.slice(), { context: 'party' }) || [];
          if (ranked.length && ranked[0] && ranked[0].id) {
            rankedOrder = ranked.map(function (r) { return { id: r.id, s: (r.s != null ? r.s : null) }; });
            rankedPick = ranked[0].id;
            rankedVia = 'companionRank';
          }
        }
      } catch (e) { rankedOrder = []; rankedPick = null; rankedVia = 'roster-fallback'; }
      if (!rankedPick) {
        rankedOrder = eligible.map(function (id) { return { id: id, s: null }; });
        rankedPick = eligible[0];
        rankedVia = 'roster-fallback';
      }
    }
    let holderProfile = null;
    try { holderProfile = Game.npcRangeProfile ? Game.npcRangeProfile(vid) : null; } catch (e) { holderProfile = null; }
    let holderNode = null;
    try { const hn = Game.npcNode ? Game.npcNode(vid) : null; if (hn) holderNode = { nx: hn.nx, ny: hn.ny }; } catch (e) { holderNode = null; }
    return { rosterN: roster.length, haven: { nx: hx, ny: hy }, holderProfile: holderProfile, holderNode: holderNode,
      counts: counts, fails: fails, eligible: eligible, rankedOrder: rankedOrder, rankedPick: rankedPick, rankedVia: rankedVia, members: members };
  } catch (e) { return null; }
}
function usableMedicineExists(Game) {
  try {
    const st = (Game.stashState) ? Game.stashState() : null;
    const pile = (st && st.medicine) || [];
    const defs = {};
    (Game.data.items || []).forEach(function (i) { defs[i.id] = i; });
    for (let i = 0; i < pile.length; i++) {
      const e = pile[i];
      if ((e.units != null ? e.units : 1) <= 0 || (e.doses != null && e.doses <= 0)) continue;
      if (((defs[e.itemId || e.id] || {}).healAmount || 0) > 0) return true;
    }
  } catch (e) {}
  return false;
}
function hasCampHealer(Game, vid) {
  try {
    let place = null;
    if (Game.campPeopleIds && Game.campPeopleIds('haven').indexOf(vid) !== -1) place = 'haven';
    else if (Game.campPeopleIds && Game.campPeopleIds().indexOf(vid) !== -1) place = 'here';
    if (place && Game.campHealerId && Game.campHealerId(place)) return true;
  } catch (e) {}
  return false;
}
function deriveLaunchBlock(Game, vid) {
  try {
    if (((Game.state.village || {}).sick || {})[vid]) return 'sick';
  } catch (e) {}
  try { if (Game.npcMaxDist && Game.npcMaxDist(vid) < 1) return 'range-0'; } catch (e) {}
  try {
    const cur = (((Game.state.village || {}).health || {})[vid] !== undefined)
      ? ((Game.state.village || {}).health || {})[vid] : 100;
    if (cur < 70 && !usableMedicineExists(Game) && !hasCampHealer(Game, vid)) return 'hurt-no-medicine-no-healer';
  } catch (e) {}
  return null;
}

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'partyform-diag', fullTelemetry: false });
  const errors = [];
  const sayLines = [];
  let sayCount = 0;
  const SAY_RE = /gives it room|going back for help|companion|party|Yuki|David|Diana/i;
  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_RE.test(arg) && sayLines.length < 400) sayLines.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);

  // ---- CALL COUNTERS (pure reads; no state writes, no RNG) ----
  // counters[vid][day] = { objPick, objRefreshPick, objRefreshDawn,
  //   shouldRefresh, shouldRefreshTrue, scorePick, scoreWinPlanActs[],
  //   winPlanDepart, winPlanDepartRet{}, winPlanHavenTick, executeDepart,
  //   executeDepartRet{}, seedFromFight[] }
  const counters = {};
  function bump(vid, day, key, val) {
    if (!vid) return;
    const k = vid + '|' + day;
    counters[k] = counters[k] || {};
    if (val !== undefined) {
      counters[k][key] = counters[k][key] || {};
      counters[k][key][val] = (counters[k][key][val] || 0) + 1;
    } else {
      counters[k][key] = (counters[k][key] || 0) + 1;
    }
  }
  function wrapCount(name, fn) {
    if (typeof Game[name] !== 'function') { errors.push(name + '-wrap: not a function'); return; }
    const orig = Game[name];
    Game[name] = function (vid) {
      const day = gday(Game);
      try { bump(vid, day, name); } catch (e) {}
      let ret;
      try { ret = orig.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (name === 'winPlanDepart' || name === 'vbrainExecuteDepart') bump(vid, day, name + 'Ret', String(ret));
        if (name === 'vbrainShouldRefresh') bump(vid, day, name + 'Ret', String(!!ret));
        if (name === 'objRefreshPick') {
          const opts = arguments[3] || {};
          if (opts.dawn) bump(vid, day, 'objRefreshDawn');
        }
        if (name === 'vbrainScorePick') {
          const cands = arguments[1] || [];
          for (let i = 0; i < cands.length; i++) {
            if (cands[i] && cands[i].winPlanAction) bump(vid, day, 'scoreWinPlanActs', cands[i].winPlanAction);
          }
        }
        if (name === 'winPlanSeedFromFight') {
          const mdef = arguments[1] || {};
          bump(vid, day, 'seedFromFight', String((mdef && mdef.id) || '?') + ':' + String(arguments[2] || '?'));
          try { seeds.push({ day: day, vid: vid, mid: (mdef && mdef.id) || null, wave: (mdef && mdef.wave) || null, outcome: arguments[2] || null }); } catch (e2) {}
        }
      } catch (e) {}
      return ret;
    };
  }
  wrapCount('objPick');
  wrapCount('objRefreshPick');
  wrapCount('vbrainShouldRefresh');
  wrapCount('vbrainScorePick');
  wrapCount('winPlanDepart');
  wrapCount('winPlanHavenTick');
  wrapCount('vbrainExecuteDepart');
  wrapCount('winPlanSeedFromFight');

  const holderDays = [];
  const seeds = [];
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (d !== lastSnapDay) {
            lastSnapDay = d;
            const wp = ((Game.state || {}).village || {}).winPlan || {};
            const vil = (Game.state || {}).village || {};
            const hx = (vil.px != null ? vil.px : 4), hy = (vil.py != null ? vil.py : 4);
            for (const pvid of Object.keys(wp)) {
              const pl = wp[pvid];
              if (!planIsWave4(Game, pl)) continue;
              let alive = true;
              try { const p = Game.getPerson ? Game.getPerson(pvid) : null; if (p && p.dead) alive = false; } catch (e) {}
              let node = null;
              try { const n = Game.npcNode ? Game.npcNode(pvid) : null; if (n) node = { nx: n.nx, ny: n.ny }; } catch (e) {}
              let exped = false;
              try { const a = Game.agencyState ? Game.agencyState() : null; exped = !!(a && a.exped && a.exped[pvid]); } catch (e) {}
              let away = null;
              try { const aw = (vil.away || {})[pvid]; if (aw) away = { purpose: aw.purpose || null, sinceDay: aw.sinceDay != null ? aw.sinceDay : null, duration: aw.duration != null ? aw.duration : null }; } catch (e) {}
              let obj = null;
              try { const o = Game.objOf ? Game.objOf(pvid) : null; if (o) obj = { kind: o.kind || null, state: o.state || null, purpose: o.purpose || null, indoor: !!o.indoor, partsLeft: o.partsLeft != null ? o.partsLeft : null }; } catch (e) {}
              let prof = null;
              try { prof = Game.npcRangeProfile ? Game.npcRangeProfile(pvid) : null; } catch (e) {}
              let range = null;
              try { range = Game.npcMaxDist ? Game.npcMaxDist(pvid) : null; } catch (e) {}
              let sick = false, health = 100;
              try { sick = !!((vil.sick || {})[pvid]); } catch (e) {}
              try { const h = (vil.health || {})[pvid]; if (h !== undefined) health = h; } catch (e) {}
              const g = gearOfReplica(Game, pvid);
              const pool = poolReplica(Game, pvid);
              const block = deriveLaunchBlock(Game, pvid);
              const dayCounters = counters[pvid + '|' + d] || {};
              holderDays.push({ day: d, vid: pvid, target: pl.target || null,
                needWave: (pl.needWave != null ? pl.needWave : null),
                stage: pl.stage || null, party: (pl.party || []).slice(),
                holderAlive: alive, holderNode: node, holderExped: exped,
                holderAway: away, holderObjective: obj, holderProfile: prof,
                holderRange: range, holderSick: sick, holderHealth: health,
                holderGear: { armed: g.armed, armored: g.armored },
                holderBlock: block, haven: { nx: hx, ny: hy },
                poolCounts: pool ? pool.counts : null,
                poolEligible: pool ? pool.eligible.slice() : null,
                poolRankedPick: pool ? pool.rankedPick : null,
                poolFails: pool ? pool.fails : null,
                calls: dayCounters });
            }
          }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });

  const st = Game.state || {};
  let winPlanStats = null;
  try { winPlanStats = (typeof Game.winPlanStats === 'function') ? Game.winPlanStats() : null; } catch (e) { errors.push('winPlanStats: ' + String(e.message).slice(0, 80)); }
  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (dd) {
    return { day: dd.day, kind: dd.kind || null, who: dd.who || null, cause: dd.cause || null, player: !!dd.player };
  });

  const out = {
    seed: seed, arm: 'partyform-a', run: RUN, mode: MODE, leg: MODE,
    anchorCommit: ANCHOR, policySha: POLICY_SHA, policy: 'competent',
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost,
    winPlanStats: winPlanStats, sayCount: sayCount, sayLines: sayLines,
    instrumentErrors: errors, deaths: deaths,
    holderDays: holderDays, seeds: seeds,
  };
  return out;
}

async function main() {
  if (!SEEDS.length) { console.error('SEEDS required'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-18', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'partyform-a-s' + seed + '-partyform-a-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out));
    const holders = {};
    for (const r of out.holderDays) holders[r.vid] = (holders[r.vid] || 0) + 1;
    console.log('seed ' + seed + ' days=' + out.days + ' end=' + out.endReason +
      ' holders=' + JSON.stringify(holders) + ' errors=' + out.instrumentErrors.length);
  }
}

if (require.main === module) {
  main().catch(function (e) { console.error(e && e.stack || e); process.exit(1); });
}
module.exports = { poolReplica: poolReplica, deriveLaunchBlock: deriveLaunchBlock, planIsWave4: planIsWave4, gearOfReplica: gearOfReplica, oneRun: oneRun };
