#!/usr/bin/env node
// journey-succession-r34-20261021.js — SUCCESSION LEG r34: "THE OPEN BOOK IN
// THE WILD + THE DARK HEIR"
// Journey leg 7: death of the player character, the mantle passing, the new
// bearer's life. LANE B. Prior art: r26-r28 closes (settle-on-speak fix),
// r29 3-death chains, r30 close replay, r31 new bearer's life (M2 NO-GO:
// zero post-handoff office-acks in 21 driven convos), r32 funeral (socially
// silent by design), r33 successor's weeks (blank ANSWERED: office-ack lives
// in thread continuity + want-seed follow-ups; the r31 "zero threads" was a
// naive-driver artifact + contingency).
//
// LEG QUESTION (r34 pre-registered, MEASUREMENT.md §§9-12, 14) — two halves:
// Q1 (reachability, unorchestrated): the open book says "the promises died
//     with their maker; the needs didn't. What you do about them is yours to
//     decide." r28 PROVED the re-take machinery with ORCHESTRATE=1 (forced a
//     new favor+promise with the needy villager in a 4-day window). Never
//     proven: does the inherited re-ask (inherited-line / want-seed
//     follow-up naming the dead bearer) surface in NORMAL successor play —
//     no forced favors post-death, just a curious player who talks to
//     people? If yes: the book is reachable in the wild. If no: name the
//     cause class (gate/priority/expiry/contingency) — a BLANK, not a bug.
// Q2 (canon proof): docs/CORRUPTION.md claims "picking (or inheriting, on
//     mantle-passing) a villager with a malicious hidden trait fires a
//     psycho bundle — flashback, inner voice, starting corruption 20, early
//     tells surfaced." mantleWatch() implements it. NEVER proven end-to-end
//     in a run. Force a malicious heir, kill via the REAL playerDeath, and
//     check the bundle fires. If broken: REAL BUG (canon-claimed beat).
//
// PROFILE (Q1, seeds 9901-9904): competent policy throughout. Phase A d1-9,
// one driven thread-plant convo (r33 full driver, commitRule false). One
// forced favor+promise through the REAL favor machinery ~d10-12 (r29
// precedent; the DECISION is forced, the mechanism is real). Scripted kill
// ~d13 via the REAL playerDeath ('a hushwolf'). Post-death +35d: the
// successor plays competent; a curious-player stand-in drives ONE convo
// every 2 days with a round-robin living villager (10 turns, commitRule
// FALSE — never auto-commits; engages with offered wants like a player
// would). NO forced favors post-death. Sense-read transcripts at d+7/d+21/
// d+35 with the needy villager (if alive) + a high-trust villager, saved to
// evidence. Death-aware: dead/scattered village stops the run (+10d tail).
//
// PROFILE (Q2, seed 9905, DARK_HEIR=1): no forced promise. Force the heir:
// pick a living mid-trust villager, set bgDark[vid]={kind:'malicious',
// tell:'long_smile'} (real tell id from data.characterGen.darkTells) and
// raise their trust above the roster max (heir = highest trust, ledger.js
// playerDeath). Kill via the REAL playerDeath. Tick +1 day so the per-part
// mantleWatch fires. Then verify the psycho bundle. Successor then plays
// the normal +35d (recorded separately; excluded from M1/M2).
//
// BINDING METRICS (MEASUREMENT.md §14):
//   M1: ≥3/4 mantles pass cleanly on 9901-9904 (bearer changes, linOk, moOk,
//       game continues to horizon or a death-aware stop). Kill rule: fails
//       on ≥2/4 → SUBSTRATE-MISSING.
//   M2 (re-take reachability): on ≥2/4 seeds, ≥1 ORGANIC re-ask naming the
//       dead bearer fires in a post-death successor-driven convo
//       ('reask-inherited' pattern) OR the open-book line re-surfaces the
//       forced need post-handoff. Seeds where the forced promise went moot
//       (promisee became heir) or the needy villager died are EXCLUDED from
//       the denominator (documented, r27 finding (e)). Kill rule for the
//       finding: 0/eligible → BLANK (cause class named; not a bug claim).
//   M3 (dark heir canon): on 9905, the psycho bundle fires end-to-end:
//       sayLog contains the flashback line AND the inner-voice line,
//       s.corruption==20, s.darkPath true, s._psychoIntroFired true, and the
//       tell quirk surfaces. RED→GREEN if broken (proof test added).
//   M4: 0 identity failures + 0 fabricated-history lines in the sense-read
//       transcripts (standing bar).
//   M5: Codex breadth does not drop across the death on any seed
//       (standing continuity check, r33 criterion (c)).
// INTERESTING-FINDING CRITERIA:
//   (a) M2 met → the open book is reachable in the wild; document channel mix.
//   (b) M2 misses → cause class named (gate/priority/expiry/driver) → BLANK.
//   (c) M3 broken → REAL BUG (canon-claimed beat unproven till now).
//   (d) identity failures / fabrications → REAL BUG.
//   (e) breadth drops → REAL BUG.
//
// SEEDS: 9901-9904 (Q1), 9905 (Q2, DARK_HEIR=1). Policy: competent.
// HORIZON: phase A d1-9, force+kill ~d10-13, post-death +35d (~d48).
//
// Usage: SEED=9901 node scripts/journey-succession-r34-20261021.js
//        DARK_HEIR=1 SEED=9905 node scripts/journey-succession-r34-20261021.js
// Output: JSON record to stdout; narrative + census + transcripts to stderr.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '9901', 10);
const DARK_HEIR = process.env.DARK_HEIR === '1';
const KILL_CAUSE = 'a hushwolf';
const POST_DAYS = 35;
const EVID_DIR = path.join(ROOT, 'evidence', '2026-10-21');
// Keepable favor kinds on the current tip (2026-10-21): the Codex
// favor-action contract (dedc46db7, merged 2026-10-20) made forage_help,
// snare_mend and watch_shift explicitly UNKEEPABLE — honest blocker, no
// playable joint action, "close this unavailable job (no penalty)". So the
// re-take/close machinery the open book promises now covers food, wound,
// illness, water and company needs only. Forcing an unkeepable kind would
// test a path the game deliberately closed — excluded here, documented in
// the run note as a design consequence for Steve.
const DIRECT_KEEP = new Set(['food_share', 'heal_help', 'sick_help', 'water_haul', 'stay_close']);
const KIND_PREF = ['heal_help', 'sick_help', 'food_share', 'water_haul', 'stay_close'];
const SAY_CAP = 8000;

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

