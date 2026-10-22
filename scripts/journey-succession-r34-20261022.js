#!/usr/bin/env node
// journey-succession-r34-20261022.js — SUCCESSION LEG r34: "THE SUCCESSOR'S LEDGER"
// Journey leg 7: death of the player character, the mantle passing, the new
// bearer's life. LANE B.
//
// LEG QUESTION (pre-registered, MEASUREMENT.md §§9-12, 14): after the mantle
// passes mid-run, does the successor inherit a CONTINUOUS game — or a ledger
// of orphaned obligations, phantom intents, and evaporated knowledge? The
// machinery under audit (all with prior fix notes in ledger.js /
// villager-build.js): open promises released at death; camp claim lapsed;
// join released; feast-draw/rage/feastBuff/blood-price cleared; door-flee
// monsters tagged to the dead bearer; the Codex passing whole (Steve
// 2026-10-14 "codex rule": the dead bearer's skills stay as the office's
// written knowledge); the successor taking THEIR OWN abilities/XP/skills/
// knowledge (Steve 2026-10-14: "You become that villager" — the dead
// bearer's abilities die with them).
//
// PROFILE: competent policy throughout. One forced favor+promise through the
// real favor machinery pre-death (r29/r33 precedent: forced, mechanism real),
// one thread planted pre-death. Scripted kill via the REAL playerDeath
// ('a hushwolf') ~d13. Post-death: 21 days of REAL competent play as the
// successor (not just driven convos) + sense-read convos at d+7/d+14/d+21.
// Death-aware: dead/scattered village stops the run (+10d tail max).
//
// BINDING METRICS (§14):
//   M1: >=3/4 mantles pass (newId != oldId, linOk, moOk, game continues).
//       Kill rule: fails on >=2/4 -> SUBSTRATE-MISSING.
//   M2 (continuity): on >=3/4 seeds, every pre-death open promise is
//       RELEASED by d+7 (kept='released', inherited flag) and no promise/
//       favor/seed record still points at the dead bearer as a live
//       obligation. Orphans -> REAL BUG.
//   M3 (no phantom projects): 0 cases on all seeds where the successor is
//       acted-upon by the dead bearer's pending intents after death:
//       camp claim, joinedVillage, pendingEncounter/pendingMonsterId,
//       feastDraw, rageActive, feastBuff, bloodPriceWound>0, door-flee
//       monsters bearing the dead id.
//   M4 (identity): 0 identity failures in post-death say log + sense-read
//       transcripts — nobody addresses the successor by the dead name,
//       nobody narrates the dead bearer as alive. Full reads per
//       SENSE-TESTING LAW.
//   M5 (codex rule): on >=3/4 seeds, every pre-death codex entry
//       (plants/recipes/techniques/skills at counting level) persists
//       post-death, AND the successor's abilities come from their own
//       npcAbilities (no dead-bearer ability/XP transfer). Evaporation or
//       transfer -> REAL BUG.
//
// INTERESTING-FINDING CRITERIA:
//   (a) orphaned promises/phantom intents -> REAL BUG (fix if small, else file).
//   (b) codex evaporation or ability/XP transfer -> REAL BUG.
//   (c) identity failures or fabrications -> REAL BUG.
//   (d) M1 fails on >=2/4 -> SUBSTRATE-MISSING, abort.
// SEEDS: 9901-9904 (fresh; r33 used 9801-9804). Policy: competent.
// HORIZON: phase A d1-9, force+plant, kill ~d13, post-death +21d (~d34).
// Usage: SEED=9901 node scripts/journey-succession-r34-20261022.js
// Output: JSON record to stdout; narrative + transcripts to stderr.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '9901', 10);
const KILL_CAUSE = 'a hushwolf';
const POST_DAYS = 21;
const EVID_DIR = path.join(ROOT, 'evidence', '2026-10-22');
const DIRECT_KEEP = new Set(['food_share', 'forage_help', 'heal_help', 'sick_help', 'stay_close']);
const KIND_PREF = ['heal_help', 'sick_help', 'food_share', 'forage_help', 'stay_close'];
const SAY_CAP = 6000;

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) return ch.name; } catch (e) {}
  return String(vid).slice(0, 12);
}
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function trustOf(Game, vid) { try { return ((Game.state.village || {}).trust || {})[vid] || 0; } catch (e) { return 0; } }
function openPromise(Game, vid) {
  try { const p = ((Game.state.village || {}).promises || {})[vid]; return (p && !p.kept && p.kept !== 'released') ? p : null; } catch (e) { return null; }
}
function livingRoster(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => {
    try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; }
  });
}
function codexBreadth(Game) { try { return Game.codexBreadth(); } catch (e) { return -1; } }
// Snapshot of codex entries at counting level: {domain: {id: level}}
function codexSnapshot(Game) {
  const cx = (Game.state || {}).codex || {};
  const out = {};
  const domains = [
    ['plants', 1], ['monsters', 0], ['animals', 1], ['recipes', 1],
    ['techniques', 0], ['skills', 2], ['abilities', 1],
  ];
  for (const [dom, minLvl] of domains) {
    const d = cx[dom] || {};
    out[dom] = {};
    for (const [id, e] of Object.entries(d)) {
      if (dom === 'techniques') { out[dom][id] = 1; continue; }
      if (dom === 'monsters') {
        const stg = (e || {}).stage || '';
        if (stg === 'observed' || stg === 'slain') out[dom][id] = 1;
        continue;
      }
      if (((e || {}).level || 0) >= minLvl) out[dom][id] = (e || {}).level || 0;
    }
  }
  return out;
}
// Honest convo driver (r26/r28/r29/r30/r33, verbatim): used to plant threads
// and to sense-read post-death continuity. No promises through the driver.
function driveConvo(Game, vid, tag, commitRule, maxTurns) {
  maxTurns = maxTurns || 14;
  const out = [`## ${tag} — ${firstName(rawName(Game, vid))} on d${dayOf(Game)} (trust ${trustOf(Game, vid)})`];
  let refused = false, committed = false, picked = [];
  try {
    const r = Game.startConvo(vid);
    if (r && (r.refused || r.ended)) refused = true;
  } catch (e) { return { text: out.join('\n') + ' (startConvo threw: ' + e.message + ')', refused: 'throw', committed: false, flags: {} }; }
  const c0 = Game.convoGet(vid);
  if (refused || !c0 || !c0.active) {
    return { text: out.join('\n') + '\n(convo refused or never opened)', refused, committed: false, flags: { want: (c0 && c0.want && c0.want.id) || 'none' } };
  }
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    const c = Game.convoGet(vid);
    const wantId = (c && c.want && c.want.id) || '';
    let pick = null;
    const commitChoice = choices.find(x => x.id === 'dlg:commit');
    if (commitChoice && commitRule && /favor/i.test(wantId)) {
      if (commitRule(vid, {})) pick = commitChoice;
    }
    if (!pick) pick = choices.find(x => /^want:/.test(x.id) && !/favor/i.test(x.text || ''));
    if (!pick) pick = choices.find(x => /^want:/.test(x.id));
    if (!pick) pick = choices.find(x => /^(dlg:help|dlg:details)$/.test(x.id));
    if (!pick) {
      const fb = choices.find(x => !/^(leave|bye|goodbye|dlg:cant|dlg:commit)/.test(x.id) && !picked.includes(x.id));
      if (fb) { pick = fb; }
      else pick = choices.find(x => x.id === 'dlg:cant') || null;
    }
    if (!pick || /^(leave|bye|goodbye)/.test(pick.id)) break;
    picked.push(pick.id);
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 110)}`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    if (pick.id === 'dlg:commit' && openPromise(Game, vid)) committed = true;
    const cc = Game.convoGet(vid);
    if (!cc || !cc.active) { out.push('(conversation ended by the engine)'); break; }
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const cf = Game.convoGet(vid);
  const lines = [];
  for (const e2 of ((cf && cf.transcript) || [])) {
    lines.push(`${e2.who === 'you' ? 'YOU' : 'NPC'}: ${String(e2.text).slice(0, 500)}`);
  }
  const txt = lines.join('\n');
  out.push('\n### FULL TRANSCRIPT');
  out.push(lines.join('\n'));
  return { text: out.join('\n'), refused: false, committed, flags: { want: (cf && cf.want && cf.want.id) || 'none' }, fullText: txt };
}

// Force ONE favor+promise through the real favor machinery (r29 verbatim).
async function forcePromise(Game, E, watch) {
  const rec = { forced: null, notes: [] };
  for (let f = 0; f < 4 && !rec.forced && !Game.over; f++) {
    let wb = Game.villagerId;
    await runDays(Game, competent, { days: 1 });
    if (watch) wb = watch('force-day', wb);
    if (Game.over) break;
    const self = Game.villagerId;
    const v = Game.state.village || {};
    const cands = [];
    for (const vid of (v.roster || [])) {
      if (vid === self) continue;
      if (openPromise(Game, vid)) continue;
      if (trustOf(Game, vid) < 30) continue;
      let need = null;
      try { need = Game.convoFindFavorNeed && Game.convoFindFavorNeed(vid); } catch (e) {}
      if (!need || !DIRECT_KEEP.has(need.kind) || !(need.urgency >= 4)) continue;
      cands.push({ vid, kind: need.kind, need });
    }
    cands.sort((a, b) =>
      (KIND_PREF.indexOf(a.kind) < 0 ? 99 : KIND_PREF.indexOf(a.kind)) - (KIND_PREF.indexOf(b.kind) < 0 ? 99 : KIND_PREF.indexOf(b.kind)) ||
      trustOf(Game, b.vid) - trustOf(Game, a.vid));
    E(`FORCE d${dayOf(Game)}: ${cands.length} setup-eligible${cands.length ? ' (pick: ' + firstName(rawName(Game, cands[0].vid)) + ':' + cands[0].kind + ' trust ' + trustOf(Game, cands[0].vid) + ')' : ''}`);
    if (cands.length) {
      const { vid, need } = cands[0];
      try {
        const favor = Game.convoBuildFavor(vid, need);
        if (favor) {
          Game.convoStoreFavor(favor);
          const cr = Game.convoFavorCommit(vid, favor);
          if (cr && cr.ok) {
            rec.forced = { day: dayOf(Game), vid, kind: favor.kind, trustAtCommit: trustOf(Game, vid) };
            E(`FORCED COMMIT d${dayOf(Game)}: ${firstName(rawName(Game, vid))} kind=${favor.kind} trust=${trustOf(Game, vid)} — killing same day`);
          } else {
            E(`FORCE d${dayOf(Game)}: commit refused for ${firstName(rawName(Game, vid))}`);
          }
        } else {
          E(`FORCE d${dayOf(Game)}: buildFavor returned null for ${firstName(rawName(Game, vid))}`);
        }
      } catch (e) { E(`FORCE d${dayOf(Game)}: threw ${e.message}`); }
    }
  }
  if (!rec.forced) rec.notes.push('forcing: no setup-eligible need in 4 days — no open promise at this death (ask-frequency, not a failure)');
  return rec;
}

// ---- r34: pre-death continuity snapshot ("the successor's ledger") ----
function snapPre(Game, oldId) {
  const v = Game.state.village || {}, s = Game.state.scholar || {};
  const promises = {};
  for (const [vid, p] of Object.entries(v.promises || {})) {
    if (p && !p.kept && p.kept !== 'released') promises[vid] = { kind: p.kind || p.favorKind || '?', favorId: p.favorId || null, kept: p.kept || null };
  }
  const favorLedger = {};
  for (const [vid, f] of Object.entries(v.favorLedger || {})) {
    if (f && (f.state === 'promised' || f.state === 'asked')) favorLedger[vid] = f.state;
  }
  const seeds = {};
  for (const [vid, sd] of Object.entries(v.convoSeeds || {})) seeds[vid] = (sd && (sd.wantId || sd.favorId)) || '?';
  const doorFlee = ((Game.state.doorFledMonsters || []).map(m => ({ id: m && m.id, bearerId: m && m.bearerId })));
  const npcSets = {};
  for (const vid of (v.roster || [])) {
    npcSets[vid] = {
      abilities: ((v.npcAbilities || {})[vid] || []).slice(),
      skills: ((v.npcSkills || {})[vid] || []).slice(),
      know: Object.keys(((v.npcKnow || {})[vid]) || {}),
      xpTracks: Object.keys(((v.npcXp || {})[vid]) || {}).filter(k => k !== 'sheets'),
    };
  }
  return {
    day: dayOf(Game),
    codex: codexSnapshot(Game), breadth: codexBreadth(Game),
    scholarAbilities: ((s.abilities || []).map(a => a.id || a)),
    scholarTracks: Object.fromEntries(Object.entries(s.tracks || {}).map(([t, e]) => [t, (e || {}).xp || 0])),
    scholarInvCount: (s.inventory || []).length,
    promises, favorLedger, seeds,
    camp: !!Game.state.camp,
    joinedVillage: s.joinedVillage || null,
    pendingEncounter: !!Game.pendingEncounter, pendingMonsterId: Game.pendingMonsterId || null,
    feastDraw: !!s.feastDraw, rageActive: !!s.rageActive, feastBuff: !!s.feastBuff,
    bloodPriceWound: s.bloodPriceWound || 0,
    doorFlee,
    npcSets,
    pendingBurials: (v.pendingBurials || []).length,
  };
}

// ---- r34: post-death continuity audit ----
function auditPost(Game, pre, oldId, newId, oldFirst, label, E) {
  const v = Game.state.village || {}, s = Game.state.scholar || {};
  const findings = [];
  const ok = (id, good, detail) => { findings.push({ id, good, detail: detail || '' }); if (!good) E(`  [LEDGER-FAIL] ${id}: ${detail}`); };
  // M2: every pre-death open promise must be released, none live-orphaned
  for (const [vid, p] of Object.entries(pre.promises)) {
    const now = (v.promises || {})[vid];
    const released = now && (now.kept === 'released' || now.inherited);
    ok(`promise-released:${firstName(rawName(Game, vid))}`, !!released,
      released ? `kept=${now.kept} inherited=${!!now.inherited}` : `still ${now ? 'open kept=' + now.kept : 'MISSING'} (was ${p.kind})`);
  }
  // no promise/favor/seed may point at the dead bearer as a live obligation
  for (const [vid, p] of Object.entries(v.promises || {})) {
    if (p && !p.kept && p.kept !== 'released') {
      ok('promise-no-live-orphan', false, `promise to ${firstName(rawName(Game, vid))} open post-death (kind=${p.kind || '?'})`);
    }
  }
  for (const [vid, f] of Object.entries(v.favorLedger || {})) {
    if (f && f.state === 'promised' && f.id && pre.favorLedger[vid] === 'promised') {
      ok('favor-not-zombie', false, `favorLedger[${firstName(rawName(Game, vid))}] still 'promised' after death`);
    }
  }
  // M3: no phantom projects — the dead body's pending intents
  ok('camp-lapsed', !Game.state.camp, Game.state.camp ? 'state.camp still set post-death' : '');
  ok('join-released', !s.joinedVillage, s.joinedVillage ? `joinedVillage=${s.joinedVillage}` : '');
  ok('no-pending-encounter', !Game.pendingEncounter && !Game.pendingMonsterId,
    (Game.pendingEncounter || Game.pendingMonsterId) ? `pendingEncounter=${!!Game.pendingEncounter} monster=${Game.pendingMonsterId}` : '');
  ok('no-feast-draw', !s.feastDraw, s.feastDraw ? 'feastDraw survived the mantle' : '');
  ok('no-rage', !s.rageActive, s.rageActive ? 'rageActive survived the mantle' : '');
  ok('no-feast-buff', !s.feastBuff, s.feastBuff ? 'feastBuff survived the mantle' : '');
  ok('no-blood-price', (s.bloodPriceWound || 0) === 0, s.bloodPriceWound ? `bloodPriceWound=${s.bloodPriceWound}` : '');
  const staleDoor = (Game.state.doorFledMonsters || []).filter(m => m && m.bearerId === oldId);
  ok('door-flee-tagged', staleDoor.length === 0, staleDoor.length ? `${staleDoor.length} door-fled monsters still bear the dead id` : '');
  // M5a: the codex rule — written knowledge persists (never evaporates)
  const post = codexSnapshot(Game);
  let missing = 0, missingDetail = [];
  for (const [dom, ids] of Object.entries(pre.codex)) {
    for (const [id, lvl] of Object.entries(ids)) {
      if (!((post[dom] || {})[id] >= lvl)) { missing++; if (missingDetail.length < 6) missingDetail.push(`${dom}:${id}@${lvl}`); }
    }
  }
  ok('codex-persists', missing === 0, missing ? `${missing} entries evaporated: ${missingDetail.join(', ')}` : `all ${Object.values(pre.codex).reduce((t, d) => t + Object.keys(d).length, 0)} entries persist`);
  // M5b: you become that villager — dead bearer's abilities/XP die with them
  const deadAbils = pre.scholarAbilities || [];
  const succPre = (pre.npcSets[newId] || {}).abilities || [];
  const nowAbils = (s.abilities || []).map(a => a.id || a);
  const leaked = deadAbils.filter(id => nowAbils.includes(id) && !succPre.includes(id));
  ok('no-ability-transfer', leaked.length === 0, leaked.length ? `dead bearer's abilities on successor: ${leaked.join(',')}` : `successor holds ${nowAbils.length} (own set ${succPre.length}, dead had ${deadAbils.length})`);
  const deadXp = pre.scholarTracks || {};
  let xpLeak = [];
  for (const [t, xp] of Object.entries(deadXp)) {
    const nowXp = ((s.tracks || {})[t] || {}).xp || 0;
    const succXp = ((((pre.npcSets[newId] || {}).xpTracks || []).includes(t)) ? 1 : 0);
    if (xp > 0 && nowXp >= xp && !succXp) xpLeak.push(`${t}:${xp}->${nowXp}`);
  }
  ok('no-xp-transfer', xpLeak.length === 0, xpLeak.length ? xpLeak.join(',') : 'tracks are the successor\'s own');
  // M5c: the successor's own knowledge was taught into the Codex (mantleBecome import)
  const cx = Game.state.codex || {};
  const succSkills = (pre.npcSets[newId] || {}).skills || [];
  const untaught = succSkills.filter(sid => !((cx.skills || {})[sid] && (cx.skills[sid].level || 0) >= 1));
  ok('successor-knowledge-imported', untaught.length === 0,
    succSkills.length ? (untaught.length ? `not in codex.skills: ${untaught.join(',')}` : `${succSkills.length} skills imported`) : 'successor had no npcSkills (vacuous)');
  const mantlePlants = Object.entries(cx.plants || {}).filter(([pid, e]) => (e || {}).by === 'mantle' && (e || {}).rememberedBy === newId).length;
  try {
    rec.auditAbilities = rec.auditAbilities || {};
    rec.auditAbilities[label] = { now: nowAbils.slice(), dead: deadAbils.slice(), succPre: succPre.slice() };
  } catch (e) {}
  E(`  [ledger] ${label}: mantle-imported plants=${mantlePlants}, breadth ${pre.breadth}->${codexBreadth(Game)}`);
  return findings;
}

