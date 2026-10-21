#!/usr/bin/env node
// journey-succession-r36-20261021.js — SUCCESSION LEG r36: "THE FALL"
// Journey leg 7: death of the player character, the mantle passing, the new
// bearer's life. LANE B. Prior art: r26-r28 closes (fulfill loop proven),
// r29 3-death chains, r30 close replay, r31 office-ack, r32 funerals socially
// silent (standing design call), r33 successor's weeks (thread continuity +
// want-seed follow-ups), r34 open book in the wild + dark-heir canon proof +
// honest-moot fix, r35 THE SECOND FUNERAL (chain depth proven across two
// handoffs; second funeral reads heavier when trust earned it).
//
// LEG QUESTION (r36 pre-registered, MEASUREMENT.md §§9-12, 14): THE FALL.
// Every r-series death so far killed a THIN bearer (d10-14, 0-2 abilities) —
// the build gap was never measured. A competent bearer at d40 holds ~4-5
// earned System abilities (pilot seed 11101: green_thumb/lucky_rock d10,
// 3 by d20, 5 by d30, 4 by d41 after a swap). Steve's canon: "deaths hit
// hard." Steve 2026-10-14: "No I don't think you should take your XP or the
// abilities. You become that villager." (mantleBecome: scholar.abilities/
// tracks/levelUpQueue/deedDay/godhood/inventory/equipped REPLACED by the
// successor's own; integration, slots, Codex, ledger, trust stay with the
// office.) When a BUILT bearer dies, is the fall REAL (a measurable step
// down), HONEST (the fiction names the loss), SURVIVABLE (the heir can play
// on), and CLEAN (no ability/synergy/gear leak across)?
//
// PROFILE (seeds 11101-11104, fresh; pilot used 11101): competent throughout
// (build-seeking via normal play — the pilot proves 4-5 abilities by d40).
// Phase A d1-9. Build phase d10-40 + curious-driver (1 convo/2d, round-robin,
// never auto-commits). One forced favor+promise ~d36-40 through the REAL
// favor machinery (keepable kinds only, favor-action contract dedc46db7 —
// the DECISION is forced, the mechanism is real). Scripted kill ~d41 via the
// REAL playerDeath ('a hushwolf'). Heir plays 14d competent + curious driver.
// Death-aware: dead/scattered village stops (+10d tail).
//
// BINDING METRICS (§14):
//   M1: ≥3/4 mantles pass cleanly (new bearer, linOk, moOk). Kill rule:
//       fails on ≥2/4 → SUBSTRATE-MISSING.
//   M2 (no leak): on every passed death — 0 of the dead bearer's System-
//       ability ids appear in the heir's post-handoff slots; the heir's
//       ability id-set EQUALS the successor's pre-death npcAbilities id-set
//       (replacement is exact, not a merge); the heir's equipped keys EQUAL
//       the successor's own pre-death equipped keys (dead gear stays on the
//       corpse — Steve 2026-10-09). Any failure → REAL BUG (RED→GREEN proof).
//   M3 (the fall is real): on ≥3/4 seeds the dead bearer held ≥3 abilities
//       at death AND ≥1 of them died with them (not independently held by the
//       heir — overlap the heir earned themselves is theirs, not kept
//       inheritance). Kill rule for the finding: on ≥2/4 seeds the heir is
//       equal-or-stronger (lost nothing, count >= dead's) → death-is-cheap →
//       DESIGN BLANK for Steve, not re-scored.
//   M4 (fiction honesty): ≥1 handoff-window line naming the build change on
//       every seed (System "whole new set of tricks" line, "wake up somebody
//       else" + kit clause, "you're not X", Codex sync/journal line). A miss
//       → blank candidate (a line), documented not re-scored.
//   M5 (survivable): heir alive at +14d on ≥3/4 seeds, village alive.
//   M6: 0 identity failures across sense-read transcripts; named verdict on
//       whether the fall reads in the fiction (≥2 transcripts sense-read).
// INTERESTING-FINDING CRITERIA:
//   (a) leak across (ability/synergy/gear) → REAL BUG, link named.
//   (b) fall real + fiction names it + heir survives → PROVEN: deaths hit
//       hard mechanically for built players.
//   (c) heir equal-or-stronger → design blank: is death supposed to cost a
//       built player anything?
//   (d) fall real but fiction silent → blank to fill (a line candidate).
//
// HORIZON: ~55d/seed.
//
// Usage: SEED=11101 node scripts/journey-succession-r36-20261021.js
// Output: JSON record to stdout; narrative + census + transcripts to stderr.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '11101', 10);
const KILL = 'a hushwolf';
const BUILD_DAYS = 40;      // kill ~d41
const HEIR_DAYS = 14;
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
function abilIds(Game) {
  try { return (Game.state.scholar.abilities || []).map(a => (a && (a.evolvedFrom || a.id)) || '?'); } catch (e) { return []; }
}
function equippedKeys(Game, vid) {
  try {
    const rc = ((Game.state.village || {}).rosterChars || {})[vid];
    const eq = (vid === Game.villagerId) ? (Game.state.scholar.equipped || {}) : ((rc && rc.equipped) || {});
    return Object.keys(eq || {}).sort();
  } catch (e) { return []; }
}
function npcAbilIds(Game, vid) {
  try { return (((Game.state.village || {}).npcAbilities || {})[vid] || []).slice(); } catch (e) { return []; }
}
function invCount(Game) { try { return (Game.state.scholar.inventory || []).length; } catch (e) { return -1; } }
// (successor prediction now inline in main via topCands — trust may move
// between any earlier snapshot and the kill)

