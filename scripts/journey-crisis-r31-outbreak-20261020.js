#!/usr/bin/env node
// journey-crisis-r31-outbreak-20261020.js — CRISIS LEG (6) r31: DISEASE OUTBREAK sense-test.
// PRE-REGISTRATION: when a mundane disease outbreak sweeps the village, do
// villagers behave like people — tended/talked about/feared — do outbreak
// deaths get mourned, and does the 'outbreak' lately-topic surface in-window?
// Canon (DISEASES.md): diseases never announce their names — only symptoms;
// diagnosis unlocks the true name. Undiagnosed true-name announcements = bug.
//
// Interesting-finding bar (any):
//   (a) outbreak (>=2 sick simultaneously — the topic's own gate) with ZERO
//       tended/tended_by response to the sick
//   (b) active outbreak where the 'outbreak' topic never surfaces in driven convos
//   (c) outbreak deaths with no mourning response within 7 days
//   (d) undiagnosed villagers naming true disease names in say-lines/transcripts
// Carried instrument (r30 bar d): defender deaths in raids -> mourning.
// Seeds: 7,42,99,424242 (continuity r25/r30). Policy: oracleV2. Horizon: 120d death-aware (+10d tail).
// Usage: EVID=/path/to/evidence/2026-10-19 SEEDS=7,42 node scripts/journey-crisis-r31-outbreak-20261020.js
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const DAYS = parseInt(process.env.DAYS || '120', 10);
const EVID = process.env.EVID || path.join(ROOT, 'evidence', '2026-10-19');
const SEEDS = (process.env.SEEDS || '7,42,99,424242').split(',').map(s => parseInt(s, 10)).filter(n => !isNaN(n));
const CANON_NAMES = ['gut rot', 'trichinosis', 'lockjaw', 'wound fever', 'trembles'];

