#!/usr/bin/env node
// scripts/sweep-tablerecon-20261013.js — TABLE RECON (flesh-out r17, ARM 2,
// scale-table arm — DIAGNOSTIC, no game changes).
//
// Baseline national is now 4/8 on the r1-r3 wall suite. The wall has moved
// past "reach national" into "what binds AT national scale?" This driver runs
// the 8-seed suite (seeds 11/22/33/44/55/66/77/88 x competent/winseek, 150d
// death-aware, gates off) with TABLE-APPROACH telemetry added on top of the
// scale-repro + food-coupling instruments, and names the binding constraint
// at national scale with measured numbers.
//
// Answers, per seed:
//   - seat approach: tableSeat() best-ever seat + named missing rungs
//     (lesser: w1-3 distinct faced, contests, crises, rank, stage, food
//     deeds; full: deedGateReady() w1-5, contests, crises, scale)
//   - tableWaiting/tableDone ever fired? (Arc IV reached?)
//   - of seeds reaching national: nationalFirstDay, nationalHeldDays,
//     postNationalDays, died-at-national or held-to-150?
//   - tribute/proposals/tends AT national scale (day >= nationalFirstDay)
//   - wave-4/5 unlocks: ever? (binding wave bar for the full seat)
//   - death causes at national scale: structured registerDeath wrap +
//     starvation signature post-national (pantry crash, starveDays)
//   - village story: say-line capture for the national/table beats
//     (sense-testing: a national village's story should read as a story)
//
// TOOLING ONLY — no game-code changes. Policies run plain (default gates).
//
// Usage:
//   SEEDS="11,22,33,44,55,66,77,88" POLICIES="competent,winseek" DAYS=150 \
//   OUT=evidence/2026-10-13/sim-scale-wall-r17-tablerecon.json \
//   node scripts/sweep-tablerecon-20261013.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { winseek } = require('./policies/winseek');
const fc = require('./food-coupling-20261013');
const sr = require('./scale-repro-20261013');

const POLICY_REGISTRY = { competent, winseek };
const day = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const SEAT_ORDER = { none: 0, lesser: 1, full: 2 };

// ---------- table telemetry instrument ----------
function tableRow(Game) {
  const row = {
    day: day(Game), seat: 'none', w: [0, 0, 0], cx: 0, cr: 0, rank: 'village',
    stage: 0, food: false, gw: [0, 0, 0, 0, 0], gok: false, gcx: 0, gcr: 0,
    grank: 'village', waiting: false, done: false, arc: 1,
  };
  try {
    const s = Game.tableSeat ? Game.tableSeat() : null;
    if (s) {
      row.seat = s.seat || 'none';
      const d = s.detail || {};
      row.w = [d.w1 | 0, d.w2 | 0, d.w3 | 0];
      row.cx = d.contestsN | 0; row.cr = d.crisesN | 0;
      row.rank = d.rank || 'village'; row.stage = d.stage | 0; row.food = !!d.foodDeeds;
    }
  } catch (e) {}
  try {
    const g = Game.deedGateReady ? Game.deedGateReady() : null;
    if (g) {
      row.gw = [g.w1 | 0, g.w2 | 0, g.w3 | 0, g.w4 | 0, g.w5 | 0];
      row.gok = !!g.ok; row.gcx = g.contestsN | 0; row.gcr = g.crisesN | 0;
      row.grank = g.rank || 'village';
    }
  } catch (e) {}
  try {
    const pg = Game.progState();
    row.waiting = !!pg.tableWaiting; row.done = !!pg.tableDone; row.arc = pg.arc | 0;
  } catch (e) {}
  // wave-ledger kill points: the wave-4/5 gate runs on these, not on faced
  try {
    row.wp = [1, 2, 3, 4].map(w => (typeof Game.waveLedgerPoints === 'function') ? (Game.waveLedgerPoints(w) | 0) : 0);
  } catch (e) { row.wp = [0, 0, 0, 0]; }
  return row;
}