// Honest convo driver (r26/r28/r33/r34/r35, unchanged): curious-player
// stand-in, engages with offered wants, never auto-commits.
function driveConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 10;
  const out = [`## ${tag} — ${firstName(rawName(Game, vid))} on d${dayOf(Game)} (trust ${trustOf(Game, vid)})`];
  let refused = false, picked = [];
  try {
    const r = Game.startConvo(vid);
    if (r && (r.refused || r.ended)) refused = true;
  } catch (e) { return { text: out.join('\n') + ' (startConvo threw: ' + e.message + ')', refused: 'throw', flags: {} }; }
  const c0 = Game.convoGet(vid);
  if (refused || !c0 || !c0.active) {
    return { text: out.join('\n') + '\n(convo refused or never opened)', refused, flags: { want: (c0 && c0.want && c0.want.id) || 'none' } };
  }
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    const c = Game.convoGet(vid);
    const wantId = (c && c.want && c.want.id) || '';
    let pick = null;
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
    const cc = Game.convoGet(vid);
    if (!cc || !cc.active) { out.push('(conversation ended by the engine)'); break; }
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const cf = Game.convoGet(vid);
  const lines = [];
  for (const e2 of ((cf && cf.transcript) || [])) {
    lines.push(`${e2.who === 'you' ? 'YOU' : 'NPC'}: ${String(e2.text).slice(0, 500)}`);
  }
  out.push('\n### FULL TRANSCRIPT');
  out.push(lines.join('\n'));
  return { text: out.join('\n'), refused: false, flags: { want: (cf && cf.want && cf.want.id) || 'none' }, fullText: lines.join('\n') };
}

const rec = {
  seed: SEED, notes: [], anomalies: [],
  m1: null, m2: null, m3: null, m4: null, m5: null, m6: null,
  death: null, buildGap: null, fictionLines: [], heirAlive14: null,
  griefSignals: [], convoReads: [], convoLines: [],
  trustChain: [], census: null,
};