function rawName(Game, vid) {
  try {
    const rc = ((Game.state.village || {}).rosterChars || {})[vid];
    if (rc && rc.name) return rc.name;
  } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function displayName(Game, vid) {
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
// is this villager currently sick per the village sick registry (v.sick)?
// This is the SAME source the 'outbreak' lately-topic scans (convoTopics.js:
// threshold 2 sick — "two is the village's business").
function sickScanOf(Game) {
  // Returns {vids, weight}: the SAME inputs the 'outbreak' lately-topic uses
  // (convoTopics.js: threshold 2 sick; weight>=5 = SEVERE, sev2+ counts double).
  const out = { vids: [], weight: 0 };
  try {
    const v = Game.state.village || {};
    for (const id of (v.roster || [])) {
      const s = (v.sick || {})[id];
      let svp = null;
      try { svp = Game.vpOf(id); } catch (e) {}
      if (s && (s.daysLeft || 0) > 0 && svp && !svp.dead) {
        out.vids.push(id);
        out.weight += ((s.severity || 1) >= 2) ? 2 : 1;
      }
    }
  } catch (e) {}
  return out;
}
function mems(Game, vid) {
  try { return (typeof Game.t2mem === 'function' ? Game.t2mem(vid) : []) || []; } catch (e) { return []; }
}

// Natural-path conversation driver (adapted from journey-crisis-convo-20261011.js).
function driveConvo(Game, vid, tag) {
  const out = [];
  const pname = displayName(Game, vid);
  out.push(`## ${tag} — talking to ${pname}\n`);
  let opened;
  try { opened = Game.startConvo(vid); } catch (e) { out.push(`(startConvo threw: ${e.message})`); return out.join('\n'); }
  if (!opened || opened.refused || opened.ended) { out.push(`(conversation refused/ended: ${JSON.stringify(opened && opened.line || '')})`); return out.join('\n'); }
  const snap = (label) => {
    let c;
    try { c = Game.convoGet(vid); } catch (e) { return; }
    out.push(`--- ${label} ---`);
    for (const e of (c.transcript || [])) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${e.text}`);
    const ch = (Game.convoChoices(vid) || []).map(x => `[${x.id}] ${x.text || ''}`.slice(0, 110));
    out.push(`CHOICES (${ch.length}): ${ch.slice(0, 8).join(' | ')}`);
    out.push('');
  };
  snap('opening');
  for (let t = 0; t < 14; t++) {
    let choices;
    try { choices = Game.convoChoices(vid) || []; } catch (e) { break; }
    if (!choices.length) { out.push('(no choices offered)'); break; }
    let pick = choices.find(c => /^gq:/.test(c.id));
    if (!pick) pick = choices.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
    if (!pick) pick = choices.find(c => /how|feeling|holding|news|day|worried|afraid|hungry|sick|ill|fever|cough|worse|better|dead|died|gone|mourn/i.test(c.text || ''));
    if (!pick) pick = choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick) break;
    if (/^(leave|bye|goodbye)/.test(pick.id)) break;
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 90)}`);
    try { Game.convoTurn(vid, pick.id); }
    catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    let c;
    try { c = Game.convoGet(vid); } catch (e) { break; }
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
    const last = (c.transcript || []).slice(-2);
    for (const e of last) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${e.text}`);
    out.push('');
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  return out.join('\n');
}

async function playSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'journey-crisis', fullTelemetry: true });
  await setupGame(Game);
  const day = () => { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } };

  const rec = {
    seed, days: 0, endReason: '',
    crises: [],            // {day, kind}
    diseaseCases: [],      // {day, target, disease, pool, kind: contracted|ended}
    outbreakWindows: [],   // {startDay, endDay, peakSick, peakWeight}
    maxOutbreakWeight: 0,  // SEVERE = weight>=5 (sev2+ counts double)
    convosDriven: [],      // {day, tag, file}
    tendedAtEnd: 0, tendedByAtEnd: 0,
    sayOutbreakLines: 0, canonHits: [],   // {day, line}
    defenderRaidDeaths: [],               // r30 bar (d) instrument
    griefConvos: 0, outbreakTopicSurfaced: 0,
  };
  const seen = new Set();
  const diseaseState = new Map();
  const says = [];
  const _say = Game.say.bind(Game);
  Game.say = function (t) { try { says.push({ day: day(), line: String(t) }); } catch (e) {} return _say(t); };
  const _fc = Game.fireCrisis;
  Game.fireCrisis = function (kind, ctx) {
    const fired = _fc ? _fc.call(this, kind, ctx) : undefined;
    try { if (fired === true) rec.crises.push({ day: day(), kind }); } catch (e) {}
    return fired;
  };
  // r30 bar (d): defender deaths in raids
  const _vDie = Game.vDie;
  Game.vDie = function (vid, cause) {
    let r;
    try { r = _vDie ? _vDie.apply(this, arguments) : undefined; } catch (e) { r = 'threw'; }
    try {
      const ms = mems(Game, vid);
      const def = ms.find(m => m.t === 'defended' && (day() - (m.day || 0)) <= 2);
      if (def) rec.defenderRaidDeaths.push({ day: day(), name: rawName(Game, vid), cause: String(cause || '') });
    } catch (e) {}
    return r;
  };

  let inWindow = false, windowStart = 0, peakSick = 0, peakWeight = 0;
  let convosThisRun = 0, griefPending = null, seenDeaths = 0;
  const sickAtDeath = new Map(); // vid -> last sick day

  const scanDiseases = () => {
    const v = Game.state.village || {};
    const roster = v.roster || [];
    const now = new Set();
    const sickVids = [];
    for (const rid of roster) {
      const p = (v.rosterChars || {})[rid];
      let list = [];
      try { list = Game.seList(p || {}) || []; } catch (e) {}
      for (const st of list) {
        const id = st && (st.id || st);
        if (!id || typeof id !== 'string') continue;
        let isD = false, pool = '?';
        try { isD = Game.seIsDisease(id); } catch (e) {}
        if (!isD) continue;
        try { pool = (Game.seDef(id) || {}).pool || '?'; } catch (e) {}
        const key = 'v:' + rid + ':' + id;
        now.add(key);
        if (!diseaseState.has(key)) {
          diseaseState.set(key, 1);
          rec.diseaseCases.push({ day: day(), target: rawName(Game, rid), disease: id, pool, kind: 'contracted' });
        }
      }
      if ([...now].some(k => k.startsWith('v:' + rid + ':'))) sickVids.push(rid);
    }
    // player (scholar) cases
    try {
      const list = Game.seList('scholar') || [];
      for (const st of list) {
        const id = st && (st.id || st);
        if (!id || typeof id !== 'string') continue;
        if (!Game.seIsDisease(id)) continue;
        let pl = '?';
        try { pl = (Game.seDef(id) || {}).pool || '?'; } catch (e) {}
        const key = 'player:' + id;
        now.add(key);
        if (!diseaseState.has(key)) {
          diseaseState.set(key, 1);
          rec.diseaseCases.push({ day: day(), target: rawName(Game, Game.villagerId) + ' (you)', disease: id, pool: pl, kind: 'contracted' });
        }
      }
    } catch (e) {}
    for (const key of [...diseaseState.keys()]) {
      if (!now.has(key)) {
        diseaseState.delete(key);
        const m = key.match(/^(v:[^:]+|player):(.+)$/);
        rec.diseaseCases.push({ day: day(), target: m ? m[1] : key, disease: m ? m[2] : '?', pool: '?', kind: 'ended' });
      }
    }
    return sickVids;
  };

  const writeTranscript = (text, fname) => {
    try { fs.writeFileSync(path.join(EVID, fname), text, 'utf8'); } catch (e) {}
  };

  const policy = {
    id: 'crisis-journey-r31',
    setup: oracleV2.setup ? oracleV2.setup.bind(oracleV2) : undefined,
    upkeep: oracleV2.upkeep ? oracleV2.upkeep.bind(oracleV2) : undefined,
    daily: function (G, ctx) {
      try { if (oracleV2.daily) oracleV2.daily.call(oracleV2, G, ctx); } catch (e) {}
      try {
        const v = Game.state.village || {};
        for (const rid of (v.roster || [])) seen.add(String(rid));
        const sickVids = scanDiseases();
        const scan = sickScanOf(Game); // v.sick — the topic machinery's own source
        const sickReg = scan.vids;
        for (const rid of sickReg) sickAtDeath.set(String(rid), day());
        if (scan.weight > rec.maxOutbreakWeight) rec.maxOutbreakWeight = scan.weight;
        // outbreak window: >=2 sick simultaneously (the topic's own threshold)
        if (!inWindow && sickReg.length >= 2) {
          inWindow = true; windowStart = day(); peakSick = sickReg.length; peakWeight = scan.weight;
          if (convosThisRun < 4) {
            const sick = sickReg.find(r => String(r) !== String(Game.villagerId)) || sickReg[0];
            const well = (v.roster || []).find(r => !sickReg.includes(r) && String(r) !== String(Game.villagerId));
            const t1 = driveConvo(Game, sick, `seed${seed} d${day()} SICK-VILLAGER during outbreak`);
            const f1 = `journey-crisis-r31-seed${seed}-d${day()}-sick.txt`;
            writeTranscript(t1, f1);
            rec.convosDriven.push({ day: day(), tag: 'sick-during-outbreak', file: f1 });
            convosThisRun++;
            if (well) {
              const t2 = driveConvo(Game, well, `seed${seed} d${day()} WELL-VILLAGER during outbreak`);
              const f2 = `journey-crisis-r31-seed${seed}-d${day()}-well.txt`;
              writeTranscript(t2, f2);
              rec.convosDriven.push({ day: day(), tag: 'well-during-outbreak', file: f2 });
              convosThisRun++;
            }
          }
        } else if (inWindow) {
          if (sickReg.length > peakSick) peakSick = sickReg.length;
          if (scan.weight > peakWeight) peakWeight = scan.weight;
          if (sickReg.length < 2) {
            inWindow = false;
            rec.outbreakWindows.push({ startDay: windowStart, endDay: day(), peakSick, peakWeight });
          }
        }
      } catch (e) {}
    },
    fight: oracleV2.fight ? oracleV2.fight.bind(oracleV2) : undefined,
    contest: oracleV2.contest ? oracleV2.contest.bind(oracleV2) : undefined,
  };

  let deadTail = 0, endReason = 'horizon';
  for (let d = 1; d <= DAYS; d++) {
    let res;
    try { res = await runDays(Game, policy, { days: 1, sampleEvery: 1 }); }
    catch (e) { endReason = 'threw:' + e.message; break; }
    rec.days = d;
    // new deaths this chunk -> grief convos
    try {
      const ds = (res.samples && res.samples.deaths) || [];
      for (const de of ds.slice(seenDeaths)) {
        seenDeaths++;
        if (de.player) continue;
        const lastSick = sickAtDeath.get(String(de.who));
        const sickLinked = lastSick != null && (day() - lastSick) <= 3;
        if (sickLinked && !griefPending && convosThisRun < 6) {
          griefPending = { day: day(), who: de.who };
        }
      }
    } catch (e) {}
    // drive grief convo within 7 days of a sickness-linked death
    if (griefPending && day() - griefPending.day >= 1 && day() - griefPending.day <= 7 && convosThisRun < 6) {
      try {
        const v = Game.state.village || {};
        const mourner = (v.roster || []).find(r => String(r) !== String(Game.villagerId));
        if (mourner) {
          const t = driveConvo(Game, mourner, `seed${seed} d${day()} AFTER-SICKNESS-DEATH`);
          const f = `journey-crisis-r31-seed${seed}-d${day()}-grief.txt`;
          writeTranscript(t, f);
          rec.convosDriven.push({ day: day(), tag: 'after-sickness-death', file: f });
          convosThisRun++;
          rec.griefConvos++;
          griefPending = null;
        }
      } catch (e) { griefPending = null; }
    }
    if (Game.over) { endReason = 'game-over'; break; }
    try {
      const alive = ((Game.state.village || {}).roster || []).length;
      if (alive <= 0) { if (++deadTail >= 10) { endReason = 'village-dead'; break; } }
      else deadTail = 0;
    } catch (e) {}
  }
  if (inWindow) rec.outbreakWindows.push({ startDay: windowStart, endDay: day(), peakSick, open: true });
  rec.endReason = endReason;

  // end-of-run: tended counts + outbreak-topic surfacing + canon scan
  try {
    for (const k of seen) {
      for (const m of mems(Game, k)) {
        if (m.t === 'tended') rec.tendedAtEnd++;
        if (m.t === 'tended_by') rec.tendedByAtEnd++;
      }
    }
  } catch (e) {}
  for (const c of rec.convosDriven) {
    try {
      const txt = fs.readFileSync(path.join(EVID, c.file), 'utf8');
      const body = txt.split('\n').slice(1).join('\n').toLowerCase(); // skip our own header (contains 'outbreak' in the tag)
      if (/sickness going around|the sickness|outbreak/.test(body)) rec.outbreakTopicSurfaced++;
    } catch (e) {}
  }
  for (const s of says) {
    const low = s.line.toLowerCase();
    if (/sick|illness|plague|contagion|feverish|outbreak|tended|sat with/.test(low)) rec.sayOutbreakLines++;
    for (const nm of CANON_NAMES) {
      if (low.includes(nm)) rec.canonHits.push({ day: s.day, line: s.line.slice(0, 160) });
    }
  }
  console.log(JSON.stringify(rec));
}

(async () => {
  try { fs.mkdirSync(EVID, { recursive: true }); } catch (e) {}
  for (const s of SEEDS) {
    try { await playSeed(s); }
    catch (e) { console.log(JSON.stringify({ seed: s, error: String(e && e.message || e) })); }
  }
})();
