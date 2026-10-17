#!/usr/bin/env node
// treeline-pilot-20261017.js — PILOT instrument for the sim-treeline arm
// (scale-onramp axis, compoundidx named next #1, finding #460).
//
// DIAGNOSTIC ONLY: answers the assignment's three pilot questions on the
// pre-seat courtship substrate WITHOUT changing any behavior (the census
// policies never answer treeline raids — the engine auto-resolves them for
// 800 kcal). For every staged treeline raid it records:
//
//   1. raider wave/class — the staging code builds HUMAN raiders (named
//      champion + 2-4 named raiders from a foreign village), not monsters;
//      the pilot confirms this empirically (no monster wave applies).
//   2. hemorrhage split by channel: commons (500-1500, no answer channel)
//      vs treeline auto-resolve (800) vs defense-answer (none in pilot).
//   3. what each answer verb would cost per staged raid: hold (0 kcal when
//      roster.length >= raiders+1, else 1500 overrun), give (2000), fight
//      (blood: 15% death / 30% wounded per mustered villager), auto (800).
//
// FAST-KILL PATH (assignment): if treeline raiders were apex-class
// one-round killers, KILL THE ARM AT PILOT per the raidshield lesson
// (sim-raidshield, fleshout-20261016T1215Z). They are humans — the arm
// proceeds iff the pilot confirms human raiders.
//
// Substrate (asserted up front):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
//   WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 (explicit — base courtship)
//   ALLOWGATE2 unset.
// Corpus: 2 fresh seeds x {leadfeast, belongfeast}, 180d death-aware.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//     node scripts/treeline-pilot-20261017.js
// Output: evidence/2026-10-17/perseed-treeline/pilot-<policy>-s<seed>.json
'use strict';
const fs = require('fs');
const path = require('path');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

