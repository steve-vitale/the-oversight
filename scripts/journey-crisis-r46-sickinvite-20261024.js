#!/usr/bin/env node
// journey-crisis-r46-sickinvite-20261024.js — CRISIS LEG (6) r46: THE SICK-INVITE GATE.
//
// Leg question: do the r42 sick-stay-home gates (extended r46 to the betrayal
// micro-invite pathway) hold in natural outbreak play? r42's gates covered
// expedition departure + guard companions; r46 found the micro-invite path
// (npcInviteTick -> betrayal:accept -> trap-line walk) walked the feverish out
// anyway (transcript-verified: seed303 d4, Paola). Fixed in betrayal.js:
//   (1) npcInviteTick skips sick villagers when assigning invite ideas;
//   (2) acceptInvite returns an honest body-veto line for a sick inviter.
//
// PRE-REGISTRATION (written before any play, 2026-10-24):
//   Canon: docs/DISEASES.md (symptom-honest; two pools), r42 gate design.
//   Seeds: 101, 202, 303, 404 (r42 comparability). Policy: oracleV2 (competent).
//   Horizon: 120d (20 establish + 100 window), death-aware stop (pop<=1, +10d tail).
//   Staged: day 20, v.sick injection on 3 living adults (r42's own fallback
//   instrument; documented, not hidden).
//   Metrics (§14-bound):
//     M1 (tick gate): 0 pending invites ASSIGNED to a sick villager
//        (assignment day strictly after sickness onset; betrayal plot lures
//        exempt by design — r46 design call). GO if 0.
//     M2 (accept gate): 0 invite-walk outcomes accepted by sick inviters
//        (sickAtAccept && outcome in small/reward/wild). GO if 0.
//     M3 (away parity): 0 sick departures via v.away diff (r42 M5). GO if 0.
//     M4 (mechanism live): >=1 pending invite assigned to a well villager per
//        seed — else M1/M2 are vacuous. GO if met.
//   Interesting finding: any M1/M2 violation -> the r46 fix has a hole;
//   fix in-worktree.
// Usage: SEED=101 [DAYS=120] [EVID=<dir>] node scripts/journey-crisis-r46-sickinvite-20261024.js
// Output: JSON record to stdout; narrative to stderr.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '101', 10);
const DAYS = parseInt(process.env.DAYS || '120', 10);
const EVID = process.env.EVID || path.join(ROOT, 'evidence', '2026-10-24');
const STAGE_DAY = 20;

