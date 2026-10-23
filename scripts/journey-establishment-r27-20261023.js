#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40) R27 — FOOD-SECURITY METRIC (2026-10-23).
// Rotation index 1 (establishment). Base: master@6c08dd39c (current tip).
// Pre-registered in hidden_files/evidence/2026-10-23/journey-establishment-r27-note.md.
//
// Leg question: with DEPOSITGATE + PLENTYDEPRI as the food regime, does
// establishment (days 14-40) stay FOOD-SECURE under the new r26-metric-review
// bar — no leg-window hunger crisis (starvation death or a >3d crisis streak
// with pantry+packs short of a day's mouths) — and is the pantry-vs-pack
// split legible in the narration? Plus stay-green: M1a zero v-vs-v open
// combat, M1b ambush <=2/leg plot-backed, M2 people transcripts, M3 fight
// sense (staged player fights + treeline honesty), M4 blank.
// Instrument: r26's narration-corpus + foodTrack extended with packKcal
// (village.pack[vid].kcal) and progState().hungryStreak per day.
// Binding: M1 food-security (no leg-window starvation death among people;
// zero crisis days: hungryStreak>=3 AND pantry+pack < alive*2000); plenty
// easing fires >=3/4 seeds OR trajectories unchanged; M1a zero open-combat
// v-vs-v; M1b ambush <=2/leg, all plot-backed; M2 >=8 transcripts, 0
// senseless, 0 fabricated, favorRepeatHits=0; M3 >=2 player-fight
// transcripts/seed sense-read + >=1 contest episode where fired; M4 blank.
// Guardrails: reachedDay >=43; wave-2 >= d8; no softlocks; pilot aired;
// contests >=2/village.
// Usage: SEEDS=61 node scripts/journey-establishment-r27-20261023.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.env.EVID || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-23';
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { census } = require('./lib/death-census');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [61, 82, 103, 124]);
const DAYS = parseInt(process.env.DAYS || '42', 10);

const _warned = {};
function warnOnce(key, e) {
  if (_warned[key]) return;
  _warned[key] = true;
  console.warn('[r27:' + key + ']', (e && e.message) || e);
}
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
// r27: pack kcal — village.pack[vid].kcal; the depositgate-holdback path keeps
// food in hands/packs and eats it at the fire, so pantry-alone no longer
// measures food security. Pack entries are DAILY RATIONS drawn from the pantry
// at dawn (packKcal reseeds) — so only fresh (day===today) entries count, and
// stale ones are excluded to avoid double-counting yesterday's eaten rations.
// The PLAYER's homecoming keep lives in scholar.inventory (not village.pack).
function packKcal(Game) {
  try {
    const today = ((Game.state || {}).scholar || {}).day || 0;
    const pack = (Game.state.village || {}).pack || {};
    return Object.keys(pack).reduce((t, vid) => {
      const p = pack[vid] || {};
      if (p.day !== today) return t; // stale: eaten or reseeded later
      return t + (p.kcal || 0);
    }, 0);
  } catch (e) { return 0; }
}
// r27: the player's own pack — the homecoming depositgate path raises the
// keep from 2000 to 6000 kcal when engaged. Real items, in hand.
function playerPackKcal(Game) {
  try {
    const inv = (((Game.state || {}).scholar || {}).inventory) || [];
    return inv.reduce((t, i) => t + (((i.kcalEach || 0) > 0 && (i.units || 0) > 0) ? (i.kcalEach || 0) * (i.units || 0) : 0), 0);
  } catch (e) { return 0; }
}
function hungerStreak(Game) {
  try {
    const ps = Game.progState ? Game.progState() : null;
    return (ps && ps.hungryStreak) || 0;
  } catch (e) { return 0; }
}
function livingVids(Game) {
  try {
    const v = Game.state.village || {};
    return (v.roster || []).filter(id => {
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    });
  } catch (e) { return []; }
}
function nameOf(Game, id) {
  try { return id === 'player' ? 'You' : (Game.displayName ? Game.displayName(id) : id); } catch (e) { return String(id); }
}
const nowDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
function teleStream(Game) {
  try { return (Game.state.telemetry || []).slice(); } catch (e) { return []; }
}
function killerOf(Game, d) {
  try {
    const corpses = (Game.corpses && Game.corpses()) || [];
    const c = corpses.find(c => c && String(c.dayDied) === String(d.day) &&
      (String(c.monsterId || '') === String(d.who) || String(c.villagerId || '') === String(d.who) || String(c.name || '') === String(d.who)));
    if (c && c.killerId) return String(c.killerId);
  } catch (e) {}
  return null;
}

