#!/usr/bin/env node
// journey-succession-r35-20261021.js — SUCCESSION LEG r35: "THE SECOND FUNERAL"
// Journey leg 7: death of the player character, the mantle passing, the new
// bearer's life. LANE B. Prior art: r26-r28 closes (fulfill loop proven),
// r29 3-death chains (mechanics), r30 close replay, r31 office-ack blank,
// r32 funerals socially silent (standing design call), r33 successor's weeks
// (office-ack lives in thread continuity + want-seed follow-ups), r34 open
// book in the wild (Q1) + dark-heir canon proof (Q2), honest-moot fix.
//
// LEG QUESTION (r35 pre-registered, MEASUREMENT.md §§9-12, 14): THE SECOND
// FUNERAL. Nobody has played THROUGH two handoffs in one run and sense-read
// the second one. Steve's rule: death hits hard; a village burying two
// scholars in three weeks should not read the same as burying one. Does the
// machinery hold across two handoffs (lineage, open-book, handoff ceremony,
// favor inheritance — no zombie compounding, no wrong-name inheritances),
// and does the second death read as a heavier blow than the first (grief
// arcs for two predecessors, office continuity) — or is it socially
// identical (design blank: heavier-blow weight not voiced — Steve's call,
// not a bug)?
//
// PROFILE (seeds 10101-10104, fresh; earlier runs used 5101-5105, 8101-8105,
// 8201-8205, 9601-9604, 9801-9804, 9901-9905): competent policy throughout.
// Phase A d1-9. One forced favor+promise through the REAL favor machinery
// ~d10-13 (r29 precedent; the DECISION is forced, the mechanism is real;
// keepable kinds only: food/wound/illness/water/company — favor-action
// contract dedc46db7). Scripted kill #1 ~d13 via the REAL playerDeath
// ('a hushwolf'). Bearer #2 plays 9d competent + curious-driver (1 convo/2d,
// round-robin, never auto-commits). Forced favor+promise ~d20-23 again.
// Scripted kill #2 ~d23 via the REAL playerDeath ('a Highbeam deer' —
// distinct cause, tests lineage cause fidelity). Bearer #3 plays 14d
// competent + driver. Death-aware: dead/scattered village stops (+10d tail).
//
// BINDING METRICS (§14):
//   M1: ≥7/8 mantles pass cleanly (new bearer, linOk, moOk, game continues).
//       Kill rule: fails on ≥2/8 → SUBSTRATE-MISSING.
//   M2: ≥6/8 deaths show ≥1 grief signal in the 14d post-death window
//       (funeral/burial say-lines, open-book line, 'you're not X' beat,
//       NPC line naming the dead + gone/dead/miss/buried/lost — lineage
//       entries alone do NOT count). Kill rule for the finding: 0/8 on
//       death #2 specifically → death-2 socially silent → REAL blank,
//       cause class named (not re-scored).
//   M3: 0 name/compounding bugs: lineage entries name the correct
//       predecessor with the correct cause; inherited-favor/open-book lines
//       in each death window name THAT death's bearer, never the other;
//       no favor/promise zombies carrying a stale dead promiser. Any failure
//       → REAL BUG (RED→GREEN proof test).
//   M4: ≥2 transcripts around death #2 sense-read; named verdict: does the
//       second funeral read heavier/different? "Reads identical" is an
//       honest GO answer with a design-blank flag — not re-scored.
// INTERESTING-FINDING CRITERIA:
//   (a) death-2 machinery degrades (wrong names, silent second death,
//       zombie compounding) → REAL BUG, link named.
//   (b) all clean + second funeral reads heavier → chain depth proven.
//   (c) village scatters after 2 deaths → emergent finding (canon: "the run
//       gets interesting"), documented.
//   (d) second funeral reads identical to first → design blank for Steve:
//       is burying two scholars in three weeks supposed to weigh more?
//
// HORIZON: ~50d/seed. Post-death honesty rules from r34 do NOT apply to the
// forced promises here (no fulfill is being closed — the question is the
// handoff and its social weight, not the promise loop).
//
// Usage: SEED=10101 node scripts/journey-succession-r35-20261021.js
// Output: JSON record to stdout; narrative + census + transcripts to stderr.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '10101', 10);
const KILL1 = 'a hushwolf';
const KILL2 = 'a Highbeam deer';
const EVID_DIR = path.join(ROOT, 'evidence', '2026-10-21');
const DIRECT_KEEP = new Set(['food_share', 'heal_help', 'sick_help', 'water_haul', 'stay_close']);
const KIND_PREF = ['heal_help', 'sick_help', 'food_share', 'water_haul', 'stay_close'];
const SAY_CAP = 12000;

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

// Honest convo driver (r26/r28/r33/r34, unchanged): curious-player stand-in,
// engages with offered wants, never auto-commits.
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

