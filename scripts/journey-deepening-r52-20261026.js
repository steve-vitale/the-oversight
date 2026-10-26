// journey-deepening-r52-20261026.js -- DEEPENING leg R52: "AMANDA EMPTY BEAT + WALK-TO-FIRE + FALSY-0 SIBLINGS" (r51 follow-up)
// R52 DELTA (vs r51): SAME seeds 42001-42004 (panel comparison), SAME policy
// (competent + CRAFT_ARMOR=1 + PREP_PULL=1 + GATHER_DEADFALL=1 +
// COMPETENT_ARMOR_VINE_SEEK=1), ZERO policy change, ZERO src/js changes.
// R51 left three threads open, all taken up here: (1) Amanda's empty first
// want beat — the amandaprobe arm (d80-only picker switch) logs the favor
// instance + no-repeat-ledger membership per turn, to name the blocker
// behind the dry line; (2) the walk-to-fire loot arm — the scholar walks
// to the corpse cell via microMove, then takes the bark stack, proving
// corpse-loot reachability end to end (r51's arm never walked); (3) the
// falsy-0 sibling audit (see the r52 probe test, not this driver).
// PRE-REGISTERED: hidden_files/evidence/2026-10-26/journey-deepening-r52-prereg.md
// (written BEFORE any run). Rotation read 2 (deepening, lane A).
// PRE-REGISTERED: hidden_files/evidence/2026-10-26/journey-deepening-r52-prereg.md
// (written BEFORE any run). Rotation read 2 (deepening, lane A).
//   Binding metrics (prereg): P1 Amanda ask reached via subject->want->
//   details from a d80-only switch + first want-beat line verbatim;
//   P2 walk-to-fire take attempted on >=1 corpse-bark case with a named
//   outcome; P3 falsy-0 audit table (probe test) over all 3 sites.
//   M4 people: 12 transcripts, <=1 non-meaningful; M5 winnable 4/4 alive;
//   STAY-GREEN death-honesty mislabels == 0. Horizon: DAYCAP=100,
//   death-aware stop. Seeds: 42001-42004 (r43 panel).
// Usage: POLICY=competent CRAFT_ARMOR=1 PREP_PULL=1 GATHER_DEADFALL=1 COMPETENT_ARMOR_VINE_SEEK=1 SEEDS=42001,42002,42003,42004 node scripts/journey-deepening-r52-20261026.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [42001, 42002, 42003, 42004]);
const DAYCAP = parseInt(process.env.DAYCAP || '100', 10);
const PROBE_W3 = process.env.PROBE_W3 === '1';
const CRAFT_ARMOR = process.env.CRAFT_ARMOR === '1';
const PREP_PULL = process.env.PREP_PULL === '1';
const GATHER_DEADFALL = process.env.GATHER_DEADFALL === '1';
const CONVO_MODE = process.env.CONVO_MODE || 'r50';
const LOOT_BARK = process.env.LOOT_BARK === '1';
const LOOT_WALK = process.env.LOOT_WALK === '1';
// R52 AMANDAPROBE flag: set by runConversation for the day-80 sitting only
// (panel picker everywhere else, including d45/d60 of the same arm run).
let _probeDay80 = false;
// EMIT_SUMMARY (flap bridge, 2026-10-24): when set, the harness skips file
// writes for transcripts + seed JSON and instead prints a compact per-seed
// summary JSON to stdout (metric fields + full transcript texts). The
// caller saves it via a reliable write path. Sim and RNG are untouched;
// only the output channel changes. Default off (normal file writes).
const EMIT_SUMMARY = process.env.EMIT_SUMMARY === '1';

const { mulberry32, loadGame, setupGame, runDays, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { belongseek } = require('./policies/belongseek');
const POLICY = process.env.POLICY === 'belongseek' ? 'belongseek' : 'competent';
const BASE = POLICY === 'belongseek' ? belongseek : competent;

// EVIDIR (r12): per-seed evidence goes to the goal hidden_files evidence dir,
// NOT the repo -- keeps the repo clean (AGENTS.md green-list discipline) and
// matches the coordinator's note layout. Relative path from the worktree root
// avoids hardcoding machine-specific absolutes.
const EVIDIR = process.env.EVIDIR_OVERRIDE || path.join(ROOT, '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-10-26');

// writeRetry (flap durability, 2026-10-24): the container EPERM flap fails
// write(2) intermittently for minutes at a time (open succeeds, write fails
// EPERM, leaving 0-byte files). Evidence writes are the run's only output,
// so retry them in-process instead of losing the seed: up to 600 attempts,
// 1s apart (Atomics.wait sleep, no subprocess), then rethrow honestly.
// Windows open briefly every few minutes (observed /tmp OK 12:52, 12:55,
// 13:01) and rename() into the evidence dir is reliable even mid-flap, so
// staging + retry + rename is the durable path. Game code and results are
// untouched; only write durability changes.
function writeRetry(fp, data) {
  // R52 FIX (diagnosed 2026-10-26): a missing parent dir made writeFileSync
  // throw ENOENT on every attempt, and the 600x1s retry loop parked the
  // run for 10 minutes on a trivially fixable error (the r52 pilot "hang").
  // Create the parent first; retries stay for the real EPERM flap only.
  try { fs.mkdirSync(path.dirname(fp), { recursive: true }); } catch (e) {}
  let lastErr = null;
  for (let i = 0; i < 600; i++) {
    try { fs.writeFileSync(fp, data); return; }
    catch (e) {
      lastErr = e;
      if (i === 599) throw e;
      try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000); } catch (e2) {}
    }
  }
  throw lastErr;
}

// ---- per-seed globals (reset per seed) ----
let capture = [];
let _transcripts = []; // EMIT_SUMMARY: {day, vid, text} collected per seed
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

// R46 GATHER_DEADFALL (harness-only policy step): once per game day, try
// one deliberate deadfall gather via the game's own gatherFallen action.
// R46 moves the call PRE-FORAGE (see the forage wrapper): r45 called it
// after the forage action, when the scholar had already moved to a swept
// cell that never neighbors a tree on 42002/42004-class seeds.
// R48 gates the pre-forage call on probe.wood > 0 (same wrapper): the
// once-per-day guard must not be consumed by a wood=0 forage call.
// Scans the 3x3 around the scholar for a tree/bigtree cell (the only cells that
// yield bark strips since r44) and gathers from the first one found.
// Records every attempt incl. no-tree days, so a zero-bark run
// distinguishes "never near a tree" from "gathered but got no bark".
// Errors are recorded, never swallowed silently.
function tryGather(ctx, tag) {
  try {
    if ((ctx._gatherDay || 0) === gday()) return;
    ctx._gatherDay = gday();
    ctx.gatherAttempts = ctx.gatherAttempts || [];
    if (typeof _G.gatherFallen !== 'function') { ctx.gatherAttempts.push({ day: gday(), tag, result: 'no-action' }); return; }
    let detail = null;
    try {
      const tile = _G.playerTile ? _G.playerTile() : null;
      detail = (tile && tile.detail) || (_G.genDetail ? _G.genDetail(_G.map.px, _G.map.py) : null);
    } catch (e) { ctx.gatherAttempts.push({ day: gday(), tag, result: 'err-detail', err: String(e && e.message) }); return; }
    if (!detail) { ctx.gatherAttempts.push({ day: gday(), tag, result: 'no-detail' }); return; }
    const mx = (_G.state.scholar || {}).mx ?? 4, my = (_G.state.scholar || {}).my ?? 4;
    let target = null;
    for (let dy = -1; dy <= 1 && !target; dy++) for (let dx = -1; dx <= 1; dx++) {
      const cx = mx + dx, cy = my + dy;
      if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
      const c = detail[cy] && detail[cy][cx];
      if (c === 'tree' || c === 'bigtree') { target = [cx, cy]; break; }
    }
    if (!target) { ctx.gatherAttempts.push({ day: gday(), tag, result: 'no-tree' }); return; }
    let r = null;
    try { r = _G.gatherFallen(target[0], target[1]); } catch (e) { ctx.gatherAttempts.push({ day: gday(), tag, result: 'err-gather', cell: target.join(','), err: String(e && e.message) }); return; }
    ctx.gatherAttempts.push({ day: gday(), tag, result: r == null ? 'null' : 'ok', cell: target.join(',') });
  } catch (e) { try { (ctx.gatherAttempts = ctx.gatherAttempts || []).push({ day: gday(), tag, result: 'err-outer', err: String(e && e.message) }); } catch (e2) {} }
}

