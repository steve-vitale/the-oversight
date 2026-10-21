#!/usr/bin/env node
// probe-overtimehonest-20261021.js — OVERTIME HONESTY (lane B endgame r34,
// 2026-10-21).
//
// LEG QUESTION: after the Table is announced (day 90+), when a competent
// village DEFERS sitting, does the overtime system fire honestly — tiers
// stage aloud (System line on air + the ◈ line), overtime_tier telemetry
// fires with the right tier, the teeth are real (RERUN fights, raid knobs,
// seat-price penalty shows in the pricing), and does the window open a real
// opportunity (wave-4/5 deeds, the key) at a real price? Steve 2026-10-14:
// "waiting should have a cost- but also an opportunity for the truly
// powerful."
//
// SUBSTRATE: the CAPABLE bot (policies/capable) with CAPABLE_GREEDY=1 —
// Steve's own deferral design: waits while the run is strong, sits at the
// tier cap (CAPABLE_GREEDY_MAXTIER, default 4), when the run weakens, or
// near the horizon (CAPABLE_GREEDY_LASTDAY). Env forces MAXTIER=6,
// LASTDAY=170 so the run rides the full 6-tier clock when strong.
// POLICY-SIDE ONLY — zero src/js changes.
//
// PRIMARY (binding, pre-registered): on runs that reach overtime tier >= 2,
// every staged tier (1..maxTier) is announced aloud — the System line AND
// the ◈ OVERTIME line — and the overtime_tier telemetry event fires with
// the matching tier. GO: 4/4 pilot tiers-1..maxTier announced + telemetry
// matched, 0 silent tiers. A silent tier is NO-GO (§14 anti-drift).
//
// Non-binding (report): RERUN fight count/teeth by tier; raid frequency vs
// the knobs; seat-price penalty in the pricing beat; wave-4/5 deeds picked
// up during the overtime window; third-titan omens at tier 2; the key.
//
// Usage:
//   CAPABLE_GREEDY=1 CAPABLE_GREEDY_MAXTIER=6 CAPABLE_GREEDY_LASTDAY=170 \
//     TELEMETRY_FULL=1 node scripts/probe-overtimehonest-20261021.js
//   SMOKE=1 ...  # 1 seed x 120d, field sanity
//   DET=1 ...    # instrument-on twice byte-identical (2 seeds x 120d)
//   SEEDS="71001,71002" DAYS=180 ...
'use strict';
const fs = require('fs');
const path = require('path');
const CAP = require('./policies/capable');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

const MODE = process.env.DET === '1' ? 'det'
  : process.env.SMOKE === '1' ? 'smoke' : 'sweep';

// SUBSTRATE GUARD — the greedy deferral is the substrate. No table-override
// layers (SEATDRIVE is not part of this stack; capable.tableRoad + greedy
// owns the sit).
if (process.env.CAPABLE_GREEDY !== '1') { console.error('SWEEP STOP: CAPABLE_GREEDY=1 required.'); process.exit(2); }
if (!CAP.layerOn || CAP.layerOn()) { /* capable is the base, always on */ }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [71001, 71002, 71003, 71004]).filter(Number.isFinite);
const DAYS = process.env.DAYS ? parseInt(process.env.DAYS, 10)
  : (MODE === 'smoke' ? 120 : MODE === 'det' ? 120 : 180);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-21', 'perseed-overtime');

// EPERM flap hardening (2026-10-19 pattern): EPERM-only retry, no data change.
function writeFileRetry(fp, data) {
  let last = null;
  for (let i = 0; i < 15; i++) {
    try { fs.writeFileSync(fp, data); return; }
    catch (e) { last = e; if (e && e.code === 'EPERM') { const t = Date.now(); while (Date.now() - t < 4000) {} continue; } throw e; }
  }
  throw last;
}