async function runSeed(seed) {
  // r27: narration LIVE for the fight-sense instrument (sim-harness stubs
  // Game.say/sysSay to no-ops unless opts.narration is set — without it the
  // emit wrapper sees nothing).
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true, narration: true });
  await setupGame(Game);
  const policy = competent;
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) { try { policy.setup(Game, ctx); } catch (e) { warnOnce('setup', e); } }

  // ---- r27: full-leg narration capture (fight + contest anchors) ----
  const narr = [];
  const fightMeta = {}; // fightId -> {firstDay, lastDay, fighters:[{key,kind,name,hp}], rounds}
  try {
    const _emit = Game.emit ? Game.emit.bind(Game) : null;
    if (_emit) {
      Game.emit = function (text, surface) {
        try {
          const f = Game.tbfight || null;
          const c = (Game.state || {}).activeContest || null;
          const fid = f ? String(f.id || 'fight') : null;
          if (fid && !fightMeta[fid]) {
            let fighters = [];
            try {
              fighters = (f.fighters || []).map(x => ({
                key: x.key, kind: x.kind,
                name: x.name || (Game.displayName ? Game.displayName(x.key) : null) || null,
                hp: x.hp, maxhp: x.maxhp,
              }));
            } catch (e) {}
            fightMeta[fid] = { firstDay: nowDay(Game), lastDay: nowDay(Game), fighters, rounds: 0 };
          } else if (fid) {
            fightMeta[fid].lastDay = nowDay(Game);
            try { fightMeta[fid].rounds = Math.max(fightMeta[fid].rounds, f.round || 0); } catch (e) {}
          }
          let t = text;
          if (t && typeof t === 'object') t = t.text || t.desc || t.msg || t.message || String(t);
          narr.push({ day: nowDay(Game), surface: surface || null, fight: fid, round: f ? (f.round || 0) : null, contest: c ? String(c.id || c.name || 'contest') : null, text: String(t == null ? '' : t).slice(0, 600) });
        } catch (e) {}
        return _emit(text, surface);
      };
    }
  } catch (e) { warnOnce('emitWrap', e); }

  const waveDay = {};
  const contestFires = [];
  const _fireContest = Game.fireContest ? Game.fireContest.bind(Game) : null;
  if (_fireContest) {
    Game.fireContest = function (contest) {
      const wasPilotAired = !!Game.state.pilotAired;
      const r = _fireContest(contest);
      try {
        contestFires.push({ day: nowDay(Game), name: (contest && contest.name) || (contest && contest.id) || '?' });
        if (!wasPilotAired && Game.state.pilotAired) ctx._pilotDay = nowDay(Game);
      } catch (e) { warnOnce('fireContest', e); }
      return r;
    };
  }

  const foodTrack = [];
  const PROD_KINDS = { FORAGE: 1, TRAPS: 1, HAUL: 1, EXPLORE: 1 };
  for (let d = 1; d <= DAYS; d++) {
    try {
      const pk = Math.round(pantryKcal(Game));
      const pack = Math.round(packKcal(Game));
      const hs = hungerStreak(Game);
      const kinds = {};
      const vids = livingVids(Game);
      for (const vid of vids) {
        let k = 'unknown';
        try { const o = Game.objOf ? Game.objOf(vid) : null; k = (o && o.kind) || 'unknown'; } catch (e) { k = 'error'; }
        kinds[k] = (kinds[k] || 0) + 1;
      }
      // r27: food security = pantry + fresh packs + player's pack; crisis =
      // the game's own hunger threshold (hungryStreak>=3) with less than a
      // day's mouths in food.
      const mouths = vids.length;
      const pp = Math.round(playerPackKcal(Game));
      const security = pk + pack + pp;
      foodTrack.push({ d, day: nowDay(Game), pantry: pk, pack, playerPack: pp, security, hungryStreak: hs, alive: mouths, kinds, crisis: hs >= 3 && security < mouths * 2000 });
    } catch (e) { warnOnce('foodTrack', e); }
    for (let p = 0; p < 3; p++) {
      if (policy.upkeep) { try { policy.upkeep(Game, ctx); } catch (e) { warnOnce('upkeep', e); } }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('driveFights', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('driveContests', e); }
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) { warnOnce('doAction', e); }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('driveFights2', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('driveContests2', e); }
      if (Game.over) break;
    }
    if (Game.over) break;
    if (policy.daily) { try { policy.daily(Game, ctx); } catch (e) { warnOnce('daily', e); } }
    try { Game.sleep(); } catch (e) { warnOnce('sleep', e); }
    const gd = nowDay(Game);
    try {
      const w = Game.unlockedWave ? Game.unlockedWave() : 1;
      if (waveDay[w] == null) waveDay[w] = gd;
    } catch (e) { warnOnce('waveDay', e); }
    const liv = livingVids(Game).length;
    if (liv === 0) { ctx._deadTail = (ctx._deadTail || 0) + 1; if (ctx._deadTail >= 10) break; }
    else ctx._deadTail = 0;
  }

  // ---- kind-aware death census ----
  const tele = teleStream(Game);
  const deaths = [];
  for (const t of tele) {
    if (t && t.type === 'death') {
      const d = { day: t.day, who: t.who, whoName: nameOf(Game, t.who), cause: t.cause, kind: t.kind, player: !!t.player };
      d.killerId = killerOf(Game, d);
      deaths.push(d);
    }
  }
  const roster = (() => { try { return (Game.state.village || {}).roster || []; } catch (e) { return []; } })();
  const dc = census(deaths, { roster, playerId: 'p' });
  const openCombatVV = (dc.villagerVsVillagerRecs || [])
    .filter(r => String(r.cause) === 'combat')
    .map(r => ({ day: r.day, who: r.whoName, killer: r.killerId, cause: r.cause }));
  const ambushRecs = (dc.villagerVsVillagerRecs || [])
    .filter(r => String(r.cause) === 'ambush')
    .map(r => ({ day: r.day, who: r.whoName, killer: r.killerId, cause: r.cause }));

  // ---- held conversations for the people check (3 per seed) ----
  const convoPath = EVID + `/journey-establishment-r27-convo-seed${seed}.txt`;
  const convoLines = [];
  let favorRepeatHits = 0;
  try {
    const cv = livingVids(Game).slice(0, 3);
    convoLines.push(`=== seed ${seed} — held conversations (end day ${nowDay(Game)}) ===`);
    for (const vid of cv) {
      const nm = nameOf(Game, vid);
      const p = (Game.getPerson ? Game.getPerson(vid) : {}) || {};
      convoLines.push(`\n-- ${nm} (${String(vid).slice(0, 8)}) occ=${p.occupation || p.formerOccupation || '?'} --`);
      let r = Game.startConvo(vid);
      convoLines.push(`OPENING: ${r.line}`);
      convoLines.push('choices: ' + ((r.choices || []).map(ch => `[${ch.id}] ${String(ch.label || '').slice(0, 80)}`).join(' | ')));
      const seenReq = {};
      for (let turn = 0; turn < 8; turn++) {
        let choices = (r.choices && r.choices.length) ? r.choices : [];
        if (!choices.length) break;
        const pick = choices.find(ch => /gossip|rumor/.test(ch.id)) || choices.find(ch => /work|food|teach|help/.test(ch.id)) || choices.find(ch => /^want:/.test(ch.id)) || choices.find(ch => ch.id !== 'leave') || null;
        if (!pick) break;
        convoLines.push(`YOU: [${pick.id}] ${pick.label}`);
        r = Game.convoTurn(vid, pick.id);
        if (r.line == null && r.ended) convoLines.push('THEM: (quiet close — no line, ended)');
        else convoLines.push(`THEM: ${r.line}`);
        if (pick.id === 'favor_requirements' || /favor_requirements/.test(pick.id || '')) {
          const key = String(r.line || '');
          seenReq[key] = (seenReq[key] || 0) + 1;
          if (seenReq[key] >= 3) favorRepeatHits++;
        }
        if (r.ended) { convoLines.push('(ended by engine)'); break; }
      }
      try { const end = Game.endConvo(vid, 'done'); if (end && end.line) convoLines.push('closing: ' + end.line); } catch (e) { convoLines.push('endConvo: ' + e.message); }
    }
  } catch (e) { convoLines.push('ERROR: ' + e.message); }
  try { fs.writeFileSync(convoPath, convoLines.join('\n')); } catch (e) { warnOnce('convoWrite', e); }

  // ---- r27: staged player fights (post-census, does not touch leg metrics;
  // the competent policy avoids player combat entirely, so the player-facing
  // half of the fight law would otherwise go unsense-tested) ----
  let stagedFightCount = 0;
  try {
    const playerAlive = (() => { try { return !((Game.getPerson('p') || {}).dead) && !Game.over; } catch (e) { return false; } })();
    if (playerAlive && Game.worldMonsters && Game.startCombat) {
      const mons = Game.worldMonsters().filter(m => m && m.id && (m.hp == null || m.hp > 0)).slice(0, 2);
      for (const m of mons) {
        if (Game.over) break;
        try {
          Game.startCombat(m.id);
          let g = 0;
          while (Game.tbfight && !Game.tbfight.over && g++ < 300) {
            try { driveFights(Game, policy, ctx); } catch (e) {}
            if (Game.over) break;
          }
          stagedFightCount++;
        } catch (e) { warnOnce('stageFight', e); }
      }
    }
  } catch (e) { warnOnce('stageFights', e); }

  // ---- r27: extract fight + contest segments from the narration corpus ----
  const fightIds = Object.keys(fightMeta);
  const fightSegPath = EVID + `/journey-establishment-r27-fights-seed${seed}.txt`;
  const fightLines = [];
  try {
    for (const fid of fightIds) {
      const m = fightMeta[fid];
      const seg = narr.filter(n => n.fight === fid);
      if (!seg.length) continue;
      fightLines.push(`\n===== FIGHT ${fid} | day ${m.firstDay}${m.firstDay !== m.lastDay ? '-' + m.lastDay : ''} | rounds ~${m.rounds} | lines ${seg.length} =====`);
      fightLines.push('fighters: ' + m.fighters.map(x => `${x.kind}:${x.name || x.key}(hp${x.hp}/${x.maxhp})`).join(' vs '));
      for (const n of seg) fightLines.push(`[d${n.day} r${n.round}] ${n.text}`);
    }
    fs.writeFileSync(fightSegPath, fightLines.join('\n') || '(no fight narration captured)');
  } catch (e) { warnOnce('fightWrite', e); }
  const contestSegPath = EVID + `/journey-establishment-r27-contests-seed${seed}.txt`;
  try {
    const cids = [];
    for (const n of narr) if (n.contest && cids.indexOf(n.contest) < 0) cids.push(n.contest);
    const cl = [];
    for (const cid of cids) {
      const seg = narr.filter(n => n.contest === cid).slice(0, 120);
      if (!seg.length) continue;
      cl.push(`\n===== CONTEST ${cid} | day ${seg[0].day} | lines ${seg.length} (cap 120) =====`);
      for (const n of seg) cl.push(`[d${n.day}] ${n.text}`);
    }
    fs.writeFileSync(contestSegPath, cl.join('\n') || '(no contest narration captured)');
  } catch (e) { warnOnce('contestWrite', e); }
  // raw corpus (jsonl) — for offline re-extraction
  try {
    fs.writeFileSync(EVID + `/journey-establishment-r27-narr-seed${seed}.jsonl`, narr.map(n => JSON.stringify(n)).join('\n'));
  } catch (e) { warnOnce('narrWrite', e); }

  // ---- food-economy analysis ----
  let prodByBucket = null;
  try {
    const buckets = { '<4000': { days: 0, prod: 0, alive: 0 }, '4000-8000': { days: 0, prod: 0, alive: 0 }, '>=8000': { days: 0, prod: 0, alive: 0 } };
    let prodTripDays = 0, totalTripDays = 0;
    for (const ft of foodTrack) {
      const b = ft.pantry < 4000 ? '<4000' : ft.pantry < 8000 ? '4000-8000' : '>=8000';
      const bb = buckets[b];
      bb.days++;
      const prod = Object.keys(ft.kinds || {}).filter(k => PROD_KINDS[k]).reduce((t, k) => t + ft.kinds[k], 0);
      bb.prod += prod; bb.alive += (ft.alive || 0);
      if ((ft.alive || 0) > 0) { totalTripDays++; if (prod > 0) prodTripDays++; }
    }
    prodByBucket = {};
    for (const [k, bb] of Object.entries(buckets)) {
      prodByBucket[k] = { days: bb.days, prodShareOfLiving: bb.alive ? +(bb.prod / bb.alive).toFixed(3) : 0 };
    }
    prodByBucket.prodTripDayRate = totalTripDays ? +(prodTripDays / totalTripDays).toFixed(3) : 0;
    prodByBucket.pantryEnd = foodTrack.length ? foodTrack[foodTrack.length - 1].pantry : null;
    prodByBucket.pantryMax = foodTrack.length ? Math.max(...foodTrack.map(ft => ft.pantry)) : null;
  } catch (e) { warnOnce('prodBucket', e); }

  let plentyLedgerFinal = null;
  try {
    const vv = (Game.state || {}).village || {};
    const lg = vv._plentyDepri || { days: {} };
    const days = lg.days || {};
    const keys = Object.keys(days).map(k => parseInt(k, 10)).sort((a, b) => a - b);
    let depriTotal = 0, kcalTotal = 0;
    for (const k of keys) {
      const rec = days[k] || {};
      depriTotal += rec.depri || 0; kcalTotal += rec.kcal || 0;
    }
    plentyLedgerFinal = { plentyDays: keys.length, depriTotal, easedKcalTotal: Math.round(kcalTotal), voiceDay: lg.voiceDay != null ? lg.voiceDay : null };
  } catch (e) { warnOnce('plentyLedger', e); }

  // ---- guardrails ----
  const starvation = deaths.filter(t => /starvat|hunger|thirst/.test(String(t.cause || '')) && (t.kind === 'villager' || t.kind === 'person'));
  const legWindowStarvation = starvation.filter(t => (t.day || 0) >= 15);
  // r27: M1 food-security bar — no leg-window starvation death, zero crisis
  // days (hungryStreak>=3 AND pantry+pack short of a day's mouths). A crisis
  // streak is any run of >=3 consecutive crisis days.
  let crisisDays = 0, maxCrisisStreak = 0, curStreak = 0;
  try {
    for (const ft of foodTrack) {
      if (ft.crisis) { crisisDays++; curStreak++; maxCrisisStreak = Math.max(maxCrisisStreak, curStreak); }
      else curStreak = 0;
    }
  } catch (e) { warnOnce('crisisStreak', e); }
  const m1FoodSecurity = {
    legWindowStarvationDeaths: legWindowStarvation.map(t => ({ day: t.day, who: t.whoName, cause: t.cause })),
    crisisDays, maxCrisisStreak,
    verdict: (legWindowStarvation.length === 0 && maxCrisisStreak < 3) ? 'GO' : 'NO-GO',
  };
  // r27: depositgate ledger totals (parallel to plentyLedgerFinal) — the
  // voice of the food regime shift.
  let depositGateFinal = null;
  try {
    const vv = (Game.state || {}).village || {};
    const lg = vv._depositGate || { days: {} };
    const days = lg.days || {};
    const keys = Object.keys(days).map(k => parseInt(k, 10)).sort((a, b) => a - b);
    let shareEased = 0, returnEased = 0, bigHaulEased = 0;
    for (const k of keys) {
      const rec = days[k] || {};
      shareEased += rec.shareEased || 0; returnEased += rec.returnEased || 0; bigHaulEased += rec.bigHaulEased || 0;
    }
    depositGateFinal = { days: keys.length, shareEased, returnEased, bigHaulEased, voiceDay: lg.voiceDay != null ? lg.voiceDay : null };
  } catch (e) { warnOnce('depositGateLedger', e); }
  const wave2day = waveDay[2] != null ? waveDay[2] : null;
  const out = {
    seed, run: 'r27', reachedDay: nowDay(Game), over: !!Game.over, policy: policy.id,
    deaths, deathCensus: dc,
    m1aOpenCombatVV: openCombatVV,
    m1bAmbush: ambushRecs,
    favorRepeatHits,
    fightCount: fightIds.length,
    stagedFightCount,
    guardrails: {
      reachedDay: nowDay(Game), over: !!Game.over,
      starvationDeaths: starvation.map(t => ({ day: t.day, who: t.whoName, cause: t.cause })),
      waveUnlockDays: waveDay, wave2GateOk: wave2day == null || wave2day >= 8,
      popAlive: livingVids(Game).length,
      pantryEnd: Math.round(pantryKcal(Game)),
      contestsFired: contestFires.length,
      pilotAiredDay: ctx._pilotDay != null ? ctx._pilotDay : null,
    },
    convoPath, fightSegPath, contestSegPath,
    foodTrack, prodByBucket, plentyLedgerFinal, depositGateFinal,
    m1FoodSecurity,
  };
  try { fs.writeFileSync(EVID + `/journey-establishment-r27-seed${seed}.json`, JSON.stringify(out, null, 1)); } catch (e) { warnOnce('jsonWrite', e); }
  console.log(`[r27] seed ${seed}: day ${out.reachedDay} personDeaths=${dc.personDeaths} vVsV=${dc.villagerVsVillager} openCombatVV=${openCombatVV.length} ambush=${ambushRecs.length} villagerKills=${dc.villagerKilledMonster} favorRepeatHits=${favorRepeatHits} fights=${fightIds.length} pantryEnd=${(prodByBucket||{}).pantryEnd} packEnd=${Math.round(packKcal(Game))} M1sec=${m1FoodSecurity.verdict} crisisDays=${crisisDays}`);
  return out;
}