const rec = {
  seed: SEED, notes: [], anomalies: [],
  m1: null, m2: null, m3: null, m4: null, m5: null,
  death: null, organicDeaths: [],
  convoReads: [], convoLines: [],
  trustChain: [], census: null,
  pre: null, audits: [],
};

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-r34', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;
  if (!fs.existsSync(EVID_DIR)) fs.mkdirSync(EVID_DIR, { recursive: true });

  // Capture ALL say lines (slice post-death at scan time).
  const sayLog = [];
  const _say = Game.say;
  let capturing = true;
  Game.say = function (t) {
    const s = String(t || '');
    if (capturing) {
      sayLog.push({ day: dayOf(Game), text: s.slice(0, 600) });
      if (sayLog.length > SAY_CAP) sayLog.shift();
    }
    return _say ? _say.call(this, t) : undefined;
  };
  function watchBearer(tag, before) {
    const after = Game.villagerId;
    if (before !== after) {
      const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
      const mo = ((Game.state.village || {}).mantleOf || []);
      const lastLin = lin[lin.length - 1] || {};
      const lastMo = mo[mo.length - 1] || {};
      E(`\n!!!!! HANDOFF ${tag}: ${firstName(rawName(Game, before))} -> ${firstName(rawName(Game, after))} d${dayOf(Game)} (cause: ${lastLin.cause || '?'})`);
      rec.organicDeaths.push({
        day: dayOf(Game), from: firstName(rawName(Game, before)), to: firstName(rawName(Game, after)),
        cause: lastLin.cause || '?', newTrust: Math.round(trustOf(Game, after)),
        linOk: !!(lastLin.cause && lastLin.villagerId === before),
        moOk: lastMo.from === before && lastMo.to === after,
      });
      rec.trustChain.push({ bearer: firstName(rawName(Game, after)), trust: Math.round(trustOf(Game, after)), organic: true });
    }
    return after;
  }

  // ---- phase A: 9 competent days, plant a thread ----
  let plantVid = null;
  {
    let wb = Game.villagerId;
    for (let d = 1; d <= 9; d++) {
      if (Game.over) break;
      await runDays(Game, competent, { days: 1 });
      wb = watchBearer('phase-A', wb);
      if (Game.over) break;
    }
    if (Game.over) { rec.notes.push(`village over at d${dayOf(Game)} before the kill — seed skipped`); finish(); return; }
  }
  try {
    const v = Game.state.village || {};
    plantVid = (v.roster || []).find(id => id !== Game.villagerId);
    if (plantVid) {
      const r = driveConvo(Game, plantVid, `thread-plant d${dayOf(Game)}`, () => false, 10);
      E(`THREAD-PLANT d${dayOf(Game)} with ${firstName(rawName(Game, plantVid))} (bearer ${firstName(rawName(Game, Game.villagerId))}), want=${r.flags.want}`);
      rec.threadPlant = { vid: firstName(rawName(Game, plantVid)), want: r.flags.want };
    }
  } catch (e) { rec.notes.push('thread plant threw: ' + e.message); }

  // ---- force one promise, then snapshot the ledger, then kill ----
  const f = await forcePromise(Game, E, watchBearer);
  rec.forced = f.forced ? { ...f.forced, vid: firstName(rawName(Game, f.forced.vid)) } : null;
  for (const n of f.notes) rec.notes.push(n);
  if (Game.over) { rec.notes.push('village over before the kill — run stops'); finish(); return; }

  const oldId = Game.villagerId;
  const oldName = rawName(Game, oldId);
  const oldFirst = firstName(oldName);
  const trustBefore = trustOf(Game, oldId);
  const pre = snapPre(Game, oldId);
  rec.pre = { ...pre, npcSets: undefined, oldFirst, oldId: String(oldId).slice(0, 14) };
  rec._preFull = pre; // full snapshot kept in-process only, not in the JSON
  E(`PRE-DEATH d${pre.day}: breadth=${pre.breadth} abilities=[${pre.scholarAbilities.join(',')}] inv=${pre.scholarInvCount} openPromises=${Object.keys(pre.promises).length} camp=${pre.camp} join=${pre.joinedVillage}`);
  const handoffStart = sayLog.length;
  Game.playerDeath(KILL_CAUSE);
  const newId = Game.villagerId;
  const newName = rawName(Game, newId);
  const newFirst = firstName(newName);
  const newTrust = trustOf(Game, newId);
  const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
  const lastLin = lin[lin.length - 1] || {};
  const mo = ((Game.state.village || {}).mantleOf || []);
  const lastMo = mo[mo.length - 1] || {};
  const passed = newId !== oldId && !Game.over && !Game.villageLost;
  const deathDay = dayOf(Game);
  rec.death = {
    day: deathDay, cause: KILL_CAUSE, oldFirst, newFirst,
    trustBefore: Math.round(trustBefore), newTrust: Math.round(newTrust),
    passed, linOk: !!(lastLin.cause && lastLin.villagerId === oldId),
    moOk: lastMo.from === oldId && lastMo.to === newId,
    breadthBefore: pre.breadth, forced: rec.forced,
  };
  rec.trustChain.push({ bearer: newFirst, trust: Math.round(newTrust) });
  E(`\nDEATH d${deathDay} (${KILL_CAUSE}): ${oldFirst} -> ${newFirst} | passed=${passed} lin=${rec.death.linOk} mantleOf=${rec.death.moOk} trust ${Math.round(trustBefore)} -> ${Math.round(newTrust)} breadth=${pre.breadth}`);
  if (!passed) { rec.notes.push(`mantle FAILED (over=${Game.over}, villageLost=${Game.villageLost})`); rec.m1 = false; finish(); return; }

  // ---- d+1 audit: the immediate ledger ----
  E('AUDIT d+1:');
  rec.audits.push({ label: 'd+1', day: dayOf(Game), findings: auditPost(Game, pre, oldId, newId, oldFirst, 'd+1', E) });

  // ---- the successor's life: real competent play, 21 days ----
  let wb = newId;
  for (let d = 1; d <= POST_DAYS; d++) {
    if (Game.over) break;
    await runDays(Game, competent, { days: 1 });
    wb = watchBearer(`post-d+${d}`, wb);
    if (Game.over) break;
    const curDay = dayOf(Game);
    const daysSince = curDay - deathDay;
    if ([7, 14, 21].includes(daysSince)) {
      if (daysSince === 7) {
        E('AUDIT d+7:');
        rec.audits.push({ label: 'd+7', day: curDay, findings: auditPost(Game, pre, oldId, newId, oldFirst, 'd+7', E) });
      }
      const v = Game.state.village || {};
      const self = Game.villagerId;
      const cands = [];
      try {
        if (plantVid && (v.roster || []).includes(plantVid) && plantVid !== self) cands.push(plantVid);
        const byTrust = (v.roster || []).filter(id => id !== self && id !== plantVid)
          .sort((a, b) => trustOf(Game, b) - trustOf(Game, a));
        if (byTrust[0] && trustOf(Game, byTrust[0]) >= 20) cands.push(byTrust[0]);
      } catch (e) {}
      for (const vid of cands.slice(0, 2)) {
        try {
          const r = driveConvo(Game, vid, `post-d+${daysSince} ledger-check d${curDay}`, () => false, 12);
          const fn = path.join(EVID_DIR, `journey-succession-r34-transcript-${SEED}-dplus${daysSince}-${firstName(rawName(Game, vid))}.txt`);
          fs.writeFileSync(fn, r.text);
          rec.convoReads.push({ day: curDay, dplus: daysSince, vid: firstName(rawName(Game, vid)), refused: r.refused, want: r.flags.want });
          if (r.fullText) for (const ln of r.fullText.split('\n')) {
            if (/^NPC:/.test(ln)) rec.convoLines.push({ day: curDay, text: ln.replace(/^NPC:\s*/, '').slice(0, 600) });
          }
          E(`  CONVO d+${daysSince} with ${firstName(rawName(Game, vid))} (refused=${r.refused}, want=${r.flags.want})`);
        } catch (e) { rec.anomalies.push(`ledger-check convo d+${daysSince} threw: ` + e.message); }
      }
    }
  }
  const endDay = dayOf(Game);
  E(`POST-DEATH: ran to d${endDay} (${endDay - deathDay} days after death); organic handoffs since: ${rec.organicDeaths.length}`);
  if (!Game.over) {
    E('AUDIT end:');
    rec.audits.push({ label: 'end', day: endDay, findings: auditPost(Game, pre, oldId, newId, oldFirst, 'end', E) });
  }

  // ---- census ----
  try {
    const alive = livingRoster(Game).length;
    const fallen = ((Game.state.village || {}).fallen || []).length;
    let stage = -1;
    try { stage = (typeof Game.integrationStage === 'function') ? Game.integrationStage() : -1; } catch (e) {}
    rec.census = { alive, fallen, integrationStage: stage, breadth: codexBreadth(Game), breadthBefore: pre.breadth };
    E(`CENSUS d${endDay}: alive=${alive} fallen=${fallen} breadth ${pre.breadth}->${rec.census.breadth} over=${!!Game.over}`);
  } catch (e) { rec.notes.push('census threw: ' + e.message); }

  finish();

  function finish() {
    Game.say = _say;
    capturing = false;
    // ---- identity tripwire scan: post-death say log + convo lines ----
    const post = sayLog.slice(handoffStart);
    const src = post.concat(rec.convoLines.filter(l => l.day >= (rec.death ? rec.death.day : 0)).map(l => ({ day: l.day, text: l.text })));
    const deadFirst = rec.death ? rec.death.oldFirst : null;
    const trips = [];
    if (deadFirst) {
      const addrRe = new RegExp(`\\b${deadFirst}\\b.*(you|your)|you.*\\b${deadFirst}\\b`, 'i');
      for (const h of src) {
        if (addrRe.test(h.text) && !/is dead|died|'s gone|was |buried|grave|mourn|miss |take .* from|not the office, the person|keep expecting/i.test(h.text)) {
          trips.push({ day: h.day, text: h.text.slice(0, 200) });
        }
      }
    }
    rec.identityTrips = trips.slice(0, 10);
    E(`\nIDENTITY TRIPS: ${trips.length} (manual sense-read is the verdict)`);
    // ---- metric verdicts ----
    const per = (fn) => fn();
    rec.m1 = !!(rec.death && rec.death.passed && rec.death.linOk && rec.death.moOk);
    const auditFlat = (label) => (rec.audits.find(a => a.label === label) || { findings: [] }).findings;
    const m2set = auditFlat('d+7').length ? 'd+7' : (auditFlat('d+1').length ? 'd+1' : null);
    if (m2set) {
      const fs7 = auditFlat(m2set);
      const bad = fs7.filter(x => !x.good && (/promise|favor|seed/.test(x.id)));
      rec.m2 = bad.length === 0 && Object.keys(pre.promises).length >= 0;
      rec.m2detail = `label=${m2set} openPromisesPre=${Object.keys(pre.promises).length} bad=${bad.length}`;
    } else { rec.m2 = null; rec.m2detail = 'no audit (run stopped early)'; }
    const m3set = auditFlat('end').length ? 'end' : m2set;
    if (m3set) {
      const fs3 = auditFlat(m3set);
      const bad = fs3.filter(x => !x.good && (/camp|join|pending|feast|rage|blood|door/.test(x.id)));
      rec.m3 = bad.length === 0;
      rec.m3detail = `label=${m3set} bad=${bad.map(b => b.id).join(',') || 'none'}`;
    } else rec.m3 = null;
    rec.m4 = 'manual'; // SENSE-TESTING LAW: the verdict is the full read, not the tripwire
    const m5set = auditFlat('end').length ? 'end' : m2set;
    if (m5set) {
      const fs5 = auditFlat(m5set);
      const bad = fs5.filter(x => !x.good && (/codex|ability|xp|knowledge/.test(x.id)));
      rec.m5 = bad.length === 0;
      rec.m5detail = `label=${m5set} bad=${bad.map(b => b.id).join(',') || 'none'}`;
    // r34 instrument fix: ability-id identity is not transfer. Track pools are
    // shared, so the successor can independently EARN the dead bearer's
    // ability id post-death (9904: Terry earned Lucky Rock d23 via the real
    // System grant, 10 days after the mantle). Attribute via grant narration:
    // a leaked id with a post-death "Ability gained" line is an independent
    // earn, not a transfer. FAIL only if it arrived with the mantle
    // (present at d+1) or appears with no grant line.
    try {
      const ab = rec.auditAbilities || {};
      const end = ab['end'] || ab['d+7'] || ab['d+1'];
      const d1 = ab['d+1'];
      if (end && rec.death) {
        const leaked = (end.dead || []).filter(id => (end.now || []).includes(id) && !(end.succPre || []).includes(id));
        const withMantle = d1 ? leaked.filter(id => (d1.now || []).includes(id)) : leaked.slice();
        const unexplained = [];
        for (const id of leaked) {
          if (withMantle.includes(id)) { unexplained.push(id + '@mantle'); continue; }
          let dispName = id;
          try { dispName = (Game.abilityDef(id) || {}).name || id; } catch (e) {}
          const esc = String(dispName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const gre = new RegExp('Ability gained: ' + esc);
          const hit = sayLog.slice(handoffStart).find(h => h.day > rec.death.day && gre.test(h.text));
          if (!hit) unexplained.push(id + '@nograntline');
          else E('  [m5-fix] ' + id + ' independently earned post-death (grant line d' + hit.day + ') -- not a transfer');
        }
        if (leaked.length && unexplained.length === 0) {
          rec.m5 = true;
          rec.m5detail += '; transfer-check revised: ' + leaked.join(',') + ' independently earned post-death (grant-narrated), not transferred';
          E('  [m5-fix] no-ability-transfer revised to GO -- all leaked ids grant-narrated post-death');
        } else if (unexplained.length) {
          rec.m5 = false;
          rec.m5detail += '; UNEXPLAINED: ' + unexplained.join(',');
        }
      }
    } catch (e) { rec.notes.push('m5 revision threw: ' + e.message); }
    } else rec.m5 = null;
    E(`\nMETRICS: m1=${rec.m1} m2=${rec.m2}(${rec.m2detail}) m3=${rec.m3}(${rec.m3detail}) m4=${rec.m4} m5=${rec.m5}(${rec.m5detail})`);
    E(`organic handoffs: ${rec.organicDeaths.length}; anomalies: ${rec.anomalies.length}`);
    for (const a of rec.anomalies.slice(0, 8)) E('  ANOMALY: ' + a);
    delete rec._preFull;
    if (process.env.DUMP_SAY) {
      try {
        const fn = process.env.DUMP_SAY;
        fs.writeFileSync(fn, sayLog.map(h => `d${h.day}: ${h.text}`).join('\n') + '\n');
        E(`say dump -> ${fn} (${sayLog.length} lines)`);
      } catch (e) { E('say dump failed: ' + e.message); }
    }
    console.log(JSON.stringify(rec, null, 1));
  }
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
