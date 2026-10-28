// probe-endgame-r58-20261027.js — journey-endgame r58 (lane B, 2026-10-27).
//
// LEG QUESTION: FIGHT-OUTCOME CENSUS + FIGHT-DON'T-TALK (r49's two named
// next steps, in order, on r49's substrate exactly).
//
// r49's finding, restated: 0 wave-4+ kills on all three waves seeds, and
// the probe counted committed fight DECISIONS (23/41/2 turns) but not
// fight OUTCOMES — so a 0-kill result could not say whether fights end
// in monster flight, party retreat, talk-down, or death. r49 also found
// the upstream mechanism: wave-4 encounters on 88043 resolved by TALK
// (Walk In on The Algorithm, The Congregation, The Reunion), and
// companion damage is single digits vs 850–1500 HP pools.
//
// THE INSTRUMENT (arm A): a fight-outcome census. For every COMMITTED
// wave-4 fight (vetcommit's commit flags set, monster wave >= 4), one
// primary outcome plus flags: vKill (wave-4+ waveKillLog entry during
// the fight), vDie (a roster member dies during the fight), talkDown
// (Walk In stand-down line in the fight's capture slice), vFlee (last
// fighter snapshot shows player/villager fled), mFlee (monster fled or
// "It got away"), otherEnd (none of the above — reported, never
// renamed). Precedence for the primary: vKill > vDie > talkDown >
// vFlee > mFlee > otherEnd; all flags are recorded, so precedence hides
// nothing (a kill-plus-death fight is primary vKill with dieFlag set).
// Non-committed wave-4 fights (commitLive false) are tallied separately
// as nonCommittedW4, never silently dropped, never counted as census.
//
// THE VARIANT (arm B, single variable vs arm A): CAPABLE_NOWALKIN_W4=1
// declines peacemaker.walk_in ONLY when a wave-4+ monster is in the
// fight (capable.js ACTION_PLAN entry, env-gated, default off). Other
// stall verbs still fire; Walk In still fires on wave <= 3. Vetguard
// stays in the substrate on both arms.
//
// SUBSTRATE (7 seeds, 180d, death-aware): r49 exactly — capable +
// deedhunt + vetcommit + greedy deferral (defaults MAXTIER 4 / LASTDAY
// 145, NOT tuned) + armorydrive + fullseat-diag + vetguard on waves
// seeds; forcedrift control clean. FULLSEAT=1, VETCOMMIT=1,
// CAPABLE_GREEDY=1, ARMORYDRIVE=1, CAPABLE_VETGUARD=1 (waves only),
// TELEMETRY_FULL=1. Seeds fresh 88051–88057 (verified unused in prior
// endgame notes/probes). Arm A: 88051–88053 waves. Control: 88054
// forcedrift. Arm B: 88055–88057 wavesnw (waves + NOWALKIN_W4).
//
// BINDINGS (a miss is NO-GO, never re-scored mid-run):
//  M1 GUARD: >=5/7 seeds reach the window (announceDay != null) OR
//     resolve via a voiced non-table path.
//  M2 CENSUS COMPLETE: every committed wave-4 fight on waves seeds
//     carries a primary outcome (coverage 100%), AND >=2/3 Arm A waves
//     seeds record >=1 committed wave-4 fight.
//  M3 CONVERSION: Arm B total wave-4+ kills > Arm A total wave-4+ kills.
//  M3b LIVING VETERAN: >=1/6 waves seeds ends with >=1 LIVING veteran.
//  M4 WAVE-5/FULL: >=1/6 waves seeds unlocks wave 5 OR earns the FULL
//     seat (expected NO-GO on a one-veteran road — still binding).
//  M5 VOICING CANONICAL: 88054 — bandCrossings >= 1 AND noticedCount >= 1.
//  M6 GUARD NAMED (deferred scope): every sat waves seed with
//     deferDays >= 1 records a named window-end guard (not 'unknown').
//  M7 PEOPLE: >=2 beats sense-read in full, 0 senseless flags.
// REG: r35 auditNamed on sat seeds with nonzero w4/w5; r37 satPenalty
//     present + voiced-line match on sat seeds.
//
// Usage:
//   FULLSEAT=1 VETCOMMIT=1 CAPABLE_GREEDY=1 ARMORYDRIVE=1 CAPABLE_VETGUARD=1 TELEMETRY_FULL=1 RELAYGREY=1 node scripts/probe-endgame-r58-20261027.js
//   SMOKE=1 ...  # 1 seed x 120d (pipeline only)
//   DET=1 ...    # instrument-on twice byte-identical (2 x 120d on SEEDS[0])
//   FID=1 ...    # env unset: wrapped == pure capable+deedhunt (mini)
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
  : [88401, 88402, 88403, 88404, 88405, 88406, 88407]).filter(Number.isFinite);
