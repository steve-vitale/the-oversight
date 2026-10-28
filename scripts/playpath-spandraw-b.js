#!/usr/bin/env node
// playpath-spandraw-b.js — real-play ability-tap instrument
// (sim-spandraw-playpath-b; prereg:
// evidence/2026-10-28/sim-spandraw-playpath-b-prereg.md, committed
// as 46afa322c BEFORE any judged census).
//
// MEASUREMENT ONLY: zero src/js changes. Each instance is a FRESH
// game (loadGame + setupGame via scripts/sim-harness.js), played
// with the competent policy for 2 lead days + 5 tap days. On each
// tap day, AFTER competent.daily (real game actions), the driver
// performs the tap sequence as the day's last player act: social
// keys open a conversation via Game.talkTo and keep it open;
// the button is read via Game._actionAvailable (the bar's read,
// null target); if and only if the button reads ok, the tap is
// issued through Game.activateAbility('ability.action') with NO
// target — the exact dispatcher a UI bar tap reaches. The driver
// NEVER sets dayTicks/dayPart, NEVER calls tickAction, NEVER
// tops up kcal/health: the tap's position is whatever the day's
// work left, recorded, never chosen.
//
// Captures install in CENSUS ORDER (stockdoors, then spoilvol,
// then mealdraw, then the nest logger OUTERMOST), verbatim logic
// from scripts/probe-spandraw-design-b.js. Every tap records its
// nest evt window so the analyzer judges ONLY tap-window spans;
// policy spans (e.g. cultivate inside competent.daily) fall
// outside every window and are excluded.
//
// Env (all substrate gates asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   SEEDS="10040,...,10047" (default judged pilot band)
//   KEYS="ability.action,..." (default: all 15 prereg keys)
//   OUTDIR (default evidence/2026-10-28/sim-spandraw-playpath-b-corpus)
//   LEAD=2 TAPDAYS=5
// Output per instance: playpath-b-s<seed>-<ability>.<action>.json
// Write transport mirrors the census/design sweeps: failed writes
// are kept in memory and flushed at the end (EPERM flap waited
// out, never forced); deadline exhaustion stages inside this
// worktree (.spandraw-playpath-staging, never /tmp) and exits loudly.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { installStockdoorsCapture } = require('./stockdoors-capture-raidcallers');
const { installMealDrawCapture } = require('./mealdraw-capture');
const { installSpoilvolCapture } = require('./spoilvol-capture');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }

const SEEDS = (process.env.SEEDS || '10040,10041,10042,10043,10044,10045,10046,10047')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const LEAD = parseInt(process.env.LEAD || '2', 10);
const TAPDAYS = parseInt(process.env.TAPDAYS || '5', 10);
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-spandraw-playpath-b-corpus');
const STAGING_DIR = path.join(__dirname, '..', '.spandraw-playpath-staging');

const PREREG_KEYS = [
  'tracker.track', 'thief.steal_pantry', 'game_sense.read_sign',
  'patient_aim.clean_shot', 'stalk.stalk_prey', 'blood_trail.follow_blood',
  'ambush.lay_wait', 'animal_ken.read_beast', 'scarecrow.stage_injury',
  'molt.shed_skin', 'fear_aura.menace',
  'intimidating_presence.end_it_before', 'war_cry.challenge',
  'trophy_room.mark', 'long_table.share_pot',
];
const SOCIAL_KEYS = new Set(['fear_aura.menace', 'intimidating_presence.end_it_before', 'war_cry.challenge']);

function realSleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) { try { require('child_process').execSync('sleep ' + (ms / 1000)); } catch (e2) {} }
}
function tryWrite(filePath, data, attempts) {
  for (let i = 0; i < attempts; i++) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, data);
      const back = fs.readFileSync(filePath, 'utf8');
      if (back !== data) throw new Error('readback mismatch');
      JSON.parse(back);
      return true;
    } catch (e) {
      if (i === attempts - 1) return false;
      realSleepMs(2000);
    }
  }
  return false;
}

function loadAbilityDefs() {
  const abs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'abilities.json'), 'utf8'));
  const map = {};
  for (const a of abs) for (const act of (a.actions || [])) map[a.id + '.' + act.id] = { ability: a.id, action: act.id, context: act.context || 'explore', cost: act.cost || {}, actObj: act };
  return map;
}

