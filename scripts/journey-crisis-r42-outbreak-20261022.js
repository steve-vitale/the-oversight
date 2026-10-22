#!/usr/bin/env node
// journey-crisis-r42-outbreak-20261022.js — CRISIS LEG (6) r42: THE SICKNESS RELIEF LAYER.
// Leg question: r41 showed the HUNGER relief stack fires and answers. Does the
// SICKNESS relief layer (raiseRelief('sickness'): triage/rations/hunt/rally)
// fire when outbreaks sweep? Does the village bend beyond the care machinery
// (medic tending): triage tents, the hygiene suppression (v.triageHygiene), the
// sick staying home from departures, mourning parity for sickness deaths
// (r32's named-next, never verified per-death)?
//
// PRE-REGISTRATION (written before any play, 2026-10-22):
//   Canon: docs/DISEASES.md (symptoms only, never true names undiagnosed;
//   two pools never mix), docs/PRESERVATION.md.
//   Seeds: 101, 202, 303, 404 (continuity r41). Policy: oracleV2 (competent).
//   Horizon: 120d (20 establish + 100 window), 1-day chunks, death-aware stop
//   (pop<=1, +10d tail max).
//   Interesting bars (any): (a) outbreak where sickness relief NEVER opens;
//   (b) sick villagers depositing production in-window (stay-home leak);
//   (c) >=1 sickness death with no mourning signal within 7d; (d) undiagnosed
//   true disease name in relief/say lines; (e) compound: outbreak inside a
//   famine window -> the "And now sickness, on top of it all" framing fires.
//   Metrics (§14-bound):
//   - M1 (outbreak reached): >=2/4 seeds with an outbreak window (>=2 sick
//     simultaneously, >=3 consecutive days, pop>1). GO if met; else force an
//     outbreak instrumented (v.sick injection on 3 villagers).
//   - M2 (relief fires): in >=2/4 outbreak seeds, sickness relief opens on a
//     window day (state.relief.kind=='sickness' seen day within window). GO.
//   - M3 (care response): tended or tended_by fires during outbreak windows in
//     >=3/4 outbreak seeds. GO.
//   - M4 (mourning parity): 100% of sickness deaths -> MOURN_RE say line
//     within 7d. GO if 100%.
//   - M5 (sick stay home): 0 sick departures (leaving haven while in v.sick)
//     AND 0 production deposits ('Foraged food'/'Game meat'/'Fish catch'/
//     'Garden harvest') attributed to a villager sick on the deposit day,
//     across all outbreak windows. GO if 0.
//   - M6 (no theater): 0 fabricated-history lines in sampled outbreak convos. GO.
// Usage: SEED=101 node scripts/journey-crisis-r42-outbreak-20261022.js
// Output: JSON record to stdout; narrative to stderr.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '101', 10);
const DAYS = parseInt(process.env.DAYS || '120', 10);
const EVID = process.env.EVID || path.join(ROOT, 'evidence', '2026-10-22');
const FAMINE_PC_KCAL = 1500;
const CANON_NAMES = ['gut rot', 'trichinosis', 'lockjaw', 'wound fever', 'trembles'];
const MOURN_RE = /mourn|grief|griev|grave|burial|funeral|fire feels smaller|Nobody's talking much|The village mourns|first grave|we buried|laid to rest|succumbed to/i;
const SICKACK_RE = /sick row|fever|contagion|triage tent|quarantine|keeping away|staying clear|don't come close|the sick|illness going around/i;

function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try { return Math.round((Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)); } catch (e) { return 0; }
}
function livingCount(Game) {
  try {
    return (Game.state.village.roster || []).filter(id => { try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; } }).length;
  } catch (e) { return 1; }
}
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
// v.sick registry — the SAME source the 'outbreak' lately-topic scans.
function sickScanOf(Game) {
  const out = { vids: [], weight: 0 };
  try {
    const v = Game.state.village || {};
    for (const id of (v.roster || [])) {
      const s = (v.sick || {})[id];
      let svp = null;
      try { svp = Game.vpOf(id); } catch (e) {}
      if (s && (s.daysLeft || 0) > 0 && svp && !svp.dead) {
        out.vids.push(String(id));
        out.weight += ((s.severity || 1) >= 2) ? 2 : 1;
      }
    }
  } catch (e) {}
  return out;
}
function mems(Game, vid) {
  try { return (typeof Game.t2mem === 'function' ? Game.t2mem(vid) : []) || []; } catch (e) { return []; }
}
const FABRIC_RE = /we've always|since the beginning|you remember when|like old times|remember the old|back when we|for as long as/i;

