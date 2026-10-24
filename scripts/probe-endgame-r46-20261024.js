// probe-endgame-r46-20261024.js — journey-endgame r46 (lane B, 2026-10-24).
//
// LEG QUESTION: THE VETERANS BAR, COMMITTED.
//
// r45's binding finding: the capable+deedhunt road faces wave-4s (5/2/1
// distinct facings on the three waves seeds) but kills none — competent's
// fight logic bails before the kill (start-of-fight walk-away, mid-fight
// 35% HP eject, DPS-race conviction eject). Standing caps at 199 on all
// three seeds because the wave-5 readiness deferral's VETERANS bar reads
// 0/2 (living roster members with a wave-4+ kill; canon
// docs/MONSTER-WAVES.md readiness, engine src/js/standing.js). The
// 87014 control seed (capable+relaygrey, no deed-hunt) HAD 3 wave-4+ kills
// and wave-5 open — so kills are possible on the substrate; the deed-hunt
// road's caution is what fails, not the fight engine.
//
// HYPOTHESIS: a brave-but-not-suicidal player on the SAME road —
// start-of-fight walk-away removed and HP eject lowered to 12% for live
// wave-4+ fights while the veterans bar is short (new policy
// scripts/policies/vetcommit.js, VETCOMMIT=1; DPS-race conviction eject
// deliberately KEPT) — converts facings into kills and unlocks wave 5.
// Single-variable vs r45: the seek side is IDENTICAL (deedPatrol patrols
// only); only the fight side changes. If kills still land at 0, the next
// question is the DPS-race eject / fight tuning, not caution — and the
// run will say so with the bail census (vetDpsFledSeen) attached.
//
// One forcedrift seed (88014, capable + relaygrey FORCEDRIFT=1 — exactly
// r45's canonical voicing-control deployment on the capable substrate)
// carries the voicing control forward (r44 metric-review #4: the control
// needs its substrate stated).
//
// BINDINGS (a miss is NO-GO, never re-scored mid-run):
//  M1 GUARD (r45 restatement): >=3/4 seeds reach the window
//     (announceDay != null) OR resolve via a voiced non-table path
//     (reactor honesty beat / honest death-scatter / key-deferral) —
//     counting coherent resolution, not just sits.
//  M2 VETERAN KILLS (the leg's question): >=1/3 waves seeds ends with
//     >=1 LIVING veteran (veterans.livingVeteranCount >= 1 — a wave-4+
//     kill in state.waveKillLog whose killer is alive on the roster at
//     end). Strong form: >=1 seed reaches veterans 2/2 (the bar met).
//  M3 WAVE-5 OPEN / FULL-SEAT REACH: >=1/3 waves seeds unlocks wave 5
//     (veterans.unlockedWave >= 5) OR earns the FULL seat (diag
//     firstFullSeatDay != null). Strong hypothesis, falsifiable.
//  M4 VOICING CANONICAL (carried): 88014 (forcedrift, capable substrate) —
//     bandCrossings >= 1 AND noticedCount >= 1.
//  M5 PEOPLE: >=2 beats sense-read in full, 0 senseless flags.
// REGRESSIONS (binding, inherited): r35 auditNamed on sat seeds with
//     nonzero w4/w5; r37 satPenalty present + voiced-line match on sat seeds.
//
// SUBSTRATE (PILOT, 4 seeds): r45's substrate exactly — capable base
// (courtship via leadfeast, real fleeing, abilities, feasts) +
// deed-seeking's deedPatrol (3x/week far patrols) + surgeUpkeep +
// fullseat-diag outside everything — PLUS vetcommit on waves seeds only.
// 88014 swaps the deed-hunt for the relaygrey FORCEDRIFT=1 road (grey-owned;
// CAPABLE_RELAYROAD='0' on that seed only; waves seeds DELETE it so capable
// runs its own natural relay road). FULLSEAT=1, VETCOMMIT=1, RELAYGREY=1
// (forcedrift seed only), TELEMETRY_FULL=1. 180d, death-aware. Seeds
// fresh 88011-88014. Baseline: r45's waves seeds (0/3 living veterans,
// 0/3 wave-5 unlocks, 0/3 full seats, standing capped 199).
// Interesting-finding bar: a living wave-4 veteran; a wave-5 unlock; a
// full seat; OR deaths-by-commit honestly counted (bravery's price) — any
// of these moves the question. 0 kills with a DPS-bail census is also a
// finding (it names the next bail), not a null.
//
// Usage:
//   FULLSEAT=1 VETCOMMIT=1 RELAYGREY=1 TELEMETRY_FULL=1 node scripts/probe-endgame-r46-20261024.js
//   (RELAYGREY=1 enables the relay layer only on the forcedrift seed;
//    waves seeds never wrap it. RELAYGREY_FORCEDRIFT is managed per-seed
//    inside runSeed. Unset RELAYGREY=1 in FID mode.)
//   SMOKE=1 ...  # 1 seed x 120d
//   DET=1 ...    # instrument-on twice byte-identical (2 x 120d on seed 88011)
//   FID=1 ...    # FULLSEAT unset + VETCOMMIT unset + RELAYGREY unset:
//                # fullseat+vetcommit-wrapped base vs pure capable+deedhunt
//                # base, byte-identical (default-off delegation)
//
const fs = require('fs');
const path = require('path');
const DS = require('./policies/deed-seeking');
const CAP = require('./policies/capable');
const FSD = require('./policies/fullseat-diag');
const RG = require('./policies/relaygrey');
const VC = require('./policies/vetcommit');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const MODE = process.env.DET === '1' ? 'det'
  : process.env.FID === '1' ? 'fid'
  : process.env.SMOKE === '1' ? 'smoke' : 'sweep';

