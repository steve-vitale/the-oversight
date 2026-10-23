#!/usr/bin/env node
// journey-succession-r39-20261023.js — SUCCESSION LEG r39: "NEW BODY, NEW RECORD — MEASURED"
// Journey leg 7: death of the player character, the mantle passing, the new
// bearer's life. LANE B.
//
// LEG QUESTION (pre-registered, MEASUREMENT.md §§9-12, 14): Steve's 2026-10-22
// directive — "focus on making each CHARACTER feel like a completely
// different way to play — even one the player didn't choose (succession hands
// you someone new; that handoff should feel like a new playstyle, not a stat
// swap)." The machinery landed as rogue P1 2026-10-22 (ledger.js playerDeath:
// playstyle/practice/passives reset, stats back to 5+occupation bonuses,
// successor wakes with their OWN abilities/tracks/XP/skills/knowledge/gear,
// the dead bearer's dominant axis filed in the lineage entry).
// r38 (this morning) audited the funeral/vouch/echo machinery; this run asks
// the player-facing question the machinery exists for: does the successor's
// first 14 days actually DIFFER — in kit, in practiced body, in behavioral
// axes, in voice — from the predecessor's regime?
//
// PROFILE: competent policy. Phase A: real competent play to ~d40 (death-aware
// stop). Kill via the REAL playerDeath ('a hushwolf'). Post-death: 14 days of
// REAL competent play as the successor. Death-aware: dead/scattered village
// stops (+10d tail).
//
// BINDING METRICS (§14):
//   M1 (own kit — Steve 2026-10-14 "you become that villager"): the
//       successor's ability set at d+1 differs from the dead bearer's set
//       (no borrowed abilities). GO: >=2/3 seeds show set-difference.
//   M2 (new body): successor practice/passives reset and stats re-based to
//       5+occupation bonuses, not the predecessor's practiced values.
//       GO: >=2/3 seeds (measured at d+1).
//   M3 (new habits): by d+14 the successor's dominantPlaystyle() differs
//       from the predecessor's lineage-filed axis. GO: >=2/3 diverge.
//       (divergence includes axis<->null; the competent policy plays the
//       same regardless of bearer — a policy artifact, NOT a game miss, is
//       recorded if axes fail to diverge for that reason.)
//   M4 (voice): 0 identity failures in sense-read transcripts (villagers
//       address the successor as themselves, the dead stay dead).
//   M5 (trust trap — Steve's call, observed only): successor trust at
//       d+1/d+7/d+14, half-ration lines. NO bar — datum only.
// INTERESTING-FINDING CRITERIA:
//   (a) successor plays indistinguishably from the predecessor on M1-M3 =
//       "stat swap" verdict on the directive;
//   (b) real divergence in kit/body/habits/voice = "new playstyle" evidence;
//   (c) identity failures (old-bearer artifacts) = REAL BUG.
// SEEDS: 30001-30003 (fresh pilot; r38 ran the full panel on 20001-20004
// this morning). HORIZON: phase A to ~d40, successor +14d.
// Usage: SEED=30001 node scripts/journey-succession-r39-20261023.js
// Output: JSON record to stdout; narrative + transcripts to stderr.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '30001', 10);
const KILL_CAUSE = 'a hushwolf';
const PHASE_A_DAYS = 40;
const POST_DAYS = 14;
const EVID_DIR = path.join(ROOT, 'evidence', '2026-10-23');
const SAY_CAP = 15000;
const CONVO_DAYS = [3, 7, 14];

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

