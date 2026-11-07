// journey-deepening-r113-20261107.js -- DEEPENING leg R113: DO BOND/LINK
// ASKS REACH THE PLAYER? (r110 follow-up) + Q2 away-line fix measured.
// Fork of the r110 driver with ONLY output filenames, this header, the seed
// band (95601-95604, fresh by the full check in the r113 prereg; r110 used
// 95201-95204), the policy id, and ONE pre-registered instrument addition
// (r113 prereg Q1): the daily talkReqSnap — the staged maps read live each
// day (bondRequests, linkRaises, talkRequests with kind flags + delivered)
// — joined at analysis time with the bond instrument's convoEvents
// (talkTo/endConvo per day, now serialized into the seed JSON — r110's
// output dropped them) and bondTeleEvents, so every staged scholar-targeted
// request gets a per-request record: staged day, holder, kind, talkable,
// talked-while-live, decided or expired. The bond instrument itself is
// unchanged (r110). CONVO_DAYS stays r105's [45, 60, 80]
// (SURV-CONTROL-4 lineage). The Q2 game fix (convo-wants.js away lines)
// is IN the base this panel runs on; the Q1 driver fix (request-priority
// talk + pickChoice bond:/link: handling) is built ONLY if the before-panel
// verdict is POLICY-GAP (or REACHED with the choice gap firing live), and
// then the after-panel re-runs these SAME seeds on the SAME game code.
// The r113 analyzer carries the r110 sections unchanged plus Q1
// REQUEST-TELEMETRY (talkReqSnaps join) and the Q2 away-line adjudication.
// Policy, sitting mechanics, and all other instruments are inherited
// from r105 (r106 lineage: goalSnap snapshots, meat wraps, census,
// sittings up to 3 per convo day, stop after the first betrayal sitting,
// revisit sittings in orderSittingCandidates).
// Promise threads need no driver change: every sitting already logs
// `want final: resolution=promised`, which the r113 analyzer scans.
// Wave 4 is NOT re-judged here: r90 measured it. Beast-trick teaching
// is NOT re-judged: r92 decomposed it. Standing/scale two-rulers is
// NOT re-judged: r93 closed it. The knowledge economy is carried as
// context only.
//
// Usage: POLICY=competent SEEDS=95601,95602,95603,95604 node scripts/journey-deepening-r113-20261107.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [95601, 95602, 95603, 95604]);
const DAYCAP = parseInt(process.env.DAYCAP || '100', 10);
const PROBE_W3 = process.env.PROBE_W3 === '1';

const { mulberry32, loadGame, setupGame, runDays, driveFights, driveContests } = require('./sim-harness');
const BONDINST = require('./bond-initiation-instrument-20261105');
const { competent } = require('./policies/competent');
const { belongseek } = require('./policies/belongseek');
const POLICY = process.env.POLICY === 'belongseek' ? 'belongseek' : 'competent';
const BASE = POLICY === 'belongseek' ? belongseek : competent;

// EVIDIR (r12): per-seed evidence goes to the goal hidden_files evidence dir,
// NOT the repo -- keeps the repo clean (AGENTS.md green-list discipline) and
// matches the coordinator's note layout. Relative path from the worktree root
// avoids hardcoding machine-specific absolutes.
const EVIDIR = path.join(ROOT, '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-11-07');
// R107: the driver never created EVIDIR — the smoke run died ENOENT on the
// first write because 2026-11-07 did not exist yet (r105/r106 inherited a
// live dir). Create it; simulation behavior is untouched.
try { fs.mkdirSync(EVIDIR, { recursive: true }); } catch (e) {}

// ---- per-seed globals (reset per seed) ----
let capture = [];
let _currentSeed = null;
let _G = null;
function cap(line) {
  if (line == null) return;
  const s = String(line);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
}

// wave of a monster id
function waveOf(mid) {
  try {
    const d = (_G.data.monsters || []).find(m => m.id === mid);
    return (d && d.wave) || 1;
  } catch (e) { return 1; }
}
function monsterDisplay(mid) {
  try {
    const d = (_G.data.monsters || []).find(m => m.id === mid);
    return (d && (d.displayName || d.name)) || mid;
  } catch (e) { return mid; }
}
function vname(vid) { try { return _G.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return _G.getPerson(vid) || {}; } catch (e) { return {}; } }
function gday() { try { return (_G.state && _G.state.scholar && _G.state.scholar.day) || 0; } catch (e) { return 0; } }
function waveNow() { try { return _G.unlockedWave ? _G.unlockedWave() : null; } catch (e) { return null; } }
function scaleNow() { try { return _G.scaleRank ? _G.scaleRank() : null; } catch (e) { return null; } }
function pantryKcal() {
  try {
    return ((_G.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || i.count || 1), 0);
  } catch (e) { return 0; }
}
function waveEngaged(w) { try { return _G.waveEngaged ? _G.waveEngaged(w) : 0; } catch (e) { return 0; } }
function waveLedgerPoints(w) { try { return _G.waveLedgerPoints ? (_G.waveLedgerPoints(w) | 0) : 0; } catch (e) { return 0; } }

// knowledge-economy markers (r7): experiment beats, trader deepening, moots
const KNOW_MARKERS = {
  experiment: ['spends the afternoon with the'],
  traderDeep: ['knows it deep enough to teach'],
  moot: ["There's going to be a moot", ' convenes a moot', 'The village gathers', 'moot'],
};

// signature-mechanic markers for wave-3 monsters (r2 list)
const SIG_MARKERS = {
  spool: ['reel', 'RECORD', 'REPLAY', 'the tape'],
  terms_of_service: ['clause', 'fine print', '§0', 'termination'],
  redactor: ['REDACT', 'redact'],
  callback: ['funeral', 'goodbye', 'NOT '],
  buffering: ['afterimage', 'will step', '3 seconds'],
  ad_break: ['ad break', 'SKIP', 'sponsor'],
  chorus_line: ['downbeat', '4/4'],
  focus_group: ['LOVED', 'HATED', 'murmur'],
  gavel: ['trial', 'verdict', 'ACCUS', 'OBJECT'],
};

// ---- goInside (r2 fix): travelTo leaves the scholar outside the hall ----
function goInside() {
  try {
    const t = _G.playerTile ? _G.playerTile() : null;
    if (t && t.type === 'haven') {
      const s = _G.state.scholar;
      if (s && !s.insideHaven && !s.insideTent && _G.enterBuilding) _G.enterBuilding();
    }
  } catch (e) {}
}

// ---- leg extensions (from r2) ----
function gearUp(ctx) {
  try {
    if ((ctx._gearDay || 0) === gday()) return;
    ctx._gearDay = gday();
    const inv = _G.state.scholar.inventory || [];
    const defs = _G.data.items || [];
    const defOf = (it) => defs.find(d => d.id === (it.itemId || it.id));
    let best = -1, bestBonus = -999, bestSlot = 'melee';
    inv.forEach((it, i) => {
      const d = defOf(it); if (!d || d.class !== 'weapon') return;
      const w = d.weapon || {};
      const b = w.bonus || 0;
      if (b > bestBonus) { bestBonus = b; best = i; bestSlot = (w.range > 1 || /bow|sling/i.test(w.type || '')) ? 'ranged' : 'melee'; }
    });
    if (best >= 0) {
      const eq = _G.state.scholar.equipped || {};
      const cur = eq[bestSlot];
      const curId = cur && (cur.itemId || cur.id);
      const it = inv[best];
      const bestId = it.itemId || it.id;
      if (curId !== bestId) {
        try { _G.equip(best, bestSlot); ctx.geared = (ctx.geared || 0) + 1; } catch (e) {}
      }
    }
    try { _G.craft('fire_hardened_spear'); } catch (e) {}
    try {
      const worn = new Set(Object.values(_G.state.scholar.equipped || {}).map(e => e && (e.itemId || e.id)));
      for (let i = 0; i < inv.length; i++) {
        const d = defOf(inv[i]); if (!d || !d.armor) continue;
        const id = inv[i].itemId || inv[i].id;
        if (worn.has(id)) continue;
        try { _G.equip(i, 'armor'); ctx.armored = (ctx.armored || 0) + 1; break; } catch (e) {}
      }
    } catch (e) {}
  } catch (e) {}
}

function regionalPlay(ctx) {
  const allowPropose = POLICY !== 'belongseek'; // BELONG courtship owns proposing on its arm
  const day = gday();
  const reg = ctx.regionalLog;
  const note = (ev) => reg.push(Object.assign({ day }, ev));
  try {
    const st = _G.state;
    if (st.pendingCounter) {
      try { _G.answerCounter('accept'); note({ ev: 'counter', how: 'accept' }); } catch (e) { note({ ev: 'counter', how: 'accept', err: String(e && e.message) }); }
    }
    if (st.pendingAccord) {
      const cap0 = capture.length;
      try { _G.answerAccord('gift'); note({ ev: 'accord', how: 'gift', scale: scaleNow() }); } catch (e) { note({ ev: 'accord', how: 'gift', err: String(e && e.message) }); }
      note({ ev: 'accord-text', lines: capture.slice(cap0, cap0 + 6) });
    }
    if (st.pendingNational) {
      const shape = st.pendingNational.shape;
      const pick = { lead: 'feast', conquest: 'mercy', belong: 'swear', covenant: 'pact', trade: 'sign' }[shape] || 'feast';
      try { _G.answerNationalChoice(pick); note({ ev: 'national', shape, how: pick, scale: scaleNow() }); } catch (e) { note({ ev: 'national', shape, how: pick, err: String(e && e.message) }); }
    }
    if (st.pendingGlobal) {
      try { _G.answerGlobalChoice('feast'); note({ ev: 'global', how: 'feast', scale: scaleNow() }); } catch (e) { note({ ev: 'global', how: 'feast', err: String(e && e.message) }); }
    }
    if (st.pendingSwitchboard) {
      try {
        const cands = _G.switchboardCandidates ? _G.switchboardCandidates() : [];
        if (cands.length && _G.appointSwitchboard) { _G.appointSwitchboard(cands[0].id); note({ ev: 'switchboard', who: cands[0].id }); }
      } catch (e) { note({ ev: 'switchboard', err: String(e && e.message) }); }
    }
    let links = [];
    try { links = _G.hierarchyState() || []; } catch (e) {}
    for (const link of links) {
      if (!link || link.status !== 'active' || link.subordinate !== 'haven') continue;
      if (link.pendingDemand) {
        const rich = pantryKcal() > 12000;
        try { _G.answerDemand(link.id, rich); note({ ev: 'demand', link: link.id, how: rich ? 'honor' : 'refuse' }); }
        catch (e) { note({ ev: 'demand', link: link.id, err: String(e && e.message) }); }
      }
      const week = (_G._week ? _G._week() : 0);
      if (link.tributePaidWeek !== week && pantryKcal() > 15000) {
        try { const paid = _G.payTribute(link.id); note({ ev: 'tribute', link: link.id, paid }); }
        catch (e) { note({ ev: 'tribute', link: link.id, err: String(e && e.message) }); }
      }
    }
    if (allowPropose && day >= 25 && !st.pendingCounter && !st.pendingAccord && pantryKcal() > 12000) {
      const hasActive = links.some(l => l && l.status === 'active');
      if (!hasActive) {
        const ovs = (st.otherVillages || []).filter(v => v && v.id !== 'haven' && _G.knowsVillage(v) && !_G.linkWith(v.id));
        if (ovs.length) {
          const t = ovs[0];
          ctx._propCool = ctx._propCool || {};
          if ((ctx._propCool[t.id] || 0) + 7 <= day) {
            ctx._propCool[t.id] = day;
            try {
              const r = _G.proposeLink(t.id);
              note({ ev: 'propose', target: t.id, name: t.name, result: r == null ? 'declined' : (r === 'counter' ? 'counter' : 'linked') });
            } catch (e) { note({ ev: 'propose', target: t.id, err: String(e && e.message) }); }
          }
        }
      }
    }
  } catch (e) {}
}


// r92: classify one beast-trick ask from pre-ask state + result.
// taught  -> askAbout returned a taught id (counterTeachable was non-null).
// none-no-counter -> ask returned none AND no slain-unknown type carries a
//   counter definition, so no kill in this state could ever yield a trick.
// none-other -> ask returned none despite a countered slain-unknown type
//   existing (or teachableBefore non-null): a real bug if ever seen.
// repeat asks on an unchanged unteachable state are detected by the
// analyzer (same noCounter set on a later 5-day tick), not here.
function classifyBeastAsk(a) {
  if (a && a.taught) return 'taught';
  if (a && a.teachableBefore) return 'none-other';
  const unknowns = (a && a.slainUnknown) || [];
  const noCounter = (a && a.noCounter) || [];
  if (unknowns.length && noCounter.length >= unknowns.length) return 'none-no-counter';
  if (unknowns.length) return 'none-other';
  return 'none-other';
}

