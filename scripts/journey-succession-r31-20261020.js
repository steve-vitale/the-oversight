#!/usr/bin/env node
// journey-succession-r31-20261020.js — SUCCESSION LEG r31: "THE NEW BEARER'S LIFE"
// Journey leg 7: death of the player character, the mantle passing, the new
// bearer's life. LANE B. Prior art this week: r29 (2026-10-19) proved the
// CHAIN machinery end to end (3 scripted deaths + organic, 4/4 GO); r30
// (2026-10-20, today) replayed the r27/r28 close on the tip (5/5 mantles,
// 3/3 closes with gratitude SPOKEN). What's never been assessed is the second
// half of the leg description: the new bearer's LIFE. After the dust settles,
// does the village treat the successor as the OFFICE — the scholar, the
// fire's hearing — or does the mantle fade into a name stamp on a handoff
// beat?
//
// LEG QUESTION (r31 pre-registered, MEASUREMENT.md §§9-12, 14): in the 35 days
// after a mid-run bearer death, is the office a living social reality? Does
// anyone acknowledge the new bearer AS bearer — inherited threads naming the
// predecessor, the open book, vouching, NPCs treating the player as the
// scholar — and do driven conversations stay identity-honest (no addressing
// the new face by the dead name, no fabricated shared history)?
//
// PROFILE: competent policy throughout. One scripted kill via the REAL
// playerDeath ('a hushwolf') at ~d13, after one forced favor+promise through
// the real favor machinery (r29 precedent; the decision is forced, the
// mechanism is real). Thread planted pre-death with a live villager
// (commitRule false — no promise); post-death the driver returns to that NPC
// and to a high-trust villager to sense-read office acknowledgment.
// Death-aware: dead/scattered village stops the run (+10d tail max).
//
// BINDING METRICS (MEASUREMENT.md §14):
//   M1: mantle passes on >=3/4 seeds (bearer <redacted>, linOk, moOk, game
//       continues to ~d48 or a death-aware stop). Kill rule: fails on >=2/4
//       -> SUBSTRATE-MISSING.
//   M2 (the office is a social reality): >=2/4 seeds show >=3 distinct
//       OFFICE-ACK moments in the 35 post-death days. An office-ack is any of:
//       (a) inherited-thread resume naming the predecessor ("You're wearing
//       X's shoes now", "X and I never did finish talking about");
//       (b) the open book naming the dead bearer's unkept promises;
//       (c) elders vouching at the grave;
//       (d) a driven-convo NPC treating the player as office-holder
//       ("scholar", "the office", "the fire's hearing", Codex reference).
//       Kill rule for the finding: <2/4 seeds meet it -> BLANK (the mantle
//       is invisible post-handoff — document, don't invent).
//   M3 (no theater): 0 fabricated-history lines in the post-inheritance
//       sense-read transcripts. Fabrication = the NPC claims shared history
//       with the NEW bearer <redacted> belongs to the predecessor.
//   M4 (identity honesty): 0 identity failures — the NPC never addresses the
//       new bearer <redacted> the dead bearer's name, and never acts as if the
//       death never happened.
// INTERESTING-FINDING CRITERIA:
//   (a) <2/4 seeds with >=3 office-acks -> BLANK: is the office a social
//       reality or a handoff ceremony? (document; not a game bug claim)
//   (b) identity failures -> REAL BUG.
//   (c) Codex breadth drops post-death or Codex beats stop for the new
//       bearer -> REAL BUG (the Codex spans the village, not the individual).
//   (d) fabrications -> REAL BUG.
//
// SEEDS: 9601-9604 (fresh; r30 used 9501-9505 today). Policy: competent.
// ORCHESTRATE=1 always (documented).
// HORIZON: phase A d1-9, force+kill ~d10-13, post-death +35d, end ~d48.
//
// Usage: SEED=9601 node scripts/journey-succession-r31-20261020.js
// Output: JSON record to stdout; narrative + transcripts to stderr.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '9601', 10);
const KILL_CAUSE = 'a hushwolf';
const POST_DAYS = 35;
const EVID_DIR = path.join(ROOT, 'evidence', '2026-10-20');
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
  try { const p = ((Game.state.village || {}).promises || {})[vid]; return (p && !p.kept) ? p : null; } catch (e) { return null; }
}

// Honest convo driver (r26/r28/r29/r30, verbatim): used ONLY to plant threads
// and to sense-read post-death continuity. commitRule is always false here —
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

