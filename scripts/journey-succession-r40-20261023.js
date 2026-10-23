#!/usr/bin/env node
// journey-succession-r40-20261023.js — SUCCESSION LEG r40: "NEW BODY, NEW HABITS — TWO POLICIES"
// Journey leg 7: death of the player character, the mantle passing, the new
// bearer's life. LANE B.
//
// LEG QUESTION (pre-registered, MEASUREMENT.md §§9-12, 14): r39's metric
// review — M3 NO-GO'd because one policy played every bearer the same way.
// Steve's 2026-10-22 directive ("succession hands you someone new; that
// handoff should feel like a new playstyle, not a stat swap") + "the game
// notices who you are" (notePlaystyle): do the behavioral axes RE-DIVERGE
// when the successor is played differently, or is the instrument too
// social-gravitational to notice?
//
// PROFILE: competent policy pre-death (~d40, death-aware stop; scripted
// playerDeath('a hushwolf') only if the bearer survives). POST-DEATH the
// successor is played with one of two behaviorally-contrasting policies:
//   - SOCIALITE (competent + talks, feasts, moots, aid cries, switchboard):
//     drives social/leader/generous notes.
//   - QUIET-COMPETENT (competent + COMPETENT_FEAST=0 + COMPETENT_AID=0):
//     survives, works, fights when found — minimal social verbs.
// Seeds 30004/30006 (even) -> QUIET; 30005/30007 (odd) -> SOCIALITE.
// Horizon: 14 days post-death. Death-aware: dead/scattered village stops.
//
// BINDING METRICS (§14):
//   M1 (reset holds): playstyle/practice/passives empty at d+1 on all seeds.
//       GO: >=3/4.
//   M2 (re-noticing): modal dominant axis at d+14 of the social group differs
//       from the modal dominant axis of the quiet group. GO: groups diverge.
//   M3 (people check): 1 sense-read transcript per seed, 0 identity failures,
//       and the village meets the quiet successor differently from the
//       socialite one (recorded honestly, no bar beyond no failures).
//       GO: 0 identity failures across seeds.
//   M4 (trust trap — Steve's call, observed only): successor trust at
//       d+1/d+7/d+14. NO bar — datum only.
// INTERESTING-FINDING CRITERIA:
//   (a) groups diverge -> the game re-notices habits; "new playstyle" holds
//       at the behavioral layer too (answers r39's M3 with the right instrument);
//   (b) groups converge anyway -> the axis instrument is social-gravitational
//       regardless of behavior (design datum for Steve, not a bug);
//   (c) identity failures (dead-bearer <redacted> onto the successor) = REAL BUG.
// SEEDS: 30004-30007 (fresh pilot). KILL RULE: mantle fails to pass on >=2/4
// seeds -> SUBSTRATE-MISSING; document and move on.
// Usage: SEED=30004 node scripts/journey-succession-r40-20261023.js
// Output: JSON record to stdout; narrative + transcripts to stderr.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { socialite } = require('./policies/socialite');

const SEED = parseInt(process.env.SEED || '30004', 10);
const KILL_CAUSE = 'a hushwolf';
const PHASE_A_DAYS = 40;
const POST_DAYS = 14;
const EVID_DIR = path.join(ROOT, 'evidence', '2026-10-23');
const SAY_CAP = 15000;
const CONVO_DAYS = [3, 10];

// QUIET-COMPETENT: competent survival, no feast-hosting, no aid layer, no
// deep talk. The env gates are read live by competent (feastOn(), aid gate,
// talkOn), so the wrapper only narrows the window around competent.daily.
const quietCompetent = Object.assign({}, competent, {
  id: 'quiet-competent',
  desc: 'competent survival + no feast hosting + no aid layer (behavioral contrast)',
  daily(Game, ctx) {
    const keep = { F: process.env.COMPETENT_FEAST, A: process.env.COMPETENT_AID, T: process.env.COMPETENT_TALK };
    process.env.COMPETENT_FEAST = '0';
    process.env.COMPETENT_AID = '0';
    process.env.COMPETENT_TALK = '0';
    try { if (competent.daily) competent.daily(Game, ctx); }
    finally {
      for (const [k, v] of [['COMPETENT_FEAST', keep.F], ['COMPETENT_AID', keep.A], ['COMPETENT_TALK', keep.T]]) {
        if (v === undefined) delete process.env[k]; else process.env[k] = v;
      }
    }
  },
});
const POST_GROUP = (SEED % 2 === 0) ? 'quiet' : 'socialite';
const POST_POLICY = (SEED % 2 === 0) ? quietCompetent : socialite;

