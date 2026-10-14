#!/usr/bin/env node
// gorge-census-20261014.js — wave-5 pantry-gorge instrument + before/after
// driver (scale-onramp r28 ARM 1, 2026-10-14).
//
// INSTRUMENT: captures gorge events (say-line "gorges at the treeline"),
// the lingering monster behind each (id, wave, hp — via a read-only
// havenGrowthDaily pre-snapshot, paired index-wise with the say lines and
// the raidPillage returns, all in havenGrowthDaily's iteration order),
// pantry kcal taken per event, and whether the monster was fought / killed /
// drove-off within 3 days, by whom (scholar / villager / drifted).
//
// DRIVER: 8-seed courtship road (seeds 11/22/33/44/55/66/77/88 x leadfeast),
// 180d death-aware, policy from scripts/policies/gorgedrive.js — the
// GORGEDRIVE env flag toggles the answer layer, identical seeds before/after.
//
// Pre-registered GO (evidence header): gorge-nights answered >= 50% AND
// post-unlock gorged kcal <= 50% of baseline. Guardrails: median survival >=
// baseline-10d; national >= baseline-2; scholar deaths/100d <= baseline x1.2.
//
// Usage:
//   SEEDS="11,22,33,44,55,66,77,88" DAYS=180 OUT=evidence/2026-10-14/gorge-baseline.json \
//     node scripts/gorge-census-20261014.js
//   GORGEDRIVE=1 OUT=evidence/2026-10-14/gorge-armed.json node scripts/gorge-census-20261014.js
//
// WRAPS=none skips every instrument wrap (honesty control — the proof test
// asserts wraps-all vs wraps-none byte-identical day hashes).
'use strict';
process.env.FEASTSCALE_R13 = '1';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { policyForRun } = require('./policies/gorgedrive');
const { stdSnapshot } = require('./sweep-compare');

const MONSTERS = require('../src/data/monsters.json');
const NAME_OF = {};
for (const m of MONSTERS) NAME_OF[m.id] = m.name || m.id;
const nameOf = (mid) => NAME_OF[mid] || mid || '?';

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const GORGE_RE = /gorges at the treeline/;
const KCAL_RE = /([\d,]+)\s*kcal/;
// sense-testing capture: the gorge beat and its neighborhood
const SAYRE = /gorges at the treeline|treeline|Drive it off|call for help|marches out|driven off|RAID|lingering/i;

function dayHash(Game) {
  try {
    const s = (Game.state || {}).scholar || {}, v = (Game.state || {}).village || {};
    let standing = 0;
    try { standing = Math.round(((Game.villageStanding ? Game.villageStanding() : null) || {}).total || 0); } catch (e) {}
    return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length,
      Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100),
      standing].join('|');
  } catch (e) { return 'ERR'; }
}
const gday = (G) => ((G && G.state && G.state.scholar) || {}).day || 0;