function knowledgePlay(ctx) {
  const day = gday();
  if ((ctx._btDay || 0) === day) return;
  ctx._btDay = day;
  if (day % 5 !== 0) return;
  try {
    const slain = _G.state.villageSlain || {};
    const known = _G.state.monsterCounters || {};
    const slainUnknown = Object.keys(slain).filter(t => (slain[t] || 0) >= 1 && !known[t]);
    if (!slainUnknown.length) return;
    const mdefs = _G.data.monsters || [];
    const noCounter = slainUnknown.filter(t => {
      const d = mdefs.find(m => m.id === t);
      return !(d && d.counter);
    });
    const roster = (_G.state.village.roster || []).filter(id => id !== _G.villagerId);
    const vid = roster.find(id => { try { return !_G.getPerson(id).dead; } catch (e) { return false; } });
    if (!vid) return;
    const teachableBefore = (typeof _G.counterTeachable === 'function') ? _G.counterTeachable() : null;
    const r = _G.askAbout(vid, 'beasttricks');
    ctx.beasttricksTaught = (ctx.beasttricksTaught || 0) + ((r && r.taught) ? 1 : 0);
    ctx.beasttricksAsked = (ctx.beasttricksAsked || 0) + 1;
    const entry = { day, trigger: slainUnknown[0], slainUnknown: slainUnknown.slice(),
      noCounter: noCounter.slice(), teachableBefore: teachableBefore || null,
      taught: (r && r.taught) || null, none: !!(r && r.none) };
    entry.cls = classifyBeastAsk(entry);
    (ctx.beastAsks = ctx.beastAsks || []).push(entry);
  } catch (e) {}
}

// ---- fight driver (r2 deepening version): record every fight with wave ----
function finalizeFight(ctx) {
  const rec = ctx._fr;
  ctx._fr = null;
  if (!rec) return;
  try {
    const f = rec.obj;
    rec.rounds = f.round;
    rec.result = f.result;
    rec.over = !!f.over;
    rec.endMonsterHp = (f.fighters || []).filter(x => x.kind === 'monster').reduce((t, m) => t + (m.hp || 0), 0);
    rec.dmgFrac = rec.hp0Total > 0 ? Math.max(0, 1 - rec.endMonsterHp / rec.hp0Total) : 0;
    rec.endHp = (f.fighters || []).map(x => ({ key: x.key, kind: x.kind, mid: x.monsterId || null, hp: Math.round(x.hp || 0), fled: !!x.fled }));
    rec.outcomeClass = classifyFightOutcome(rec);
    const slice = capture.slice(rec.capStart).join('\n');
    rec.dmgLines = (slice.match(/\(\d+ damage\)/g) || []).length;
    rec.lines = slice.split('\n').filter(l => /damage|STRIKE|strikes|hits|miss|dodge|flee/i.test(l)).slice(0, 40);
    rec.sigHits = {};
    for (const m of rec.monsters) {
      const marks = SIG_MARKERS[m.mid] || [];
      const hits = marks.filter(mk => slice.toLowerCase().indexOf(mk.toLowerCase()) >= 0);
      if (hits.length) rec.sigHits[m.mid] = hits;
    }
    // wave tally for the r3 question
    for (const m of rec.monsters) {
      const w = m.wave || 1;
      ctx.fightsByWave = ctx.fightsByWave || {};
      ctx.fightsByWave[w] = (ctx.fightsByWave[w] || 0) + 1;
    }
    // W3DUMP: lead-up context for wave-3 fights (how did it reach the player?)
    if (process.env.W3DUMP && rec.monsters.some(m => (m.wave || 1) === 3)) {
      try {
        const pre = capture.slice(Math.max(0, rec.capStart - 80), rec.capStart).join('\n');
        fs.writeFileSync(`/tmp/journey-deep-r5-w3leadup-${_currentSeed}-day${rec.day}.txt`, pre + '\n\n===== FIGHT START =====\n' + capture.slice(rec.capStart, rec.capStart + 60).join('\n'));
      } catch (e) {}
    }
    // W3FULL: full fight text for wave-3 fights (r4 signature-mechanics honesty audit)
    // ALLFIGHTS=1: dump every fight (r4 stall investigation)
    if ((process.env.W3FULL && rec.monsters.some(m => (m.wave || 1) === 3)) || process.env.ALLFIGHTS) {
      try {
        const mids = rec.monsters.map(m => m.mid).join('-');
        let txt = capture.slice(rec.capStart).join('\n');
        if (txt.length > 500 * 1024) txt = txt.slice(0, 500 * 1024) + '\n[TRUNCATED at 500KB]';
        fs.writeFileSync(`/tmp/journey-deep-r5-fight-${_currentSeed}-day${rec.day}-${mids}.txt`, txt);
      } catch (e) {}
    }
    ctx.fightsLog.push(rec);
  } catch (e) {
    ctx.fightsLog.push({ id: rec.id, err: String(e && e.message), monsters: rec.monsters });
  }
}

// ---- r92: wild-fight outcome classification (pure derivation, proof-tested) ----
// endHp entries carry {key, kind, mid, hp, fled}. Classes:
//   kill: every monster at 0 HP (player/allies alive or not — the beast died).
//   player-died: leader 'p' at 0 HP with monsters still standing.
//   player-fled: leader fled and monsters alive.
//   monster-fled: a monster fled while the leader stands.
//   ended-alive: fight over, leader alive, monsters alive (round cap/disengage).
//   unresolved: fight not over at record time (standoff / hands-off).
function classifyFightOutcome(rec) {
  const ends = (rec && rec.endHp) || [];
  const mons = ends.filter(x => x.kind === 'monster');
  const leader = ends.find(x => x.key === 'p');
  const mAlive = mons.filter(m => (m.hp || 0) > 0);
  const mFled = mons.filter(m => !!m.fled);
  if (mons.length && mAlive.length === 0) return 'kill';
  if (leader && (leader.hp || 0) <= 0) return 'player-died';
  if (leader && leader.fled) return 'player-fled';
  if (mFled.length) return 'monster-fled';
  if (rec && rec.over) return 'ended-alive';
  return 'unresolved';
}

// ---- flee driver (extracted module-level for testability, r16) ----
// R16 CONSUMED-PUSH FIX: tbBarrierExit returns TRUE for pushes that are
// CONSUMED without exiting the fight (sealed barrier holds, world map edge,
// stasis field) — game.js is honest about each ("the barrier holds", "The
// known world ends here"). The old inline version counted every truthy
// return as a flee and re-pushed every turn — seed 8904: 4,580,593 "flees"
// in one fight, nothing ever exited. A real player reads the message and
// fights it out. Only count a flee when the push actually exits (fight over
// or map tile changed); on a consumed push, mark the fight unfleeable so the
// policy fights it out instead of hammering the barrier.
function deepeningFlee(G, ctx, f, p, endTurn) {
  try {
    const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
    const gmax = (() => { try { return G.tbGridMax ? G.tbGridMax() : 8; } catch (e) { return 8; } })();
    const dirs = [];
    if (px === 0) dirs.push([-1, 0]);
    if (px === gmax) dirs.push([1, 0]);
    if (py === 0) dirs.push([0, -1]);
    if (py === gmax) dirs.push([0, 1]);
    if (G.tbBarrierExit && ctx._fleeBlockedFor !== f.id) {
      const mapBefore = (() => { try { return G.map.px + ',' + G.map.py; } catch (e) { return '?'; } })();
      let pushed = false;
      for (const [dx, dy] of dirs) {
        try {
          if (G.tbBarrierExit(dx, dy)) { pushed = true; break; }
        } catch (e) {}
      }
      if (pushed) {
        let exited = false;
        try { exited = !!f.over || (G.map.px + ',' + G.map.py) !== mapBefore; } catch (e) {}
        if (exited) { ctx.fled = (ctx.fled || 0) + 1; endTurn(); return true; }
        // Consumed push: barrier held / world ends / stasis — fight it out.
        ctx.fleeBlocked = (ctx.fleeBlocked || 0) + 1;
        ctx._fleeBlockedFor = f.id;
        if ((ctx.fleeBlocked || 0) <= 3) {
          try {
            (ctx.notes || (ctx.notes = [])).push(
              `consumed-push: fight ${f.id} — barrier exit consumed without exit; fighting it out`);
          } catch (e2) {}
        }
        endTurn();
        return true;
      }
    }
    // Not on a pushable edge (or all pushes blocked): take ONE step
    // toward the nearest corner along the current edge — the push
    // comes when a pushable edge is reached. (Single step: moveLeft
    // is ~3, a full-edge jump fails path-cost.)
    // R5 SMARTER FLEE (harness-only tooling fix, journey deepening r5):
    // the r4 harness retried one blocked tile 20k times (player at
    // (4,1), flee target (4,0), findPath null — "No path there"; the
    // hummice couldn't path either). A real player tries another
    // direction instead of hammering the blocked tile. Remember the
    // last target: if it failed to move the player, rotate through
    // the other 7 adjacent tiles (path-checked); if none path, pass
    // the turn (endTurn below) instead of retrying — the stall was
    // the RETRY, not the pass.
    try {
      let sx = px, sy = py;
      if (py === 0 || py === gmax) sx = px <= 4 ? Math.max(0, px - 1) : Math.min(gmax, px + 1);
      else sy = py <= 4 ? Math.max(0, py - 1) : Math.min(gmax, py + 1);
      if (sx === px && sy === py) sx = px <= 4 ? 0 : gmax;
      const lastT = ctx._fleeT, lastPx = ctx._fleePx, lastPy = ctx._fleePy;
      const stuck = lastT === (sx + ',' + sy) && lastPx === px && lastPy === py;
      const tryStep = (tx, ty) => {
        try {
          if (tx < 0 || tx > gmax || ty < 0 || ty > gmax) return false;
          let path = null;
          try { path = G.findPath ? G.findPath(px, py, tx, ty) : [1]; } catch (e2) { path = null; }
          if (!path) return false;
          const before = p.mx + ',' + p.my;
          G.tbPlayerMove(tx, ty);
          return (p.mx + ',' + p.my) !== before;
        } catch (e2) { return false; }
      };
      let moved = false;
      if (!stuck) moved = tryStep(sx, sy);
      if (!moved) {
        for (let dx = -1; dx <= 1 && !moved; dx++) for (let dy = -1; dy <= 1 && !moved; dy++) {
          if (!dx && !dy) continue;
          if (dx === sx - px && dy === sy - py) continue; // primary already tried
          moved = tryStep(px + dx, py + dy);
        }
        if (!moved) ctx.fleeBoxed = (ctx.fleeBoxed || 0) + 1;
      }
      ctx._fleeT = sx + ',' + sy; ctx._fleePx = p.mx; ctx._fleePy = p.my;
    } catch (e) {}
  } catch (e) {}
  endTurn();
  return true;
}