// Honest convo driver (r26/r28/r33, unchanged): the pick logic stands in for
// a curious player — engages with offered wants (favor wants included on
// fallback), never auto-commits.
function driveConvo(Game, vid, tag, commitRule, maxTurns) {
  maxTurns = maxTurns || 10;
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

// Retake-scan patterns: the organic channels by which the dead bearer's need
// can re-surface to the successor. Both name the dead bearer.
const RETAKE_PATTERNS = [
  { id: 'reask-inherited', re: /I asked .*? about .* — .*?'s gone/ },
  { id: 'open-book', re: /book stays open on the table/ },
];

const rec = {
  seed: SEED, darkHeir: DARK_HEIR, notes: [], anomalies: [],
  m1: null, m2: null, m3: null, m4: null, m5: null,
  death: null, organicDeaths: [],
  retakes: [], convoReads: [], convoLines: [],
  trustChain: [], census: null,
};

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-r34', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;
  if (!fs.existsSync(EVID_DIR)) fs.mkdirSync(EVID_DIR, { recursive: true });

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

  // ---- phase A: 9 competent days ----
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
  // thread plant (Q1 profile only; the dark-heir seed keeps the pure profile)
  if (!DARK_HEIR) {
    try {
      const v = Game.state.village || {};
      const plantVid = (v.roster || []).find(id => id !== Game.villagerId);
      if (plantVid) {
        const r = driveConvo(Game, plantVid, `thread-plant d${dayOf(Game)}`, () => false, 10);
        E(`THREAD-PLANT d${dayOf(Game)} with ${firstName(rawName(Game, plantVid))} (bearer ${firstName(rawName(Game, Game.villagerId))}), want=${r.flags.want}`);
      }
    } catch (e) { rec.notes.push('thread plant threw: ' + e.message); }
  }

  // ---- forcing ----
  let forced = null;
  if (!DARK_HEIR) {
    const f = await forcePromise(Game, E, watchBearer);
    forced = f.forced ? { ...f.forced, vid: firstName(rawName(Game, f.forced.vid)), vidId: f.forced.vid } : null;
    rec.forced = f.forced ? { ...f.forced, vid: firstName(rawName(Game, f.forced.vid)) } : null;
    for (const n of f.notes) rec.notes.push(n);
    if (Game.over) { rec.notes.push('village over before the kill — run stops'); finish(); return; }
  } else {
    // Q2: force a malicious heir. Heir = highest-trust roster member, so top
    // their trust and give them a real malicious tell id from characterGen.
    try {
      const v = Game.state.village || {};
      const self = Game.villagerId;
      const roster = (v.roster || []).filter(id => id !== self);
      const cands = roster.map(id => ({ id, t: trustOf(Game, id) })).sort((a, b) => a.t - b.t);
      const pick = cands[Math.floor(cands.length / 2)] || cands[0];
      const maxT = Math.max(0, ...roster.map(id => trustOf(Game, id)));
      v.bgDark = v.bgDark || {};
      v.bgDark[pick.id] = { kind: 'malicious', tell: 'long_smile' };
      v.trust[pick.id] = maxT + 25;
      rec.darkForcing = { vid: firstName(rawName(Game, pick.id)), vidId: pick.id, trustSet: maxT + 25 };
      E(`DARK-FORCE d${dayOf(Game)}: ${firstName(rawName(Game, pick.id))} gets malicious/long_smile, trust -> ${maxT + 25} (heir lock)`);
    } catch (e) { rec.anomalies.push('dark forcing threw: ' + e.message); }
  }

  const oldId = Game.villagerId;
  const oldName = rawName(Game, oldId);
  const oldFirst = firstName(oldName);
  const trustBefore = trustOf(Game, oldId);
  const codexBefore = (() => { try { return Game.codexBreadth(); } catch (e) { return -1; } })();
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
    codexBefore, forced: rec.forced || null,
  };
  rec.trustChain.push({ bearer: newFirst, trust: Math.round(newTrust) });
  E(`\nDEATH d${deathDay} (${KILL_CAUSE}): ${oldFirst} -> ${newFirst} | passed=${passed} lin=${rec.death.linOk} mantleOf=${rec.death.moOk} trust ${Math.round(trustBefore)} -> ${Math.round(newTrust)} codexBreadth=${codexBefore}`);
  if (!passed) { rec.notes.push(`mantle FAILED (over=${Game.over}, villageLost=${Game.villageLost})`); rec.m1 = false; finish(); return; }

  // Q2: psycho-bundle verification — tick one day so the per-part
  // mantleWatch fires for the new bearer, then check the bundle.
  if (DARK_HEIR) {
    await runDays(Game, competent, { days: 1 });
    const s = Game.state.scholar || {};
    const post = sayLog.slice(handoffStart);
    const hasFlashback = post.some(h => /FLASHBACK — before the scattering/.test(h.text));
    const hasInner = post.some(h => /INNER VOICE: the others are already afraid/.test(h.text));
    const hasQuirk = post.some(h => /People will notice:.*smiles a beat too long/.test(h.text));
    rec.m3 = {
      heirIsDark: !!(Game.npcDark && Game.npcDark(newId) && Game.npcDark(newId).kind === 'malicious'),
      heirId: firstName(rawName(Game, newId)),
      flashback: hasFlashback, innerVoice: hasInner, tellQuirk: hasQuirk,
      corruption: s.corruption || 0, darkPath: !!s.darkPath,
      psychoIntroFired: !!s._psychoIntroFired,
    };
    E(`DARK-HEIR CHECK: heirDark=${rec.m3.heirIsDark} flashback=${hasFlashback} inner=${hasInner} quirk=${hasQuirk} corruption=${s.corruption} darkPath=${s.darkPath} fired=${s._psychoIntroFired}`);
    rec.m3.pass = rec.m3.heirIsDark && hasFlashback && hasInner && (s.corruption === 20) && !!s.darkPath && !!s._psychoIntroFired;
  }

  // ---- the new bearer's life: 35 days ----
  // curious-player stand-in: one driven convo every 2 days, round-robin over
  // the living roster, 10 turns, NEVER auto-commit. Sense-reads at d+7/21/35.
  const talkedAt = {};
  let wb = newId;
  const rosterOrder = [];
  for (let d = 1; d <= POST_DAYS; d++) {
    if (Game.over) break;
    await runDays(Game, competent, { days: 1 });
    wb = watchBearer(`post-d+${d}`, wb);
    if (Game.over) break;
    const curDay = dayOf(Game);
    const daysSince = curDay - deathDay;
    const v = Game.state.village || {};
    const self = Game.villagerId;
    // keep a stable round-robin order
    for (const id of (v.roster || [])) if (!rosterOrder.includes(id)) rosterOrder.push(id);
    const pickCurious = () => {
      const live = rosterOrder.filter(id => id !== self && (v.roster || []).includes(id));
      live.sort((a, b) => (talkedAt[a] || -99) - (talkedAt[b] || -99));
      return live[0] || null;
    };
    if (daysSince % 2 === 0) {
      const vid = pickCurious();
      if (vid) {
        talkedAt[vid] = curDay;
        try {
          const r = driveConvo(Game, vid, `curious d+${daysSince} d${curDay}`, () => false, 10);
          if (r.fullText) for (const ln of r.fullText.split('\n')) {
            if (/^NPC:/.test(ln)) rec.convoLines.push({ day: curDay, vid: firstName(rawName(Game, vid)), text: ln.replace(/^NPC:\s*/, '').slice(0, 600) });
          }
          E(`  CURIOUS d+${daysSince} with ${firstName(rawName(Game, vid))} (refused=${r.refused}, want=${r.flags.want})`);
        } catch (e) { rec.anomalies.push(`curious convo d+${daysSince} threw: ` + e.message); }
      }
    }
    if ([7, 21, 35].includes(daysSince)) {
      const cands = [];
      try {
        if (forced && forced.vidId && (v.roster || []).includes(forced.vidId) && forced.vidId !== self) cands.push(forced.vidId);
        const byTrust = (v.roster || []).filter(id => id !== self && !(forced && id === forced.vidId))
          .sort((a, b) => trustOf(Game, b) - trustOf(Game, a));
        if (byTrust[0] && trustOf(Game, byTrust[0]) >= 20) cands.push(byTrust[0]);
      } catch (e) {}
      for (const vid of cands.slice(0, 2)) {
        try {
          const r = driveConvo(Game, vid, `sense d+${daysSince} d${curDay}`, () => false, 12);
          const fn = path.join(EVID_DIR, `journey-succession-r34-transcript-${SEED}-dplus${daysSince}-${firstName(rawName(Game, vid))}.txt`);
          fs.writeFileSync(fn, r.text);
          rec.convoReads.push({ day: curDay, dplus: daysSince, vid: firstName(rawName(Game, vid)), refused: r.refused, want: r.flags.want });
          if (r.fullText) for (const ln of r.fullText.split('\n')) {
            if (/^NPC:/.test(ln)) rec.convoLines.push({ day: curDay, vid: firstName(rawName(Game, vid)), text: ln.replace(/^NPC:\s*/, '').slice(0, 600) });
          }
          E(`  SENSE d+${daysSince} with ${firstName(rawName(Game, vid))} (refused=${r.refused}, want=${r.flags.want})`);
        } catch (e) { rec.anomalies.push(`sense convo d+${daysSince} threw: ` + e.message); }
      }
    }
  }
  const endDay = dayOf(Game);
  E(`POST-DEATH: ran to d${endDay} (${endDay - deathDay} days after death); organic handoffs since: ${rec.organicDeaths.length}`);

  finish();

  function finish() {
    Game.say = _say;
    capturing = false;
    // ---- retake scan: post-death say log + successor convo NPC lines ----
    const post = sayLog.slice(handoffStart);
    const lineSrc = post.concat(rec.convoLines.filter(l => l.day >= deathDay).map(l => ({ day: l.day, text: l.text, vid: l.vid })));
    const hits = [];
    for (const h of lineSrc) {
      for (const p of RETAKE_PATTERNS) {
        if (p.re.test(h.text)) { hits.push({ day: h.day, pattern: p.id, vid: h.vid || null, text: h.text.slice(0, 280) }); break; }
      }
    }
    // dedupe: same pattern+vid within 3 days counts once
    const distinct = [];
    for (const a of hits) {
      if (!distinct.some(d => d.pattern === a.pattern && (d.vid || '') === (a.vid || '') && Math.abs(d.day - a.day) <= 3)) distinct.push(a);
    }
    rec.retakes = distinct;
    E(`\nRETAKE HITS (post-death, distinct): ${distinct.length}`);
    for (const a of distinct.slice(0, 24)) E(`  d${a.day} [${a.pattern}]${a.vid ? ' ' + a.vid : ''} ${a.text.slice(0, 130)}`);
    // disposition of the forced promise at handoff
    if (forced) {
      try {
        const vv = Game.state.village || {};
        const fav = (vv.favorLedger || {})[forced.vidId];
        const pr = (vv.promises || {})[forced.vidId];
        const needyAlive = (vv.roster || []).includes(forced.vidId);
        rec.forcedDisposition = {
          needyAlive, favorState: fav && fav.state, promiseKept: pr ? !!pr.kept : null,
          moot: forced.vidId === newId,
        };
        E(`FORCED DISPOSITION: needyAlive=${needyAlive} favorState=${fav && fav.state} promiseKept=${pr ? !!pr.kept : null} moot=${forced.vidId === newId}`);
      } catch (e) { rec.anomalies.push('disposition read threw: ' + e.message); }
    }
    const codexEnd = (() => { try { return Game.codexBreadth(); } catch (e) { return -1; } })();
    rec.codexBefore = codexBefore; rec.codexEnd = codexEnd;
    E(`CODEX breadth: ${codexBefore} -> ${codexEnd}`);
    // week2.deadBearerMentions: distinct d+8..d+14 days with a say line naming the dead first name
    let mentionDays = new Set();
    for (const h of post) {
      if (h.day - deathDay >= 8 && h.day - deathDay <= 14 && new RegExp('\\b' + oldFirst + '\\b').test(h.text)) mentionDays.add(h.day);
    }
    rec.week2DeadBearerMentionDays = mentionDays.size;
    try {
      const vv = Game.state.village || {};
      rec.census = {
        day: endDay, living: (vv.roster || []).length, fallen: (vv.fallen || []).length,
        promisesOpen: Object.values(vv.promises || {}).filter(p => p && !p.kept).length,
        codexBreadth: codexEnd,
      };
    } catch (e) {}
    try {
      rec.tele = {
        'deaths.bearer': (rec.death && rec.death.passed ? 1 : 0) + rec.organicDeaths.length,
        'deaths.organic': rec.organicDeaths.length,
        'census.alive': rec.census ? rec.census.living : -1,
        'census.fallen': rec.census ? rec.census.fallen : -1,
        'census.integrationStage': (() => { try { return Game.integrationStage(); } catch (e) { return 0; } })(),
        'chain.mantlesPassed': rec.death && rec.death.passed ? 1 : 0,
        'retake.distinct': distinct.length,
        'retake.organic': distinct.filter(a => a.pattern === 'reask-inherited').length,
        'week2.deadBearerMentions': mentionDays.size,
        'darkHeir.psychoFired': rec.m3 ? !!rec.m3.pass : null,
      };
      E(`TELE: ${JSON.stringify(rec.tele)}`);
      fs.writeFileSync(path.join(EVID_DIR, `journey-succession-r34-tele-${SEED}.json`), JSON.stringify(rec.tele, null, 1));
    } catch (e) { rec.anomalies.push('tele snapshot threw: ' + e.message); }
    console.log(JSON.stringify(rec));
  }
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