async function runOne(seed, opts) {
  opts = opts || {};
  const days = opts.days || 180;
  const wraps = opts.wraps || 'all';
  const instrErrors = [];
  const { Game } = await loadGame({ seed, mode: 'gorge', fullTelemetry: true });
  await setupGame(Game);

  const track = {
    unlockDay: {},
    entities: [],            // lingering entities ever seen: {ref,typeId,wave,hp0,firstDay,presentByDay:{}}
    lingerPreByDay: {},      // day -> [entity records] in havenGrowthDaily iteration order
    pillagesByDay: {},       // day -> [{take, got}] in call order
    gorgeSaysByDay: {},      // day -> [text] in call order
    villagerFights: [],      // {day, vid, mid} from resolveWildMonsterEncounter
    crisisRes: [],           // {day, resolution} from resolveAidCrisis
    sayLines: [],            // sense-testing transcript capture (bounded 800)
    dayHashes: [],
    tableDays: [],
    maxRank: 0, maxArc: 1,
    exiledEver: false,
    ctx: null,
  };

  if (wraps === 'all') {
    // havenGrowthDaily pre-snapshot: the lingering set BEFORE the gorge
    // loop runs, in iteration order. Read-only.
    try {
      const orig = Game.havenGrowthDaily.bind(Game);
      Game.havenGrowthDaily = function () {
        try {
          const d = gday(this);
          const list = [];
          let wms = [];
          try { wms = this.worldMonsters ? this.worldMonsters() : []; } catch (e) {}
          for (const m of wms) {
            if (!m || !m.lingering || (m.hp || 0) <= 0) continue;
            let rec = track.entities.find(e => e.ref === m);
            if (!rec) {
              // entities don't reliably carry `wave` — resolve from the def
              let wv = m.wave || null;
              if (!wv) { try { const def = MONSTERS.find(x => x.id === m.id); wv = (def && def.wave) || null; } catch (e) {} }
              rec = { ref: m, typeId: m.id, wave: wv, hp0: Math.round(m.hp || 0), firstDay: d, presentByDay: {} };
              track.entities.push(rec);
            }
            list.push(rec);
          }
          track.lingerPreByDay[d] = list;
        } catch (e) { instrErrors.push('lingerPre: ' + e.message); }
        return orig();
      };
    } catch (e) { instrErrors.push('lingerPreWrap: ' + e.message); }
    // raidPillage: the honest kcal number per gorging monster. Read-only.
    try {
      const orig = Game.raidPillage.bind(Game);
      Game.raidPillage = function (v, kcal) {
        const got = orig(v, kcal);
        try {
          const d = gday(this);
          (track.pillagesByDay[d] = track.pillagesByDay[d] || []).push({ take: kcal, got });
        } catch (e) {}
        return got;
      };
    } catch (e) { instrErrors.push('pillageWrap: ' + e.message); }
    // say: gorge lines + sense-testing neighborhood. Read-only.
    try {
      const origSay = Game.say ? Game.say.bind(Game) : null;
      Game.say = function (msg) {
        try {
          const text = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
          const clean = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
          if (GORGE_RE.test(clean)) {
            const d = gday(Game);
            (track.gorgeSaysByDay[d] = track.gorgeSaysByDay[d] || []).push(clean.slice(0, 260));
          } else if (SAYRE.test(clean) && track.sayLines.length < 800) {
            track.sayLines.push({ day: gday(Game), text: clean.slice(0, 240) });
          }
        } catch (e) {}
        return origSay ? origSay(msg) : msg;
      };
    } catch (e) { instrErrors.push('sayWrap: ' + e.message); }
    // resolveWildMonsterEncounter: villager answers. Read-only.
    try {
      const orig = Game.resolveWildMonsterEncounter.bind(Game);
      Game.resolveWildMonsterEncounter = function (vid, m, o) {
        try { track.villagerFights.push({ day: gday(this), vid, mid: m && m.id }); } catch (e) {}
        return orig(vid, m, o);
      };
    } catch (e) { instrErrors.push('vwfWrap: ' + e.message); }
    // resolveAidCrisis: explains valve drifts. Read-only.
    try {
      const orig = Game.resolveAidCrisis.bind(Game);
      Game.resolveAidCrisis = function (res) {
        try { track.crisisRes.push({ day: gday(this), resolution: res }); } catch (e) {}
        return orig(res);
      };
    } catch (e) { instrErrors.push('crisisWrap: ' + e.message); }
  }

  const basePolicy = policyForRun();
  const ctx = {};
  track.ctx = ctx;
  const policy = Object.assign({}, basePolicy);
  const origDaily = basePolicy.daily;
  policy.daily = (G, c2) => {
    try {
      const day = gday(G);
      const wv = (G.unlockedWave && G.unlockedWave()) || 1;
      for (let w = 1; w <= wv; w++) if (track.unlockDay[w] == null) track.unlockDay[w] = day;
      try { const pg = G.progState ? G.progState() : {}; if (pg.tableWaiting) track.tableDays.push(day); } catch (e) {}
      try { const s2 = stdSnapshot(G); track.maxRank = Math.max(track.maxRank, RANK_ORDER[s2.rank] || 0); track.maxArc = Math.max(track.maxArc, s2.arc || 1); } catch (e) {}
      try { if (G.state && G.state.exiled) track.exiledEver = true; } catch (e) {}
      if (opts.collectHashes) { try { track.dayHashes.push(day + ':' + dayHash(G)); } catch (e) {} }
      if (wraps === 'all') {
        // entity presence scan: is each known lingering entity still
        // pinned at the treeline? (drives the drove-off attribution)
        try {
          const wms = G.worldMonsters ? G.worldMonsters() : [];
          for (const e of track.entities) {
            e.presentByDay[day] = wms.includes(e.ref) && !!(e.ref.lingering) && (e.ref.hp || 0) > 0;
          }
        } catch (e) { instrErrors.push('presence: ' + e.message); }
      }
    } catch (e) { instrErrors.push('daily: ' + e.message); }
    if (origDaily) { try { return origDaily(G, c2); } catch (e) { instrErrors.push('origDaily: ' + e.message); } finally {
      // gorgeDrive writes its counters to the HARNESS ctx (c2), not the
      // driver's ctx — copy them out (driver bug caught 2026-10-14: the
      // first armed sweep reported eng=0 because it read the wrong object).
      try {
        if (c2) for (const k of ['gorgeEngagements', 'gorgeHeldHp', 'gorgeHeldAlone', 'gorgeHeldTable',
          'gorgeInvitesOk', 'gorgeInvitesRefused', 'gorgeDaysSaw', 'gorgeBlockedEarly', 'gorgeVerifyFailed']) {
          if (c2[k] !== undefined) ctx[k] = c2[k];
        }
      } catch (e) {}
    } }
  };

  const result = await quietLog(() => runDays(Game, policy, { days, sampleEvery: 10 }));
  const end = stdSnapshot(Game);

  // --- post-run assembly ---
  const tele = (Game.state || {}).telemetry || [];
  const combatStarts = tele.filter(e => e.type === 'combat_start')
    .map(e => ({ day: e.day, mid: e.vs, wave: e.wave || null }));
  const combatEnds = tele.filter(e => e.type === 'combat_end')
    .map(e => ({ day: e.day, result: e.result || null }));
  const scholarDeaths = (result.samples.deaths || []).filter(d => d.player);

  // gorge events: pair say lines <-> pre-snapshot <-> pillages per day
  const events = [];
  let attributionFails = 0;
  const gorgeDays = Object.keys(track.gorgeSaysByDay).map(Number).sort((a, b) => a - b);
  for (const d of gorgeDays) {
    const says = track.gorgeSaysByDay[d] || [];
    const pres = track.lingerPreByDay[d] || [];
    const pils = track.pillagesByDay[d] || [];
    const ok = (pres.length === says.length && pils.length === says.length);
    if (!ok) attributionFails += says.length;
    for (let i = 0; i < says.length; i++) {
      let kcal = null;
      const km = says[i].match(KCAL_RE);
      if (km) kcal = parseInt(km[1].replace(/,/g, ''), 10);
      events.push({
        day: d,
        typeId: ok ? pres[i].typeId : null,
        name: ok ? nameOf(pres[i].typeId) : null,
        wave: ok ? pres[i].wave : null,
        hpAtGorge: ok ? pres[i].hp0 : null,
        kcalTaken: ok ? pils[i].got : kcal,
        attributed: ok,
        _rec: ok ? pres[i] : null,
        say: says[i].slice(0, 160),
      });
    }
  }

  // answer attribution: fought/killed/drove-off within 3 days
  for (const ev of events) {
    if (!ev.attributed) { ev.answered = false; ev.answerKind = 'unattributed'; continue; }
    const d = ev.day, t = ev.typeId;
    const scholarF = combatStarts.filter(c => c.mid === t && c.day >= d && c.day <= d + 3);
    const villagerF = track.villagerFights.filter(f => f.mid === t && f.day >= d && f.day <= d + 3);
    let driftDay = null;
    if (ev._rec) {
      for (let dd = d + 1; dd <= d + 3; dd++) {
        if (ev._rec.presentByDay[dd] === false) { driftDay = dd; break; }
      }
    }
    const valveNear = track.crisisRes.some(c => c.resolution === 'moved-on' && c.day >= d && c.day <= d + 3);
    ev.scholarFights = scholarF.map(f => f.day);
    ev.villagerFights = villagerF.map(f => ({ day: f.day, vid: f.vid }));
    ev.driftDay = driftDay;
    ev.valveNear = valveNear;
    if (scholarF.length) { ev.answered = true; ev.answerKind = 'scholar'; ev.answerDay = scholarF[0].day; }
    else if (villagerF.length) { ev.answered = true; ev.answerKind = 'villager'; ev.answerDay = villagerF[0].day; ev.answerBy = villagerF[0].vid; }
    else if (driftDay != null) { ev.answered = true; ev.answerKind = valveNear ? 'drifted-valve' : 'drifted'; ev.answerDay = driftDay; }
    else { ev.answered = false; ev.answerKind = 'none'; }
    delete ev._rec;
  }

  const U = track.unlockDay[5] != null ? track.unlockDay[5] : null;
  const answered = events.filter(e => e.answered);
  const postUnlock = events.filter(e => U != null && e.day >= U);
  const row = {
    seed, days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    wave5Unlocked: U != null, unlockDayW5: U,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === track.maxRank) || 'village',
    national: track.maxRank >= RANK_ORDER.national,
    maxArc: track.maxArc,
    tableDays: track.tableDays.length, firstTableDay: track.tableDays.length ? track.tableDays[0] : null,
    exiled: track.exiledEver,
    scholarDeaths: scholarDeaths.length,
    gorgeEvents: events.length,
    gorgeNightsAnswered: answered.length,
    answerRate: events.length ? +(answered.length / events.length).toFixed(3) : null,
    answerMix: {
      scholar: events.filter(e => e.answerKind === 'scholar').length,
      villager: events.filter(e => e.answerKind === 'villager').length,
      drifted: events.filter(e => /drifted/.test(e.answerKind)).length,
      unattributed: events.filter(e => e.answerKind === 'unattributed').length,
    },
    gorgedKcalTotal: events.reduce((t, e) => t + (e.kcalTaken || 0), 0),
    gorgedKcalPostUnlock: postUnlock.reduce((t, e) => t + (e.kcalTaken || 0), 0),
    attributionFails,
    instrErrors: instrErrors.length,
    policyCtx: {
      engagements: ctx.gorgeEngagements || 0,
      heldHp: ctx.gorgeHeldHp || 0,
      heldAlone: ctx.gorgeHeldAlone || 0,
      heldTable: ctx.gorgeHeldTable || 0,
      invitesOk: ctx.gorgeInvitesOk || 0,
      invitesRefused: ctx.gorgeInvitesRefused || 0,
      daysSaw: ctx.gorgeDaysSaw || 0,
      blockedEarly: ctx.gorgeBlockedEarly || 0,
      verifyFailed: ctx.gorgeVerifyFailed || 0,
    },
    events,
    storyLines: track.sayLines,
    storyLineCount: track.sayLines.length,
    dayHashes: track.dayHashes,
  };
  if (opts.verbose !== false) {
    console.log(`  [gorge seed ${seed}] days=${row.days} end=${row.endReason} ` +
      `w5=${row.wave5Unlocked ? 'd' + U : 'no'} gorge=${row.gorgeEvents} ` +
      `answered=${row.gorgeNightsAnswered} kcal=${row.gorgedKcalTotal} ` +
      `eng=${row.policyCtx.engagements} instrErr=${instrErrors.length}`);
  }
  return row;
}

