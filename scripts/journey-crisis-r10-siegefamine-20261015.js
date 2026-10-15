#!/usr/bin/env node
// journey-crisis-r10-siegefamine-20261015.js — CRISIS LEG r10: the post-famine siege.
//
// Famine then teeth: establish 12d, stage an 8-day blight famine (refused
// inflows + staged 25%/day pantry rot, trajectory asserted), lift it, and let
// the village climb back to a raid-smelling pantry (>=3k kcal). The raid's
// TIMING is organic — havenRaidTick runs its real 18%/day roll via progDaily;
// only the famine is staged. All downstream machines stay real: starvation,
// hunger-winter, relief, defenders fighting blow-by-blow, 'defended'
// memories, aid-crisis raise/resolve, the-siege crisis beat, trust shifts.
//
// Leg question: when the village climbs out of famine and the raid hits its
// thin recovery, does it hold the line like people — do defenders step up,
// do conversations carry the raid, do the fallen get mourned, and does the
// trust hierarchy shift?
//
// PRE-REGISTERED METRICS (binding, MEASUREMENT.md §14):
//   M1: >=2/3 seeds — raid fires organically after the blight lifts AND >=1
//       defender-vs-raider blow-by-blow fight is recorded.
//   M2: >=2/3 seeds — >=3/4 end-state conversations carry the raid
//       (latelyKind defense/mourning with on-topic content).
//   M3: >=2/3 seeds — trust-hierarchy top-3 at raid day differs from top-3
//       at end (someone rose or fell).
// Seeds: 6141, 6242, 6343 (exact literals). Policy: oracleV2.
// Horizon: 12 establish + 8 blight + recovery to d55 max. Death-aware:
// stop on collapse (+10d tail max).
//
// Usage: SEED=6141 node scripts/journey-crisis-r10-siegefamine-20261015.js
// Output: JSON record to stdout; narrative + transcripts to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '6141', 10);
const ESTABLISH = 12, BLIGHT_DAYS = 8, MAX_DAY = 55;

function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try { return Math.round((Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)); }
  catch (e) { return 0; }
}
function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function livingRoster(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => {
    try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; }
  });
}
function trustTop(Game, n) {
  const v = Game.state.village || {};
  const t = v.trust || {};
  return Object.keys(t).sort((a, b) => (t[b] || 0) - (t[a] || 0)).slice(0, n || 3)
    .map(id => ({ name: firstName(rawName(Game, id)), trust: Math.round(t[id] || 0) }));
}
function worldMonsterCount(Game) {
  try { return (Game.worldMonsters ? Game.worldMonsters() : []).length || 0; } catch (e) { return 0; }
}
function blightRot(Game, frac) {
  const v = Game.state.village || {};
  const pan = v.pantry || [];
  const total = pan.reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  let target = Math.round(total * frac);
  const sorted = pan.slice().sort((a, b) =>
    ((b.kcalEach || 0) * (b.units || 1)) - ((a.kcalEach || 0) * (a.units || 1)));
  for (const it of sorted) {
    if (target <= 0) break;
    const k = (it.kcalEach || 0) * (it.units || 1);
    if (k <= 0) continue;
    const take = Math.min(k, target);
    const units = Math.min(it.units || 1, Math.ceil(take / (it.kcalEach || 1)));
    it.units = (it.units || 1) - units;
    target -= units * (it.kcalEach || 0);
  }
  v.pantry = pan.filter(it => (it.units || 0) > 0);
}

function driveConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 12;
  const out = [`## ${tag} — talking to ${firstName(rawName(Game, vid))}`];
  let latelyKind = 'unknown';
  try { const ev = Game.t2LatelyEvent ? Game.t2LatelyEvent(vid) : null; latelyKind = ev ? ev.kind : 'none'; } catch (e) {}
  out.push(`[latelyKind=${latelyKind}]`);
  try { Game.startConvo(vid); } catch (e) { return out.join('\n') + ' (startConvo threw: ' + e.message + ')'; }
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    let pick = choices.find(c => c.id === 'ask:lately');
    if (!pick) pick = choices.find(c => /^gq:/.test(c.id));
    if (!pick) pick = choices.find(c => /raid|treeline|defen|attack|fight|fighting|blood|dead|died|gone|grief|mourn|buri|funeral|scared|afraid|hunger|hungry|starv|food|eat|desperat|siege|watch|wall/i.test(c.text || ''));
    if (!pick) pick = choices.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
    if (!pick) pick = choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick) break;
    if (/^(leave|bye|goodbye)/.test(pick.id)) break;
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 100)}`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    const c = Game.convoGet(vid);
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
    const last = (c.transcript || []).slice(-2);
    for (const e of last) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 400)}`);
    out.push('');
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const c = Game.convoGet(vid);
  out.push('\n### FULL TRANSCRIPT');
  for (const e of ((c && c.transcript) || [])) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 600)}`);
  return { latelyKind, text: out.join('\n') };
}

async function main() {
  const E = console.error;
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-siegefamine', fullTelemetry: true });
  await setupGame(Game);
  const rec = {
    seed: SEED, stageFail: false, raidFired: false, raidDay: 0,
    crises: [], deaths: [], defenderFights: [], raidResolutions: [],
    playerDeaths: [], convos: [], trustAtRaid: [], trustAtEnd: [],
    pantryTrace: [], blockedKcal: 0, endDay: 0, over: false, notes: [],
  };

  // ---- instrumentation (all call-through) ----
  const _fc = Game.fireCrisis;
  Game.fireCrisis = function (kind, ctx) {
    const r = _fc ? _fc.call(this, kind, ctx) : undefined;
    try { if (r === true) { rec.crises.push({ day: dayOf(Game), kind }); E(`[CRISIS] d${dayOf(Game)} ${kind}`); } } catch (e) {}
    return r;
  };
  const _rd = Game.registerDeath;
  Game.registerDeath = function (info) {
    const r = _rd ? _rd.call(this, info) : undefined;
    try {
      const nm = firstName((info && info.name) || rawName(Game, info && info.villagerId));
      rec.deaths.push({ day: dayOf(Game), name: nm, cause: String((info && info.cause) || ''), kind: String((info && info.kind) || '') });
      if (/raid|defen/i.test(String((info && info.cause) || ''))) E(`[DEATH] d${dayOf(Game)} ${nm} — ${info.cause}`);
    } catch (e) {}
    return r;
  };
  const _rw = Game.resolveWildMonsterEncounter;
  Game.resolveWildMonsterEncounter = function (vid, m, opts) {
    let hpBefore = 0;
    try { hpBefore = (m && m.hp) || 0; } catch (e) {}
    const r = _rw ? _rw.call(this, vid, m, opts) : undefined;
    try {
      if (opts && opts.raid) {
        let defHp = -1, defAlive = true;
        try { const h = (Game.state.village.health || {})[vid]; defHp = (h === undefined ? -1 : h); } catch (e) {}
        try { const vp = Game.vpOf(vid); defAlive = !!(vp && !vp.dead); } catch (e) {}
        rec.defenderFights.push({
          day: dayOf(Game), defender: firstName(rawName(Game, vid)),
          monster: String((m && m.id) || '?'),
          mHpBefore: hpBefore, mHpAfter: (m && m.hp) || 0,
          defHpAfter: defHp, defAlive,
        });
        E(`[DEFEND] d${dayOf(Game)} ${firstName(rawName(Game, vid))} vs ${String((m && m.id) || '?')} mHp ${hpBefore}->${(m && m.hp) || 0} defAlive=${defAlive}`);
      }
    } catch (e) {}
    return r;
  };
  const _hrt = Game.havenRaidTick;
  Game.havenRaidTick = function () {
    const r = _hrt ? _hrt.call(this) : false;
    try {
      if (r === true) {
        rec.raidFired = true; rec.raidDay = dayOf(Game);
        if (!rec.firstRaidDay) { rec.firstRaidDay = dayOf(Game); rec.trustAtFirstRaid = trustTop(Game, 3); }
        rec.trustAtRaid = trustTop(Game, 3);
        E(`[RAID] d${dayOf(Game)} havenRaidTick FIRED — pantry=${pantryKcal(Game)} monsters=${worldMonsterCount(Game)}`);
      }
    } catch (e) {}
    return r;
  };
  const _rac = Game.resolveAidCrisis;
  Game.resolveAidCrisis = function (how) {
    let crisis = null;
    try { crisis = Game.aidCrisis ? Game.aidCrisis() : null; } catch (e) {}
    const r = _rac ? _rac.call(this, how) : undefined;
    try {
      if (crisis && crisis.raiders) {
        rec.raidResolutions.push({ day: dayOf(Game), how: String(r || how) });
        E(`[RAID-RESOLVE] d${dayOf(Game)} aid crisis resolved: ${r}`);
      }
    } catch (e) {}
    return r;
  };
  const _pd = Game.playerDeath;
  Game.playerDeath = function (cause) {
    const d = dayOf(Game);
    let oldBearer = '?';
    try { oldBearer = rawName(Game, Game.villagerId); } catch (e) {}
    const oldVid = Game.villagerId;
    let r;
    try { r = _pd ? _pd.call(this, cause) : undefined; } catch (e) { r = 'threw:' + e.message; }
    let newBearerName = '?';
    try { newBearerName = rawName(Game, Game.villagerId); } catch (e) {}
    rec.playerDeaths.push({ day: d, cause: String(cause || ''), oldBearer: firstName(oldBearer), newBearer: firstName(newBearerName), changed: oldVid !== Game.villagerId, over: !!Game.over });
    E(`[PLAYER-DEATH] d${d} ${firstName(oldBearer)} -> ${firstName(newBearerName)} (${cause})`);
    return r;
  };

  // ---- phase 1: establish ----
  E(`[SETUP] seed ${SEED}: oracleV2 establishing ${ESTABLISH}d...`);
  await runDays(Game, oracleV2, { days: ESTABLISH });
  if (Game.over) { E('[SETUP] game over during establish — abort'); console.log(JSON.stringify(rec)); return; }
  E(`[ESTABLISHED] d${dayOf(Game)} pop=${livingRoster(Game).length} pantry=${pantryKcal(Game)}`);

  // ---- phase 2: the blight — refuse inflows + staged rot ----
  const pantryPreBlight = pantryKcal(Game);
  const _pa = Game.pantryAdd;
  Game.pantryAdd = function (item) {
    rec.blockedKcal += (item && (item.kcalEach || 0) * (item.units || 1)) || 0;
    return false;
  };
  const _sp = Game.stockPantry;
  Game.stockPantry = function (kcal) { rec.blockedKcal += (kcal || 0); return undefined; };
  rec.notes.push('blight: pantryAdd+stockPantry refused + 25%/day staged rot from d' + dayOf(Game) + ' (pre-blight pantry=' + pantryPreBlight + ')');
  for (let i = 0; i < BLIGHT_DAYS && !Game.over; i += 2) {
    await runDays(Game, oracleV2, { days: Math.min(2, BLIGHT_DAYS - i) });
    if (Game.over) break;
    blightRot(Game, 0.25);
    const pk = pantryKcal(Game);
    rec.pantryTrace.push({ day: dayOf(Game), pantry: pk, pop: livingRoster(Game).length });
    E(`[BLIGHT] d${dayOf(Game)} pantry=${pk} pop=${livingRoster(Game).length} blocked=${Math.round(rec.blockedKcal)}`);
  }
  const pantryAfterBlight = pantryKcal(Game);
  // BITE TEST (relative — a rich village's absolute floor is meaningless):
  // the famine bites if the pantry fell >=70% or below 5000.
  const blightDrop = pantryPreBlight > 0 ? (pantryPreBlight - pantryAfterBlight) / pantryPreBlight : 0;
  if (!(blightDrop >= 0.70 || pantryAfterBlight < 5000)) {
    rec.stageFail = true;
    E(`[STAGE-FAIL] blight did not bite: ${pantryPreBlight} -> ${pantryAfterBlight} (drop ${Math.round(blightDrop * 100)}%)`);
  } else {
    E(`[BLIGHT-LIFT] d${dayOf(Game)} pantry ${pantryPreBlight}->${pantryAfterBlight} (drop ${Math.round(blightDrop * 100)}%) — the famine bit. Lifting the blight.`);
  }
  // lift
  Game.pantryAdd = _pa;
  Game.stockPantry = _sp;

  // ---- phase 3: recovery — wait for the organic raid ----
  let eligibleDays = 0, firstEligibleDay = 0;
  for (let d = dayOf(Game); d < MAX_DAY && !Game.over; d += 2) {
    await runDays(Game, oracleV2, { days: Math.min(2, MAX_DAY - d) });
    if (Game.over) break;
    const pk = pantryKcal(Game);
    const mc = worldMonsterCount(Game);
    const v = Game.state.village || {};
    const eligible = pk >= 3000 && mc >= 3;
    if (eligible && !firstEligibleDay) firstEligibleDay = dayOf(Game);
    if (eligible) eligibleDays += 2;
    rec.pantryTrace.push({ day: dayOf(Game), pantry: pk, pop: livingRoster(Game).length, eligible });
    E(`[RECOVER] d${dayOf(Game)} pantry=${pk} pop=${livingRoster(Game).length} monsters=${mc} eligible=${eligible} raid=${rec.raidFired}`);
    if (rec.raidFired) break;
    if (livingRoster(Game).length < 2) { E('[COLLAPSE] village scattered — tail'); break; }
  }
  rec.eligibleDays = eligibleDays;
  rec.firstEligibleDay = firstEligibleDay;
  if (!rec.raidFired) {
    rec.notes.push('NO-RAID: no organic raid fired by d' + dayOf(Game) + ' (' + eligibleDays + ' eligible days)');
    E('[NO-RAID] the raid never came — documented, not forced.');
  }

  // ---- mid-raid people check ----
  if (rec.raidFired && !Game.over) {
    E('\n[PEOPLE] mid-raid conversations (1-2d after raid)...');
    await runDays(Game, oracleV2, { days: 2 });
    const roster = livingRoster(Game);
    const defenders = [...new Set(rec.defenderFights.map(f => f.defender))];
    const pick = [];
    for (const nm of defenders) {
      const id = roster.find(x => firstName(rawName(Game, x)) === nm);
      if (id && pick.length < 2) pick.push({ id, tag: 'mid-raid defender' });
    }
    for (const id of roster) {
      if (pick.length >= 4) break;
      if (pick.some(p => p.id === id)) continue;
      pick.push({ id, tag: 'mid-raid villager' });
    }
    for (const p of pick) {
      const r = driveConvo(Game, p.id, `${p.tag} d${dayOf(Game)}`, 12);
      rec.convos.push({ phase: 'mid-raid', vid: String(p.id), name: firstName(rawName(Game, p.id)), latelyKind: r.latelyKind, text: r.text });
      E(`[CONVO] mid-raid ${firstName(rawName(Game, p.id))} latelyKind=${r.latelyKind}`);
    }
  }

  // ---- phase 4: run to the horizon ----
  for (let d = dayOf(Game); d < MAX_DAY && !Game.over; d += 5) {
    await runDays(Game, oracleV2, { days: Math.min(5, MAX_DAY - d) });
    if (Game.over) break;
    if (livingRoster(Game).length < 2) break;
  }
  rec.endDay = dayOf(Game);
  rec.over = !!Game.over;

  // ---- end-state people check ----
  if (!Game.over) {
    E('\n[PEOPLE] end-state conversations...');
    const roster = livingRoster(Game);
    const defenders = [...new Set(rec.defenderFights.map(f => f.defender))];
    const deadDefenders = defenders.filter(nm => !roster.some(x => firstName(rawName(Game, x)) === nm));
    const pick = [];
    for (const nm of defenders) {
      const id = roster.find(x => firstName(rawName(Game, x)) === nm);
      if (id && pick.length < 2) pick.push({ id, tag: 'end defender' });
    }
    for (const id of roster) {
      if (pick.length >= 4) break;
      if (pick.some(p => p.id === id)) continue;
      pick.push({ id, tag: 'end villager' });
    }
    for (const p of pick) {
      const r = driveConvo(Game, p.id, `${p.tag} d${dayOf(Game)}`, 12);
      rec.convos.push({ phase: 'end', vid: String(p.id), name: firstName(rawName(Game, p.id)), latelyKind: r.latelyKind, text: r.text });
      E(`[CONVO] end ${firstName(rawName(Game, p.id))} latelyKind=${r.latelyKind}`);
    }
    rec.deadDefenders = deadDefenders;
  }
  rec.trustAtEnd = trustTop(Game, 3);

  // ---- census ----
  const v = Game.state.village || {};
  const fallen = (v.fallen || []).map(f => ({
    day: f.day, name: firstName(f.name || rawName(Game, f.vid)), cause: f.cause,
  }));
  rec.fallen = fallen;
  rec.census = livingRoster(Game).map(id => ({ name: firstName(rawName(Game, id)) }));
  E(`\n[CENSUS] d${rec.endDay} over=${rec.over} living=${rec.census.length} fallen=${fallen.length} raidFired=${rec.raidFired}`);
  E(`  trust@raid: ${JSON.stringify(rec.trustAtRaid)}`);
  E(`  trust@end:  ${JSON.stringify(rec.trustAtEnd)}`);
  E(`  defenderFights: ${rec.defenderFights.length} resolutions: ${JSON.stringify(rec.raidResolutions)}`);
  E(`  metrics: M1(raid+fight)=${rec.raidFired && rec.defenderFights.length >= 1}`);

  console.log(JSON.stringify(rec));
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