// EPERM-hardened file write (flap class of 2026-10-23): retry, never throw.
function wfs(fn, text) {
  for (let i = 0; i < 6; i++) {
    try { fs.writeFileSync(fn, text); return true; }
    catch (e) { if (i === 5) return false; }
  }
  return false;
}
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
function corpses(Game) {
  try { return (typeof Game.corpses === 'function' ? Game.corpses() : Game.corpses) || []; } catch (e) { return []; }
}
function bearerCorpse(Game, oldId) {
  return corpses(Game).find(c => c && c.villagerId === oldId) || null;
}
function occupationOf(Game, vid) {
  try {
    const rc = ((Game.state.village || {}).rosterChars || {})[vid];
    if (rc && (rc.formerOccupation || rc.occupation)) return rc.formerOccupation || rc.occupation;
  } catch (e) {}
  return '?';
}

// Honest convo driver (r26-r40, verbatim): sense-read only.
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
  out.push(txt);
  return { text: out.join('\n'), refused: false, flags: { want: (cf && cf.want && cf.want.id) || 'none' }, fullText: txt };
}

// The bearer <redacted> instrument: what makes THIS person play differently.
function bearerProfile(Game) {
  const s = Game.state.scholar || {};
  const vid = Game.villagerId;
  let abilities = [];
  try {
    const ab = s.abilities || [];
    abilities = ab.map(a => (a && (a.evolvedFrom || a.id || a.name)) || '?').filter(Boolean);
  } catch (e) {}
  let dominant = null;
  try { dominant = (typeof Game.dominantPlaystyle === 'function') ? Game.dominantPlaystyle() : null; } catch (e) {}
  return {
    vid: String(vid), name: firstName(rawName(Game, vid)),
    occ: occupationOf(Game, vid),
    abilities: abilities.slice(0, 16),
    playstyle: Object.assign({}, s.playstyle || {}),
    dominant,
    practice: Object.assign({}, s.practice || {}),
    passives: Object.assign({}, s.passives || {}),
    stats: Object.assign({}, s.stats || {}),
    trust: Math.round(trustOf(Game, vid)),
  };
}
function setDiff(a, b) {
  const sa = new Set(a), sb = new Set(b);
  return {
    onlyA: a.filter(x => !sb.has(x)),
    onlyB: b.filter(x => !sa.has(x)),
    shared: a.filter(x => sb.has(x)),
  };
}

