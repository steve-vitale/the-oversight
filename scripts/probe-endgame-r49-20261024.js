// probe-endgame-r49-20261024.js — journey-endgame r49 (lane B, 2026-10-24).
//
// LEG QUESTION: DEFEND THE FIRST VETERAN (r48's named next step).
//
// r48's finding, restated: the armory road converges on everything EXCEPT
// veterans — weapons met (88031) or 4/5 (88032), armor 3/4, standing
// 192-199 — and still 0 living veterans, because the bar demands LIVING
// killers and the endgame's own mortality eats them during the deferral
// window (third evaporation in three runs: r46 Camila, r47 Aria, r48
// Adel d98 kill -> d103 arena death, sat d104). r48 named the next run
// verbatim: a veteran-first road that banks the kill BEFORE the announce,
// so the window is spent defending a living killer, not making one.
//
// THE ROAD (single variable vs r48): r48's substrate exactly — capable +
// deedhunt + vetcommit + greedy deferral + armorydrive on waves seeds,
// forcedrift control clean — PLUS CAPABLE_VETGUARD=1 on waves seeds only
// (scripts/policies/capable.js greedyWaits: once waveCombatReadiness(5)
// counts >= 1 living veteran, greedy stops waiting and sits at once).
// The window is spent defending by CLOSING it: a kill banked before the
// announce is defended by a 0-day window (sit the morning the table is
// ready); a kill banked during deferral ends the deferral that day. The
// tradeoff is deliberate and named: banking ONE veteran at the table vs
// pursuing the second the wave-5 bar wants (demand veterans 2) — vetcommit
// keeps hunting for #2 until the sit, but the sit now comes first.
// If M3 GOes while M4 stays NO-GO, the run has split defense from the
// bar's count, and the remaining blocker is the count (2), not mortality.
//
// BINDINGS (a miss is NO-GO, never re-scored mid-run):
//  M1 GUARD (carried): >=3/4 seeds reach the window (announceDay != null)
//     OR resolve via a voiced non-table path.
//  M2 ARMORY ENGAGES (carried): >=2/3 waves seeds show >=1 armory donation.
//  M3 LIVING VETERAN — THE DEFENSE TEST: >=1/3 waves seeds ends with
//     >=1 LIVING veteran (r46/r47/r48: 0/3, 0/3, 0/3). A sit that carries
//     a living killer to the table is the finding, even if M4 misses.
//  M4 WAVE-5 OPEN / FULL-SEAT REACH (carried): >=1/3 waves seeds unlocks
//     wave 5 OR earns the FULL seat. EXPECTED NO-GO on this road (one
//     veteran != the bar's two) — still binding as written, not softened.
//  M5 VOICING CANONICAL (carried): 88044 (forcedrift, capable substrate,
//     sit-promptly, greedy OFF, armory OFF, vetguard OFF) —
//     bandCrossings >= 1 AND noticedCount >= 1.
//  M6 GUARD NAMED (r48 metric-review item 5, now scoped): every sat waves
//     seed with deferDays >= 1 records a named window-end guard (not
//     'unknown'). Same-day sits are ALSO recorded (r48 item-5 fix below)
//     and reported as fix verification, not re-scored into the binding.
//  M7 PEOPLE: >=2 beats sense-read in full, 0 senseless flags.
// REG (binding, inherited): r35 auditNamed on sat seeds with nonzero
// w4/w5; r37 satPenalty present + voiced-line match on sat seeds.
//
// INSTRUMENT FIXES (r48 metric review, both items):
//  Item 5a: the guard snapshot now runs on the ANNOUNCE DAY itself (the
//     probe detects the announce before snapshotting, not after the
//     day's policy runs), so same-day sits get a guard entry (r48's
//     88043 'unknown' was a scope gap: the trace only snapshotted days
//     AFTER the announce day).
//  Item 5b: the snapshot mirrors the vetguard rule — a new
//     'veteran-banked' decision, recorded when all other guards pass and
//     a living veteran exists. The guard trace also carries the live
//     veteran count per day (vets), so the defense is readable day by day.
//
// SUBSTRATE (PILOT, 4 seeds): r48's substrate exactly + VETGUARD=1 on
// waves seeds only. FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1,
// ARMORYDRIVE=1, CAPABLE_VETGUARD=1 (waves only), RELAYGREY=1 (forcedrift
// seed only), TELEMETRY_FULL=1. 180d, death-aware. Seeds fresh
// 88041-88044 (verified unused: no 88041-88044 in prior endgame notes or
// probes). Baseline: r48's waves seeds (0/3 living veterans, 0/3 wave-5,
// 0/3 full seats, armory 7/7/5, windows ended hp/losses/roster-unknown).
// Interesting-finding bar: a living veteran at the table; a
// 'veteran-banked' window-end guard; a same-day sit with a NAMED guard
// (the announce-day fix working); OR kills landing with vetguard never
// firing (the road measures nothing — say so).
//

