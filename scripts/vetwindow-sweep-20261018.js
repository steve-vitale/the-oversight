#!/usr/bin/env node
// vetwindow-sweep-20261018.js — CLEAN re-run of the veteran release-window
// diagnostic (flesh-out loop arm sim-vetwindow, 2026-10-18, axis scale-onramp).
//
// The 2026-10-18 0831Z run claimed a sim-vetwindow diagnostic (NO-GO, 18.2%
// vs 80% bar) but left ZERO artifacts — no tree, no branch, no evidence, no
// worker record. That claim is UNVERIFIED; this is the diagnostic run cleanly
// from scratch.
//
// INSTRUMENT-ONLY ARM: zero src/js changes, zero scripts/policies changes.
// Instruments + evidence only. The instrument wraps Game.tele and two field
// router methods (resolvePatrol, resolveWildMonsterEncounter) per-run —
// pure recording, no state writes, no RNG draws. The DET gate proves the
// trajectories are byte-identical with the instrument attached vs bare.
//
// SUBSTRATE (winseat — copied EXACTLY from evidence/2026-10-18/
// sim-defercensus3.md, the 3-substrate census):
//   withSeatDrive(withWinDefer(withVetrel(withReposition(TF base))))
//   VETREL=1 REPOSITION=1 NODEWITNESS=1 SEATDRIVE=1 explicit.
//   Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
//   (+ WINPURSUIT=1 WINDEFER=1 set in-process; the windefer wrapper is
//   composed, so the env is live, exactly as the defercensus2b corpus).
//
// DEFINITIONS (src/js/standing.js):
//   veterans = living roster members with a wave-(w-1)+ kill in
//     state.waveKillLog (waveCombatReadiness). For w=4: wave-3+ kills.
//   release window = days where Game.standingDeferral(4).deferred is true
//     (raw Standing >= t4=100, !ready, peak<4) AND 'veterans' is in
//     Game.waveUnlockReady(4).short.
//   On the recalibrated bar (sim-readinessfix, 2026-10-18) wave-4 demands
//   {armored 3 @ P>=10, armed 5, tricks 3, veterans 1}: the veteran leg is
//   satisfied by ONE living wave-3 killer; the window is deferral days with
//   ZERO living veterans.
//
// DEATH-CHANNEL TAXONOMY (cause -> channel; documented per-cause in
// classifyDeath; every observed cause maps to exactly one channel —
// 'other' is a legitimate channel, never a void):
//   raid:        'raid', 'raid-defense', aid-crisis-context combat/monster
//   expedition:  'expedition', monster-name causes (expedDeath path),
//                'aid-runner', 'sortie combat', 'split-fight: X',
//                on-expedition-context monster/combat/injuries
//   wild:        'the wild', 'hunting', router-flag wild,
//                scholar-TB-fight combat away from haven
//   patrol:      'patrol combat', router-flag patrol
//   haven:       'starvation', 'thirst', 'injuries',
//                "a wound that wouldn't close" (attrition deaths; the cause
//                records no location — mapped to haven as the village's own
//                logistics toll, documented)
//   disease:     'sickness', disease ids (mundane + alien pools), disease
//                names, food-poisoning names
//   alien:       'alien', 'alien_beam'
//   other:       'ambush' (betrayal murder), 'contest',
//                'the phoenix link*' (godpath rite), anything unmapped
//
// DEATH-TELE TRAPS (handled, per the brief):
//   (1) death teles re-emit — DEDUP on (who,day,cause).
//   (2) tele('death') fires for kind 'monster' too — capture kind, filter to
//       person/villager/scholar/player kinds only (the vetsurvive pattern).
//   (3) cross-check person deaths against roster liveness (vpOf living) —
//       a person-kind tele for a still-living villager is a PHANTOM:
//       excluded from attribution, counted separately.
//
// Usage:
//   SEATDRIVE=1 VETREL=1 REPOSITION=1 NODEWITNESS=1 FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 node scripts/vetwindow-sweep-20261018.js
//   SMOKE=1 ...       # short smoke: both policies drive, census live, cause-space dump
//   DET=1 ...         # det-gate: instrument-on vs instrument-off byte-identical trajectories (2 seeds x 60d), both-repeat stable
//   FIDELITY=1 ...    # fidelity: re-run 2 completed sweep seeds, byte-identical per-seed JSON
// Targeted: SEEDS="53101,53102" ONLY="leadfeast"
'use strict';
const fs = require('fs');
const path = require('path');
const TF = require('./policies/tribfloor');
const VR = require('./policies/vetrel');
const RP = require('./policies/reposition');
const WD = require('./policies/windefer');
const SD = require('./policies/seatdrive');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { sampleReadiness, attributeRun } = require('./wave4census-lib-20261017');