function driveConvo(Game, vid, tag, out) {
  out.push(`## ${tag} — talking to ${rawName(Game, vid)} (d${dayOf(Game)})`);
  const npcLines = [];
  let opened;
  try { opened = Game.startConvo(vid); } catch (e) { out.push(`(startConvo threw: ${e.message})`); return npcLines; }
  if (!opened || opened.refused || opened.ended) { out.push(`(conversation refused/ended)`); return npcLines; }
  for (let t = 0; t < 12; t++) {
    let choices;
    try { choices = Game.convoChoices(vid) || []; } catch (e) { break; }
    if (!choices.length) { out.push('(no choices offered)'); break; }
    // r40 metric review: force ask:lately first (the outbreak topic lives in lately),
    // then sickness-relevant picks.
    let pick = (t === 0) ? choices.find(c => c.id === 'ask:lately') : null;
    if (!pick) pick = choices.find(c => /^gq:/.test(c.id));
    if (!pick) pick = choices.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
    if (!pick) pick = choices.find(c => /sick|ill|fever|cough|worse|better|triage|tent|dead|died|gone|mourn|afraid|worried|tired/i.test(c.text || ''));
    if (!pick) pick = choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick || /^(leave|bye|goodbye)/.test(pick.id)) break;
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 90)}`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    let c;
    try { c = Game.convoGet(vid); } catch (e) { break; }
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
    for (const e of (c.transcript || []).slice(-2)) {
      out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 420)}`);
      if (e.who !== 'you') npcLines.push(String(e.text));
    }
    out.push('');
    if (t >= 3 && pick.id === 'ask:lately') break;
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  return npcLines;
}

