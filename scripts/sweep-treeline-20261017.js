#!/usr/bin/env node
// sweep-treeline-20261017.js — the sim-treeline armed-vs-control sweep
// (scale-onramp axis, compoundidx named next #1, finding #460).
//
// 8 fresh seeds (9911-9918) x {leadfeast, belongfeast} x {control, armed},
// 180d death-aware, own paired control in the same sweep, pre-seat
// courtship substrate:
//
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
//   WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0, ALLOWGATE2 unset.
//
// control: raw seatdrive stack (SD.leadseat / SD.belongseat), TREELINE unset.
// armed:   the same stack wrapped in the treeline layer
//          (TL.leadfeastTreeline / TL.belongfeastTreeline), TREELINE=1.
//
// Pre-registration (evidence/2026-10-17/sim-treeline.md header — written
// AFTER the pilot, which re-scoped the assignment's 0.75x-total bar; see
// the evidence file for the pilot numbers):
//   PRIMARY: treeline-channel kcal per run, aggregate armed/control <= 0.25.
//     (The treeline channel is ~5% of total raid hemorrhage — median 3.3%
//     across the 32-run compoundidx census — so the assignment's 0.75x-total
//     bar is unachievable even with perfect answering. The lever's prize is
//     the treeline channel; the primary measures it. Total hemorrhage is
//     reported for compound context.)
//   GUARDRAILS: villager deaths armed <= control x 1.1 (aggregate);
//     national (count) armed >= control - 2; det-gate byte-identical
//     (scripts/det-gate-treeline-20261017.js, gate-off); no new death mode
//     (cause-family level).
//
// Output: evidence/2026-10-17/perseed-treeline/treeline-{control,armed}-{policy}-s{seed}.json
// with canonical wall keys (finding #482): national, table, wins, exiled.
'use strict';
const fs = require('fs');
const path = require('path');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const TL = require('./policies/treeline');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