// Handoff-window fiction scan: lines naming the build change.
function fictionScan(sayLog, deathDay) {
  const out = [];
  const pats = [
    ['system-tricks', /whole new set of tricks/i],
    ['wake-else', /you wake up somebody else/i],
    ['kit-clause', /hands know different work/i],
    ['codex-page', /the codex turns a page/i],
    ['codex-sync', /syncing\. no pen|picks up the journal/i],
    ['youre-not-x', /you'?re not\s+(her|him|them|\w+)/i],
    ['vouch', /trusted them\. we saw it/i],
    ['fire-knew', /the fire knew .* before the codex|sold ground, earned/i],
    ['docket', /the sentence doesn'?t cross the grave/i],
    ['loss-named', /powers? (died|gone)|lost (his|her|their) (powers|abilities|tricks)|the old (build|kit|tricks)/i],
  ];
  for (const h of sayLog) {
    if (h.day < deathDay || h.day > deathDay + 3) continue;
    for (const [id, re] of pats) {
      if (re.test(h.text)) { out.push({ id, day: h.day, text: h.text.slice(0, 400) }); break; }
    }
  }
  return out;
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-r36', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;
  if (!fs.existsSync(EVID_DIR)) fs.mkdirSync(EVID_DIR, { recursive: true });

  const sayLog = [];
  const _say = Game.say;
  Game.say = function (t) {
    const s = String(t || '');
    sayLog.push({ day: dayOf(Game), text: s.slice(0, 600) });
    if (sayLog.length > SAY_CAP) sayLog.shift();
    return _say ? _say.call(this, t) : undefined;
  };

  let bearerChanges = 0;
  function watchBearer(tag, before) {
    const after = Game.villagerId;
    if (before !== after) {
      bearerChanges++;
      const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
      const mo = ((Game.state.village || {}).mantleOf || []);
      const lastLin = lin[lin.length - 1] || {};
      const lastMo = mo[mo.length - 1] || {};
      E(`\n!!!!! HANDOFF ${tag}: ${firstName(rawName(Game, before))} -> ${firstName(rawName(Game, after))} d${dayOf(Game)} (cause: ${lastLin.cause || '?'}) organic=${tag.startsWith('build') || tag.startsWith('heir')}`);
      rec.trustChain.push({ bearer: firstName(rawName(Game, after)), trust: Math.round(trustOf(Game, after)), organic: true, tag });
      return { after, linOk: !!(lastLin.cause && lastLin.villagerId === before), moOk: lastMo.from === before && lastMo.to === after, cause: lastLin.cause || '?' };
    }
    return { after, linOk: null, moOk: null, cause: null };
  }

  const talkedAt = {};
  const rosterOrder = [];
  async function driverDays(nDays, label, senseDays) {
    senseDays = senseDays || [];
    let wb = Game.villagerId;
    for (let d = 1; d <= nDays; d++) {
      if (Game.over) break;
      await runDays(Game, competent, { days: 1 });
      const w = watchBearer(`${label}-d+${d}`, wb);
      wb = w.after;
      if (Game.over) break;
      const curDay = dayOf(Game);
      const v = Game.state.village || {};
      const self = Game.villagerId;
      for (const id of (v.roster || [])) if (!rosterOrder.includes(id)) rosterOrder.push(id);
      const live = rosterOrder.filter(id => id !== self && (v.roster || []).includes(id));
      live.sort((a, b) => (talkedAt[a] || -99) - (talkedAt[b] || -99));
      if (d % 2 === 0 && live[0]) {
        const vid = live[0];
        talkedAt[vid] = curDay;
        try {
          const r = driveConvo(Game, vid, `${label} curious d+${d}`, 10);
          if (r.fullText) for (const ln of r.fullText.split('\n')) {
            if (/^NPC:/.test(ln)) rec.convoLines.push({ day: curDay, vid: firstName(rawName(Game, vid)), text: ln.replace(/^NPC:\s*/, '').slice(0, 600) });
          }
        } catch (e) { rec.anomalies.push(`${label} curious d+${d} threw: ` + e.message); }
      }
      if (senseDays.includes(d)) {
        try {
          const byTrust = (v.roster || []).filter(id => id !== self).sort((a, b) => trustOf(Game, b) - trustOf(Game, a));
          for (const vid of byTrust.slice(0, 2).filter(id => trustOf(Game, id) >= 15)) {
            const r = driveConvo(Game, vid, `${label} sense d+${d}`, 12);
            const fn = path.join(EVID_DIR, `journey-succession-r36-transcript-${SEED}-${label}-dplus${d}-${firstName(rawName(Game, vid))}.txt`);
            fs.writeFileSync(fn, r.text);
            rec.convoReads.push({ day: curDay, dplus: d, label, vid: firstName(rawName(Game, vid)), refused: r.refused, want: r.flags.want });
            if (r.fullText) for (const ln of r.fullText.split('\n')) {
              if (/^NPC:/.test(ln)) rec.convoLines.push({ day: curDay, vid: firstName(rawName(Game, vid)), text: ln.replace(/^NPC:\s*/, '').slice(0, 600) });
            }
            E(`  SENSE ${label} d+${d} with ${firstName(rawName(Game, vid))} (refused=${r.refused}, want=${r.flags.want})`);
          }
        } catch (e) { rec.anomalies.push(`${label} sense d+${d} threw: ` + e.message); }
      }
    }
  }

  // ---- phase A: 9 competent days ----
  {
    let wb = Game.villagerId;
    for (let d = 1; d <= 9; d++) {
      if (Game.over) break;
      await runDays(Game, competent, { days: 1 });
      const w = watchBearer('phase-A', wb); wb = w.after;
      if (Game.over) break;
    }
    if (Game.over) { rec.notes.push(`village over at d${dayOf(Game)} in phase A — seed skipped`); finish(); return; }
  }

  // ---- build phase: competent to ~d40 (abilities accrue via normal play) ----
  await driverDays(BUILD_DAYS - 9, 'build', []);
  if (Game.over) { rec.notes.push(`village over at d${dayOf(Game)} in build phase — seed skipped`); finish(); return; }

  // ---- pre-death snapshot (build state; successor snapshot moves to just
  // before the kill — trust moves during the forcing days) ----
  const oldId = Game.villagerId;
  const oldFirst = firstName(rawName(Game, oldId));
  const deadAbils = abilIds(Game);
  const deadAbilRaw = (() => { try { return (Game.state.scholar.abilities || []).map(a => (a && a.id) || '?'); } catch (e) { return []; } })();
  const deadEquipped = equippedKeys(Game, oldId);
  const deadInv = invCount(Game);
  let codexBefore = -1;
  try { codexBefore = Game.codexBreadth(); } catch (e) {}
  E(`\nPRE-DEATH d${dayOf(Game)}: ${oldFirst} abilities(${deadAbils.length})=[${deadAbils.join(',')}] equipped(${deadEquipped.length}) inv=${deadInv} codexBreadth=${codexBefore}`);

  // ---- forced favor+promise through the real machinery (open book) ----
  let forced = null;
  for (let f = 0; f < 4 && !forced && !Game.over; f++) {
    await runDays(Game, competent, { days: 1 });
    const v = Game.state.village || {};
    const self = Game.villagerId;
    if (self !== oldId) { rec.notes.push('organic handoff before forced promise — using organic death as the death'); break; }
    const cands = [];
    for (const vid of (v.roster || [])) {
      if (vid === self) continue;
      if (trustOf(Game, vid) < 30) continue;
      let need = null;
      try { need = Game.convoFindFavorNeed && Game.convoFindFavorNeed(vid); } catch (e) {}
      if (!need || !DIRECT_KEEP.has(need.kind) || !(need.urgency >= 4)) continue;
      cands.push({ vid, kind: need.kind, need });
    }
    cands.sort((a, b) =>
      (KIND_PREF.indexOf(a.kind) < 0 ? 99 : KIND_PREF.indexOf(a.kind)) - (KIND_PREF.indexOf(b.kind) < 0 ? 99 : KIND_PREF.indexOf(b.kind)) ||
      trustOf(Game, b.vid) - trustOf(Game, a.vid));
    if (cands.length) {
      const { vid, need } = cands[0];
      try {
        const favor = Game.convoBuildFavor(vid, need);
        if (favor) {
          Game.convoStoreFavor(favor);
          const cr = Game.convoFavorCommit(vid, favor);
          if (cr && cr.ok) { forced = { day: dayOf(Game), vid: firstName(rawName(Game, vid)), kind: favor.kind }; E(`FORCED COMMIT d${dayOf(Game)}: ${forced.vid} kind=${favor.kind}`); }
        }
      } catch (e) { E(`FORCE threw ${e.message}`); }
    }
  }
  if (!forced) rec.notes.push('forcing: no setup-eligible need in 4 days — no open promise at this death');

  // ---- successor snapshot: IMMEDIATELY before the kill (trust moved during
  // forcing days — the r36 pilot predicted Piper but the engine picked Lucas)
  // ----
  // Snapshot the top-3 trust candidates' own records pre-death (mantleBecome
  // DELETES the heir's npc records, so post-hoc lookup is impossible).
  // The pick is NOT pure trust: villager-agency.js wraps playerDeath and
  // grants min(12, floor(agencyScore/4)) trust to every living villager BEFORE
  // the trust-sorted pick ("the village's choice of successor naturally
  // favors the explorer who became someone"). The prediction replicates it.
  const topCands = (() => {
    try {
      const v = Game.state.village || {};
      const live = new Set(v.roster || []);
      const ids = (typeof Game.npcIds === 'function' ? Game.npcIds() : []).filter(id => id !== oldId && live.has(id));
      const trust = v.trust || {};
      const eff = {};
      for (const id of ids) {
        let bonus = 0;
        try { bonus = typeof Game.agencyScore === 'function' ? Math.min(12, Math.floor(Game.agencyScore(id) / 4)) : 0; } catch (e) {}
        eff[id] = (trust[id] || 0) + (bonus > 0 ? bonus : 0);
      }
      ids.sort((a, b) => (eff[b] || 0) - (eff[a] || 0));
      return ids.slice(0, 3).map(id => ({ id, first: firstName(rawName(Game, id)), trust: Math.round(trust[id] || 0), effTrust: Math.round(eff[id] || 0), abils: npcAbilIds(Game, id), equipped: equippedKeys(Game, id) }));
    } catch (e) { return []; }
  })();
  const succId = topCands.length ? topCands[0].id : null;
  const succFirst = succId ? topCands[0].first : '?';
  E(`SUCCESSOR CANDIDATES (pre-kill): ${topCands.map(c => `${c.first}(trust ${c.trust}->eff ${c.effTrust}, abils ${c.abils.length}=[${c.abils.join(',')}])`).join(' | ')}`);

  // ---- the kill: REAL playerDeath ----
  const trustBefore = trustOf(Game, oldId);
  Game.playerDeath(KILL);
  const newId = Game.villagerId;
  const newFirst = firstName(rawName(Game, newId));
  const deathDay = dayOf(Game);
  const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
  const lastLin = lin[lin.length - 1] || {};
  const mo = ((Game.state.village || {}).mantleOf || []);
  const lastMo = mo[mo.length - 1] || {};
  const passed = newId !== oldId && !Game.over && !Game.villageLost;
  const heirAbils = abilIds(Game);
  const heirEquipped = equippedKeys(Game, newId);
  const heirInv = invCount(Game);
  let codexAfter = -1;
  try { codexAfter = Game.codexBreadth(); } catch (e) {}
  const predHit = succId && newId === succId;
  // M2 leak checks (design rules, not exact-equality):
  //  (a) ability leak: any dead-bearer ability id on the heir that the ACTUAL
  //      heir did not hold pre-death (their own npcAbilities snapshot) → REAL
  //      BUG. Overlap the heir earned themselves is their own, not a leak.
  //  (b) exact replacement: heir's post-handoff raw ability ids == the actual
  //      heir's pre-death npcAbilities (mantleBecome maps each id 1:1).
  //  (c) gear: none of the dead bearer's equipped keys appear on the heir
  //      unless the heir already wore them pre-death (keepsake migration may
  //      ADD worn keepsakes — that is the successor's own, not the dead's).
  function heirAbilRaw() { try { return (Game.state.scholar.abilities || []).map(a => (a && a.id) || '?'); } catch (e) { return []; } }
  const heirRaw = heirAbilRaw();
  const heirPre = topCands.find(c => c.id === newId) || null;
  const heirOwnPre = heirPre ? heirPre.abils : [];
  const heirOwnGearPre = heirPre ? heirPre.equipped : [];
  const leak = deadAbilRaw.filter(id => heirRaw.includes(id) && !heirOwnPre.includes(id));
  const norm = arr => arr.slice().sort().join('|');
  const replExact = heirPre ? norm(heirRaw) === norm(heirOwnPre) : null;
  const gearLeak = deadEquipped.filter(k => heirEquipped.includes(k) && !heirOwnGearPre.includes(k));
  rec.death = {
    day: deathDay, cause: KILL, oldFirst, newFirst, predicted: succFirst, predHit,
    passed, linOk: !!(lastLin.cause && lastLin.villagerId === oldId), moOk: lastMo.from === oldId && lastMo.to === newId,
    trustBefore: Math.round(trustBefore), newTrust: Math.round(trustOf(Game, newId)),
    codexBefore, codexAfter,
  };
  rec.buildGap = {
    deadCount: deadAbils.length, deadIds: deadAbils, deadRawIds: deadAbilRaw,
    deadEquipped, deadInv,
    heirPreId: heirPre ? heirPre.id : null, heirPreFirst: heirPre ? heirPre.first : '?',
    heirOwnPreCount: heirOwnPre.length, heirOwnPreIds: heirOwnPre, heirOwnGearPre,
    heirCount: heirAbils.length, heirIds: heirAbils, heirRawIds: heirRaw, heirEquipped, heirInv,
    leak, replExact, gearLeak,
    lostAbilities: deadAbilRaw.filter(id => !heirOwnPre.includes(id)),
    keptOverlap: deadAbilRaw.filter(id => heirOwnPre.includes(id)),
    topCands: topCands.map(c => ({ first: c.first, trust: c.trust, effTrust: c.effTrust, abilCount: c.abils.length })),
  };
  rec.fictionLines = fictionScan(sayLog, deathDay);
  E(`\nDEATH d${deathDay} (${KILL}): ${oldFirst} -> ${newFirst} (predicted ${succFirst}: ${predHit ? 'HIT' : 'MISS'}) | passed=${passed} lin=${rec.death.linOk} mo=${rec.death.moOk}`);
  E(`GAP: dead(${deadAbils.length})=[${deadAbils.join(',')}] -> heir(${heirAbils.length})=[${heirAbils.join(',')}] heirOwnPre(${heirOwnPre.length}) lost=[${(rec.buildGap.lostAbilities || []).join(',')}] leak=[${leak.join(',')}] replExact=${replExact} gearLeak=[${gearLeak.join(',')}] predHit=${predHit}`);
  E(`FICTION (${rec.fictionLines.length} lines): ${rec.fictionLines.map(f => f.id).join(',')}`);
  if (!passed) { rec.notes.push(`mantle FAILED (over=${Game.over}, villageLost=${Game.villageLost})`); finish(); return; }

  // ---- heir's life: 14d competent + curious driver, sense reads d+3/+9/+14 ----
  await driverDays(HEIR_DAYS, 'heir', [3, 9, 14]);
  const heirAlive = !Game.over && (Game.state.village.roster || []).includes(newId);
  rec.heirAlive14 = heirAlive;
  const v = Game.state.village || {};
  rec.census = {
    day: dayOf(Game), alive: (v.roster || []).length,
    pantryKcal: (() => { try { return Math.round(Game.pantryKcal ? Game.pantryKcal() : -1); } catch (e) { return -1; } })(),
    heirTrust: Math.round(trustOf(Game, newId)),
  };
  let codexEnd = -1;
  try { codexEnd = Game.codexBreadth(); } catch (e) {}
  rec.census.codexBreadthEnd = codexEnd;
  E(`\nCENSUS d${rec.census.day}: alive=${rec.census.alive} pantry=${rec.census.pantryKcal} heirAlive=${heirAlive} heirTrust=${rec.census.heirTrust} codex ${codexBefore}->${codexAfter}->${codexEnd}`);

  finish();

  function finish() {
    // metrics
    const d = rec.death;
    rec.m1 = d ? (d.passed && d.linOk && d.moOk) : false;
    const g = rec.buildGap;
    rec.m2 = g ? (g.leak.length === 0 && g.replExact === true && g.gearLeak.length === 0) : false;
    // M3 (the fall is real): the dead bearer held ≥3 abilities and ≥1 of them
    // died with them (not independently held by the heir). Cheap-death kill
    // rule: lostAbilities empty AND heirCount >= deadCount → the heir is
    // equal-or-stronger → DESIGN BLANK (death costs a built player nothing).
    rec.m3 = g ? (g.deadCount >= 3 && g.lostAbilities.length >= 1) : false;
    rec.cheapDeath = g ? (g.lostAbilities.length === 0 && g.heirCount >= g.deadCount) : false;
    rec.m4 = rec.fictionLines.length > 0 && rec.fictionLines.some(f => /system-tricks|wake-else|kit-clause/.test(f.id));
    rec.m5 = rec.heirAlive14 === true;
    // M6 filled by hand in the run note (sense-read verdict).
    const tele = {
      seed: SEED, leg: 'succession', run: 'r36',
      deaths: { bearer: d ? 1 : 0 },
      census: { alive: rec.census ? rec.census.alive : -1 },
    };
    try { fs.writeFileSync(path.join(EVID_DIR, `journey-succession-r36-tele-${SEED}.json`), JSON.stringify(tele, null, 1)); } catch (e) {}
    console.log(JSON.stringify(rec, null, 1));
  }
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