function trackBest(t, r) {
  const b = t.best;
  for (let i = 0; i < 3; i++) b.w[i] = Math.max(b.w[i], r.w[i]);
  for (let i = 0; i < 5; i++) b.gw[i] = Math.max(b.gw[i], r.gw[i]);
  b.cx = Math.max(b.cx, r.cx); b.cr = Math.max(b.cr, r.cr);
  b.gcx = Math.max(b.gcx, r.gcx); b.gcr = Math.max(b.gcr, r.gcr);
  b.stage = Math.max(b.stage, r.stage); b.food = b.food || r.food;
  const ro = RANK_ORDER[r.rank] || 0;
  if (ro > b.rankOrd) { b.rankOrd = ro; b.rank = r.rank; }
  const gro = RANK_ORDER[r.grank] || 0;
  if (gro > b.grankOrd) { b.grankOrd = gro; b.grank = r.grank; }
  const so = SEAT_ORDER[r.seat] || 0;
  if (so > b.seatOrd) { b.seatOrd = so; b.seat = r.seat; b.seatDay = r.day; }
  for (let i = 0; i < 4; i++) b.wp[i] = Math.max(b.wp[i], (r.wp || [0, 0, 0, 0])[i]);
  if (r.waiting && t.waitingDay == null) t.waitingDay = r.day;
  if (r.done && t.doneDay == null) t.doneDay = r.day;
  if (r.arc >= 4 && t.arc4Day == null) t.arc4Day = r.day;
  if (ro >= 2 && t.nationalFirstDay == null) t.nationalFirstDay = r.day;
}

function attachTable(Game, m) {
  const t = m.table = {
    rows: [],
    best: { w: [0, 0, 0], gw: [0, 0, 0, 0, 0], cx: 0, cr: 0, gcx: 0, gcr: 0,
            stage: 0, food: false, rankOrd: 0, rank: 'village', grankOrd: 0,
            grank: 'village', seatOrd: 0, seat: 'none', seatDay: null, wp: [0, 0, 0, 0] },
    waitingDay: null, doneDay: null, arc4Day: null, nationalFirstDay: null,
    sayLines: [], deaths: [],
  };
  // story capture: national/table/seat + death beats (bounded)
  const origSay = Game.say ? Game.say.bind(Game) : null;
  const RE = /table|national|seat|invit|tribute|🕯|died|dead|starv|moot|treaty|ascend/i;
  Game.say = function (msg) {
    try {
      const text = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
      if (RE.test(text) && t.sayLines.length < 500) {
        t.sayLines.push({ day: day(Game), text: text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 240) });
      }
    } catch (e) {}
    return origSay ? origSay(msg) : msg;
  };
  // structured death causes (registerDeath is the game's own choke point)
  const origReg = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
  if (origReg) {
    Game.registerDeath = function (opts) {
      const r = origReg(opts);
      try {
        const o = opts || {};
        if (t.deaths.length < 400) {
          t.deaths.push({
            day: day(Game), kind: String(o.kind || '?'),
            vid: String(o.villagerId || o.monsterId || '?').slice(0, 24),
            name: String(o.name || '?').slice(0, 40),
            cause: String(o.cause || '?').slice(0, 60),
          });
        }
      } catch (e) {}
      return r;
    };
  }
  return t;
}

function namedGaps(best) {
  // LESSER seat rungs (docs/TABLE.md): w1>=4 w2>=4 w3>=3 cx>=2 cr>=2
  // rank>=regional stage>=2 foodDeeds
  const lesser = [];
  if (best.w[0] < 4) lesser.push(`w1 ${best.w[0]}/4`);
  if (best.w[1] < 4) lesser.push(`w2 ${best.w[1]}/4`);
  if (best.w[2] < 3) lesser.push(`w3 ${best.w[2]}/3`);
  if (best.cx < 2) lesser.push(`contests ${best.cx}/2`);
  if (best.cr < 2) lesser.push(`crises ${best.cr}/2`);
  if (best.rankOrd < 1) lesser.push(`scale ${best.rank}<regional`);
  if (best.stage < 2) lesser.push(`stage ${best.stage}/2`);
  if (!best.food) lesser.push('food-deeds');
  // FULL seat rungs (deedGateReady): w1-5 5/5/4/3/2, cx>=3 cr>=3,
  // scale national/global
  const full = [];
  const want = [5, 5, 4, 3, 2];
  for (let i = 0; i < 5; i++) if (best.gw[i] < want[i]) full.push(`w${i + 1} ${best.gw[i]}/${want[i]}`);
  if (best.gcx < 3) full.push(`contests ${best.gcx}/3`);
  if (best.gcr < 3) full.push(`crises ${best.gcr}/3`);
  if (best.grankOrd < 2) full.push(`scale ${best.grank}<national`);
  return { lesser, full };
}