// R52 TREE-PROXIMITY SNAP (read-only): at each intraday phase, is any
// tree/bigtree cell in the scholar's 3x3? Answers 42004's geography-vs-
// timing question without touching play: trees at some phase + no-tree
// gathers = timing; trees at no phase = geography.
function treeSnap(ctx, phase) {
  try {
    ctx.treeSnaps = ctx.treeSnaps || [];
    let detail = null;
    try {
      const tile = _G.playerTile ? _G.playerTile() : null;
      detail = (tile && tile.detail) || (_G.genDetail ? _G.genDetail(_G.map.px, _G.map.py) : null);
    } catch (e) { ctx.treeSnaps.push({ day: gday(), phase, result: 'err-detail' }); return; }
    if (!detail) { ctx.treeSnaps.push({ day: gday(), phase, result: 'no-detail' }); return; }
    const mx = (_G.state.scholar || {}).mx ?? 4, my = (_G.state.scholar || {}).my ?? 4;
    const cells = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const cx = mx + dx, cy = my + dy;
      if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
      const c = detail[cy] && detail[cy][cx];
      if (c === 'tree' || c === 'bigtree') cells.push(cx + ',' + cy + ':' + c);
    }
    ctx.treeSnaps.push({ day: gday(), phase, mx, my, treeIn3x3: cells.length > 0, cells });
  } catch (e) { try { (ctx.treeSnaps = ctx.treeSnaps || []).push({ day: gday(), phase, result: 'err-outer' }); } catch (e2) {} }
}

// R52 LOOT ARM ONLY (never in the panel): once per day, for each
// unburied, unlooted corpse carrying a bark_armor stack, take ONLY that
// stack via the game's own corpseTakeItem, then try to wear it. Every
// attempt is logged (range failures included) so reachability is
// measured, not assumed. A failed range check changes nothing.
function lootBarkArm(ctx) {
  try {
    if (!LOOT_BARK) return;
    ctx.lootArm = ctx.lootArm || [];
    let list = [];
    try { list = (typeof _G.corpses === 'function') ? _G.corpses() : []; } catch (e) { return; }
    for (const c of (list || [])) {
      if (!c || c.buried || c.looted) continue;
      const idx = (c.items || []).findIndex(it => it && (it.itemId || it.id) === 'bark_armor' && (it.units == null ? 1 : it.units) > 0);
      if (idx < 0) continue;
      const key = c.id || (c.villagerId + '@' + c.dayDied);
      if ((ctx._lootTried || {})[key] === 'taken') continue;
      const before = { trauma: (_G.state.scholar || {}).trauma || 0, health: (_G.state.scholar || {}).health, packBark: (_G.state.scholar.inventory || []).filter(i => (i.itemId || i.id) === 'bark_armor').reduce((t, i) => t + (i.units || 1), 0), torso: ((_G.state.scholar.equipped || {}).torso || {}).itemId || ((_G.state.scholar.equipped || {}).torso || {}).id || null, node: c.node || null, mx: c.mx, my: c.my, scholarMx: (_G.state.scholar || {}).mx, scholarMy: (_G.state.scholar || {}).my, mapNode: (_G.map ? { x: _G.map.px, y: _G.map.py } : null) };
      let r = null, err = null;
      const capMark = capture.length;
      try { r = _G.corpseTakeItem(c.id, idx); } catch (e) { err = String(e && e.message); }
      const said = capture.slice(capMark, capMark + 6);
      const after = { trauma: (_G.state.scholar || {}).trauma || 0, health: (_G.state.scholar || {}).health, packBark: (_G.state.scholar.inventory || []).filter(i => (i.itemId || i.id) === 'bark_armor').reduce((t, i) => t + (i.units || 1), 0), torso: ((_G.state.scholar.equipped || {}).torso || {}).itemId || ((_G.state.scholar.equipped || {}).torso || {}).id || null, looted: !!c.looted };
      let wear = null;
      if (r != null) {
        try {
          const invIdx = (_G.state.scholar.inventory || []).findIndex(i => (i.itemId || i.id) === 'bark_armor');
          if (invIdx >= 0) { const wr = _G.equip(invIdx, 'torso'); wear = { tried: true, result: wr == null ? 'null' : 'ok', torsoAfter: ((_G.state.scholar.equipped || {}).torso || {}).itemId || ((_G.state.scholar.equipped || {}).torso || {}).id || null }; }
          else wear = { tried: false, reason: 'no bark in pack after take' };
        } catch (e) { wear = { tried: true, err: String(e && e.message) }; }
        ctx._lootTried = ctx._lootTried || {}; ctx._lootTried[key] = 'taken';
      }
      ctx.lootArm.push({ day: gday(), corpse: key, name: c.name || null, dayDied: c.dayDied || null, recovered: !!c.recovered, buried: !!c.buried, result: r == null ? 'null' : 'taken', err, said, before, after, wear });
    }
  } catch (e) { try { (ctx.lootArm = ctx.lootArm || []).push({ day: gday(), result: 'err-outer', err: String(e && e.message) }); } catch (e2) {} }
}

// R52 WALK-TO-FIRE ARM ONLY (never in the panel): like lootBarkArm, but
// the scholar WALKS to the corpse first via the game's own microMove
// (one square, one kcal, adjacent steps only — the real player's verb),
// then takes the bark stack. Records every step (from/to/blocked), the
// kcal spent, and the take outcome, so "too far" after walking is a bug
// and a weight refusal is an honest gate. Only corpses on the scholar's
// current map node are walkable; a node mismatch is logged, not teleported.
function walkCorpseArm(ctx) {
  try {
    if (!LOOT_WALK) return;
    ctx.walkArm = ctx.walkArm || [];
    let list = [];
    try { list = (typeof _G.corpses === 'function') ? _G.corpses() : []; } catch (e) { return; }
    for (const c of (list || [])) {
      if (!c || c.buried || c.looted) continue;
      const idx = (c.items || []).findIndex(it => it && (it.itemId || it.id) === 'bark_armor' && (it.units == null ? 1 : it.units) > 0);
      if (idx < 0) continue;
      const key = c.id || (c.villagerId + '@' + c.dayDied);
      if ((ctx._walkTried || {})[key] === 'taken') continue;
      const s0 = _G.state.scholar || {};
      const entry = { day: gday(), corpse: key, name: c.name || null, dayDied: c.dayDied || null,
        from: { mx: s0.mx, my: s0.my, mapNode: _G.map ? { x: _G.map.px, y: _G.map.py } : null },
        corpseAt: { mx: c.mx, my: c.my, node: c.node || null }, steps: [], blocked: [] };
      const sameNode = c.node && _G.map && c.node.x === _G.map.px && c.node.y === _G.map.py;
      if (!sameNode) { entry.outcome = 'node-mismatch'; ctx.walkArm.push(entry); continue; }
      const kcal0 = s0.kcal;
      let walked = 0;
      for (let guard = 0; guard < 30; guard++) {
        const s = _G.state.scholar || {};
        const dx = Math.abs((c.mx ?? 4) - (s.mx ?? 4)), dy = Math.abs((c.my ?? 4) - (s.my ?? 4));
        if (Math.max(dx, dy) <= 1) break;
        // Greedy Chebyshev step toward the corpse cell, trying the
        // best-first adjacent cells; a blocked cell is recorded and
        // the next candidate tried (trees/walls block microMove).
        const cands = [];
        for (let ddy = -1; ddy <= 1; ddy++) for (let ddx = -1; ddx <= 1; ddx++) {
          if (!ddx && !ddy) continue;
          const nx = (s.mx ?? 4) + ddx, ny = (s.my ?? 4) + ddy;
          if (nx < 0 || nx > 8 || ny < 0 || ny > 8) continue;
          cands.push({ nx, ny, d: Math.max(Math.abs((c.mx ?? 4) - nx), Math.abs((c.my ?? 4) - ny)) });
        }
        cands.sort((a, b) => a.d - b.d);
        let moved = false;
        for (const cand of cands) {
          let r = false;
          try { r = _G.microMove(cand.nx, cand.ny); } catch (e) { r = false; }
          if (r) { entry.steps.push({ from: [s.mx, s.my], to: [cand.nx, cand.ny] }); walked++; moved = true; break; }
          entry.blocked.push([cand.nx, cand.ny]);
        }
        if (!moved) { entry.outcome = 'walk-blocked'; break; }
      }
      const s1 = _G.state.scholar || {};
      entry.arrived = { mx: s1.mx, my: s1.my, dist: Math.max(Math.abs((c.mx ?? 4) - (s1.mx ?? 4)), Math.abs((c.my ?? 4) - (s1.my ?? 4))) };
      entry.kcalSpent = (kcal0 || 0) - (s1.kcal || 0);
      entry.dayAfterWalk = gday();
      if (entry.outcome !== 'walk-blocked') {
        const before = { trauma: s1.trauma || 0, packBark: (s1.inventory || []).filter(i => (i.itemId || i.id) === 'bark_armor').reduce((t, i) => t + (i.units || 1), 0) };
        let r = null, err = null;
        const capMark = capture.length;
        try { r = _G.corpseTakeItem(c.id, idx); } catch (e) { err = String(e && e.message); }
        const said = capture.slice(capMark, capMark + 6);
        const s2 = _G.state.scholar || {};
        entry.take = { result: r == null ? 'null' : 'taken', err, said, before,
          after: { trauma: s2.trauma || 0, packBark: (s2.inventory || []).filter(i => (i.itemId || i.id) === 'bark_armor').reduce((t, i) => t + (i.units || 1), 0), looted: !!c.looted } };
        if (r != null) {
          try {
            const invIdx = (s2.inventory || []).findIndex(i => (i.itemId || i.id) === 'bark_armor');
            if (invIdx >= 0) { const wr = _G.equip(invIdx, 'torso'); entry.wear = { tried: true, result: wr == null ? 'null' : 'ok', torsoAfter: ((s2.equipped || {}).torso || {}).itemId || ((s2.equipped || {}).torso || {}).id || null }; }
            else entry.wear = { tried: false, reason: 'no bark in pack after take' };
          } catch (e) { entry.wear = { tried: true, err: String(e && e.message) }; }
          ctx._walkTried = ctx._walkTried || {}; ctx._walkTried[key] = 'taken';
        }
        entry.outcome = entry.outcome || (r == null ? 'take-null' : 'taken');
      }
      ctx.walkArm.push(entry);
    }
  } catch (e) { try { (ctx.walkArm = ctx.walkArm || []).push({ day: gday(), result: 'err-outer', err: String(e && e.message) }); } catch (e2) {} }
}