async function main() {
  const E = console.error;
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-outbreak-r42', fullTelemetry: true });
  await setupGame(Game);
  const rec = {
    seed: SEED, days: 0, endReason: '',
    outbreakWindows: [], maxOutbreakWeight: 0,
    reliefOpenings: [],      // {day, kind, speaker, compound}
    reliefUsed: {},          // option -> day
    triageHygieneDays: [],   // {from, until}
    diseaseCases: [], deaths: [], sicknessDeaths: [],
    deposits: [],            // {day, kcal, by:[rids], name}
    sickDeposits: 0,         // M5 violations
    sayLines: [],            // {day, line}
    convosDriven: [], compoundFramingLines: 0,
    famineDays: 0, famineOutbreakOverlapDays: 0,
  };
  const diseaseState = new Map();
  const seen = new Set();

  // ---- say capture ----
  const _say = Game.say.bind(Game);
  Game.say = function (t) {
    try { rec.sayLines.push({ day: dayOf(Game), line: String(t) }); } catch (e) {}
    return _say(t);
  };

  // ---- relief capture: wrap raiseRelief + snapshot state.relief daily ----
  // (wrap marks reliefSeen so the daily snapshot never double-counts)
  const reliefSeen = new Set();
  const _rr = Game.raiseRelief ? Game.raiseRelief.bind(Game) : null;
  if (_rr) {
    Game.raiseRelief = function (kind, ctx) {
      let r;
      try { r = _rr(kind, ctx); } catch (e) { r = null; }
      try {
        if (r && r.sinceDay != null) {
          const key = r.sinceDay + '|' + kind;
          if (!reliefSeen.has(key)) {
            reliefSeen.add(key);
            const scan = sickScanOf(Game);
            rec.reliefOpenings.push({
              day: dayOf(Game), kind: String(kind),
              speaker: String((r && r.speaker) || ''),
              sickNow: scan.vids.length, compound: kind === 'sickness' && scan.vids.length >= 2,
            });
          }
        }
      } catch (e) {}
      return r;
    };
  }
  const hygieneSeen = new Set();

  // ---- deposit attribution: wrap stockPantry ----
  // M5 (sick stay home): only PRODUCTION deposits count — 'Ration returned'
  // is the player's half-meal going back in the bins (attributed to whoever's
  // pieces were in the draw), not labor. Sick departures are tracked via the
  // daily v.away diff below (the objMaybeDepart stay-home gate is the design).
  const _sp = Game.stockPantry ? Game.stockPantry.bind(Game) : null;
  const PROD_NAMES = /foraged food|game meat|fish catch|garden harvest/i;
  if (_sp) {
    Game.stockPantry = function (kcal, name, opts) {
      let by = [];
      try {
        const hs = (opts && opts.harvestShares) || {};
        by = Object.keys(hs);
      } catch (e) {}
      try {
        const nm = String(name || '');
        if (PROD_NAMES.test(nm)) {
          const sickNow = new Set(sickScanOf(Game).vids);
          const sickBy = by.filter(id => sickNow.has(String(id)));
          if (sickBy.length) rec.sickDeposits += 1;
          rec.deposits.push({ day: dayOf(Game), kcal: Math.round(kcal || 0), name: nm, by, sickBy });
        }
      } catch (e) {}
      return _sp(kcal, name, opts);
    };
  }
  // ---- sick departures: daily v.away diff (the stay-home gate check) ----
  rec.sickDepartures = [];

  // ---- disease case scan (r31) ----
  const scanDiseases = () => {
    const v = Game.state.village || {};
    const now = new Set();
    for (const rid of (v.roster || [])) {
      let list = [];
      try { list = Game.seList((v.rosterChars || {})[rid] || {}) || []; } catch (e) {}
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
          rec.diseaseCases.push({ day: dayOf(Game), target: rawName(Game, rid), disease: id, pool, kind: 'contracted' });
        }
      }
    }
    for (const key of [...diseaseState.keys()]) {
      if (!now.has(key)) {
        diseaseState.delete(key);
        const m = key.match(/^(v:[^:]+):(.+)$/);
        rec.diseaseCases.push({ day: dayOf(Game), target: m ? m[1] : key, disease: m ? m[2] : '?', kind: 'ended' });
      }
    }
  };

  const policy = {
    id: 'crisis-journey-r42',
    setup: oracleV2.setup ? oracleV2.setup.bind(oracleV2) : undefined,
    upkeep: oracleV2.upkeep ? oracleV2.upkeep.bind(oracleV2) : undefined,
    daily: function (G, ctx) {
      // DAWN snapshot: sick set + away keys BEFORE the day's ticks — the
      // stay-home gate is a departure-time check, so a sick departure only
      // counts if they were sick at dawn (not sickened mid-day while away).
      let dawnSick = new Set(), dawnAway = new Set();
      try {
        dawnSick = new Set(sickScanOf(Game).vids);
        dawnAway = new Set(Object.keys((Game.state.village || {}).away || {}));
      } catch (e) {}
      try { if (oracleV2.daily) oracleV2.daily.call(oracleV2, G, ctx); } catch (e) {}
      try {
        // sick departures: left haven today while sick at dawn (gate leak)
        const away = ((Game.state.village || {}).away || {});
        for (const rid of Object.keys(away)) {
          const key = String(rid);
          if (!dawnAway.has(key) && dawnSick.has(key)) {
            rec.sickDepartures.push({ day: dayOf(Game), vid: key, name: rawName(Game, rid), purpose: String((away[rid] || {}).purpose || ''), dawnSick: true });
          }
        }
        // (same try continues — the day's instrument body)
        const v = Game.state.village || {};
        for (const rid of (v.roster || [])) seen.add(String(rid));
        scanDiseases();
        const scan = sickScanOf(Game);
        for (const rid of scan.vids) sickAtDeath.set(String(rid), dayOf(Game));
        if (scan.weight > rec.maxOutbreakWeight) rec.maxOutbreakWeight = scan.weight;
        // relief snapshot: state.relief transitions + used options + hygiene
        try {
          const rel = Game.state.relief;
          if (rel && !reliefSeen.has(rel.sinceDay + '|' + rel.kind)) {
            reliefSeen.add(rel.sinceDay + '|' + rel.kind);
            rec.reliefOpenings.push({ day: dayOf(Game), kind: String(rel.kind), speaker: String(rel.speaker || ''), sickNow: scan.vids.length, via: 'snapshot' });
          }
          for (const k of Object.keys((rel && rel.used) || {})) {
            if (!rec.reliefUsed[k]) rec.reliefUsed[k] = dayOf(Game);
          }
        } catch (e) {}
        try {
          const th = v.triageHygiene;
          if (th && !hygieneSeen.has(th.until)) {
            hygieneSeen.add(th.until);
            rec.triageHygieneDays.push({ day: dayOf(Game), from: dayOf(Game), until: th.until, by: String(th.by || '') });
          }
        } catch (e) {}
        // famine-day check (for compound): dawn per-capita pantry
        try {
          const pc = livingCount(Game) > 0 ? pantryKcal(Game) / livingCount(Game) : 0;
          if (pc < FAMINE_PC_KCAL && livingCount(Game) > 1) {
            rec.famineDays++;
            if (scan.vids.length >= 2) rec.famineOutbreakOverlapDays++;
          }
        } catch (e) {}
        // outbreak windows
        if (!inWindow && scan.vids.length >= 2) {
          inWindow = true; windowStart = dayOf(Game); peakSick = scan.vids.length; peakWeight = scan.weight;
          if (convosThisRun < 4) {
            const sick = scan.vids.find(r => String(r) !== String(Game.villagerId)) || scan.vids[0];
            const well = (v.roster || []).find(r => !scan.vids.includes(String(r)) && String(r) !== String(Game.villagerId));
            const lines = [];
            const npc1 = driveConvo(Game, sick, `seed${SEED} d${dayOf(Game)} SICK-VILLAGER during outbreak`, lines);
            const f1 = `journey-crisis-r42-seed${SEED}-d${dayOf(Game)}-sick.txt`;
            fs.writeFileSync(path.join(EVID, f1), lines.join('\n'), 'utf8');
            rec.convosDriven.push({ day: dayOf(Game), tag: 'sick-during-outbreak', file: f1, npcLines: npc1.length });
            convosThisRun++;
            if (well) {
              const lines2 = [];
              const npc2 = driveConvo(Game, well, `seed${SEED} d${dayOf(Game)} WELL-VILLAGER during outbreak`, lines2);
              const f2 = `journey-crisis-r42-seed${SEED}-d${dayOf(Game)}-well.txt`;
              fs.writeFileSync(path.join(EVID, f2), lines2.join('\n'), 'utf8');
              rec.convosDriven.push({ day: dayOf(Game), tag: 'well-during-outbreak', file: f2, npcLines: npc2.length });
              convosThisRun++;
            }
          }
        } else if (inWindow) {
          if (scan.vids.length > peakSick) peakSick = scan.vids.length;
          if (scan.weight > peakWeight) peakWeight = scan.weight;
          if (scan.vids.length < 2) {
            inWindow = false;
            rec.outbreakWindows.push({ startDay: windowStart, endDay: dayOf(Game), peakSick, peakWeight });
          }
        }
      } catch (e) {}
    },
    fight: oracleV2.fight ? oracleV2.fight.bind(oracleV2) : undefined,
    contest: oracleV2.contest ? oracleV2.contest.bind(oracleV2) : undefined,
  };

  const sickAtDeath = new Map();
  let inWindow = false, windowStart = 0, peakSick = 0, peakWeight = 0;
  let convosThisRun = 0, griefPending = null, seenDeaths = 0;
  let deadTail = 0, endReason = 'horizon';

  for (let d = 1; d <= DAYS; d++) {
    let res;
    try { res = await runDays(Game, policy, { days: 1, sampleEvery: 1 }); }
    catch (e) { endReason = 'threw:' + e.message; break; }
    rec.days = d;
    try {
      const ds = (res.samples && res.samples.deaths) || [];
      for (const de of ds.slice(seenDeaths)) {
        seenDeaths++;
        const lastSick = sickAtDeath.get(String(de.who));
        const sickLinked = lastSick != null && (dayOf(Game) - lastSick) <= 3;
        const cause = String(de.cause || de.how || '');
        const isSickness = sickLinked || /sick|fever|disease|gut rot|lockjaw|wound fever|trembles|trichinosis/i.test(cause);
        rec.deaths.push({ day: dayOf(Game), name: rawName(Game, de.who), cause, sickLinked: !!sickLinked, sicknessDeath: !!isSickness, player: !!de.player });
        if (isSickness && !de.player) rec.sicknessDeaths.push({ day: dayOf(Game), name: rawName(Game, de.who), cause });
        if (de.player) continue;
        if (isSickness && !griefPending && convosThisRun < 6) griefPending = { day: dayOf(Game), who: de.who, name: rawName(Game, de.who) };
      }
    } catch (e) {}
    if (griefPending && dayOf(Game) - griefPending.day >= 1 && dayOf(Game) - griefPending.day <= 7 && convosThisRun < 6) {
      try {
        const v = Game.state.village || {};
        const mourner = (v.roster || []).find(r => String(r) !== String(Game.villagerId));
        if (mourner) {
          const lines = [];
          const npc = driveConvo(Game, mourner, `seed${SEED} d${dayOf(Game)} AFTER-SICKNESS-DEATH (${griefPending.name})`, lines);
          const f = `journey-crisis-r42-seed${SEED}-d${dayOf(Game)}-grief.txt`;
          fs.writeFileSync(path.join(EVID, f), lines.join('\n'), 'utf8');
          rec.convosDriven.push({ day: dayOf(Game), tag: 'after-sickness-death', file: f, npcLines: npc.length });
          convosThisRun++;
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
  if (inWindow) rec.outbreakWindows.push({ startDay: windowStart, endDay: dayOf(Game), peakSick, peakWeight, open: true });
  rec.endReason = endReason;

  // ---- end-of-run: census + tended counts + line scans ----
  try {
    const v = Game.state.village || {};
    const cen = { scattered: !!v.scattered, extinct: !!v.extinct };
    const alive = [], dead = [];
    for (const id of (v.roster || [])) {
      let p = null; try { p = Game.vpOf(id); } catch (e) {}
      let nm = id; try { nm = Game.displayName(id) || id; } catch (e) {}
      if (p && !p.dead) alive.push(nm); else dead.push(nm);
    }
    cen.aliveCount = alive.length; cen.deadCount = dead.length;
    cen.alive = alive; cen.dead = dead;
    try {
      const corpses = (typeof Game.corpses === 'function') ? Game.corpses() : (Game.state.corpses || []);
      cen.corpses = corpses.filter(c => c && ((typeof Game.corpseIsPerson === 'function' && Game.corpseIsPerson(c)) || c.kind === 'person' || c.kind === 'villager'))
        .map(c => ({ name: c.name || c.villagerId, cause: c.cause, day: c.dayDied }));
    } catch (e) { cen.corpses = []; }
    try { cen.pantryKcal = Math.round(Game.pantryKcalLive(v)); } catch (e) { cen.pantryKcal = v.pantryKcal || 0; }
    rec.census = cen;
  } catch (e) { rec.census = { error: e.message }; }

  let tendedAtEnd = 0, tendedByAtEnd = 0;
  try {
    for (const k of seen) {
      for (const m of mems(Game, k)) {
        if (m.t === 'tended') tendedAtEnd++;
        if (m.t === 'tended_by') tendedByAtEnd++;
      }
    }
  } catch (e) {}
  rec.tendedAtEnd = tendedAtEnd; rec.tendedByAtEnd = tendedByAtEnd;

  // line scans
  rec.reliefProposalLines = 0; rec.sickAckLines = 0; rec.mournLines = 0;
  rec.canonHits = []; rec.fabricHits = [];
  for (const s of rec.sayLines) {
    const line = s.line, low = line.toLowerCase();
    if (/🛟|relief is open|triage, rations, hunt|we can't just watch/i.test(line)) rec.reliefProposalLines++;
    if (/and now sickness, on top of it all/i.test(line)) rec.compoundFramingLines++;
    if (SICKACK_RE.test(low)) rec.sickAckLines++;
    if (MOURN_RE.test(low)) rec.mournLines++;
    for (const nm of CANON_NAMES) {
      if (low.includes(nm)) rec.canonHits.push({ day: s.day, line: line.slice(0, 160) });
    }
    if (FABRIC_RE.test(line)) rec.fabricHits.push({ day: s.day, line: line.slice(0, 160) });
  }
  // M4: mourning parity per sickness death — a mourning line within 7d after
  for (const sd of rec.sicknessDeaths) {
    const mourned = rec.sayLines.some(s => s.day >= sd.day && s.day <= sd.day + 7 && MOURN_RE.test(s.line));
    sd.mournedWithin7d = mourned;
  }
  console.log(JSON.stringify(rec));
}

(async () => {
  try { fs.mkdirSync(EVID, { recursive: true }); } catch (e) {}
  try { await main(); }
  catch (e) { console.log(JSON.stringify({ seed: SEED, error: String(e && e.message || e) })); }
})();