(async () => {
  const results = [];
  for (const seed of SEEDS) {
    try { results.push(await runSeed(seed)); }
    catch (e) { console.error(`[r27] seed ${seed} FAILED:`, (e && e.message) || e); }
  }
  const agg = { run: 'r27', seeds: SEEDS, personDeaths: 0, vVsV: 0, openCombatVV: 0, villagerKilledMonster: 0, playerKilledMonster: 0, villagerDiedToMonster: 0, betrayalAmbush: 0, playerKilledVillager: 0, favorRepeatHits: 0, fightCount: 0, ambushRecs: [] };
  for (const r of results) {
    const dc = r.deathCensus || {};
    agg.personDeaths += dc.personDeaths || 0;
    agg.vVsV += dc.villagerVsVillager || 0;
    agg.openCombatVV += (r.m1aOpenCombatVV || []).length;
    agg.villagerKilledMonster += dc.villagerKilledMonster || 0;
    agg.playerKilledMonster += dc.playerKilledMonster || 0;
    agg.villagerDiedToMonster += dc.villagerDiedToMonster || 0;
    agg.betrayalAmbush += dc.betrayalAmbush || 0;
    agg.playerKilledVillager += dc.playerKilledVillager || 0;
    agg.favorRepeatHits += r.favorRepeatHits || 0;
    agg.fightCount += r.fightCount || 0;
    agg.stagedFightCount = (agg.stagedFightCount || 0) + (r.stagedFightCount || 0);
    if (r.m1bAmbush && r.m1bAmbush.length) agg.ambushRecs.push({ seed: r.seed, recs: r.m1bAmbush });
    if (r.m1aOpenCombatVV && r.m1aOpenCombatVV.length) agg.openCombatRecs = (agg.openCombatRecs || []).concat({ seed: r.seed, recs: r.m1aOpenCombatVV });
  }
  try { fs.writeFileSync(EVID + '/journey-establishment-r27-teleagg.json', JSON.stringify(agg, null, 1)); } catch (e) { warnOnce('aggWrite', e); }
  console.log('[r27] aggregate:', JSON.stringify(agg));
})().catch(e => { console.error('[r27] FATAL', (e && e.stack) || e); process.exit(1); });
