#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40) R28 — NEWCOMER INTEGRATION + stay-green (2026-10-23).
// Rotation index 1 (establishment). Base: master@db7a04563.
// Pre-registered in hidden_files/evidence/2026-10-23/journey-establishment-r28-note.md.
//
// Leg question: stay-green of r27's verdicts on the moved base, plus NEWCOMER
// INTEGRATION — when strangers join during establishment, are they fed, taught,
// spoken to like people, welcomed aloud, or silent mouths?
// Instrument: r27 harness + daily intake drive (harness accepts best pending
// application score>=50 with housing room, 1/day — what a competent player
// would do), daily roster-diff arrival detection, per-newcomer tracking.
// Binding: M1 food-security (r27 bar); M1a zero open-combat v-vs-v; M1b ambush
// <=2/leg plot-backed; M2 >=8 transcripts sense-read, 0 senseless, 0
// fabricated, favorRepeatHits=0; M3 >=2 player-fight transcripts/seed +
// >=1 contest episode where fired; M4 newcomer integration (>=3 newcomers,
// zero 7d arrival-window hunger deaths, >=50% integrated within 14d; NO-DATA
// if the pipeline stays dry). Guardrails: full-leg simulation with village
// alive; wave-2 >= d8; no softlocks; pilot aired; contests >=2/village.
// Usage: SEEDS=61 node scripts/journey-establishment-r28-20261023.js
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
  console.warn('[r28:' + key + ']', (e && e.message) || e);
}
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function packKcal(Game) {
  try {
    const today = ((Game.state || {}).scholar || {}).day || 0;
    const pack = (Game.state.village || {}).pack || {};
    return Object.keys(pack).reduce((t, vid) => {
      const p = pack[vid] || {};
      if (p.day !== today) return t;
      return t + (p.kcal || 0);
    }, 0);
  } catch (e) { return 0; }
}
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
function rosterIds(Game) {
  try { return ((Game.state.village || {}).roster || []).slice(); } catch (e) { return []; }
}
function nameOf(Game, id) {
  try { return id === 'p' ? 'You' : (Game.displayName ? Game.displayName(id) : id); } catch (e) { return String(id); }
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
// r28: daily intake drive — a competent player accepts good applicants. Once
// per day, best pending application with score>=50 and housing room>0.
function driveIntake(Game, ctx) {
  try {
    if (ctx._intakeDoneToday) return;
    ctx._intakeDoneToday = true;
    const m = Game.mshipState ? Game.mshipState() : null;
    const apps = (m && m.applications) || [];
    ctx._appsSeen = Math.max(ctx._appsSeen || 0, apps.length);
    if (!apps.length) return;
    let room = 1;
    try { const g = Game.growthStatus ? Game.growthStatus() : null; room = (g && g.room) || 0; } catch (e) {}
    if (room <= 0) { return; }
    let best = null, bestScore = -1;
    for (const a of apps) {
      let s = 0;
      try { const j = Game.judgeApplication(a); s = (j && j.score) || 0; } catch (e) {}
      if (s > bestScore) { bestScore = s; best = a; }
    }
    // COMPETENT (r28 pilot fix): never recruit into hunger. judgeApplication
    // says it explicitly ("Another mouth the pantry can't feed", -20); the
    // game's own foodSupports(1) is the gate a competent player reads.
    let fsOk = true;
    try { const fs = Game.foodSupports ? Game.foodSupports(1) : null; fsOk = !fs || !!fs.ok; } catch (e) { fsOk = true; }
    if (!fsOk) { ctx._intakeFoodBlocked = (ctx._intakeFoodBlocked || 0) + 1; return; }
    if (best && bestScore >= 50) {
      try {
        Game.acceptApplication(best.id);
        (ctx._intakeLog = ctx._intakeLog || []).push({ day: nowDay(Game), name: best.name, score: bestScore });
      } catch (e) { warnOnce('acceptApp', e); }
    }
  } catch (e) { warnOnce('driveIntake', e); }
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true, narration: true });
  await setupGame(Game);
  const policy = competent;
  const ctx = { policyId: policy.id, notes: [], _intakeLog: [], _appsSeen: 0 };
  if (policy.setup) { try { policy.setup(Game, ctx); } catch (e) { warnOnce('setup', e); } }

  const narr = [];
  const fightMeta = {};
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

  // r28: arrival detection — roster diff each day.
  let prevRoster = new Set(rosterIds(Game));
  const arrivals = []; // {id, name, arrivalDay}
  const foodTrack = [];
  const PROD_KINDS = { FORAGE: 1, TRAPS: 1, HAUL: 1, EXPLORE: 1 };
  for (let d = 1; d <= DAYS; d++) {
    ctx._intakeDoneToday = false;
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
      const mouths = vids.length;
      const pp = Math.round(playerPackKcal(Game));
      const security = pk + pack + pp;
      foodTrack.push({ d, day: nowDay(Game), pantry: pk, pack, playerPack: pp, security, hungryStreak: hs, alive: mouths, kinds, crisis: hs >= 3 && security < mouths * 2000 });
    } catch (e) { warnOnce('foodTrack', e); }
    for (let p = 0; p < 3; p++) {
      if (policy.upkeep) { try { policy.upkeep(Game, ctx); } catch (e) { warnOnce('upkeep', e); } }
      try { driveIntake(Game, ctx); } catch (e) { warnOnce('driveIntake', e); }
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
    // r28: roster diff — new ids are arrivals.
    try {
      const cur = new Set(rosterIds(Game));
      for (const id of cur) {
        if (!prevRoster.has(id) && id !== 'p') {
          arrivals.push({ id, name: nameOf(Game, id), arrivalDay: gd });
        }
      }
      prevRoster = cur;
    } catch (e) { warnOnce('arrivalDiff', e); }
    const liv = livingVids(Game).length;
    if (liv === 0) { ctx._deadTail = (ctx._deadTail || 0) + 1; if (ctx._deadTail >= 10) break; }
    else ctx._deadTail = 0;
  }

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
  const convoPath = EVID + `/journey-establishment-r28-convo-seed${seed}.txt`;
  const convoLines = [];
  let favorRepeatHits = 0;
  function holdConvo(vid, tag) {
    const nm = nameOf(Game, vid);
    const p = (Game.getPerson ? Game.getPerson(vid) : {}) || {};
    convoLines.push(`\n-- ${tag} ${nm} (${String(vid).slice(0, 8)}) occ=${p.occupation || p.formerOccupation || '?'} --`);
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
      if (/favor_requirements/.test(pick.id || '')) {
        const key = String(r.line || '');
        seenReq[key] = (seenReq[key] || 0) + 1;
        if (seenReq[key] >= 3) favorRepeatHits++;
      }
      if (r.ended) { convoLines.push('(ended by engine)'); break; }
    }
    try { const end = Game.endConvo(vid, 'done'); if (end && end.line) convoLines.push('closing: ' + end.line); } catch (e) { convoLines.push('endConvo: ' + e.message); }
  }
  try {
    const cv = livingVids(Game).slice(0, 3);
    convoLines.push(`=== seed ${seed} — held conversations (end day ${nowDay(Game)}) ===`);
    for (const vid of cv) holdConvo(vid, '[villager]');
    // r28: newcomer conversations — up to 3 arrivals still alive.
    const newcomerVids = arrivals.map(a => a.id).filter(id => {
      try { return !((Game.getPerson(id) || {}).dead); } catch (e) { return false; }
    }).slice(0, 3);
    for (const vid of newcomerVids) holdConvo(vid, '[NEWCOMER]');
    convoLines.push(`\nnewcomers held: ${newcomerVids.length}`);
  } catch (e) { convoLines.push('ERROR: ' + e.message); }
  try { fs.writeFileSync(convoPath, convoLines.join('\n')); } catch (e) { warnOnce('convoWrite', e); }

  // ---- staged player fights (post-census) ----
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

  // ---- extract fight + contest segments from the narration corpus ----
  const fightIds = Object.keys(fightMeta);
  const fightSegPath = EVID + `/journey-establishment-r28-fights-seed${seed}.txt`;
  try {
    const fightLines = [];
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
  const contestSegPath = EVID + `/journey-establishment-r28-contests-seed${seed}.txt`;
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
  try {
    fs.writeFileSync(EVID + `/journey-establishment-r28-narr-seed${seed}.jsonl`, narr.map(n => JSON.stringify(n)).join('\n'));
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

  // ---- M1 food-security ----
  const starvation = deaths.filter(t => /starvat|hunger|thirst/.test(String(t.cause || '')) && (t.kind === 'villager' || t.kind === 'person'));
  const legWindowStarvation = starvation.filter(t => (t.day || 0) >= 15);
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

  // ---- r28: M4 newcomer integration ----
  // Integration evidence: narr lines within 14d of arrival naming the newcomer
  // with teach/learn/showed/water/food/welcome/kindness/task/guard/duty/arrive/joined.
  const INTEG_RE = /teach|taught|learn|showed|water|food|welcome|kindness|task|guard|duty|arriv|joined|walk/i;
  const newcomerReport = arrivals.map(a => {
    const first = String(a.name || '').split(' ')[0];
    const re = first ? new RegExp(first.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : null;
    const window = narr.filter(n => n.day >= a.arrivalDay && n.day <= a.arrivalDay + 14);
    const named = re ? window.filter(n => re.test(n.text)) : [];
    const integ = named.filter(n => INTEG_RE.test(n.text)).map(n => ({ day: n.day, text: n.text.slice(0, 160) }));
    const arrivalBeat = re ? narr.filter(n => n.day >= a.arrivalDay - 5 && n.day <= a.arrivalDay + 2 && re.test(n.text) && /arriv|joined|walk|reach/i.test(n.text)).map(n => ({ day: n.day, text: n.text.slice(0, 160) })) : [];
    const death = deaths.find(d => String(d.who) === String(a.id));
    const deathRec = death ? { day: death.day, cause: death.cause, kind: death.kind } : null;
    const hungerDeath7 = deathRec && (deathRec.day - a.arrivalDay) <= 7 && /starvat|hunger|thirst|exposure/.test(String(deathRec.cause || ''));
    return {
      id: a.id, name: a.name, arrivalDay: a.arrivalDay,
      alive: !deathRec, death: deathRec, hungerDeathWithin7d: !!hungerDeath7,
      arrivalBeat: arrivalBeat.slice(0, 3),
      integLines: integ.slice(0, 6), integCount: integ.length,
      integrated: integ.length > 0,
    };
  });
  const m4 = {
    newcomers: newcomerReport.length,
    newcomerDetail: newcomerReport,
    appsSeenMax: ctx._appsSeen || 0,
    intakeFoodBlockedDays: ctx._intakeFoodBlocked || 0,
    intakeAccepted: (ctx._intakeLog || []).length,
    intakeLog: ctx._intakeLog || [],
    hungerDeaths7d: newcomerReport.filter(n => n.hungerDeathWithin7d).map(n => ({ name: n.name, day: n.death.day, cause: n.death.cause })),
    integratedCount: newcomerReport.filter(n => n.integrated).length,
    verdict: (function () {
      if (newcomerReport.length < 3) return 'NO-DATA';
      if (newcomerReport.some(n => n.hungerDeathWithin7d)) return 'NO-GO';
      return (newcomerReport.filter(n => n.integrated).length / newcomerReport.length) >= 0.5 ? 'GO' : 'NO-GO';
    })(),
  };

  const wave2day = waveDay[2] != null ? waveDay[2] : null;
  const out = {
    seed, run: 'r28', reachedDay: nowDay(Game), over: !!Game.over, policy: policy.id,
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
    m1FoodSecurity, m4Newcomer: m4,
    intakeAccepted: ctx._intakeLog || [],
  };
  try { fs.writeFileSync(EVID + `/journey-establishment-r28-seed${seed}.json`, JSON.stringify(out, null, 1)); } catch (e) { warnOnce('jsonWrite', e); }
  console.log(`[r28] seed ${seed}: day ${out.reachedDay} personDeaths=${dc.personDeaths} vVsV=${dc.villagerVsVillager} openCombatVV=${openCombatVV.length} ambush=${ambushRecs.length} villagerKills=${dc.villagerKilledMonster} favorRepeatHits=${favorRepeatHits} fights=${fightIds.length} pantryEnd=${(prodByBucket||{}).pantryEnd} M1sec=${m1FoodSecurity.verdict} newcomers=${m4.newcomers} M4=${m4.verdict} integrated=${m4.integratedCount}`);
  return out;
}

(async () => {
  const results = [];
  for (const seed of SEEDS) {
    try { results.push(await runSeed(seed)); }
    catch (e) { console.error(`[r28] seed ${seed} FAILED:`, (e && e.message) || e); }
  }
  const agg = { run: 'r28', seeds: SEEDS, personDeaths: 0, vVsV: 0, openCombatVV: 0, villagerKilledMonster: 0, playerKilledMonster: 0, villagerDiedToMonster: 0, betrayalAmbush: 0, playerKilledVillager: 0, favorRepeatHits: 0, fightCount: 0, newcomers: 0, m4verdicts: [], ambushRecs: [] };
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
    const m4 = r.m4Newcomer || {};
    agg.newcomers += m4.newcomers || 0;
    agg.m4verdicts.push({ seed: r.seed, verdict: m4.verdict, newcomers: m4.newcomers, integrated: m4.integratedCount, hungerDeaths7d: (m4.hungerDeaths7d || []).length });
    if (r.m1bAmbush && r.m1bAmbush.length) agg.ambushRecs.push({ seed: r.seed, recs: r.m1bAmbush });
    if (r.m1aOpenCombatVV && r.m1aOpenCombatVV.length) agg.openCombatRecs = (agg.openCombatRecs || []).concat({ seed: r.seed, recs: r.m1aOpenCombatVV });
  }
  try { fs.writeFileSync(EVID + '/journey-establishment-r28-teleagg.json', JSON.stringify(agg, null, 1)); } catch (e) { warnOnce('aggWrite', e); }
  console.log('[r28] aggregate:', JSON.stringify(agg));
})().catch(e => { console.error('[r28] FATAL', (e && e.stack) || e); process.exit(1); });