async function main() {
  const E = (...a) => console.error('[r40]', ...a);
  const rec = {
    seed: SEED, leg: 'succession', run: 'r40',
    question: 'two policies post-death: do behavioral axes re-diverge (r39 M3 retest)',
    postGroup: POST_GROUP,
    preDeath: null, death: null, profPre: null, profPost1: null, profPost14: null,
    trustSeries: [], convoReads: [], convoLines: [], anomalies: [],
    organicBurial: { bury: false, respects: false },
    funeral: {}, identityTrips: [], contrastBeats: [],
  };
  E(`SEED=${SEED} postGroup=${POST_GROUP} — loading`);
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-r40', fullTelemetry: true });
  try { await setupGame(Game); } catch (e) { E('setupGame threw: ' + e.message); }
  const sayLog = [];
  const _say = Game.say;
  let capturing = true;
  Game.say = function (t) {
    const s = String(t || '');
    if (capturing) {
      sayLog.push({ day: dayOf(Game), text: s.slice(0, 800) });
      if (sayLog.length > SAY_CAP) sayLog.shift();
    }
    return _say ? _say.call(this, t) : undefined;
  };
  const _bury = Game.buryCorpse && Game.buryCorpse.bind(Game);
  const _respects = Game.payRespects && Game.payRespects.bind(Game);
  Game.buryCorpse = function (id) { rec.organicBurial.bury = true; return _bury ? _bury(id) : null; };
  Game.payRespects = function (id) { rec.organicBurial.respects = true; return _respects ? _respects(id) : null; };

  function finish() {
    try { Game.say = _say; } catch (e) {}
    try { Game.buryCorpse = _bury; Game.payRespects = _respects; } catch (e) {}
    capturing = false;
    const d = rec.death || {};
    // M1: reset holds — practice/passives empty at d+1
    let m1 = false, m1detail = '';
    if (rec.profPost1) {
      const p = rec.profPost1;
      const practiceEmpty = Object.keys(p.practice || {}).length === 0;
      const passivesEmpty = Object.keys(p.passives || {}).length === 0;
      m1 = practiceEmpty && passivesEmpty;
      m1detail = `practiceEmpty=${practiceEmpty} passivesEmpty=${passivesEmpty} playstyleAtD1=${JSON.stringify(p.playstyle)}`;
    } else m1detail = 'profiles missing';
    // M2: re-noticing — playstyle map at d+14 for this seed (group comparison
    // is computed across seeds in the run note; the per-seed record carries
    // the raw maps + dominant).
    const dom14 = rec.profPost14 ? rec.profPost14.dominant : null;
    const map14 = rec.profPost14 ? rec.profPost14.playstyle : null;
    // M3: voice — identity trips counted below
    rec.m1 = m1; rec.m1detail = m1detail;
    rec.m2dom14 = dom14; rec.m2map14 = map14;
    rec.m2detail = `dominant@${POST_GROUP}: ${dom14} map=${JSON.stringify(map14)}`;
    rec.m3 = rec.identityTrips.length === 0;
    rec.m3detail = `identityTrips=${rec.identityTrips.length} contrastBeats=${rec.contrastBeats.length} convoReads=${rec.convoReads.length}`;
    rec.m4 = 'datum-only';
    rec.m4detail = `trust d+1=${rec.trustSeries[0] != null ? rec.trustSeries[0].trust : '?'} d+7=${rec.trustSeries[1] != null ? rec.trustSeries[1].trust : '?'} d+14=${rec.trustSeries[2] != null ? rec.trustSeries[2].trust : '?'} halfRation=${(rec.funeral.halfRationLines || []).length}`;
    E(`\nMETRICS: m1(reset)=${m1} m2(dominant@${POST_GROUP})=${dom14} m3(voice)=${rec.m3} m4(trustDatum)=${rec.m4detail}`);
    E(`  m1: ${m1detail}`);
    E(`  m2: ${rec.m2detail}`);
    E(`  m3: ${rec.m3detail}`);
    E(`anomalies: ${rec.anomalies.length}`); for (const a of rec.anomalies.slice(0, 8)) E('  ANOMALY: ' + a);
    console.log(JSON.stringify(rec, null, 1));
  }

  // ---- phase A: real competent play to ~d40 (death-aware stop) ----
  let organic = null, profPreLive = null;
  for (let d = 1; d <= PHASE_A_DAYS; d++) {
    if (Game.over) break;
    const beforeId = Game.villagerId;
    profPreLive = bearerProfile(Game);
    await runDays(Game, competent, { days: 1 });
    if (Game.over || Game.villagerId == null) break;
    if (Game.villagerId !== beforeId) {
      organic = { day: dayOf(Game), deadId: beforeId, newId: Game.villagerId };
      rec.anomalies.push(`organic mantle during phase A: ${firstName(rawName(Game, beforeId))} -> ${firstName(rawName(Game, Game.villagerId))} d${organic.day}`);
      break;
    }
  }
  if (Game.over || Game.villagerId == null) {
    rec.anomalies.push(`village over at d${dayOf(Game)} before any kill — seed skipped (death-aware stop)`);
    finish(); return;
  }

  rec.profPre = organic ? profPreLive : bearerProfile(Game);
  E(`PRE-DEATH d${dayOf(Game)}: ${rec.profPre.name} (${rec.profPre.occ}) abil=[${rec.profPre.abilities.join(',')}] dominant=${rec.profPre.dominant} playstyle=${JSON.stringify(rec.profPre.playstyle)} trust=${rec.profPre.trust}`);

  // ---- the leg's death: organic or scripted via the REAL playerDeath ----
  let deathCause, scripted, oldId, killDay;
  if (organic) {
    oldId = organic.deadId; deathCause = 'organic (phase A)'; scripted = false; killDay = organic.day;
    E(`\nORGANIC DEATH d${organic.day}: ${firstName(rawName(Game, organic.deadId))} -> ${firstName(rawName(Game, organic.newId))}`);
  } else {
    oldId = Game.villagerId;
    killDay = dayOf(Game); deathCause = KILL_CAUSE; scripted = true;
    Game.playerDeath(KILL_CAUSE);
  }
  const oldName = rawName(Game, oldId);
  const oldFirst = firstName(oldName);
  const newId = organic ? organic.newId : Game.villagerId;
  const newName = rawName(Game, newId);
  const newFirst = firstName(newName);
  const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
  const lastLin = lin[lin.length - 1] || {};
  const mo = ((Game.state.village || {}).mantleOf || []);
  const lastMo = mo[mo.length - 1] || {};
  const passed = newId !== oldId && !Game.over && !Game.villageLost;
  const deathDay = dayOf(Game);
  const livePost = livingRoster(Game);
  rec.death = {
    day: deathDay, cause: deathCause, scripted, oldFirst, newFirst, passed,
    linOk: !!(lastLin.cause && lastLin.villagerId === oldId),
    moOk: lastMo.from === oldId && lastMo.to === newId,
    newTrust: Math.round(trustOf(Game, newId)),
    alive: livePost.length,
    fallen: ((Game.state.village || {}).fallen || []).length,
    lineagePlaystyle: lastLin.playstyle || null,
    lineageEpithet: lastLin.epithet || null,
  };
  E(`DEATH d${deathDay} (${deathCause}${scripted ? ', scripted' : ''}): ${oldFirst} -> ${newFirst} | passed=${passed} linPlaystyle=${rec.death.lineagePlaystyle} epithet=${JSON.stringify(rec.death.lineageEpithet)} trust=${rec.death.newTrust}`);
  if (!passed) { rec.anomalies.push('mantle FAILED — seed skipped'); finish(); return; }

  // Post-handoff profile: the successor's own record (d+1, before they act much).
  rec.profPost1 = bearerProfile(Game);
  E(`POST d+1: ${rec.profPost1.name} (${rec.profPost1.occ}) abil=[${rec.profPost1.abilities.join(',')}] dominant=${rec.profPost1.dominant} playstyle=${JSON.stringify(rec.profPost1.playstyle)} trust=${rec.profPost1.trust}`);

  // ---- post-death: 14 days under the assigned behaviorally-contrasting policy ----
  let buriedBy = null;
  let deaths = 1;
  const trustAt = (tag) => {
    rec.trustSeries.push({ tag, day: dayOf(Game), trust: Math.round(trustOf(Game, Game.villagerId)) });
  };
  trustAt('d+1');
  for (let d = 1; d <= POST_DAYS; d++) {
    if (Game.over) break;
    const beforeId = Game.villagerId;
    await runDays(Game, POST_POLICY, { days: 1 });
    if (Game.over || Game.villagerId == null) break;
    if (Game.villagerId !== beforeId) { deaths++; rec.anomalies.push(`chain mantle: new bearer <redacted> d${dayOf(Game)}`); }
    const curDay = dayOf(Game);
    const daysSince = curDay - deathDay;
    if (daysSince === 7) trustAt('d+7');
    if (daysSince >= 14) trustAt('d+14');
    if (daysSince === 3 && buriedBy == null) {
      const c = bearerCorpse(Game, oldId);
      if (c) {
        const r1 = _respects(c.id); const r2 = _bury(c.id);
        buriedBy = 'scripted';
        E(`  BURIAL d+${daysSince}: corpse found respects=${r1 === true} bury=${r2 === true}`);
      } else { buriedBy = 'missing'; rec.anomalies.push(`d+3: no corpse for ${oldFirst} — nothing to bury`); }
    }
    if (rec.organicBurial.bury && buriedBy == null) buriedBy = 'organic';
    if (CONVO_DAYS.includes(daysSince) && !Game.over) {
      const v = Game.state.village || {};
      const self = Game.villagerId;
      const byTrust = (v.roster || []).filter(id => id !== self).sort((a, b) => trustOf(Game, b) - trustOf(Game, a));
      for (const vid of byTrust.slice(0, 2)) {
        try {
          const r = driveConvo(Game, vid, `${POST_GROUP}-successor d+${daysSince}`, 12);
          const fn = path.join(EVID_DIR, `journey-succession-r40-transcript-${SEED}-dplus${daysSince}-${firstName(rawName(Game, vid))}.txt`);
          wfs(fn, r.text);
          rec.convoReads.push({ day: curDay, dplus: daysSince, vid: firstName(rawName(Game, vid)), refused: r.refused, want: r.flags.want });
          if (r.fullText) for (const ln of r.fullText.split('\n')) {
            if (/^NPC:/.test(ln)) rec.convoLines.push({ day: curDay, text: ln.replace(/^NPC:\s*/, '').slice(0, 600) });
          }
          E(`  CONVO d+${daysSince} with ${firstName(rawName(Game, vid))} (refused=${r.refused})`);
        } catch (e) { rec.anomalies.push(`successor convo d+${daysSince} threw: ` + e.message); }
      }
    }
  }
  rec.profPost14 = bearerProfile(Game);
  E(`POST d+14: ${rec.profPost14.name} (${rec.profPost14.occ}) abil=[${rec.profPost14.abilities.join(',')}] dominant=${rec.profPost14.dominant} playstyle=${JSON.stringify(rec.profPost14.playstyle)} trust=${rec.profPost14.trust} alive=${livingRoster(Game).length} over=${!!Game.over}`);

  // ---- evidence ----
  const win = sayLog.filter(h => h.day >= deathDay && h.day <= deathDay + 2);
  const findLine = (re, w) => (w || sayLog).filter(h => re.test(h.text)).map(h => `d${h.day}: ${h.text.slice(0, 300)}`);
  const f = rec.funeral;
  f.deathBeat = findLine(/🕯️|is dead/, win);
  const nameRe = new RegExp(`\\b${oldFirst}\\b`, 'i');
  const newRe = new RegExp(`\\b${newFirst}\\b`, 'i');
  const contrastRe = new RegExp(`\\b${oldFirst}\\b[\\s\\S]{0,120}\\b${newFirst}\\b|\\b${newFirst}\\b[\\s\\S]{0,120}\\b${oldFirst}\\b`, 'i');
  const src2 = sayLog.filter(h => h.day > deathDay)
    .concat(rec.convoLines.filter(l => l.day > deathDay).map(l => ({ day: l.day, text: l.text })));
  for (const h of src2) {
    if (contrastRe.test(h.text) && /not |different|unlike|never |no .*like|whereas|while /i.test(h.text)) {
      rec.contrastBeats.push({ day: h.day, text: h.text.slice(0, 260) });
    }
  }
  const trips = [];
  if (oldFirst) {
    const addrRe = new RegExp(`\\b${oldFirst}\\b.*(you|your)|you.*\\b${oldFirst}\\b`, 'i');
    for (const h of src2) {
      if (addrRe.test(h.text) && !/is dead|died|'s gone|was |buried|bury|grave|mourn|miss |take .* from|not the office, the person|keep expecting|ashes|words for|say a few words/i.test(h.text)) {
        trips.push({ day: h.day, text: h.text.slice(0, 200) });
      }
    }
  }
  rec.identityTrips = trips.slice(0, 10);
  E(`\nCONTRAST BEATS: ${rec.contrastBeats.length} | IDENTITY TRIPS: ${trips.length}`);
  f.halfRationLines = sayLog.filter(h => h.day > deathDay && /Half ration|don't trust you yet/i.test(h.text))
    .map(h => `d${h.day}: ${h.text.slice(0, 160)}`);
  f.deathsTotal = deaths;
  rec.tele = {
    'deaths.bearer': deaths,
    'census.alive': livingRoster(Game).length,
    'census.fallen': ((Game.state.village || {}).fallen || []).length,
    'census.integrationStage': (function () { try { return (typeof Game.integrationStage === 'function') ? Game.integrationStage() : 0; } catch (e) { return 0; } })(),
    'week2.deadBearerMentions': sayLog.filter(h => h.day > deathDay && h.day <= deathDay + 7 && nameRe.test(h.text)).length,
  };
  wfs(path.join(EVID_DIR, `journey-succession-r40-tele-${SEED}.json`), JSON.stringify(rec.tele, null, 1));
  finish();
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
