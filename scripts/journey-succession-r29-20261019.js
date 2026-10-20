#!/usr/bin/env node
// journey-succession-r29-20261019.js — SUCCESSION LEG r29: "THE CHAIN"
// Journey leg 7: death of the player character, the mantle passing, the new
// bearer's life. LANE B. This run is r29 (r28 landed 2026-10-19: the
// settle-on-speak fix, 5/5 mantles, 3/4 closes).
//
// LEG QUESTION (r29 pre-registered): does the machinery hold across a THREE-
// DEATH CHAIN in one run? Every proof so far does ONE death per run (kill
// d16-17, successor plays out). The chain questions have never been proven
// end-to-end:
//   - mantleOf chain reads honestly (from->to names in order, no dupes)
//   - lineage entries stack in order with the right names/causes/days
//   - the "you're not X" beat names the IMMEDIATELY preceding bearer on
//     deaths 2 and 3 (not a corpse, not bearer 1)
//   - trust inheritance doesn't collapse across the chain (office*0.4 floor
//     10 — the 2026-10-13 compound fix — verified on a REAL chain)
//   - stamp honesty: threads/seeds/favors stamped with bearer 1's name
//     still attribute to bearer 1 after 3 deaths (inheritedName), never to
//     the current bearer or the wrong dead one
//   - promise release/moot across the chain (r25 open-book + r27 promisee-
//     moot, now chained)
//
// PROFILE: competent policy throughout; 3 scripted kills via the REAL
// playerDeath (same precedent as r27/r28) at ~d15/d29/d43 ('a hushwolf',
// 'the fever', 'starvation'); organic mid-phase deaths are EXPECTED on this
// schedule and are folded into the chain by the bearer-watcher (r29
// lesson: the first pilot's bookkeeping missed a real combat death because
// it only sampled the chain around its own kills). Bearer N plays to the
// next kill. Death-aware: dead/scattered village stops the run.
//
// FORCING (documented): one forced favor+promise before each kill, through
// the engine's own favor machinery (convoFindFavorNeed -> convoBuildFavor ->
// convoStoreFavor -> convoFavorCommit — the exact functions the ask_favor
// opener and dlg:commit call). The forcing is in the DECISION (which NPC);
// the mechanism is the real one.
//   death 1: promisee = HIGHEST-trust villager (directly-keepable kind,
//     urgency>=4) -> X should become heir; the r27 promisee-mooot path gets
//     re-verified on a chain start. If X is NOT the heir, the favor follows
//     the release->asked path instead (documented per seed, not a failure).
//   deaths 2,3: promisee = LOWEST-trust (>=30) villager -> stays a villager;
//     release->asked->re-ask path (the r25 machinery), chained.
// Kill fires the same game-day as the commit (promise guaranteed open).
//
// BINDING METRICS (MEASUREMENT.md §14):
//   M1: all 3 mantles pass on >=3/4 seeds (bearer changes, game continues,
//       village alive, lineage entry per death). Kill rule: mantle fails on
//       >=2/4 seeds -> SUBSTRATE-MISSING.
//   M2: mantleOf + lineage chain honest on every completed death (names and
//       causes in order; no misattribution; no dupe links).
//   M3: trust inheritance floor holds: EVERY successor's trust >= 10; the
//       decay across the chain is recorded (no compounding to zero).
//   M4: >=2 death-2/death-3 handoff transcripts sense-read -> names right,
//       no corpse speaks, the successor's identity is announced clearly.
//
// INTERESTING-FINDING CRITERIA:
//   (a) chain holds cleanly -> machinery proven on chains; note stands.
//   (b) break at a named link -> REAL BUG.
//   (c) stamp misattribution across the chain -> REAL BUG.
//   (d) trust floor violated -> REAL BUG (compounding regression).
//
// SEEDS: 9401-9404 (pilot: all four; expand only if the leg's question shows
// something interesting — the question IS the chain, so 4 seeds is the run).
// ORCHESTRATE=1 always (documented).
// HORIZON: kills d10/d20/d30; end d40.
//
// Usage: SEED=9401 node scripts/journey-succession-r29-20261019.js
// Output: JSON record to stdout; narrative + census + transcripts to stderr.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '9401', 10);
const KILL_DAYS = [10, 20, 30];
const KILL_CAUSES = ['a hushwolf', 'the fever', 'starvation'];
const END_DAY = 40;
const EVID_DIR = path.join(ROOT, 'evidence', '2026-10-19');
const DIRECT_KEEP = new Set(['food_share', 'forage_help', 'heal_help', 'sick_help', 'stay_close']);
const KIND_PREF = ['heal_help', 'sick_help', 'food_share', 'forage_help', 'stay_close'];

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) return ch.name; } catch (e) {}
  return String(vid).slice(0, 12);
}
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function trustOf(Game, vid) { try { return ((Game.state.village || {}).trust || {})[vid] || 0; } catch (e) { return 0; } }
function openPromise(Game, vid) {
  try { const p = ((Game.state.village || {}).promises || {})[vid]; return (p && !p.kept) ? p : null; } catch (e) { return null; }
}
function favorOf(Game, vid) {
  try { const f = ((Game.state.village || {}).favorLedger || {})[vid]; return f || null; } catch (e) {}
  return null;
}
function needKindOf(Game, vid) {
  try { const n = Game.convoFindFavorNeed && Game.convoFindFavorNeed(vid); return n && n.kind; } catch (e) { return null; }
}