if (process.env.FULLSEAT !== '1' && process.env.FID !== '1') { console.error('SWEEP STOP: FULLSEAT=1 required (the diag layer). FID mode may unset it.'); process.exit(2); }
if (process.env.VETCOMMIT !== '1' && process.env.FID !== '1') { console.error('SWEEP STOP: VETCOMMIT=1 required (the commit lever). FID mode may unset it.'); process.exit(2); }

// RELAY OWNERSHIP (r43 fix — replaces the r41 process-wide default): the
// ownership toggle is per-seed, set inside runSeed. Grey-owned plans
// (grey/forcedrift/forcedrift-deep) keep CAPABLE_RELAYROAD=0 (one player,
// one set of hands — the r40b lesson); base plans DELETE it so the capable
// base runs its own natural relay road (r41's base seed accidentally ran
// with the road OFF — process-wide default leaked onto the base plan).

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [88011, 88012, 88013, 88014]).filter(Number.isFinite);
// seed plan: 87011-87013 waves (capable+deedhunt + fullseat diag),
// 87014 forcedrift (capable + relaygrey FORCEDRIFT=1 + fullseat diag)
const PLAN = { 88011: 'waves', 88012: 'waves', 88013: 'waves', 88014: 'forcedrift' };
const planOf = (seed) => PLAN[seed] || 'grey';
const DAYS = process.env.DAYS ? parseInt(process.env.DAYS, 10)
  : (MODE === 'smoke' ? 120 : MODE === 'det' ? 120 : MODE === 'fid' ? 120 : 180);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-24', 'perseed-endgame-r46');

function writeFileRetry(fp, data) {
  let last = null;
  for (let i = 0; i < 15; i++) {
    try { fs.writeFileSync(fp, data); return; }
    catch (e) { last = e; if (e && e.code === 'EPERM') { const t = Date.now(); while (Date.now() - t < 4000) {} continue; } throw e; }
  }
  throw last;
}