// LEG QUESTION: THE DEFERRAL WINDOW, PRICED.
//
// r46's binding finding: on the sit-promptly road the full seat never
// converges — 0/3 living veterans, 0/3 wave-5 unlocks, 0/3 full seats —
// and the run note named three different mechanisms: (1) the kill that
// evaporated (88012: Camila's wave-4 kill died with her in a d90 contest,
// hours before the sit), (2) commitment without conversion (88013: two
// committed wave-4 fights, zero kills), (3) the seed that never got there
// (88011: standing max 99, wave-4 never unlocked, sat d111 anyway).
// Every seed in r45 AND r46 sat within a day of announcing. The full
// seat's window is bounded by the announce, and a sit-promptly village
// never gets a veteran window at all. r46's note named r47's question
// verbatim: VETCOMMIT + DEFERRAL (wait at the table while hunting
// wave-4s). This run asks it with the tool already built for it:
// capable's CAPABLE_GREEDY deferral (capable.js greedyWaits — waits while
// the run looks strong: 5+ roster, <3 losses while waiting, bearer above
// 40% HP, tier under CAPABLE_GREEDY_MAXTIER, day under
// CAPABLE_GREEDY_LASTDAY; sits at once with the key, when the run
// weakens, or near the horizon). Defaults as-shipped: MAXTIER 4,
// LASTDAY 145 — NOT tuned for this run; the run measures the tool, it
// does not tune it.
//
// HYPOTHESIS: deferring the sit on the SAME road (capable + deed-hunt +
// vetcommit, single-variable vs r46: only the sit timing changes) lets
// the village bank veterans, armor, and standing together and reach the
// full seat — OR the deferral diverges, because overtime is priced:
// every 7 unseated days = +1 tier (cap 6), wave-4/5 fights become RERUNS
// (HP x(1+0.25t), damage x(1+0.12t)), and the seat price drops -4
// standing/tier (canon docs/TABLE.md, src/js/overtime.js). Either outcome
// is a finding: convergence names the road, divergence prices it.
//
// One forcedrift seed (88044, capable + relaygrey FORCEDRIFT=1 — exactly
// r46's canonical voicing-control deployment, WITHOUT greedy) carries the
// voicing control forward on the sit-promptly road, so M4 stays
// comparable to r46.
//
// BINDINGS (a miss is NO-GO, never re-scored mid-run):
//  M1 GUARD (r46 restatement): >=3/4 seeds reach the window
//     (announceDay != null) OR resolve via a voiced non-table path.
//  M2 DEFERRAL HAPPENS: >=2/3 waves seeds wait >=7 days past announce
//     (satDay - announceDay >= 7). If greedy never holds, the run
//     measures nothing and says so.
//  M3 VETERAN KILLS (r46 M2 restated): >=1/3 waves seeds ends with
//     >=1 LIVING veteran.
//  M4 WAVE-5 OPEN / FULL-SEAT REACH (r46 M3 restated): >=1/3 waves seeds
//     unlocks wave 5 OR earns the FULL seat.
//  M5 VOICING CANONICAL (carried): 88044 (forcedrift, capable substrate,
//     sit-promptly) — bandCrossings >= 1 AND noticedCount >= 1.
//  M6 DEFERRAL PRICE VOICED: >=2/3 deferred waves seeds show >=1
//     OVERTIME tier line in the transcript (the cost is announced, not
//     silent — canon: each tier is a System line on air).
//  M7 PEOPLE: >=2 beats sense-read in full, 0 senseless flags.
// REGRESSIONS (binding, inherited): r35 auditNamed on sat seeds with
//     nonzero w4/w5; r37 satPenalty present + voiced-line match on sat seeds.
//
// SUBSTRATE (PILOT, 4 seeds): r46's substrate exactly — capable base +
// deed-seeking's deedPatrol + surgeUpkeep + fullseat-diag outside
// everything + vetcommit on waves seeds only — PLUS CAPABLE_GREEDY=1 on
// waves seeds only (forcedrift control: greedy OFF, exactly r46).
// FULLSEAT=1, VETCOMMIT=1, CAPABLE_GREEDY=1 (waves only), RELAYGREY=1
// (forcedrift seed only), TELEMETRY_FULL=1. 180d, death-aware. Seeds
// fresh 88041-88044. Baseline: r46's waves seeds (0/3 living veterans,
// 0/3 wave-5 unlocks, 0/3 full seats, sat same day as announce, tier 0,
// penalty 0). Interesting-finding bar: a living wave-4 veteran banked
// across the deferral; a wave-5 unlock; a full seat; OR honest
// deferral deaths (the price, counted); OR divergence (tiers eat the
// standing bar faster than patrols fill it) — any of these moves the
// question. 0 kills with a bail census is also a finding, not a null.
//
// BLANK FILLED (r46 census-tool gap): censusOf now prints the fallen
// ledger alongside the living (state.village.fallen), so the run's best
// story is no longer readable only via repro forensics.
//
// Usage:
//   FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1 RELAYGREY=1 TELEMETRY_FULL=1 node scripts/probe-endgame-r49-20261024.js
//   SMOKE=1 ...  # 1 seed x 120d (pipeline only — deferral needs 180d)
//   DET=1 ...    # instrument-on twice byte-identical (2 x 120d on seed 88041)
//   FID=1 ...    # FULLSEAT/VETCOMMIT/RELAYGREY/CAPABLE_GREEDY unset:
//                # fullseat+vetcommit-wrapped base vs pure capable+deedhunt
//                # base, byte-identical (default-off delegation; greedy is
//                # part of capable itself, unset on both sides)
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
//  M4 VOICING CANONICAL (carried): 88044 (forcedrift, capable substrate) —
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
//   FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1 RELAYGREY=1 TELEMETRY_FULL=1 node scripts/probe-endgame-r49-20261024.js
//   (RELAYGREY=1 enables the relay layer only on the forcedrift seed;
//    waves seeds never wrap it. RELAYGREY_FORCEDRIFT is managed per-seed
//    inside runSeed. Unset RELAYGREY=1 in FID mode.)
//   SMOKE=1 ...  # 1 seed x 120d
//   DET=1 ...    # instrument-on twice byte-identical (2 x 120d on seed 88041)
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
const AD = require('./policies/armorydrive');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const MODE = process.env.DET === '1' ? 'det'
  : process.env.FID === '1' ? 'fid'
  : process.env.SMOKE === '1' ? 'smoke' : 'sweep';

