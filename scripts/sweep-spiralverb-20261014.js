#!/usr/bin/env node
// scripts/sweep-spiralcond-20261014.js — scale-wall r28 arm 2 driver.
//
// Measures the CONDITIONAL wave-5 survival posture (scripts/policies/spiralverb.js,
// gate SPIRALVERB=1) layered on leadfeast (FEASTSCALE_R13=1):
//   baseline: leadfeast (FEASTSCALE_R13=1, SPIRALVERB off)
//   armed:    spiralverb (FEASTSCALE_R13=1, SPIRALVERB=1)
// THE CONDITION (evidence/2026-10-14/sim-spiralcond.md, r28 trigger rebuilt):
// post-unlock window, engage iff >=2 spiral markers fire in a trailing 21d
// window (death acceleration, pantry trajectory, succession feed); disengage
// after 7 rolling days below 2 markers. THE VERB FORK (new — answers the
// SPIRAL-TYPE-MISMATCH blank): combat spirals (accel/feed dominate, or all
// three) get the r28 homebound verbs; pantry spirals (pantry-trajectory
// without both combat markers) get haul/forage priority with ranging OPEN.
// 8 pilot seeds (11/22/33/44/55/66/77/88), 180d death-aware, identical seeds.
// Key seeds: s44 (pantry-spiral — must not repeat the r28 -44d), s22
// (combat/attrition — must not regress the r28 +58d).
//
// PRE-REGISTERED (evidence/2026-10-14/sim-spiralverb.md — MEASUREMENT §§9-12,14):
//   PRIMARY: mean post-unlock survival days among wave-5 unlockers
//     >= baseline + 15d.
//   GUARDRAILS: overall median survival >= baseline-10d; table among
//     unlockers >= baseline; national >= baseline-1.
//   THIN-N RULE: if unlocks < 2 on BOTH sides → UNMEASURABLE → kill per §9,
//     no confirm spend.
//   A miss is NO-GO — never re-scored mid-run.
//
// TOOLING ONLY — no game balance changes.
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
const { spiralverb } = require('./policies/spiralverb');
const { attachScale, scaleRow, finalizeScale } = require('./scale-repro-20261013');
const { attachFeast, finalizeFeast } = require('./sweep-feastscale-20261013');
const fc = require('./food-coupling-20261013');

const POLICY_REGISTRY = { leadfeast, spiralverb };