function finalizeTable(Game, m) {
  const t = m.table;
  const s = m.scale || {};
  const b = t.best;
  const gaps = namedGaps(b);
  const out = {
    seatBest: b.seat, seatDay: b.seatDay,
    waitingDay: t.waitingDay, doneDay: t.doneDay, arc4Day: t.arc4Day,
    nationalFirstDay: t.nationalFirstDay,
    bestW: b.w.slice(), bestGW: b.gw.slice(), bestWP: (b.wp || [0, 0, 0, 0]).slice(),
    bestContests: b.cx, bestCrises: b.cr, bestStage: b.stage,
    bestFoodDeeds: b.food, bestRank: b.rank,
    lesserGap: gaps.lesser, fullGap: gaps.full,
    lesserMet: gaps.lesser.length === 0, fullMet: gaps.full.length === 0,
    tableRows: t.rows.length,
  };
  // post-national numbers (if national was ever reached)
  // nationalFirstDay at daily resolution (table rows are every-5-days)
  try {
    const daily = s.daily || [];
    for (const r of daily) {
      if (r.rank === 'national' || r.rank === 'global') {
        if (out.nationalFirstDay == null || r.day < out.nationalFirstDay) out.nationalFirstDay = r.day;
      }
    }
  } catch (e) {}
  const nf = out.nationalFirstDay;
  if (nf != null) {
    const daily = s.daily || [];
    const post = daily.filter(r => r.day >= nf);
    out.postNationalDays = ((m._days || 0) - nf);
    out.postNatRows = post.length;
    // starvation signature post-national
    const fcd = (m.daily || []).filter(r => r.day >= nf);
    out.postNatStarveDays = fcd.filter(r => r.starved).length;
    const pd = fcd.map(r => r.pantryDays).filter(x => x != null && x < 999).sort((a, b) => a - b);
    out.postNatPantryDaysMed = pd.length ? +pd[Math.floor(pd.length / 2)].toFixed(1) : null;
    // tribute / proposals / tends AT national scale
    out.tributePostNatK = +(s.tributes || []).filter(x => x.day >= nf).reduce((tt, x) => tt + (x.kcal || 0), 0) / 1000;
    out.tributePostNatK = +out.tributePostNatK.toFixed(1);
    out.proposalsPostNat = (s.proposals || []).filter(x => x.day >= nf).length;
    out.tendsPostNat = (s.tends || []).filter(x => x.day >= nf).length;
    out.linksAtNatEnd = (s.daily && s.daily.length) ? (s.daily[s.daily.length - 1].links || []).length : null;
  }
  // death causes: coarse shares from the structured hook
  const shares = {};
  for (const d of t.deaths) {
    const k = (d.kind || '?') + ':' + (d.cause || '?').split(' ')[0].slice(0, 28);
    shares[k] = (shares[k] || 0) + 1;
  }
  out.deathKinds = Object.entries(shares).sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([k, v]) => `${k}=${v}`);
  out.nDeaths = t.deaths.length;
  out.peopleDeaths = t.deaths.filter(d => d.kind === 'person' || d.kind === 'villager').length;
  // story lines: national/table/death beats, bounded
  out.storyLines = t.sayLines.slice(0, 160);
  out.storyLineCount = t.sayLines.length;
  return out;
}