function dayOf(G) { try { return ((G.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function wavesOf(G) {
  // mirrors deedGateReady's counting (progression.js): wavesFaced is
  // {monsterId: wave} — count distinct ids per wave. (2026-10-21: first
  // version wrongly read d.wavesFaced.w1 as arrays — always 0.)
  try {
    const d = (G.deedState ? G.deedState() : {}).wavesFaced || {};
    const out = { w1: 0, w2: 0, w3: 0, w4: 0, w5: 0 };
    for (const mid of Object.keys(d)) {
      const w = d[mid] | 0;
      if (w >= 1 && w <= 5) out['w' + w]++;
    }
    return out;
  } catch (e) { return {}; }
}
function facedIds(G) {
  try { return Object.keys((G.deedState ? G.deedState() : {}).wavesFaced || {}); }
  catch (e) { return []; }
}
function hpFrac(G) {
  try { const s = (G.state || {}).scholar || {}; return (s.health || 0) / Math.max(1, s.maxHealth || 100); } catch (e) { return 1; }
}

async function runSeed(seed, days) {
  // ---- per-seed globals ----
  let capture = [];
  const cap = (line) => {
    if (line == null) return;
    const s = String(line);
    if (capture.length && capture[capture.length - 1] === s) return;
    capture.push(s);
  };
  const events = [];      // tier announcements as spoken (day, tier, sysLine, detailLine)
  const rerunFights = [];  // day, tier, monsterIds, waves
  const raidDays = [];     // day of each raid
  const dayRecs = [];
  let instrumentErrors = 0;
  let announceDay = null, announceCap0 = null, wavesAtAnnounce = null, facedAtAnnounce = null;
  let satDay = null, satCap0 = null, satPenalty = null, satSeatKind = null;
  let lastRaidDaySeen = null;
  const waveFirst = {};   // monsterId -> {day, wave}: new w4+ deed firsts during the overtime window

  const { Game } = await loadGame({ seed, mode: 'overtimehonest', fullTelemetry: true });
  await setupGame(Game);
  const G0 = Game;
  // wrap say/sysSay (spoken-text capture, r17 pattern)
  const oSay = G0.say, oSys = G0.sysSay;
  G0.say = function (l) { try { cap(l); } catch (e) {} return oSay ? oSay.call(this, l) : undefined; };
  G0.sysSay = function (l) { try { cap(l); } catch (e) {} return oSys ? oSys.call(this, l) : undefined; };
  // wrap startCombat: detect RERUN-scaled fights (overtimeScaleFight ran)
  if (G0.startCombat) {
    const oSC = G0.startCombat;
    G0.startCombat = function (monsterId) {
      const r = oSC.apply(this, arguments);
      try {
        const f = this.tbfight;
        if (f && f.otTier) {
          const ids = (f.fighters || []).filter(x => x.kind === 'monster').map(x => x.monsterId || x.mid || x.id || '?');
          rerunFights.push({ day: dayOf(this), tier: f.otTier, monsters: ids });
        }
      } catch (e) { instrumentErrors++; }
      return r;
    };
  }

  const policy = Object.assign({}, CAP.capable);
  const oDaily = policy.daily.bind(policy);
  policy.daily = (G, ctx) => {
    let r;
    try { r = oDaily(G, ctx); } catch (e) { instrumentErrors++; }
    try {
      const pg = (G.progState ? G.progState() : {});
      const d = dayOf(G);
      if (pg.tableAnnounced && announceDay == null) { announceDay = d; announceCap0 = capture.length; wavesAtAnnounce = wavesOf(G); facedAtAnnounce = facedIds(G); }
      if (pg.tableDone && satDay == null) {
        satDay = d; satCap0 = capture.length;
        try { satPenalty = G.overtimeStanding ? G.overtimeStanding() : null; } catch (e) {}
        try { const pv = G.tablePreview ? G.tablePreview() : null; satSeatKind = pv ? pv.seat : null; } catch (e) {}
      }
      let pv = null;
      try { pv = G.tablePreview ? G.tablePreview() : null; } catch (e) {}
      const v = (G.state || {}).village || {};
      if (v.lastRaidDay && v.lastRaidDay !== lastRaidDaySeen) { lastRaidDaySeen = v.lastRaidDay; raidDays.push(v.lastRaidDay); }
      const w = wavesOf(G);
      // wave deed first-appearances during the overtime window: a NEW
      // distinct id vs the announce snapshot (deed-dedupe is by monster id)
      if (announceDay != null && !pg.tableDone) {
        const now = facedIds(G);
        for (const mid of now) {
          if ((facedAtAnnounce || []).indexOf(mid) < 0 && !waveFirst[mid]) {
            let wave = 1;
            try { const md = (G.data.monsters || []).find(m => m.id === mid); wave = (md && md.wave) || 1; } catch (e) {}
            if (wave >= 4) waveFirst[mid] = { day: d, wave };
          }
        }
      }
      let knobs = null;
      try { knobs = G.overtimeRaidKnobs ? G.overtimeRaidKnobs() : null; } catch (e) {}
      dayRecs.push({
        day: d, tier: (G.overtimeTier ? G.overtimeTier() : 0),
        otActive: !!(G.overtimeActive && G.overtimeActive()),
        otDays: pg.overtimeDays | 0, tableWaiting: !!pg.tableWaiting, tableDone: !!pg.tableDone,
        pv: pv ? { ready: !!pv.ready, overtime: pv.overtime | 0, losses: pv.losses | 0, key: !!pv.key, seat: pv.seat || null } : null,
        waves: w, knobs, roster: ((G.state.village || {}).roster || []).length,
        hpFrac: Math.round(hpFrac(G) * 100) / 100,
        thirdTitan: (G.overtimeThirdTitan ? G.overtimeThirdTitan() : null),
        keyReady: !!(G.networkKeyReady && G.networkKeyReady()),
      });
    } catch (e) { instrumentErrors++; }
    return r;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 1 }); });

  // ---- post-run: tier announcements from capture ----
  const tierLines = [];
  for (let i = 0; i < capture.length; i++) {
    const s = String(capture[i]);
    const m = s.match(/^◈ OVERTIME ×(\d+)/); // the detail line only (not the sysSay echo)
    if (m) {
      const tier = parseInt(m[1], 10);
      // find the tier's day: walk dayRecs for the first day with this tier
      const rec = dayRecs.find(r => r.tier >= tier);
      const prev = capture[i - 1] ? String(capture[i - 1]) : null;
      tierLines.push({ tier, day: rec ? rec.day : null, sysLine: prev, detailLine: String(capture[i]) });
    }
  }
  // telemetry: overtime_tier events
  const teleTiers = ((Game.state || {}).telemetry || []).filter(e => e.type === 'overtime_tier')
    .map(e => ({ day: e.day, tier: e.tier }));
  // audit/pricing text at sitting: capture slice around tableDone
  let auditText = null;
  if (announceCap0 != null && satCap0 != null) {
    auditText = capture.slice(Math.max(0, satCap0 - 60), satCap0 + 30).join('\n');
  }
  // announce text slice
  let announceText = null;
  if (announceCap0 != null) announceText = capture.slice(Math.max(0, announceCap0 - 80), announceCap0 + 30).join('\n');

  const rec = {
    seed, days, gameDays: dayOf(Game),
    endReason: Game.over ? (Game.villageLost ? 'village-lost' : 'over-other') : 'survived',
    won: !!Game.won,
    announceDay, satDay, satSeatKind, satPenalty, wavesAtAnnounce,
    maxTier: dayRecs.reduce((m, r) => Math.max(m, r.tier), 0),
    tierLines, teleTiers, rerunFights, raidDays,
    waveFirst, wavesEnd: dayRecs.length ? dayRecs[dayRecs.length - 1].waves : {},
    instrumentErrors,
    auditText, announceText,
    // compact day series (every day) for the analyzer
    days: dayRecs.map(r => [r.day, r.tier, r.otDays, r.pv ? 1 : 0, r.pv ? r.pv.overtime : -1,
      r.waves.w4 || 0, r.waves.w5 || 0, r.roster, r.knobs ? r.knobs.cooldown : 7,
      r.thirdTitan ? 1 : 0, r.keyReady ? 1 : 0, r.tableDone ? 1 : 0]),
  };
  // ---- final census (plain-words village assessment) ----
  let census = null;
  try {
    const v = (Game.state || {}).village || {};
    const people = (v.roster || []).map(id => {
      let p = null;
      try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
      return {
        id, name: (p && (p.name || p.displayName)) || String(id),
        dead: !!(p && p.dead),
        role: (p && (p.role || p.job)) || null,
        abilities: (p && p.abilities && p.abilities.length) || 0,
        trust: (p && typeof p.trust === 'number') ? Math.round(p.trust) : null,
      };
    });
    const deadList = [];
    try {
      const all = (Game.state.village || {}).dead || (Game.state.village || {}).deadList || [];
      for (const d of all) deadList.push(typeof d === 'string' ? d : (d.name || d.id || '?'));
    } catch (e) {}
    census = {
      alive: people.filter(p => !p.dead).length, dead: people.filter(p => p.dead).length,
      people, deadList,
      pantryKcal: Math.round(v.pantryKcal || 0),
      scale: (Game.scaleRank ? Game.scaleRank() : '?'),
    };
  } catch (e) { census = { error: String(e && e.message) }; }
  rec.census = census;

  if (process.env.DET !== '1') {
    try { fs.mkdirSync(EVID, { recursive: true }); } catch (e) {}
    writeFileRetry(path.join(EVID, `overtime-r34-${seed}.json`), JSON.stringify(rec, null, 1));
    // sense-read transcript: announce + every tier line + the audit at sitting
    const tLines = [];
    if (announceText) tLines.push('===== THE ANNOUNCE (day ' + announceDay + ') =====\n' + announceText);
    for (const tl of tierLines) {
      tLines.push(`===== OVERTIME ×${tl.tier} (day ${tl.day}) =====\n${tl.sysLine || ''}\n${tl.detailLine}`);
    }
    if (auditText) tLines.push('===== THE AUDIT AT SITTING (day ' + satDay + ') =====\n' + auditText);
    writeFileRetry(path.join(EVID, `overtime-r34-${seed}-transcript.txt`), tLines.join('\n\n'));
  }
  return rec;
}

(async () => {
  if (MODE === 'det') {
    const a = await runSeed(SEEDS[0], DAYS);
    const b = await runSeed(SEEDS[0], DAYS);
    const sa = JSON.stringify(a), sb = JSON.stringify(b);
    console.log('DET ' + (sa === sb ? 'GREEN byte-identical' : 'RED differs'));
    if (sa !== sb) { console.log('a bytes', sa.length, 'b bytes', sb.length); process.exit(1); }
    return;
  }
  if (MODE === 'smoke') {
    const r = await runSeed(SEEDS[0], DAYS);
    console.log(`SMOKE seed=${r.seed} announceDay=${r.announceDay} satDay=${r.satDay} maxTier=${r.maxTier} tierLines=${r.tierLines.length} teleTiers=${r.teleTiers.length} reruns=${r.rerunFights.length} raids=${r.raidDays.length} won=${r.won} end=${r.endReason}`);
    return;
  }
  const out = [];
  for (const s of SEEDS) {
    const r = await runSeed(s, DAYS);
    out.push({ seed: r.seed, announceDay: r.announceDay, satDay: r.satDay, maxTier: r.maxTier, tierLines: r.tierLines.length, teleTiers: r.teleTiers.length, reruns: r.rerunFights.length, raids: r.raidDays.length, waveFirst: r.waveFirst, won: r.won, end: r.endReason });
    console.log(JSON.stringify(out[out.length - 1]));
  }
})();