// Honest convo driver (r26/r28, unchanged): used ONLY to plant threads and
// to sense-read post-death continuity. commitRule is always false here —
// no promises are made through the driver this run; forcing owns that.
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

// Force ONE favor+promise through the real favor machinery. preferHighTrust:
// death-1 (promisee likely heir -> moot path) vs deaths 2/3 (promisee stays
// villager -> release->asked path). Returns {vid, kind, day} or null.
// watch: (tag, beforeId) -> afterId, called around every runDays.
async function forcePromise(Game, E, preferHighTrust, killCause, watch) {
  const rec = { forced: null, notes: [] };
  for (let f = 0; f < 4 && !rec.forced && !Game.over; f++) {
    let wb = Game.villagerId;
    await runDays(Game, competent, { days: 1 });
    if (watch) wb = watch(`force-${killCause}-day`, wb);
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
      (preferHighTrust ? trustOf(Game, b.vid) - trustOf(Game, a.vid) : trustOf(Game, a.vid) - trustOf(Game, b.vid)));
    E(`FORCE(${killCause}) d${dayOf(Game)}: ${cands.length} setup-eligible${cands.length ? ' (pick: ' + firstName(rawName(Game, cands[0].vid)) + ':' + cands[0].kind + ' trust ' + trustOf(Game, cands[0].vid) + ')' : ''}`);
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

// Scan every stamped record after the chain: every inh/inhFrom stamp must
// name a DEAD bearer (one of the three), never the current bearer. Returns
// {total, ok, bad[]}.
function stampScan(Game, deadNames, currentName) {
  const v = Game.state.village || {};
  const deadSet = new Set(deadNames.map(d => firstName(d)));
  let total = 0, ok = 0;
  const bad = [];
  function check(stamp, where) {
    if (!stamp) return;
    total++;
    const fn = firstName(String(stamp));
    if (deadSet.has(fn) || fn === currentName) {
      if (fn === currentName) { bad.push(`${where}: stamped with CURRENT bearer ${fn}`); }
      else ok++;
    } else {
      bad.push(`${where}: stamped with unknown name ${fn}`);
    }
  }
  try {
    for (const tid of Object.keys(v.topicLog || {})) {
      const L = v.topicLog[tid] || {};
      for (const o of (L.open || []).concat(L.lapsed || [])) { if (o && o.inh) check(o.inh, `topicLog[${tid}]`); }
    }
    for (const sid of Object.keys(v.convoSeeds || {})) {
      const sd = v.convoSeeds[sid];
      if (sd && sd.inh) check(sd.inh, `convoSeeds[${sid.slice(0, 8)}]`);
    }
    for (const fid of Object.keys(v.favorLedger || {})) {
      const fb = v.favorLedger[fid];
      if (fb && fb.inhFrom) check(fb.inhFrom, `favorLedger[${firstName(rawName(Game, fid))}:${fb.kind}]`);
    }
    for (const mid of Object.keys(v.memory || {})) {
      for (const mm of v.memory[mid] || []) { if (mm && mm.inh) check(mm.inh, `memory[${firstName(rawName(Game, mid))}]`); }
    }
  } catch (e) { bad.push('stampScan threw: ' + e.message); }
  return { total, ok, bad };
}

const rec = {
  seed: SEED, notes: [], anomalies: [],
  deaths: [], organicDeaths: [], m1: null, m2: null, m3: null, m4: null,
  mantleChain: [], lineageChain: [], trustChain: [], stampScan: null,
};

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-r29', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;
  if (!fs.existsSync(EVID_DIR)) fs.mkdirSync(EVID_DIR, { recursive: true });

  const _say = Game.say;
  let capturing = false;
  const handoffSay = [];
  // SWAP-WATCH (r29): ring buffer of recent say lines + bearer watcher.
  // The 9401 pilot showed a silent Ray->Nia swap between death 1 and death 2
  // (no lineage entry, no mantleOf link). Catch it in the act this time.
  const sayRing = [];
  Game.say = function (t) {
    const s = String(t || '');
    sayRing.push({ day: dayOf(Game), text: s.slice(0, 300) });
    if (sayRing.length > 60) sayRing.shift();
    if (capturing) handoffSay.push({ day: dayOf(Game), text: s.slice(0, 600) });
    return _say ? _say.call(this, t) : undefined;
  };
  function watchBearer(tag, before) {
    const after = Game.villagerId;
    if (before !== after) {
      const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
      const mo = ((Game.state.village || {}).mantleOf || []);
      const lastLin = lin[lin.length - 1] || {};
      const lastMo = mo[mo.length - 1] || {};
      const fromFirst = firstName(rawName(Game, before));
      const toFirst = firstName(rawName(Game, after));
      E(`\n!!!!! ORGANIC HANDOFF ${tag}: ${fromFirst} -> ${toFirst} d${dayOf(Game)} (cause: ${lastLin.cause || '?'}) lineage=${lin.length} mantleOf=${mo.length}`);
      E(`  last lineage: ${JSON.stringify({ name: lastLin.name, cause: lastLin.cause, day: lastLin.day })}`);
      E(`  last mantleOf: ${JSON.stringify({ from: lastMo.fromName, to: lastMo.toName, day: lastMo.day })}`);
      // Fold the organic handoff into the chain record (r29 lesson: the
      // first pilot missed a real combat death because it only sampled the
      // chain around its own kills).
      rec.organicDeaths.push({
        day: dayOf(Game), from: fromFirst, to: toFirst,
        cause: lastLin.cause || '?', newTrust: Math.round(trustOf(Game, after)),
        linOk: !!(lastLin.cause && lastLin.villagerId === before),
        moOk: lastMo.from === before && lastMo.to === after,
      });
      bearerNames.push(toFirst);
      rec.mantleChain.push({ from: fromFirst, to: toFirst, organic: true });
      rec.lineageChain.push({ name: lastLin.name, cause: lastLin.cause, day: lastLin.day, organic: true });
      rec.trustChain.push({ bearer: toFirst, trust: Math.round(trustOf(Game, after)), organic: true });
      rec.handoffOrganic = rec.handoffOrganic || [];
      rec.handoffOrganic.push(sayRing.slice(-25).map(h => `d${h.day}: ${h.text}`).join('\n'));
    }
    return after;
  }

  const bearerNames = [firstName(rawName(Game, Game.villagerId))];
  let chainBroke = false;

  // ---- phase A: 9 competent days (run-1 schedule), plant one thread ----
  {
    let wb = Game.villagerId;
    for (let d = 1; d <= 9; d++) {
      if (Game.over) break;
      await runDays(Game, competent, { days: 1 });
      wb = watchBearer('phase-A', wb);
      if (Game.over) break;
    }
    if (Game.over) { rec.notes.push(`village over at d${dayOf(Game)} before death 1 — seed skipped`); console.log(JSON.stringify(rec)); return; }
  }
  // plant a thread with a live villager (commitRule false — no promise)
  try {
    const v = Game.state.village || {};
    const tgt = (v.roster || []).find(id => id !== Game.villagerId);
    if (tgt) {
      const r = driveConvo(Game, tgt, `thread-plant d${dayOf(Game)}`, () => false, 10);
      rec.threadPlant = { vid: firstName(rawName(Game, tgt)), want: r.flags.want, bearer: firstName(rawName(Game, Game.villagerId)) };
      E(`THREAD-PLANT d${dayOf(Game)} with ${rec.threadPlant.vid} (bearer ${rec.threadPlant.bearer}), want=${rec.threadPlant.want}`);
    }
  } catch (e) { rec.notes.push('thread plant threw: ' + e.message); }

  // ---- the chain: force (up to 4d), kill on schedule, verify x3 ----
  for (let di = 0; di < 3; di++) {
    const killCause = KILL_CAUSES[di];
    const preferHigh = di === 0; // death 1: promisee likely heir (moot path)
    const f = await forcePromise(Game, E, preferHigh, killCause, watchBearer);
    rec[`force${di + 1}`] = f.forced ? { ...f.forced, vid: firstName(rawName(Game, f.forced.vid)) } : null;
    for (const n of f.notes) rec.notes.push(`death${di + 1}: ${n}`);
    if (Game.over) { rec.notes.push(`village over before death ${di + 1} — chain stops`); chainBroke = true; break; }

    const oldId = Game.villagerId;
    const oldName = rawName(Game, oldId);
    const oldFirst = firstName(oldName);
    const trustBefore = trustOf(Game, oldId);
    handoffSay.length = 0; capturing = true;
    Game.playerDeath(killCause);
    capturing = false;
    const newId = Game.villagerId;
    const newName = rawName(Game, newId);
    const newFirst = firstName(newName);
    bearerNames.push(newFirst);

    const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
    const lastLin = lin[lin.length - 1] || {};
    const linOk = !!(lastLin.cause && lastLin.villagerId === oldId);
    const mo = ((Game.state.village || {}).mantleOf || []);
    const lastMo = mo[mo.length - 1] || {};
    const moOk = lastMo.from === oldId && lastMo.to === newId;
    const passed = newId !== oldId && !Game.over && !Game.villageLost;
    const newTrust = trustOf(Game, newId);

    // promise/favor disposition for the forced promise (if any)
    let favorDisposition = 'no-forced-promise';
    if (f.forced) {
      const fv = favorOf(Game, f.forced.vid);
      const pr = ((Game.state.village || {}).promises || {})[f.forced.vid];
      const promiseeIsHeir = f.forced.vid === newId;
      favorDisposition = {
        promiseeIsHeir,
        favorState: fv && fv.state,
        promiseKept: pr && pr.kept,
        expected: promiseeIsHeir ? 'moot' : "released->asked",
        honest: promiseeIsHeir ? (fv && fv.state === 'moot') : (pr && pr.kept === 'released' && fv && fv.state === 'asked'),
      };
    }

    // handoff beats: "you're not X" must name the IMMEDIATELY preceding bearer
    const handoffText = handoffSay.map(h => h.text).join('\n');
    const youreNot = handoffText.match(/"You're not ([^.]+)\."/);
    const orientation = handoffSay.some(h => /You wake up somebody else/i.test(h.text));
    const orientNamesNew = handoffText.includes(newFirst);
    const openBook = handoffSay.some(h => /book stays open on the table/i.test(h.text));
    const docketLine = handoffSay.some(h => /sentence doesn't cross the grave/i.test(h.text));

    const dh = {
      n: di + 1, day: dayOf(Game), cause: killCause,
      oldFirst, newFirst, trustBefore: Math.round(trustBefore), newTrust: Math.round(newTrust),
      passed, linOk, moOk, favorDisposition,
      youreNotLine: youreNot ? youreNot[0].slice(0, 80) : null,
      youreNotNames: youreNot ? youreNot[1].split(' ')[0] : null,
      youreNotHonest: youreNot ? (youreNot[1].split(' ')[0] === oldFirst) : null, // null = no close-confidant line this death (not a failure)
      orientationFired: orientation, orientationNamesNew: orientNamesNew,
      openBookFired: openBook, docketLineFired: docketLine,
      living: ((Game.state.village || {}).roster || []).length,
      kcal: (Game.state.scholar || {}).kcal,
      health: (Game.state.scholar || {}).health,
    };
    rec.deaths.push(dh);
    rec.mantleChain.push({ from: oldFirst, to: newFirst });
    rec.lineageChain.push({ name: lastLin.name, cause: lastLin.cause, day: lastLin.day });
    rec.trustChain.push({ bearer: newFirst, trust: Math.round(newTrust) });
    E(`DEATH ${di + 1} d${dh.day} (${killCause}): ${oldFirst} -> ${newFirst} | passed=${passed} lin=${linOk} mantleOf=${moOk} trust ${Math.round(trustBefore)} -> ${Math.round(newTrust)}`);
    E(`  youreNot: ${dh.youreNotLine ? dh.youreNotLine.slice(0, 60) + ' honest=' + dh.youreNotHonest : '(no close-confidant line)'} | orientation=${orientation}/${orientNamesNew} | openBook=${openBook}`);
    E(`  favor: ${JSON.stringify(favorDisposition)}`);
    rec[`handoff${di + 1}`] = handoffSay.map(h => `d${h.day}: ${h.text}`).join('\n');

    if (!passed) { rec.notes.push(`death ${di + 1}: mantle FAILED (over=${Game.over}, villageLost=${Game.villageLost}) — chain stops`); chainBroke = true; break; }
    if (Game.over || Game.villageLost) { rec.notes.push(`death ${di + 1}: village lost/over after the handoff — chain stops`); chainBroke = true; break; }

    // successor plays between deaths: 10 days flat (run-1 schedule — the
    // longer legs give organic deaths room, which stress the chain)
    {
      let wb = Game.villagerId;
      for (let d = 0; d < 10; d++) {
        if (Game.over) break;
        await runDays(Game, competent, { days: 1 });
        wb = watchBearer(`phase-${'BCD'[di]}`, wb);
        if (Game.over) break;
      }
    }
    if (di === 1 && !Game.over) {
      try {
        const v = Game.state.village || {};
        const tgt = (v.roster || []).find(id => id !== Game.villagerId);
        if (tgt) {
          const r = driveConvo(Game, tgt, `thread-plant-2 d${dayOf(Game)}`, () => false, 10);
          rec.threadPlant2 = { vid: firstName(rawName(Game, tgt)), want: r.flags.want, bearer: firstName(rawName(Game, Game.villagerId)) };
          E(`THREAD-PLANT-2 d${dayOf(Game)} with ${rec.threadPlant2.vid} (bearer ${rec.threadPlant2.bearer})`);
        }
      } catch (e) { rec.notes.push('thread plant 2 threw: ' + e.message); }
    }
  }

  // ---- chain verification (r29-fixed: read the GAME's full arrays, not the
  // script's incremental sampling — organic mid-phase deaths are real links) ----
  const completedDeaths = rec.deaths.length;
  const gameLin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
  const gameMo = ((Game.state.village || {}).mantleOf || []);
  rec.gameLineage = gameLin.map(l => ({ name: l.name, cause: l.cause, day: l.day }));
  rec.gameMantleOf = gameMo.map(m => ({ from: m.fromName || m.from, to: m.toName || m.to, day: m.day }));
  E(`CHAIN: ${rec.deaths.length} scripted kills + ${rec.organicDeaths.length} organic handoffs; game arrays: lineage=${gameLin.length} mantleOf=${gameMo.length}`);
  // M2: every lineage entry matches a mantleOf link (from), links connect
  // head-to-tail, days ascend, every entry has a cause.
  let m2detail = [];
  const m2links = gameLin.length === gameMo.length && gameLin.length > 0;
  const m2match = m2links && gameLin.every((l, i) => gameMo[i] && (gameMo[i].from === l.villagerId || firstName(gameMo[i].fromName || '') === firstName(l.name || '')));
  const m2connect = gameMo.every((m, i) => i === 0 || gameMo[i - 1].to === m.from);
  const m2days = gameLin.every((l, i) => i === 0 || (l.day || 0) >= (gameLin[i - 1].day || 0));
  const m2causes = gameLin.every(l => !!(l.cause));
  const m2lastTo = gameMo.length ? gameMo[gameMo.length - 1].to : null;
  const m2current = m2lastTo === Game.villagerId;
  m2detail = { m2links, m2match, m2connect, m2days, m2causes, m2current };
  E(`M2: ${JSON.stringify(m2detail)} lineage=${JSON.stringify(rec.gameLineage)}`);
  // M3: trust floor — every recorded successor (scripted + organic) >= 10
  const trustFloor = rec.trustChain.every(t => t.trust >= 10);
  E(`M3: trust floor>=10: ${trustFloor} chain=${JSON.stringify(rec.trustChain)}`);
  // stamp scan: dead bearers = bearerNames minus the current one
  if (!chainBroke && completedDeaths === 3) {
    const current = bearerNames[bearerNames.length - 1];
    const dead = bearerNames.slice(0, -1);
    rec.stampScan = stampScan(Game, dead, current);
    E(`STAMPS: ${rec.stampScan.ok}/${rec.stampScan.total} ok, ${rec.stampScan.bad.length} bad`);
    for (const b of rec.stampScan.bad.slice(0, 10)) E(`  BAD: ${b}`);
  }
  // no zombie promises from dead makers
  try {
    const deadIds = new Set();
    rec.zombies = 0;
    for (const [, pp] of Object.entries((Game.state.village || {}).promises || {})) {
      if (pp && !pp.kept) rec.zombies++;
    }
  } catch (e) { rec.zombies = -1; }
  E(`OPEN PROMISES AT END: ${rec.zombies}`);

  // M1/M2/M3 roll-up
  rec.m1 = completedDeaths === 3 && rec.deaths.every(d => d.passed && d.linOk);
  rec.m2 = m2links && m2match && m2connect && m2days && m2causes && m2current;
  rec.m3 = rec.trustChain.length > 0 && trustFloor;

  // census
  try {
    const vv = Game.state.village || {};
    rec.census = {
      day: dayOf(Game), living: (vv.roster || []).length,
      fallen: (vv.fallen || []).length,
      promisesOpen: Object.values(vv.promises || {}).filter(p => p && !p.kept).length,
      promisesReleased: Object.values(vv.promises || {}).filter(p => p && p.kept === 'released').length,
      favorStates: Object.values(vv.favorLedger || {}).map(f => f && f.state).filter(Boolean).reduce((a, s) => { a[s] = (a[s] || 0) + 1; return a; }, {}),
      codexBreadth: (() => { try { return Game.codexBreadth(); } catch (e) { return -1; } })(),
    };
  } catch (e) {}

  Game.say = _say;
  try {
    rec.tele = {
      'deaths.bearer': completedDeaths + rec.organicDeaths.length,
      'deaths.organic': rec.organicDeaths.length,
      'census.alive': ((Game.state.village || {}).roster || []).length,
      'census.fallen': ((Game.state.village || {}).fallen || []).length,
      'census.integrationStage': (() => { try { return Game.integrationStage(); } catch (e) { return 0; } })(),
      'week2.deadBearerMentions': 0,
      'chain.mantlesPassed': rec.deaths.filter(d => d.passed).length,
      'chain.trustFloor': trustFloor ? 1 : 0,
    };
    E(`TELE: ${JSON.stringify(rec.tele)}`);
    fs.writeFileSync(path.join(EVID_DIR, `journey-succession-r29-tele-${SEED}.json`), JSON.stringify(rec.tele, null, 1));
  } catch (e) { rec.anomalies.push('tele snapshot threw: ' + e.message); }
  console.log(JSON.stringify(rec));
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
