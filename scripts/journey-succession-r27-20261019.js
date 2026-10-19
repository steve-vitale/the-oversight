#!/usr/bin/env node
// journey-succession-r27-20261019.js — SUCCESSION LEG r27: "PROVE THE CLOSE"
// Journey leg 7: death of the player character, the mantle passing.
//
// LEG QUESTION (r26 metric review, explicit): orchestrate the FULFILL side.
// r26 forced the commit and proved the open-book beat + the honest
// poverty-break, but the fulfilled->thanked close across the grave remains
// unproven. r27 forces the commit (as r26 did) AND arranges the successor's
// means so the fulfill can actually succeed — the means gate (a competent
// player checks the pack before promising) plus one honest acquisition day
// for food_share when the pack is empty. Then the full sequence:
// re-ask -> commit -> fulfill via real action -> repay convo -> favor
// 'thanked', promise kept=true, trust moved, no zombies. Never proven
// end-to-end before.
//
// BINDING METRICS (MEASUREMENT.md §14):
//   M1: >=3/5 mantles pass cleanly (new bearer, lineage entry, game continues).
//   M2: >=2/5 seeds reach the fulfill attempt (re-ask heard in-fiction +
//       trust>=30 + keep preconditions true + committed). Fewer -> vacuous ->
//       means-reachability finding, documented, never re-scored.
//   M3: on attempted seeds, >=1 FULL LOOP CLOSES (fulfill via real action ->
//       repay convo fires gratitude -> favor 'thanked', promise kept=true,
//       trust increased, no zombie promises from the dead maker). Failure at
//       any named link -> REAL BUG.
//   M4: >=2 repay/gratitude transcripts meet the quality bar (sense-read).
// KILL RULE: mantle fails on >=2/5 seeds -> SUBSTRATE-MISSING.
//
// INTERESTING-FINDING CRITERIA:
//   (a) >=1 full close -> the loop is PROVEN end-to-end for the first time.
//   (b) close fails at a named link -> REAL BUG with the link named.
//   (c) fulfill succeeds but the repay convo never fires gratitude -> content blank.
//   (d) gratitude names the predecessor wrongly -> fiction bug.
//   (e) <2 seeds reach attempt -> means too rare under honest play ->
//       reachability blank on the close (finding, not NO-GO).
//
// SEEDS: 8201-8205 (fresh; r26 used 8101-8105).
// ORCHESTRATE=1 always (documented): force one commit on d15 via the real
// convo path, preferring kinds with direct keep paths (food_share,
// heal_help, sick_help). The forcing is in the DECISION only — the mechanism
// stays honest. Post-death honesty: two-pass listening (commit only having
// heard the debt in-fiction: inherited line or the open book), the means gate
// (commit only when the keep preconditions are true right now, or acquirable
// in one honest forage day for food_share), trust >= 30.
// HORIZON: kill d16 via real playerDeath; successor plays to d30.
// Death-aware: village dead/scattered -> stop.
//
// Usage: SEED=8201 node scripts/journey-succession-r27-20261019.js
// Output: JSON record to stdout; narrative + census + transcripts to stderr.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '8201', 10);
const KILL_DAY = 16, END_DAY = 30;
const EVID_DIR = path.join(ROOT, 'evidence', '2026-10-19');
// Favor kinds with a direct player keep action (r27 scope). Task kinds
// (water_haul/snare_mend/watch_shift) resolve through the day broadcast —
// no direct keep path, documented, not attempted this run.
const DIRECT_KEEP = new Set(['food_share', 'forage_help', 'heal_help', 'sick_help', 'stay_close']);

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
  try { const f = ((Game.state.village || {}).favorLedger || {})[vid]; return f || null; } catch (e) { return null; }
}
function npcAlive(Game, vid) {
  try { return ((Game.state.village || {}).roster || []).includes(vid); } catch (e) { return false; }
}
function openPromiseCount(Game) {
  try { return Object.values((Game.state.village || {}).promises || {}).filter(p => p && !p.kept).length; } catch (e) { return 0; }
}
// Edible units the CURRENT bearer <redacted> in hand (giveFood's keep precondition).
function scholarFoodUnits(Game) {
  try {
    return (Game.state.scholar.inventory || [])
      .filter(i => (i.kcalEach || 0) > 0 && (i.units || 0) > 0 && !i.bonded && !(Game.isSpoiled && Game.isSpoiled(i)))
      .reduce((s, i) => s + (i.units || 0), 0);
  } catch (e) { return 0; }
}
// tendVillager's keep precondition: sick (v.sick rec) or wounded (hp < 70).
function npcTendable(Game, vid) {
  try {
    const v = Game.state.village || {};
    const rec = (v.sick || {})[vid];
    if (rec && (rec.daysLeft || 0) > 0) return { ok: true, why: 'sick:' + (rec.name || 'sick') };
    const hp = ((v.health || {})[vid] !== undefined) ? v.health[vid] : 100;
    if (hp < 70) return { ok: true, why: 'wound:hp' + hp };
    return { ok: false, why: 'not sick, hp ' + hp };
  } catch (e) { return { ok: false, why: 'threw' }; }
}
// THE MEANS GATE (r27): a competent player checks the pack before promising.
// Returns {ok, why}. food_share gets one honest acquisition day later.
function meansFor(Game, vid, kind) {
  if (kind === 'food_share' || kind === 'forage_help') {
    const u = scholarFoodUnits(Game);
    return u >= 1 ? { ok: true, why: u + ' edible units in pack' } : { ok: false, why: 'pack empty (0 edible units)', acquirable: kind === 'food_share' };
  }
  if (kind === 'heal_help' || kind === 'sick_help') return npcTendable(Game, vid);
  if (kind === 'stay_close') return { ok: true, why: 'social keep: substantive convo' };
  return { ok: false, why: 'no direct keep path (' + kind + ')' };
}
function needKindOf(Game, vid) {
  try { const n = Game.convoFindFavorNeed && Game.convoFindFavorNeed(vid); return n && n.kind; } catch (e) { return null; }
}