const rec = {
  seed: SEED, notes: [], anomalies: [],
  m1: null, m2: null, m3: null, m4: null,
  deaths: [], organicDeaths: [],
  griefSignals: [], convoReads: [], convoLines: [],
  trustChain: [], census: null,
};

// Grief-signal scan over a death's window. When two deaths are close, the
// earlier death's window ENDS the day before the next death — lines after
// that belong to the later death's jurisdiction.
function griefSignalsFor(death, sayLog, convoLines, nextDeathDay) {
  const start = death.day;
  const end = Math.min(death.day + 14, nextDeathDay ? nextDeathDay - 1 : death.day + 14);
  const out = [];
  const seen = new Set();
  const add = (id, day, text) => {
    const key = id + '|' + text.slice(0, 60);
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ id, day, text: text.slice(0, 300) });
  };
  const nameRe = new RegExp(death.oldFirst.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const notYouRe = new RegExp("you'?re not\\s+(?:" + death.oldFirst.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '|her|him|she|he)', 'i');
  for (const h of sayLog) {
    if (h.day < start || h.day > end) continue;
    const t = h.text;
    if (/funeral|burial|laid .* rest|ashes to|dug the grave|the grave/i.test(t)) add('funeral-line', h.day, t);
    if (/mourning/i.test(t)) add('mourning', h.day, t);
    if (/book stays open on the table/i.test(t)) add('open-book', h.day, t);
    if (notYouRe.test(t)) add('youre-not-x', h.day, t);
    if (/I asked .*? about .*? — .*?'s gone/i.test(t) && nameRe.test(t)) add('reask-inherited', h.day, t);
  }
  for (const ln of convoLines) {
    if (ln.day < start || ln.day > end) continue;
    if (nameRe.test(ln.text) && /gone|dead|died|miss|buried|lost|killed/i.test(ln.text)) add('npc-grief-name', ln.day, `${ln.vid}: ${ln.text}`);
  }
  return out;
}

// M3: name/compounding audit. Correct semantics: every handoff/funeral /
// open-book / "you're not X" line belongs to the most recent death at or
// before its day, and must name THAT bearer — never the other. Overlapping
// windows are resolved by jurisdiction, not by exclusion.
function auditNames(deaths, sayLog, convoLines) {
  const fails = [];
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const relevant = /I asked .*? about .*? — .*?'s gone|book stays open on the table|laid .* rest|funeral|burial/i;
  for (const h of sayLog) {
    if (!relevant.test(h.text)) continue;
    // most recent death at or before this line's day
    let owner = null;
    for (const d of deaths) if (d.day <= h.day && (!owner || d.day > owner.day)) owner = d;
    if (!owner) continue;
    const ownerRe = new RegExp(esc(owner.oldFirst), 'i');
    const other = deaths.find(d => d !== owner);
    const namesOwner = ownerRe.test(h.text);
    const namesOther = other && new RegExp(esc(other.oldFirst), 'i').test(h.text);
    if (!namesOwner && namesOther) {
      fails.push({ id: 'wrong-dead-named', day: h.day, text: h.text.slice(0, 300), ownerDeathDay: owner.day });
    }
  }
  return fails;
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-r35', fullTelemetry: true });
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
    if (Game.over) { rec.notes.push(`village over at d${dayOf(Game)} before kill #1 — seed skipped`); finish(); return; }
  }

  // ---- curious-driver post phase helper ----
  const talkedAt = {};
  const rosterOrder = [];
  async function driverDays(nDays, label, senseDays) {
    let wb = Game.villagerId;
    for (let d = 1; d <= nDays; d++) {
      if (Game.over) break;
      await runDays(Game, competent, { days: 1 });
      wb = watchBearer(`${label}-d+${d}`, wb);
      if (Game.over) break;
      const curDay = dayOf(Game);
      const v = Game.state.village || {};
      const self = Game.villagerId;
      for (const id of (v.roster || [])) if (!rosterOrder.includes(id)) rosterOrder.push(id);
      const pickCurious = () => {
        const live = rosterOrder.filter(id => id !== self && (v.roster || []).includes(id));
        live.sort((a, b) => (talkedAt[a] || -99) - (talkedAt[b] || -99));
        return live[0] || null;
      };
      if (d % 2 === 0) {
        const vid = pickCurious();
        if (vid) {
          talkedAt[vid] = curDay;
          try {
            const r = driveConvo(Game, vid, `${label} curious d+${d}`, () => false, 10);
            if (r.fullText) for (const ln of r.fullText.split('\n')) {
              if (/^NPC:/.test(ln)) rec.convoLines.push({ day: curDay, vid: firstName(rawName(Game, vid)), text: ln.replace(/^NPC:\s*/, '').slice(0, 600) });
            }
            E(`  CURIOUS ${label} d+${d} with ${firstName(rawName(Game, vid))} (refused=${r.refused}, want=${r.flags.want})`);
          } catch (e) { rec.anomalies.push(`${label} curious d+${d} threw: ` + e.message); }
        }
      }
      if (senseDays.includes(d)) {
        const cands = [];
        try {
          const byTrust = (v.roster || []).filter(id => id !== self).sort((a, b) => trustOf(Game, b) - trustOf(Game, a));
          for (const id of byTrust.slice(0, 2)) if (trustOf(Game, id) >= 15) cands.push(id);
        } catch (e) {}
        for (const vid of cands) {
          try {
            const r = driveConvo(Game, vid, `${label} sense d+${d}`, () => false, 12);
            const fn = path.join(EVID_DIR, `journey-succession-r35-transcript-${SEED}-${label}-dplus${d}-${firstName(rawName(Game, vid))}.txt`);
            fs.writeFileSync(fn, r.text);
            rec.convoReads.push({ day: curDay, dplus: d, label, vid: firstName(rawName(Game, vid)), refused: r.refused, want: r.flags.want });
            if (r.fullText) for (const ln of r.fullText.split('\n')) {
              if (/^NPC:/.test(ln)) rec.convoLines.push({ day: curDay, vid: firstName(rawName(Game, vid)), text: ln.replace(/^NPC:\s*/, '').slice(0, 600) });
            }
            E(`  SENSE ${label} d+${d} with ${firstName(rawName(Game, vid))} (refused=${r.refused}, want=${r.flags.want})`);
          } catch (e) { rec.anomalies.push(`${label} sense d+${d} threw: ` + e.message); }
        }
      }
    }
  }

  function killBearer(cause) {
    const oldId = Game.villagerId;
    const oldName = rawName(Game, oldId);
    const oldFirst = firstName(oldName);
    const trustBefore = trustOf(Game, oldId);
    const codexBefore = (() => { try { return Game.codexBreadth(); } catch (e) { return -1; } })();
    Game.playerDeath(cause);
    const newId = Game.villagerId;
    const newFirst = firstName(rawName(Game, newId));
    const newTrust = trustOf(Game, newId);
    const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
    const lastLin = lin[lin.length - 1] || {};
    const mo = ((Game.state.village || {}).mantleOf || []);
    const lastMo = mo[mo.length - 1] || {};
    const passed = newId !== oldId && !Game.over && !Game.villageLost;
    const deathDay = dayOf(Game);
    const d = {
      day: deathDay, cause, oldFirst, newFirst,
      trustBefore: Math.round(trustBefore), newTrust: Math.round(newTrust),
      passed, linOk: !!(lastLin.cause && lastLin.villagerId === oldId),
      moOk: lastMo.from === oldId && lastMo.to === newId,
      linCause: lastLin.cause || null,
      codexBefore,
    };
    rec.deaths.push(d);
    rec.trustChain.push({ bearer: newFirst, trust: Math.round(newTrust) });
    E(`\nDEATH d${deathDay} (${cause}): ${oldFirst} -> ${newFirst} | passed=${passed} lin=${d.linOk} (linCause='${d.linCause}') mantleOf=${d.moOk} trust ${Math.round(trustBefore)} -> ${Math.round(newTrust)} codexBreadth=${codexBefore}`);
    return d;
  }

  // ---- kill #1 ----
  const f1 = await forcePromise(Game, E, watchBearer);
  rec.forced1 = f1.forced ? { ...f1.forced, vid: firstName(rawName(Game, f1.forced.vid)) } : null;
  for (const n of f1.notes) rec.notes.push(n);
  if (Game.over) { rec.notes.push('village over before kill #1 — run stops'); finish(); return; }
  const d1 = killBearer(KILL1);
  if (!d1.passed) { rec.notes.push(`mantle #1 FAILED (over=${Game.over}, villageLost=${Game.villageLost})`); finish(); return; }
  await driverDays(9, 'post1', [3, 9]);

  // ---- kill #2 (as bearer #2) ----
  const f2 = await forcePromise(Game, E, watchBearer);
  rec.forced2 = f2.forced ? { ...f2.forced, vid: firstName(rawName(Game, f2.forced.vid)) } : null;
  for (const n of f2.notes) rec.notes.push(n);
  if (Game.over) { rec.notes.push('village over before kill #2 — run stops (death #1 machinery already banked)'); finish(); return; }
  const d2 = killBearer(KILL2);
  if (!d2.passed) { rec.notes.push(`mantle #2 FAILED (over=${Game.over}, villageLost=${Game.villageLost})`); finish(); return; }
  await driverDays(14, 'post2', [3, 7, 14]);

  finish();

  function finish() {
    Game.say = _say;
    capturing = false;

    // ---- grief + name audits ----
    const codexEnd = (() => { try { return Game.codexBreadth(); } catch (e) { return -1; } })();
    const daysSorted = rec.deaths.map(d => d.day).sort((a, b) => a - b);
    for (const d of rec.deaths) {
      const idx = daysSorted.indexOf(d.day);
      const nextDay = idx >= 0 && idx < daysSorted.length - 1 ? daysSorted[idx + 1] : null;
      d.griefSignals = griefSignalsFor(d, sayLog, rec.convoLines, nextDay);
      d.griefCount = d.griefSignals.length;
      E(`\nGRIEF d${d.day} (${d.oldFirst}): ${d.griefSignals.length} signals`);
      for (const s of d.griefSignals.slice(0, 12)) E(`   [${s.id} d${s.day}] ${s.text.slice(0, 140)}`);
    }
    const nameFails = auditNames(rec.deaths, sayLog, rec.convoLines);
    for (const f of nameFails) rec.anomalies.push(`NAME-FAIL (death@${f.ownerDeathDay}): ${f.id} d${f.day}: ${f.text.slice(0,120)}`);
    // zombie scan: unkept promises/favors still referencing any dead bearer
      try {
        const v = Game.state.village || {};
        const deadNames = new Set(rec.deaths.map(d => d.oldFirst));
        const proms = v.promises || {};
        for (const [vid, p] of Object.entries(proms)) {
          if (p && !p.kept) {
            const blob = JSON.stringify(p).slice(0, 400);
            for (const dn of deadNames) {
              if (new RegExp(dn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(blob)) {
                rec.anomalies.push(`ZOMBIE-PROMISE? vid=${vid} references dead '${dn}': ${blob.slice(0, 120)}`);
              }
            }
          }
        }
      } catch (e) { rec.anomalies.push('zombie scan threw: ' + e.message); }

    // ---- census ----
    try {
      const v = Game.state.village || {};
      const roster = v.roster || [];
      rec.census = {
        day: dayOf(Game), living: roster.length,
        pantry: Math.round((v.pantry && v.pantry.kcal) || 0),
        over: !!Game.over, villageLost: !!Game.villageLost,
        codexStart: rec.deaths.length ? rec.deaths[0].codexBefore : -1, codexEnd,
        organicDeaths: rec.organicDeaths.length,
        lineage: (typeof Game.lineage === 'function' ? Game.lineage() : []).map(l => ({ n: firstName(l.name || l.villagerId), cause: l.cause })),
      };
    } catch (e) { rec.census = { error: e.message }; }
    E(`\nCENSUS d${rec.census.day}: living=${rec.census.living} pantry=${rec.census.pantry} codex ${rec.census.codexStart}->${rec.census.codexEnd} over=${rec.census.over}`);

    // ---- M tallies ----
    const cleanDeaths = rec.deaths.filter(d => d.passed && d.linOk && d.moOk).length;
    rec.m1 = { clean: cleanDeaths, total: rec.deaths.length, pass: cleanDeaths >= 7 };
    const griefed = rec.deaths.filter(d => d.griefCount >= 1).length;
    rec.m2 = { griefed, total: rec.deaths.length, pass: griefed >= 6 };
    const codexDropped = rec.census.codexStart >= 0 && rec.census.codexEnd >= 0 && rec.census.codexEnd < rec.census.codexStart;
    rec.m3 = { nameFails: nameFails.length, codexDropped, pass: nameFails.length === 0 && !codexDropped };
    rec.m4 = { reads: rec.convoReads.length, pass: rec.convoReads.filter(r => r.label === 'post2').length >= 2 };
    E(`\nMETRICS seed ${SEED}: M1=${cleanDeaths}/${rec.deaths.length} M2=${griefed}/${rec.deaths.length} M3 nameFails=${nameFails} codexDrop=${codexDropped} M4 post2reads=${rec.convoReads.filter(r => r.label === 'post2').length}`);
    E(`ANOMALIES: ${rec.anomalies.length}`);
    for (const a of rec.anomalies.slice(0, 20)) E(`  ! ${a.slice(0, 200)}`);

    // Save per-seed telemetry JSON for the telemetry check.
    try {
      fs.writeFileSync(path.join(EVID_DIR, `journey-succession-r35-seed-${SEED}.json`),
        JSON.stringify({
          seed: SEED,
          deaths: rec.deaths.map(d => ({ day: d.day, cause: d.cause, old: d.oldFirst, nw: d.newFirst, clean: d.passed && d.linOk && d.moOk, grief: d.griefCount, griefIds: (d.griefSignals || []).map(s => s.id) })),
          organicDeaths: rec.organicDeaths.length,
          census: rec.census,
          m1: rec.m1, m2: rec.m2, m3: rec.m3, m4: rec.m4,
          anomalies: rec.anomalies,
        }, null, 1));
    } catch (e) { E('tele save threw: ' + e.message); }

    console.log(JSON.stringify(rec));
  }
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
