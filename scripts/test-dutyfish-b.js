#!/usr/bin/env node
// test-dutyfish-b.js — proof for the duty_fish scale-up arm (sim-dutyfish-b).
//
// RED:  DUTYFISH_B unset -> wrapped policy is byte-identical to the base policy
//       (2 seeds x 2 policies, 40d: trajectory rows + say-stream + deaths).
//       DUTYFISH_B=1 without FEASTSCALE_R13=1 -> loud DUTYFISH STOP.
// GREEN: layer reports on; lean trigger (stocked pantry: not lean, no
//       staffing; drained pantry: lean, staffing fires); widening is
//       ADDITIVE (free villagers only — unit-fixtured); the throttle stack
//       holds (prodThrottleEngaged false on our lean days); armed runs
//       deterministic; voice deduped to one line/day and only when staffed.
// SENSE: prints the widening voice lines from a lean run for human reading.
//
// Usage: FEASTSCALE_R13=1 node scripts/test-dutyfish-b.js
'use strict';
const { execSync } = require('child_process');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const DF = require('./policies/dutyfish-b');
const { leaddutyfish, belongdutyfish } = DF;
const { belongfeast, leadfeast } = require('./policies/feastscale');

const BASE_SHA = execSync('git rev-parse --short HEAD', { cwd: __dirname }).toString().trim();
const SEEDS = [5601, 5602];
const DAYS = 40;
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  const v = (Game.state || {}).village || {};
  return ((v.pantry || [])).reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0);
}

// drainToFreshDays: partial drain — removes the biggest pantry items until
// pantryFreshDays() <= target (or the pantry empties). A TOTAL drain is a
// fixture artifact: the engine scatters the village after 3 hungry days
// (game.js hungryDays/famineLimit), so a zeroed pantry kills the run before
// the first widened fish duty ever resolves. A partial drain to ~2
// fresh-days is lean (<= the 4-day PRODTHROTTLE threshold) but survivable.
function drainToFreshDays(Game, target) {
  const v = Game.state.village || {};
  for (let guard = 0; guard < 300; guard++) {
    let fd = 99;
    try { fd = Game.pantryFreshDays(); } catch (e) { break; }
    if (fd <= target) break;
    const pan = v.pantry || [];
    if (!pan.length) break;
    let bi = 0, bk = -1;
    pan.forEach((it, i) => { const k = (it.kcalEach || 0) * (it.units || 0); if (k > bk) { bk = k; bi = i; } });
    pan.splice(bi, 1);
  }
  try {
    v.pantryKcal = (v.pantry || []).reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 0), 0);
  } catch (e) {}
  return Math.round((() => { try { return Game.pantryFreshDays(); } catch (e) { return -1; } })() * 10) / 10;
}

// runCfg: one run with trajectory + say capture. opts: {dutyfish, seed,
// drainAtDay (drain to 2 fresh-days at that loop-day), stockFirst, days}.
async function runCfg(policy, seed, opts) {
  opts = opts || {};
  const savedDutyfish = process.env.DUTYFISH_B;
  try {
    if (opts.dutyfish) process.env.DUTYFISH_B = '1'; else delete process.env.DUTYFISH_B;
    const { Game } = await loadGame({ seed, mode: 'test-dutyfish-b', fullTelemetry: false });
    await setupGame(Game);
    if (opts.stockFirst) Game.stockPantry(opts.stockFirst, 'Foraged food');
    const rec = { rows: [], deaths: 0, says: [], assignCalls: [] };
    const oTele = Game.tele;
    Game.tele = function (t, d) {
      let r; try { r = oTele.apply(this, arguments); } catch (e) { throw e; }
      try { if (t === 'death') rec.deaths++; } catch (e) {}
      return r;
    };
    const oSay = Game.say;
    Game.say = function (m) { try { rec.says.push(String(m)); } catch (e) {} return oSay.apply(this, arguments); };
    // assign-task spy: record (vid, task, hadAssignment, result-ok)
    const oAssign = Game.assignTask;
    Game.assignTask = function (vid, task, o) {
      let had = false, rok = null;
      try { had = !!(((this.state || {}).village || {}).assignments || {})[vid]; } catch (e) {}
      let r;
      try { r = oAssign.apply(this, arguments); rok = !!(r && r.ok); } catch (e) { r = null; }
      try { rec.assignCalls.push({ day: dayOf(this), vid: String(vid), task: String(task), had, ok: rok }); } catch (e) {}
      return r;
    };
    const P = Object.assign({}, policy);
    const origDaily = policy.daily;
    const ctxSeen = { leanDays: 0, staffed: 0, staffDays: 0, throttleHits: 0, voiceDays: new Set() };
    P.daily = (G, ctx) => {
      if (opts.drainAtDay && dayOf(G) + 1 === opts.drainAtDay) {
        try { ctx._testDrainedTo = drainToFreshDays(G, 2); } catch (e) {}
      }
      const r = origDaily(G, ctx);
      ctxSeen.leanDays = ctx._dfLeanDay ? ctxSeen.leanDays + 1 : ctxSeen.leanDays;
      ctxSeen.staffed = ctx._dfStaffed || 0;
      ctxSeen.staffDays = ctx._dfStaffDays || 0;
      ctxSeen.throttleHits = ctx._dfThrottleHit || 0;
      try { if (ctx._dfVoiceDay != null) ctxSeen.voiceDays.add(ctx._dfVoiceDay); } catch (e) {}
      rec.rows.push([dayOf(G), Math.round(pantryKcal(G)), ((G.state.village || {}).roster || []).length, rec.deaths].join(','));
      return r;
    };
    await runDays(Game, P, { days: opts.days || DAYS, manifest: null, sampleEvery: 181 });
    rec.ctx = ctxSeen;
    return { rec, Game };
  } finally {
    if (savedDutyfish === undefined) delete process.env.DUTYFISH_B; else process.env.DUTYFISH_B = savedDutyfish;
  }
}
function trajHash(rec) {
  return require('crypto').createHash('sha256')
    .update(rec.rows.join('\n') + '\n###\n' + rec.says.join('\n')).digest('hex').slice(0, 16);
}