// Honest convo driver (r26, unchanged): commitRule(vid, favorCtx) -> bool.
function driveConvo(Game, vid, tag, commitRule, maxTurns) {
  maxTurns = maxTurns || 14;
  const out = [`## ${tag} — ${firstName(rawName(Game, vid))} on d${dayOf(Game)} (trust ${trustOf(Game, vid)})`];
  let refused = false, committed = false, picked = [], commitPickTrust = null, commitPickWant = null;
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
    const favor = (c && c.want && c.want.favor) || null;
    let pick = null;
    const commitChoice = choices.find(x => x.id === 'dlg:commit');
    if (commitChoice && commitRule && /favor/i.test(wantId)) {
      if (commitRule(vid, { favor, wantId })) pick = commitChoice;
    }
    if (!pick) pick = choices.find(x => /^want:/.test(x.id) && !/favor/i.test(x.text || ''));
    if (!pick) pick = choices.find(x => /^want:/.test(x.id));
    if (!pick) pick = choices.find(x => /^(dlg:help|dlg:details)$/.test(x.id));
    if (!pick) {
      const fb = choices.find(x => !/^(leave|bye|goodbye|dlg:cant|dlg:commit)/.test(x.id) && !picked.includes(x.id));
      if (fb) { pick = fb; }
      else {
        const cc2 = choices.find(x => x.id === 'dlg:commit');
        if (cc2 && commitRule && /favor/i.test(wantId) && commitRule(vid, { favor, wantId })) pick = cc2;
        else pick = choices.find(x => x.id === 'dlg:cant') || null;
      }
    }
    if (!pick || /^(leave|bye|goodbye)/.test(pick.id)) break;
    picked.push(pick.id);
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 110)}`);
    if (pick.id === 'dlg:commit') { commitPickTrust = trustOf(Game, vid); commitPickWant = (Game.convoGet(vid) || {}).want && Game.convoGet(vid).want.id; }
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
  const m = txt.match(/I asked (\S+) about .*? — \1's gone/i);
  const thankedM = txt.match(/You came through on (.+?)\. I won't forget it/i);
  const flags = {
    want: (cf && cf.want && cf.want.id) || 'none',
    inheritedReask: !!m,
    thanked: !!thankedM,
    committed, picked: picked.join(','), commitPickTrust, commitPickWant,
  };
  out.push('\n### FULL TRANSCRIPT');
  out.push(lines.join('\n'));
  out.push(`\nCARRY-FLAGS: ${JSON.stringify(flags)}`);
  return { text: out.join('\n'), refused: false, committed, flags, fullText: txt, inheritedLine: m ? m[0].slice(0, 160) : null };
}

// Perform the real keep-action for a favor kind. Returns what was done.
function fulfillAction(Game, vid, kind) {
  try {
    if (kind === 'food_share' || kind === 'forage_help') {
      const r = Game.giveFood(vid, 'meal');
      return 'giveFood(meal): ' + (r ? 'ok' : 'null');
    }
    if (kind === 'heal_help' || kind === 'sick_help') {
      const r = Game.tendVillager(vid);
      return 'tendVillager: ' + (r ? 'ok' : 'null');
    }
    if (kind === 'stay_close') {
      return 'social: drive another substantive convo';
    }
    return 'no direct keep path: ' + kind;
  } catch (e) { return 'threw: ' + e.message; }
}

const rec = {
  seed: SEED, notes: [], anomalies: [],
  mantle: {}, phase1Commits: [], openAtDeath: 0, openBookFired: false,
  attempts: [], m1: null, m2: null, m3: null, m4: null,
};

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-r27', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;
  if (!fs.existsSync(EVID_DIR)) fs.mkdirSync(EVID_DIR, { recursive: true });

  const _say = Game.say;
  const handoffSay = [];
  let capturing = false;
  Game.say = function (t) {
    const s = String(t || '');
    if (capturing) handoffSay.push({ day: dayOf(Game), text: s.slice(0, 500) });
    return _say ? _say.call(this, t) : undefined;
  };

  // ---- phase 1: honest competent play + honest convo driving (organic only) ----
  // The honest driver commits when trust >= 30 (documented play). r26 showed
  // competent play settles these before death; the FORCING PHASE below
  // guarantees the trigger r27 needs.
  const commitRule = (vid, ctx) => {
    if (openPromise(Game, vid)) return false;
    return trustOf(Game, vid) >= 30;
  };
  const PHASE1_DAYS = 14;
  for (let d = 1; d <= PHASE1_DAYS; d++) {
    if (Game.over) { rec.notes.push(`village over at d${dayOf(Game)} before the kill — seed skipped`); console.log(JSON.stringify(rec)); return; }
    await runDays(Game, competent, { days: 1 });
    if (Game.over) { rec.notes.push(`village over at d${dayOf(Game)} before the kill — seed skipped`); console.log(JSON.stringify(rec)); return; }
    const self = Game.villagerId;
    const v = Game.state.village || {};
    const cands = [];
    for (const vid of (v.roster || [])) {
      if (vid === self) continue;
      try { if (Game.convoFindFavorNeed && Game.convoFindFavorNeed(vid)) cands.push(vid); } catch (e) {}
    }
    cands.sort((a, b) => trustOf(Game, b) - trustOf(Game, a));
    let drove = 0;
    for (const vid of cands.slice(0, 2)) {
      const r = driveConvo(Game, vid, `pre-death d${dayOf(Game)}`, commitRule);
      if (drove === 0 && d % 4 === 1) { E(`\n===== TRANSCRIPT d${dayOf(Game)} (${firstName(rawName(Game, vid))}) =====`); E(r.text.split('\n').slice(0, 40).join('\n')); }
      if (r.committed) {
        const f = favorOf(Game, vid);
        rec.phase1Commits.push({ day: dayOf(Game), vid: firstName(rawName(Game, vid)), kind: f && f.kind, trust: trustOf(Game, vid), commitPickTrust: r.flags.commitPickTrust, commitPickWant: r.flags.commitPickWant });
        E(`COMMIT d${dayOf(Game)}: ${firstName(rawName(Game, vid))} kind=${f && f.kind} trust=${trustOf(Game, vid)} pickTrust=${r.flags.commitPickTrust} pickWant=${r.flags.commitPickWant}`);
      }
      drove++;
    }
  }

  // ---- forcing phase: up to 4 game-days, first setup wins, kill SAME day ----
  // ORCHESTRATE=1 (always this run, documented): build ONE favor+promise
  // through the engine's own favor machinery (convoFindFavorNeed ->
  // convoBuildFavor -> convoStoreFavor -> convoFavorCommit — the exact
  // functions the ask_favor opener and dlg:commit call). The forcing is in
  // the DECISION (which NPC, which need); the mechanism is the real one.
  // (The driveConvo-based force was flaky: the want picker doesn't always
  // surface ask_favor, so the commit choice never appeared — 8201d.)
  // Setup constraints (documented): live need of a directly-keepable kind,
  // no open promise, trust >= 30 (the successor's commit gate persists
  // trust), and lowest-trust-first — the village chooses the successor by
  // trust, a promise to the heir moots at death (r27 promisee-bearer fix),
  // and the commit's own +6 trust bump flipped a close second into the
  // heirship on 8201b/c. The kill fires the same game-day: the promise is
  // guaranteed open at death.
  const ORCH = process.env.ORCHESTRATE !== '0';
  rec.orchestrated = ORCH;
  // KIND_PREF (r27): heal_help FIRST — wounds (hp<70) don't auto-heal, so the
  // need stays live post-death and the re-ask can surface once grief cools.
  // food_share/forage_help needs churn in hours (the competent pantry fills),
  // leaving 'asked' zombie favors whose need died (8201f: 8 days of retries,
  // favor never mooted because the opener never ran). Documented.
  const KIND_PREF = ['heal_help', 'sick_help', 'food_share', 'forage_help', 'stay_close'];
  let forced = null;
  if (ORCH) {
    for (let f = 0; f < 4 && !forced && !Game.over; f++) {
      await runDays(Game, competent, { days: 1 });
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
        // URGENCY-4 ONLY (r27): the re-ask must outrank grief (seek_taken
        // floor 3.1) in the want picker, or it never surfaces — 8201 proved
        // urgency-2 (forage_help) loses for 9 straight days. Acute needs
        // (hunger>70, health<60, sick sev2+) are urgency 4. heal_help first:
        // wounds don't auto-heal, so the need stays live post-death.
        if (!need || !DIRECT_KEEP.has(need.kind) || !(need.urgency >= 4)) continue;
        cands.push({ vid, kind: need.kind, need });
      }
      cands.sort((a, b) =>
        (KIND_PREF.indexOf(a.kind) < 0 ? 99 : KIND_PREF.indexOf(a.kind)) - (KIND_PREF.indexOf(b.kind) < 0 ? 99 : KIND_PREF.indexOf(b.kind)) ||
        trustOf(Game, a.vid) - trustOf(Game, b.vid));
      E(`FORCE d${dayOf(Game)}: ${cands.length} setup-eligible${cands.length ? ' (pick: ' + firstName(rawName(Game, cands[0].vid)) + ':' + cands[0].kind + ' trust ' + trustOf(Game, cands[0].vid) + ')' : ''}`);
      if (cands.length) {
        const { vid, need } = cands[0];
        try {
          const favor = Game.convoBuildFavor(vid, need);
          if (favor) {
            Game.convoStoreFavor(favor);
            const cr = Game.convoFavorCommit(vid, favor);
            if (cr && cr.ok) {
              forced = { day: dayOf(Game), vid: firstName(rawName(Game, vid)), kind: favor.kind };
              rec.phase1Commits.push({ day: dayOf(Game), vid: forced.vid, kind: forced.kind, forced: true, trust: trustOf(Game, vid) });
              E(`FORCED COMMIT d${dayOf(Game)}: ${forced.vid} kind=${forced.kind} — killing same day`);
            } else {
              E(`FORCE d${dayOf(Game)}: commit refused for ${firstName(rawName(Game, vid))}`);
            }
          } else {
            E(`FORCE d${dayOf(Game)}: buildFavor returned null for ${firstName(rawName(Game, vid))}`);
          }
        } catch (e) { E(`FORCE d${dayOf(Game)}: threw ${e.message}`); }
      }
    }
    if (!forced) rec.notes.push('forcing phase: no setup-eligible need in 4 days — no open promise at death (ask-frequency finding, not a failure)');
  }
  rec.openAtDeath = openPromiseCount(Game);
  rec.forced = forced;
  E(`--- PRE-KILL d${dayOf(Game)}: bearer=${firstName(rawName(Game, Game.villagerId))}, roster ${((Game.state.village || {}).roster || []).length} living, OPEN PROMISES AT DEATH: ${rec.openAtDeath} (forced: ${forced ? forced.vid + '/' + forced.kind : 'none'})`);

  // ---- the kill ----
  const oldId = Game.villagerId;
  const oldFirst = firstName(rawName(Game, oldId));
  handoffSay.length = 0; capturing = true;
  Game.playerDeath('the expedition');
  capturing = false;
  const newId = Game.villagerId;
  const newFirst = firstName(rawName(Game, newId));
  const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
  const lastLin = lin[lin.length - 1] || {};
  rec.mantle = {
    passed: newId !== oldId && !Game.over,
    oldFirst, newFirst,
    lineageEntry: !!(lastLin.cause && lastLin.villagerId === oldId),
  };
  rec.m1 = rec.mantle.passed && rec.mantle.lineageEntry;
  E(`MANTLE: ${oldFirst} -> ${newFirst} | passed=${rec.mantle.passed} lineage=${rec.mantle.lineageEntry}`);
  try {
    rec.releasedAtHandoff = Object.values((Game.state.village || {}).promises || {})
      .filter(p => p && p.kept === 'released' && p.inherited === true).length;
  } catch (e) { rec.releasedAtHandoff = -1; }
  E(`RELEASED AT HANDOFF: ${rec.releasedAtHandoff}`);
  rec.openBookFired = handoffSay.some(l => /book stays open on the table/i.test(l.text));
  const bookLines = handoffSay.filter(l => /📜|book stays open|promises died/i.test(l.text));
  E(`OPEN-BOOK: fired=${rec.openBookFired} (open promises at death: ${rec.openAtDeath})`);
  for (const l of bookLines) E(`  📜 d${l.day}: ${l.text.slice(0, 260)}`);
  rec.handoffBookLines = bookLines.map(l => l.text);
  E(`SUCCESSOR PACK: ${scholarFoodUnits(Game)} edible units (death pack empties the bearer — the successor forages)`);

  // ---- phase 2: the successor's days — the means-gated close ----
  // TWO-PASS HONESTY (r26): pass 1 never commits — it listens. The driver
  // commits (pass 2) ONLY if the NPC actually re-asked naming the
  // predecessor (heard in-fiction) OR the open-book beat fired (read it in
  // the book). NEW (r27): the MEANS GATE — the successor checks the pack
  // before promising (trust>=30 AND the keep preconditions are true right
  // now). food_share with an empty pack gets ONE honest acquisition day
  // (real competent foraging — what a player does when they promise a
  // pantry run empty-handed); if the pack is still empty, no commit and
  // the run documents "no means", never a loop failure.
  const askers = () => {
    const out = [];
    try {
      const fl = (Game.state.village || {}).favorLedger || {};
      for (const [vid, f] of Object.entries(fl)) {
        if (f && f.state === 'asked' && f.inhFrom && npcAlive(Game, vid) && DIRECT_KEEP.has(f.kind)) out.push({ vid, kind: f.kind, inhFrom: f.inhFrom });
      }
    } catch (e) {}
    return out;
  };
  const attemptedVids = new Set();
  const pass1Seen = {};
  const POST_KILL_DAYS = 14; // successor plays 14 days past the kill, whatever day it lands
  for (let d = 1; d <= POST_KILL_DAYS; d++) {
    if (Game.over) { rec.notes.push(`village over at d${dayOf(Game)} — stopping`); break; }
    await runDays(Game, competent, { days: 1 });
    if (Game.over) { rec.notes.push(`village over at d${dayOf(Game)} — stopping`); break; }
    if (d <= 4) {
      try {
        const fl = (Game.state.village || {}).favorLedger || {};
        const states = Object.entries(fl).filter(([, f]) => f && f.inhFrom)
          .map(([vid, f]) => `${firstName(rawName(Game, vid))}:${f.kind}:${f.state}:alive=${npcAlive(Game, vid)}`).join(' | ');
        E(`FAVORS d${dayOf(Game)}: [${states}] attempted=[${[...attemptedVids].map(x => firstName(rawName(Game, x))).join(',')}]`);
      } catch (e) {}
    }
    const list = askers().filter(a => !attemptedVids.has(a.vid));
    if (!list.length) continue;
    for (const a of list) {
      const r = driveConvo(Game, a.vid, `reask-watch d${dayOf(Game)}`, () => false);
      pass1Seen[a.vid] = (pass1Seen[a.vid] || 0) + 1;
      if (pass1Seen[a.vid] <= 2) { E(`\n===== REASK-WATCH d${dayOf(Game)} (${firstName(rawName(Game, a.vid))}, favor ${a.kind}, inhFrom ${a.inhFrom}) =====`); E(r.text); }
      let heard = false, heardHow = null;
      if (r.flags.inheritedReask) { heard = true; heardHow = 'inherited-line'; }
      else if (rec.openBookFired) { heard = true; heardHow = 'open-book'; }
      if (!heard) {
        rec.notes.push(`d${dayOf(Game)}: ${firstName(rawName(Game, a.vid))} re-asked WITHOUT the inherited line and no open book — no commit (never heard the debt in-fiction)`);
        continue;
      }
      rec.notes.push(`d${dayOf(Game)}: heard re-ask from ${firstName(rawName(Game, a.vid))} via ${heardHow}: ${r.inheritedLine || '(variety line)'}`);
      const trust = trustOf(Game, a.vid);
      if (trust < 30) {
        rec.notes.push(`d${dayOf(Game)}: no commit — trust ${trust} < 30 (honest rule: won't promise a stranger)`);
        continue;
      }
      const kind = (favorOf(Game, a.vid) || {}).kind || a.kind;
      // NEED-LIVE CHECK (r27): if the underlying need died, the favor is a
      // zombie — 'asked' forever, never mooted (the moot only fires inside a
      // favor convo, which grief outranks). Documented, no retry.
      let needLive = true;
      try { needLive = Game.convoFavorNeedLive ? Game.convoFavorNeedLive(favorOf(Game, a.vid)) : true; } catch (e) {}
      E(`NEED d${dayOf(Game)}: ${firstName(rawName(Game, a.vid))} kind=${kind} needLive=${needLive}`);
      if (!needLive) {
        rec.notes.push(`d${dayOf(Game)}: ${firstName(rawName(Game, a.vid))}'s inherited favor is a ZOMBIE — need died, favor stuck 'asked' (moot only fires in-convo; grief outranks it). No attempt; design gap documented.`);
        attemptedVids.add(a.vid);
        continue;
      }
      let means = meansFor(Game, a.vid, kind);
      E(`MEANS d${dayOf(Game)}: ${firstName(rawName(Game, a.vid))} kind=${kind} ok=${means.ok} (${means.why})`);
      if (!means.ok && means.acquirable) {
        // ONE honest acquisition day: real competent foraging, then recheck.
        // The favor is still 'asked' — no deadline is running yet. If the
        // need churned overnight the favor goes moot: documented, honest.
        E(`ACQUIRE d${dayOf(Game)}: pack empty — one honest forage day before promising`);
        await runDays(Game, competent, { days: 1 });
        const f2 = favorOf(Game, a.vid);
        if (!f2 || f2.state !== 'asked') {
          rec.notes.push(`d${dayOf(Game)}: favor went ${(f2 && f2.state) || 'gone'} during the acquisition day — no commit (need churned, honest)`);
          attemptedVids.add(a.vid);
          continue;
        }
        means = meansFor(Game, a.vid, kind);
        E(`MEANS d${dayOf(Game)} after acquire: ok=${means.ok} (${means.why})`);
      }
      if (!means.ok) {
        rec.notes.push(`d${dayOf(Game)}: no commit to ${firstName(rawName(Game, a.vid))} — means absent (${means.why}); a real player checks the pack before promising`);
        attemptedVids.add(a.vid);
        continue;
      }
      // ---- the attempt: commit -> fulfill -> repay ----
      // SELF-CONVO GUARD (r27): the bearer never owes themselves a convo.
      // (The engine fix moots promisee-heir favors; this is belt-and-braces.)
      if (a.vid === Game.villagerId) {
        rec.notes.push(`d${dayOf(Game)}: ${firstName(rawName(Game, a.vid))} is the bearer — no self-convo (promisee-heir favor should have mooted)`);
        attemptedVids.add(a.vid);
        continue;
      }
      // NOTE: attemptedVids is marked only AFTER a commit takes (below) or on
      // definitive non-attempts. A failed pass-2 (favor ask didn't surface —
      // grief outranks it in the days after death) retries tomorrow; the
      // inherited ask is not deadline-bound until committed.
      const r2 = driveConvo(Game, a.vid, `reask-commit d${dayOf(Game)}`, () => true);
      if (!r2.committed) {
        rec.notes.push(`d${dayOf(Game)}: pass-2 commit to ${firstName(rawName(Game, a.vid))} did not take (favor ask didn't surface) — retrying tomorrow`);
        continue;
      }
      attemptedVids.add(a.vid);
      const trustBefore = trustOf(Game, a.vid);
      const unitsBefore = scholarFoodUnits(Game);
      E(`COMMITTED to re-ask d${dayOf(Game)}: kind=${kind} trustBefore=${trustBefore} packUnits=${unitsBefore}`);
      const act = fulfillAction(Game, a.vid, kind) + ` (packUnits=${unitsBefore})`;
      E(`FULFILL-ACTION: ${act}`);
      if (kind === 'stay_close') {
        const rs = driveConvo(Game, a.vid, `social-keep d${dayOf(Game)}`, () => false);
        E(rs.text.split('\n').slice(0, 12).join('\n'));
      }
      const p = openPromise(Game, a.vid);
      const f = favorOf(Game, a.vid);
      const keptNow = !p;
      E(`POST-FULFILL: promiseOpen=${!!p} favorState=${f && f.state} fulfillResult=${act.split(':')[0]}`);
      const r3 = driveConvo(Game, a.vid, `repay d${dayOf(Game)}`, () => false);
      const f2 = favorOf(Game, a.vid);
      const trustAfter = trustOf(Game, a.vid);
      E(`POST-REPAY: favorState=${f2 && f2.state} thankedInTranscript=${r3.flags.thanked} trust ${trustBefore} -> ${trustAfter}`);
      E(r3.text);
      let zombies = 0;
      try {
        for (const [, pp] of Object.entries((Game.state.village || {}).promises || {})) {
          if (pp && !pp.kept && pp.maker === oldId) zombies++;
        }
      } catch (e) {}
      const closed = keptNow && f2 && f2.state === 'thanked' && r3.flags.thanked && zombies === 0;
      rec.attempts.push({
        day: dayOf(Game), vid: firstName(rawName(Game, a.vid)), kind, heardHow,
        meansWhy: means.why, fulfillAction: act, favorState: f2 && f2.state,
        promiseKept: keptNow, thanked: r3.flags.thanked,
        trustBefore, trustAfter, zombies, closed: !!closed,
        commitTranscript: r2.fullText.slice(0, 4000),
        repayTranscript: r3.fullText.slice(0, 4000),
      });
      E(`LOOP-CLOSE: ${closed ? 'CLOSED CLEANLY' : 'INCOMPLETE'} ${JSON.stringify({ kind, favorState: f2 && f2.state, thanked: r3.flags.thanked, trustBefore, trustAfter, zombies })}`);
    }
  }
  rec.m2 = rec.attempts.length > 0; // roll-up (>=2/5) in the run note
  rec.m3 = rec.attempts.some(c => c.closed);

  // ---- census (plain words material) ----
  try {
    const vv = Game.state.village || {};
    rec.census = {
      day: dayOf(Game), living: (vv.roster || []).length,
      fallen: (vv.fallen || []).length,
      promisesOpen: openPromiseCount(Game),
      promisesReleased: Object.values(vv.promises || {}).filter(p => p && p.kept === 'released').length,
      favorStates: Object.values(vv.favorLedger || {}).map(f => f && f.state).filter(Boolean).reduce((a, s) => { a[s] = (a[s] || 0) + 1; return a; }, {}),
    };
  } catch (e) {}

  Game.say = _say;
  // ---- telemetry snapshot (same keys as r25/r26, for telemetry-check vs succession.json) ----
  try {
    rec.tele = {
      'deaths.bearer': 1,
      'census.alive': ((Game.state.village || {}).roster || []).length,
      'census.fallen': ((Game.state.village || {}).fallen || []).length,
      'census.integrationStage': (() => { try { return Game.integrationStage(); } catch (e) { return 0; } })(),
      'week2.deadBearerMentions': rec.attempts.length,
    };
    E(`TELE: ${JSON.stringify(rec.tele)}`);
    fs.writeFileSync(path.join(EVID_DIR, `journey-succession-r27-tele-${SEED}.json`), JSON.stringify(rec.tele, null, 1));
  } catch (e) { rec.anomalies.push('tele snapshot threw: ' + e.message); }
  console.log(JSON.stringify(rec));
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