async function oneInstance(seed, key, defs) {
  const [aid, actId] = key.split('.');
  const def = defs[key];
  if (!def) throw new Error('unknown key ' + key);
  const { Game } = await loadGame({ seed, mode: 'playpath-spandraw-b', fullTelemetry: false });
  const stockdoors = installStockdoorsCapture(Game);
  const spoilvol = installSpoilvolCapture(Game);
  const mealdraw = installMealDrawCapture(Game, { mealdrawCap: 50000 });
  // Nest logger, verbatim pattern, OUTERMOST (installed last).
  const nestEvents = [];
  let nestEvt = 0, nestDepth = 0;
  function nestDay() { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
  function nestFrames() {
    try {
      const lines = String(new Error().stack || '').split('\n').slice(1);
      const out = [];
      for (const ln of lines) {
        if (/nestFrames|wrappedPlaypathUse|wrappedPlaypathDraw/.test(ln)) continue;
        const m = ln.match(/at\s+(?:async\s+)?([^\s(]+)/);
        out.push(m ? m[1] : ln.trim().slice(0, 80));
        if (out.length >= 8) break;
      }
      return out;
    } catch (e) { return []; }
  }
  {
    const origUse = Game.useAbility;
    if (typeof origUse === 'function' && !origUse.__playpathInstalled) {
      const wrappedPlaypathUse = function (...args) {
        const depth = nestDepth++;
        const directBefore = (() => { try { return stockdoors.directRecords.length; } catch (e) { return -1; } })();
        nestEvents.push({ evt: ++nestEvt, kind: 'spanEnter', ability: String(args[0]), action: String(args[1]), day: nestDay(), depth, directBefore });
        let ret;
        try { ret = origUse.apply(this, args); } finally {
          const directAfter = (() => { try { return stockdoors.directRecords.length; } catch (e) { return -1; } })();
          nestEvents.push({ evt: ++nestEvt, kind: 'spanExit', ability: String(args[0]), action: String(args[1]), day: nestDay(), depth, directBefore, directAfter, result: ret });
          nestDepth--;
        }
        return ret;
      };
      wrappedPlaypathUse.__playpathInstalled = true;
      Game.useAbility = wrappedPlaypathUse;
    }
    const origDraw = Game.pantryDraw;
    if (typeof origDraw === 'function' && !origDraw.__playpathInstalled) {
      const wrappedPlaypathDraw = function (...args) {
        const frames = nestFrames();
        const want = args[1];
        nestEvents.push({ evt: ++nestEvt, kind: 'drawEnter', day: nestDay(), want: (want == null ? null : Math.round(want)), frames });
        const ret = origDraw.apply(this, args);
        try {
          const items = [];
          for (const d of (ret.items || [])) {
            const it = d.item || {};
            items.push({ name: (it.name == null ? null : String(it.name)), kcalEach: (it.kcalEach || 0), units: (d.units || 0), spoilDay: (it.spoilDay == null ? null : it.spoilDay) });
          }
          nestEvents.push({ evt: ++nestEvt, kind: 'drawExit', day: nestDay(), want: (want == null ? null : Math.round(want)), taken: Math.round(ret.taken || 0), items });
        } catch (e) {}
        return ret;
      };
      wrappedPlaypathDraw.__playpathInstalled = true;
      Game.pantryDraw = wrappedPlaypathDraw;
    }
  }
  // Say-line capture (read-only, capped): loadGame silenced say to a
  // no-op; wrapping it records the game's own lines, then no-ops.
  const sayLines = [];
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 20000) sayLines.push({ day: nestDay(), line: String(args[0] || '').slice(0, 400) }); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);
  const s = Game.state.scholar;
  // Grant fixture (setup, disclosed in prereg).
  let grantMethod = null;
  try {
    const abs = (s.abilities || []);
    if (!abs.some((a) => (a.id || a) === aid)) abs.push({ id: aid, level: 1 });
    s.abilities = abs;
    if (Game.hasAbility(aid)) grantMethod = 'abilities-push';
  } catch (e) { grantMethod = 'grant-error:' + String(e && e.message); }
  const grantOk = grantMethod === 'abilities-push';
  let openingKcal = null;
  try { openingKcal = spoilvol.snapshotPantry().freshKcal; } catch (e) {}

  const taps = [];
  let tapDayCount = 0;
  const policy = Object.assign({}, competent, {
    daily(Game2, ctx) {
      competent.daily(Game2, ctx);
      tapDayCount++;
      if (tapDayCount <= LEAD) return;
      if (Game2.over) { taps.push({ tapDay: tapDayCount, outcome: 'game-over', note: 'run ended before tap' }); return; }
      const s2 = Game2.state.scholar;
      const rec = { tapDay: tapDayCount, gameDayBefore: s2.day, dayTicksBefore: s2.dayTicks, dayPartBefore: Game2.dayPart,
        kcalBefore: Math.round(s2.kcal || 0), healthBefore: Math.round(s2.health || 0),
        atHavenBefore: !!(Game2.playerAtHaven && Game2.playerAtHaven()),
        inCombatBefore: !!(Game2.inCombat && Game2.inCombat()),
        killsBefore: Object.keys(Game2.state.villageSlain || {}).filter((k) => (Game2.state.villageSlain[k] || 0) > 0).length };
      if (rec.inCombatBefore) { rec.outcome = 'skipped'; rec.skipReason = 'in-combat'; taps.push(rec); return; }
      // Social keys: open a conversation and KEEP it open for the tap.
      let partner = null, convActive = false;
      if (SOCIAL_KEYS.has(key)) {
        try {
          const roster = (Game2.state.village.roster || []).filter((id) => id !== Game2.villagerId);
          for (const vid of roster) {
            const person = (typeof Game2.getPerson === 'function') ? Game2.getPerson(vid) : null;
            if (person && person.dead) continue;
            try { Game2.talkTo(vid); partner = vid; break; } catch (e) {}
          }
        } catch (e) {}
        try { const cv = (Game2.state.village.conv || {})[partner]; convActive = !!(cv && cv.active); } catch (e) {}
      }
      rec.convoPartner = partner; rec.convoActive = convActive;
      // Button read (bar read, null target) — the gate for a genuine attempt.
      let avail = null, availErr = null;
      try { avail = Game2._actionAvailable(aid, def.actObj); } catch (e) { availErr = String(e && e.message); }
      rec.buttonOk = !!(avail && avail.ok); rec.buttonWhy = avail ? (avail.why || null) : null; rec.buttonErr = availErr;
      if (!rec.buttonOk) {
        rec.outcome = 'button-refused';
        if (SOCIAL_KEYS.has(key) && partner) { try { Game2.endConvo(partner, 'left'); } catch (e) {} }
        taps.push(rec); return;
      }
      // Genuine tap: UI entry point, no target.
      rec.evtBefore = nestEvt; rec.sayBefore = sayLines.length; rec.directBefore = stockdoors.directRecords.length;
      let tapRes = null, tapErr = null;
      try { tapRes = Game2.activateAbility(key); } catch (e) { tapErr = String(e && (e.stack || e.message)); }
      rec.evtAfter = nestEvt; rec.sayAfter = sayLines.length;
      const s3 = Game2.state.scholar;
      rec.gameDayAfter = s3.day; rec.dayTicksAfter = s3.dayTicks; rec.dayPartAfter = Game2.dayPart;
      rec.kcalAfter = Math.round(s3.kcal || 0); rec.healthAfter = Math.round(s3.health || 0);
      rec.tapResult = (tapRes === undefined ? null : tapRes); rec.tapError = tapErr;
      rec.sayWindow = sayLines.slice(rec.sayBefore, rec.sayAfter).map((x) => x.line);
      rec.outcome = 'attempted';
      if (SOCIAL_KEYS.has(key) && partner) { try { Game2.endConvo(partner, 'left'); } catch (e) {} }
      taps.push(rec);
    },
  });
  const result = await runDays(Game, policy, { days: LEAD + TAPDAYS, manifest: null });
  return {
    seed, ability: aid, action: actId, context: def.context, key,
    grantOk, grantMethod, openingKcal,
    leadDays: LEAD, tapDaysPlanned: TAPDAYS,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    taps, nestEvents,
    directRecords: stockdoors.directRecords,
    mealDrawRecords: mealdraw.mealDrawRecords,
  };
}