function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function sickSetOf(Game) {
  const out = new Set();
  try {
    const v = Game.state.village || {};
    for (const id of (v.roster || [])) {
      const s = (v.sick || {})[id];
      let alive = true;
      try { const p = Game.vpOf(id); alive = !!(p && !p.dead); } catch (e) {}
      if (s && (s.daysLeft || 0) > 0 && alive) out.add(String(id));
    }
  } catch (e) {}
  return out;
}
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
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-sickinvite-r46', fullTelemetry: true });
  await setupGame(Game);
  const rec = {
    seed: SEED, days: 0, endReason: '', stagedDay: null,
    tickGateViolations: [],   // M1: pending assigned while sick (assignDay > sickSince)
    tickGateAmbiguous: [],    // assigned same day as onset (order unknown)
    acceptWalkBySick: [],     // M2: walk outcome accepted by a sick inviter
    sickVetoes: 0,            // honest body-veto lines fired
    sickDepartures: [],       // M3: v.away-diff sick departures
    wellPendings: 0,          // M4: pendings assigned to well villagers
    inviteAccepts: [],        // every acceptInvite call
    outbreakWindows: [], maxOutbreakWeight: 0,
    convosDriven: [], census: null,
  };
  const sickSince = new Map();   // vid -> first day seen sick
  const dawnSickDays = new Map(); // vid -> Set of days sick at the DAWN snapshot
  let injected = false, inWindow = false, windowStart = 0, peakSick = 0, convosThisRun = 0;

  // ---- wrap acceptInvite: record every acceptance ----
  const _ai = Game.acceptInvite.bind(Game);
  Game.acceptInvite = function (vid) {
    let sickAtAccept = false;
    try { sickAtAccept = !!((Game.state.village || {}).sick || {})[vid]; } catch (e) {}
    let r = null;
    try { r = _ai(vid); } catch (e) { r = { outcome: 'threw', line: String(e && e.message || e) }; }
    const outcome = r && r.outcome;
    rec.inviteAccepts.push({ day: dayOf(Game), vid: String(vid), name: rawName(Game, vid), sickAtAccept, outcome });
    try {
      if (sickAtAccept && ['small', 'reward', 'wild'].indexOf(outcome) >= 0) {
        rec.acceptWalkBySick.push({ day: dayOf(Game), vid: String(vid), name: rawName(Game, vid), outcome });
      }
      if (sickAtAccept && outcome === 'sick') rec.sickVetoes++;
    } catch (e) {}
    return r;
  };

  const policy = {
    id: 'crisis-journey-r46',
    setup: oracleV2.setup ? oracleV2.setup.bind(oracleV2) : undefined,
    upkeep: oracleV2.upkeep ? oracleV2.upkeep.bind(oracleV2) : undefined,
    daily: function (G, ctx) {
      // DAWN snapshot: sick set + away keys BEFORE the day's ticks.
      let dawnSick = new Set(), dawnAway = new Set();
      try {
        dawnSick = sickSetOf(Game);
        dawnAway = new Set(Object.keys((Game.state.village || {}).away || {}));
        for (const id of dawnSick) {
          if (!dawnSickDays.has(id)) dawnSickDays.set(id, new Set());
          dawnSickDays.get(id).add(dayOf(Game));
        }
      } catch (e) {}
      // STAGED outbreak (documented): day 20, 3 living adults get v.sick.
      if (!injected && dayOf(Game) >= STAGE_DAY) {
        injected = true;
        rec.stagedDay = dayOf(Game);
        try {
          const v = Game.state.village;
          const cands = (v.roster || []).filter(id => {
            if (String(id) === String(Game.villagerId)) return false;
            try { const p = Game.vpOf(id); return !!(p && !p.dead); } catch (e) { return true; }
          });
          for (let i = 0; i < 3 && cands.length; i++) {
            const vid = cands.splice(Math.floor(Math.random() * cands.length), 1)[0];
            v.sick = v.sick || {};
            v.sick[vid] = { name: 'bad belly', daysLeft: 6 + Math.floor(Math.random() * 5), severity: 2 };
          }
          E(`[r46] staged outbreak on day ${dayOf(Game)}`);
        } catch (e) { E('[r46] staging failed: ' + e.message); }
      }
      try { if (oracleV2.daily) oracleV2.daily.call(oracleV2, G, ctx); } catch (e) {}
      try {
        // M3: sick departures via v.away diff
        const away = ((Game.state.village || {}).away || {});
        for (const rid of Object.keys(away)) {
          const key = String(rid);
          if (!dawnAway.has(key) && dawnSick.has(key)) {
            rec.sickDepartures.push({ day: dayOf(Game), vid: key, name: rawName(Game, rid), purpose: String((away[rid] || {}).purpose || '') });
          }
        }
        // sick-since tracking + M1/M4: scan invite pendings
        const nowSick = sickSetOf(Game);
        for (const id of nowSick) if (!sickSince.has(id)) sickSince.set(id, dayOf(Game));
        const v = Game.state.village || {};
        const invites = (typeof Game.betrayalState === 'function' ? Game.betrayalState().invites : {}) || {};
        for (const vid of Object.keys(invites)) {
          const pend = invites[vid] && invites[vid].pending;
          if (!pend) continue;
          const key = String(vid);
          if (nowSick.has(key)) {
            // Plot lures (plotId set) are EXEMPT from the tick gate by design
            // (r46 run note: an armed scheme doesn't pause for fever; the
            // cruelest-cut inviter is load-bearing betrayal design). Only the
            // ordinary invite channel is gated.
            if (pend.plotId) continue;
            const since = sickSince.has(key) ? sickSince.get(key) : dayOf(Game);
            const dawnDays = dawnSickDays.get(key) || new Set();
            const entry = { day: dayOf(Game), vid: key, name: rawName(Game, vid), assignDay: pend.day, sickSince: since, defId: pend.defId, plotId: pend.plotId || null };
            if (dawnDays.has(pend.day)) rec.tickGateViolations.push(entry);
            else if (pend.day === since) rec.tickGateAmbiguous.push(entry);
            // else: assigned on a well day before the fever — legitimate;
            // the accept-time guard covers the acceptance.
          } else {
            rec.wellPendings++;
          }
        }
        // outbreak windows (for context) + convos
        let weight = 0;
        for (const id of nowSick) { try { weight += ((((Game.state.village || {}).sick || {})[id] || {}).severity >= 2) ? 2 : 1; } catch (e) {} }
        if (weight > rec.maxOutbreakWeight) rec.maxOutbreakWeight = weight;
        if (!inWindow && nowSick.size >= 2) {
          inWindow = true; windowStart = dayOf(Game); peakSick = nowSick.size;
          if (convosThisRun < 4) {
            const sick = [...nowSick].find(r => String(r) !== String(Game.villagerId)) || [...nowSick][0];
            const well = (v.roster || []).find(r => !nowSick.has(String(r)) && String(r) !== String(Game.villagerId));
            const lines = [];
            driveConvo(Game, sick, `seed${SEED} d${dayOf(Game)} SICK-VILLAGER during outbreak`, lines);
            const f1 = `journey-crisis-r46-seed${SEED}-d${dayOf(Game)}-sick.txt`;
            fs.writeFileSync(path.join(EVID, f1), lines.join('\n'), 'utf8');
            rec.convosDriven.push({ day: dayOf(Game), tag: 'sick-during-outbreak', file: f1, npcLines: lines.filter(l => l.startsWith('NPC:')).length });
            convosThisRun++;
            if (well) {
              const lines2 = [];
              driveConvo(Game, well, `seed${SEED} d${dayOf(Game)} WELL-VILLAGER during outbreak`, lines2);
              const f2 = `journey-crisis-r46-seed${SEED}-d${dayOf(Game)}-well.txt`;
              fs.writeFileSync(path.join(EVID, f2), lines2.join('\n'), 'utf8');
              rec.convosDriven.push({ day: dayOf(Game), tag: 'well-during-outbreak', file: f2, npcLines: lines2.filter(l => l.startsWith('NPC:')).length });
              convosThisRun++;
            }
          }
        } else if (inWindow) {
          if (nowSick.size > peakSick) peakSick = nowSick.size;
          if (nowSick.size < 2) { inWindow = false; rec.outbreakWindows.push({ startDay: windowStart, endDay: dayOf(Game), peakSick }); }
        }
      } catch (e) { E('[r46] daily instrument error: ' + e.message); }
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
    if (Game.over) { endReason = 'game-over'; break; }
    try {
      const alive = ((Game.state.village || {}).roster || []).length;
      if (alive <= 1) { if (++deadTail >= 10) { endReason = alive <= 0 ? 'village-dead' : 'scattered-tail'; break; } }
      else deadTail = 0;
    } catch (e) {}
  }
  if (inWindow) rec.outbreakWindows.push({ startDay: windowStart, endDay: dayOf(Game), peakSick, open: true });
  rec.endReason = endReason;

  try {
    const v = Game.state.village || {};
    const alive = [], dead = [];
    for (const id of (v.roster || [])) {
      let p = null; try { p = Game.vpOf(id); } catch (e) {}
      let nm = id; try { nm = Game.displayName(id) || id; } catch (e) {}
      if (p && !p.dead) alive.push(nm); else dead.push(nm);
    }
    rec.census = { aliveCount: alive.length, deadCount: dead.length, alive, dead };
  } catch (e) { rec.census = { error: e.message }; }

  // M1-M4 verdicts
  rec.verdicts = {
    M1_tickGate: rec.tickGateViolations.length === 0 ? 'GO' : 'NO-GO',
    M2_acceptGate: rec.acceptWalkBySick.length === 0 ? 'GO' : 'NO-GO',
    M3_awayParity: rec.sickDepartures.length === 0 ? 'GO' : 'NO-GO',
    M4_mechanismLive: rec.wellPendings >= 1 ? 'GO' : 'VACUOUS',
  };
  console.log(JSON.stringify(rec));
}

(async () => {
  try { fs.mkdirSync(EVID, { recursive: true }); } catch (e) {}
  try { await main(); }
  catch (e) { console.log(JSON.stringify({ seed: SEED, error: String(e && e.message || e) })); }
})();