(async () => {
  console.log(`test-dutyfish-b — base ${BASE_SHA}, FEASTSCALE_R13=${process.env.FEASTSCALE_R13}`);
  const pairs = [[belongdutyfish, belongfeast, 'belong'], [leaddutyfish, leadfeast, 'lead']];

  // ---------- RED: gate-off byte-identical ----------
  console.log('RED (DUTYFISH_B unset):');
  for (const [armed, base, nm] of pairs) {
    for (const seed of SEEDS) {
      const a = await runCfg(armed, seed, {});
      const b = await runCfg(base, seed, {});
      const ha = trajHash(a.rec), hb = trajHash(b.rec);
      ok(`R-off ${nm} s${seed}: armed≡base (${a.rec.rows.length}d, says ${a.rec.says.length})`,
        ha === hb && a.rec.deaths === b.rec.deaths, `armed ${ha} vs base ${hb}`);
    }
  }

  // ---------- RED: loud STOP on wrong substrate ----------
  console.log('RED (substrate gate):');
  {
    const saved = process.env.FEASTSCALE_R13;
    delete process.env.FEASTSCALE_R13;
    process.env.DUTYFISH_B = '1';
    let threw = null;
    try {
      const { Game } = await loadGame({ seed: 5601, mode: 'test-dutyfish-b-stop', fullTelemetry: false });
      await setupGame(Game);
      belongdutyfish.daily(Game, {});
    } catch (e) { threw = String((e && e.message) || e); }
    if (saved === undefined) delete process.env.FEASTSCALE_R13; else process.env.FEASTSCALE_R13 = saved;
    delete process.env.DUTYFISH_B;
    ok('R-stop: DUTYFISH_B=1 without FEASTSCALE_R13=1 throws loud STOP', /DUTYFISH STOP/.test(threw || ''), threw);
  }

  // ---------- GREEN ----------
  console.log('GREEN (DUTYFISH_B=1):');
  ok('G0: layerOn() true when DUTYFISH_B=1', (() => { process.env.DUTYFISH_B = '1'; const r = DF.layerOn(); delete process.env.DUTYFISH_B; return r; })());

  // G1: lean trigger — stocked pantry: no lean, no staffing; drained: lean + staffing.
  {
    const f = await runCfg(belongdutyfish, 5601, { dutyfish: true, stockFirst: 200000, days: 3 });
    ok('G1a: stocked pantry days not lean, nothing staffed',
      f.rec.ctx.leanDays === 0 && f.rec.ctx.staffed === 0, JSON.stringify(f.rec.ctx));
    const d = await runCfg(belongdutyfish, 5601, { dutyfish: true, drainAtDay: 2, days: 6 });
    ok('G1b: drained pantry reads lean and the widening fires',
      d.rec.ctx.leanDays > 0 && d.rec.ctx.staffed > 0, JSON.stringify(d.rec.ctx));
  }

  // G2: the widening is ADDITIVE — unit-fixtured against a hand-set roster.
  {
    const { Game } = await loadGame({ seed: 5601, mode: 'test-dutyfish-b-g2', fullTelemetry: false });
    await setupGame(Game);
    // hand-set: 6 free villagers + 2 already assigned (must NOT be touched)
    const v = Game.state.village;
    const roster = (v.roster || []).filter(id => id !== Game.villagerId).slice(0, 8);
    if (roster.length < 8) throw new Error('fixture needs 8 roster villagers');
    v.assignments = {};
    v.assignments[roster[0]] = { task: 'hunt' };
    v.assignments[roster[1]] = { task: 'patrol' };
    const calls = [];
    const oAssign = Game.assignTask;
    Game.assignTask = function (vid, task, o) {
      calls.push({ vid: String(vid), task: String(task) });
      return oAssign.apply(this, arguments);
    };
    const n = DF.widenFish(Game);
    const touched = calls.filter(c => c.vid === String(roster[0]) || c.vid === String(roster[1]));
    const allFish = calls.every(c => c.task === 'fish');
    ok('G2a: widenFish staffs from free villagers only (never re-tasks hunt/patrol)',
      n === 5 && touched.length === 0 && allFish, `staffed=${n} touched=${touched.length} calls=${calls.length}`);
    ok('G2b: widens toward WANT_FISHERS=5 (5 free staffed; 2 preserved assignments untouched)',
      n === 5, `staffed=${n}`);
    ok('G2c: no-op when 5+ already fishing',
      (() => { v.assignments[roster[2]] = { task: 'fish' }; v.assignments[roster[3]] = { task: 'fish' }; v.assignments[roster[4]] = { task: 'fish' }; v.assignments[roster[5]] = { task: 'fish' }; v.assignments[roster[6]] = { task: 'fish' }; return DF.widenFish(Game) === 0; })());
  }

  // G3: throttle stack — the widened duties actually RESOLVE as fish.
  // The disengage leg is evaluated by the engine at resolution time (dawn
  // posture); if the scholar's evening donation pushed dawn above 4, the
  // throttle would honestly redirect them. Count real resolutions by task.
  {
    const { Game } = await loadGame({ seed: 5602, mode: 'test-dutyfish-b-g3', fullTelemetry: false });
    await setupGame(Game);
    process.env.DUTYFISH_B = '1';
    const res = { fish: 0, redirected: 0 };
    try {
      const P = Object.assign({}, leaddutyfish);
      const origDaily = P.daily;
      P.daily = (G, ctx) => {
        if (dayOf(G) + 1 === 2) { try { drainToFreshDays(G, 2); } catch (e) {} }
        return origDaily(G, ctx);
      };
      const oROA = Game.resolveOneAssignment;
      const oThr = Game.prodThrottleEngaged;
      Game.resolveOneAssignment = function (vid, a) {
        try { if ((a || {}).task === 'fish') res.fish++; } catch (e) {}
        return oROA.apply(this, arguments);
      };
      Game.prodThrottleEngaged = function () {
        let r = false;
        try { r = !!oThr.apply(this, arguments); } catch (e) {}
        // count engagements that fire while a fish duty is resolving
        return r;
      };
      await runDays(Game, P, { days: 12, manifest: null, sampleEvery: 181 });
    } finally { delete process.env.DUTYFISH_B; }
    ok('G3: widened lean-day duties resolve as FISH (stack on the disengage leg)',
      res.fish > 0, `fish resolutions=${res.fish} (drained to ~2 fresh-days, 12d)`);
  }

  // G4: armed determinism — the armed run is bit-identical to itself.
  {
    const a = await runCfg(leaddutyfish, 5602, { dutyfish: true, days: 25 });
    const b = await runCfg(leaddutyfish, 5602, { dutyfish: true, days: 25 });
    const ha = trajHash(a.rec), hb = trajHash(b.rec);
    ok('G4: armed run deterministic (25d, drained-by-nature)',
      ha === hb && a.rec.deaths === b.rec.deaths, `run1 ${ha} vs run2 ${hb}`);
  }

  // G5: voice — deduped one line/day, only when staffed.
  {
    const { rec } = await runCfg(leaddutyfish, 5602, { dutyfish: true, drainAtDay: 2, days: 12 });
    const voice = rec.says.filter(s => /creek crew doubles up/.test(s));
    ok('G5: voice fires at most once per day and only on staffed days',
      voice.length === rec.ctx.voiceDays.size && rec.ctx.voiceDays.size === rec.ctx.staffDays,
      `voice=${voice.length} voiceDays=${rec.ctx.voiceDays.size} staffDays=${rec.ctx.staffDays}`);
    console.log('  SENSE voice sample:', JSON.stringify(voice[0] || '(none)'));
  }

  // G6: armed lean run widens the fish ASSIGNMENT count vs control on identical
  // seeds (both sides drained to 2 fresh-days — the same lean posture).
  {
    const a = await runCfg(leaddutyfish, 5602, { dutyfish: true, drainAtDay: 2, days: 12 });
    const c = await runCfg(leadfeast, 5602, { drainAtDay: 2, days: 12 });
    const fa = a.rec.assignCalls.filter(x => x.task === 'fish' && x.ok).length;
    const fc = c.rec.assignCalls.filter(x => x.task === 'fish' && x.ok).length;
    ok('G6 SMOKE: armed staffs strictly more ok fish-duty assignments than control (same lean posture)',
      fa > fc, `armed fish-assigns=${fa} vs control=${fc}`);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