// ---- policy: competent base + deepening leg extensions + r3 instrumentation ----
function makePolicy() {
  const policy = Object.create(BASE);
  policy.id = 'journey-deepening-r113-' + POLICY;
  policy.setup = function (G, ctx) {
    BASE.setup(G, ctx);
    policy._ctx = ctx; // runDays doesn't return ctx; stash it here
    ctx.fightsLog = [];
    ctx.regionalLog = [];
    ctx.waveLog = [];
    ctx.deedLog = [];
    ctx._fr = null;
    ctx.lastWave = null;
    ctx.lastDeeds = {};
    ctx.convoFiles = [];
    // R95 inviter-seeking + revisit instruments (harness-only state)
    ctx.revisitVid = null;      // most recent inviter vid, or null
    ctx.inviterHistory = [];    // {day, vid, mode} per betrayal sitting
    ctx.sittingLog = [];        // {day, vid, betrayal, revisit, file} per sitting
    ctx.revisitAttempts = [];   // {day, vid, status:'blocked'} when target un-talkable
    ctx.goalSnaps = [];         // r103: per convo-day villager-goal snapshots
    ctx.probed = false;
    ctx.fightsByWave = {};
    ctx.contestCalls = 0;
    ctx.contestStuck = 0;
    // R87 SHIP-ITEM instruments (harness-only wraps/reads; zero gameplay effect)
    ctx.shipFights = [];     // {day, mid, wave, fleeKind, outcome, committedLines} per fieldFight call
    ctx.shipLoot = [];       // {day, mid, wave, baseTier, rewardSource, apex, grantedId, grantedTier} per rollAlienLoot call
    ctx.shipAmmo = [];       // {day, made} per villagerAmmoCraftDay call with made > 0
    ctx.shipAmmoCalls = 0;   // villagerAmmoCraftDay calls (opportunity denominator)
    ctx.shipLessons = [];    // {day, teacher, learner, skill, ok} per teachSkill call
    ctx.shipApplicants = []; // {day, id, dead} per genApplicant call
    ctx.shipArrivals = [];   // {day, newIds, deadNew} per arrivalTick call
    ctx.shipDeadChecks = []; // {day, rosterN, deadN, deadInNpcIds} at deed checkpoints + seed end
    ctx.shipAmmoOpp = [];    // {day, opps:[{vid, weapon, ammo, carried}]} days with a home archer short of ammo
    ctx.shipAmmoOppScans = 0;
    ctx.shipWrapErrors = []; // wrap failures (never silent)
    // R89 MEAT-CHAIN instruments (harness-only wraps/reads; zero gameplay effect)
    ctx.meatKills = [];    // {day, mid, kcal} per monsterMeatEntry call (carcass exists)
    ctx.meatReveals = [];  // {day, mid, how} per markMonsterFoodSafe call
    ctx.meatTests = [];    // {day, mid, before, after} per villagerExperimentBeat codex diff
    ctx.meatDinners = [];  // {day, plantId, foodState, cooked} per trackMealExposure meat draw
    ctx.meatCensuses = []; // meatCensus() at deed checkpoints + seed end
    ctx.meatWrapErrors = [];
    try {
      const _mme = G.monsterMeatEntry;
      if (typeof _mme === 'function') G.monsterMeatEntry = function (mdef) {
        const r = _mme.apply(this, arguments);
        try { if (r) ctx.meatKills.push({ day: gday(), mid: (mdef && mdef.id) || '?', kcal: r.hiddenKcal || 0 }); } catch (e2) {}
        return r;
      };
    } catch (e) { ctx.meatWrapErrors.push('meatEntry:' + String(e && e.message)); }
    try {
      const _mmfs = G.markMonsterFoodSafe;
      if (typeof _mmfs === 'function') G.markMonsterFoodSafe = function (mid, how) {
        const r = _mmfs.apply(this, arguments);
        try { ctx.meatReveals.push({ day: gday(), mid: String(mid), how: how || '?' }); } catch (e2) {}
        return r;
      };
    } catch (e) { ctx.meatWrapErrors.push('meatReveal:' + String(e && e.message)); }
    try {
      const _veb = G.villagerExperimentBeat;
      if (typeof _veb === 'function') G.villagerExperimentBeat = function (present) {
        const snap = () => { const o = {}; try { for (const [k, v] of Object.entries((G.state.codex || {}).monsters || {})) o[k] = { fs: !!v.foodSafe, ft: v.foodTested || null, by: v.foodTestedBy || null }; } catch (e2) {} return o; };
        const before = snap();
        const r = _veb.apply(this, arguments);
        try {
          const after = snap();
          for (const k of Object.keys(after)) {
            const b = before[k] || {}, a = after[k];
            if (b.fs !== a.fs || b.ft !== a.ft) ctx.meatTests.push({ day: gday(), mid: k, before: b, after: a });
          }
        } catch (e2) { ctx.meatWrapErrors.push('meatTest:' + String(e2 && e2.message)); }
        return r;
      };
    } catch (e) { ctx.meatWrapErrors.push('meatBeat:' + String(e && e.message)); }
    try {
      const _tme = G.trackMealExposure;
      if (typeof _tme === 'function') G.trackMealExposure = function (exposure, item, cooked) {
        const r = _tme.apply(this, arguments);
        try {
          if (item && String(item.plantId || '').indexOf('meat_') === 0) {
            const mid = String(item.plantId).slice(5);
            if (G.monsterMeatGated && G.monsterMeatGated(mid))
              ctx.meatDinners.push({ day: gday(), plantId: item.plantId, foodState: item.foodState || '?', cooked: !!cooked });
          }
        } catch (e2) {}
        return r;
      };
    } catch (e) { ctx.meatWrapErrors.push('meatDinner:' + String(e && e.message)); }

    ctx._wasExiled = false;
    ctx.exileLog = [];
    // R7 KNOWLEDGE TELEMETRY (harness-only wraps; zero gameplay effect)
    ctx.counterEvents = [];      // {day, mid, via} — every discoverMonsterCounter
    ctx.combineFires = [];       // {day, pid} — every combineKnowledge call
    ctx.teachableDays = [];      // days when counterTeachable() was non-null
    ctx.traderDeepSnaps = [];    // traderDeep snapshot diffs at deed checkpoints
    try {
      const _dmc = G.discoverMonsterCounter;
      G.discoverMonsterCounter = function (mid, via) {
        const r = _dmc.apply(this, arguments);
        try { ctx.counterEvents.push({ day: gday(), mid, via: via || '?' }); } catch (e) {}
        return r;
      };
    } catch (e) {}
    try {
      const _ck = G.combineKnowledge;
      G.combineKnowledge = function (pid) {
        try { ctx.combineFires.push({ day: gday(), pid: String(pid) }); } catch (e2) {}
        return _ck.apply(this, arguments);
      };
    } catch (e) {}
    // R40 ARMOR instruments (harness-only wraps; zero gameplay effect)
    ctx.armorAbsorbs = [];   // {day, line, absorbed} — field-fight gear absorbs
    ctx.tierLog = [];        // {day, tier} — haven tier-ups
    ctx.raidLog = [];        // {day, palisade} — haven raids fired
    ctx.pillageLog = [];     // {day, take, got} — raid pillage outcomes
    ctx.shawlAvoids = [];    // {day, vid, scene} — worn-avoidance (Phase Shawl) triggers
    ctx.armorSnaps = [];     // armorCensus() at deed checkpoints + seed end
    ctx.readinessSnaps = []; // waveCombatReadiness(4) snapshots
    try {
      const _ff = G.fieldFight;
      if (typeof _ff === 'function') {
        G.fieldFight = function () {
          const rec = _ff.apply(this, arguments);
          try {
            for (const ln of ((rec && rec.log) || [])) {
              const m = String(ln).match(/'s gear absorbs (\d+)/);
              if (m) ctx.armorAbsorbs.push({ day: gday(), absorbed: parseInt(m[1], 10), line: String(ln).slice(0, 120) });
            }
          } catch (e2) { ctx.shipWrapErrors.push('armorAbsorb:' + String(e2 && e2.message)); }
          // R87 SH1: commitment outcome per fieldFight call (mdef = arguments[1]).
          // The engine labels many designed WINS as mFlee (trick dismissals,
          // stare-down, peacemaker, judges' calls) — only contact/drive-off/
          // round-cap flight on a non-flee kind violates the commitment rule.
          // Classify every mFlee from the record + its log lines.
          try {
            const mdef = arguments[1] || {};
            const logLines = (rec && rec.log) || [];
            const committed = logLines.filter(l => String(l).indexOf('(Committed)') >= 0).length;
            const lure = logLines.filter(l => String(l).indexOf('CANNOT resist') >= 0).length;
            let fleeClass = null;
            if ((rec && rec.outcome) === 'mFlee') {
              const txt = logLines.join('\n');
              if (rec.staredDown) fleeClass = 'stare';
              else if (rec.peaceful) fleeClass = 'peace';
              else if (rec.judges) fleeClass = 'judges';
              else if (lure > 0) fleeClass = 'lure';
              else if (txt.indexOf('breaks away all the same') >= 0 || txt.indexOf('broke before it ever closed') >= 0) fleeClass = 'contact';
              else if (txt.indexOf('turns and runs') >= 0) fleeClass = 'driveoff';
              else if (txt.indexOf('the worse-off side disengages') >= 0) fleeClass = 'roundcap';
              else if (txt.indexOf('Starved out') >= 0 || txt.indexOf('Bored out') >= 0 || txt.indexOf('drifts off') >= 0 || txt.indexOf('DISMISSED') >= 0 || txt.indexOf('folds itself away') >= 0 || txt.indexOf('VOMITS out of the fight') >= 0 || txt.indexOf('closes the book kindly') >= 0) fleeClass = 'trick';
              else fleeClass = 'other';
            }
            const lastLine = logLines.length ? String(logLines[logLines.length - 1]).slice(0, 160) : null;
            ctx.shipFights.push({ day: gday(), mid: mdef.id || '?', wave: mdef.wave || 1, fleeKind: !!mdef.flee, outcome: (rec && rec.outcome) || null, committedLines: committed, lureLines: lure, fleeClass: fleeClass, lastLine: lastLine });
          } catch (e2) { ctx.shipWrapErrors.push('shipFight:' + String(e2 && e2.message)); }
          return rec;
        };
      }
    } catch (e) {}
    try {
      const _htu = G.havenTierUp;
      if (typeof _htu === 'function') {
        G.havenTierUp = function () {
          const r = _htu.apply(this, arguments);
          try { ctx.tierLog.push({ day: gday(), tier: G.havenTier ? G.havenTier() : null }); } catch (e2) {}
          return r;
        };
      }
    } catch (e) {}
    try {
      const _hrt = G.havenRaidTick;
      if (typeof _hrt === 'function') {
        G.havenRaidTick = function () {
          let pal = null;
          try { pal = G.havenTier ? G.havenTier() >= 2 : null; } catch (e2) {}
          const r = _hrt.apply(this, arguments);
          try { if (r) ctx.raidLog.push({ day: gday(), palisade: pal }); } catch (e2) {}
          return r;
        };
      }
    } catch (e) {}
    try {
      const _rp = G.raidPillage;
      if (typeof _rp === 'function') {
        G.raidPillage = function (v, take) {
          const got = _rp.apply(this, arguments);
          try { ctx.pillageLog.push({ day: gday(), take: take, got: Math.round(got) }); } catch (e2) {}
          return got;
        };
      }
    } catch (e) {}
    try {
      const _wd = G.wornDamage;
      if (typeof _wd === 'function') {
        G.wornDamage = function (vid, damage, opts) {
          const r = _wd.apply(this, arguments);
          try { if (damage > 0 && r === 0) ctx.shawlAvoids.push({ day: gday(), vid: String(vid), scene: (opts && opts.scene) || '?' }); } catch (e2) {}
          return r;
        };
      }
    } catch (e) {}
    // R87 SHIP-ITEM wraps (harness-only; zero gameplay effect; failures recorded)
    try {
      const _ral = G.rollAlienLoot;
      if (typeof _ral === 'function') {
        G.rollAlienLoot = function (mdef, fighter) {
          const granted = _ral.apply(this, arguments);
          try {
            let gt = null;
            try { const d = (this.data.items || []).find(i => i.id === granted); gt = d ? (d.lootTier || d.tier || null) : null; } catch (e3) { gt = null; }
            ctx.shipLoot.push({ day: gday(), mid: (mdef && mdef.id) || '?', wave: (mdef && mdef.wave) || 1, baseTier: (mdef && mdef.loot && mdef.loot.tier) || null, rewardSource: !!((mdef && mdef.loot) || {}).rewardSource, apex: !!((mdef || {}).apex), veteran: !!((fighter || {}).veteranVariant || (fighter || {}).veteran), tier4Chance: (mdef && mdef.loot && mdef.loot.tier4Chance) || 0, grantedId: granted || null, grantedTier: gt });
          } catch (e2) { ctx.shipWrapErrors.push('rollAlienLoot:' + String(e2 && e2.message)); }
          return granted;
        };
      }
    } catch (e) { ctx.shipWrapErrors.push('rollAlienLoot-wrap:' + String(e && e.message)); }
    try {
      const _vac = G.villagerAmmoCraftDay;
      if (typeof _vac === 'function') {
        G.villagerAmmoCraftDay = function () {
          const made = _vac.apply(this, arguments);
          try { ctx.shipAmmoCalls++; if (made > 0) ctx.shipAmmo.push({ day: gday(), made: made }); } catch (e2) { ctx.shipWrapErrors.push('ammoCraft:' + String(e2 && e2.message)); }
          return made;
        };
      }
    } catch (e) { ctx.shipWrapErrors.push('ammoCraft-wrap:' + String(e && e.message)); }
    try {
      const _ts = G.teachSkill;
      if (typeof _ts === 'function') {
        G.teachSkill = function (teacher, learner, skillId, opts) {
          const ok = _ts.apply(this, arguments);
          try { ctx.shipLessons.push({ day: gday(), teacher: String(teacher), learner: String(learner), skill: String(skillId), ok: !!ok }); } catch (e2) { ctx.shipWrapErrors.push('teachSkill:' + String(e2 && e2.message)); }
          return ok;
        };
      }
    } catch (e) { ctx.shipWrapErrors.push('teachSkill-wrap:' + String(e && e.message)); }
    try {
      const _ga = G.genApplicant;
      if (typeof _ga === 'function') {
        G.genApplicant = function () {
          const app = _ga.apply(this, arguments);
          try {
            const id = (app && (app.id || app.villagerId)) || '?';
            let dead = false;
            try { dead = (typeof _G.deadMarked === 'function') ? !!_G.deadMarked(id) : !!person(id).dead; } catch (e2) { dead = false; }
            ctx.shipApplicants.push({ day: gday(), id: String(id), dead: dead });
          } catch (e2) { ctx.shipWrapErrors.push('genApplicant:' + String(e2 && e2.message)); }
          return app;
        };
      }
    } catch (e) { ctx.shipWrapErrors.push('genApplicant-wrap:' + String(e && e.message)); }
    try {
      const _at = G.arrivalTick;
      if (typeof _at === 'function') {
        G.arrivalTick = function () {
          let before = [];
          try { before = ((_G.state.village || {}).roster || []).slice(); } catch (e2) { before = []; }
          const r = _at.apply(this, arguments);
          try {
            const after = ((_G.state.village || {}).roster || []).slice();
            const newIds = after.filter(id => before.indexOf(id) < 0);
            const deadNew = newIds.filter(id => { try { return !!person(id).dead; } catch (e3) { return false; } });
            if (newIds.length) ctx.shipArrivals.push({ day: gday(), newIds: newIds.map(String), deadNew: deadNew.map(String) });
          } catch (e2) { ctx.shipWrapErrors.push('arrivalTick:' + String(e2 && e2.message)); }
          return r;
        };
      }
    } catch (e) { ctx.shipWrapErrors.push('arrivalTick-wrap:' + String(e && e.message)); }
    // R110 BOND-TELEMETRY (r110 primary): the bond-initiation build's own
    // instrument — call-through wraps, RNG-neutral; the module itself is
    // merged game code, the instrument only observes it. Installed here
    // (after setupGame, same relative order as the bond driver's oneRun).
    try { ctx.bondInst = BONDINST.install(G); } catch (e) { ctx.shipWrapErrors.push('bondInst:' + String(e && e.message)); }
  };
  policy.upkeep = function (G, ctx) {
    goInside();
    BASE.upkeep(G, ctx);
  };
  // R113 Q1 REQUEST-TELEMETRY (r113 prereg): the staged maps read live
  // each day — which villager holds a live bond/link talk request, since
  // when, of which kind, and whether the opener was delivered. Read-only
  // state reads; zero gameplay effect. Joined at analysis time with the
  // bond instrument's convoEvents (talkTo targets per day) and
  // bondTeleEvents (staged/decided), so every staged scholar-targeted
  // request gets: staged day, holder, kind, talkable, talked-while-live,
  // decided or expired.
  function talkReqSnap(ctx) {
    try {
      const v = (_G.state && _G.state.village) || {};
      const br = v.bondRequests || {};
      const lr = v.linkRaises || {};
      const tr = v.talkRequests || {};
      const bond = Object.keys(br).map(vid => ({ vid: String(vid), day: (br[vid] && br[vid].day) ?? null, kind: (br[vid] && br[vid].kind) || 'bond' }));
      const link = Object.keys(lr).map(vid => ({ vid: String(vid), day: (lr[vid] && lr[vid].day) ?? null, village: (lr[vid] && lr[vid].villageId) || (lr[vid] && lr[vid].village) || null }));
      const talk = Object.keys(tr).map(vid => ({ vid: String(vid), day: (tr[vid] && tr[vid].day) ?? null,
        bondProposal: !!((tr[vid] || {}).bondProposal), linkRaise: !!((tr[vid] || {}).linkRaise),
        delivered: !!((tr[vid] || {}).delivered) }));
      (ctx.talkReqSnaps = ctx.talkReqSnaps || []).push({ day: gday(), bond, link, talk });
    } catch (e) { ctx.shipWrapErrors.push('talkReqSnap:' + String(e && e.message)); }
  }
  policy.daily = function (G, ctx) {
    goInside();
    BASE.daily(G, ctx);
    // R110 BOND-TELEMETRY: one snapshot per game day (day-guarded;
    // runDays may call daily more than once per day).
    try { if (ctx.bondInst && ctx._bondSnapDay !== gday()) { ctx._bondSnapDay = gday(); ctx.bondInst.snapshot(); talkReqSnap(ctx); } } catch (e) { ctx.shipWrapErrors.push('bondSnap:' + String(e && e.message)); }
    gearUp(ctx);
    shipAmmoOppScan(ctx);
    regionalPlay(ctx);
    knowledgePlay(ctx);
    // wave-unlock transitions
    const w = waveNow();
    if (w !== ctx.lastWave) {
      ctx.waveLog.push({
        day: gday(), wave: w,
        w2points: waveLedgerPoints(2),
        standing: (() => { try { return JSON.parse(JSON.stringify(_G.villageStanding())); } catch (e) { return null; } })(),
        villageSlain: JSON.parse(JSON.stringify(_G.state.villageSlain || {})),
        engaged: { w1: waveEngaged(1), w2: waveEngaged(2), w3: waveEngaged(3), w4: waveEngaged(4), w5: waveEngaged(5) },
      });
      try { if (w >= 4) { const rs = readinessSnap(w); if (rs) ctx.readinessSnaps.push(rs); } } catch (e) {}
      ctx.lastWave = w;
    }
    // PROBE_W3: at day 45, if wave 3 not yet unlocked, simulate the 4
    // wave-2 kills through the honest ledger path, then watch the pipeline.
    if (PROBE_W3 && !ctx.probed && gday() >= 45 && w < 3) {
      ctx.probed = true;
      const ids = ['bright_idea', 'giant_mosquito', 'warranty_caller', 'understudy'];
      for (const id of ids) { try { _G.scoreLedgerKill(id); } catch (e) {} }
      ctx.waveLog.push({ day: gday(), probe: 'w3-injected', w2points: waveLedgerPoints(2), wave: waveNow() });
    }
    // deed checkpoints (the endgame currency)
    const gd = gday();
    // R94: standing trace (r93 lineage) + last-living census (r92 metric review).
    // Harness-only READS (zero gameplay effect). villageStanding() is
    // pure (no release beat, no peak ratchet) unlike
    // villageStandingTotal(); see prereg for why raw explains a zero.
    try {
      const st = _G.villageStanding ? _G.villageStanding() : null;
      const pa = popAlive();
      (ctx.standingTrace = ctx.standingTrace || []).push({
        day: gd, standing: st ? st.total : null,
        war: st ? st.war : null, diplomacy: st ? st.diplomacy : null,
        plenty: st ? st.plenty : null, warPts: st ? st.warPts : null,
        links: st ? st.links : null, feasts: st ? st.feasts : null,
        scale: scaleNow(), pop: pa,
        networkLive: !!((_G.state && _G.state.networkLive)),
      });
      if (pa > 0) {
        const cen = buildCensus().filter(c => c.alive);
        ctx.lastLivingCensus = { day: gd, pop: pa,
          plants: cen.map(c => c.plantsKnown).sort((a, b) => a - b),
          names: cen.map(c => c.name) };
      }
    } catch (e) { ctx.shipWrapErrors.push('r113trace:' + String(e && e.message)); }

    // R9: exile-transition watch (fair-share fix measurement)
    try {
      const exNow = !!((_G.state.scholar || {}).exiled);
      if (ctx._wasExiled !== exNow) {
        (ctx.exileLog = ctx.exileLog || []).push({ day: gd, exiled: exNow, vilId: _G.villagerId });
        ctx._wasExiled = exNow;
      }
    } catch (e) {}
    if (gd === 50 || gd === 70 || gd === 85 || gd === 100) {
      const eng = { w1: waveEngaged(1), w2: waveEngaged(2), w3: waveEngaged(3), w4: waveEngaged(4), w5: waveEngaged(5) };
      let linkSnap = [];
      try {
        const links = _G.hierarchyState() || [];
        linkSnap = links.map(l => {
          const other = (l.primary === 'haven' ? l.subordinate : l.primary) || (l.a === 'haven' ? l.b : l.a) || '?';
          const age = gd - (l.day || 0);
          return { id: String(l.id).slice(-6), kind: l.kind || 'hier', other, status: l.status,
                   trust: Math.round(l.trust || 0), age, arrears: l.arrears || 0,
                   seasoned: age >= 30 && (l.trust || 0) >= 40 };
        });
      } catch (e) {}
      let takeRate7 = null;
      try { takeRate7 = _G.takeRate7 ? +(_G.takeRate7(_G.villagerId) || 0).toFixed(0) : null; } catch (e) {}
      let codexMonsters = null;
      try { codexMonsters = Object.keys((_G.state.codex || {}).monsters || {}).length; } catch (e) {}
      // R16 KNOWLEDGE-DEPTH + SCALE-PRESSURE checkpoint fields (harness-only
      // reads; zero gameplay effect).
      let standingTotal = null, codexL2 = null, sharedKnowN = null, traderDeepN = null;
      try { standingTotal = _G.villageStandingTotal ? _G.villageStandingTotal() : null; } catch (e) {}
      try {
        const pl = ((_G.state.codex || {}).plants) || {};
        codexL2 = Object.keys(pl).filter(pid => ((_G.plantLevel ? _G.plantLevel(pid) : (pl[pid] && pl[pid].level)) || 0) >= 2).length;
      } catch (e) {}
      try { sharedKnowN = Object.keys((_G.state.village || {}).sharedKnowledge || {}).length; } catch (e) {}
      try {
        const td = ((_G.state.village || {}).traderDeep) || {};
        traderDeepN = Object.keys(td).reduce((t, vid) => t + Object.keys(td[vid] || {}).length, 0);
      } catch (e) {}
      try { ctx.shipDeadChecks.push(deadCheck(gd)); } catch (e) { ctx.shipWrapErrors.push('deadCheck:' + String(e && e.message)); }
      ctx.deedLog.push({ day: gd, engaged: eng, wave: w, pop: popAlive(), pantry: pantryKcal(), w3fights: (ctx.fightsByWave || {})[3] || 0,
        standingTotal, codexL2, sharedKnowN, traderDeepN,
        scale: scaleNow(), exiled: !!((_G.state.scholar || {}).exiled), links: linkSnap, takeRate7, codexMonsters });
      try {
        const td = JSON.parse(JSON.stringify((_G.state.village || {}).traderDeep || {}));
        ctx.traderDeepSnaps.push({ day: gd, deep: td });
      } catch (e) {}
      // R40: armor census + readiness snapshot at each deed checkpoint.
      try { ctx.armorSnaps.push(armorCensus()); } catch (e) {}
      try { ctx.meatCensuses.push(meatCensus()); } catch (e) { ctx.meatWrapErrors.push('meatCensus:' + String(e && e.message)); }
      try { const rs = readinessSnap(4); if (rs) ctx.readinessSnaps.push(rs); } catch (e) {}
      // R12 M7 mood-honesty: snapshot mood + 10-day event history at day 100.
      if (gd === 100) {
        try { ctx.moodAudit100 = moodAudit(); ctx.moodAudit100._auditDay = 100; } catch (e) { ctx.moodAudit100 = { err: String(e && e.message) }; }
      }
    }
    // R11: teachableDays sampler DROPPED (r10 metric review — empty 8/8;
    // discovery via taught/observed fires faster than the sampling cadence.
    // Intent covered by counterEvents + beasttricksAsked/Taught.)
    // R100 conversations on leg days (r95 seeker + revisit, unchanged) (people check + inviter seeking):
    // up to 3 full sittings per day, revisit target first, stop after
    // the first betrayal sitting. Every opened sitting is played in
    // full — no probe-and-leave, because a leave is itself a move.
    // An invitation cannot be detected before opening: the r94 Nikolai
    // transcript shows want=ask_favor while the first menu already
    // offers betrayal:accept, so seeking must open sittings.
    if (CONVO_DAYS.includes(gd)) {
      try { (ctx.goalSnaps = ctx.goalSnaps || []).push(goalSnap(gd)); } catch (e) { ctx.shipWrapErrors.push('goalSnap:' + String(e && e.message)); }
      try {
        const roster = (_G.state.village.roster || []).filter(id => id !== _G.villagerId);
        const info = [];
        for (const id of roster) {
          const p = person(id);
          if (p.dead) continue;
          try { const comm = _G.npcComm ? _G.npcComm(id) : { level: 'full' }; if (comm.level === 'none') continue; } catch (e) {}
          let cnt = -1;
          try { const c0 = _G.convoGet(id); cnt = (c0 && c0.count) || 0; } catch (e) {}
          info.push({ id, count: cnt });
        }
        const revisitVid = ctx.revisitVid || null;
        // R100 blocked-revisit fix (r95 metric review): only feed the
        // revisit target to the order when it is talkable; an untalkable
        // target is NOT prepended, and `blocked` is logged only when
        // no sitting with that villager follows that day (checked below).
        const revisitTalkable = !!(revisitVid && info.some(x => x.id === revisitVid));
        const ordered = orderSittingCandidates(revisitTalkable ? revisitVid : null, info);
        for (const vid of ordered) {
          const wasRevisit = (vid === revisitVid);
          let fp = null;
          try { fp = runConversation(gd, vid); } catch (e) { fp = null; }
          if (!fp) continue;
          ctx.convoFiles.push(fp);
          const mode = _betrayalModeThisSitting || 'none';
          ctx.sittingLog.push({ day: gd, vid, betrayal: mode, revisit: wasRevisit, file: fp });
          if (mode === 'accept' || mode === 'decline') {
            ctx.inviterHistory.push({ day: gd, vid, mode });
            ctx.revisitVid = vid;
            break; // stop seeking after the first betrayal sitting today
          }
        }
        // R100: blocked means no sitting followed, not "not in the
        // talkable list" — the r95 flag fired even when the sitting ran.
        if (revisitVid && !ctx.sittingLog.some(x => x.day === gd && x.vid === revisitVid)) {
          ctx.revisitAttempts.push({ day: gd, vid: revisitVid, status: 'blocked' });
        }
      } catch (e) {}
    }
  };
  // deepening fight: take wave 2-3 fights at decent health, walk away from
  // bad ones; record every fight with wave + sig markers (r3).
  policy.fight = function (G, ctx) {
    try {
      const f = G.tbfight;
      if (ctx._fr && (!f || f.id !== ctx._fr.id)) finalizeFight(ctx);
      if (!f || f.over || !G.tbIsPlayerTurn()) return false;
      if (!ctx._fr || ctx._fr.id !== f.id) {
        const mons = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
        let tileType = '?';
        try { const t = G.playerTile ? G.playerTile() : null; tileType = t ? t.type : '?'; } catch (e) {}
        let weaponSnap = null, armorSnap = null;
        try { const w = (G.equippedWeapon && G.equippedWeapon()) || null; weaponSnap = w ? { name: w.name || null, range: w.range || null } : null; } catch (e) {}
        try { armorSnap = (G.armorBonus && typeof G.armorBonus === 'function') ? (G.armorBonus() | 0) : null; } catch (e) {}
        ctx._fr = {
          id: f.id, obj: f, day: gday(), capStart: capture.length, tileType,
          startRound: f.round || 0,
          hp0Total: mons.reduce((t, m) => t + (m.maxHp || m.hp || 0), 0),
          monsters: mons.map(m => ({ key: m.key, mid: m.monsterId, wave: waveOf(m.monsterId), name: monsterDisplay(m.monsterId), hp0: m.maxHp || m.hp, veteran: !!(m.veteranVariant || m.veteran) })),
          party: (f.fighters || []).map(x => ({ key: x.key, kind: x.kind, mid: x.monsterId || null, hp: Math.round(x.hp || 0), maxHp: Math.round(x.maxHp || x.hp || 0) })),
          weapon: weaponSnap, armor: armorSnap,
        };
        ctx.fightsStarted = (ctx.fightsStarted || 0) + 1;
      }
      const p = G.tbFighter('p');
      const hpPct = (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1);
      // STALLDUMP: if a fight exceeds 300 rounds, dump the full fighter state once
      if (process.env.STALLDUMP && f.round > 300 && !ctx._stallDumped) {
        ctx._stallDumped = true;
        try {
          const fs = require('fs');
          const dump = {
            day: gday(), round: f.round, result: f.result, over: !!f.over,
            playerTurn: G.tbIsPlayerTurn(),
            player: { hp: p.hp, maxHp: p.maxHp, mx: p.mx, my: p.my, moveLeft: p.moveLeft, acted: p.acted, stunned: p.stunned, status: p.status },
            monsters: f.fighters.filter(x => x.kind === 'monster').map(m => ({
              mid: m.monsterId, hp: m.hp, maxHp: m.maxHp, mx: m.mx, my: m.my,
              stunned: m.stunned, acted: m.acted, moveLeft: m.moveLeft,
              extraKeys: Object.keys(m).filter(k => /sp|reel|tape|replay|record/i.test(k)),
              spRecLen: (m.spRec || []).length, spReplayLen: (m.spReplay || []).length,
            })),
          };
          try {
            const w = G.equippedWeapon ? G.equippedWeapon() : null;
            dump.weapon = w && { name: w.name, range: w.range };
          } catch (e) {}
          fs.writeFileSync(`/tmp/journey-deep-r5-stall-${_currentSeed}.json`, JSON.stringify(dump, null, 1));
        } catch (e) {}
      }
      const endTurn = () => {
        try { const q = G.tbFighter('p'); q.moveLeft = 0; q.acted = true; G.tbAfterPlayerAction(); } catch (e) {}
      };
      // R16: flee extracted to module-level deepeningFlee() (testable).
      const flee = () => deepeningFlee(G, ctx, f, p, endTurn);
      if (ctx._fightObjD !== f) {
        ctx._fightObjD = f;
        try {
          const monsters = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
          let totalMhp = 0, maxWave = 1;
          for (const m of monsters) {
            totalMhp += m.maxHp || m.hp || 0;
            maxWave = Math.max(maxWave, waveOf(m.monsterId));
          }
          const pmax = p.maxHp || 100;
          const outmatched = (totalMhp > 4 * pmax ||
            (maxWave >= 3 && hpPct < 0.6) ||
            (maxWave >= 2 && hpPct < 0.5) ||
            hpPct < 0.5);
          if (outmatched && monsters.length) {
            ctx.fledDeepening = (ctx.fledDeepening || 0) + 1;
            return flee();
          }
        } catch (e) {}
      }
      if (hpPct < 0.35) return flee();
      const alive = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
      if (!alive.length) return false;
      // STALEMATE FLEE (r3): a competent player disengages from an unwinnable
      // chase. 40+ rounds with monster HP still >=90% of fight start = not
      // winnable (bare-handed vs kiter). Flee via the barrier like a player.
      // STANDOFF (r5): in a sealed/boxed fight flee is impossible and nobody
      // can reach anybody — the r4 20k-round hummice freeze. At 120+ rounds
      // with zero damage dealt AND flee boxed/sealed, stop handling turns
      // for this fight (return false): the shared driver's no-progress
      // breaker then exits each day's drive quickly instead of spinning.
      // The fight stays open (honest — the game never resolved it) and the
      // sim moves on. Loudly noted in telemetry.
      if (ctx._standoff === f.id) return false; // declared standoff: hands off
      if (ctx._fr && (f.round || 0) - (ctx._fr.startRound || 0) > 40) {
        const curHp = alive.reduce((t, m) => t + (m.hp || 0), 0);
        if (curHp >= (ctx._fr.hp0Total || 1) * 0.9) {
          const sealed = !!(f.noFlee || (G.state || {}).arenaContest);
          const roundsIn = (f.round || 0) - (ctx._fr.startRound || 0);
          if (roundsIn > 120 && (sealed || (ctx.fleeBoxed || 0) > 20)) {
            ctx._standoff = f.id;
            ctx.standoffs = (ctx.standoffs || 0) + 1;
            try { (ctx.notes || (ctx.notes = [])).push(`standoff: fight ${f.id} day ${gday()} round ${f.round} sealed=${sealed} fleeBoxed=${ctx.fleeBoxed || 0} — hands off, no-progress breaker will exit`); } catch (e2) {}
            return false;
          }
          ctx.stalemateFled = (ctx.stalemateFled || 0) + 1;
          // STALEMATE-TRACE (r4): log the trap signature
          if (process.env.STALLTRACE && ctx.stalemateFled % 500 === 1) {
            try {
              const fs = require('fs');
              let probe = '';
              // on the 1st trace, probe why the player isn't moving
              if (ctx.stalemateFled === 1 || ctx.stalemateFled === 501) {
                const said0 = [];
                const _s = _G.say;
                _G.say = function (...a) { said0.push(String(a[0])); return _s.apply(this, a); };
                let mvRet = null;
                try {
                  const px0 = p.mx, py0 = p.my;
                  let sx = px0, sy = py0;
                  if (py0 === 0 || py0 === 8) sx = px0 <= 4 ? Math.max(0, px0 - 1) : Math.min(8, px0 + 1);
                  else sy = py0 <= 4 ? Math.max(0, py0 - 1) : Math.min(8, py0 + 1);
                  mvRet = _G.tbPlayerMove(sx, sy);
                  probe = ` probeMove(${sx},${sy})=${mvRet} said=[${said0.slice(-3).join('|')}] pNow=${p.mx},${p.my} moveLeft=${p.moveLeft}`;
                  // undo the probe move so the trace doesn't perturb the run
                  p.mx = px0; p.my = py0;
                } catch (e) { probe = ' probe threw: ' + e.message; }
                _G.say = _s;
                probe += ' pstatus=' + JSON.stringify({ stunned: p.stunned, status: p.status, blindTurns: p.blindTurns, acted: p.acted, moveLeft: p.moveLeft });
                try { probe += ' path=' + JSON.stringify(_G.findPath(p.mx, p.my, p.mx, 0)); } catch (e) { probe += ' pathErr=' + e.message; }
              }
              fs.appendFileSync(`/tmp/journey-deep-r5-stalltrace-${_currentSeed}.txt`,
                `stalemate#${ctx.stalemateFled} day=${gday()} fight=${f.id} round=${f.round} startRound=${ctx._fr.startRound} ` +
                `mons=${alive.map(m => m.monsterId + ':' + Math.round(m.hp) + '@' + m.mx + ',' + m.my).join('|')} ` +
                `p@${p.mx},${p.my} hp=${Math.round(p.hp)} map=${_G.map.px},${_G.map.py} noFlee=${!!f.noFlee} over=${!!f.over}${probe}\n`);
            } catch (e) {}
          }
          return flee();
        }
      }
      alive.sort((a, b) => (a.hp || 0) - (b.hp || 0));
      const tgt = alive[0];
      const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
      const tmx = tgt.mx != null ? tgt.mx : 4, tmy = tgt.my != null ? tgt.my : 4;
      try {
        const w = (G.equippedWeapon && G.equippedWeapon()) || { range: 1 };
        const d0 = Math.max(Math.abs(tmx - px), Math.abs(tmy - py));
        if (d0 > (w.range || 1)) {
          const occupied = new Set(f.fighters.filter(x => x.alive && x.key !== 'p').map(x => x.mx + ',' + x.my));
          let bx = null, by = null, bd = 1e9;
          for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
            if (!dx && !dy) continue;
            const cx = tmx + dx, cy = tmy + dy;
            if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
            if (occupied.has(cx + ',' + cy)) continue;
            const dd = Math.max(Math.abs(cx - px), Math.abs(cy - py));
            if (dd < bd) { bd = dd; bx = cx; by = cy; }
          }
          if (bx != null) { try { G.tbPlayerMove(bx, by); } catch (e) {} ctx.closed = (ctx.closed || 0) + 1; }
          endTurn();
          return true;
        }
      } catch (e) {}
      try { G.tbPlayerStrike(tgt.key); ctx.struck = (ctx.struck || 0) + 1; } catch (e) {}
      endTurn();
      return true;
    } catch (e) { return false; }
  };
  // smart contest driver: advance; when a choice doesn't advance the phase
  // (blocked aloud, e.g. ratings summons "Eat first"), rotate indices like a
  // real player would ("Phone it in" / "Refuse on camera"). Cap calls.
  policy.contest = function (G, ctx) {
    try {
      const ac = G.state && G.state.activeContest;
      if (!ac || ac.phase === 'done' || ac.arenaSuspended) return false;
      ctx.contestCalls = (ctx.contestCalls || 0) + 1;
      if (ctx.contestCalls > 600) { ctx.contestNote = 'contest call cap hit'; return false; }
      const phases = ac.phases || [];
      const pi = ac.phaseIdx || 0;
      const nChoices = ((phases[pi] || {}).choices || []).length;
      if (!nChoices) return false;
      ctx._cxIdx = ctx._cxIdx == null ? 0 : ctx._cxIdx;
      const idx = ctx._cxIdx % nChoices;
      let ret;
      try { ret = G.contestChoose(idx); } catch (e) { ctx._cxIdx++; return true; }
      const ac2 = G.state && G.state.activeContest;
      if (ac2 && ac2.phase !== 'done' && (ac2.phaseIdx || 0) === pi) {
        ctx._cxStuck = (ctx._cxStuck || 0) + 1;
        if (ctx._cxStuck >= 3) { ctx._cxIdx++; ctx._cxStuck = 0; ctx.contestStuck = (ctx.contestStuck || 0) + 1; }
      } else {
        ctx._cxStuck = 0;
      }
      return true;
    } catch (e) { return false; }
  };
  return policy;
}