function standingRow(Game) {
  try {
    const s = Game.villageStanding();
    return {
      total: s.total | 0, war: s.war | 0, diplomacy: s.diplomacy | 0, plenty: s.plenty | 0,
      warPts: s.warPts | 0, links: s.links | 0, feasts: s.feasts | 0,
    };
  } catch (e) { return null; }
}
function scholarDay(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function unlockedWave(Game) { try { return (Game.unlockedWave ? Game.unlockedWave() : 1) | 0; } catch (e) { return 1; } }

// light table-approach instrument (r17 tablerecon, trimmed): best-ever seat,
// deed-gate wave rungs, waiting/done days
function tableRow(Game) {
  const r = { seat: 'none', gw: [0, 0, 0, 0, 0], gok: false, waiting: false, done: false };
  try { const s = Game.tableSeat ? Game.tableSeat() : null; if (s) r.seat = s.seat || 'none'; } catch (e) {}
  try { const g = Game.deedGateReady ? Game.deedGateReady() : null; if (g) r.gw = [g.w1 | 0, g.w2 | 0, g.w3 | 0, g.w4 | 0, g.w5 | 0], r.gok = !!g.ok; } catch (e) {}
  try { const pg = Game.progState(); r.waiting = !!pg.tableWaiting; r.done = !!pg.tableDone; } catch (e) {}
  return r;
}

const SAY_RE = /brace|posture|fifth wave|wave-5|table|seat|haven|monster|beast|fight|defend|feast|starv|died|dead|succession|ranging|scholars lost|pantry|forage|haul|bins echoing/i;

async function main() {
  const label = process.env.LEVER || 'spiralverb';
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'leadfeast,spiralverb').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const t0 = Date.now();
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    // opt-in gates per policy: the conditional posture layer runs only on condfeast
    process.env.FEASTSCALE_R13 = '1';
    if (pid === 'spiralverb') process.env.SPIRALVERB = '1';
    else delete process.env.SPIRALVERB;
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'spiralverb-' + pid });
      await setupGame(Game);
      const m = fc.attachInstruments(Game);
      attachScale(Game, m);
      const ft = attachFeast(Game);
      // bounded say capture for the window-day sense test
      const sayCap = { lines: [] };
      const origSay = Game.say ? Game.say.bind(Game) : null;
      Game.say = function (msg) {
        try {
          // the posture's own brace line fires at the latch, so the capture
          // budget is reserved for window days — early-game chatter would
          // otherwise saturate the 300-line cap before the window opens.
          if (run.unlockDay5 != null && scholarDay(Game) >= run.unlockDay5) {
            const text = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
            if (SAY_RE.test(text) && sayCap.lines.length < 300) {
              sayCap.lines.push({ day: scholarDay(Game), text: text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 240) });
            }
          }
        } catch (e) {}
        return origSay ? origSay(msg) : msg;
      };
      const st = { max: { total: 0, war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0 } };
      const tb = { seat: 'none', seatDay: null, gw: [0, 0, 0, 0, 0], gok: false, waitingDay: null, doneDay: null };
      const run = { unlockDay5: null, lastCtx: null, scholarVids: [], unlockSample: null, wcEngageDays: 0 };
      // DRIVER-SIDE scholar-death history (policy-independent — the baseline
      // policy doesn't track; succession replaces state.scholar.villagerId).
      const vidOf = (G) => { try { const sc = (G.state || {}).scholar || {}; return sc.villagerId || sc.id || null; } catch (e) { return null; } };
      const livingNPCsOf = (G) => {
        try {
          const v = (G.state || {}).village || {}, sid = G.villagerId;
          return (v.roster || []).filter(id => {
            if (id === sid) return false;
            try { if ((G.getPerson(id) || {}).dead) return false; } catch (e) {}
            return true;
          }).length;
        } catch (e) { return -1; }
      };
      const pantryDaysOf = (G) => { try { return G.pantryDaysEstimate ? Math.min(999, G.pantryDaysEstimate()) : -1; } catch (e) { return -1; } };
      const pantryKcalOf = (G) => { try { return ((G.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return -1; } };
      const origDaily = base.daily;
      const policy = Object.assign({}, base);
      policy.daily = (G, ctx) => {
        try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
        try { m.scale.daily.push(scaleRow(G)); } catch (e) {}
        try {
          const r = standingRow(G);
          if (r) for (const k of Object.keys(st.max)) if (r[k] > st.max[k]) st.max[k] = r[k];
        } catch (e) {}
        try {
          const day = scholarDay(G), vid = vidOf(G);
          const prev = run.scholarVids.length ? run.scholarVids[run.scholarVids.length - 1] : null;
          if (prev && prev.vid && vid && prev.vid !== vid) run.scholarVids.push({ day, vid, died: true });
          else if (!prev || prev.day !== day) run.scholarVids.push({ day, vid, died: false });
          if (run.unlockDay5 == null && unlockedWave(G) >= 5) {
            run.unlockDay5 = day;
            const deaths = run.scholarVids.filter(e => e.died && e.day > day - 30);
            run.unlockSample = {
              scholarDeaths30d: deaths.length,
              livingNPCs: livingNPCsOf(G),
              pantryDays: pantryDaysOf(G),
              pantryKcal: Math.round(pantryKcalOf(G)),
            };
          }
          if (ctx && ctx._wcEngaged) run.wcEngageDays++;
        } catch (e) {}
        try {
          if (scholarDay(G) % 5 === 0) {
            const tr = tableRow(G);
            const so = { none: 0, lesser: 1, full: 2 }[tr.seat] || 0;
            const bo = { none: 0, lesser: 1, full: 2 }[tb.seat] || 0;
            if (so > bo) { tb.seat = tr.seat; tb.seatDay = scholarDay(G); }
            for (let i = 0; i < 5; i++) tb.gw[i] = Math.max(tb.gw[i], tr.gw[i]);
            tb.gok = tb.gok || tr.gok;
            if (tr.waiting && tb.waitingDay == null) tb.waitingDay = scholarDay(G);
            if (tr.done && tb.doneDay == null) tb.doneDay = scholarDay(G);
          }
        } catch (e) {}
        if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
        run.lastCtx = ctx;
      };
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      const fin = standingRow(Game) || { total: 0, war: 0, diplomacy: 0, plenty: 0, warPts: 0, links: 0, feasts: 0 };
      const feas = finalizeFeast(Game, ft);
      const c = run.lastCtx || {};
      const windowSay = run.unlockDay5 != null
        ? sayCap.lines.filter(l => l.day >= run.unlockDay5).slice(0, 120)
        : [];
      const row = Object.assign({ label, policy: pid, seed },
        fc.finalize(Game, m, result), finalizeScale(Game, m), finalizeFeast(Game, ft),
        {
          standingMax: st.max, standingFinal: fin,
          t4Ever: st.max.total >= 100, t5Ever: st.max.total >= 200,
          arc: (Game.progState ? (Game.progState() || {}).arc : null) || null,
          deaths: (result.samples && result.samples.deaths) || [],
          unlockDay5: run.unlockDay5,
          postUnlockDays: run.unlockDay5 != null ? (result.days - run.unlockDay5) : null,
          seat: tb.seat, seatDay: tb.seatDay, deedGateWaves: tb.gw, deedGateOk: tb.gok,
          tableWaitingDay: tb.waitingDay, tableDoneDay: tb.doneDay,
          wcActive: c.wcActive || 0,
          wcEngages: c._wcEngages || 0, wcDisengages: c._wcDisengages || 0,
          wcEngageDays: run.wcEngageDays,
          wcScholarDeaths: (c._wcScholarDeaths || []).length,
          wcMonsterTileDeclined: c.wcMonsterTileDeclined || 0,
          wcFarTravelDeclined: c.wcFarTravelDeclined || 0,
          wcProposalsPaused: c.wcProposalsPaused || 0,
          wcTopUpFeasts: c.wcTopUpFeasts || 0,
          wcHomeReturns: c.wcHomeReturns || 0,
          scEngageDays: c._scEngageDays || [],
          scDisengageDays: c._scDisengageDays || [],
          scMarkerHist: c._scMarkerHist || [],
          scFeedDays: c._scFeedDays || [],
          scScholarDeaths: c._scScholarDeaths || [],
          svEngageTypes: c._svEngageTypes || [],
          svCombatEngageDays: c._svCombatEngageDays || 0,
          svPantryEngageDays: c._svPantryEngageDays || 0,
          wvForageTrips: c.wvForageTrips || 0,
          wvHauled: c.hauled || 0,
          u5ScholarDeaths30d: run.unlockSample ? run.unlockSample.scholarDeaths30d : null,
          u5LivingNPCs: run.unlockSample ? run.unlockSample.livingNPCs : null,
          u5PantryDays: run.unlockSample ? run.unlockSample.pantryDays : null,
          u5PantryKcal: run.unlockSample ? run.unlockSample.pantryKcal : null,
          windowSay,
        });
      rows.push(row);
      const l = row.standingMax;
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} stand=${l.total}(w${l.war}/b${l.diplomacy}/p${l.plenty}) wave=${feas.unlockedWave} u5day=${row.unlockDay5 != null ? row.unlockDay5 : '-'} postU=${row.postUnlockDays != null ? row.postUnlockDays : '-'} nat=${row.nationalHeldDays > 0 ? 1 : 0} table=${row.table} seat=${row.seat} wp=${row.wpActive}`);
    }
  }
  delete process.env.SPIRALVERB;
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const mean = (vs) => vs.length ? vs.reduce((t, v) => t + v, 0) / vs.length : null;
  const per = (pid) => rows.filter(r => r.policy === pid);
  const sum = (rs, fn) => rs.reduce((t, r) => t + fn(r), 0);
  const causeTallies = {};
  for (const r of rows) for (const d of r.deaths) {
    const k = (d.kind || 'unknown') + '/' + (d.player ? 'player' : 'villager');
    causeTallies[k] = (causeTallies[k] || 0) + 1;
  }
  const agg = (pid) => {
    const rs = per(pid);
    const unl = rs.filter(r => r.unlockDay5 != null);
    const postU = unl.map(r => r.postUnlockDays);
    return {
      policy: pid, runs: rs.length,
      wave5unlock: unl.length,
      unlockDays: unl.map(r => r.unlockDay5),
      meanPostUnlock: mean(postU) != null ? +mean(postU).toFixed(1) : null,
      medPostUnlock: postU.length ? med(postU) : null,
      tableAmongUnlockers: sum(unl, r => (r.table ? 1 : 0)),
      seatAmongUnlockers: unl.map(r => r.seat).join(','),
      national: sum(rs, r => (r.nationalHeldDays > 0 ? 1 : 0)),
      table: sum(rs, r => r.table),
      won: sum(rs, r => r.won),
      vests: sum(rs, r => r.vests),
      exiled: sum(rs, r => (r.exiledEver ? 1 : 0)),
      medianDays: med(rs.map(r => r.days)),
      maxDays: Math.max(...rs.map(r => r.days)),
      medianArc: med(rs.map(r => (r.arc || 1))),
      t5: sum(rs, r => (r.t5Ever ? 1 : 0)),
      feasts: sum(rs, r => r.feasts),
      wcActiveRuns: sum(rs, r => r.wcActive),
      wcEngages: sum(rs, r => r.wcEngages),
      wcDisengages: sum(rs, r => r.wcDisengages),
      wcEngageDays: sum(rs, r => r.wcEngageDays),
      wcMonsterTileDeclined: sum(rs, r => r.wcMonsterTileDeclined),
      wcFarTravelDeclined: sum(rs, r => r.wcFarTravelDeclined),
      wcProposalsPaused: sum(rs, r => r.wcProposalsPaused),
      wcTopUpFeasts: sum(rs, r => r.wcTopUpFeasts),
      wcHomeReturns: sum(rs, r => r.wcHomeReturns),
      svPantryEngages: sum(rs, r => (r.svEngageTypes || []).filter(t => t === 'pantry').length),
      svCombatEngages: sum(rs, r => (r.svEngageTypes || []).filter(t => t === 'combat').length),
      svPantryEngageDays: sum(rs, r => r.svPantryEngageDays),
      svCombatEngageDays: sum(rs, r => r.svCombatEngageDays),
      wvForageTrips: sum(rs, r => r.wvForageTrips),
      wvHauled: sum(rs, r => r.wvHauled),
    };
  };
  const s = {
    label, runs: rows.length, days, ms: Date.now() - t0,
    perPolicy: policyIds.map(agg), deathCauses: causeTallies,
  };
  console.log('\n== per-policy ==');
  for (const a of s.perPolicy) console.log(' ', JSON.stringify(a));
  console.log('deathCauses:', JSON.stringify(causeTallies));
  const out = process.env.OUT;
  const rep = { summary: s, rows };
  if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  else console.log(JSON.stringify(s.perPolicy));
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}
