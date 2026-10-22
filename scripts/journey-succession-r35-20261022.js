#!/usr/bin/env node
// journey-succession-r35-20261022.js — SUCCESSION LEG r35: "THE SUCCESSOR'S OWN LIFE"
// Journey leg 7: death of the player character, the mantle passing, the new
// bearer's life. LANE B.
//
// LEG QUESTION (pre-registered, MEASUREMENT.md §§9-12, 14): r34 proved the
// handoff MACHINERY passes clean (promises released, codex persists, identity
// holds, 4/4 mantles). Now the player-facing question: is the successor's own
// life worth playing? After the +21d horizon where r34 stopped, does the
// second life become its OWN story — new promises, new bonds, an advancing
// arc — or does it coast on the predecessor's engine while the social fabric
// keeps orbiting the dead?
//
// PROFILE: competent policy throughout. Scripted kill via the REAL playerDeath
// ('a hushwolf') ~d13 (after a 9-day phase A). Post-death: 45 days of REAL
// competent play as the successor + sense-read convos at d+28/d+35/d+45.
// Death-aware: dead/scattered village stops the run (+10d tail max).
//
// BINDING METRICS (§14):
//   M1: >=3/4 scripted mantles pass (newId != oldId, linOk, moOk).
//       Kill rule: >=2/4 fail -> SUBSTRATE-MISSING, abort.
//   M2 (own story): on >=3/4 seeds, post-death the scripted successor
//       accumulates >=1 of: (a) a promise THEY made (maker===newId,
//       day>deathDay) that is kept or still open at end; (b) a NEW bond
//       involving them (bond day>deathDay) or a DEEPENED pre-existing bond
//       (depth increase post-death). Zero of both = the successor is
//       socially dead.
//   M3 (arc continuity): progState arc at d+45 >= arc at death-day on
//       >=3/4 seeds (the office never regresses under a new face).
//   M4 (the village holds): on >=3/4 seeds, village alive at d+45 with >=3
//       living villagers AND successor trust at end-of-tenure >= trust at
//       death (non-negative trend; tenure-aware if an organic second death
//       ends their run).
//   M5 (people check): 0 identity failures across the sense-read
//       transcripts (manual verdict per SENSE-TESTING LAW).
//
// INTERESTING-FINDING CRITERIA:
//   (a) second-life stall: codex breadth flat AND no new bonds AND no kept
//       promises in d+21..d+45 -> REAL content blank (fix if small, else file).
//   (b) M3 miss while the village thrives -> office/business mismatch BUG.
//   (c) social fabric still orbiting the dead at the d+35/d+45 reads ->
//       design note for Steve.
// SEEDS: 9901-9904 (same as r34: deterministic reproduction of the pre-death
// trajectory under the merged base + extension to d+45). Policy: competent.
// HORIZON: phase A d1-9, kill ~d13, post-death +45d (~d58).
// Usage: SEED=9901 node scripts/journey-succession-r35-20261022.js
// Output: JSON record to stdout; narrative + transcripts to stderr.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '9901', 10);
const KILL_CAUSE = 'a hushwolf';
const POST_DAYS = 45;
const EVID_DIR = path.join(ROOT, 'evidence', '2026-10-22');
const SAY_CAP = 12000;
const CONVO_DAYS = [28, 35, 45];

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) return ch.name; } catch (e) {}
  return String(vid).slice(0, 12);
}
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function trustOf(Game, vid) { try { return ((Game.state.village || {}).trust || {})[vid] || 0; } catch (e) { return 0; } }
function livingRoster(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => {
    try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; }
  });
}
function codexBreadth(Game) { try { return Game.codexBreadth(); } catch (e) { return -1; } }
function arcOf(Game) { try { return (Game.progState ? Game.progState() : {}).arc || 0; } catch (e) { return -1; } }
// All bonds touching vid: [{other, v, depth, day}]
function bondsOf(Game, vid) {
  const out = [];
  try {
    const bonds = ((Game.state || {}).village || {}).bonds || {};
    for (const [k, b] of Object.entries(bonds)) {
      const parts = k.split('|');
      if (parts.length !== 2) continue;
      if (parts[0] === vid || parts[1] === vid) {
        out.push({ other: parts[0] === vid ? parts[1] : parts[0], v: (b || {}).v || 0, depth: (b || {}).depth || 0, day: (b || {}).day || 0 });
      }
    }
  } catch (e) {}
  return out;
}
// Promises made BY maker: [{vid, day, kept, goal}]
function promisesBy(Game, maker) {
  const out = [];
  try {
    const pr = ((Game.state || {}).village || {}).promises || {};
    for (const [vid, p] of Object.entries(pr)) {
      if ((p || {}).maker === maker) out.push({ vid, day: (p || {}).day || 0, kept: !!(p || {}).kept, goal: (p || {}).goal || '' });
    }
  } catch (e) {}
  return out;
}
// Honest convo driver (r26/r28/r29/r30/r33/r34, verbatim): sense-read only,
// never commits to promises.
function driveConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 14;
  const out = [`## ${tag} — ${firstName(rawName(Game, vid))} on d${dayOf(Game)} (trust ${trustOf(Game, vid)})`];
  let refused = false;
  const picked = [];
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
    let pick = choices.find(x => /^want:/.test(x.id) && !/favor/i.test(x.text || ''));
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
  const txt = lines.join('\n');
  out.push('\n### FULL TRANSCRIPT');
  out.push(lines.join('\n'));
  return { text: out.join('\n'), refused: false, flags: { want: (cf && cf.want && cf.want.id) || 'none' }, fullText: txt };
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-r35', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;
  if (!fs.existsSync(EVID_DIR)) fs.mkdirSync(EVID_DIR, { recursive: true });
  const rec = {
    seed: SEED, mode: 'succession-r35', notes: [], anomalies: [],
    organicDeaths: [], trustChain: [], audits: [], convoReads: [], convoLines: [],
    ledger: [], identityTrips: [],
  };

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

  // ---- scripted kill via the REAL playerDeath (NO_KILL=1: counterfactual,
  // no death — the original bearer keeps playing; instruments still run) ----
  const NO_KILL = process.env.NO_KILL === '1';
  const oldId = Game.villagerId;
  const oldName = rawName(Game, oldId);
  const oldFirst = firstName(oldName);
  const handoffStart = sayLog.length;
  const preBonds = bondsOf(Game, oldId);
  if (!NO_KILL) Game.playerDeath(KILL_CAUSE);
  const newId = Game.villagerId;
  const newName = rawName(Game, newId);
  const newFirst = firstName(newName);
  const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
  const lastLin = lin[lin.length - 1] || {};
  const mo = ((Game.state.village || {}).mantleOf || []);
  const lastMo = mo[mo.length - 1] || {};
  const passed = newId !== oldId && !Game.over && !Game.villageLost;
  const deathDay = dayOf(Game);
  const deathSnap = {
    day: deathDay, breadth: codexBreadth(Game), arc: arcOf(Game),
    trust: Math.round(trustOf(Game, newId)),
    alive: livingRoster(Game).length,
    fallen: ((Game.state.village || {}).fallen || []).length,
    bonds: bondsOf(Game, newId),
  };
  rec.death = {
    day: deathDay, cause: KILL_CAUSE, oldFirst, newFirst,
    passed, linOk: !!(lastLin.cause && lastLin.villagerId === oldId),
    moOk: lastMo.from === oldId && lastMo.to === newId,
    breadthBefore: deathSnap.breadth, arcBefore: deathSnap.arc, trustBefore: deathSnap.trust,
    preBonds: preBonds.length,
  };
  rec.trustChain.push({ bearer: newFirst, trust: deathSnap.trust });
  E(`\nDEATH d${deathDay} (${KILL_CAUSE}): ${oldFirst} -> ${newFirst} | passed=${passed} lin=${rec.death.linOk} mantleOf=${rec.death.moOk} breadth=${deathSnap.breadth} arc=${deathSnap.arc} trust=${deathSnap.trust}`);
  if (!passed && !NO_KILL) { rec.notes.push(`mantle FAILED (over=${Game.over}, villageLost=${Game.villageLost})`); rec.m1 = false; finish(); return; }
  if (NO_KILL) rec.notes.push('NO_KILL counterfactual: no death; the original bearer keeps playing');

  // ---- the successor's life: 45 days of real competent play ----
  let wb = newId;
  let tenureEndTrust = null, tenureEndDay = deathDay;
  for (let d = 1; d <= POST_DAYS; d++) {
    if (Game.over) break;
    await runDays(Game, competent, { days: 1 });
    const curBearer = Game.villagerId;
    if (curBearer === newId) { tenureEndTrust = Math.round(trustOf(Game, newId)); tenureEndDay = dayOf(Game); }
    wb = watchBearer(`post-d+${d}`, wb);
    if (Game.over) break;
    const curDay = dayOf(Game);
    const daysSince = curDay - deathDay;
    if ([7, 14, 21, 28, 35, 45].includes(daysSince) || d === POST_DAYS) {
      rec.ledger.push({
        dplus: daysSince, day: curDay, breadth: codexBreadth(Game), arc: arcOf(Game),
        trust: Math.round(trustOf(Game, newId)), bearer: firstName(rawName(Game, Game.villagerId)),
        alive: livingRoster(Game).length, fallen: ((Game.state.village || {}).fallen || []).length,
      });
      E(`LEDGER d+${daysSince}: breadth=${codexBreadth(Game)} arc=${arcOf(Game)} trust[${firstName(newName)}]=${Math.round(trustOf(Game, newId))} bearer=${firstName(rawName(Game, Game.villagerId))} alive=${livingRoster(Game).length}`);
    }
    if (CONVO_DAYS.includes(daysSince) && !Game.over) {
      const v = Game.state.village || {};
      const self = Game.villagerId;
      const byTrust = (v.roster || []).filter(id => id !== self)
        .sort((a, b) => trustOf(Game, b) - trustOf(Game, a));
      const cands = byTrust.slice(0, 2);
      for (const vid of cands) {
        try {
          const r = driveConvo(Game, vid, `post-d+${daysSince} own-life d${curDay}`, 12);
          const fn = path.join(EVID_DIR, `journey-succession-r35-transcript-${SEED}${NO_KILL ? '-nokill' : ''}-dplus${daysSince}-${firstName(rawName(Game, vid))}.txt`);
          fs.writeFileSync(fn, r.text);
          rec.convoReads.push({ day: curDay, dplus: daysSince, vid: firstName(rawName(Game, vid)), refused: r.refused, want: r.flags.want });
          if (r.fullText) for (const ln of r.fullText.split('\n')) {
            if (/^NPC:/.test(ln)) rec.convoLines.push({ day: curDay, text: ln.replace(/^NPC:\s*/, '').slice(0, 600) });
          }
          E(`  CONVO d+${daysSince} with ${firstName(rawName(Game, vid))} (refused=${r.refused}, want=${r.flags.want})`);
        } catch (e) { rec.anomalies.push(`own-life convo d+${daysSince} threw: ` + e.message); }
      }
    }
  }
  const endDay = dayOf(Game);

  // ---- end census + social-ledger diff ----
  const endSnap = {
    day: endDay, breadth: codexBreadth(Game), arc: arcOf(Game),
    trust: Math.round(trustOf(Game, newId)),
    alive: livingRoster(Game).length,
    fallen: ((Game.state.village || {}).fallen || []).length,
    bonds: bondsOf(Game, newId),
  };
  rec.end = endSnap;
  E(`\nEND d${endDay}: breadth ${deathSnap.breadth}->${endSnap.breadth} arc ${deathSnap.arc}->${endSnap.arc} trust ${deathSnap.trust}->${endSnap.trust} alive=${endSnap.alive} fallen=${endSnap.fallen} over=${!!Game.over}`);

  // Promises made BY the successor post-death.
  const postPromises = promisesBy(Game, newId).filter(p => p.day > deathDay);
  const keptOrOpen = postPromises.filter(p => p.kept || !p.kept); // open ones are engaging the bearer
  rec.promises = { made: postPromises.length, kept: postPromises.filter(p => p.kept).length,
    open: postPromises.filter(p => !p.kept).length,
    sample: postPromises.slice(0, 6).map(p => `${firstName(rawName(Game, p.vid))}:${p.goal || '?'}:${p.kept ? 'kept' : 'open'}`) };
  E(`PROMISES by ${newFirst} post-death: made=${rec.promises.made} kept=${rec.promises.kept} open=${rec.promises.open}`);

  // Bonds: new (day>deathDay) or deepened (depth increase vs death snapshot).
  const preMap = {};
  for (const b of deathSnap.bonds) preMap[b.other] = b;
  let newBonds = 0, deepened = 0;
  const bondNotes = [];
  for (const b of endSnap.bonds) {
    const pre = preMap[b.other];
    if (!pre && b.day > deathDay) { newBonds++; bondNotes.push(`new:${firstName(rawName(Game, b.other))}(d${b.day},depth${b.depth})`); }
    else if (pre && b.depth > pre.depth) { deepened++; bondNotes.push(`deepened:${firstName(rawName(Game, b.other))}(${pre.depth}->${b.depth})`); }
  }
  rec.bonds = { pre: deathSnap.bonds.length, end: endSnap.bonds.length, newBonds, deepened, notes: bondNotes.slice(0, 8) };
  E(`BONDS of ${newFirst}: pre=${deathSnap.bonds.length} end=${endSnap.bonds.length} new=${newBonds} deepened=${deepened}`);

  finish();

  function finish() {
    Game.say = _say;
    capturing = false;
    // ---- identity tripwire (r34 exclusions: honest namings of the dead) ----
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
    rec.m1 = !!(rec.death && rec.death.passed && rec.death.linOk && rec.death.moOk);
    const hasStory = postPromises.length > 0 || newBonds > 0 || deepened > 0;
    rec.m2 = hasStory;
    rec.m2detail = `promisesMade=${postPromises.length} kept=${rec.promises.kept} newBonds=${newBonds} deepened=${deepened}`;
    rec.m3 = endSnap.arc >= deathSnap.arc;
    rec.m3detail = `arc ${deathSnap.arc} -> ${endSnap.arc}`;
    const trustOk = (tenureEndTrust == null ? endSnap.trust : tenureEndTrust) >= deathSnap.trust;
    const villageHolds = !Game.over && endSnap.alive >= 3;
    rec.m4 = trustOk && villageHolds;
    rec.m4detail = `trust ${deathSnap.trust}->${tenureEndTrust == null ? endSnap.trust : tenureEndTrust} (tenure end d${tenureEndDay}) alive=${endSnap.alive} over=${!!Game.over}`;
    rec.m5 = 'manual';
    E(`\nMETRICS: m1=${rec.m1} m2=${rec.m2}(${rec.m2detail}) m3=${rec.m3}(${rec.m3detail}) m4=${rec.m4}(${rec.m4detail}) m5=${rec.m5}`);
    E(`organic handoffs: ${rec.organicDeaths.length}; anomalies: ${rec.anomalies.length}`);
    for (const a of rec.anomalies.slice(0, 8)) E('  ANOMALY: ' + a);
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