// ---- conversation driver (r2, engage-first, 8 turns) ----
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy',
  'gq:open:take', 'gq:open:unsure', 'agency:ask_field', 'alive:want:share_news', 'alive:want:ask_favor', 'alive:want:warn_you', 'alive:want:seek_comfort', 'alive:want:curious'];
const ENGAGE2 = ['goon', 'ask:gossip', 'ask:lately', 'ask:personal', 'alive:event:mourning', 'ask:fears', 'ask:you', 'teach'];
const DEFLECT = ['dlg:cant', 'gq:open:honest_pass'];
// R92 CHOICE ROTATION (r90 blank 1): the r90 capture pressed "Tell me
// more" 9 times in one sitting because dlg:more outranks everything but
// the first six ENGAGE ids, producing a filler-loop-shaped reel that a
// real player rotating choices would never create. Track consecutive
// more/details picks per sitting (reset by runConversation); after 2 in
// a row, those ids drop out of the ENGAGE pass for the rest of the
// sitting, so the picker must reach react / engage2 / deflect / leave.
// Harness-only: the game offers the same menu either way.
let _moreStreak = 0;
const MORE_IDS = ['dlg:more', 'dlg:details'];
// R94 BETRAYAL-BRANCH PICKER (r93 metric review: betrayal-branch
// coverage): r93's picker never took betrayal:accept/decline, so every
// stage-0 invitation sitting fell through to an instant leave and was
// never read. When a sitting offers betrayal:accept, the picker now
// ANSWERS the invitation instead of leaving: accept on even-numbered
// betrayal sittings across the panel run, decline on odd-numbered
// ones (accept first), taken at most once per sitting. Later turns in
// the same sitting use the normal picker. Harness-only: the game
// offers the same menu either way; a live player could pick either
// branch, and Steve's 2026-10-27 ruling says invitations should
// sometimes be taken.
let _betrayalSittingIndex = 0;
let _betrayalTaken = false;
let _betrayalModeThisSitting = null;
function beginSitting() {
  _moreStreak = 0;
  _betrayalTaken = false;
  _betrayalModeThisSitting = null;
}
function pickChoiceInner(choices, turn) {
  const list = choices || [];
  const betrayalAccept = list.find(x => x && x.id === 'betrayal:accept');
  if (betrayalAccept && !_betrayalTaken) {
    _betrayalTaken = true;
    _betrayalModeThisSitting = (_betrayalSittingIndex % 2 === 0) ? 'accept' : 'decline';
    _betrayalSittingIndex++;
    if (_betrayalModeThisSitting === 'accept') return betrayalAccept;
    const decline = list.find(x => x && x.id === 'betrayal:decline');
    if (decline) return decline;
    return betrayalAccept;
  }
  const engage = _moreStreak >= 2 ? ENGAGE.filter(id => MORE_IDS.indexOf(id) === -1) : ENGAGE;
  for (const id of engage) { const c = list.find(x => x && x.id === id); if (c) return c; }
  // REACTIVE ANSWERS (r16 harness fix): the NPC's direct question hangs a
  // reactiveQ whose answers are react:<qid>:<aid>. The old picker only knew
  // ans:/dlg:react and dropped these — three seek_taken openers got
  // zero-turn instant-leaves in the pilot, misread as a game defect. A
  // direct question gets answered first (Rule 4); honest_pass is the
  // deflect, not the engage.
  const reactAns = list.find(x => x && x.id && x.id.indexOf('react:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (reactAns) return reactAns;
  // GENERIC-Q ANSWERS (r16 harness fix, second half): hanging generic
  // questions hang answers as gq:<kind>:<aid> (any kind: open, yn, howru,
  // ...). The old picker only knew three gq:open: ids — a yn-classified
  // seek_taken opener ("Have you heard anything?") got a zero-turn
  // instant-leave (seed 8908 d45). Same Rule-4 treatment as react:.
  const gqAns = list.find(x => x && x.id && x.id.indexOf('gq:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (gqAns) return gqAns;
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  for (const id of ENGAGE2) { const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of DEFLECT) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  return list.find(x => x && x.id === 'leave') || null;
}
function pickChoice(choices, turn) {
  const c = pickChoiceInner(choices, turn);
  if (c && MORE_IDS.indexOf(c.id) >= 0) _moreStreak++;
  else _moreStreak = 0;
  return c;
}
// R95 sitting order (unchanged in r103) (pure, proof-tested): the revisit target first if
// present, then villagers with convo count < 2 (r94's preference, stable
// roster order), then the rest; deduped, capped at 3 sittings per day.
// `info` entries are {id, count}; count < 0 (unknown) sorts as not-<2.
function orderSittingCandidates(revisitVid, info) {
  const seen = new Set();
  const out = [];
  const push = (id) => { if (id && !seen.has(id)) { seen.add(id); out.push(id); } };
  if (revisitVid) push(revisitVid);
  for (const x of (info || [])) { if (x && x.count >= 0 && x.count < 2) push(x.id); }
  for (const x of (info || [])) { if (x) push(x.id); }
  return out.slice(0, 3);
}
const CONVO_DAYS = [45, 60, 80];
function runConversation(day, vid) {
  const fp = path.join(EVIDIR, `journey-deepening-r113-transcript-${_currentSeed}-day${day}-${vid}.txt`);
  const L = [];
  const log = (s) => L.push(s);
  try {
    const nm = vname(vid);
    const p = person(vid);
    const r0 = _G.startConvo(vid);
    if (!r0) {
      // HARNESS GAP FIX (deepening r11 2026-10-13): startConvo legitimately
      // returns null for an un-talkable roster id (phantom-talk guard). Log
      // it as a finding, not a crash — a null here in a sim is exactly the
      // recruit-ghost signal the game fix above addresses.
      log(`THEM: (no line — startConvo returned null for ${vid}; un-talkable roster id)`);
      log('want final: id=none stage=0 resolution=none (conversation never opened)');
      fs.writeFileSync(fp, L.join('\n'));
      return fp;
    }
    const c = _G.convoGet(vid);
    const want = (c && c.want) || {};
    log(`=== seed ${_currentSeed} day ${day} — conversation with ${nm} (${vid}) ===`);
    let pmood = '?';
    try { pmood = _G.npcMood ? _G.npcMood(vid) : '?'; } catch (e) {}
    log(`occupation=${p.formerOccupation || p.occupation || '?'} temperament=${(p.personality && p.personality.temperament) || p.temperament || '?'} trust=${((_G.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead} mood=${pmood}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0}${want.fromSeed ? ', fromSeed' : ''})`);
    log('');
    log(`THEM: ${r0.line || '(no line)'}`);
    let r = r0;
    beginSitting(); // r103: fresh sitting (r95 sitting, unchanged), fresh rotation budget + betrayal branch
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = _G.convoChoices(vid); } catch (e) { choices = []; } }
      // R88 M4-LOOP: log the offered menu every turn, so the analyzer can
      // tell whether dlg:commit is re-offered after a refused commit in
      // this sitting (a refused commit resolves the want, so a re-offer
      // for the same want would be the loop shape).
      log(`(offered=${(choices || []).map(x => x && x.id).filter(Boolean).join(',')})`);
      const pick = pickChoice(choices, turn);
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      r = _G.convoTurn(vid, pick.id);
      if (r.line) log(`THEM: ${r.line}`);
      const w = (_G.convoGet(vid).want) || {};
      // R88 M4-LOOP: the resolution disambiguates a refused commit
      // (stage 3 / stated) from a successful one (stage 3 / promised) --
      // stage alone cannot tell them apart post-fix.
      log(`(want=${w.id || 'none'} stage=${w.stage || 0} resolution=${w.resolution || 'none'})`);
      if (r.ended) { log('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = _G.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    const c2 = _G.convoGet(vid);
    const w2 = (c2 && c2.want) || {};
    log(`betrayal branch: ${_betrayalModeThisSitting || 'none'}`);
    log(`want final: id=${w2.id || 'none'} stage=${w2.stage || 0} resolution=${w2.resolution || 'none'}`);
    const t = (c2 && c2.transcript) || [];
    const themLines = t.filter(e => e.who === 'them').map(e => String(e.text));
    const dupes = themLines.filter((x, i) => themLines.indexOf(x) !== i);
    if (dupes.length) log(`!! VERBATIM REPEATS: ${dupes.slice(0, 3).join(' || ').slice(0, 240)}`);
  } catch (e) {
    log('CONVO ERROR: ' + (e && e.stack || e));
  }
  let out = L.join('\n');
  if (out.length > 200 * 1024) out = out.slice(0, 200 * 1024) + '\n[TRUNCATED at 200KB]';
  fs.writeFileSync(fp, out);
  return fp;
}

// R103: villager-goal snapshot (OBSERVER-PURE — reads only, never steers).
// vgoalState reads the stored {top, sinceDay} record (the dawn lottery
// creates the same record on first objPick); vgoalWeights is pure
// arithmetic; objOf reads the current objective. vgoalTop and
// vgoalBiasCands are NEVER called here: vgoalTop runs the commitment
// write and vgoalBiasCands writes weights onto candidates, so calling
// either from the snapshot would steer the game it measures.
const GOAL_LINES = {
  party_up: 'Company makes the road shorter.',
  gear_up: 'Good kit is the difference out there.',
  bank_veterans: "There's a kill out there with their name on it.",
  build_standing: 'The village needs friends beyond the fire.',
  food_security: "The pantry won't fill itself.",
  bonds: "They've been meaning to check on their people.",
  knowledge: "There's something they still need to learn.",
  safety: 'Better close to the fire today.',
};
const GOAL_KINDS = {
  party_up: ['VISIT'], gear_up: ['FORAGE', 'TRAPS'], bank_veterans: ['HUNT'],
  build_standing: ['VISIT'], food_security: ['FORAGE', 'WATER', 'HAUL'],
  bonds: ['VISIT', 'HAVEN_CHORE'], knowledge: ['SEEK'], safety: ['HAVEN_CHORE'],
};
function goalSnap(day) {
  const snap = { day, villagers: [] };
  try {
    const roster = (_G.state.village.roster || []).filter(id => id !== _G.villagerId);
    for (const id of roster) {
      let p = {}; try { p = person(id) || {}; } catch (e) {}
      if (p.dead) continue;
      let st = null, weights = null, obj = null;
      try { st = _G.vgoalState ? _G.vgoalState(id) : null; } catch (e) {}
      try { weights = _G.vgoalWeights ? _G.vgoalWeights(id) : null; } catch (e) {}
      try { obj = _G.objOf ? _G.objOf(id) : null; } catch (e) {}
      snap.villagers.push({
        vid: id, name: vname(id),
        npcGoal: p.npcGoal || (p.goals && p.goals[0]) || null,
        temper: p.npcTemper || p.temper || null,
        top: st ? st.top : null, sinceDay: st ? st.sinceDay : null,
        weights: weights || null,
        objKind: obj ? (obj.kind || null) : null,
        objState: obj ? (obj.state || null) : null,
        objGoal: obj ? (obj.goal || null) : null,
        objGoalLine: obj ? (obj.goalLine || null) : null,
      });
    }
  } catch (e) { snap.err = String(e && e.message); }
  return snap;
}
function goalLineCounts() {
  const counts = {}; let total = 0;
  for (const g in GOAL_LINES) counts[g] = 0;
  for (const line of capture) {
    for (const g in GOAL_LINES) {
      if (line.indexOf(GOAL_LINES[g]) !== -1) { counts[g]++; total++; break; }
    }
  }
  return { counts, total };
}

// R89: meat-chain census -- meat_* items by container x foodState, plus the
// codex foodSafe / foodTested set. Harness-only reads; zero gameplay effect.
function meatCensus() {
  const day = gday();
  const isMeat = (it) => it && String(it.plantId || '').indexOf('meat_') === 0;
  const gated = (it) => { try { return _G.monsterMeatGated(String(it.plantId).slice(5)); } catch (e) { return false; } };
  const summarize = (arr) => (arr || []).filter(it => isMeat(it) && gated(it))
    .map(it => ({ plantId: it.plantId, foodState: it.foodState || '?', units: it.units || 0, kcalEach: it.kcalEach || 0 }));
  let counter = [];
  try { counter = summarize(_G.prepStash ? _G.prepStash() : []); } catch (e) {}
  let foodSafe = [], foodTested = {};
  try {
    for (const [k, v] of Object.entries((_G.state.codex || {}).monsters || {})) {
      if (v.foodSafe) foodSafe.push(k);
      if (v.foodTested) foodTested[k] = v.foodTested;
    }
  } catch (e) {}
  return { day,
    inv: summarize((_G.state.scholar || {}).inventory),
    pantry: summarize((_G.state.village || {}).pantry),
    counter, foodSafe, foodTested };
}

// ---- census ----
// R87 SH4: dead ids must never appear in npcIds() (pure filter, safe to call).
function deadCheck(day) {
  let roster = [], npc = [];
  try { roster = ((_G.state.village || {}).roster || []).slice(); } catch (e) { roster = []; }
  try { npc = (_G.npcIds ? _G.npcIds() : []) || []; } catch (e) { npc = []; }
  const dead = roster.filter(id => { try { return !!person(id).dead; } catch (e2) { return false; } });
  return { day, rosterN: roster.length, deadN: dead.length, deadInNpcIds: npc.filter(id => dead.indexOf(id) >= 0) };
}
// R87 SH3 opportunity scan (read-only): home villagers with a ranged weapon
// and fewer than one batch (5) of matching ammo. Runs daily from policy.daily.
function shipAmmoOppScan(ctx) {
  try { ctx.shipAmmoOppScans = (ctx.shipAmmoOppScans || 0) + 1; } catch (e) { /* counter only */ }
  try {
    const v = (_G.state && _G.state.village) || {};
    const roster = v.roster || [];
    const away = v.away || {};
    const defs = (_G.data && _G.data.items) || [];
    const opps = [];
    for (const id of roster) {
      try {
        if (id === _G.villagerId) continue;
        if (away[id]) continue;
        const p = person(id);
        if (!p || p.dead) continue;
        let rwId = null, ammoId = null;
        const rw = (p.equipped || {}).ranged || null;
        if (rw) {
          rwId = rw.itemId || rw.id;
          try { const d = defs.find(x => x.id === rwId); ammoId = (d && d.weapon && d.weapon.ammo) || null; } catch (e2) { ammoId = null; }
        }
        if (!ammoId) {
          for (const e of (p.items || [])) {
            const eid = (typeof e === 'string') ? e : (e && (e.itemId || e.id));
            if (!eid) continue;
            let d = null;
            try { d = defs.find(x => x.id === eid); } catch (e2) { d = null; }
            if (d && d.weapon && d.weapon.ammo) { rwId = eid; ammoId = d.weapon.ammo; break; }
          }
        }
        if (!ammoId || (ammoId !== 'arrow' && ammoId !== 'bolt')) continue;
        let n = 0;
        for (const e of (p.items || [])) { const eid = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material)); if (eid === ammoId) n += (typeof e === 'string') ? 1 : (e.units || 1); }
        if (n < 5) opps.push({ vid: String(id), weapon: String(rwId), ammo: ammoId, carried: n });
      } catch (e2) { /* per-villager skip */ }
    }
    if (opps.length) ctx.shipAmmoOpp.push({ day: gday(), opps: opps });
  } catch (e) { ctx.shipWrapErrors.push('ammoOppScan:' + String(e && e.message)); }
}
function popAlive() {
  try { return (_G.state.village.roster || []).filter(id => !person(id).dead).length; } catch (e) { return null; }
}
function deathsSoFar() {
  try { return (_G.state.telemetry || []).filter(e => e && e.type === 'death'); } catch (e) { return []; }
}
function buildCensus() {
  const roster = (_G.state.village && _G.state.village.roster) || [];
  const trust = (_G.state.village && _G.state.village.trust) || {};
  return roster.map(id => {
    const p = person(id);
    let plants = 0;
    try { plants = (_G.plantsKnownBy(id) || []).length; } catch (e) {}
    let ax = null;
    try { ax = _G.agencyOf ? _G.agencyOf(id) : null; } catch (e) {}
    let mood = null;
    try { mood = _G.npcMood ? _G.npcMood(id) : null; } catch (e) {}
    return {
      id, name: vname(id), alive: !p.dead,
      occupation: p.formerOccupation || p.occupation || null,
      temperament: (p.personality && p.personality.temperament) || p.temperament || null,
      trust: (trust[id] !== undefined) ? trust[id] : null,
      mood, plantsKnown: plants,
      agencyXP: (ax && typeof ax === 'object' && ax.xp != null) ? ax.xp : (typeof ax === 'number' ? ax : null),
    };
  });
}

// ---- R40 ARMOR CENSUS (harness-only reads; zero gameplay effect) ----
// How much of the village is actually wearing protection, and what the
// stockpile looks like. Mirrors standing.js's armor-bar read path.
function armorCensus() {
  const S = (typeof globalThis !== 'undefined' && globalThis.Scattering) || {};
  const eq = S.equipment || null;
  const itemDefs = (_G.data && _G.data.items) || [];
  const day = gday();
  let havenTier = null;
  try { havenTier = _G.havenTier ? _G.havenTier() : null; } catch (e) {}
  let scholarArmor = null;
  try { scholarArmor = (_G.armorBonus && typeof _G.armorBonus === 'function') ? (_G.armorBonus() | 0) : null; } catch (e) {}
  let scholarSlots = null;
  try { scholarSlots = Object.keys((_G.state.scholar || {}).equipped || {}); } catch (e) {}
  const roster = ((_G.state.village || {}).roster) || [];
  const armored = [];
  for (const vid of roster) {
    try {
      const p = person(vid);
      if (!p || p.dead) continue;
      const holder = (vid === _G.villagerId)
        ? { equipped: ((_G.state.scholar || {}).equipped || {}) }
        : { equipped: (p.equipped || {}) };
      let ap = 0, torsoId = null;
      if (eq && typeof eq.armorOf === 'function') ap = eq.armorOf(holder, itemDefs) || 0;
      try { const t = (holder.equipped || {}).torso || {}; torsoId = t.itemId || t.id || null; } catch (e2) {}
      if (ap > 0) armored.push({ vid, name: vname(vid), ap, torso: torsoId, scholar: vid === _G.villagerId });
    } catch (e) {}
  }
  // crafted armor items floating around (scholar pack, pantry, villager packs)
  const crafted = { bark_armor: 0, hide_armor: 0, other: 0 };
  try {
    const isArmorId = (it) => {
      const id = (it && (it.itemId || it.id)) || '';
      if (!id) return null;
      const d = itemDefs.find(x => x && x.id === id);
      return (d && d.armor) ? id : null;
    };
    const scan = (arr) => {
      for (const it of (arr || [])) {
        const id = isArmorId(it);
        if (!id) continue;
        if (id === 'bark_armor') crafted.bark_armor++;
        else if (id === 'hide_armor') crafted.hide_armor++;
        else crafted.other++;
      }
    };
    scan((_G.state.scholar || {}).inventory);
    scan(((_G.state.village || {}).pantry) || []);
    for (const vid of roster) { try { scan((person(vid) || {}).items); } catch (e) {} }
  } catch (e) {}
  return { day, havenTier, scholarArmor, scholarSlots, armoredVillagers: armored, crafted };
}
// Readiness snapshot for the wave gate (waves 4-5 are readiness-gated;
// 1-3 always ready). Which of the four bars is short?
function readinessSnap(w) {
  try {
    const r = (_G.waveCombatReadiness && typeof _G.waveCombatReadiness === 'function') ? _G.waveCombatReadiness(w) : null;
    if (!r) return null;
    return { day: gday(), wave: w, ready: !!r.ready, armored: r.armored, armed: r.armed, tricks: r.tricks, veterans: r.veterans, demand: r.demand || null, short: r.short || [] };
  } catch (e) { return { err: String(e && e.message) }; }
}

// ---- R12 M7 mood-honesty audit ----
// Per living roster villager: the census mood, the needs snapshot npcMood
// actually consults, the 10-day memory history (gift/saved/ignored/
// promise_broken...), their own 10-day disease/cured/trust events, plus the
// village-wide 10-day death and contest context and the village grief/cheer
// fields that npcMood consults. Verdicts are a human sense-read afterwards.
function moodAudit() {
  const day = gday();
  const v = (_G.state && _G.state.village) || {};
  const tel = (_G.state && _G.state.telemetry) || [];
  const in10 = (e) => e && (day - ((e.day || 0))) <= 10;
  const deaths10 = tel.filter(e => e && e.type === 'death' && in10(e))
    .map(e => ({ day: e.day, who: e.who, cause: String(e.cause || '').slice(0, 80), kind: e.kind, player: !!e.player }));
  const contests10 = tel.filter(e => e && (e.type === 'contest_fired' || e.type === 'contest_end') && in10(e))
    .map(e => ({ day: e.day, type: e.type, id: e.contestId || e.id }));
  return (v.roster || []).map(id => {
    const p = person(id);
    let mood = null, n = null;
    try { mood = _G.npcMood ? _G.npcMood(id) : null; } catch (e) {}
    try { const nn = _G.npcNeeds(id); n = { hunger: nn.hunger, fear: nn.fear, social: nn.social, energy: nn.energy }; } catch (e) {}
    const mem = (((v.memory || {})[id] || []).filter(in10))
      .map(m => ({ t: m.t, day: m.day, note: String(m.note || '').slice(0, 120) }));
    const mine = (e) => e && e.target === id;
    return {
      id, name: vname(id), alive: !p.dead, mood, needs: n,
      trust: (v.trust || {})[id],
      memories10d: mem,
      disease10d: tel.filter(e => e && e.type === 'disease' && in10(e) && mine(e)).map(e => ({ day: e.day, id: e.id, pool: e.pool })),
      cured10d: tel.filter(e => e && e.type === 'cured' && in10(e) && mine(e)).map(e => ({ day: e.day, id: e.id })),
      trust10d: tel.filter(e => e && e.type === 'trust' && in10(e) && e.who === id).map(e => ({ day: e.day, delta: e.delta, reason: String(e.reason || '').slice(0, 60) })),
      deaths10d: deaths10, contests10d: contests10,
      villageGrief: v.grief || 0, villageCheer: v.cheer || 0,
    };
  });
}

async function runSeed(seed) {
  _currentSeed = seed;
  capture = [];
  console.log(`\n########## SEED ${seed} POLICY=${POLICY} (PROBE_W3=${PROBE_W3}) ##########`);
  const { Game } = await loadGame({ seed, mode: 'journey-deepening-r113-POLICYX', fullTelemetry: true });
  _G = Game;
  // wrap say/sysSay/emit for text capture (sim-harness silences say/sysSay)
  const _say = Game.say, _sys = Game.sysSay, _emit = Game.emit;
  Game.say = function (...a) { cap(a[0]); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  Game.sysSay = function (...a) { cap(a[0]); try { return _sys.apply(this, a); } catch (e) { return a[0]; } };
  if (typeof _emit === 'function') {
    Game.emit = function (...a) { cap(a[0]); try { return _emit.apply(this, a); } catch (e) { return a[0]; } };
  }
  // R10 death-honesty (carried from landing r14): wrap playerDeath on the
  // instance, record the cause, verify the epitaph line carries it.
  const DEATHS = { causes: {}, playerDeaths: [], mislabels: [] };
  try {
    if (typeof Game.playerDeath === 'function') {
      const _pd = Game.playerDeath.bind(Game);
      Game.playerDeath = function (cause) {
        const c = String(cause || 'the wild');
        const mark = capture.length;
        const r = _pd(cause);
        DEATHS.playerDeaths.push({ day: gday(), cause: c });
        DEATHS.causes[c] = (DEATHS.causes[c] || 0) + 1;
        const epitaph = capture.slice(mark, mark + 14).map(x => String(x));
        const epLine = epitaph.find(x => /is dead —/.test(x)) || '';
        const honest = !/starvat/i.test(epLine) || /starvat/i.test(c);
        if (!honest) {
          DEATHS.mislabels.push({ day: gday(), recorded: c, epitaph: epLine.slice(0, 200) });
          console.log(`*** MISLABEL day ${gday()}: recorded=${c} epitaph=${epLine.slice(0, 120)}`);
        } else {
          console.log(`*** PLAYER DEATH day ${gday()}: cause=${c} epitaph=${epLine.slice(0, 120)}`);
        }
        return r;
      };
    }
  } catch (e) { console.log('playerDeath wrap ERROR: ' + (e && e.message)); }
  await setupGame(Game);
  // W3TRACE: log exactly how each wave-3 startCombat is reached (to a FILE —
  // runDays silences console.log inside the day loop)
  if (process.env.W3TRACE) {
    const _sc = Game.startCombat;
    const traceFp = `/tmp/journey-deep-r5-w3trace-${seed}.txt`;
    try { fs.writeFileSync(traceFp, ''); } catch (e) {}
    const tlog = (s) => { try { fs.appendFileSync(traceFp, s + '\n'); } catch (e) {} };
    Game.startCombat = function (mid) {
      try {
        if (waveOf(mid) === 3) {
          const s = Game.state.scholar || {};
          let tileType = '?';
          try { tileType = (Game.playerTile() || {}).type || '?'; } catch (e) {}
          const wm = (Game.worldMonsters ? Game.worldMonsters() : []).map(m => `${m.id}@${m.tx},${m.ty}`);
          tlog(`### W3 startCombat: ${mid} day=${s.day} map=${Game.map.px},${Game.map.py} tileType=${tileType} exiled=${!!s.exiled} insideHaven=${!!s.insideHaven} insideTent=${!!s.insideTent}`);
          tlog('    wanderer: ' + JSON.stringify(Game.wanderer || null));
          tlog('    activeContest: ' + (Game.state.activeContest ? (Game.state.activeContest.contestId + ' suspended=' + !!Game.state.activeContest.arenaSuspended) : null));
          tlog('    pendingEncounter: ' + !!Game.pendingEncounter + ' pendingId: ' + Game.pendingMonsterId);
          tlog('    worldMonsters: ' + JSON.stringify(wm));
          tlog('    stack: ' + new Error('trace').stack.split('\n').slice(2, 10).join(' | '));
        }
      } catch (e) { tlog('wtrace err ' + e.message); }
      return _sc.call(this, mid);
    };
  }
  const policy = makePolicy();
  const result = await runDays(Game, policy, { days: DAYCAP, manifest: { seed, mode: 'journey-deepening-r113-POLICYX', date: new Date().toISOString().slice(0, 10), node: process.version, probe: PROBE_W3 } });
  if (policy._ctx && policy._ctx._fr) finalizeFight(policy._ctx);
  const ctx = policy._ctx || {};
  try { if (ctx.bondInst) ctx.bondInst.uninstall(); } catch (e) {}
  // R110 DEBRIEF-CAPTURE (r109 instrument proposal): loss-trigger flags +
  // villageDebrief lines, read in-run (r109 proved re-run probes diverge).
  let debriefLines = [], lossTrigger = 'n/a', lossFlags = {};
  try {
    const vv = (Game.state && Game.state.village) || {};
    const schDead = (() => { try { const pp = (typeof Game.getPerson === 'function') ? Game.getPerson(Game.villagerId) : null; return !!(pp && pp.dead); } catch (e) { return null; } })();
    const livingN = (() => { try { return ((vv.roster || []).filter(id => { const c = (typeof Game.vpOf === 'function') ? Game.vpOf(id) : null; return c && c.id === id && !c.dead && c.alive !== false; })).length; } catch (e) { return null; } })();
    lossFlags = { scattered: !!vv.scattered, extinct: !!vv.extinct, scholarDead: schDead, livingN, pantryKcal: pantryKcal(), endReason: result.endReason };
    if (result.endReason === 'village-lost') {
      lossTrigger = vv.scattered ? 'scatter-hunger' : vv.extinct ? 'extinction' : (schDead ? 'scholar-death-no-successor' : 'village-lost-unclassified');
    }
  } catch (e) { lossFlags.err = String(e && e.message); }
  try { debriefLines = (typeof Game.villageDebrief === 'function') ? (Game.villageDebrief() || []) : []; } catch (e) { debriefLines = ['debrief-error: ' + String(e && e.message)]; }
  // wave-3 kills (player + villager, by type) and fights-by-wave summary
  let waveKills = null;
  try { waveKills = JSON.parse(JSON.stringify(Game.state.waveKills || {})); } catch (e) {}
  let villageSlain = null;
  try { villageSlain = JSON.parse(JSON.stringify(Game.state.villageSlain || {})); } catch (e) {}
  let wavesFaced = null;
  try {
    const ds = Game.deedState ? Game.deedState() : null;
    wavesFaced = JSON.parse(JSON.stringify((ds && ds.wavesFaced) || {}));
  } catch (e) {}
  // r7: knowledge-economy markers over the captured text
  const capText = capture.join('\n');
  const knowCounts = {};
  for (const [k, marks] of Object.entries(KNOW_MARKERS)) {
    knowCounts[k] = 0;
    for (const mk of marks) {
      let ix = 0, n = 0;
      const low = capText.toLowerCase(), mkl = mk.toLowerCase();
      while ((ix = low.indexOf(mkl, ix)) >= 0) { n++; ix += mkl.length; }
      knowCounts[k] += n;
    }
  }
  const w3fights = (ctx.fightsLog || []).filter(f => (f.monsters || []).some(m => (m.wave || 1) === 3));
  // R11 (r10 metric review): the ledger is authoritative — state.waveKills
  // missed player wave-3 wins in r10. Read ledgerState()[3].perType directly.
  const w3killsByType = {};
  try {
    const L3 = (Game.ledgerState && Game.ledgerState()[3]) || {};
    for (const [mid, pts] of Object.entries(L3.perType || {})) w3killsByType[mid] = pts;
    const L3x = L3.perTypeX || {};
    for (const [mid, pts] of Object.entries(L3x)) {
      if (pts) w3killsByType[mid + '+x'] = pts;
    }
  } catch (e) {}
  const sigFired = {};
  for (const f of w3fights) {
    for (const mid of Object.keys(f.sigHits || {})) {
      sigFired[mid] = (sigFired[mid] || []).concat(f.sigHits[mid]);
    }
  }
  // R9: social/text markers over captured text
  const R9_MARKERS = { exile: ['cast out', 'exiled', 'exile'], moot: ['moot'], theft: ['theft', 'stealing', 'stole'], confrontation: ['confront'] };
const R40_MARKERS = { palisade: ['palisade', 'PALISADE'], raid: ['🐗 RAID', 'raiders hit Haven'] };
  const markerCounts = {};
  for (const [k, marks] of Object.entries(R9_MARKERS)) {
    markerCounts[k] = 0;
    for (const mk of marks) {
      let ix = 0; const low = capText.toLowerCase(), mkl = mk.toLowerCase();
      while ((ix = low.indexOf(mkl, ix)) >= 0) { markerCounts[k]++; ix += mkl.length; }
    }
  }
  // R40: palisade/raid text markers over captured text
  const r40MarkerCounts = {};
  for (const [k, marks] of Object.entries(R40_MARKERS)) {
    r40MarkerCounts[k] = 0;
    for (const mk of marks) {
      let ix = 0; const low = capText.toLowerCase(), mkl = mk.toLowerCase();
      while ((ix = low.indexOf(mkl, ix)) >= 0) { r40MarkerCounts[k]++; ix += mkl.length; }
    }
  }
  // R10: counter-parity telemetry — the engine teles counter_observed (bar
  // fills) and counter_discovered (trick learned, via=trick|taught|
  // scholar-observed|observed). 'observed' = villager non-lethal path.
  let counterObservedEvents = [];
  let counterDiscoveredEvents = [];
  try {
    for (const e of (Game.state.telemetry || [])) {
      if (!e || !e.type) continue;
      if (e.type === 'counter_observed') counterObservedEvents.push({ day: e.day, id: e.id, n: e.n, vid: e.vid });
      else if (e.type === 'counter_discovered') counterDiscoveredEvents.push({ day: e.day, id: e.id, via: e.via });
    }
  } catch (e2) {}
  let villageCounterObs = null, monsterCountersKnown = null, villagerTricks = null;
  try { villageCounterObs = JSON.parse(JSON.stringify(Game.state.villageCounterObs || {})); } catch (e2) {}
  try { monsterCountersKnown = Object.keys(Game.state.monsterCounters || {}); } catch (e2) {}
  try { villagerTricks = Object.keys(Game.state.villagerTricks || {}); } catch (e2) {}
  // R15 (r14 metric review a): audit-at-final-day -- seeds that never reach
  // gd===100 (early end, 86-96d) still count toward the M1 lonely fraction.
  // The gd===100 checkpoint above is kept; this fills the gap at seed end.
  if (!ctx.moodAudit100) {
    try { ctx.moodAudit100 = moodAudit(); ctx.moodAudit100._auditDay = gday(); }
    catch (e) { ctx.moodAudit100 = { err: String(e && e.message || e) }; }
  }
  // R40: final armor census + readiness at seed end (day-100 checkpoint may
  // never fire on early-ending seeds).
  try { ctx.armorSnaps.push(armorCensus()); } catch (e) {}
  try { ctx.meatCensuses.push(meatCensus()); } catch (e) { ctx.meatWrapErrors.push('meatCensus:' + String(e && e.message)); }
  try { const rs = readinessSnap(4); if (rs) ctx.readinessSnaps.push(rs); } catch (e) {}
  try { ctx.shipDeadChecks.push(deadCheck(gday())); } catch (e) { ctx.shipWrapErrors.push('deadCheck-end:' + String(e && e.message)); }
  const out = {
    seed, policy: POLICY, probe: PROBE_W3, maxGameDay: result.gameDays, endReason: result.endReason,
    exileLog: ctx.exileLog || [], exiledAtEnd: !!((Game.state.scholar || {}).exiled),
    deathHonesty: { causes: DEATHS.causes, playerDeaths: DEATHS.playerDeaths, mislabels: DEATHS.mislabels },
    counterParity: { observedEvents: counterObservedEvents, discoveredEvents: counterDiscoveredEvents,
      obsBar: villageCounterObs, known: monsterCountersKnown, villagerTricks },
    // R110 BOND-TELEMETRY + DEBRIEF-CAPTURE (see prereg).
    // R113 Q1: convoEvents serialized too — r110's output dropped them,
    // and the request-telemetry join needs talkTo targets per day.
    bond: ctx.bondInst ? {
      tele: ctx.bondInst.t.bondTeleEvents,
      proposals: ctx.bondInst.t.proposalEvents,
      decisions: ctx.bondInst.t.decisionEvents,
      links: ctx.bondInst.t.linkEvents,
      sayLines: ctx.bondInst.t.sayLines,
      daily: ctx.bondInst.t.daily,
      convoEvents: ctx.bondInst.t.convoEvents,
      errors: ctx.bondInst.t.instrumentErrors,
      wrapCounts: ctx.bondInst.t.wrapCounts,
    } : { errors: ['bond instrument not installed'] },
    // R113 Q1 REQUEST-TELEMETRY: daily staged-map snapshots.
    talkReqSnaps: ctx.talkReqSnaps || [],
    debrief: { lines: debriefLines, trigger: lossTrigger, flags: lossFlags },
    markerCounts,
    r40MarkerCounts,
    waveLog: ctx.waveLog || [], deedLog: ctx.deedLog || [],
    standingTrace: ctx.standingTrace || [], lastLivingCensus: ctx.lastLivingCensus || null,
    finalWave: waveNow(), finalScale: scaleNow(), probed: !!ctx.probed,
    engaged: { w1: waveEngaged(1), w2: waveEngaged(2), w3: waveEngaged(3), w4: waveEngaged(4), w5: waveEngaged(5) },
    wavesFaced,
    w3fights: w3fights.map(f => ({
      day: f.day, rounds: f.rounds, result: f.result, tileType: f.tileType,
      monsters: f.monsters, endHp: f.endHp, sigHits: f.sigHits,
      sample: (f.lines || []).slice(0, 12),
    })),
    // r92: condensed wild-fight tables (W4 judged, W3 comparison base).
    // partySize counts non-monster fighters at fight start (leader + allies).
    wildFightTable: (ctx.fightsLog || []).map(f => ({
      day: f.day, rounds: f.rounds, result: f.result, over: !!f.over, tileType: f.tileType,
      waves: (f.monsters || []).map(m => m.wave || 1),
      monsters: (f.monsters || []).map(m => ({ mid: m.mid, wave: m.wave || 1, name: m.name, veteran: !!m.veteran })),
      partySize: ((f.party || []).filter(x => x.kind !== 'monster')).length,
      party: f.party || null, weapon: f.weapon || null, armor: (f.armor == null ? null : f.armor),
      hp0Total: f.hp0Total || 0, endMonsterHp: f.endMonsterHp || 0,
      dmgFrac: (f.dmgFrac == null ? null : +f.dmgFrac.toFixed(3)),
      outcomeClass: f.outcomeClass || classifyFightOutcome(f),
    })),
    w4ship: ((ctx.shipFights || []).filter(x => (x.wave || 1) === 4)).map(x => ({ day: x.day, mid: x.mid, outcome: x.outcome, fleeClass: x.fleeClass, fleeKind: x.fleeKind, lastLine: x.lastLine })),
    w3killsByType,
    sigFired,
    fightsByWave: ctx.fightsByWave || {},
    fightsTotal: (ctx.fightsLog || []).length,
    foughtWaves: (ctx.fightsLog || []).map(f => ({ day: f.day, waves: (f.monsters || []).map(m => m.wave || 1), result: f.result })),
    census: buildCensus(),
    moodAudit100: ctx.moodAudit100 || null,
    deaths: deathsSoFar().map(d => ({ day: d.day, who: d.who, cause: d.cause, kind: d.kind })),
    regionalLog: ctx.regionalLog || [],
    convoFiles: ctx.convoFiles || [],
    // r103 villager-goal instruments
    goalSnaps: ctx.goalSnaps || [],
    goalLines: goalLineCounts(),
    // r103 inviter-seeking + revisit instruments (r95 lineage)
    inviterHistory: ctx.inviterHistory || [],
    sittingLog: ctx.sittingLog || [],
    revisitAttempts: ctx.revisitAttempts || [],
    contestStuck: ctx.contestStuck || 0, contestCalls: ctx.contestCalls || 0, contestNote: ctx.contestNote || null,
    ctxSummary: {
      struck: ctx.struck || 0, fled: ctx.fled || 0, fledDeepening: ctx.fledDeepening || 0,
      stalemateFled: ctx.stalemateFled || 0, standoffs: ctx.standoffs || 0,
      fleeBlocked: ctx.fleeBlocked || 0, fleeBoxed: ctx.fleeBoxed || 0,
      fightsStarted: ctx.fightsStarted || 0, geared: ctx.geared || 0, armored: ctx.armored || 0,
      beasttricksAsked: ctx.beasttricksAsked || 0, beasttricksTaught: ctx.beasttricksTaught || 0,
      beastAsks: ctx.beastAsks || [],
    },
    notes: ctx.notes || [],
    // r7 knowledge economy
    // r40 armor census
    armor: {
      absorbs: ctx.armorAbsorbs || [],
      tierLog: ctx.tierLog || [],
      raids: ctx.raidLog || [],
      pillage: ctx.pillageLog || [],
      shawlAvoids: ctx.shawlAvoids || [],
      snaps: ctx.armorSnaps || [],
      readiness: ctx.readinessSnaps || [],
      tacticalAbsorbLines: (capText.match(/gear absorbs/g) || []).length,
      schEquipped: (() => { try { return _G.state.scholar.equipped; } catch (e) { return null; } })(),
    },
    // r87 ship wraps, carried unchanged (r88 judges only M4-LOOP + M5)
    ship: {
      fights: (ctx.shipFights || []).filter(f => f.outcome),
      fightCalls: (ctx.shipFights || []).length,
      loot: ctx.shipLoot || [],
      ammo: ctx.shipAmmo || [],
      ammoCalls: ctx.shipAmmoCalls || 0,
      ammoOpp: ctx.shipAmmoOpp || [],
      ammoOppScans: ctx.shipAmmoOppScans || 0,
      lessons: ctx.shipLessons || [],
      applicants: ctx.shipApplicants || [],
      arrivals: ctx.shipArrivals || [],
      deadChecks: ctx.shipDeadChecks || [],
      wrapErrors: ctx.shipWrapErrors || [],
    },
    meat: { kills: ctx.meatKills || [], reveals: ctx.meatReveals || [], tests: ctx.meatTests || [], dinners: ctx.meatDinners || [], censuses: ctx.meatCensuses || [], wrapErrors: ctx.meatWrapErrors || [] },
    counterEvents: ctx.counterEvents || [],
    combineFires: ctx.combineFires || [],
    teachableDays: ctx.teachableDays || [],
    traderDeepSnaps: ctx.traderDeepSnaps || [],
    knowCounts,
    pacing: result.pacing,
    ms: result.ms,
  };
  const fp = path.join(EVIDIR, `journey-deepening-r113-seed${seed}.json`);
  fs.writeFileSync(fp, JSON.stringify(out, null, 1));
  if (process.env.CAPTURE_DUMP) {
    try {
      let txt = capture.join('\n');
      if (txt.length > 1500 * 1024) txt = txt.slice(0, 1500 * 1024) + '\n[TRUNCATED at 1.5MB]';
      fs.writeFileSync(`/tmp/r9-cap-${POLICY}-${seed}.txt`, txt);
    } catch (e) {}
  }
  const w3n = w3fights.length;
  console.log(`SEED ${seed} DONE: day=${result.gameDays} end=${result.endReason} wave=${waveNow()} w3fights=${w3n} engagedW3=${waveEngaged(3)} pop=${popAlive()} meatK=${(ctx.meatKills||[]).length} meatTest=${(ctx.meatTests||[]).length} meatReveal=${(ctx.meatReveals||[]).length} meatDinner=${(ctx.meatDinners||[]).length} bondTele=${(ctx.bondInst && ctx.bondInst.t.bondTeleEvents || []).length} bondProp=${(ctx.bondInst && ctx.bondInst.t.proposalEvents || []).length} debrief=${lossTrigger} ms=${result.ms} -> ${fp}`);
  return out;
}

async function main() {
  const summary = [];
  for (const seed of SEEDS) {
    try { summary.push(await runSeed(seed)); }
    catch (e) { console.log(`SEED ${seed} FATAL: ` + (e && e.stack || e)); summary.push({ seed, fatal: String(e && e.message || e) }); }
  }
  console.log('\n########## ALL SEEDS COMPLETE ##########');
  for (const s of summary) {
    const par = s.counterParity || {};
    const obsN = (par.observedEvents || []).length, discN = (par.discoveredEvents || []).length;
    const dh = (s.deathHonesty || {}).mislabels || [];
    console.log(`seed ${s.seed}: day=${s.maxGameDay} end=${s.endReason} wave=${s.finalWave} w3fights=${(s.w3fights || []).length} engagedW3=${(s.engaged || {}).w3} pop=${(s.census || []).filter(c => c.alive).length}/${(s.census || []).length} counterObs=${obsN} counterDisc=${discN} mislabels=${dh.length}${s.fatal ? ' FATAL: ' + s.fatal : ''}`);
  }
}
if (require.main === module) main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });

module.exports = { deepeningFlee, pickChoice, beginSitting, classifyFightOutcome, classifyBeastAsk, orderSittingCandidates };