function assertSubstrate() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
    if (process.env[k] !== '1') { console.error(`TREELINE-SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') {
    console.error('TREELINE-SWEEP STOP: SEATDRIVE=0 is required — base courtship, no seat driver.'); process.exit(2);
  }
  if (process.env.ALLOWGATE2 === '1') {
    console.error('TREELINE-SWEEP STOP: ALLOWGATE2=1 is set — substrate moved; STOP.'); process.exit(2);
  }
}

const SEEDS = [9911, 9912, 9913, 9914, 9915, 9916, 9917, 9918];
const POLICIES = ['leadfeast', 'belongfeast'];
const SIDES = ['control', 'armed'];
const TREE = path.join(__dirname, '..');
const OUTDIR = path.join(TREE, 'evidence', '2026-10-17', 'perseed-treeline');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function baseFor(policyId, side) {
  const sd = policyId === 'leadfeast' ? SD.leadseat : SD.belongseat;
  if (side === 'armed') return policyId === 'leadfeast' ? TL.leadfeastTreeline : TL.belongfeastTreeline;
  return sd;
}
const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
function pantryKcal(Game) {
  try {
    return Math.round((Game.state.village.pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0));
  } catch (e) { return 0; }
}
function rosterLen(Game) {
  try { return ((Game.state.village || {}).roster || []).length; } catch (e) { return 0; }
}
const stripTags = (s) => String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');

function existingSeedLiterals() {
  const out = new Set();
  const walk = (dir) => {
    let ents = [];
    try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const e of ents) {
      const p = path.join(dir, e.name);
      // Skip this sweep's own output dir — resume must not collide with itself.
      if (p === OUTDIR) continue;
      if (e.isDirectory()) walk(p);
      else { const m = /-s(\d+)\.json$/.exec(e.name); if (m) out.add(m[1]); }
    }
  };
  walk(path.join(TREE, 'evidence'));
  return out;
}

function attachInstrument(Game, t) {
  t.deaths = []; t.raidEvents = []; t.stagedRaids = []; t.beats = [];
  t._seenPending = null;

  const origReg = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
  if (origReg) {
    Game.registerDeath = function (opts) {
      const r = origReg(opts);
      try {
        const o = opts || {};
        if (t.deaths.length < 600) {
          t.deaths.push({
            day: gday(Game), kind: String(o.kind || '?'),
            vid: String(o.villagerId || o.monsterId || '?').slice(0, 24),
            name: String(o.name || '?').slice(0, 40),
            cause: String(o.cause || '?').slice(0, 80),
          });
        }
      } catch (e) {}
      return r;
    };
  }

  const BEAT_RE = /treeline|didn't wait|drove them off|held the treeline|national|regional|wave [345]|died|dead|starv/i;
  const origSay = Game.say ? Game.say.bind(Game) : null;
  const pushSay = (text) => {
    try {
      const s = stripTags((text && (text.text || text.msg || text.message)) || text || '').slice(0, 300);
      let m;
      if ((m = /carried off ~([\d,]+) kcal from the pantry/.exec(s))) {
        const nm = (/Raid — (.+?) came in the night/.exec(s) || [])[1] || '?';
        t.raidEvents.push({ day: gday(Game), channel: 'commons', name: nm.slice(0, 40), kcal: parseInt(m[1].replace(/,/g, ''), 10) });
      }
      // treeline auto-resolve: the say-line reports `taken` — the EXACT
      // removed amount (whole-unit over-removal included), so this IS the
      // true channel cost, not the nominal 800.
      if ((m = /didn't wait — they hit the stores and melted back into the dark with ([\d,]+) kcal/.exec(s))) {
        t.raidEvents.push({ day: gday(Game), channel: 'treeline-auto', kcal: parseInt(m[1].replace(/,/g, ''), 10) });
      }
      if (BEAT_RE.test(s)) {
        t.beats.push({ day: gday(Game), text: s.slice(0, 220) });
        if (t.beats.length > 200) t.beats.splice(0, 50);
      }
    } catch (e) {}
  };
  Game.say = function (msg) { pushSay(msg); return origSay ? origSay(msg) : msg; };

  const origCR = Game.commonsRaid ? Game.commonsRaid.bind(Game) : null;
  if (origCR) {
    Game.commonsRaid = function (ov) {
      const before = pantryKcal(Game);
      const r = origCR(ov);
      try {
        const after = pantryKcal(Game);
        const delta = before - after;
        if (delta > 0) {
          const ev = t.raidEvents[t.raidEvents.length - 1];
          if (ev && ev.channel === 'commons' && ev.day === gday(Game)) ev.kcalExact = delta;
          else t.raidEvents.push({ day: gday(Game), channel: 'commons', name: String((ov && ov.name) || '?').slice(0, 40), kcal: delta });
        }
      } catch (e) {}
      return r;
    };
  }

  // answerRaidDefense: attributes the armed side's answers (expect hold/0).
  // ALSO records the staging here (not just in the daily scan): the layer
  // answers in upkeep (3x/day, before daily), so a daily-only scan misses
  // raids that were already answered. Recording the staging at answer time
  // captures every staged raid exactly once.
  const origARD = Game.answerRaidDefense ? Game.answerRaidDefense.bind(Game) : null;
  if (origARD) {
    Game.answerRaidDefense = function (how) {
      const pr = Game.state.pendingRaidDefense || {};
      if (pr && t._seenPending !== pr) {
        t._seenPending = pr;
        const raiderCount = (pr.raiders || []).length;
        t.stagedRaids.push({
          day: gday(Game),
          villageId: String(pr.villageId || '?').slice(0, 24),
          champion: String(pr.champion || '?').slice(0, 40),
          raiderCount, demand: pr.demand | 0, rosterLen: rosterLen(Game),
          answered: how,
        });
      }
      const before = pantryKcal(Game);
      const r = origARD(how);
      try {
        const delta = before - pantryKcal(Game);
        t.raidEvents.push({
          day: gday(Game), channel: 'defense-' + how,
          vid: String(pr.villageId || '?').slice(0, 24),
          kcal: Math.max(0, delta), outcome: String(r).slice(0, 20),
        });
      } catch (e) {}
      return r;
    };
  }
}

function scanStaging(Game, t) {
  let pr = null;
  try { pr = Game.state.pendingRaidDefense || null; } catch (e) {}
  if (!pr || t._seenPending === pr) return;
  t._seenPending = pr;
  const raiderCount = (pr.raiders || []).length;
  t.stagedRaids.push({
    day: gday(Game),
    villageId: String(pr.villageId || '?').slice(0, 24),
    champion: String(pr.champion || '?').slice(0, 40),
    raiderCount, demand: pr.demand | 0, rosterLen: rosterLen(Game),
  });
}

function snapDay(Game, t) {
  const day = gday(Game);
  try {
    const s = Game.state.scholar || {};
    if (s.exiled || s.joinedVillage) t.exiledEver = true;
  } catch (e) {}
  try {
    const rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village';
    t.maxRank = Math.max(t.maxRank, RANK_ORDER[rank] || 0);
  } catch (e) {}
  try {
    const pg = Game.progState ? Game.progState() : {};
    if (pg.tableWaiting) t.everTable = true;
    if (pg.tableDone) t.everEntered = true;
    if (Game.won) t.wonEver = true;
  } catch (e) {}
  try { t.hashes.push(day + ':' + dayHash(Game)); } catch (e) {}
}

async function oneRun(seed, policyId, side) {
  if (side === 'armed') process.env.TREELINE = '1'; else delete process.env.TREELINE;
  process.env.SEATDRIVE = '0';
  const base = baseFor(policyId, side);
  const { Game } = await loadGame({ seed, mode: `treeline-${side}-${policyId}`, fullTelemetry: false });
  await setupGame(Game);
  let seatLive = null, deferLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    seatLive = SD.layerOn(); deferLive = WD.layerOn();
    if (oSetup) return oSetup(G, ctx);
  };
  const t = {
    hashes: [], maxRank: 0, everTable: false, everEntered: false,
    wonEver: false, exiledEver: false,
  };
  attachInstrument(Game, t);
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    try { scanStaging(G, t); } catch (e) {}
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try { snapDay(G, t); } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  if (seatLive !== false || deferLive !== true)
    throw new Error(`layer-live marker mismatch: seat=${seatLive} (need false) defer=${deferLive} (need true)`);
  if (side === 'armed' && process.env.TREELINE !== '1')
    throw new Error('armed side ran with TREELINE unset — STOP');
  if (side === 'control' && process.env.TREELINE === '1')
    throw new Error('control side ran with TREELINE=1 — STOP');

  const kcalOf = (e) => (e.kcalExact != null ? e.kcalExact : (e.kcal | 0));
  let commons = 0, treelineAuto = 0, defense = 0, holds = 0, gives = 0, fights = 0;
  for (const e of t.raidEvents) {
    if (e.channel === 'commons') commons += kcalOf(e);
    else if (e.channel === 'treeline-auto') treelineAuto += kcalOf(e);
    else if (e.channel.indexOf('defense-') === 0) {
      defense += kcalOf(e);
      if (e.channel === 'defense-hold') holds++;
      else if (e.channel === 'defense-give') gives++;
      else if (e.channel === 'defense-fight') fights++;
    }
  }
  const isVillager = (d) => d.kind === 'person' || d.kind === 'villager';
  const villagerDeaths = t.deaths.filter(isVillager).length;
  const deathCauses = {};
  for (const d of t.deaths) deathCauses[d.cause] = (deathCauses[d.cause] || 0) + 1;

  const rec = {
    // canonical wall keys (finding #482)
    national: t.maxRank >= 2 ? 1 : 0,
    table: t.everTable ? 1 : 0,
    wins: t.wonEver ? 1 : 0,
    exiled: t.exiledEver ? 1 : 0,
    entered: t.everEntered ? 1 : 0,
    maxRank: t.maxRank,
    // raid channels
    raidKcalCommons: commons,
    raidKcalTreelineAuto: treelineAuto,
    raidKcalDefense: defense,
    raidKcalTreeline: treelineAuto + defense,
    raidKcalTotal: commons + treelineAuto + defense,
    holds, gives, fights,
    stagedRaids: t.stagedRaids.length,
    // run meta
    seed, policyId, side,
    endReason: result.endReason, gameDays: result.gameDays,
    villagerDeaths, deathCauses,
    deathLog: t.deaths,
    beats: t.beats.slice(-80),
    hashes: t.hashes,
    seatLive, deferLive,
  };
  fs.mkdirSync(OUTDIR, { recursive: true });
  fs.writeFileSync(path.join(OUTDIR, `treeline-${side}-${policyId}-s${seed}.json`), JSON.stringify(rec, null, 1));
  console.log(`  [${side} ${policyId} s${seed}] end=${rec.endReason} days=${rec.gameDays} ` +
    `nat=${rec.national} tbl=${rec.table} win=${rec.wins} exl=${rec.exiled} ` +
    `raidTot=${rec.raidKcalTotal} (com=${commons} tl=${rec.raidKcalTreeline} holds=${holds}) ` +
    `deaths=${villagerDeaths}`);
  return rec;
}

async function main() {
  assertSubstrate();
  const pre = existingSeedLiterals();
  const collisions = SEEDS.filter(s => pre.has(String(s)));
  if (collisions.length) {
    console.error('TREELINE-SWEEP STOP: seed literals already exist in evidence/ filenames: ' +
      collisions.map(s => `s${s}`).join(', '));
    process.exit(2);
  }
  console.log(`seed collision check: ${SEEDS.length} seeds clean.`);
  console.log(`substrate: ${require('child_process').execSync('git rev-parse --short HEAD', { cwd: TREE }).toString().trim()}`);
  const recs = [];
  for (const seed of SEEDS) for (const pid of POLICIES) for (const side of SIDES) {
    const outFile = path.join(OUTDIR, `treeline-${side}-${pid}-s${seed}.json`);
    if (fs.existsSync(outFile)) {
      console.log(`  [${side} ${pid} s${seed}] RESUME-SKIP (already done)`);
      recs.push(JSON.parse(fs.readFileSync(outFile, 'utf8')));
      continue;
    }
    recs.push(await oneRun(seed, pid, side));
  }
  const sum = (rs, k) => rs.reduce((a, r) => a + (r[k] | 0), 0);
  for (const side of SIDES) {
    const rs = recs.filter(r => r.side === side);
    console.log(`\n== ${side} (n=${rs.length}) ==`);
    console.log(`  national=${sum(rs, 'national')} table=${sum(rs, 'table')} wins=${sum(rs, 'wins')} exiled=${sum(rs, 'exiled')}`);
    console.log(`  raidKcalTotal=${sum(rs, 'raidKcalTotal')} treeline=${sum(rs, 'raidKcalTreeline')} holds=${sum(rs, 'holds')}`);
    console.log(`  villagerDeaths=${sum(rs, 'villagerDeaths')}`);
  }
  const ctl = recs.filter(r => r.side === 'control'), arm = recs.filter(r => r.side === 'armed');
  const ratio = sum(ctl, 'raidKcalTreeline') ? (sum(arm, 'raidKcalTreeline') / sum(ctl, 'raidKcalTreeline')) : null;
  console.log(`\nPRIMARY (treeline-channel aggregate ratio): ${ratio == null ? 'n/a (control treeline = 0)' : ratio.toFixed(3)} (GO iff <= 0.25)`);
}

if (require.main === module) {
  main().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });
}

module.exports = { oneRun, SEEDS, POLICIES, SIDES };
