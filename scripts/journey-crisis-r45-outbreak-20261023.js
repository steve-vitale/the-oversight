#!/usr/bin/env node
// journey-crisis-r45-outbreak-20261023.js — CRISIS LEG (6) r45: THE COMPOUND, LIVED.
// Leg question: r44 landed two fixes but died before its pilot — do the
// compound framing ("And now X, on top of it all", compounds once) and the
// disease-name knowledge gate (symptom-honest until diagnosed) play correctly
// in NATURAL runs? Plus r43's metric-review instrument fixes for the sickness
// relief panel (M3' per-window tended marks; M4' deaths = samples ∪ corpses,
// player deaths included; true compound = different-kind raise while a relief
// is open; the seList disease-case scanner is dropped).
//
// PRE-REGISTRATION (written before any play, 2026-10-23):
//   Canon: docs/DISEASES.md (symptoms only, never true names undiagnosed;
//   two pools never mix). Seeds: 101, 202, 303, 404 (continuity r41-r44).
//   Policy: oracleV2 (competent). Horizon: 120d, death-aware (+10d tail).
//   §14-bound metrics:
//   - M1 (outbreak reached): >=2/4 seeds with an outbreak window (>=2 sick
//     simultaneously, >=3 consecutive days, pop>1). GO if met.
//   - M2 (relief fires): in >=2/4 outbreak seeds, sickness relief opens on a
//     window day. GO.
//   - M3' (care response, r43 metric-review #1): tended/tended_by marks fired
//     on >=1 window day in >=3/4 outbreak seeds. GO.
//   - M4' (mourning parity, r43 metric-review #2): 100% of sickness deaths
//     (union of harness samples + corpses registry, player deaths included
//     and flagged) -> MOURN_RE say line within 7d. GO if 100%.
//   - M5 (sick stay home): 0 sick dawn-departures AND 0 production deposits
//     attributed to a villager sick on the deposit day, across outbreak
//     windows. GO if 0 (letter binding; recorded as observed).
//   - M6 (no theater): 0 fabricated-history lines in sampled outbreak convos.
//     GO.
//   - M7 (compound reachability, r44's fix under natural load): >=1
//     true-compound raise (different-kind raiseRelief while a relief is
//     open) on >=1/4 seeds, AND compound-line firings == compound raises
//     (exactly-once per compounding). GO if both hold.
//   Interesting bars (any): (a) outbreak where sickness relief NEVER opens;
//   (b) sick villagers depositing production in-window; (c) sickness death
//   with no mourning <=7d; (d) TRUE-NAME REGRESSION: undiagnosed true disease
//   name in a scholar warning/death line (villageKnowsDisease(id)==false at
//   say time); (e) the compound line firing more than once per compounding,
//   or not firing when a compound raise happened.
// Usage: SEED=101 node scripts/journey-crisis-r45-outbreak-20261023.js
// Output: JSON record to stdout; narrative to stderr.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '101', 10);
const DAYS = parseInt(process.env.DAYS || '120', 10);
const EVID = process.env.EVID || path.join(ROOT, 'evidence', '2026-10-23');
const FAMINE_PC_KCAL = 1500;
const CANON_IDS = { 'gut rot': 'gutrot', 'trichinosis': 'trichinosis', 'lockjaw': 'lockjaw', 'wound fever': 'wound_fever', 'trembles': 'trembles' };
const MOURN_RE = /mourn|grief|griev|grave|burial|funeral|fire feels smaller|Nobody's talking much|The village mourns|first grave|we buried|laid to rest|succumbed to/i;
const SICKACK_RE = /sick row|fever|contagion|triage tent|quarantine|keeping away|staying clear|don't come close|the sick|illness going around/i;
const COMPOUND_LINE_RE = /and now .*?,?\s*on top of it all/i;

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
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-outbreak-r45', fullTelemetry: true });
  await setupGame(Game);
  const rec = {
    seed: SEED, days: 0, endReason: '',
    outbreakWindows: [], maxOutbreakWeight: 0,
    reliefOpenings: [],      // {day, kind, speaker, sickNow, via}
    compoundRaises: [],      // {day, fromKind, toKind} — r44 true-compound
    reliefUsed: {},
    triageHygieneDays: [],
    deaths: [], sicknessDeaths: [],
    deposits: [], sickDeposits: 0, sickDepartures: [],
    sayLines: [],
    convosDriven: [], compoundFramingLines: 0,
    trueNameHits: [],        // {day, line, name, id, knowsDisease}
    famineDays: 0, famineOutbreakOverlapDays: 0,
  };
  const seen = new Set();

  // ---- say capture ----
  const _say = Game.say.bind(Game);
  Game.say = function (t) {
    try { rec.sayLines.push({ day: dayOf(Game), line: String(t) }); } catch (e) {}
    return _say(t);
  };

  // ---- relief capture: wrap raiseRelief + daily snapshot ----
  const reliefSeen = new Set();
  const _rr = Game.raiseRelief ? Game.raiseRelief.bind(Game) : null;
  if (_rr) {
    Game.raiseRelief = function (kind, ctx) {
      const before = Game.state.relief ? Game.state.relief.kind : null;
      let r;
      try { r = _rr(kind, ctx); } catch (e) { r = null; }
      try {
        if (r) {
          const key = (r.sinceDay != null ? r.sinceDay : dayOf(Game)) + '|' + kind;
          if (!reliefSeen.has(key)) {
            reliefSeen.add(key);
            const scan = sickScanOf(Game);
            rec.reliefOpenings.push({
              day: dayOf(Game), kind: String(kind),
              speaker: String((r && r.speaker) || ''),
              sickNow: scan.vids.length, via: 'wrap',
            });
          }
          // true compound: a different-kind raise landed while a relief was
          // open (r43 metric-review #3 — no more mislabeled `compound` flag)
          if (before && before !== String(kind)) {
            rec.compoundRaises.push({ day: dayOf(Game), fromKind: String(before), toKind: String(kind), compounded: !!r.compounded });
          }
        }
      } catch (e) {}
      return r;
    };
  }
  const hygieneSeen = new Set();

  // ---- deposit attribution: wrap stockPantry (production only) ----
  const _sp = Game.stockPantry ? Game.stockPantry.bind(Game) : null;
  const PROD_NAMES = /foraged food|game meat|fish catch|garden harvest/i;
  if (_sp) {
    Game.stockPantry = function (kcal, name, opts) {
      let by = [];
      try { by = Object.keys((opts && opts.harvestShares) || {}); } catch (e) {}
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

  // ---- tended/tended_by daily deltas (r43 metric-review #1: per-window) ----
  let prevTended = new Map(); // vid -> {tended, tended_by}
  const tendedToday = { tended: 0, tended_by: 0 };
  const tendedOnWindowDays = []; // {day, tended, tended_by}
  function tendedDiff(windowDay) {
    const now = new Map();
    let dT = 0, dTB = 0;
    try {
      for (const id of seen) {
        let t = 0, tb = 0;
        for (const m of mems(Game, id)) {
          if (m.t === 'tended') t++;
          if (m.t === 'tended_by') tb++;
        }
        now.set(String(id), { t, tb });
        const p = prevTended.get(String(id)) || { t: 0, tb: 0 };
        dT += Math.max(0, t - p.t);
        dTB += Math.max(0, tb - p.tb);
      }
    } catch (e) {}
    prevTended = now;
    tendedToday.tended = dT; tendedToday.tended_by = dTB;
    if (windowDay && (dT + dTB) > 0) tendedOnWindowDays.push({ day: dayOf(Game), tended: dT, tended_by: dTB });
    return { tended: dT, tended_by: dTB };
  }
  rec.tendedOnWindowDays = tendedOnWindowDays;

  const policy = {
    id: 'crisis-journey-r45',
    setup: oracleV2.setup ? oracleV2.setup.bind(oracleV2) : undefined,
    upkeep: oracleV2.upkeep ? oracleV2.upkeep.bind(oracleV2) : undefined,
    daily: function (G, ctx) {
      let dawnSick = new Set(), dawnAway = new Set();
      try {
        dawnSick = new Set(sickScanOf(Game).vids);
        dawnAway = new Set(Object.keys((Game.state.village || {}).away || {}));
      } catch (e) {}
      try { if (oracleV2.daily) oracleV2.daily.call(oracleV2, G, ctx); } catch (e) {}
      try {
        const away = ((Game.state.village || {}).away || {});
        for (const rid of Object.keys(away)) {
          const key = String(rid);
          if (!dawnAway.has(key) && dawnSick.has(key)) {
            rec.sickDepartures.push({ day: dayOf(Game), vid: key, name: rawName(Game, rid), purpose: String((away[rid] || {}).purpose || ''), dawnSick: true });
          }
        }
        const v = Game.state.village || {};
        for (const rid of (v.roster || [])) seen.add(String(rid));
        const scan = sickScanOf(Game);
        const windowDay = scan.vids.length >= 2;
        for (const rid of scan.vids) sickAtDeath.set(String(rid), dayOf(Game));
        if (scan.weight > rec.maxOutbreakWeight) rec.maxOutbreakWeight = scan.weight;
        tendedDiff(windowDay);
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
        try {
          const pc = livingCount(Game) > 0 ? pantryKcal(Game) / livingCount(Game) : 0;
          if (pc < FAMINE_PC_KCAL && livingCount(Game) > 1) {
            rec.famineDays++;
            if (scan.vids.length >= 2) rec.famineOutbreakOverlapDays++;
          }
        } catch (e) {}
        if (!inWindow && windowDay) {
          inWindow = true; windowStart = dayOf(Game); peakSick = scan.vids.length; peakWeight = scan.weight;
          if (convosThisRun < 4) {
            const sick = scan.vids.find(r => String(r) !== String(Game.villagerId)) || scan.vids[0];
            const well = (v.roster || []).find(r => !scan.vids.includes(String(r)) && String(r) !== String(Game.villagerId));
            const lines = [];
            const npc1 = driveConvo(Game, sick, `seed${SEED} d${dayOf(Game)} SICK-VILLAGER during outbreak`, lines);
            const f1 = `journey-crisis-r45-seed${SEED}-d${dayOf(Game)}-sick.txt`;
            fs.writeFileSync(path.join(EVID, f1), lines.join('\n'), 'utf8');
            rec.convosDriven.push({ day: dayOf(Game), tag: 'sick-during-outbreak', file: f1, npcLines: npc1.length });
            convosThisRun++;
            if (well) {
              const lines2 = [];
              const npc2 = driveConvo(Game, well, `seed${SEED} d${dayOf(Game)} WELL-VILLAGER during outbreak`, lines2);
              const f2 = `journey-crisis-r45-seed${SEED}-d${dayOf(Game)}-well.txt`;
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
            rec.outbreakWindows.push({ startDay: windowStart, endDay: dayOf(Game), peakSick, peakWeight, tendedDays: tendedOnWindowDays.filter(w => w.day >= windowStart && w.day <= dayOf(Game)) });
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
          const f = `journey-crisis-r45-seed${SEED}-d${dayOf(Game)}-grief.txt`;
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
  if (inWindow) rec.outbreakWindows.push({ startDay: windowStart, endDay: dayOf(Game), peakSick, peakWeight, open: true, tendedDays: tendedOnWindowDays.filter(w => w.day >= windowStart) });
  rec.endReason = endReason;

  // ---- end-of-run: census + corpses union (r43 metric-review #2) ----
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
        .map(c => ({ name: c.name || c.villagerId, cause: String(c.cause || ''), day: c.dayDied, player: !!c.player }));
    } catch (e) { cen.corpses = []; }
    try { cen.pantryKcal = Math.round(Game.pantryKcalLive(v)); } catch (e) { cen.pantryKcal = v.pantryKcal || 0; }
    rec.census = cen;
  } catch (e) { rec.census = { error: e.message }; }

  // sickness deaths = union(samples, corpses), player included with flag
  const sicknessDeaths = new Map();
  for (const de of rec.deaths) {
    if (de.sicknessDeath) {
      const k = 's:' + de.day + ':' + de.name;
      sicknessDeaths.set(k, { day: de.day, name: de.name, cause: de.cause, player: de.player, src: 'samples' });
    }
  }
  for (const c of (rec.census.corpses || [])) {
    const cause = String(c.cause || '');
    const isSickness = /sick|fever|disease|gut ?rot|lockjaw|wound fever|trembles|trichinosis/i.test(cause);
    if (isSickness && c.day != null) {
      const k = 'c:' + c.day + ':' + c.name;
      if (![...sicknessDeaths.values()].some(s => s.name === c.name && Math.abs(s.day - c.day) <= 2)) {
        sicknessDeaths.set(k, { day: c.day, name: c.name, cause, player: !!c.player, src: 'corpses' });
      }
    }
  }
  rec.sicknessDeaths = [...sicknessDeaths.values()];
  for (const sd of rec.sicknessDeaths) {
    sd.mournedWithin7d = rec.sayLines.some(s => s.day >= sd.day && s.day <= sd.day + 7 && MOURN_RE.test(s.line));
  }

  // ---- line scans: relief proposal, compound line, true-name gate, fabric ----
  rec.reliefProposalLines = 0; rec.sickAckLines = 0; rec.mournLines = 0;
  rec.canonHits = []; rec.fabricHits = [];
  const WARN_CTX = /days, not weeks|settling|settle what matters|~2 days left/i;
  for (const s of rec.sayLines) {
    const line = s.line, low = line.toLowerCase();
    if (/🛟|relief is open|triage, rations, hunt|we can't just watch/i.test(line)) rec.reliefProposalLines++;
    if (COMPOUND_LINE_RE.test(line)) rec.compoundFramingLines++;
    if (SICKACK_RE.test(low)) rec.sickAckLines++;
    if (MOURN_RE.test(low)) rec.mournLines++;
    for (const [nm, id] of Object.entries(CANON_IDS)) {
      if (low.includes(nm)) {
        let knows = null;
        try { knows = Game.villageKnowsDisease ? !!Game.villageKnowsDisease(id) : null; } catch (e) {}
        rec.canonHits.push({ day: s.day, name: nm, id, knowsDisease: knows, warningCtx: WARN_CTX.test(line), line: line.slice(0, 220) });
      }
    }
    if (FABRIC_RE.test(line)) rec.fabricHits.push({ day: s.day, line: line.slice(0, 160) });
  }
  console.log(JSON.stringify(rec));
}

(async () => {
  try { fs.mkdirSync(EVID, { recursive: true }); } catch (e) {}
  try { await main(); }
  catch (e) { console.log(JSON.stringify({ seed: SEED, error: String(e && e.message || e) })); }
})();