(async () => {
  const defs = loadAbilityDefs();
  let keys = PREREG_KEYS;
  if (process.env.KEYS) {
    keys = process.env.KEYS.split(',').map((x) => x.trim()).filter(Boolean);
    for (const k of keys) if (!defs[k]) { console.error('FATAL: KEYS entry not in abilities.json: ' + k); process.exit(2); }
  }
  const pending = [];
  let done = 0;
  for (const seed of SEEDS) {
    for (const key of keys) {
      const inst = await oneInstance(seed, key, defs);
      done++;
      const att = inst.taps.filter((t) => t.outcome === 'attempted').length;
      const ref = inst.taps.filter((t) => t.outcome === 'button-refused').length;
      const skp = inst.taps.filter((t) => t.outcome === 'skipped').length;
      const name = `playpath-b-s${seed}-${key}.json`;
      const summary = `playpath seed=${seed} ${key} grant=${inst.grantOk} end=${inst.endReason} taps=${inst.taps.length} attempted=${att} button-refused=${ref} skipped=${skp} spansLogged=${inst.nestEvents.filter((e) => e.kind === 'spanEnter').length}`;
      const data = JSON.stringify(inst);
      if (tryWrite(path.join(OUTDIR, name), data, 6)) console.log(summary + ' written');
      else { pending.push({ name, data }); console.error(summary + ' WRITE PENDING (EPERM flap) — kept in memory'); }
    }
  }
  if (pending.length) {
    const deadline = Date.now() + 45 * 60 * 1000;
    while (pending.length && Date.now() < deadline) {
      for (let i = pending.length - 1; i >= 0; i--) {
        if (tryWrite(path.join(OUTDIR, pending[i].name), pending[i].data, 5)) {
          console.log('flushed pending ' + pending[i].name);
          pending.splice(i, 1);
        }
      }
      if (pending.length && Date.now() < deadline) realSleepMs(30000);
    }
  }
  if (pending.length) {
    for (const p of pending) {
      if (tryWrite(path.join(STAGING_DIR, p.name), p.data, 30)) console.error('STAGED (not evidence) ' + p.name);
      else console.error('STAGE FAIL LOUDLY ' + p.name);
    }
    console.error('PENDING STAGED: ' + pending.length + ' files in ' + STAGING_DIR + ' — copy to ' + OUTDIR + ' before judging');
    process.exit(3);
  }
  console.log('wrote ' + done + ' playpath files to ' + OUTDIR);
})().catch((e) => { console.error('PLAYPATH CRASH', e && (e.stack || e)); process.exit(2); });