function dayOf(G) { try { return ((G.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function wavesOf(G) {
  try {
    const d = (G.deedState ? G.deedState() : {}).wavesFaced || {};
    const out = { w1: 0, w2: 0, w3: 0, w4: 0, w5: 0 };
    for (const mid of Object.keys(d)) { const w = d[mid] | 0; if (w >= 1 && w <= 5) out['w' + w]++; }
    return out;
  } catch (e) { return {}; }
}
function aliveOf(G) {
  try {
    const ids = ((G.state || {}).village || {}).roster || [];
    let n = 0;
    for (const id of ids) { try { const p = G.getPerson ? G.getPerson(id) : null; if (p && !p.dead) n++; } catch (e) {} }
    return n;
  } catch (e) { return 0; }
}
function pantryOf(G) { try { return Math.round((((G.state || {}).village || {}).pantryKcal) || 0); } catch (e) { return 0; } }

// censusOf — FIXED (journey-endgame r40; r39's caveat resolved, r40b
// correction): formerOccupation is the canonical person field (not
// occupation/role/job — p.occupation is always null; occupationId is the
// identity-layer disguise, not the true occupation), village.npcAbilities[vid]
// (not p.abilities), scholar.villagerId -> name (not scholar.name), dead
// filter corrected.
function censusOf(Game) {
  try {
    const v = (Game.state || {}).village || {};
    const abilMap = v.npcAbilities || {};
    const people = (v.roster || []).map(id => {
      let p = null;
      try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
      const abil = (abilMap[id] && abilMap[id].length) || 0;
      return {
        id, name: (p && (p.name || p.displayName)) || String(id),
        dead: !!(p && p.dead),
        occupation: (p && p.formerOccupation) || null,
        npcAbilities: abil,
      };
    });
    let bearerName = null;
    try {
      const vid = ((Game.state || {}).scholar || {}).villagerId;
      const bp = (vid && Game.getPerson) ? Game.getPerson(vid) : null;
      bearerName = (bp && (bp.name || bp.displayName)) || vid || null;
    } catch (e) {}
    return {
      alive: people.filter(p => !p.dead).length,
      dead: people.filter(p => p.dead).length,
      people, pantryKcal: Math.round(v.pantryKcal || 0),
      scale: (Game.scaleRank ? Game.scaleRank() : '?'),
      mantle: bearerName,
    };
  } catch (e) { return { error: String(e && e.message) }; }
}

// capable+deedhunt (r45): the courtship-survival base with the wave-deed
// hunt layered on — capable.daily (courtship, real fleeing, abilities,
// feasts, its own relay road) runs first, then deed-seeking's patrol and
// surge layers. Built fresh per seed (Object.assign copy, like the other
// composed policies).
function capableDeedHunt() {
  const p = Object.assign({}, CAP.capable);
  const oDaily = p.daily.bind(p);
  p.id = 'capable-deedhunt';
  p.desc = 'capable base (courtship, fleeing, abilities) + deed-seeking patrols/surge';
  p.daily = (G, c) => { oDaily(G, c); DS.deedPatrol(G, c); DS.surgeUpkeep(G, c); };
  return p;
}

async function runSeed(seed, days) {
  const plan = planOf(seed);
  // r45: only the forcedrift plan wraps the relaygrey layer (the canonical
  // voicing control, on the capable substrate per r44 metric-review #4).
  // waves plans are capable+deedhunt (courtship survival + wave-deed
  // patrols) + the diag. The diag layer is pure-read (FULLSEAT=1);
  // relaygrey's own daily is self-gating on RELAYGREY=1, so unset env on
  // plans that don't wrap it is belt-and-suspenders.
  // RELAY OWNERSHIP (r43 canonical): grey-owned plans keep
  // CAPABLE_RELAYROAD=0 (one player, one set of hands — the r40b lesson);
  // waves plans DELETE it so capable runs its own natural relay road.
  const useGrey = plan === 'forcedrift';
  delete process.env.RELAYGREY_FORCEDRIFT;
  if (useGrey && MODE !== 'fid') {
    if (process.env.RELAYGREY !== '1') { console.error('SWEEP STOP: RELAYGREY=1 required for the forcedrift plan.'); process.exit(2); }
    process.env.RELAYGREY_FORCEDRIFT = '1';
    process.env.CAPABLE_RELAYROAD = '0';
  } else {
    delete process.env.CAPABLE_RELAYROAD;
  }
  if (MODE === 'fid') { delete process.env.FULLSEAT; delete process.env.RELAYGREY; delete process.env.RELAYGREY_FORCEDRIFT; delete process.env.CAPABLE_RELAYROAD; }
  const capture = [];
  let lastCap = null;
  const cap = (line) => {
    if (line == null) return;
    const s = String(line).slice(0, 700);
    if (s === lastCap) return;
    lastCap = s;
    capture.push(s);
  };
  let announceDay = null, satDay = null, satSeatKind = null, satWaves = null;
  let satPenalty = null;
  let maxTierSeen = 0;
  let walkedPath = null, walkedBranch = null, won = false;
  let instrumentErrors = 0;
  const ctx = {};
  const chooserCtx = {};   // the chooseTableOption interceptor's ctx (door/cockpit/final picks)
  // relay state snapshots
  let atSit = null;          // {lean, band, grounding, bond, held, verbs, communes}
  let atDoorOffer = null;    // relay offered? (earned paths at door)
  const weekly = [];
  const relayTrace = [];   // r43: policy-neutral weekly relay snapshot (all plans)
  let snapCursor = null;
  let lastDailyCtx = null; // r43: runDays' daily ctx (cap bump fields live here)

  const { Game } = await loadGame({ seed, mode: 'endgame-r40', fullTelemetry: true });
  await setupGame(Game);
  const oSay = Game.say.bind(Game);
  Game.say = function (l) { try { cap(l); } catch (e) {} return oSay.apply(this, arguments); };
  Game.sysSay = function (text) {
    try {
      if (!((Game.state || {}).systemArrived)) return;
      const shown = String(text == null ? '' : text).replace(/^📺\s*/, '');
      return Game.say(`📺 SYSTEM: "${shown}"`);
    } catch (e) {}
  };
  if (useGrey) RG.installRelayGreyChooser(Game, chooserCtx);

  // ---- r41 FINAL-LIVE-CHOICE instrument ----
  // Record every tablePrompt frame (door/cockpit/final frames all route
  // through tablePrompt) and every dispatched chooseTableOption id, so the
  // final beat can be judged as played: options offered, choice dispatched,
  // consequence voiced. The recorder wraps OUTSIDE the grey chooser (when
  // installed), so it sees the final dispatched id.
  const promptFrames = [];
  const dispatched = [];
  try {
    const oPrompt = Game.tablePrompt.bind(Game);
    Game.tablePrompt = function (promptHtml, options, frame) {
      try {
        promptFrames.push({
          day: dayOf(Game),
          frame: String(frame || ''),
          options: (options || []).map(o => ({ id: String(o.id || ''), label: String(o.label || '').slice(0, 120) })),
        });
      } catch (e) {}
      return oPrompt.apply(this, arguments);
    };
  } catch (e) { instrumentErrors++; }
  let finalDispatchLine = null;
  try {
    const oChoose = Game.chooseTableOption.bind(Game);
    Game.chooseTableOption = function (id) {
      try {
        const tc = ((Game.state || {}).scholar || {}).tableChoices || {};
        const opts = (tc.options || []).map(o => String(o.id || ''));
        const entry = { day: dayOf(Game), id: String(id), options: opts, line: capture.length };
        dispatched.push(entry);
        if (String(id).indexOf('final:') === 0) finalDispatchLine = entry;
      } catch (e) {}
      return oChoose.apply(this, arguments);
    };
  } catch (e) { instrumentErrors++; }

  // fullseat-diag wraps OUTSIDE everything (its own compose rule: it sits
  // outside tribfloor/windefer/seatdrive — here outside relaygrey too).
  const withDiag = (inner, id, desc) => FSD.withFullseatDiag(inner, id, desc);
  // r43 canonical control deployment: capable base + the grey road.
  const base = useGrey ? RG.withRelayGrey(Object.assign({}, CAP.capable), 'capable+relaygrey', 'capable + the grey road')
                       : VC.withVetCommit(capableDeedHunt(), 'capabledeedhunt+vetcommit', 'capable + deed-hunt + VETCOMMIT committed wave-4 fights');
  const policy = withDiag(
    base,
    useGrey ? 'capable+relaygrey+fullseatdiag' : 'capabledeedhunt+vetcommit+fullseatdiag',
    useGrey ? 'capable + forcedrift road + full-seat component recorder'
            : 'capable + deed-hunt + vetcommit + full-seat component recorder');
  const oDaily = policy.daily.bind(policy);
  policy.daily = (G, c) => {
    let r;
    try { r = oDaily(G, c); } catch (e) { instrumentErrors++; }
    try { lastDailyCtx = c; } catch (e) {}
    // CTX SYNC (r40 fix): runDays owns the daily ctx — the grey layer's
    // road state lives on it, not on this probe's outer ctx. Mirror the
    // reference so the summary below reads the real road state.
    try { if (c && c._relaygrey && ctx._relaygrey !== c._relaygrey) ctx._relaygrey = c._relaygrey; } catch (e) {}
    try {
      const pg = (G.progState ? G.progState() : {});
      const d = dayOf(G);
      if (pg.tableAnnounced && announceDay == null) { announceDay = d; snapCursor = d + 7; }
      const inWindow = announceDay != null && satDay == null && !pg.tableDone;
      if (inWindow && snapCursor != null && d >= snapCursor) {
        let tier = 0; try { tier = G.overtimeTier ? G.overtimeTier() | 0 : 0; } catch (e) {}
        weekly.push({ day: d, tier, alive: aliveOf(G), pantry: pantryOf(G) });
        snapCursor += 7;
      }
      if (pg.tableDone && satDay == null) {
        satDay = d; satWaves = wavesOf(G);
        try { const st = G.tableSeat ? G.tableSeat() : null; satSeatKind = st ? st.seat : null; } catch (e) {}
        try { satPenalty = G.overtimeStanding ? G.overtimeStanding() : null; } catch (e) { instrumentErrors++; }
      }
      try { if (G.overtimeTier) maxTierSeen = Math.max(maxTierSeen, G.overtimeTier() | 0); } catch (e) {}
      if (c && c.capTablePath) walkedPath = walkedPath || c.capTablePath;
      try { const T = G.tableState ? G.tableState() : {}; if (T.path) walkedPath = T.path; if (T.branch) walkedBranch = T.branch; } catch (e) {}
      // r43 POLICY-NEUTRAL relay trace (feeds the grey-door census on base
      // seeds): weekly {lean, band, bond, held, grounding} for every plan.
      try {
        if (d % 7 === 0) {
          relayTrace.push({
            day: d,
            lean: RG.leanOf(G), band: RG.bandOf(G),
            grounding: RG.groundingOf(G), bond: RG.bondOf(G),
            held: (typeof G.relayHeldByBearer === 'function') ? !!G.relayHeldByBearer() : null,
          });
          if (relayTrace.length > 60) relayTrace.splice(0, relayTrace.length - 60);
        }
      } catch (e) { instrumentErrors++; }
    } catch (e) { instrumentErrors++; }
    return r;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 1 }); });
  won = !!Game.won;

  // ---- relay road summary from the layer ctx ----
  let rgSum = null;
  try {
    const L = ctx._relaygrey;       // daily road state (inner ctx, synced)
    const LC = chooserCtx._relaygrey || {};  // door/cockpit/final picks
    if (L) {
      // verbs: ALL relay verb invocations (deepen/reroute/commune answers
      // are all real uses of the office — r40 pilot instrument
      // clarification, see metric review).
      const verbs = (L.deepens | 0) + (L.rerouteEff | 0) + (L.rerouteHon | 0) + (L.communes | 0);
      rgSum = {
        active: !!L.active, claimDone: !!L.claimDone, claimDay: L.claimDay,
        claimTried: L.claimTried | 0, claimWaiting: L.claimWaiting | 0,
        firstAvailableDay: L.firstAvailableDay,
        deepens: L.deepens | 0, rerouteEff: L.rerouteEff | 0, rerouteHon: L.rerouteHon | 0,
        verbs, communes: L.communes | 0, floorStops: L.floorStops | 0,
        doorRelay: LC.doorRelay | 0, doorDelegated: LC.doorDelegated | 0,
        cockpitPicks: LC.cockpitPicks || {}, finalPick: LC.finalPick || null,
        leanTrace: L.leanTrace || [], communeLean: L.communeLean || [],
        rgError: (L.rgError | 0) + (LC.rgError | 0),
      };
      const tr = L.leanTrace || [];
      rgSum.leanTraceHead = tr.slice(0, 3);
      rgSum.leanTraceTail = tr.slice(-8);
      // at-sit lean/band: last trace point at or before satDay
      if (satDay != null && tr.length) {
        let pt = tr[0];
        for (const q of tr) { if (q.day <= satDay) pt = q; }
        atSit = pt;
      }
      rgSum.atSit = atSit;
    }
  } catch (e) { instrumentErrors++; }

  // relay offered at the door? (from the transcript's path-offer lines)
  try {
    const offerIdx = capture.findIndex(s => s.indexOf('Choose your door') >= 0 || s.indexOf('Walk the path of') >= 0);
    atDoorOffer = offerIdx >= 0 ? capture.slice(Math.max(0, offerIdx - 2), offerIdx + 3).join(' ').slice(0, 400) : null;
  } catch (e) {}

  // ---- audit line as spoken (r35 regression datum) ----
  const auditIdx = capture.findIndex(s => s.indexOf('◈ THE AUDIT') === 0);
  const auditLine = auditIdx >= 0 ? capture[auditIdx] : null;
  const w45 = satWaves ? (satWaves.w4 | 0) + (satWaves.w5 | 0) : 0;
  let auditNamed = null;
  if (auditLine && satWaves && w45 > 0) {
    if (satSeatKind === 'full') auditNamed = /every wave faced/.test(auditLine);
    else {
      const namesW4 = (satWaves.w4 | 0) > 0 ? /wave-4/.test(auditLine) : true;
      const namesW5 = (satWaves.w5 | 0) > 0 ? /wave-5/.test(auditLine) : true;
      auditNamed = namesW4 && namesW5;
    }
  } else if (auditLine && satWaves && w45 === 0) auditNamed = true;

  // ---- r37 regression: satPenalty present + voiced match ----
  let otMismatch = null;
  if (satDay != null) {
    const sp = satPenalty;
    const fieldsOk = sp && typeof sp === 'object'
      && Number.isFinite(sp.tier) && Number.isFinite(sp.losses) && Number.isFinite(sp.penalty);
    let voiced = null;
    const m = capture.join('\n').match(/Every door's standing −(\d+)/);
    voiced = m ? parseInt(m[1], 10) : null;
    if (!fieldsOk) otMismatch = 'OT-RECORD-MISSING';
    else if (sp.penalty > 0 && voiced == null) otMismatch = 'OT-VOICED-LINE-MISSING';
    else if (voiced != null && voiced !== sp.penalty) otMismatch = `OT-MISMATCH record=${sp.penalty} voiced=${voiced}`;
  }

  // ---- M4: lean legibility ----
  const allText = capture.join('\n');
  const noticeLines = capture.filter(s => /NOTICED\. (YOUR REGISTER|YOU ARE BACK)/.test(s));
  const noticedCount = noticeLines.length;
  let ledgerLine = null;
  try {
    const li = capture.findIndex(s => s.indexOf('The table has read your ledger') === 0);
    ledgerLine = li >= 0 ? capture[li] : null;
  } catch (e) {}

  let tele = [];
  try {
    tele = ((Game.state || {}).telemetry || [])
      .filter(e => e.type === 'table_entered' || e.type === 'table_won' || e.type === 'table_lost')
      .map(e => ({ type: e.type, day: e.day, path: e.tablePath, moral: e.moral, ending: e.ending, endingKind: e.endingKind }));
  } catch (e) {}
  for (const t of tele) if (t.type === 'table_won' && t.path) { walkedPath = walkedPath || t.path; walkedBranch = walkedBranch || t.moral; }

  // ---- r41: final live choice verdict fields ----
  const allText2 = capture.join('\n');
  const finalBeat = allText2.indexOf("the last choice is yours, and it's live") >= 0;
  const finalFrames = promptFrames.filter(f => f.options.some(o => o.id.indexOf('final:') === 0));
  const finalFrame0 = finalFrames.length ? finalFrames[finalFrames.length - 1] : null;
  const finalOptsCount = finalFrame0 ? finalFrame0.options.length : 0;
  const finalPickId = finalDispatchLine ? finalDispatchLine.id : null;
  // resolution voiced: the 'X — "<label>"' line naming the chosen final's label
  let finalLabel = null, finalResolved = false, finalOutcomeLines = [];
  if (finalFrame0 && finalPickId) {
    const opt = finalFrame0.options.find(o => o.id === finalPickId);
    finalLabel = opt ? opt.label : null;
  }
  if (finalLabel && finalDispatchLine) {
    const after = capture.slice(finalDispatchLine.line);
    // the resolution line is ◈ <PATH> — "<label>"
    const lab = finalLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const resRe = new RegExp('◈ .* — "' + lab + '"');
    finalResolved = after.some(s => resRe.test(s));
    // outcome SAY lines: the next up-to-12 SAY lines after the pick
    finalOutcomeLines = after.slice(0, 12).filter(s => s && s.indexOf('◈') === 0);
  }
  // band crossings from the lean trace (drift control datum)
  let bandCrossings = 0;
  try {
    const tr = (rgSum && rgSum.leanTrace) || [];
    let last = null;
    for (const q of tr) { if (last != null && q.band !== last) bandCrossings++; last = q.band; }
  } catch (e) {}

  // ---- r43: the relay-door census datum (policy-neutral) ----
  // On base seeds the capable base runs its own relay road (cap bumps on the
  // daily ctx); on grey-owned seeds the grey layer owns it (rgSum above).
  let relayDoor = null;
  try {
    let atSitTrace = null;
    if (relayTrace.length) {
      atSitTrace = relayTrace[0];
      for (const q of relayTrace) { if (satDay != null && q.day <= satDay) atSitTrace = q; else if (satDay == null) atSitTrace = q; }
    }
    const doorFrame = promptFrames.find(f => f.options.some(o => String(o.id).indexOf('path:') === 0));
    const dc = lastDailyCtx || {};
    relayDoor = {
      heldAtSit: atSitTrace ? atSitTrace.held : null,
      leanAtSit: atSitTrace ? atSitTrace.lean : null,
      bandAtSit: atSitTrace ? atSitTrace.band : null,
      bondAtSit: atSitTrace ? atSitTrace.bond : null,
      groundingAtSit: atSitTrace ? atSitTrace.grounding : null,
      capClaimed: (dc.capRelayClaimed | 0),
      capAppointed: (dc.capRelayAppointed | 0),
      capAnswers: (dc.capRelayAnswers | 0),
      capCommunes: (dc.capRelayCommunes | 0),
      capReroutes: (dc.capRelayReroutes | 0),
      doorsOffered: doorFrame ? doorFrame.options.map(o => o.id) : null,
      doorWalked: walkedPath || null,
    };
  } catch (e) { instrumentErrors++; }

  // ---- r44: the full-seat component record (pure-read diag layer) ----
  // The diag layer stores on the daily ctx (captured as lastDailyCtx by the
  // instrumented wrapper above — the same object the layers saw).
  let fullseat = null;
  try {
    const D = (lastDailyCtx || {})._fullseatdiag;
    if (D) {
      const snap = (s) => !s ? null : ({
        day: s.day, seat: s.seat, wavesOk: s.wavesOk, contestsOk: s.contestsOk,
        crisesOk: s.crisesOk, stageOk: s.stageOk, foodDeedsOk: !!(s.foodDeeds && s.foodDeeds.ok),
        binding: s.binding, worst: s.worst,
        unlock: s.unlock ? {
          standing: s.unlock.standing, t4: s.unlock.t4, t5: s.unlock.t5,
          unlockedWave: s.unlock.unlockedWave, w4faced: s.unlock.w4faced,
          holdKind: s.unlock.holdKind, rd5short: s.unlock.rd5short,
        } : null,
      });
      fullseat = {
        days: D.days | 0, errs: D.errs | 0, bestSeat: D.bestSeat || 'none',
        max: Object.assign({}, D.max),
        sentDay: D.sentDay == null ? null : D.sentDay,
        surgeDay: D.surgeDay == null ? null : D.surgeDay,
        firstLesserDay: D.firstLesserDay == null ? null : D.firstLesserDay,
        firstFullSeatDay: D.firstFullSeatDay == null ? null : D.firstFullSeatDay,
        firstFullSeat: snap(D.firstFullSeatSnap),
        indispEver: !!D.indispEver,
        firstIndispDay: D.firstIndispDay == null ? null : D.firstIndispDay,
        winDay: D.winDay == null ? null : D.winDay,
        winSeat: snap(D.winSnap),
      };
    }
  } catch (e) { instrumentErrors++; }


  // ---- r46: veterans census (the leg's question, read from the engine) ----
  let veterans = null;
  try {
    const rd5 = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(5) : null;
    const log = ((Game.state || {}).waveKillLog || []).filter(e => (e.w | 0) >= 4);
    const roster = ((Game.state || {}).village || {}).roster || [];
    const living = new Set();
    for (const id of roster) { try { const pp = Game.getPerson ? Game.getPerson(id) : null; if (pp && !pp.dead) living.add(id); } catch (e) {} }
    const byKiller = {};
    for (const e of log) {
      const k = e.killer || e.by || e.vid || '?';
      if (!byKiller[k]) byKiller[k] = { kills: 0, types: [], days: [] };
      byKiller[k].kills++;
      if (e.type && byKiller[k].types.indexOf(e.type) < 0) byKiller[k].types.push(e.type);
      if (e.d != null) byKiller[k].days.push(e.d);
    }
    const livingVets = Object.keys(byKiller).filter(k => living.has(k));
    const dc = lastDailyCtx || {};
    veterans = {
      rd5ready: rd5 ? !!rd5.ready : null,
      rd5short: rd5 ? (rd5.short || null) : null,
      rd5veterans: rd5 ? (rd5.veterans | 0) : null,
      rd5demand: rd5 ? (rd5.demand || null) : null,
      unlockedWave: (typeof Game.unlockedWave === 'function') ? Game.unlockedWave() : null,
      w4plusKills: log.length,
      killers: byKiller,
      livingVeterans: livingVets,
      livingVeteranCount: livingVets.length,
      vetFights: (dc.vetFights | 0),
      vetFirstDay: dc.vetFirstDay || null,
      vetDpsFledSeen: (dc.vetDpsFledSeen | 0),
    };
  } catch (e) { veterans = { error: String(e && e.message) }; }

  const rec = {
    seed, days, gameDays: dayOf(Game),
    plan: planOf(seed), fullseat,
    endReason: Game.over ? (Game.villageLost ? 'village-lost' : 'over-other') : 'survived',
    won, announceDay, satDay, satSeatKind, satWaves, auditLine, auditNamed,
    satPenalty, maxTier: maxTierSeen, otMismatch,
    walkedPath, walkedBranch, instrumentErrors, telemetry: tele,
    rg: rgSum, noticedCount, noticeLines, ledgerLine, bandCrossings,
    relayDoor, relayTrace,
    finalBeat, finalOptsCount, finalPickId, finalLabel, finalResolved,
    finalOutcomeLines, promptFrameCount: promptFrames.length, dispatchCount: dispatched.length,
    weekly, census: censusOf(Game), veterans,
  };
  if (process.env.DET !== '1' && process.env.FID !== '1') {
    try { fs.mkdirSync(EVID, { recursive: true }); } catch (e) {}
    writeFileRetry(path.join(EVID, `endgame-r46-${seed}.json`), JSON.stringify(rec, null, 1));
    const annIdx = capture.findIndex(s => s.indexOf('◈ THE TABLE IS SET') === 0);
    const auditIdx2 = capture.findIndex(s => s.indexOf('◈ THE AUDIT') === 0);
    const start = Math.max(0, annIdx >= 0 ? annIdx : (auditIdx2 >= 0 ? auditIdx2 : 0));
    writeFileRetry(path.join(EVID, `endgame-r46-${seed}-transcript.txt`),
      `# journey-endgame r46 — seed ${seed}, announced d${announceDay}, sat day ${satDay} (${satSeatKind} seat), ` +
      `walked ${walkedPath || '—'}/${walkedBranch || '?'}, won=${won}, relay=${rgSum ? JSON.stringify({ lean: atSit && atSit.lean, band: atSit && atSit.band, verbs: rgSum.verbs, communes: rgSum.communes }) : 'off'}\n` +
      `# window: the announce through the run's end (${capture.length - start} SAY lines)\n\n` +
      capture.slice(start).join('\n') + '\n');
  }
  return rec;
}

(async () => {
  if (MODE === 'det') {
    const a = await runSeed(SEEDS[0], DAYS, true, false);
    const b = await runSeed(SEEDS[0], DAYS);
    const sa = JSON.stringify(a), sb = JSON.stringify(b);
    console.log('DET ' + (sa === sb ? 'GREEN byte-identical' : 'RED differs'));
    if (sa !== sb) { console.log('a bytes', sa.length, 'b bytes', sb.length); process.exit(1); }
    return;
  }
  if (MODE === 'fid') {
    // FULLSEAT/RELAYGREY unset in this process: wrapped base must equal
    // the pure capable+deedhunt base (layers delegate byte-identically).
    const a = await runSeed(SEEDS[0], DAYS);
    const sa = JSON.stringify(a);
    console.log('FID wrapped=' + sa.length);
    const b = await (async () => {
      const { Game } = await loadGame({ seed: SEEDS[0], mode: 'endgame-r40', fullTelemetry: true });
      await setupGame(Game);
      const ctx = {};
      await quietLog(async () => { await runDays(Game, capableDeedHunt(), { days: DAYS, manifest: undefined, sampleEvery: 1 }); });
      return { gameDays: dayOf(Game), won: !!Game.won, alive: aliveOf(Game), pantry: pantryOf(Game) };
    })();
    const saMini = { gameDays: a.gameDays, won: a.won, alive: a.census.alive, pantry: a.census.pantryKcal };
    const ok = JSON.stringify(saMini) === JSON.stringify(b);
    console.log('FID ' + (ok ? 'GREEN byte-identical (mini)' : 'RED differs'));
    console.log('wrapped', JSON.stringify(saMini));
    console.log('pure   ', JSON.stringify(b));
    if (!ok) process.exit(1);
    return;
  }
  if (MODE === 'smoke') {
    const r = await runSeed(SEEDS[0], DAYS);
    console.log(`SMOKE seed=${r.seed} plan=${r.plan} announceDay=${r.announceDay} satDay=${r.satDay} seat=${r.satSeatKind} path=${r.walkedPath}/${r.walkedBranch} won=${r.won} end=${r.endReason} alive=${r.census.alive}`);
    console.log('FINAL', JSON.stringify({ finalBeat: r.finalBeat, finalOptsCount: r.finalOptsCount, finalPickId: r.finalPickId, finalLabel: r.finalLabel, finalResolved: r.finalResolved, outcomeLines: r.finalOutcomeLines.length, promptFrames: r.promptFrameCount, dispatches: r.dispatchCount }));
    console.log('RG', JSON.stringify(r.rg ? { firstAvailableDay: r.rg.firstAvailableDay, claimDay: r.rg.claimDay, claimTried: r.rg.claimTried, claimWaiting: r.rg.claimWaiting, verbs: r.rg.verbs, communes: r.rg.communes, doorRelay: r.rg.doorRelay, cockpitPicks: r.rg.cockpitPicks, finalPick: r.rg.finalPick, atSit: r.rg.atSit, traceTail: r.rg.leanTraceTail } : null));
    return;
  }
  const out = [];
  for (const s of SEEDS) {
    const r = await runSeed(s, DAYS);
    const rd = r.relayDoor || {};
    const fs44 = r.fullseat || {};
    out.push({ seed: r.seed, plan: r.plan, announceDay: r.announceDay, satDay: r.satDay, seat: r.satSeatKind, path: r.walkedPath, branch: r.walkedBranch, won: r.won, end: r.endReason, alive: r.census.alive, atSit: r.rg && r.rg.atSit, verbs: r.rg && r.rg.verbs, communes: r.rg && r.rg.communes, doorRelay: r.rg && r.rg.doorRelay, finalPickId: r.finalPickId, finalResolved: r.finalResolved, noticed: r.noticedCount, bandCrossings: r.bandCrossings, fullseatMax: fs44.max, firstFullSeatDay: fs44.firstFullSeatDay, bestSeat: fs44.bestSeat, indispEver: fs44.indispEver, door: { held: rd.heldAtSit, lean: rd.leanAtSit, band: rd.bandAtSit, bond: rd.bondAtSit, capClaimed: rd.capClaimed, capCommunes: rd.capCommunes, capReroutes: rd.capReroutes, walked: rd.doorWalked } });
    console.log(JSON.stringify(out[out.length - 1]));
  }
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