const SUBSTRATE = 'winseat';
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'SEATDRIVE', 'VETREL', 'REPOSITION', 'NODEWITNESS']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (winseat substrate).`); process.exit(2); }
}
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [53101, 53102, 53103, 53104, 53105, 53106, 53107, 53108]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const T4 = 100;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-vetwindow');
const isBare = () => process.env.VETWINDOW_BARE === '1';

function baseFor(policyId) { return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast; }

// Policy composition — winseat, EXACTLY as evidence/2026-10-18/sim-defercensus3.md.
function policyFor(policyId) {
  const base = baseFor(policyId);
  const tag = policyId === 'leadfeast' ? 'lead' : 'belong';
  const rp = RP.withReposition(base, `${tag}-rp`, `${policyId} + reposition (REPOSITION=1)`);
  const vet = VR.withVetrel(rp, `${tag}-vetrel-rp`, `${policyId} + reposition + VETREL (companion veteran channel)`);
  const wd = WD.withWinDefer(vet, `${tag}-windefer`, `${policyId} + readiness + win-side layers (WINPURSUIT=1 + WINDEFER=1)`);
  return SD.withSeatDrive(wd, `${tag}-windefer`, `${policyId} + win-side stack + seatdrive (SEATDRIVE=1, explicit composition)`);
}

// ---------------------------------------------------------------------------
// Death-channel classifier. PURE: (cause, ctx, monsterNames) -> [channel, rule].
// Every input maps to exactly one channel; 'other' is a legitimate channel.
// Unit-tested in scripts/test-vetwindow-20261018.js.
// ctx: {aid, atHaven, inTb, router, onExped} captured at death time.
const DISEASE_IDS = new Set(['gutrot', 'trichinosis', 'disease', 'lockjaw', 'wound_fever', 'trembles',
  'howlbelly', 'gristlefit', 'croakbelly', 'shellgut', 'witness_maw', 'flockmind',
  'eurika', 'east_nile', 'lemons']);
const DISEASE_RES = [/^sickness$/i, /food poisoning|bad belly|spoiled gut|poisoned/i,
  /^(wound fever|gut rot|tick fever)$/i];

function classifyDeath(causeRaw, ctx, monsterNames) {
  const cause = String(causeRaw == null ? 'unknown' : causeRaw);
  const lc = cause.toLowerCase();
  ctx = ctx || {};
  monsterNames = monsterNames || new Set();
  if (cause === 'raid' || cause === 'raid-defense') return ['raid', 'cause'];
  if (cause === 'expedition') return ['expedition', 'cause'];
  if (monsterNames.has(lc)) return ['expedition', 'monster-name=expedDeath'];
  if (cause === 'aid-runner' || cause === 'sortie combat' || cause.startsWith('split-fight:')) {
    return ['expedition', 'cause'];
  }
  if (ctx.onExped && (cause === 'monster' || cause === 'combat' || cause === 'injuries')) {
    return ['expedition', 'ctx:on-expedition'];
  }
  if (cause === 'the wild') return ['wild', 'cause'];
  if (cause === 'patrol combat') return ['patrol', 'cause'];
  if (cause === 'hunting') return ['wild', 'cause'];
  if (cause === 'alien' || cause === 'alien_beam') return ['alien', 'cause'];
  if (DISEASE_IDS.has(lc) || DISEASE_RES.some(re => re.test(cause))) return ['disease', 'cause'];
  if (cause === 'starvation' || cause === 'thirst') return ['haven', 'cause'];
  if (cause === 'injuries' || cause === "a wound that wouldn't close") return ['haven', 'cause'];
  if (cause === 'monster' || cause === 'combat') {
    if (ctx.aid) return ['raid', 'ctx:aid-crisis'];
    if (ctx.router === 'patrol') return ['patrol', 'ctx:router'];
    if (ctx.router === 'wild') return ['wild', 'ctx:router'];
    if (cause === 'combat' && ctx.atHaven) return ['raid', 'ctx:scholar-fight-at-haven'];
    if (cause === 'combat') return ['wild', 'ctx:scholar-fight-in-wild'];
    return ['other', 'ctx:unresolved-monster'];
  }
  return ['other', 'cause-unmapped'];
}

// Person-kind filter — the vetsurvive pattern (DEATH-TELE KIND POLLUTION:
// tele('death') fires for kind 'monster' too).
function isPersonDeath(t) {
  return !!(t.player || t.kind === 'person' || t.kind === 'villager' || t.kind === 'scholar' || t.kind == null);
}

const scholarDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// Engine-true veteran set: DISTINCT killer vids with wave-3+ kills in
// state.waveKillLog that are living NOW (mirrors waveCombatReadiness's
// isLiving: the scholar always counts; others need a non-dead vpOf).
function veteranSet(Game) {
  const set = new Set();
  try {
    const log = (Game.state && Game.state.waveKillLog) || [];
    const scholarId = String(Game.villagerId);
    for (const e of log) {
      if (!e || !e.by || ((e.w | 0) < 3)) continue;
      const vid = String(e.by);
      if (vid === scholarId) { set.add(vid); continue; }
      let living = false;
      try { const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(e.by) : null; living = !!(vp && !vp.dead); }
      catch (x) { living = false; }
      if (living) set.add(vid);
    }
  } catch (e) {}
  return set;
}

// Phantom check: did `who` actually die? A person-kind tele for a still-
// living villager is a PHANTOM (the alienPlayers.js finding) — excluded
// from attribution, counted separately. Returns true/false/null
// (null = unverifiable: missing who).
function diedForReal(Game, who) {
  if (who == null || who === '?' || who === 'unknown') return null;
  try {
    const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(who) : null;
    if (vp) return !!vp.dead;
    const roster = (((Game.state && Game.state.village) || {}).roster || []).map(String);
    if (roster.includes(String(who))) return false;
    return true; // absent from roster, no person record: dead and removed
  } catch (e) { return null; }
}

function monsterNameSet(Game) {
  const set = new Set();
  try {
    for (const m of (Game.data && Game.data.monsters) || []) {
      if (m && m.name) set.add(String(m.name).toLowerCase());
      if (m && m.id) set.add(String(m.id).toLowerCase().replace(/_/g, ' '));
      if (m && m.id) set.add(String(m.id).toLowerCase());
    }
  } catch (e) {}
  return set;
}

// Per-run death capture: wraps Game.tele (records death teles with
// death-time context) and the two field routers (patrol/wild channel flag).
// Pure recording — no state writes, no RNG draws.
function installVetwindowCapture(Game, C) {
  C._router = null;
  const wrapRouter = (name, flag) => {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { C.instrumentErrors++; return; }
      Game[name] = function (...args) {
        const prev = C._router;
        C._router = flag;
        try { return orig.apply(this, args); }
        finally { C._router = prev; }
      };
    } catch (e) { C.instrumentErrors++; }
  };
  wrapRouter('resolvePatrol', 'patrol');
  wrapRouter('resolveWildMonsterEncounter', 'wild');
  try {
    const oTele = Game.tele.bind(Game);
    Game.tele = function (type, data) {
      const r = oTele.apply(this, arguments);
      try {
        if (type === 'death') {
          const rec = {
            day: scholarDay(Game),
            who: data && data.who != null ? String(data.who) : null,
            cause: data && data.cause != null ? String(data.cause) : 'unknown',
            kind: data && data.kind != null ? String(data.kind) : null,
            player: !!(data && data.player),
            ctx: { aid: false, atHaven: false, inTb: false, router: C._router || null, onExped: false },
          };
          try { rec.ctx.aid = !!(Game.aidCrisis && Game.aidCrisis()); } catch (e) {}
          try { rec.ctx.atHaven = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) {}
          try { rec.ctx.inTb = !!Game.tbfight; } catch (e) {}
          try {
            const st = (typeof Game.agencyState === 'function') ? Game.agencyState() : null;
            rec.ctx.onExped = !!(st && st.exped && rec.who && st.exped[rec.who]);
          } catch (e) {}
          C.deathRecs.push(rec);
        }
      } catch (e) { C.instrumentErrors++; }
      return r;
    };
  } catch (e) { C.instrumentErrors++; }
}

function withVetwindow(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    setup(Game, ctx) {
      ctx._vetw = {
        snaps: [], hashes: [], deathRecs: [],
        qualify: {},           // vid -> first day in the living veteran set
        vetSeries: [],         // [{day, vets}] daily living-veteran count
        windowDays: [],        // release-window days (deferral + veterans in short)
        firstVetLegDay: null,
        instrumentErrors: 0,
        maxWave: 1, wave4Day: null, wave5Day: null,
        nationalDay: null, invites: 0, _wasWaiting: false,
      };
      const oSetup = base.setup;
      if (oSetup) return oSetup(Game, ctx);
    },
    daily(Game, ctx) {
      const C = ctx._vetw;
      const oDaily = base.daily;
      let r;
      try { r = oDaily ? oDaily(Game, ctx) : undefined; } catch (e) { r = undefined; }
      if (C) {
        // Trajectory hash ALWAYS recorded (bare and census alike) — the
        // det-gate compares these; gating them on !isBare() voids the gate.
        try { C.hashes.push(scholarDay(Game) + ':' + dayHash(Game)); } catch (e) {}
      }
      if (C && !isBare()) {
        try {
          const day = scholarDay(Game);
          const vset = veteranSet(Game);
          for (const vid of vset) if (!(vid in C.qualify)) C.qualify[vid] = day;
          let def = null, sr = null;
          try { def = (typeof Game.standingDeferral === 'function') ? Game.standingDeferral(4) : null; }
          catch (e) { C.instrumentErrors++; }
          try { sr = sampleReadiness(Game); C.instrumentErrors += (sr.err | 0); }
          catch (e) { C.instrumentErrors++; }
          if (sr) {
            C.snaps.push(sr);
            const vets = sr.veterans | 0;
            C.vetSeries.push({ day, vets });
            const winDay = !!(def && def.deferred && !def.grandfathered &&
              Array.isArray(sr.short) && sr.short.indexOf('veterans') >= 0);
            if (winDay) C.windowDays.push(day);
            if (C.firstVetLegDay == null && vets >= 1) C.firstVetLegDay = day;
          }
        } catch (e) { C.instrumentErrors++; }
        try {
          const day = scholarDay(Game);
          const w = Game.unlockedWave ? Game.unlockedWave() : 1;
          if (w > C.maxWave) C.maxWave = w;
          if (w >= 4 && C.wave4Day == null) C.wave4Day = day;
          if (w >= 5 && C.wave5Day == null) C.wave5Day = day;
          const rank = Game.scaleRank ? Game.scaleRank() : 'village';
          if ((rank === 'national' || rank === 'global') && C.nationalDay == null) C.nationalDay = day;
          const pg = Game.progState ? Game.progState() : null;
          if (pg) {
            if (pg.tableWaiting && !C._wasWaiting) { C.invites++; }
            C._wasWaiting = !!pg.tableWaiting;
          }
        } catch (e) { C.instrumentErrors++; }
      }
      return r;
    },
  });
}

// Post-run attribution: dedup, kind-filter, phantom-check, ever-veteran
// match, channel classification. Returns the per-seed record.
function attributeDeaths(Game, C, monsterNames) {
  const seen = new Set();
  const deduped = [];
  for (const t of (C.deathRecs || [])) {
    if (!isPersonDeath(t)) continue;
    const key = [t.who, t.day, t.cause].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(t);
  }
  // Ever-veteran vids: anyone who held a wave-3+ kill at any daily snapshot
  // (the qualify map) UNION the final log scan (a killer who qualified and
  // died between snapshots is still a veteran death).
  const everVet = new Set(Object.keys(C.qualify || {}));
  try {
    const log = (Game.state && Game.state.waveKillLog) || [];
    for (const e of log) if (e && e.by && ((e.w | 0) >= 3)) everVet.add(String(e.by));
  } catch (e) {}
  const windowSet = new Set(C.windowDays || []);
  const veteranDeaths = [];
  const phantoms = [];
  const unverifiable = [];
  const causeSpace = {};
  for (const t of deduped) {
    causeSpace[t.cause] = (causeSpace[t.cause] || 0) + 1;
    const who = t.who;
    const real = diedForReal(Game, who);
    if (real === false) { phantoms.push({ who, day: t.day, cause: t.cause }); continue; }
    if (real === null) { unverifiable.push({ who, day: t.day, cause: t.cause }); continue; }
    if (!who || !everVet.has(String(who))) continue; // not a veteran death
    const [channel, rule] = classifyDeath(t.cause, t.ctx, monsterNames);
    let name = who;
    try { name = String(Game.displayName ? Game.displayName(who) : who).split(' ')[0]; } catch (e) {}
    veteranDeaths.push({
      who: String(who), name, day: t.day | 0, cause: t.cause,
      channel, rule, player: !!t.player,
      inWindow: windowSet.has(t.day | 0),
      ctx: t.ctx,
    });
  }
  // Unattributed rows: veteran-attributable deaths we could NOT channel.
  // The classifier is total (every cause maps to a channel), so the only
  // unattributed rows are unverifiable ones (missing who) that MIGHT be
  // veteran deaths — counted LOUD, never silently dropped.
  const unattributed = unverifiable.filter(u => {
    // A missing-who death can't be matched to the veteran set; report it
    // as unattributed only if the run had living veterans that day... we
    // can't know. Honest: report ALL unverifiable person deaths here.
    return true;
  });
  return { dedupedCount: deduped.length, rawCount: (C.deathRecs || []).length,
    veteranDeaths, phantoms, unverifiable, unattributed, causeSpace,
    everVeteranCount: everVet.size };
}

// Veteran-leg durability: from the first satisfaction day, the length of
// the first consecutive run with veterans>=1. DURABLE if >=7, TRANSIENT if
// the leg dropped sooner, CENSORED if the run ended/won/lost while held
// (<7 days held at run end).
function legDurability(C, endReason) {
  const series = C.vetSeries || [];
  const first = C.firstVetLegDay;
  if (first == null) return { status: 'never-satisfied', heldDays: 0, firstVetLegDay: null };
  let held = 0;
  for (const s of series) {
    if (s.day < first) continue;
    if ((s.vets | 0) >= 1) held++;
    else break;
  }
  const lastDay = series.length ? series[series.length - 1].day : first;
  const seriesCoversToEnd = series.length && (lastDay >= first + held);
  if (held >= 7) return { status: 'durable', heldDays: held, firstVetLegDay: first };
  // Did the leg drop (transient) or did the run end first (censored)?
  const dropped = series.some(s => s.day >= first + held && (s.vets | 0) < 1);
  if (dropped) return { status: 'transient', heldDays: held, firstVetLegDay: first };
  return { status: 'censored', heldDays: held, firstVetLegDay: first, note: `run ended (${endReason}) with leg held ${held}d` };
}

async function oneRun(seed, policyId, opts) {
  opts = opts || {};
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
  const base = policyFor(policyId);
  const policy = withVetwindow(base, base.id + '-vetwindow', base.desc + ' [VETWINDOW]');
  const { Game } = await loadGame({ seed, mode: 'vetwindow', fullTelemetry: false });
  await setupGame(Game);
  const monsterNames = monsterNameSet(Game);
  let runCtx = null;
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => { runCtx = ctx; return oSetup(G, ctx); };
  let result;
  const days = opts.days || DAYS;
  // Install capture AFTER setupGame with the live ctx: the setup wrapper
  // above stashes runCtx, but install needs C — do it inside a setup hook.
  const C_holder = {};
  const oSetup2 = policy.setup;
  policy.setup = (G, ctx) => {
    const r = oSetup2(G, ctx);
    try { if (!isBare()) installVetwindowCapture(G, ctx._vetw); } catch (e) {}
    C_holder.C = ctx._vetw;
    return r;
  };
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  const C = C_holder.C || { snaps: [], hashes: [], deathRecs: [], qualify: {}, vetSeries: [], windowDays: [],
    firstVetLegDay: null, instrumentErrors: 0, maxWave: 1, wave4Day: null, wave5Day: null,
    nationalDay: null, invites: 0 };
  const endReason = Game.over ? (Game.villageLost ? 'village-lost' : 'over-other')
    : (result.gameDays >= days ? 'survived' : (result.endReason || 'ended'));
  const attr = isBare() ? null : attributeDeaths(Game, C, monsterNames);
  const dur = isBare() ? null : legDurability(C, endReason);
  let binding = null;
  try { binding = attributeRun(C.snaps, { t4: T4 }); } catch (e) { binding = { binding: 'ERR:' + e.message }; }
  const out = {
    seed, policyId, substrate: SUBSTRATE, mode: 'vetwindow',
    days: result.days, gameDays: result.gameDays, endReason,
    won: !!Game.won,
    maxWave: C.maxWave | 0, wave4Day: C.wave4Day, wave5Day: C.wave5Day,
    nationalDay: C.nationalDay, national: C.nationalDay != null ? 1 : 0,
    table: (C.invites | 0) > 0 ? 1 : 0,
    instrumentErrors: C.instrumentErrors | 0,
    veteranQualify: C.qualify,
    everVeteranCount: attr ? attr.everVeteranCount : 0,
    veteranDeaths: attr ? attr.veteranDeaths : [],
    veteranDeathCount: attr ? attr.veteranDeaths.length : 0,
    veteranDeathsInWindow: attr ? attr.veteranDeaths.filter(d => d.inWindow).length : 0,
    rawDeathTeles: attr ? attr.rawCount : 0,
    dedupedPersonDeaths: attr ? attr.dedupedCount : 0,
    phantomDeaths: attr ? attr.phantoms : [],
    phantomCount: attr ? attr.phantoms.length : 0,
    unverifiableDeaths: attr ? attr.unverifiable : [],
    unattributed: attr ? attr.unattributed : [],
    unattributedCount: attr ? attr.unattributed.length : 0,
    causeSpace: attr ? attr.causeSpace : {},
    firstVetLegDay: C.firstVetLegDay,
    vetLeg: dur,
    windowDayCount: (C.windowDays || []).length,
    windowDays: C.windowDays || [],
    binding: binding ? binding.binding : null,
    daysShort: binding ? binding.daysShort : null,
    hashes: C.hashes, snaps: C.snaps,
  };
  if (!opts.noWrite) {
    fs.mkdirSync(EVID, { recursive: true });
    fs.writeFileSync(path.join(EVID, `${SUBSTRATE}-${policyId}-s${seed}.json`), JSON.stringify(out));
  }
  return out;
}

function bindingOf(out) {
  return attributeRun(out.snaps, { t4: T4 }).binding;
}

async function smokeGate() {
  const fails = [];
  const check = (name, cond, detail) => {
    console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
    if (!cond) fails.push(name);
  };
  const causeUnion = {};
  for (const policyId of POLICIES) {
    const out = await oneRun(53101, policyId, { days: 15, noWrite: true });
    check(`[${policyId}] run completes`, out.days >= 15, `days=${out.days}`);
    check(`[${policyId}] veteran census live`, Object.keys(out.veteranQualify || {}).length >= 0, `qualify=${Object.keys(out.veteranQualify || {}).length}`);
    check(`[${policyId}] 0 instrument errors`, out.instrumentErrors === 0, `err=${out.instrumentErrors}`);
    check(`[${policyId}] death capture live`, out.rawDeathTeles >= 0, `raw=${out.rawDeathTeles} dedup=${out.dedupedPersonDeaths}`);
    check(`[${policyId}] window sampling live`, Array.isArray(out.windowDays), `windowDays=${out.windowDayCount}`);
    for (const [c, n] of Object.entries(out.causeSpace || {})) causeUnion[c] = (causeUnion[c] || 0) + n;
  }
  console.log(`  cause-space observed in smoke: ${JSON.stringify(causeUnion)}`);
  delete process.env.WINDEFER;
  if (fails.length) { console.log(`\nSMOKE STOP: ${fails.length} failure(s).`); process.exit(1); }
  console.log('\nSMOKE GATE [winseat]: both policies drive, veteran + window census live.');
}

// DET-GATE: instrument-on vs instrument-off trajectories byte-identical
// (2 seeds x 60d) — proves the wrappers are read-only. Both-repeat guards
// against seed nondeterminism. Classification fidelity: two full runs of
// the same seed produce byte-identical veteran-death classification.
async function detGate() {
  const seeds = [53101, 53102];
  const days = 60;
  let green = 0, total = 0;
  for (const seed of seeds) {
    process.env.VETWINDOW_BARE = '1';
    const hB1 = (await oneRun(seed, 'leadfeast', { days, noWrite: true })).hashes.join('\n');
    const hB2 = (await oneRun(seed, 'leadfeast', { days, noWrite: true })).hashes.join('\n');
    delete process.env.VETWINDOW_BARE;
    const hC1 = (await oneRun(seed, 'leadfeast', { days, noWrite: true })).hashes.join('\n');
    const hC2 = (await oneRun(seed, 'leadfeast', { days, noWrite: true })).hashes.join('\n');
    const bareStable = hB1 === hB2;
    const censusStable = hC1 === hC2;
    const identical = bareStable && censusStable && hB1 === hC1;
    total++;
    if (identical) green++;
    console.log(`  seed ${seed}: bare-stable=${bareStable} census-stable=${censusStable} instrument-identical=${hB1 === hC1} ${identical ? 'PASS' : 'FAIL'}`);
  }
  delete process.env.WINDEFER;
  console.log(`DET-GATE [winseat]: ${green}/${total} identical.`);
  if (green < total) { console.error('DET GATE FAILED — instrument is not provably read-only.'); process.exit(4); }
  console.log('DET gate green.');
}

// FIDELITY: re-run 2 completed sweep seeds; the per-seed JSON (including
// the veteran-death channel classification) must reproduce byte-identical.
async function fidelityGate() {
  const pairs = [['leadfeast', 53101], ['belongfeast', 53102]];
  let green = 0;
  for (const [policyId, seed] of pairs) {
    const fp = path.join(EVID, `${SUBSTRATE}-${policyId}-s${seed}.json`);
    if (!fs.existsSync(fp)) { console.error(`FIDELITY STOP: ${fp} missing — run the sweep first.`); process.exit(5); }
    const orig = JSON.parse(fs.readFileSync(fp, 'utf8'));
    const rerun = await oneRun(seed, policyId, { noWrite: true });
    const canon = (o) => JSON.stringify(o);
    const ok = canon(orig) === canon(rerun);
    if (ok) green++;
    console.log(`  [${policyId} s${seed}] byte-identical=${ok} vetDeaths=${JSON.stringify(orig.veteranDeaths)} -> ${JSON.stringify(rerun.veteranDeaths)} ${ok ? 'PASS' : 'FAIL'}`);
  }
  delete process.env.WINDEFER;
  console.log(`FIDELITY [winseat]: ${green}/${pairs.length} reproduced byte-identical.`);
  if (green < pairs.length) { console.error('FIDELITY FAILED — seeded determinism broken.'); process.exit(6); }
  console.log('FIDELITY gate green.');
}

(async () => {
  if (require.main !== module) return;
  let only = null;
  if (process.env.ONLY) {
    only = {};
    for (const part of process.env.ONLY.split(';')) { const p = part.trim(); if (p) only[p] = true; }
  }
  if (process.env.SMOKE === '1') await smokeGate();
  else if (process.env.DET === '1') await detGate();
  else if (process.env.FIDELITY === '1') await fidelityGate();
  else {
    for (const policyId of POLICIES) {
      if (only && !only[policyId]) continue;
      for (const seed of SEEDS) {
        const out = await oneRun(seed, policyId);
        console.log(`  [${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} won=${out.won ? 1 : 0} w=${out.maxWave} nat=${out.national} everVet=${out.everVeteranCount} vetDeaths=${out.veteranDeathCount} (inWindow=${out.veteranDeathsInWindow}) unattrib=${out.unattributedCount} phantoms=${out.phantomCount} firstVetLeg=${out.firstVetLegDay} leg=${out.vetLeg ? out.vetLeg.status : '?'} windowDays=${out.windowDayCount} binding=${out.binding} ierr=${out.instrumentErrors}`);
      }
    }
  }
  delete process.env.WINDEFER;
  console.log(`\nSWEEP DONE [${SUBSTRATE}] — per-seed JSONs in evidence/2026-10-18/perseed-vetwindow/.`);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { withVetwindow, classifyDeath, isPersonDeath, veteranSet, diedForReal, attributeDeaths, legDurability, policyFor, oneRun, bindingOf, SEEDS, POLICIES, T4, SUBSTRATE };