function assertSubstrate() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
    if (process.env[k] !== '1') { console.error(`TREELINE-PILOT STOP: ${k}=1 is required (substrate).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') {
    console.error('TREELINE-PILOT STOP: SEATDRIVE=0 is required — base courtship, no seat driver.'); process.exit(2);
  }
  if (process.env.ALLOWGATE2 === '1') {
    console.error('TREELINE-PILOT STOP: ALLOWGATE2=1 is set — substrate moved; STOP.'); process.exit(2);
  }
  if (process.env.TREELINE === '1') {
    console.error('TREELINE-PILOT STOP: TREELINE=1 is set — the pilot must run UNANSWERED (control behavior).'); process.exit(2);
  }
}

const SEEDS = [9931, 9932];
const POLICIES = ['leadfeast', 'belongfeast'];
const TREE = path.join(__dirname, '..');
const OUTDIR = path.join(TREE, 'evidence', '2026-10-17', 'perseed-treeline');

function policyFor(policyId) {
  return policyId === 'leadfeast' ? SD.leadseat : SD.belongseat;
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

  const BEAT_RE = /treeline|raid|held the treeline|drove them off|didn't wait/i;
  const origSay = Game.say ? Game.say.bind(Game) : null;
  const pushSay = (text) => {
    try {
      const s = stripTags((text && (text.text || text.msg || text.message)) || text || '').slice(0, 300);
      let m;
      if ((m = /carried off ~([\d,]+) kcal from the pantry/.exec(s))) {
        const nm = (/Raid — (.+?) came in the night/.exec(s) || [])[1] || '?';
        t.raidEvents.push({ day: gday(Game), channel: 'commons', name: nm.slice(0, 40), kcal: parseInt(m[1].replace(/,/g, ''), 10) });
      }
      if ((m = /of (.+?) didn't wait — they hit the stores and melted back into the dark with ([\d,]+) kcal/.exec(s))) {
        t.raidEvents.push({ day: gday(Game), channel: 'treeline-auto', name: m[1].slice(0, 40), kcal: parseInt(m[2].replace(/,/g, ''), 10) });
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

  // answerRaidDefense: insurance — the pilot never answers, but attribute
  // any pantry movement if something else does.
  const origARD = Game.answerRaidDefense ? Game.answerRaidDefense.bind(Game) : null;
  if (origARD) {
    Game.answerRaidDefense = function (how) {
      const vid = String((Game.state.pendingRaidDefense || {}).villageId || '?');
      const before = pantryKcal(Game);
      const r = origARD(how);
      try {
        const delta = before - pantryKcal(Game);
        t.raidEvents.push({ day: gday(Game), channel: 'defense-' + how, vid: vid.slice(0, 24), kcal: Math.max(0, delta), outcome: String(r).slice(0, 20) });
      } catch (e) {}
      return r;
    };
  }
}

// scanStaging(Game, t): called from the daily wrapper BEFORE base.daily —
// the engine stages raids during sleep() (after daily) and auto-resolves
// them the NEXT sleep() (day > pr.day), so each staging is visible here
// exactly once, unanswered, before the auto-resolve fires.
function scanStaging(Game, t) {
  let pr = null;
  try { pr = Game.state.pendingRaidDefense || null; } catch (e) {}
  if (!pr || t._seenPending === pr) return;
  t._seenPending = pr;
  const raiderCount = (pr.raiders || []).length;
  const roster = rosterLen(Game);
  const holdWins = roster >= raiderCount + 1;
  t.stagedRaids.push({
    day: gday(Game),
    villageId: String(pr.villageId || '?').slice(0, 24),
    champion: String(pr.champion || '?').slice(0, 40),
    // raider class evidence: the staging code names human raiders —
    // no monster wave/class applies. Record names to prove it.
    raiderNames: (pr.raiders || []).slice(0, 4).map(n => String(n).slice(0, 24)),
    raiderCount, demand: pr.demand | 0, rosterLen: roster,
    // what-if answer costs (engine semantics, villageAgency.js):
    // hold: 0 kcal + opinion -3 when roster >= raiders+1 (no blood),
    //   else 1500 kcal + opinion -10 (overrun); give: demand kcal;
    // fight: blood (15% death / 30% wounded per mustered villager);
    // auto: 800 kcal + opinion -5.
    holdWouldWin: holdWins,
    holdCost: holdWins ? 0 : 1500,
    giveCost: pr.demand | 0,
    autoCost: 800,
  });
}

async function oneRun(seed, policyId) {
  process.env.SEATDRIVE = '0';
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: `treeline-pilot-${policyId}`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null, seatLive = null, deferLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    runCtx = ctx; seatLive = SD.layerOn(); deferLive = WD.layerOn();
    if (oSetup) return oSetup(G, ctx);
  };
  const t = { hashes: [] };
  attachInstrument(Game, t);
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    let r;
    try { scanStaging(G, t); } catch (e) {}
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try { t.hashes.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  if (seatLive !== false || deferLive !== true)
    throw new Error(`layer-live marker mismatch: seat=${seatLive} (need false) defer=${deferLive} (need true)`);

  const byChannel = {};
  for (const e of t.raidEvents) {
    const k = (e.kcalExact != null ? e.kcalExact : (e.kcal | 0));
    byChannel[e.channel] = byChannel[e.channel] || { events: 0, kcal: 0 };
    byChannel[e.channel].events++; byChannel[e.channel].kcal += k;
  }
  const holdWins = t.stagedRaids.filter(r => r.holdWouldWin).length;
  const holdSavings = t.stagedRaids.reduce((a, r) => a + (r.autoCost - r.holdCost), 0);
  const giveSavings = t.stagedRaids.reduce((a, r) => a + (r.autoCost - r.giveCost), 0);
  const rec = {
    seed, policyId, endReason: result.endReason, gameDays: result.gameDays,
    channels: byChannel,
    stagedRaids: t.stagedRaids,
    stagedCount: t.stagedRaids.length,
    holdWouldWin: holdWins,
    // what-if: had every staged raid been answered hold/give instead of auto
    whatifHoldSavingsVsAuto: holdSavings,
    whatifGiveSavingsVsAuto: giveSavings,
    villagerDeaths: t.deaths.filter(d => d.kind === 'person' || d.kind === 'villager').length,
    deathCauses: (() => { const c = {}; for (const d of t.deaths) c[d.cause] = (c[d.cause] || 0) + 1; return c; })(),
    beats: t.beats.slice(-60),
    hashes: t.hashes,
    seatLive, deferLive,
  };
  fs.mkdirSync(OUTDIR, { recursive: true });
  fs.writeFileSync(path.join(OUTDIR, `pilot-${policyId}-s${seed}.json`), JSON.stringify(rec, null, 1));
  console.log(`  [${policyId} s${seed}] end=${rec.endReason} days=${rec.gameDays} ` +
    `staged=${rec.stagedCount} holdWins=${holdWins}/${rec.stagedCount} ` +
    `holdSave=${holdSavings} giveSave=${giveSavings} ` +
    `channels=${Object.entries(byChannel).map(([k, v]) => `${k}:${v.events}x/${v.kcal}`).join(' ')}`);
  return rec;
}

async function main() {
  assertSubstrate();
  console.log(`substrate: ${require('child_process').execSync('git rev-parse --short HEAD', { cwd: TREE }).toString().trim()}`);
  const recs = [];
  for (const seed of SEEDS) for (const pid of POLICIES) recs.push(await oneRun(seed, pid));
  const staged = recs.reduce((a, r) => a + r.stagedCount, 0);
  const wins = recs.reduce((a, r) => a + r.holdWouldWin, 0);
  const holdSave = recs.reduce((a, r) => a + r.whatifHoldSavingsVsAuto, 0);
  console.log(`\n== pilot summary ==`);
  console.log(`runs=${recs.length} stagedRaids=${staged} holdWouldWin=${wins}/${staged} whatifHoldSavingsVsAuto=${holdSave}`);
  const classes = new Set();
  for (const r of recs) for (const s of r.stagedRaids) {
    classes.add(s.champion.includes(' ') || /^[A-Z][a-z]+$/.test(s.champion) ? 'human-named' : 'other:' + s.champion);
  }
  console.log(`raider class evidence: ${[...classes].join(', ')} (champion+raiders are named humans; no monster wave)`);
}

if (require.main === module) {
  main().catch(e => { console.error('PILOT CRASH:', e); process.exit(2); });
}