if (process.env.FULLSEAT !== '1' && process.env.FID !== '1') { console.error('SWEEP STOP: FULLSEAT=1 required (the diag layer). FID mode may unset it.'); process.exit(2); }
if (process.env.VETCOMMIT !== '1' && process.env.FID !== '1') { console.error('SWEEP STOP: VETCOMMIT=1 required (the commit lever). FID mode may unset it.'); process.exit(2); }
if (process.env.CAPABLE_GREEDY !== '1' && process.env.FID !== '1') { console.error('SWEEP STOP: CAPABLE_GREEDY=1 required (the deferral lever, waves seeds). FID mode may unset it.'); process.exit(2); }
if (process.env.ARMORYDRIVE !== '1' && process.env.FID !== '1') { console.error('SWEEP STOP: ARMORYDRIVE=1 required (the armory lever, waves seeds). FID mode may unset it.'); process.exit(2); }
if (process.env.CAPABLE_VETGUARD !== '1' && process.env.FID !== '1') { console.error('SWEEP STOP: CAPABLE_VETGUARD=1 required (the vetguard lever, waves seeds). FID mode may unset it.'); process.exit(2); }

// RELAY OWNERSHIP (r43 fix — replaces the r41 process-wide default): the
// ownership toggle is per-seed, set inside runSeed. Grey-owned plans
// (grey/forcedrift/forcedrift-deep) keep CAPABLE_RELAYROAD=0 (one player,
// one set of hands — the r40b lesson); base plans DELETE it so the capable
// base runs its own natural relay road (r41's base seed accidentally ran
// with the road OFF — process-wide default leaked onto the base plan).

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [88041, 88042, 88043, 88044]).filter(Number.isFinite);
// seed plan: 88041-88043 waves (capable+deedhunt+vetcommit+greedy+armory + fullseat diag),
// 88044 forcedrift (capable + relaygrey FORCEDRIFT=1 + fullseat diag, greedy OFF, armory OFF)
const PLAN = { 88041: 'waves', 88042: 'waves', 88043: 'waves', 88044: 'forcedrift' };
const planOf = (seed) => PLAN[seed] || 'grey';
const DAYS = process.env.DAYS ? parseInt(process.env.DAYS, 10)
  : (MODE === 'smoke' ? 120 : MODE === 'det' ? 120 : MODE === 'fid' ? 120 : 180);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-24', 'perseed-endgame-r49');

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
    // r47: the fallen ledger alongside the living (r46 census-tool gap).
    let fallen = [];
    try {
      const raw = v.fallen || v.dead || [];
      const arr = Array.isArray(raw) ? raw : Object.values(raw);
      fallen = arr.map(e => {
        if (e && typeof e === 'object') {
          const vid = e.vid || e.id || null;
          let nm = e.name || null;
          if (!nm && vid) { try { const pp = Game.getPerson ? Game.getPerson(vid) : null; nm = (pp && (pp.name || pp.displayName)) || null; } catch (e2) {} }
          return { id: vid, name: nm, day: e.day != null ? e.day : (e.d != null ? e.d : null), cause: e.cause || e.how || null };
        }
        return { id: String(e) };
      });
    } catch (e2) { fallen = [{ error: String(e2 && e2.message) }]; }
    return {
      alive: people.filter(p => !p.dead).length,
      dead: people.filter(p => p.dead).length,
      people, fallen, pantryKcal: Math.round(v.pantryKcal || 0),
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
  // r49 GREEDY + ARMORY OWNERSHIP: waves seeds defer (greedy ON, defaults
  // MAXTIER 4 / LASTDAY 145 as-shipped) AND arm the fighters (armory ON);
  // the forcedrift control keeps greedy OFF and armory OFF so the voicing
  // control stays r47-comparable. FID unsets both on both sides (greedy
  // is part of capable, armory is a gated layer).
  if (!useGrey && MODE !== 'fid') {
    if (process.env.CAPABLE_GREEDY !== '1') { console.error('SWEEP STOP: CAPABLE_GREEDY=1 required for the waves plan.'); process.exit(2); }
    if (process.env.ARMORYDRIVE !== '1') { console.error('SWEEP STOP: ARMORYDRIVE=1 required for the waves plan.'); process.exit(2); }
    if (process.env.CAPABLE_VETGUARD !== '1') { console.error('SWEEP STOP: CAPABLE_VETGUARD=1 required for the waves plan.'); process.exit(2); }
  } else if (useGrey) { delete process.env.CAPABLE_GREEDY; delete process.env.ARMORYDRIVE; delete process.env.CAPABLE_VETGUARD; }
  if (MODE === 'fid') { delete process.env.CAPABLE_GREEDY; delete process.env.ARMORYDRIVE; delete process.env.CAPABLE_VETGUARD; }
  if (useGrey && MODE !== 'fid') {
    if (process.env.RELAYGREY !== '1') { console.error('SWEEP STOP: RELAYGREY=1 required for the forcedrift plan.'); process.exit(2); }
    process.env.RELAYGREY_FORCEDRIFT = '1';
    process.env.CAPABLE_RELAYROAD = '0';
  } else {
    delete process.env.CAPABLE_RELAYROAD;
  }
  if (MODE === 'fid') { delete process.env.FULLSEAT; delete process.env.RELAYGREY; delete process.env.RELAYGREY_FORCEDRIFT; delete process.env.CAPABLE_RELAYROAD; delete process.env.CAPABLE_GREEDY; delete process.env.ARMORYDRIVE; delete process.env.CAPABLE_VETGUARD; }
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
  let guardTrace = [];       // r49: pre-sit window decisions, one per window day
  let windowEndGuard = null; // r49: decision on the sat day (or last window decision)
  let announceCapIdx = null; // r49: capture index at the start of the announce day
  let dayStartCapIdx = 0;    // r49: capture length at the start of today's wrapper call

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
                       : AD.withArmoryDrive(VC.withVetCommit(capableDeedHunt(), 'capabledeedhunt+vetcommit', 'capable + deed-hunt + VETCOMMIT committed wave-4 fights'), 'capabledeedhunt+vetcommit+armorydrive', 'capable + deed-hunt + vetcommit + ARMORYDRIVE weapons in hands');
  const policy = withDiag(
    base,
    useGrey ? 'capable+relaygrey+fullseatdiag' : 'capabledeedhunt+vetcommit+armorydrive+fullseatdiag',
    useGrey ? 'capable + forcedrift road + full-seat component recorder'
            : 'capable + deed-hunt + vetcommit + armorydrive + full-seat component recorder');
  const oDaily = policy.daily.bind(policy);
  let todayPreSnap = null; // r49: pre-daily guard snapshot for THIS day (see below)
  policy.daily = (G, c) => {
    dayStartCapIdx = capture.length;
    todayPreSnap = null;
    // r49 GUARD SNAPSHOT (pre-sit): while the window is open, read the
    // live preview BEFORE the day's policy runs, and compute the greedy
    // decision from the same fields greedyWaits reads (capable.js:
    // key, tier vs MAXTIER, day vs LASTDAY, losses vs 3, roster vs 5,
    // bearer hp frac vs 0.4, vetguard living veteran - in that order).
    // r49 ANNOUNCE-DAY FIX (r48 metric-review item 5a): detect the
    // announce BEFORE snapshotting, so the announce day itself gets a
    // guard entry (r48's trace only covered days AFTER the announce day,
    // leaving same-day sits 'unknown'). snapCursor is set here too, so
    // the post-daily detector (which only fires while announceDay is
    // still null) stays consistent.
    try {
      const pg0 = (G.progState ? G.progState() : {});
      if (announceDay == null && pg0.tableAnnounced) {
        announceDay = dayOf(G);
        if (announceCapIdx == null) announceCapIdx = dayStartCapIdx;
        if (snapCursor == null) snapCursor = dayOf(G) + 7;
      }
    } catch (e) {}
    // The pre-daily snapshot is computed EVERY day (preview permitting),
    // not only once announced: the retroactive announce-day entry below
    // needs the day-start state even on days the announce flips mid-day.
    // It is PUSHED to guardTrace only once the window exists (announced),
    // or retroactively when the announce is first detected post-daily.
    try {
      if (satDay == null) {
        const pv = (typeof G.tablePreview === 'function') ? G.tablePreview() : null;
        if (pv) {
          const roster = (((G.state || {}).village || {}).roster || []).length;
          let hp = 1;
          try { const s = (G.state || {}).scholar || {}; hp = (s.health || 0) / Math.max(1, (G.maxHealth ? G.maxHealth() : s.maxHealth) || 100); } catch (e2) {}
          let vets = 0;
          try { const rd = (typeof G.waveCombatReadiness === 'function') ? G.waveCombatReadiness(5) : null; vets = rd ? (rd.veterans | 0) : 0; } catch (e2) {}
          let decision = null;
          if (!pv.ready) decision = 'not-ready:' + String(pv.why || '');
          else if (pv.key) decision = 'key';
          else if ((pv.overtime | 0) >= (parseInt(process.env.CAPABLE_GREEDY_MAXTIER || '4', 10))) decision = 'tier-cap';
          else if (dayOf(G) >= (parseInt(process.env.CAPABLE_GREEDY_LASTDAY || '145', 10))) decision = 'horizon';
          else if ((pv.losses | 0) >= 3) decision = 'losses';
          else if (roster < 5) decision = 'roster';
          else if (hp < 0.4) decision = 'hp';
          else if (process.env.CAPABLE_VETGUARD === '1' && vets >= 1) decision = 'veteran-banked';
          else if (process.env.CAPABLE_GREEDY === '1') decision = 'wait';
          else decision = 'sit-promptly';
          todayPreSnap = { day: dayOf(G), decision, overtime: pv.overtime | 0, losses: pv.losses | 0, roster, vets, seat: pv.seat };
          if (announceDay != null && !guardTrace.some(e => e.day === todayPreSnap.day)) {
            guardTrace.push(todayPreSnap);
            if (guardTrace.length > 120) guardTrace.splice(0, guardTrace.length - 120);
          }
        }
      }
    } catch (e) { instrumentErrors++; }
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
      if (pg.tableAnnounced && announceDay == null) {
        announceDay = d; snapCursor = d + 7; if (announceCapIdx == null) announceCapIdx = dayStartCapIdx;
        // r49 RETROACTIVE ANNOUNCE-DAY ENTRY: the announce usually flips
        // INSIDE today's oDaily (progression beats), so the pre-daily
        // snapshot above could not see it — the r48 'unknown' class.
        // The day-start preview is the honest cause ONLY when it already
        // implied a sit (sit guards are stable-or-worsening intraday:
        // losses/hp/tier move toward sit, never away); a 'wait' or
        // 'not-ready' day-start state means the sit's cause formed during
        // the announce day itself, recorded as 'intraday' — named, not
        // 'unknown', and never dressed up as a guard that was not there.
        if (todayPreSnap && !guardTrace.some(e => e.day === todayPreSnap.day)) {
          const sitGuards = ['key', 'tier-cap', 'horizon', 'losses', 'roster', 'hp', 'veteran-banked', 'sit-promptly'];
          const retro = sitGuards.indexOf(todayPreSnap.decision) >= 0
            ? Object.assign({}, todayPreSnap, { retro: true })
            : Object.assign({}, todayPreSnap, { decision: 'intraday', retro: true });
          guardTrace.push(retro);
          if (guardTrace.length > 120) guardTrace.splice(0, guardTrace.length - 120);
        }
      }
      const inWindow = announceDay != null && satDay == null && !pg.tableDone;
      if (inWindow && snapCursor != null && d >= snapCursor) {
        let tier = 0; try { tier = G.overtimeTier ? G.overtimeTier() | 0 : 0; } catch (e) {}
        weekly.push({ day: d, tier, alive: aliveOf(G), pantry: pantryOf(G) });
        snapCursor += 7;
      }
      if (pg.tableDone && satDay == null) {
        satDay = d; satWaves = wavesOf(G);
        // r49: the window-end guard is the pre-sit decision recorded this
        // morning (same-day entry if present, else the last window entry).
        try {
          let g = null;
          for (const e of guardTrace) { if (e.day <= d) g = e; }
          windowEndGuard = g ? g.decision : 'unknown';
        } catch (e2) { windowEndGuard = 'unknown'; }
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


  // ---- r46/r47: veterans census (the leg's question, read from the engine) ----
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

  // ---- r47: deferral record (greedy bumps live on lastDailyCtx) ----
  let greedy = null;
  try {
    const dc = lastDailyCtx || {};
    greedy = {
      waits: (dc.capGreedyWaits | 0),
      maxTier: (dc.capGreedyMaxTier | 0),
      seatDay: dc.capSeatDay != null ? dc.capSeatDay : null,
      seatKind: dc.capSeatKind != null ? dc.capSeatKind : null,
    };
  } catch (e) { greedy = { error: String(e && e.message) }; }
  // ---- r49: armory record (armorydrive bumps live on lastDailyCtx) ----
  let armory = null;
  try {
    const dc = lastDailyCtx || {};
    let units = null;
    try { units = AD.armoryUnits(Game); } catch (e) {}
    armory = {
      donations: (dc.adDonations | 0),
      craftDonations: (dc.adCraftDonations | 0),
      donatedBonus: (dc.adDonatedBonus | 0),
      donateFailed: (dc.adDonateFailed | 0),
      vinebankDeferred: (dc.adVinebankDeferred | 0),
      knapWasted: (dc.adKnapWasted | 0),
      errors: (dc.adArmoryError | 0),
      unitsAtEnd: units,
    };
  } catch (e) { armory = { error: String(e && e.message) }; }
  const deferDays = (announceDay != null && satDay != null) ? (satDay - announceDay) : null;
  let overtimeLines = 0;
  try { overtimeLines = capture.filter(l => l.indexOf('OVERTIME') >= 0).length; } catch (e) {}
  const rec = {
    seed, days, gameDays: dayOf(Game), deferDays, greedy, armory,
    guardTrace, windowEndGuard, announceCapIdx, overtimeLines,
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
    writeFileRetry(path.join(EVID, `endgame-r49-${seed}.json`), JSON.stringify(rec, null, 1));
    // r49: slice from the ANNOUNCE day (r47 metric-review item 5) — the
    // deferral itself must be readable, not just counted. Fall back to
    // the TABLE IS SET / AUDIT lines if the announce capture is missing.
    const annIdx = capture.findIndex(s => s.indexOf('◈ THE TABLE IS SET') === 0);
    const auditIdx2 = capture.findIndex(s => s.indexOf('◈ THE AUDIT') === 0);
    const start = announceCapIdx != null ? announceCapIdx
      : Math.max(0, annIdx >= 0 ? annIdx : (auditIdx2 >= 0 ? auditIdx2 : 0));
    writeFileRetry(path.join(EVID, `endgame-r49-${seed}-transcript.txt`),
      `# journey-endgame r49 — seed ${seed}, announced d${announceDay}, sat day ${satDay} (${satSeatKind} seat), ` +
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
    out.push({ seed: r.seed, plan: r.plan, announceDay: r.announceDay, satDay: r.satDay, deferDays: r.deferDays, greedyWaits: r.greedy && r.greedy.waits, greedyMaxTier: r.greedy && r.greedy.maxTier, maxTier: r.maxTier, satPenalty: r.satPenalty, overtimeLines: r.overtimeLines, armoryDonations: r.armory && r.armory.donations, armoryUnits: r.armory && r.armory.unitsAtEnd, windowEndGuard: r.windowEndGuard, livingVeterans: r.veterans && r.veterans.livingVeteranCount, unlockedWave: r.veterans && r.veterans.unlockedWave, seat: r.satSeatKind, path: r.walkedPath, branch: r.walkedBranch, won: r.won, end: r.endReason, alive: r.census.alive, atSit: r.rg && r.rg.atSit, verbs: r.rg && r.rg.verbs, communes: r.rg && r.rg.communes, doorRelay: r.rg && r.rg.doorRelay, finalPickId: r.finalPickId, finalResolved: r.finalResolved, noticed: r.noticedCount, bandCrossings: r.bandCrossings, fullseatMax: fs44.max, firstFullSeatDay: fs44.firstFullSeatDay, bestSeat: fs44.bestSeat, indispEver: fs44.indispEver, door: { held: rd.heldAtSit, lean: rd.leanAtSit, band: rd.bandAtSit, bond: rd.bondAtSit, capClaimed: rd.capClaimed, capCommunes: rd.capCommunes, capReroutes: rd.capReroutes, walked: rd.doorWalked } });
    console.log(JSON.stringify(out[out.length - 1]));
  }
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