// Honest convo driver (r26-r39, verbatim): sense-read only.
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
  const E = (...a) => console.error('[r39]', ...a);
  const rec = {
    seed: SEED, leg: 'succession', run: 'r39', question: 'new playstyle or stat swap (Steve 2026-10-22 directive)',
    preDeath: null, death: null, profPre: null, profPost1: null, profPost14: null,
    trustSeries: [], convoReads: [], convoLines: [], anomalies: [],
    organicBurial: { bury: false, respects: false },
    funeral: {}, identityTrips: [], contrastBeats: [],
  };
  E(`SEED=${SEED} — loading`);
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-r39', fullTelemetry: true });
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
    // M1: own kit — successor ability set differs from dead bearer's
    let m1 = false, m1detail = '';
    if (rec.profPre && rec.profPost1) {
      const diff = setDiff(rec.profPre.abilities, rec.profPost1.abilities);
      m1 = diff.onlyA.length > 0 || diff.onlyB.length > 0;
      m1detail = `old=[${rec.profPre.abilities.join(',')}] new=[${rec.profPost1.abilities.join(',')}] onlyOld=${diff.onlyA.length} onlyNew=${diff.onlyB.length} shared=${diff.shared.length}`;
    } else m1detail = 'profiles missing';
    // M2: new body — practice/passives empty at d+1, stats rebased
    let m2 = false, m2detail = '';
    if (rec.profPost1) {
      const p = rec.profPost1;
      const practiceEmpty = Object.keys(p.practice || {}).length === 0;
      const passivesEmpty = Object.keys(p.passives || {}).length === 0;
      const baseStats = ['str', 'end', 'per', 'agi', 'pre'].every(k => (p.stats || {})[k] != null);
      m2 = practiceEmpty && passivesEmpty && baseStats;
      m2detail = `practiceEmpty=${practiceEmpty} passivesEmpty=${passivesEmpty} stats=${JSON.stringify(p.stats)}`;
    }
    // M3: new habits — dominant axis at d+14 differs from predecessor's lineage axis
    let m3 = false, m3detail = '';
    const predAxis = d.lineagePlaystyle || null;
    const newAxis = rec.profPost14 ? rec.profPost14.dominant : null;
    m3 = (newAxis || null) !== (predAxis || null);
    m3detail = `pred=${predAxis} succ14=${newAxis} (predAxes=${JSON.stringify(rec.profPre ? rec.profPre.playstyle : null)})`;
    // M4: voice — identity trips counted below
    rec.m1 = m1; rec.m1detail = m1detail;
    rec.m2 = m2; rec.m2detail = m2detail;
    rec.m3 = m3; rec.m3detail = m3detail;
    rec.m4 = rec.identityTrips.length === 0;
    rec.m4detail = `identityTrips=${rec.identityTrips.length} contrastBeats=${rec.contrastBeats.length}`;
    rec.m5 = 'datum-only';
    rec.m5detail = `trust d+1=${rec.trustSeries[0] != null ? rec.trustSeries[0].trust : '?'} d+7=${rec.trustSeries[1] != null ? rec.trustSeries[1].trust : '?'} d+14=${rec.trustSeries[2] != null ? rec.trustSeries[2].trust : '?'} halfRation=${(rec.funeral.halfRationLines || []).length}`;
    E(`\nMETRICS: m1(ownKit)=${m1} m2(newBody)=${m2} m3(newHabits)=${m3} m4(voice)=${rec.m4} m5(trustDatum)=${rec.m5detail}`);
    E(`  m1: ${m1detail}`);
    E(`  m2: ${m2detail}`);
    E(`  m3: ${m3detail}`);
    E(`  m4: ${rec.m4detail}`);
    E(`anomalies: ${rec.anomalies.length}`); for (const a of rec.anomalies.slice(0, 8)) E('  ANOMALY: ' + a);
    console.log(JSON.stringify(rec, null, 1));
  }

  // ---- phase A: real competent play to ~d40 (death-aware stop) ----
  // Snapshot the live bearer <redacted> each phase-A day so an ORGANIC mantle
  // still leaves the predecessor's profile behind (r39 instrument fix: the
  // profile read after the loop would be the successor's).
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

  // Pre-death bearer <redacted> (the predecessor's regime, at its peak).
  // Organic case: the mantle already passed inside phase A — the predecessor
  // profile is the last pre-death snapshot (see profPreLive above).
  rec.profPre = organic ? profPreLive : bearerProfile(Game);
  E(`PRE-DEATH d${dayOf(Game)}: ${rec.profPre.name} (${rec.profPre.occ}) abil=[${rec.profPre.abilities.join(',')}] dominant=${rec.profPre.dominant} playstyle=${JSON.stringify(rec.profPre.playstyle)} stats=${JSON.stringify(rec.profPre.stats)} trust=${rec.profPre.trust}`);

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
  E(`POST d+1: ${rec.profPost1.name} (${rec.profPost1.occ}) abil=[${rec.profPost1.abilities.join(',')}] dominant=${rec.profPost1.dominant} playstyle=${JSON.stringify(rec.profPost1.playstyle)} stats=${JSON.stringify(rec.profPost1.stats)} trust=${rec.profPost1.trust}`);

  // ---- post-death: 14 days of competent play as the successor ----
  let buriedBy = null;
  let deaths = 1;
  const trustAt = (tag) => {
    rec.trustSeries.push({ tag, day: dayOf(Game), trust: Math.round(trustOf(Game, Game.villagerId)) });
  };
  trustAt('d+1');
  for (let d = 1; d <= POST_DAYS; d++) {
    if (Game.over) break;
    const beforeId = Game.villagerId;
    await runDays(Game, competent, { days: 1 });
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
          const r = driveConvo(Game, vid, `successor-voice d+${daysSince}`, 12);
          const fn = path.join(EVID_DIR, `journey-succession-r39-transcript-${SEED}-dplus${daysSince}-${firstName(rawName(Game, vid))}.txt`);
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
  // Contrast beats: villagers explicitly setting the new bearer <redacted> the old one.
  const contrastRe = new RegExp(`\\b${oldFirst}\\b[\\s\\S]{0,120}\\b${newFirst}\\b|\\b${newFirst}\\b[\\s\\S]{0,120}\\b${oldFirst}\\b`, 'i');
  const src2 = sayLog.filter(h => h.day > deathDay)
    .concat(rec.convoLines.filter(l => l.day > deathDay).map(l => ({ day: l.day, text: l.text })));
  for (const h of src2) {
    if (contrastRe.test(h.text) && /not |different|unlike|never |no .*like|whereas|while /i.test(h.text)) {
      rec.contrastBeats.push({ day: h.day, text: h.text.slice(0, 260) });
    }
  }
  // Identity trips: the dead addressed as if alive, or the new one called the old name.
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
  // Trust-trap observation (Steve's call — document only).
  f.halfRationLines = sayLog.filter(h => h.day > deathDay && /Half ration|don't trust you yet/i.test(h.text))
    .map(h => `d${h.day}: ${h.text.slice(0, 160)}`);
  f.deathsTotal = deaths;
  // Telemetry-baseline fields (same contract as telemetry-baselines/succession.json)
  rec.tele = {
    'deaths.bearer': deaths,
    'census.alive': livingRoster(Game).length,
    'census.fallen': ((Game.state.village || {}).fallen || []).length,
    'census.integrationStage': (function () { try { return (typeof Game.integrationStage === 'function') ? Game.integrationStage() : 0; } catch (e) { return 0; } })(),
    'week2.deadBearerMentions': sayLog.filter(h => h.day > deathDay && h.day <= deathDay + 7 && nameRe.test(h.text)).length,
  };
  wfs(path.join(EVID_DIR, `journey-succession-r39-tele-${SEED}.json`), JSON.stringify(rec.tele, null, 1));
  finish();
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