// Office-ack patterns against a say line.
const ACK_PATTERNS = [
  { id: 'inherited-thread', re: /You're wearing .*?'s shoes now/ },
  { id: 'inherited-thread-resume', re: /never did finish talking about|never finished talking about/ },
  { id: 'open-book', re: /book stays open on the table/ },
  { id: 'vouch-grave', re: /At the grave, .* speak/ },
  { id: 'fire-knew', re: /The fire knew .* before the Codex|solid ground, earned at this fire/ },
  { id: 'successor-grief', re: /You knew .* — not the office, the person/ },
  { id: 'youre-not', re: /You're not .*?\.\s*No heat in it/ },
  { id: 'docket', re: /The village's quarrel was with .* — and .* is dead/ },
];

const rec = {
  seed: SEED, notes: [], anomalies: [],
  m1: null, m2: null, m3: null, m4: null,
  death: null, organicDeaths: [],
  officeAcks: [], convoReads: [],
  trustChain: [], census: null,
};

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-r31', fullTelemetry: true });
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

  // ---- force one promise, then kill the bearer ----
  const f = await forcePromise(Game, E, watchBearer);
  rec.forced = f.forced ? { ...f.forced, vid: firstName(rawName(Game, f.forced.vid)) } : null;
  for (const n of f.notes) rec.notes.push(n);
  if (Game.over) { rec.notes.push('village over before the kill — run stops'); finish(); return; }

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
    codexBefore, forced: rec.forced,
  };
  rec.trustChain.push({ bearer: newFirst, trust: Math.round(newTrust) });
  E(`\nDEATH d${deathDay} (${KILL_CAUSE}): ${oldFirst} -> ${newFirst} | passed=${passed} lin=${rec.death.linOk} mantleOf=${rec.death.moOk} trust ${Math.round(trustBefore)} -> ${Math.round(newTrust)} codexBreadth=${codexBefore}`);
  if (!passed) { rec.notes.push(`mantle FAILED (over=${Game.over}, villageLost=${Game.villageLost})`); rec.m1 = false; finish(); return; }

  // ---- the new bearer's life: 35 days ----
  let wb = newId;
  for (let d = 1; d <= POST_DAYS; d++) {
    if (Game.over) break;
    await runDays(Game, competent, { days: 1 });
    wb = watchBearer(`post-d+${d}`, wb);
    if (Game.over) break;
    const curDay = dayOf(Game);
    const daysSince = curDay - deathDay;
    if ([7, 14, 21, 28, 35].includes(daysSince)) {
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
          const r = driveConvo(Game, vid, `post-d+${daysSince} office-check d${curDay}`, () => false, 12);
          const fn = path.join(EVID_DIR, `journey-succession-r31-transcript-${SEED}-dplus${daysSince}-${firstName(rawName(Game, vid))}.txt`);
          fs.writeFileSync(fn, r.text);
          rec.convoReads.push({ day: curDay, dplus: daysSince, vid: firstName(rawName(Game, vid)), refused: r.refused, want: r.flags.want });
          E(`  CONVO d+${daysSince} with ${firstName(rawName(Game, vid))} (refused=${r.refused}, want=${r.flags.want})`);
        } catch (e) { rec.anomalies.push(`office-check convo d+${daysSince} threw: ` + e.message); }
      }
    }
  }
  const endDay = dayOf(Game);
  E(`POST-DEATH: ran to d${endDay} (${endDay - deathDay} days after death); organic handoffs since: ${rec.organicDeaths.length}`);

  finish();

  function finish() {
    Game.say = _say;
    capturing = false;
    // ---- office-ack scan: post-death say log ----
    const post = sayLog.slice(handoffStart);
    const acks = [];
    for (const h of post) {
      for (const p of ACK_PATTERNS) {
        if (p.re.test(h.text)) {
          acks.push({ day: h.day, pattern: p.id, text: h.text.slice(0, 280) });
          break;
        }
      }
    }
    // dedupe: same pattern within 2 days counts once (beat spam guard)
    const distinct = [];
    for (const a of acks) {
      if (!distinct.some(d => d.pattern === a.pattern && Math.abs(d.day - a.day) <= 2)) distinct.push(a);
    }
    rec.officeAcks = distinct;
    E(`\nOFFICE-ACKS (post-death, distinct): ${distinct.length}`);
    for (const a of distinct.slice(0, 20)) E(`  d${a.day} [${a.pattern}] ${a.text.slice(0, 140)}`);
    const codexEnd = (() => { try { return Game.codexBreadth(); } catch (e) { return -1; } })();
    rec.codexBefore = codexBefore; rec.codexEnd = codexEnd;
    E(`CODEX breadth: ${codexBefore} -> ${codexEnd}`);
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
        'deaths.bearer': 1 + rec.organicDeaths.length,
        'deaths.organic': rec.organicDeaths.length,
        'census.alive': rec.census ? rec.census.living : -1,
        'census.fallen': rec.census ? rec.census.fallen : -1,
        'census.integrationStage': (() => { try { return Game.integrationStage(); } catch (e) { return 0; } })(),
        'chain.mantlesPassed': rec.death && rec.death.passed ? 1 : 0,
        'office.acksDistinct': distinct.length,
        'office.convoReads': rec.convoReads.length,
      };
      E(`TELE: ${JSON.stringify(rec.tele)}`);
      fs.writeFileSync(path.join(EVID_DIR, `journey-succession-r31-tele-${SEED}.json`), JSON.stringify(rec.tele, null, 1));
    } catch (e) { rec.anomalies.push('tele snapshot threw: ' + e.message); }
    console.log(JSON.stringify(rec));
  }
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