async function main() {
  const seeds = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',')
    .map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT || 'evidence/2026-10-14/gorge-baseline.json';
  const armed = process.env.GORGEDRIVE === '1';
  const wraps = process.env.WRAPS || 'all';
  const commit = (() => { try { return require('child_process').execSync('git rev-parse --short HEAD', { cwd: __dirname + '/..' }).toString().trim(); } catch (e) { return 'unknown'; } })();
  const runs = [];
  for (const seed of seeds) runs.push(await runOne(seed, { days, wraps }));
  const gameDaysTotal = runs.reduce((t, r) => t + (r.gameDays || 0), 0);
  const scholarDeathsTotal = runs.reduce((t, r) => t + r.scholarDeaths, 0);
  const surv = runs.map(r => r.gameDays || 0).sort((a, b) => a - b);
  const medianSurv = surv.length ? surv[Math.floor(surv.length / 2)] : 0;
  const summary = {
    label: armed ? 'gorge-armed' : 'gorge-baseline',
    policy: 'leadfeast' + (armed ? '+gorgedrive' : ''),
    gorgedrive: armed, seeds, days, commit, wraps,
    generated: new Date().toISOString(),
    unlockers: runs.filter(r => r.wave5Unlocked).length,
    gorgeEvents: runs.reduce((t, r) => t + r.gorgeEvents, 0),
    gorgeNightsAnswered: runs.reduce((t, r) => t + r.gorgeNightsAnswered, 0),
    answerRate: null,
    answerMix: { scholar: 0, villager: 0, drifted: 0, unattributed: 0 },
    gorgedKcalTotal: runs.reduce((t, r) => t + r.gorgedKcalTotal, 0),
    gorgedKcalPostUnlock: runs.reduce((t, r) => t + r.gorgedKcalPostUnlock, 0),
    attributionFails: runs.reduce((t, r) => t + r.attributionFails, 0),
    medianSurvival: medianSurv,
    maxSurvival: surv.length ? surv[surv.length - 1] : 0,
    national: runs.filter(r => r.national).length,
    tableSeeds: runs.filter(r => r.tableDays > 0).length,
    scholarDeaths: scholarDeathsTotal,
    scholarDeathsPer100d: gameDaysTotal ? +(scholarDeathsTotal / gameDaysTotal * 100).toFixed(2) : null,
    engagements: runs.reduce((t, r) => t + r.policyCtx.engagements, 0),
    held: {
      hp: runs.reduce((t, r) => t + r.policyCtx.heldHp, 0),
      alone: runs.reduce((t, r) => t + r.policyCtx.heldAlone, 0),
      table: runs.reduce((t, r) => t + r.policyCtx.heldTable, 0),
    },
    invites: {
      ok: runs.reduce((t, r) => t + r.policyCtx.invitesOk, 0),
      refused: runs.reduce((t, r) => t + r.policyCtx.invitesRefused, 0),
    },
    instrErrors: runs.reduce((t, r) => t + r.instrErrors, 0),
    runs,
  };
  for (const r of runs) for (const k of Object.keys(summary.answerMix)) summary.answerMix[k] += r.answerMix[k];
  summary.answerRate = summary.gorgeEvents ? +(summary.gorgeNightsAnswered / summary.gorgeEvents).toFixed(3) : null;
  fs.writeFileSync(path.resolve(__dirname, '..', out), JSON.stringify(summary, null, 1));
  console.log(`wrote ${out}`);
  console.log(`unlockers: ${summary.unlockers}/${seeds.length}  gorge events: ${summary.gorgeEvents}  ` +
    `answered: ${summary.gorgeNightsAnswered} (${summary.answerRate})  kcal post-unlock: ${summary.gorgedKcalPostUnlock}`);
  console.log(`median survival: ${summary.medianSurvival}d  national: ${summary.national}/${seeds.length}  ` +
    `scholar deaths/100d: ${summary.scholarDeathsPer100d}  engagements: ${summary.engagements}`);
  return summary;
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { runOne };