async function runRecon(opts) {
  opts = opts || {};
  const label = opts.label || process.env.LEVER || 'tablerecon-r17';
  const seeds = opts.seeds || (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const policyIds = opts.policies || (process.env.POLICIES || 'competent,winseek').split(',').map(x => x.trim()).filter(Boolean);
  const days = opts.days || parseInt(process.env.DAYS || '150', 10);
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'tablerecon-' + pid });
      await setupGame(Game);
      const m = fc.attachInstruments(Game);
      sr.attachScale(Game, m);
      const t = attachTable(Game, m);
      const policy = Object.assign({}, base);
      const origDaily = base.daily;
      policy.daily = (G, ctx) => {
        try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
        try { m.scale.daily.push(sr.scaleRow(G)); } catch (e) {}
        try {
          const d = day(G);
          if (d % 5 === 0) { const r = tableRow(G); t.rows.push(r); trackBest(t, r); }
        } catch (e) {}
        if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
      };
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      m._days = result.days;
      try { const rf = tableRow(Game); t.rows.push(rf); trackBest(t, rf); } catch (e) {}
      const row = Object.assign(
        { label, policy: pid, seed, commit: '' },
        fc.finalize(Game, m, result),
        sr.finalizeScale(Game, m),
        finalizeTable(Game, m)
      );
      rows.push(row);
      console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} rank=${row.rank} ` +
        `natFirst=${row.nationalFirstDay == null ? '-' : row.nationalFirstDay} held=${row.nationalHeldDays || 0}d ` +
        `seat=${row.seatBest}${row.seatDay != null ? '@' + row.seatDay : ''} ` +
        `arc4=${row.arc4Day == null ? '-' : row.arc4Day} wait=${row.waitingDay == null ? '-' : row.waitingDay} ` +
        `w45=[${(row.bestGW || []).slice(3).join(',')}] w3pts=${(row.bestWP || [0,0,0,0])[2]} ` +
        `lesserGap=[${row.lesserGap.join(' ')}] fullGap=[${row.fullGap.join(' ')}] ` +
        `ppl=${row.peopleDeaths} starv=${row.starveDays}`);
    }
  }
  const agg = (fn) => rows.reduce((x, r) => x + (fn(r) || 0), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const summary = {
    label, seeds, policies: policyIds, days, runs: rows.length,
    national: agg(r => (r.nationalFirstDay != null ? 1 : 0)),
    seatEver: { full: agg(r => r.seatBest === 'full' ? 1 : 0), lesser: agg(r => r.seatBest === 'lesser' ? 1 : 0) },
    tableWaitingEver: agg(r => r.waitingDay != null ? 1 : 0),
    tableDoneEver: agg(r => r.doneDay != null ? 1 : 0),
    arc4Ever: agg(r => r.arc4Day != null ? 1 : 0),
    won: agg(r => r.won), table: agg(r => r.table),
    medianDays: med(rows.map(r => r.days)),
    maxDays: Math.max(0, ...rows.map(r => r.days)),
    nationalHeldDaysMed: med(rows.filter(r => r.nationalFirstDay != null).map(r => r.nationalHeldDays || 0)),
    wave45Ever: agg(r => (r.bestGW[3] || 0) > 0 || (r.bestGW[4] || 0) > 0 ? 1 : 0),
    vests: agg(r => r.vests), exiled: agg(r => r.exiledEver || 0),
    peopleDeaths: agg(r => r.peopleDeaths || 0),
    starveDays: agg(r => r.starveDays || 0),
    // most common missing rungs across seeds
    lesserGapCounts: {}, fullGapCounts: {},
  };
  for (const r of rows) {
    for (const g of (r.lesserGap || [])) {
      const k = g.replace(/\s+\d+\/\d+/, '');
      summary.lesserGapCounts[k] = (summary.lesserGapCounts[k] || 0) + 1;
    }
    for (const g of (r.fullGap || [])) {
      const k = g.replace(/\s+\d+\/\d+/, '');
      summary.fullGapCounts[k] = (summary.fullGapCounts[k] || 0) + 1;
    }
  }
  return { summary, rows };
}

if (require.main === module) {
  (async () => {
    const t0 = Date.now();
    const rep = await runRecon({});
    const s = rep.summary;
    console.log(`\n=== ${s.label} === policies=[${s.policies.join(',')}] seeds=[${s.seeds.join(',')}] days=${s.days} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    console.log(`wall: nationalFirst ${s.national}/${s.runs} tableWaiting ${s.tableWaitingEver}/${s.runs} tableDone ${s.tableDoneEver}/${s.runs} arc4 ${s.arc4Ever}/${s.runs} won ${s.won}/${s.runs} medianDays ${s.medianDays} maxDays ${s.maxDays}`);
    console.log(`seats ever: full ${s.seatEver.full} lesser ${s.seatEver.lesser} | national held-days median ${s.nationalHeldDaysMed} | wave4/5 ever ${s.wave45Ever}/${s.runs} | vests ${s.vests} | exiled ${s.exiled}/${s.runs} | peopleDeaths ${s.peopleDeaths} | starveDays ${s.starveDays}`);
    console.log('lesser missing-rung counts:', JSON.stringify(s.lesserGapCounts));
    console.log('full missing-rung counts:', JSON.stringify(s.fullGapCounts));
    const out = process.env.OUT;
    if (out) { fs.writeFileSync(out, JSON.stringify(rep, null, 1)); console.error('wrote ' + out); }
  })().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runRecon, attachTable, tableRow, trackBest, namedGaps, finalizeTable };