function gearUp(ctx) {
  try {
    if ((ctx._gearDay || 0) === gday()) return;
    ctx._gearDay = gday();
    if (GATHER_DEADFALL) tryGather(ctx, 'gearup');
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
    // R44 PREP_PULL (harness-only): at camp, pull loose prep-counter
    // materials (bark/vine/hide) into the pack via the game's own
    // takePrepMaterial BEFORE armor craft attempts. The game already
    // offers this path to a real player; the policy never used it, so
    // prep hides were invisible to craft(). Camp-gated by the action
    // itself (refuses away from camp). Counts pulls for the run note.
    if (PREP_PULL) {
      try {
        if (_G.atCamp && _G.atCamp() && typeof _G.takePrepMaterial === 'function') {
          ctx.prepPulls = ctx.prepPulls || { bark: 0, vine: 0, hide: 0, calls: 0 };
          for (let guard = 0; guard < 50; guard++) {
            const stash = _G.state.scholar.prepStash || [];
            const idx = stash.findIndex(it => it && ['bark', 'vine', 'hide'].includes(it.material) && (it.units || 0) > 0);
            if (idx < 0) break;
            const mat = stash[idx].material;
            const r = _G.takePrepMaterial(idx);
            if (r && r.ok) { ctx.prepPulls[mat] = (ctx.prepPulls[mat] || 0) + (r.taken || 0); ctx.prepPulls.calls++; }
            else break;
          }
        }
      } catch (e) {}
    }
    // R41 CRAFT_ARMOR: player actually tries to craft armor daily. craft()
    // itself gates on knowledge + materials; count attempts/success/fail from
    // return values (non-null = made). No villager crafting (r40 finding (a)
    // untouched). Attempt even at L1: the 35% shot IS the design question.
    if (CRAFT_ARMOR) {
      for (const rid of ['bark_armor', 'hide_armor']) {
        try {
          const capMark = capture.length;
          // DIAG (r48: cap REMOVED — r41 recorded only the first 40 attempts,
          // which hid late-run sufficient attempts and their roll outcomes;
          // r47's metric review required full-run counts): record level +
          // pre-craft mat counts + result for EVERY attempt (distinguishes
          // true roll failures from no-mats blocks, which the bare
          // /comes apart/ regex conflated).
          let _diag = null;
          try {
            const inv0 = _G.state.scholar.inventory || [];
            const cnt = (m) => inv0.filter(i => i.material === m).reduce((t, i) => t + (i.units || 0), 0);
            _diag = { day: gday(), rid, level: ((_G.state.codex.recipes || {})[rid] || {}).level || 0, bark: cnt('bark'), vine: cnt('vine'), hide: cnt('hide') };
          } catch (e) {}
          let _mapBefore = null;
          try { _mapBefore = armorLocationMap(); } catch (e) {}
          const r = _G.craft(rid);
          try {
            // R50 HOLDER TRACE: on a MAKE, record the before/after maps with
            // the maker (the scholar at craft time). Proves the piece lands
            // in the scholar pack at birth (or wherever it lands).
            if (r != null) {
              try {
                ctx.holderMakes = ctx.holderMakes || [];
                ctx.holderMakes.push({ day: gday(), rid, level: (_diag && _diag.level) || 0, makerVid: _G.villagerId || null, makerName: vname(_G.villagerId), before: _mapBefore, after: armorLocationMap() });
              } catch (e) {}
            }
          } catch (e) {}
          try {
            ctx.craftArmor = ctx.craftArmor || { blocked: {}, made: {}, fails: {} };
            ctx.craftArmor.diag = ctx.craftArmor.diag || [];
            if (_diag) ctx.craftArmor.diag.push(Object.assign(_diag, { result: r == null ? 'null' : 'made', ownLines: capture.slice(capMark).join(' | ').slice(0, 300) }));
            // matHist: true attempts (mats sufficient) vs blocked-no-mats.
            // (Classifier fix: the L1 blind-warning line says "if it comes
            // apart" — matching bare /comes apart/ misclassified every
            // no-mats L1 attempt as a roll failure. True failures say
            // "comes apart in your hands".)
            if (_diag) {
              ctx.craftArmor.matHist = ctx.craftArmor.matHist || {};
              const suf = rid === 'bark_armor' ? (_diag.bark >= 3 && _diag.vine >= 2) : (_diag.hide >= 2 && _diag.vine >= 1);
              const k = rid + (suf ? '_sufficient' : '_insufficient');
              ctx.craftArmor.matHist[k] = (ctx.craftArmor.matHist[k] || 0) + 1;
            }
          } catch (e) {}
          const ownLines = capture.slice(capMark);
          ctx.craftArmor = ctx.craftArmor || { blocked: {}, made: {}, fails: {} }; // blocked = null without a 'comes apart' line (unknown recipe or missing mats)
          if (r != null) { ctx.craftArmor.made[rid] = (ctx.craftArmor.made[rid] || 0) + 1; }
          else {
            // craft() returns null for: unknown recipe, missing mats, or a
            // failed roll after consuming mats. Distinguish by say-line:
            // a TRUE roll failure says "comes apart in your hands"; the L1
            // blind-warning line says "if it comes apart" and must NOT
            // match (r41 classifier fix — it misclassified every no-mats
            // L1 attempt as a failure). Unknown/missing says otherwise.
            const last = ownLines.join(' ');
            if (/comes apart in your hands/.test(last)) ctx.craftArmor.fails[rid] = (ctx.craftArmor.fails[rid] || 0) + 1;
            else {
              ctx.craftArmor.blocked[rid] = (ctx.craftArmor.blocked[rid] || 0) + 1;
              ctx.craftArmor.blockedLines = ctx.craftArmor.blockedLines || {};
              const arr = (ctx.craftArmor.blockedLines[rid] = ctx.craftArmor.blockedLines[rid] || []);
              if (arr.length < 5) arr.push(ownLines.join(' | ').slice(0, 200));
            }
          }
        } catch (e) {}
      }
    }
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

function knowledgePlay(ctx) {
  const day = gday();
  if ((ctx._btDay || 0) === day) return;
  ctx._btDay = day;
  if (day % 5 !== 0) return;
  try {
    const slain = _G.state.villageSlain || {};
    const known = _G.state.monsterCounters || {};
    for (const type of Object.keys(slain)) {
      if ((slain[type] || 0) >= 1 && !known[type]) { // r7: matches the 1+ counterTeachable lever (2026-10-11)
        const roster = (_G.state.village.roster || []).filter(id => id !== _G.villagerId);
        const vid = roster.find(id => { try { return !_G.getPerson(id).dead; } catch (e) { return false; } });
        if (vid) {
          const r = _G.askAbout(vid, 'beasttricks');
          ctx.beasttricksTaught = (ctx.beasttricksTaught || 0) + ((r && r.taught) ? 1 : 0);
          ctx.beasttricksAsked = (ctx.beasttricksAsked || 0) + 1;
          break;
        }
      }
    }
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
    rec.endHp = (f.fighters || []).map(x => ({ key: x.key, kind: x.kind, mid: x.monsterId || null, hp: Math.round(x.hp || 0), fled: !!x.fled }));
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
  policy.id = 'journey-deepening-r50-' + POLICY;
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
    ctx.probed = false;
    ctx.fightsByWave = {};
    ctx.contestCalls = 0;
    ctx.contestStuck = 0;
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
    // R42 MATFLOW instruments (harness-only; zero gameplay effect)
    ctx.matSnaps = [];   // matSnap() each day after BASE.daily, before gearUp (r42 snapshot, kept)
    ctx.matSnapsDawn = []; // R43: matSnap() before BASE.daily (true dawn)
    ctx.matSnapsDusk = []; // R43: matSnap() after gearUp+regional+knowledge (dusk)
    ctx.forageCalls = [];  // R43: every doAction('forage') with pack bark/branch/vine delta
    ctx.hideHandled = [];  // R43: every noteHideHandled call (hide touching scholar hands)
    ctx.craftLog = [];   // every policy craft() call: {day, rid, result}
    try {
      const _cr = G.craft;
      if (typeof _cr === 'function') {
        G.craft = function (rid) {
          const r = _cr.apply(this, arguments);
          try { ctx.craftLog.push({ day: gday(), rid: String(rid), result: r == null ? 'null' : 'made' }); } catch (e2) {}
          return r;
        };
      }
    } catch (e) {}
    try {
      const _da = G.doAction;
      if (typeof _da === 'function') {
        G.doAction = function (action) {
          let before = null, probe = null;
          try { before = packMats(); } catch (e2) {}
          // R44 FORAGE_PROBE: what wood was even in sweep range? Tile type,
          // tree/bigtree cells in the 3x3 around the scholar, and how many
          // of those are species-less (the only cells that yield deadfall
          // bark). Pure reads; the sweep itself is untouched.
          try {
            if (String(action) === 'forage') {
              const tile = _G.playerTile ? _G.playerTile() : null;
              const detail = (tile && tile.detail) || (_G.genDetail ? _G.genDetail(_G.map.px, _G.map.py) : null);
              const mx = (_G.state.scholar || {}).mx ?? 4, my = (_G.state.scholar || {}).my ?? 4;
              let wood = 0, bare = 0;
              if (detail) {
                for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
                  const cx = mx + dx, cy = my + dy;
                  if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
                  const c = detail[cy] && detail[cy][cx];
                  if (c !== 'tree' && c !== 'bigtree') continue;
                  wood++;
                  try { if (tile && _G.cellPlantSpecies && _G.cellPlantSpecies(tile, cx, cy, c) == null) bare++; } catch (e3) {}
                }
              }
              probe = { tileType: (tile && tile.type) || '?', wood, bare };
              // R48 WOOD-POSITIVE GATE: fire ONLY when the probe just
              // counted wood in range. R46 fired on every forage call
              // until the guard consumed the day — including wood=0
              // calls (creek-side start-of-day spot) that recorded
              // no-tree and blocked later same-day wood-positive calls
              // (42002: all 73 wood-positive days burned this way).
              // Probe and tryGather scan the same 3x3, so a gated call
              // always has a tree target; a 'no-tree' preforage attempt
              // after this change means the gate did not take (proof
              // gate). MUST stay gated on action === 'forage' (r46
              // lesson) AND on probe.wood > 0.
              if (GATHER_DEADFALL && probe && probe.wood > 0) tryGather(ctx, 'preforage');
            }
          } catch (e2) {}
          const r = _da.apply(this, arguments);
          try {
            if (String(action) === 'forage' && before) {
              const after = packMats();
              ctx.forageCalls.push(Object.assign({ day: gday(), dBark: after.bark - before.bark, dBranch: after.branch - before.branch, dVine: after.vine - before.vine, dStick: after.stick - before.stick, result: r == null ? 'null' : 'ok' }, probe || {}));
              // R46: NO post-forage tryGather — kept in r48: the pre-forage
              // call above is the only forage-day attempt (guard would
              // no-op a second call anyway on forage days; removing it
              // keeps P1 attribution clean on no-tree days, where a
              // second attempt at a new position would blur pre- vs
              // post-forage placement).
            }
          } catch (e2) {}
          return r;
        };
      }
    } catch (e) {}
    try {
      const _nhh = G.noteHideHandled;
      if (typeof _nhh === 'function') {
        G.noteHideHandled = function (it) {
          // Log ONLY calls the function itself accepts: noteHideHandled gates on
          // plantId==='animal_hide' or material==='hide' and returns early otherwise.
          // Logging pre-gate polluted the pilot (trophy/meat calls counted as hides).
          try { if (it && (it.plantId === 'animal_hide' || it.material === 'hide') && Number.isSafeInteger(it.units ?? 1) && (it.units ?? 1) > 0) ctx.hideHandled.push({ day: gday(), units: (it.units ?? 1), plantId: it.plantId || null, material: it.material || null }); } catch (e2) {}
          return _nhh.apply(this, arguments);
        };
      }
    } catch (e) {}
    try {
      const _gf = G.gatherFallen;
      if (typeof _gf === 'function') {
        ctx.gatherCalls = [];
        G.gatherFallen = function (cx, cy) {
          let before = null;
          try { before = packMats(); } catch (e2) {}
          const r = _gf.apply(this, arguments);
          try {
            if (before) { const after = packMats(); ctx.gatherCalls.push({ day: gday(), cell: String(cx) + ',' + String(cy), dBark: after.bark - before.bark, dBranch: after.branch - before.branch, result: r == null ? 'null' : 'ok' }); }
          } catch (e2) {}
          return r;
        };
      }
    } catch (e) {}
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
          } catch (e2) {}
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
  };
  policy.upkeep = function (G, ctx) {
    goInside();
    BASE.upkeep(G, ctx);
  };
  policy.daily = function (G, ctx) {
    goInside();
    try { ctx.matSnapsDawn.push(matSnap()); } catch (e) {}
    try { treeSnap(ctx, 'dawn'); } catch (e) {}
    try { ctx._holderPhase = { phase: 'dawn', day: gday(), map: armorLocationMap(), vid: _G.villagerId }; } catch (e) {}
    BASE.daily(G, ctx);
    try { ctx.matSnaps.push(matSnap()); } catch (e) {}
    try { treeSnap(ctx, 'mid'); } catch (e) {}
    try { const _hm = armorLocationMap(); const _pv = ctx._holderPhase; if (_pv) { const _ch = holderMapDiff(_pv.map, _hm); if (_ch.length || _pv.vid !== _G.villagerId) { ctx.holderIntraday = ctx.holderIntraday || []; ctx.holderIntraday.push({ day: gday(), fromPhase: _pv.phase, toPhase: 'mid', fromVid: _pv.vid, scholarVid: _G.villagerId, changed: _ch }); } } ctx._holderPhase = { phase: 'mid', day: gday(), map: _hm, vid: _G.villagerId }; } catch (e) {}
    gearUp(ctx);
    regionalPlay(ctx);
    knowledgePlay(ctx);
    try { ctx.matSnapsDusk.push(matSnap()); } catch (e) {}
    try { treeSnap(ctx, 'dusk'); } catch (e) {}
    try { const _hm = armorLocationMap(); const _pv = ctx._holderPhase; if (_pv) { const _ch = holderMapDiff(_pv.map, _hm); if (_ch.length || _pv.vid !== _G.villagerId) { ctx.holderIntraday = ctx.holderIntraday || []; ctx.holderIntraday.push({ day: gday(), fromPhase: _pv.phase, toPhase: 'dusk', fromVid: _pv.vid, scholarVid: _G.villagerId, changed: _ch }); } } ctx._holderPhase = { phase: 'dusk', day: gday(), map: _hm, vid: _G.villagerId }; } catch (e) {}
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
      ctx.deedLog.push({ day: gd, engaged: eng, wave: w, pop: popAlive(), pantry: pantryKcal(), w3fights: (ctx.fightsByWave || {})[3] || 0,
        standingTotal, codexL2, sharedKnowN, traderDeepN,
        scale: scaleNow(), exiled: !!((_G.state.scholar || {}).exiled), links: linkSnap, takeRate7, codexMonsters });
      try {
        const td = JSON.parse(JSON.stringify((_G.state.village || {}).traderDeep || {}));
        ctx.traderDeepSnaps.push({ day: gd, deep: td });
      } catch (e) {}
      // R40: armor census + readiness snapshot at each deed checkpoint.
      try { ctx.armorSnaps.push(armorCensus()); } catch (e) {}
      try { const rs = readinessSnap(4); if (rs) ctx.readinessSnaps.push(rs); } catch (e) {}
      // R12 M7 mood-honesty: snapshot mood + 10-day event history at day 100.
      if (gd === 100) {
        try { ctx.moodAudit100 = moodAudit(); ctx.moodAudit100._auditDay = 100; } catch (e) { ctx.moodAudit100 = { err: String(e && e.message) }; }
      }
    }
    // R11: teachableDays sampler DROPPED (r10 metric review — empty 8/8;
    // discovery via taught/observed fires faster than the sampling cadence.
    // Intent covered by counterEvents + beasttricksAsked/Taught.)
    // conversations on leg days (people check)
    if (CONVO_DAYS.includes(gd)) {
      let vid = null;
      try {
        const roster = (_G.state.village.roster || []).filter(id => id !== _G.villagerId);
        for (const id of roster) {
          const p = person(id);
          if (p.dead) continue;
          try { const comm = _G.npcComm ? _G.npcComm(id) : { level: 'full' }; if (comm.level === 'none') continue; } catch (e) {}
          let cnt = -1;
          try { const c0 = _G.convoGet(id); cnt = (c0 && c0.count) || 0; } catch (e) {}
          if (cnt < 2) { vid = id; break; }
        }
        if (!vid && roster.length) vid = roster.find(id => !person(id).dead) || null;
      } catch (e) {}
      // R52 AMANDAPROBE: on day 80 the sitting partner is Amanda herself,
      // not the panel's least-talked pick (r52 panel picks Phongsak on
      // d80; Amanda's own d45/d60 sittings are panel-identical, so her
      // d80 pre-state is panel history — only the partner differs, and
      // the d80 sitting IS the probe). If Amanda is dead/untalkable,
      // fall back to the panel pick and note it.
      if (CONVO_MODE === 'amandaprobe' && gd === 80) {
        try {
          const roster = (_G.state.village.roster || []);
          const am = roster.find(id => {
            try { return !person(id).dead && vname(id) === 'Amanda'; } catch (e) { return false; }
          });
          if (am) vid = am;
        } catch (e) {}
      }
      if (vid) {
        try {
          // R52 AMANDAPROBE: the probe flag is live for the d80 sitting
          // only; every other sitting uses the panel picker.
          _probeDay80 = (CONVO_MODE === 'amandaprobe' && gd === 80);
          const fp = runConversation(gd, vid);
          _probeDay80 = false;
          ctx.convoFiles.push(fp);
        } catch (e) {}
      }
    }
    // R50 HOLDER TRACE: end-of-day map diff + scholar-change watch. Runs
    // AFTER the driver's daily work, so it cannot feed back into that day's
    // play; pure reads only. A move shows its day; the scholar log and the
    // make log share the day, so the mechanism names itself by companions.
    // R50 adds intraday diffs (dawn/mid/dusk, taken in policy.daily above)
    // so a succession-day move shows its phase, not just its day.
    try {
      const map = armorLocationMap();
      const svid = _G.villagerId || null;
      let scholarChangedToday = false;
      if (ctx._lastScholarVid !== undefined && ctx._lastScholarVid !== svid) {
        scholarChangedToday = true;
        ctx.scholarChanges = ctx.scholarChanges || [];
        ctx.scholarChanges.push({ day: gd, fromVid: ctx._lastScholarVid, fromName: ctx._lastScholarName || null, toVid: svid, toName: vname(svid) });
      }
      ctx._lastScholarVid = svid; ctx._lastScholarName = vname(svid);
      const prev = ctx._lastHolderMap || null;
      if (!prev) { ctx._holderBaseline = map; }
      else {
        const changed = holderMapDiff(prev, map);
        if (changed.length || scholarChangedToday) {
          ctx.holderDeltas = ctx.holderDeltas || [];
          ctx.holderDeltas.push({ day: gd, scholarVid: svid, scholarName: vname(svid), changed, map });
        }
      }
      ctx._lastHolderMap = map;
    } catch (e) {}
    // R52 LOOT ARM (env-gated, panel runs skip it): try the bark take
    // at end of day, after the holder map, so the take shows in the
    // NEXT day's holder delta, not this day's map.
    try { lootBarkArm(ctx); } catch (e) {}
    // R52 WALK ARM (env-gated, arm runs only): walk to the fire, then take.
    try { walkCorpseArm(ctx); } catch (e) {}
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
        ctx._fr = {
          id: f.id, obj: f, day: gday(), capStart: capture.length, tileType,
          startRound: f.round || 0,
          hp0Total: mons.reduce((t, m) => t + (m.maxHp || m.hp || 0), 0),
          monsters: mons.map(m => ({ key: m.key, mid: m.monsterId, wave: waveOf(m.monsterId), name: monsterDisplay(m.monsterId), hp0: m.maxHp || m.hp })),
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
function pickChoice(choices, turn) {
  const list = choices || [];
  // R51 SUBJECTFIRST ARM ONLY (never in the panel): on turn 0, steer
  // off the opening thread with dlg:subject if offered, then fall back
  // to the r50 picker — tests whether a real player steering away from
  // the goal thread can reach the stage-0 want at all.
  if (CONVO_MODE === 'subjectfirst' && turn === 0) {
    const subj = list.find(x => x && x.id === 'dlg:subject');
    if (subj) return subj;
  }
  // R52 AMANDAPROBE ARM ONLY (never in the panel; _probeDay80 is set by
  // the d80 caller only): turn 0 subject, turn 1 the want itself, then
  // the panel picker (which reaches dlg:details via ENGAGE). Identical
  // route to the r51 subject-first arm, but the picker is the panel
  // picker on every other sitting, so d80 history is panel history.
  if (CONVO_MODE === 'amandaprobe' && _probeDay80) {
    if (turn === 0) {
      const subj = list.find(x => x && x.id === 'dlg:subject');
      if (subj) return subj;
    }
    if (turn === 1) {
      const want = list.find(x => x && x.id === 'alive:want:ask_favor');
      if (want) return want;
    }
  }
  // R51 WANTFIRST ARM ONLY (never in the panel): rank the want-engage
  // options first, so the arm tests whether the ask surfaces when the
  // player leads with it instead of saying "go on" eight times.
  if (CONVO_MODE === 'wantfirst') {
    for (const id of ['alive:want:ask_favor', 'alive:want:seek_comfort', 'alive:want:warn_you', 'alive:want:share_news', 'alive:want:curious', 'dlg:help', 'dlg:commit', 'dlg:details', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize']) { const c = list.find(x => x && x.id === id); if (c) return c; }
    const reactAns = list.find(x => x && x.id && x.id.indexOf('react:') === 0 && x.id.indexOf('honest_pass') === -1);
    if (reactAns) return reactAns;
    const gqAns = list.find(x => x && x.id && x.id.indexOf('gq:') === 0 && x.id.indexOf('honest_pass') === -1);
    if (gqAns) return gqAns;
    const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
    if (ans) return ans;
    return list.find(x => x && x.id === 'leave') || null;
  }
  for (const id of ENGAGE) { const c = list.find(x => x && x.id === id); if (c) return c; }
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
const CONVO_DAYS = [45, 60, 80];
function runConversation(day, vid) {
  const fp = path.join(EVIDIR, `journey-deepening-r52-transcript-${_currentSeed}-day${day}.txt`);
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
      _transcripts.push({ day, vid, text: L.join('\n') });
      if (!EMIT_SUMMARY) writeRetry(fp, L.join('\n'));
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
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = _G.convoChoices(vid); } catch (e) { choices = []; } }
      // R52 CHOICE LOG (read-only): offered ids + thread + want, so the
      // Amanda question (picker vs game) is answered from evidence, not
      // from the picked line alone.
      try {
        const cc = _G.convoGet(vid) || {};
        const cw = cc.want || {};
        log(`(offered=[${(choices || []).map(x => x && x.id).filter(Boolean).join(',')}] thread=${cc.thread || '?'} want=${cw.id || 'none'} stage=${cw.stage || 0})`);
      // R52 AMANDAPROBE FORENSICS (read-only, d80 sitting only): the
      // favor instance behind the want + whether its opener line is
      // already in any no-repeat ledger. If the want beat speaks the
      // dry line, one of these three memberships names the blocker:
      // run ledger (another villager said it recently), saidLinesConvo
      // (this sitting), or saidLines (an earlier sitting of Amanda's).
      if (CONVO_MODE === 'amandaprobe' && day === 80) {
        try {
          const cc2 = _G.convoGet(vid) || {};
          const wf = (cc2.want && cc2.want.favor) || null;
          let runLed = [];
          try { runLed = _G.convoRunLedger ? _G.convoRunLedger() : []; } catch (e) {}
          const line = wf && wf.line;
          log(`(favor id=${wf ? wf.id : 'none'} kind=${wf ? wf.kind : 'none'} state=${wf ? wf.state : 'none'} askedDay=${wf ? wf.askedDay : 'none'} fromSeed=${!!((cc2.want || {}).fromSeed)} lineInRunLedger=${line ? runLed.includes(line) : 'n/a'} lineInSaidConvo=${line ? ((cc2.saidLinesConvo || []).includes(line)) : 'n/a'} lineInSaidLines=${line ? ((cc2.saidLines || []).includes(line)) : 'n/a'})`);
          if (line) log(`(favor line=${line})`);
          if (wf && wf.whyLine) log(`(favor whyLine=${wf.whyLine})`);
        } catch (e) { log(`(favor forensics error: ${e && e.message})`); }
      }
      } catch (e) {}
      const pick = pickChoice(choices, turn);
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      r = _G.convoTurn(vid, pick.id);
      if (r.line) log(`THEM: ${r.line}`);
      const w = (_G.convoGet(vid).want) || {};
      log(`(want=${w.id || 'none'} stage=${w.stage || 0})`);
      if (r.ended) { log('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = _G.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    const c2 = _G.convoGet(vid);
    const w2 = (c2 && c2.want) || {};
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
  _transcripts.push({ day, vid, text: out });
  if (!EMIT_SUMMARY) writeRetry(fp, out);
  return fp;
}

// ---- census ----
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
// R50 HOLDER TRACE (harness-only reads; zero gameplay effect). R48's census
// aggregated scholar pack + pantry + villager packs into one count, so a
// made piece's later location was unprovable (Elena wearing bark_armor at
// day 50 with zero in packs; a second piece in SOME pack at day 70 while
// the scholar wore shelter_cloak). This map splits every location: scholar
// pack, scholar torso, pantry, village stash items (if any), per living
// villager pack + torso, per dead roster entry, and per corpse death pack —
// bark_armor and hide_armor only. Crafted pieces are fungible
// ({itemId, units: 1}, no instance id), so the trace is population-level:
// differenced daily and intraday, every move shows its day and phase. Pure
// reads only (armorOf is computation, no RNG consumed); exported for the
// proof script's unit cases.
function armorLocationMap(G) {
  // G defaults to the driver's live game; the proof passes a stub state so
  // the location logic is unit-testable without a live run. Production call
  // sites pass nothing, so live behavior is unchanged.
  const S = G || _G;
  const zero = () => ({ scholarPack: { bark: 0, hide: 0 }, scholarTorso: null, pantry: { bark: 0, hide: 0 }, stash: { bark: 0, hide: 0 }, villagers: [], corpses: [], deadVillagers: [] });
  if (!S || !S.state) return zero();
  const nm = (vid) => { try { return S.displayName(vid) || vid; } catch (e) { return vid; } };
  const ps = (vid) => { try { return S.getPerson(vid) || {}; } catch (e) { return {}; } };
  const counts = (arr) => {
    let bark = 0, hide = 0;
    for (const it of (arr || [])) {
      const id = (it && (it.itemId || it.id)) || '';
      if (id === 'bark_armor') bark += (it.units || 1);
      else if (id === 'hide_armor') hide += (it.units || 1);
    }
    return { bark, hide };
  };
  const torsoOf = (equipped) => {
    try { const t = (equipped || {}).torso || {}; return t.itemId || t.id || null; } catch (e) { return null; }
  };
  const map = zero();
  try { map.scholarPack = counts((S.state.scholar || {}).inventory); } catch (e) {}
  try { map.scholarTorso = torsoOf((S.state.scholar || {}).equipped); } catch (e) {}
  try { map.pantry = counts(((S.state.village || {}).pantry) || []); } catch (e) {}
  try {
    const st = ((S.state.village || {}).stash) || {};
    map.stash = counts(st.items || []);
  } catch (e) {}
  try {
    const roster = ((S.state.village || {}).roster) || [];
    for (const vid of roster) {
      try {
        const p = ps(vid);
        if (!p) continue;
        if (p.dead) {
          const pack = counts(p.items);
          const stashed = counts(p.stashed);
          map.deadVillagers.push({ vid, name: nm(vid), pack: { bark: pack.bark + stashed.bark, hide: pack.hide + stashed.hide }, torso: torsoOf(p.equipped) });
          continue;
        }
        const pack = counts(p.items);
        const stashed = counts(p.stashed);
        map.villagers.push({ vid, name: nm(vid), pack: { bark: pack.bark + stashed.bark, hide: pack.hide + stashed.hide }, torso: torsoOf(p.equipped) });
      } catch (e) {}
    }
  } catch (e) {}
  try {
    let list = [];
    try { list = (typeof S.corpses === 'function') ? S.corpses() : ((S.state || {}).corpses || []); } catch (e) { list = ((S.state || {}).corpses || []); }
    for (const c of (list || [])) {
      if (!c) continue;
      const pack = counts(c.items || []);
      map.corpses.push({ id: c.id || null, vid: c.villagerId || null, name: c.name || null, dayDied: c.dayDied || null, buried: !!c.buried, looted: !!c.looted, pack });
    }
  } catch (e) {}
  return map;
}
// Diff labels between two holder maps (location-level, for delta entries).
// Only ARMOR events fire. Two non-armor noises are deliberately excluded:
// (1) villager NAME — knowledge-gated ("A person, maybe 50s..." ->
// "Dylan" on reveal), which fired a delta on every introduction;
// (2) non-armor clothing swaps (None -> camo_jacket via autoEquip),
// which fired deltas with zero bark/hide movement. A torso change fires
// only when its bark/hide-armor class changes; a vid appearing/vanishing
// fires only when that entry carries bark/hide armor (a worn piece
// leaving with its wearer is signal; a plain death is not).
// R50: corpse and dead-roster entries compare by pack only (burial flags
// are not movement); a corpse gaining armor fires, an armorless corpse
// appearing does not.
function holderMapDiff(a, b) {
  const out = [];
  if (!a || !b) return ['full'];
  const cmp = (label, x, y) => { if (JSON.stringify(x) !== JSON.stringify(y)) out.push(label); };
  cmp('scholarPack', a.scholarPack, b.scholarPack);
  cmp('pantry', a.pantry, b.pantry);
  cmp('stash', a.stash, b.stash);
  const armorClass = (t) => (t === 'bark_armor' ? 'bark' : (t === 'hide_armor' ? 'hide' : 'other'));
  if (armorClass(a.scholarTorso) !== armorClass(b.scholarTorso)) out.push('scholarTorso');
  const byVid = (m) => { const o = {}; for (const v of (m.villagers || [])) o[v.vid] = v; return o; };
  const byKey = (arr, keyFn) => { const o = {}; for (const v of (arr || [])) o[keyFn(v)] = v; return o; };
  const cmpPackList = (label, al, bl, keyFn) => {
    const aa = byKey(al, keyFn), bb = byKey(bl, keyFn);
    for (const k of new Set([...Object.keys(aa), ...Object.keys(bb)])) {
      const x = aa[k], y = bb[k];
      if (!x || !y) { const present = x || y; if (present.pack.bark || present.pack.hide || armorClass(present.torso) !== 'other') out.push(label + ':' + k); }
      else if (JSON.stringify(x.pack) !== JSON.stringify(y.pack) || armorClass(x.torso) !== armorClass(y.torso)) out.push(label + ':' + k);
    }
  };
  cmpPackList('corpse', a.corpses, b.corpses, (c) => String(c.id || (c.vid + '@' + c.dayDied)));
  cmpPackList('deadVillager', a.deadVillagers, b.deadVillagers, (v) => String(v.vid));
  const av = byVid(a), bv = byVid(b);
  for (const vid of new Set([...Object.keys(av), ...Object.keys(bv)])) {
    const x = av[vid], y = bv[vid];
    if (!x || !y) {
      const present = x || y;
      if (present.pack.bark || present.pack.hide || armorClass(present.torso) !== 'other') out.push('villager:' + vid);
    } else if (JSON.stringify(x.pack) !== JSON.stringify(y.pack) || armorClass(x.torso) !== armorClass(y.torso)) {
      out.push('villager:' + vid);
    }
  }
  return out;
}
// R42 MATFLOW + R43 INTRADAY: scholar-pack material snapshot (harness-only
// read; zero gameplay effect). R42 took it AFTER BASE.daily, BEFORE gearUp.
// R43 additionally takes it at dawn (before BASE.daily) and dusk (end of
// driver daily), and records the same material census for the village stash,
// the pantry, and the prep stash — so a material that leaves the pack for
// the village still shows up somewhere instead of reading as "never arrived".
function packMats() {
  let bark = 0, vine = 0, hide = 0, branch = 0, stick = 0, stone = 0;
  try {
    for (const it of ((_G.state.scholar || {}).inventory || [])) {
      const u = it.units || 0;
      if (it.material === 'bark') bark += u;
      else if (it.material === 'vine') vine += u;
      else if (it.material === 'hide') hide += u;
      else if (it.material === 'branch') branch += u;
      else if (it.material === 'stick') stick += u;
      else if (it.material === 'stone') stone += u;
    }
  } catch (e) {}
  return { bark, vine, hide, branch, stick, stone };
}
function locMats(arr) {
  let bark = 0, vine = 0, hide = 0, branch = 0, stick = 0, stone = 0, fiber = 0;
  try {
    for (const it of (arr || [])) {
      const u = it.units || 0;
      const m = it.material || (it.plantId === 'animal_hide' ? 'hide' : null);
      if (m === 'bark') bark += u;
      else if (m === 'vine') vine += u;
      else if (m === 'hide') hide += u;
      else if (m === 'branch') branch += u;
      else if (m === 'stick') stick += u;
      else if (m === 'stone') stone += u;
      else if (m === 'fiber') fiber += u;
    }
  } catch (e) {}
  return { bark, vine, hide, branch, stick, stone, fiber };
}
function matSnap() {
  const pack = packMats();
  let barkLvl = 0, hideLvl = 0;
  try { barkLvl = ((_G.state.codex.recipes || {}).bark_armor || {}).level || 0; } catch (e) {}
  try { hideLvl = ((_G.state.codex.recipes || {}).hide_armor || {}).level || 0; } catch (e) {}
  let stash = { bark: 0, vine: 0, hide: 0, branch: 0, stick: 0, stone: 0, fiber: 0 };
  try {
    const sm = (((_G.state.village || {}).stash || {}).materials) || {};
    for (const k of Object.keys(stash)) stash[k] = sm[k] || 0;
  } catch (e) {}
  let pantry = { bark: 0, vine: 0, hide: 0, branch: 0, stick: 0, stone: 0, fiber: 0 };
  try { pantry = locMats((_G.state.village || {}).pantry); } catch (e) {}
  let prep = { bark: 0, vine: 0, hide: 0, branch: 0, stick: 0, stone: 0, fiber: 0 };
  try { prep = locMats((_G.state.scholar || {}).prepStash); } catch (e) {}
  return { day: gday(), bark: pack.bark, vine: pack.vine, hide: pack.hide, branch: pack.branch, stick: pack.stick, stone: pack.stone, barkLvl, hideLvl, pantry: pantryKcal(), stash, pantryMats: pantry, prepMats: prep };
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
  _transcripts = [];
  console.log(`\n########## SEED ${seed} POLICY=${POLICY} (PROBE_W3=${PROBE_W3}) ##########`);
  const { Game } = await loadGame({ seed, mode: 'journey-deepening-r50-POLICYX', fullTelemetry: true });
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
  const result = await runDays(Game, policy, { days: DAYCAP, manifest: { seed, mode: 'journey-deepening-r50-POLICYX', date: new Date().toISOString().slice(0, 10), node: process.version, probe: PROBE_W3 } });
  if (policy._ctx && policy._ctx._fr) finalizeFight(policy._ctx);
  const ctx = policy._ctx || {};
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
  try { const rs = readinessSnap(4); if (rs) ctx.readinessSnaps.push(rs); } catch (e) {}
  // R42 MATFLOW summary (from daily snaps + craft log + capture text)
  let matflow = null;
  try {
    const snaps = ctx.matSnaps || [];
    const maxOf = (k) => snaps.reduce((m, sn) => Math.max(m, sn[k] || 0), 0);
    const craftsByRecipe = {};
    for (const c of (ctx.craftLog || [])) {
      const k = c.rid + ':' + c.result;
      craftsByRecipe[k] = (craftsByRecipe[k] || 0) + 1;
    }
    matflow = {
      snapDays: snaps.length,
      maxBark: maxOf('bark'), maxVine: maxOf('vine'), maxHide: maxOf('hide'),
      daysBarkPos: snaps.filter(sn => sn.bark > 0).length,
      daysVinePos: snaps.filter(sn => sn.vine > 0).length,
      daysHidePos: snaps.filter(sn => sn.hide > 0).length,
      suffBarkDays: snaps.filter(sn => sn.bark >= 3 && sn.vine >= 2).length,
      suffHideDays: snaps.filter(sn => sn.hide >= 2 && sn.vine >= 1).length,
      deadfallLines: (capText.match(/gather deadfall/g) || []).length,
      intraday: (() => {
        const agg = (snaps) => {
          const maxOf = (k) => snaps.reduce((m, sn) => Math.max(m, sn[k] || 0), 0);
          const everLoc = (k) => snaps.some(sn => (sn[k] || 0) > 0 || ((sn.stash || {})[k] || 0) > 0 || ((sn.pantryMats || {})[k] || 0) > 0 || ((sn.prepMats || {})[k] || 0) > 0);
          return { n: snaps.length, maxBark: maxOf('bark'), maxHide: maxOf('hide'), maxVine: maxOf('vine'),
            daysBarkPos: snaps.filter(sn => sn.bark > 0).length, daysHidePos: snaps.filter(sn => sn.hide > 0).length,
            daysVinePos: snaps.filter(sn => sn.vine > 0).length,
            everBarkAnywhere: everLoc('bark'), everHideAnywhere: everLoc('hide') };
        };
        const fc = ctx.forageCalls || [];
        const hh = ctx.hideHandled || [];
        const gc = ctx.gatherCalls || [];
        return { dawn: agg(ctx.matSnapsDawn || []), mid: agg(snaps), dusk: agg(ctx.matSnapsDusk || []),
          forageCalls: fc.length, forageBarkPos: fc.filter(c => c.dBark > 0).length,
          forageBarkTotal: fc.reduce((t, c) => t + (c.dBark || 0), 0),
          forageVineTotal: fc.reduce((t, c) => t + (c.dVine || 0), 0),
          forageVineGainCalls: fc.filter(c => (c.dVine || 0) > 0).length,
          forageVineGainByTile: fc.reduce((m, c) => { if ((c.dVine || 0) > 0) m[c.tileType || '?'] = (m[c.tileType || '?'] || 0) + (c.dVine || 0); return m; }, {}),
          thicketCalls: fc.filter(c => c.tileType === 'thicket').length,
          forageTileTypes: fc.reduce((m, c) => { m[c.tileType || '?'] = (m[c.tileType || '?'] || 0) + 1; return m; }, {}),
          forageWoodCalls: fc.filter(c => (c.wood || 0) > 0).length,
          forageBareCalls: fc.filter(c => (c.bare || 0) > 0).length,
          forageWoodTotal: fc.reduce((t, c) => t + (c.wood || 0), 0),
          forageBareTotal: fc.reduce((t, c) => t + (c.bare || 0), 0),
          gatherCalls: gc.length, gatherBarkTotal: gc.reduce((t, c) => t + (c.dBark || 0), 0),
          gatherLog: gc,
          hideHandledEvents: hh.length, hideHandledUnits: hh.reduce((t, h) => t + (h.units || 0), 0),
          dawnSnaps: ctx.matSnapsDawn || [], duskSnaps: ctx.matSnapsDusk || [],
          forageLog: fc, hideLog: hh };
      })(),
      craftsByRecipe, craftCalls: (ctx.craftLog || []).length,
      snaps, craftLog: ctx.craftLog || [],
    };
  } catch (e) { matflow = { err: String(e && e.message) }; }
  const out = {
    seed, policy: POLICY, probe: PROBE_W3, maxGameDay: result.gameDays, endReason: result.endReason,
    exileLog: ctx.exileLog || [], exiledAtEnd: !!((Game.state.scholar || {}).exiled),
    deathHonesty: { causes: DEATHS.causes, playerDeaths: DEATHS.playerDeaths, mislabels: DEATHS.mislabels },
    counterParity: { observedEvents: counterObservedEvents, discoveredEvents: counterDiscoveredEvents,
      obsBar: villageCounterObs, known: monsterCountersKnown, villagerTricks },
    markerCounts,
    r40MarkerCounts,
    waveLog: ctx.waveLog || [], deedLog: ctx.deedLog || [],
    finalWave: waveNow(), finalScale: scaleNow(), probed: !!ctx.probed,
    engaged: { w1: waveEngaged(1), w2: waveEngaged(2), w3: waveEngaged(3), w4: waveEngaged(4), w5: waveEngaged(5) },
    wavesFaced,
    w3fights: w3fights.map(f => ({
      day: f.day, rounds: f.rounds, result: f.result, tileType: f.tileType,
      monsters: f.monsters, endHp: f.endHp, sigHits: f.sigHits,
      sample: (f.lines || []).slice(0, 12),
    })),
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
    contestStuck: ctx.contestStuck || 0, contestCalls: ctx.contestCalls || 0, contestNote: ctx.contestNote || null,
    ctxSummary: {
      struck: ctx.struck || 0, fled: ctx.fled || 0, fledDeepening: ctx.fledDeepening || 0,
      stalemateFled: ctx.stalemateFled || 0, standoffs: ctx.standoffs || 0,
      fleeBlocked: ctx.fleeBlocked || 0, fleeBoxed: ctx.fleeBoxed || 0,
      fightsStarted: ctx.fightsStarted || 0, geared: ctx.geared || 0, armored: ctx.armored || 0,
      beasttricksAsked: ctx.beasttricksAsked || 0, beasttricksTaught: ctx.beasttricksTaught || 0,
      armorVineSeekTrips: ctx.armorVineSeekTrips || 0,
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
      craftArmor: ctx.craftArmor || null, craftArmorOn: CRAFT_ARMOR,
      holder: { makes: ctx.holderMakes || [], deltas: ctx.holderDeltas || [], intraday: ctx.holderIntraday || [], scholarChanges: ctx.scholarChanges || [], baseline: ctx._holderBaseline || null },
      prepPulls: ctx.prepPulls || null, prepPullOn: PREP_PULL,
      gatherAttempts: ctx.gatherAttempts || null, gatherOn: GATHER_DEADFALL,
      treeSnaps: ctx.treeSnaps || null, lootArm: ctx.lootArm || null, walkArm: ctx.walkArm || null, convoMode: CONVO_MODE, lootBarkOn: LOOT_BARK, lootWalkOn: LOOT_WALK,
      matflow,
    },
    counterEvents: ctx.counterEvents || [],
    combineFires: ctx.combineFires || [],
    teachableDays: ctx.teachableDays || [],
    traderDeepSnaps: ctx.traderDeepSnaps || [],
    knowCounts,
    pacing: result.pacing,
    ms: result.ms,
  };
  const fp = path.join(EVIDIR, `journey-deepening-r52-seed${seed}.json`);
  if (EMIT_SUMMARY) {
    // Flap bridge: compact summary to stdout (caller saves it via a
    // reliable write path). Carries every metric field the run judges on
    // plus full transcript texts; drops only bulky auxiliaries (full
    // deed/counter streams stay in the full JSON on normal runs).
    const summaryOut = {
      _flapNote: 'EMIT_SUMMARY: full 130KB JSON replaced by this compact summary during the 2026-10-24 EPERM flap (file writes blocked, stdout + runtime-path save used instead). All metric fields below are the live values.',
      seed: out.seed, policy: out.policy, probe: out.probe,
      maxGameDay: out.maxGameDay, endReason: out.endReason,
      exileLog: out.exileLog, exiledAtEnd: out.exiledAtEnd,
      deathHonesty: out.deathHonesty, counterParity: out.counterParity,
      markerCounts: out.markerCounts, r40MarkerCounts: out.r40MarkerCounts,
      waveLog: out.waveLog, deedLog: out.deedLog,
      finalWave: out.finalWave, finalScale: out.finalScale, probed: out.probed,
      engaged: out.engaged, wavesFaced: out.wavesFaced,
      w3fights: (out.w3fights || []).map(f => ({ day: f.day, rounds: f.rounds, result: f.result, tileType: f.tileType, monsters: f.monsters, endHp: f.endHp, sigHits: f.sigHits })),
      w3killsByType: out.w3killsByType, sigFired: out.sigFired,
      fightsByWave: out.fightsByWave, fightsTotal: out.fightsTotal,
      foughtWaves: out.foughtWaves, census: out.census,
      moodAudit100: out.moodAudit100, deaths: out.deaths,
      regionalLog: out.regionalLog, convoFiles: out.convoFiles,
      contestStuck: out.contestStuck, contestCalls: out.contestCalls, contestNote: out.contestNote,
      ctxSummary: out.ctxSummary, notes: out.notes, armor: out.armor, matflow: out.armor.matflow,
      counterEvents: out.counterEvents, combineFires: out.combineFires,
      teachableDays: out.teachableDays, traderDeepSnaps: out.traderDeepSnaps,
      knowCounts: out.knowCounts, pacing: out.pacing, ms: out.ms,
      transcripts: _transcripts,
    };
    console.log('===R51-SEED-SUMMARY-START===');
    console.log(JSON.stringify(summaryOut));
    console.log('===R51-SEED-SUMMARY-END===');
  } else {
    writeRetry(fp, JSON.stringify(out, null, 1));
  }
  if (process.env.CAPTURE_DUMP) {
    try {
      let txt = capture.join('\n');
      if (txt.length > 1500 * 1024) txt = txt.slice(0, 1500 * 1024) + '\n[TRUNCATED at 1.5MB]';
      fs.writeFileSync(`/tmp/r9-cap-${POLICY}-${seed}.txt`, txt);
    } catch (e) {}
  }
  const w3n = w3fights.length;
  console.log(`SEED ${seed} DONE: day=${result.gameDays} end=${result.endReason} wave=${waveNow()} w3fights=${w3n} engagedW3=${waveEngaged(3)} pop=${popAlive()} ms=${result.ms} -> ${fp}`);
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

module.exports = { deepeningFlee, pickChoice, armorLocationMap, holderMapDiff };