// seed plan: 88401-88403 waves (capable+deedhunt+vetcommit+greedy+armory + fullseat diag),
// 88404 forcedrift (capable + relaygrey FORCEDRIFT=1 + fullseat diag, greedy OFF, armory OFF)
const PLAN = { 88401: 'waves', 88402: 'waves', 88403: 'waves', 88404: 'forcedrift', 88405: 'wavesnw', 88406: 'wavesnw', 88407: 'wavesnw' };
// r51 FIX (seed-order bug, found live): runSeed DELETES CAPABLE_GREEDY /
// ARMORYDRIVE / CAPABLE_VETGUARD on forcedrift seeds, so a waves seed
// AFTER a forcedrift seed failed its own env check (r49 never hit this:
// its control was last). Snapshot the invoked env here and restore it at
// each waves seed's start — the loud check still fires if the INVOCATION
// lacked the vars; only cross-seed mutation is repaired.
const ORIG_ENV = {
  GREEDY: process.env.CAPABLE_GREEDY,
  ARMORY: process.env.ARMORYDRIVE,
  VETGUARD: process.env.CAPABLE_VETGUARD,
};
const planOf = (seed) => PLAN[seed] || 'grey';
const DAYS = process.env.DAYS ? parseInt(process.env.DAYS, 10)
  : (MODE === 'smoke' ? 120 : MODE === 'det' ? 120 : MODE === 'fid' ? 120 : 180);
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-27', 'perseed-endgame-r58');

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
  const isNW = plan === 'wavesnw';
  delete process.env.RELAYGREY_FORCEDRIFT;
  // r49 GREEDY + ARMORY OWNERSHIP: waves seeds defer (greedy ON, defaults
  // MAXTIER 4 / LASTDAY 145 as-shipped) AND arm the fighters (armory ON);
  // the forcedrift control keeps greedy OFF and armory OFF so the voicing
  // control stays r47-comparable. FID unsets both on both sides (greedy
  // is part of capable, armory is a gated layer).
  if (!useGrey && MODE !== 'fid') {
    // Restore the invoked waves env (see ORIG_ENV above): a forcedrift
    // seed earlier in this process deleted these; the check below must
    // judge the invocation, not the previous seed's cleanup.
    if (ORIG_ENV.GREEDY !== undefined) process.env.CAPABLE_GREEDY = ORIG_ENV.GREEDY;
    if (ORIG_ENV.ARMORY !== undefined) process.env.ARMORYDRIVE = ORIG_ENV.ARMORY;
    if (ORIG_ENV.VETGUARD !== undefined) process.env.CAPABLE_VETGUARD = ORIG_ENV.VETGUARD;
    if (process.env.CAPABLE_GREEDY !== '1') { console.error('SWEEP STOP: CAPABLE_GREEDY=1 required for the waves plan.'); process.exit(2); }
    if (process.env.ARMORYDRIVE !== '1') { console.error('SWEEP STOP: ARMORYDRIVE=1 required for the waves plan.'); process.exit(2); }
    if (process.env.CAPABLE_VETGUARD !== '1') { console.error('SWEEP STOP: CAPABLE_VETGUARD=1 required for the waves plan.'); process.exit(2); }
    if (isNW) process.env.CAPABLE_NOWALKIN_W4 = '1'; else delete process.env.CAPABLE_NOWALKIN_W4;
  } else if (useGrey) { delete process.env.CAPABLE_GREEDY; delete process.env.ARMORYDRIVE; delete process.env.CAPABLE_VETGUARD; delete process.env.CAPABLE_NOWALKIN_W4; }
  if (MODE === 'fid') { delete process.env.CAPABLE_GREEDY; delete process.env.ARMORYDRIVE; delete process.env.CAPABLE_VETGUARD; delete process.env.CAPABLE_NOWALKIN_W4; }
  if (useGrey && MODE !== 'fid') {
    if (process.env.RELAYGREY !== '1') { console.error('SWEEP STOP: RELAYGREY=1 required for the forcedrift plan.'); process.exit(2); }
    process.env.RELAYGREY_FORCEDRIFT = '1';
    process.env.CAPABLE_RELAYROAD = '0';
  } else {
    delete process.env.CAPABLE_RELAYROAD;
  }
  if (MODE === 'fid') { delete process.env.FULLSEAT; delete process.env.RELAYGREY; delete process.env.RELAYGREY_FORCEDRIFT; delete process.env.CAPABLE_RELAYROAD; delete process.env.CAPABLE_GREEDY; delete process.env.ARMORYDRIVE; delete process.env.CAPABLE_VETGUARD;; delete process.env.CAPABLE_NOWALKIN_W4; }
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
  // ---- r51 FIGHT-CAUSAL DEATH ATTRIBUTION (probe-local, read-only) ----
  // Wraps registerDeath (corpses.js choke point: success returns the
  // corpse object, the double-death guard returns null) AND tbVillagerFalls
  // (the combat death path, cause 'combat') OUTSIDE the game's own load-time
  // wrappers. Each wrapper records the death with the live tbfight object
  // at call time, then passes through untouched (same this, same args,
  // same return). A death whose fightRef matches a census fight's ref died
  // IN that fight; anything else is day-window only. The serializable
  // record and the object ref ride in parallel arrays (same order).
  const deathRecords = [];
  const deathFightRefs = [];
  let deathWrapErrors = 0;
  function recordDeath(channel, vid, name, cause) {
    try {
      let f = null; try { f = Game.tbfight || null; } catch (e) {}
      let mons = [];
      try {
        if (f) mons = (f.fighters || []).filter(x => x && x.kind === 'monster').map(x => ({ id: x.monsterId || (x.mdef || {}).id || '?', wave: ((x.mdef || {}).wave) || 0 }));
      } catch (e) {}
      deathRecords.push({ channel, vid: vid != null ? String(vid) : null, name: name || null, cause: cause || null, day: dayOf(Game), fightLive: !!f, fightOver: f ? !!f.over : null, monsters: mons });
      deathFightRefs.push(f);
    } catch (e) { deathWrapErrors++; }
  }
  try {
    const oReg = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
    if (oReg) Game.registerDeath = function (opts) {
      let r = null, threw = null;
      try { r = oReg.apply(this, arguments); } catch (e) { threw = e; }
      try {
        opts = opts || {};
        if (r !== null && (opts.kind === 'person' || opts.kind === 'villager' || opts.villagerId)) {
          recordDeath('registerDeath', opts.villagerId, opts.name, opts.cause);
        }
      } catch (e) { deathWrapErrors++; }
      if (threw) throw threw;
      return r;
    };
  } catch (e) { deathWrapErrors++; }
  try {
    const oFalls = Game.tbVillagerFalls ? Game.tbVillagerFalls.bind(Game) : null;
    if (oFalls) Game.tbVillagerFalls = function (t) {
      let before = false;
      try { before = !!(((Game.state || {}).village || {}).roster || []).includes(t && t.villagerId); } catch (e) {}
      let r = null, threw = null;
      try { r = oFalls.apply(this, arguments); } catch (e) { threw = e; }
      try {
        let after = true;
        try { after = !!(((Game.state || {}).village || {}).roster || []).includes(t && t.villagerId); } catch (e2) {}
        // Only a real removal is a death: the guard's early return (vid
        // already off the roster) records nothing.
        if (before && !after && t && t.villagerId) recordDeath('tbVillagerFalls', t.villagerId, t.name || null, 'combat');
      } catch (e) { deathWrapErrors++; }
      if (threw) throw threw;
      return r;
    };
  } catch (e) { deathWrapErrors++; }

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
    useGrey ? 'capable+relaygrey+fullseatdiag' : (isNW ? 'capabledeedhunt+vetcommit+armorydrive+nowalkin+fullseatdiag' : 'capabledeedhunt+vetcommit+armorydrive+fullseatdiag'),
    useGrey ? 'capable + forcedrift road + full-seat component recorder'
            : 'capable + deed-hunt + vetcommit + armorydrive + full-seat component recorder');

  // ---- r54 COMMIT-GATE SNAPSHOT (probe-local, read-only) ----
  // vetcommit's commitLive gate, snapshotted per fight: opted in,
  // unlockedWave == 4, veterans bar still short, scholar HP >= 50%.
  // scholarHpPct is inlined (vetcommit does not export it) with the
  // same formula. A snapshot names WHY a fight never committed; it
  // never changes the turn.
  function gateSnap(G) {
    try {
      const s = ((G.state || {}).scholar || {});
      const maxHp = G.maxHealth ? G.maxHealth() : 100;
      const hpPct = Math.round(((s.hp || s.health || 100) / Math.max(1, maxHp)) * 1000) / 1000;
      return { vetcommitOn: VC.vetcommitOn(), uw: VC.unlockedWave(G), veteransShort: VC.veteransShort(G), hpPct, commitLive: VC.commitLive(G) };
    } catch (e) { return { error: String(e && e.message) }; }
  }

  // ---- r51 FIGHT-OUTCOME CENSUS (probe-local, read-only) ----
  // Wraps policy.fight: observes every fight turn, tracks the live
  // tbfight by object identity, and closes each COMMITTED wave-4 fight
  // (vetcommit's ctx._w5Commit set on that turn) with one primary
  // outcome + flags. Never changes the turn: the inner fight's return
  // value and exceptions pass through untouched. Non-committed wave-4
  // fights are tallied as nonCommittedW4 (pending record, dropped at
  // close), never counted as census fights.
  let fightCensus = [];
  let nonCommittedW4 = 0;
  let censusErrors = 0;
  let openFight = null;
  let pendingNonCommit = null;
  // r51 FAST-FIGHT TALLY (census blind-spot fix, proven by 88062): a fight
  // that resolves inside a SINGLE policy.fight call is never opened by the
  // census (the old code returned early on f.over) — 88062's in-window
  // Suburb/Reunion fights left zero census trace despite '⚔' lines and
  // 5 wave-4 facings. A just-ended over fight never seen before, with
  // wave-4 monsters by DATA lookup (not mdef.wave, not hp>0 — the dead
  // and fled have no live hp), is tallied here, separately from the
  // multi-turn census, never merged into its outcome distribution.
  // Causal deaths match by tbfight identity (the death wrappers record
  // the live fight object), so fast fights DO carry named deaths; kills
  // are day-granular (waveKillLog day + monster id) and flagged as such.
  let fastW4 = [];
  let fastNonCommittedW4 = 0;
  let lastFastRef = null;
  let capLenAtLastObserve = 0;
  function dataWaveOf(G, mid) {
    try {
      const def = ((G.data || {}).monsters || []).find(d => d && d.id === mid);
      return (def && def.wave) || 0;
    } catch (e) { return 0; }
  }
  function fastMonsOf(G) {
    try {
      const f = G.tbfight;
      if (!f) return [];
      return (f.fighters || []).filter(x => x && x.kind === 'monster' && dataWaveOf(G, x.monsterId || (x.mdef || {}).id || x.id) >= 4);
    } catch (e) { return []; }
  }
  function killCountW4(G) { try { return ((G.state || {}).waveKillLog || []).filter(e => (e.w | 0) >= 4).length; } catch (e) { return 0; } }
  function aliveSetOf(G) {
    const s = new Set();
    try {
      for (const id of (((G.state || {}).village || {}).roster || [])) {
        let p = null;
        try { p = G.getPerson ? G.getPerson(id) : null; } catch (e2) {}
        if (p && !p.dead) s.add(id);
      }
    } catch (e) {}
    return s;
  }
  function snapFighters(G, f0) {
    try {
      const f = f0 || G.tbfight;
      if (!f) return null;
      const fs = f.fighters || [];
      return {
        result: f.result || null, over: !!f.over,
        playerFled: !!fs.find(x => x.key === 'p' && x.fled),
        villFled: !!fs.filter(x => (x.kind === 'villager' || x.kind === 'ally') && x.fled).length,
        monFled: !!fs.filter(x => x.kind === 'monster' && x.fled).length,
      };
    } catch (e) { return null; }
  }
  function wave4Mons(G) {
    try {
      const f = G.tbfight;
      if (!f) return [];
      return (f.fighters || []).filter(x => x && x.kind === 'monster' && (x.hp || 0) > 0 && ((dataWaveOf(G, x.monsterId || (x.mdef || {}).id || x.id) || ((x.mdef || {}).wave) || 0) >= 4));
    } catch (e) { return []; }
  }
  function closeFightRec(G, rec0, why) {
    if (!rec0 || rec0.closed) return;
    rec0.closed = true;
    try { if (engineOpen.has(rec0.ref)) engineOpen.delete(rec0.ref); } catch (e) {}
    try { closedEngineRefs.add(rec0.ref); } catch (e) {}
    try {
      const endKills = killCountW4(G);
      const endAlive = aliveSetOf(G);
      const died = [...rec0.startAlive].filter(id => !endAlive.has(id));
      const slice = capture.slice(rec0.startCap);
      const talkDown = slice.some(s => /They stand down|Walk In: the fight ends/.test(s));
      const gotAway = slice.some(s => /It got away/.test(s));
      const killFlag = endKills > rec0.startKills;
      const dieFlag = died.length > 0;
      const last = rec0.lastSnap || {};
      let outcome = 'otherEnd';
      if (killFlag) outcome = 'vKill';
      else if (dieFlag) outcome = 'vDie';
      else if (talkDown) outcome = 'talkDown';
      else if (last.playerFled || last.villFled) outcome = 'vFlee';
      else if (last.monFled || gotAway) outcome = 'mFlee';
      // r51: fight-causal deaths = death records whose tbfight object IS
      // this fight (identity, not day-window). Dedupe by vid: a death can
      // ride both channels (registerDeath + tbVillagerFalls) for one body.
      const causalByVid = {};
      for (let i = 0; i < deathRecords.length; i++) {
        if (deathFightRefs[i] === rec0.ref) {
          const dr = deathRecords[i];
          if (!causalByVid[dr.vid]) causalByVid[dr.vid] = dr;
        }
      }
      const causalDeaths = Object.values(causalByVid);
      const escapeKind = slice.some(x => /ESCAPED|BARRIER CROSSED|last streetlight|crash through to a new area/.test(x)) ? 'designed' : 'break';
      const arenaMention = slice.some(x => /arena/i.test(x));
      const deathCauses = [...new Set(causalDeaths.map(d => d.cause || '?'))];
      fightCensus.push({
        monsters: rec0.monsters, startDay: rec0.startDay, endDay: dayOf(G),
        turns: rec0.turns, turnsObserved: !!rec0.turnsObserved, outcome, killFlag, dieFlag, talkDown, gotAway,
        escapeKind, openDriver: rec0.openDriver || 'policy', source: rec0.source || 'policy',
        committed: rec0.committed !== false, arenaMention, deathCauses,
        gateAtOpen: rec0.gateAtOpen || null, gateAtFirstObserve: rec0.gateAtFirstObserve || null, ctxCommitAtFirstObserve: rec0.ctxCommitAtFirstObserve != null ? rec0.ctxCommitAtFirstObserve : null,
        playerFled: !!last.playerFled, villFled: !!last.villFled,
        monFled: !!last.monFled, result: last.result || null, closeWhy: why,
        diedInFight: died, causalDeaths, causalFlag: causalDeaths.length > 0,
      });
    } catch (e) { censusErrors++; }
  }
  function closeFight(G, why) {
    if (!openFight) return;
    const rec0 = openFight;
    openFight = null;
    closeFightRec(G, rec0, why);
  }
  function closePending(G, why) {
    if (!pendingNonCommit) return;
    const p = pendingNonCommit;
    pendingNonCommit = null;
    closeFightRec(G, {
      ref: p.ref, monsters: p.monsters || [], startDay: p.startDay, startCap: p.startCap,
      startKills: p.startKills, startAlive: p.startAlive, turns: p.turns || 1,
      turnsObserved: true, lastSnap: null, source: 'policy', openDriver: 'policy',
      committed: false,
      gateAtOpen: p.gateAtOpen || null, gateAtFirstObserve: p.gateAtFirstObserve || null, ctxCommitAtFirstObserve: p.ctxCommitAtFirstObserve != null ? p.ctxCommitAtFirstObserve : null,
    }, why);
  }
  function censusObserve(G, c) {
    const f = G.tbfight;
    if (openFight && f === openFight.ref) {
      const sn = snapFighters(G);
      if (sn) openFight.lastSnap = sn;
      openFight.turns++;
      openFight.turnsObserved = true;
      if (f.over) closeFight(G, 'over');
      return;
    }
    if (openFight) closeFight(G, 'ref-change');
    if (pendingNonCommit && f !== pendingNonCommit.ref) { closePending(G, 'ref-change'); }
    // r51 FAST BRANCH: a just-ended over fight never opened above. Only
    // when no open fight and no pending entry claims this ref (a pending
    // fight that ended keeps its tally-at-next-fight path, never double).
    if (f && f.over && f !== lastFastRef && !(pendingNonCommit && pendingNonCommit.ref === f) && !engineOpen.has(f) && !closedEngineRefs.has(f)) {
      lastFastRef = f;
      try {
        const fm = fastMonsOf(G);
        if (fm.length) {
          const slice = capture.slice(capLenAtLastObserve);
          const committed = !!(c && c._w5Commit === true);
          const mids = fm.map(m => (m.monsterId || (m.mdef || {}).id || '?'));
          const causalByVid = {};
          for (let i = 0; i < deathRecords.length; i++) {
            if (deathFightRefs[i] === f) {
              const dr = deathRecords[i];
              if (!causalByVid[dr.vid]) causalByVid[dr.vid] = dr;
            }
          }
          let dayKills = [];
          try {
            dayKills = ((G.state || {}).waveKillLog || []).filter(e => e && e.d === dayOf(G) && mids.indexOf(e.mid) >= 0);
          } catch (e2) {}
          policyOnlyOpensW4++;
          const fGotAway = slice.some(x => /It got away/.test(x));
          const fEscaped = slice.some(x => /You escape\. The thicket/.test(x));
          let fOutcome = 'otherEnd';
          if (dayKills.length) fOutcome = 'vKill';
          else if (Object.values(causalByVid).length) fOutcome = 'vDie';
          else if (fGotAway) fOutcome = 'mFlee';
          else if (fEscaped) fOutcome = 'vFlee';
          fightCensus.push({
            monsters: mids, startDay: dayOf(G), endDay: dayOf(G),
            turns: 1, turnsObserved: true, outcome: fOutcome,
            killFlag: dayKills.length > 0, dieFlag: Object.values(causalByVid).length > 0,
            talkDown: slice.some(x => /They stand down|Walk In: the fight ends/.test(x)),
            gotAway: fGotAway, escapeKind: (fEscaped || slice.some(x => /ESCAPED|BARRIER CROSSED|last streetlight|crash through/.test(x))) ? 'designed' : 'break',
            openDriver: 'policy', source: 'policy-fast', committed,
            arenaMention: slice.some(x => /arena/i.test(x)),
            deathCauses: [...new Set(Object.values(causalByVid).map(d => d.cause || '?'))],
            playerFled: false, villFled: false, monFled: fGotAway,
            result: f.result || null, closeWhy: 'fast-single-call',
            gateAtOpen: null, gateAtFirstObserve: gateSnap(G), ctxCommitAtFirstObserve: committed,
            diedInFight: [], causalDeaths: Object.values(causalByVid),
            causalFlag: Object.values(causalByVid).length > 0,
            dayKills: dayKills.map(e => ({ mid: e.mid, by: e.by || null, via: e.via || null })),
          });
        }
      } catch (e) { censusErrors++; }
    }
    capLenAtLastObserve = capture.length;
    if (!f || f.over) return;
    const mons = wave4Mons(G);
    if (!mons.length) return;
    const committed = !!(c && c._w5Commit === true);
    const types = mons.map(m => (m.monsterId || (m.mdef || {}).id || '?'));
    // r52 ENGINE ADOPTION: a fight the startCombat wrapper already opened
    // is the SAME fight by object identity — adopt it (engine start
    // snapshots are earlier and complete) instead of opening a second
    // record. Non-committed engine fights stay in the engine map until
    // they commit; the policy pending record is unnecessary then.
    if (engineOpen.has(f)) {
      const er = engineOpen.get(f);
      er.turnsObserved = true;
      er.lastSnap = snapFighters(G);
      er.turns++;
      if (!er.gateAtFirstObserve) { er.gateAtFirstObserve = gateSnap(G); er.ctxCommitAtFirstObserve = committed; }
      if (!committed) {
        if (pendingNonCommit && pendingNonCommit.ref === f) pendingNonCommit = null;
        return;
      }
      er.source = 'engine+policy';
      er.committed = true;
      engineOpen.delete(f);
      if (pendingNonCommit && pendingNonCommit.ref === f) pendingNonCommit = null;
      openFight = er;
      return;
    }
    // Conversion: a pending fight that LATER commits (commitLive turned
    // true mid-fight) joins the census with its ORIGINAL start snapshots,
    // so kills/deaths from the fight's start are not lost.
    if (pendingNonCommit && pendingNonCommit.ref === f) {
      if (!committed) return; // still waiting for commit; stay pending
      openFight = {
        ref: f, monsters: types, startDay: pendingNonCommit.startDay,
        startCap: pendingNonCommit.startCap,
        startKills: pendingNonCommit.startKills,
        startAlive: pendingNonCommit.startAlive,
        turns: (pendingNonCommit.turns | 0) + 1,
        gateAtOpen: pendingNonCommit.gateAtOpen || null, gateAtFirstObserve: pendingNonCommit.gateAtFirstObserve || null, ctxCommitAtFirstObserve: pendingNonCommit.ctxCommitAtFirstObserve != null ? pendingNonCommit.ctxCommitAtFirstObserve : null,
        turnsObserved: true,
        lastSnap: snapFighters(G),
        source: 'policy', openDriver: 'policy', committed: true,
      };
      pendingNonCommit = null;
      return;
    }
    if (committed) {
      policyOnlyOpensW4++;
      openFight = {
        ref: f, monsters: types, startDay: dayOf(G), startCap: capture.length,
        startKills: killCountW4(G), startAlive: aliveSetOf(G), turns: 1,
        turnsObserved: true,
        lastSnap: snapFighters(G),
        source: 'policy', openDriver: 'policy', committed: true,
      };
    } else {
      policyOnlyOpensW4++;
      pendingNonCommit = {
        ref: f, monsters: types, startDay: dayOf(G), startCap: capture.length,
        startKills: killCountW4(G), startAlive: aliveSetOf(G), turns: 1, gateAtFirstObserve: gateSnap(G), ctxCommitAtFirstObserve: committed,
      };
    }
  }
  const oFight = policy.fight ? policy.fight.bind(policy) : null;
  if (oFight) {
    policy.fight = (G, c) => {
      let r = null, threw = null;
      try { r = oFight(G, c); } catch (e) { threw = e; }
      try { censusObserve(G, c); } catch (e2) { censusErrors++; }
      if (threw) throw threw;
      return r;
    };
  }
  // ---- r52 ENGINE-LEVEL CENSUS (startCombat wrapper, read-only) ----
  // Every fight opener funnels through Game.startCombat(mid): record the
  // open here (wave by DATA lookup, fallback mdef.wave) so fights that
  // open and close inside one daily — invisible to the policy.fight
  // wrapper — are still census fights. The wrapper passes through
  // untouched (same this, same args, same return, same throw).
  const engineOpen = new Map();
  const closedEngineRefs = new Set();
  let engineOpensW4 = 0, policyOnlyOpensW4 = 0;
  try {
    const oStart = Game.startCombat ? Game.startCombat.bind(Game) : null;
    if (oStart) Game.startCombat = function (mid) {
      let r = null, threw = null;
      try { r = oStart.apply(this, arguments); } catch (e) { threw = e; }
      try {
        const f = Game.tbfight || null;
        if (f && !engineOpen.has(f) && !closedEngineRefs.has(f)) {
          const mons = (f.fighters || []).filter(x => x && x.kind === 'monster');
          const w4 = mons.filter(x => { const w = dataWaveOf(Game, x.monsterId || (x.mdef || {}).id || x.id) || ((x.mdef || {}).wave) || 0; return w >= 4; });
          if (w4.length) {
            engineOpensW4++;
            engineOpen.set(f, {
              ref: f, monsters: w4.map(x => (x.monsterId || (x.mdef || {}).id || '?')),
              startDay: dayOf(Game), startCap: capture.length,
              startKills: killCountW4(Game), startAlive: aliveSetOf(Game),
              turns: 1, turnsObserved: false, lastSnap: snapFighters(Game, f),
              source: 'engine', openDriver: 'engine', committed: false,
              gateAtOpen: gateSnap(Game),
            });
          }
        }
      } catch (e) { censusErrors++; }
      if (threw) throw threw;
      return r;
    };
  } catch (e) { censusErrors++; }
  function closeEngineOpen(G, why) {
    for (const [ref, rec] of Array.from(engineOpen.entries())) {
      try {
        if (ref.over || !G.tbfight || G.tbfight !== ref) closeFightRec(G, rec, why);
        else { rec.lastSnap = snapFighters(G, ref); }
      } catch (e) { censusErrors++; }
    }
  }
  const oDaily = policy.daily.bind(policy);
  let todayPreSnap = null; // r49: pre-daily guard snapshot for THIS day (see below)
  let withdrawal = null;
  let dayBounds = []; // r54 FIX: (day, capture idx) at each daily start — the rescan below maps a hit to its day
  let dayStartDay = 0;
  policy.daily = (G, c) => {
    dayStartCapIdx = capture.length;
    dayStartDay = dayOf(G);
    dayBounds.push({ day: dayStartDay, idx: dayStartCapIdx });
    try {
      if (openFight && (!G.tbfight || G.tbfight !== openFight.ref)) closeFight(G, 'day-boundary');
      if (pendingNonCommit && (!G.tbfight || G.tbfight !== pendingNonCommit.ref)) { closePending(G, 'day-boundary'); }
      closeEngineOpen(G, 'day-boundary');
    } catch (e) { censusErrors++; }
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
    // r52: close engine fights that opened AND closed inside this daily
    // (the finishLiveFight class — never touches policy.fight), and
    // detect the table WITHDRAWAL beat on the day it fires.
    try { closeEngineOpen(G, 'day-end'); } catch (e) { censusErrors++; }
    try {
      if (!withdrawal) {
        const slice = capture.slice(dayStartCapIdx);
        const hit = slice.find(x => /PELLET HUMS|the mantle may pass to hungrier hands/.test(x));
        if (hit) withdrawal = { day: dayStartDay, line: hit.slice(0, 300) };
      }
    } catch (e) { instrumentErrors++; }
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
  try {
    if (openFight) closeFight(Game, 'run-end');
    if (pendingNonCommit) { closePending(Game, 'run-end'); }
    closeEngineOpen(Game, 'run-end');
  } catch (e) { censusErrors++; }
  won = !!Game.won;

  // ---- r54 FIX: end-of-run withdrawal rescan ----
  // r54 found the daily-slice detector MISSING a real PELLET HUMS decline
  // (88095: the line is in the full transcript, withdrawal field null).
  // The decline fires on a day-transition the daily slice does not cover
  // (it sits between night camp and the next day's actions — outside the
  // wrapper's per-day slice). The per-day detector stays as-is; this
  // post-hoc, read-only rescan catches what it missed, tagged
  // source:'end-rescan' so a daily hit and a rescan hit stay distinct.
  // It reads capture only — it changes no gameplay, no policy, no seed.
  if (!withdrawal) {
    try {
      const hitIdx = capture.findIndex(x => /PELLET HUMS|the mantle may pass to hungrier hands/.test(x));
      if (hitIdx >= 0) {
        let d = null;
        for (const b of dayBounds) if (b.idx <= hitIdx) d = b.day;
        withdrawal = { day: d, line: capture[hitIdx].slice(0, 300), source: 'end-rescan' };
      }
    } catch (e) { instrumentErrors++; }
  }

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
  // ---- r51 ENCOUNTER SUPPLY: wave-4 arrivals that never became fights ----
  // Scans the full-run capture for the arrival/boundary lines and pairs
  // each boundary-blocked arrival with the monster named just before it.
  // (The transcript file only covers announce->end; the capture is full-run.)
  const WAVE4_NAMES = { 'The Suburb': 'suburb', 'The Strike': 'strike', 'The Influencer': 'influencer', 'The Congregation': 'congregation', 'The Reunion': 'reunion', 'The Eater': 'eater', 'The Algorithm': 'algorithm', 'The Audit': 'audit', 'The Eulogy': 'eulogy', 'The Herald': 'herald' };
  function blockedArrivalsOf() {
    const out = [];
    try {
      for (let i = 0; i < capture.length; i++) {
        const line = capture[i];
        if (/stops at the boundary|Something else is already here/.test(line)) {
          // r51 PILOT FIX: the monster's name is IN the boundary line
          // itself ("The Reunion stops at the boundary") — the original
          // lookback scanned only lines BEFORE it and always missed.
          // Scan the line itself plus the 6 lines before it; also record
          // the raw name so non-wave-4 arrivals are visible too (the slot
          // is near-always occupied — the supply mechanism itself).
          let mon = null, rawName = null;
          for (let j = Math.max(0, i - 6); j <= i; j++) {
            const mName = capture[j].match(/The ([A-Z][A-Za-z' -]+?) stops at the boundary/);
            if (mName) rawName = 'The ' + mName[1];
            for (const nm of Object.keys(WAVE4_NAMES)) {
              if (capture[j].indexOf(nm) >= 0) mon = WAVE4_NAMES[nm];
            }
          }
          out.push({ line: line.slice(0, 200), monster: mon, rawName, capIdx: i });
        }
      }
    } catch (e) {}
    return out;
  }

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
    weekly, fightCensus: { fights: fightCensus, nonCommittedW4, censusErrors, fastW4, fastNonCommittedW4, engineOpensW4, policyOnlyOpensW4 }, census: censusOf(Game), veterans, withdrawal,
    deathRecords, deathWrapErrors,
    blockedArrivals: blockedArrivalsOf(),
  };
  if (process.env.DET !== '1' && process.env.FID !== '1') {
    try { fs.mkdirSync(EVID, { recursive: true }); } catch (e) {}
    writeFileRetry(path.join(EVID, `endgame-r58-${seed}.json`), JSON.stringify(rec, null, 1));
    // r49: slice from the ANNOUNCE day (r47 metric-review item 5) — the
    // deferral itself must be readable, not just counted. Fall back to
    // the TABLE IS SET / AUDIT lines if the announce capture is missing.
    const annIdx = capture.findIndex(s => s.indexOf('◈ THE TABLE IS SET') === 0);
    const auditIdx2 = capture.findIndex(s => s.indexOf('◈ THE AUDIT') === 0);
    const start = announceCapIdx != null ? announceCapIdx
      : Math.max(0, annIdx >= 0 ? annIdx : (auditIdx2 >= 0 ? auditIdx2 : 0));
    writeFileRetry(path.join(EVID, `endgame-r58-${seed}-transcript.txt`),
      `# journey-endgame r58 — seed ${seed}, announced d${announceDay}, sat day ${satDay} (${satSeatKind} seat), ` +
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
    console.log('CENSUS', JSON.stringify({ fights: (r.fightCensus && r.fightCensus.fights) || [], nonCommittedW4: r.fightCensus ? r.fightCensus.nonCommittedW4 : null, censusErrors: r.fightCensus ? r.fightCensus.censusErrors : null, engineOpens: r.fightCensus ? r.fightCensus.engineOpensW4 : null, policyOnlyOpens: r.fightCensus ? r.fightCensus.policyOnlyOpensW4 : null, withdrawal: r.withdrawal || null }));
    console.log('RG', JSON.stringify(r.rg ? { firstAvailableDay: r.rg.firstAvailableDay, claimDay: r.rg.claimDay, claimTried: r.rg.claimTried, claimWaiting: r.rg.claimWaiting, verbs: r.rg.verbs, communes: r.rg.communes, doorRelay: r.rg.doorRelay, cockpitPicks: r.rg.cockpitPicks, finalPick: r.rg.finalPick, atSit: r.rg.atSit, traceTail: r.rg.leanTraceTail } : null));
    return;
  }
  const out = [];
  for (const s of SEEDS) {
    const r = await runSeed(s, DAYS);
    const rd = r.relayDoor || {};
    const fs44 = r.fullseat || {};
    out.push({ seed: r.seed, plan: r.plan, announceDay: r.announceDay, satDay: r.satDay, deferDays: r.deferDays, greedyWaits: r.greedy && r.greedy.waits, greedyMaxTier: r.greedy && r.greedy.maxTier, maxTier: r.maxTier, satPenalty: r.satPenalty, overtimeLines: r.overtimeLines, armoryDonations: r.armory && r.armory.donations, armoryUnits: r.armory && r.armory.unitsAtEnd, windowEndGuard: r.windowEndGuard, livingVeterans: r.veterans && r.veterans.livingVeteranCount, unlockedWave: r.veterans && r.veterans.unlockedWave, seat: r.satSeatKind, path: r.walkedPath, branch: r.walkedBranch, won: r.won, end: r.endReason, alive: r.census.alive, atSit: r.rg && r.rg.atSit, verbs: r.rg && r.rg.verbs, communes: r.rg && r.rg.communes, doorRelay: r.rg && r.rg.doorRelay, finalPickId: r.finalPickId, finalResolved: r.finalResolved, withdrawal: r.withdrawal || null, census: { n: ((r.fightCensus && r.fightCensus.fights) || []).length, outcomes: ((r.fightCensus && r.fightCensus.fights) || []).map(f => f.outcome), sources: ((r.fightCensus && r.fightCensus.fights) || []).map(f => f.source), escapeKinds: ((r.fightCensus && r.fightCensus.fights) || []).map(f => f.escapeKind), nonCommittedW4: r.fightCensus ? r.fightCensus.nonCommittedW4 : null, engineOpens: r.fightCensus ? r.fightCensus.engineOpensW4 : null, policyOnlyOpens: r.fightCensus ? r.fightCensus.policyOnlyOpensW4 : null, fastW4: ((r.fightCensus && r.fightCensus.fastW4) || []).map(f => f.monsters.join('+') + (f.committed ? '' : '(noncom)')), fastNonCom: r.fightCensus ? r.fightCensus.fastNonCommittedW4 : null }, noticed: r.noticedCount, bandCrossings: r.bandCrossings, fullseatMax: fs44.max, firstFullSeatDay: fs44.firstFullSeatDay, bestSeat: fs44.bestSeat, indispEver: fs44.indispEver, door: { held: rd.heldAtSit, lean: rd.leanAtSit, band: rd.bandAtSit, bond: rd.bondAtSit, capClaimed: rd.capClaimed, capCommunes: rd.capCommunes, capReroutes: rd.capReroutes, walked: rd.doorWalked } });
    console.log(JSON.stringify(out[out.length - 1]));
  }
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
