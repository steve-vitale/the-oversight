#!/usr/bin/env node
// test-guarde-entry-deploy-b.js — PROOF TEST (gap round, guard-E deploy).
//
// Deploys the validated entry-checked allow' into the LIVE guard path
// (scripts/policies/competent-homewardstep-b.js installGuard) with:
//   (1) veto wording that names the step's own barrier for entry vetoes
//       and keeps the escape line verbatim for escape vetoes, and
//   (2) the roadwork credit-pool carve-out: a rubble-only, single-tile
//       entry blockage passes ONLY when E spent no credit — the entry
//       check shares E's one credit, it does not create a second one.
//
// Proves BEFORE/AFTER on identical scenarios, with NO new sims:
//   (a) corpus replay: the validated sim-guarde-entry-b corpora
//       (A band 69501-69508 + C band 69606-69607, 37 hops) run through
//       the LIVE record function — fidelity, veto invariance, entry
//       agreement, and live == validated allow' on every hop (the
//       carve-out fires 0 times on the corpus, as designed);
//   (b) live installGuard on stub Games: clean hop allowed; creek /
//       washed_out / fallen_tree entries vetoed with the entry line
//       (never the escape line); escape failure vetoed with the
//       escape line verbatim; rubble entry allowed via the carve-out
//       when E spent no credit; veto memory still silences repeats;
//   (c) shared-pool rule at unit level: rubble entry vetoes when E
//       already spent the credit, and a non-rubble or multi-tile
//       entry never uses the carve-out;
//   (d) scope guard: the variant instrument, competent.js, the
//       sibling guard copies and src/js are unmodified — the ONLY
//       game-adjacent file this deploy touches is the live guard.
// Exit non-zero on any failure.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const hs = require('./policies/competent-homewardstep-b');

const ROOT = path.join(__dirname, '..');
let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}

// --- (a) Corpus replay through the LIVE record function ---
{
  const files = [
    'evidence/2026-11-02/sim-guarde-entry-b-pilot.jsonl',
    'evidence/2026-11-02/sim-guarde-entry-b-c.jsonl',
  ];
  const hops = [];
  for (const f of files) {
    const lines = fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n').filter((l) => l.trim());
    for (const line of lines) {
      const leg = JSON.parse(line);
      for (const h of (leg.hops || [])) if (h.attempted) hops.push(Object.assign({ _seed: leg.seed }, h));
    }
  }
  check('corpus: 37 attempted hops', hops.length === 37, hops.length);
  let livePass = 0, livePassMoved = 0, eFail = 0, eFailLiveVetoed = 0;
  let conversions = 0, convRefused = 0, convTypes = {};
  let entryAgree = 0, liveEqualsOld = 0, carveOutFires = 0;
  let hop69502 = null;
  for (const h of hops) {
    const live = hs.allowPrimeFromRecordLive(h);
    const oldAllow = !!(h.E && h.E.ok) && ((h.entry && h.entry.blockers) || []).length === 0;
    if (live.allow) { livePass++; if (h.moved) livePassMoved++; }
    if (!(h.E && h.E.ok)) { eFail++; if (!live.allow) eFailLiveVetoed++; }
    if ((h.E && h.E.ok) && !live.allow) {
      conversions++;
      if (!h.moved) convRefused++;
      const t = live.entryBlockType || 'unknown';
      convTypes[t] = (convTypes[t] || 0) + 1;
    }
    const entryEmpty = ((h.entry && h.entry.blockers) || []).length === 0;
    if (entryEmpty === !!h.moved) entryAgree++;
    if (live.allow === oldAllow) liveEqualsOld++;
    if (live.carveOutUsed) carveOutFires++;
    if (h._seed === 69502 && h.from && h.from.x === 7 && h.from.y === 2 && h.to && h.to.x === 7 && h.to.y === 1) hop69502 = { hop: h, live };
  }
  check('BEFORE/AFTER fidelity: live-allow hops all moved 25/25', livePass === 25 && livePassMoved === 25, { livePass, livePassMoved });
  check('BEFORE/AFTER vetoes: every E-fail hop still vetoed 6/6', eFail === 6 && eFailLiveVetoed === 6, { eFail, eFailLiveVetoed });
  check('BEFORE/AFTER conversions: 6, all engine-refused', conversions === 6 && convRefused === 6, { conversions, convRefused, convTypes });
  check('BEFORE/AFTER conversions: 5 creek + 1 washed_out', convTypes.creek === 5 && convTypes.washed_out === 1, convTypes);
  check('BEFORE/AFTER entry agreement 37/37', entryAgree === 37, entryAgree);
  check('BEFORE/AFTER live == validated allow\' on all 37 hops', liveEqualsOld === 37, liveEqualsOld);
  check('BEFORE/AFTER carve-out fires 0 times on validated corpus', carveOutFires === 0, carveOutFires);
  check('BEFORE/AFTER 69502 hop: E pass, creek entry, refused, live-vetoed',
    !!hop69502 && hop69502.live.eOk === true && hop69502.live.entryBlocked === true
    && hop69502.live.entryBlockType === 'creek' && hop69502.hop.moved === false
    && hop69502.live.allow === false, hop69502 && hop69502.live);
}

// --- Stub Game for live installGuard ---
function stubGame(blockFn, origin) {
  const tiles = [];
  for (let y = 0; y < 9; y++) { const row = []; for (let x = 0; x < 9; x++) row.push({}); tiles.push(row); }
  const sayLines = [];
  let origCalls = 0;
  const Game = {
    map: { tiles, px: origin.x, py: origin.y },
    state: { village: { px: 4, py: 4 } },
    over: false,
    inCombat() { return false; },
    tileAt(x, y) {
      if (y < 0 || y >= 9 || x < 0 || x >= 9) return null;
      return { revealed: true, type: 'meadow', stock: 0 };
    },
    travelBlockage(x, y, fx, fy) { return blockFn(x, y, fx, fy); },
    say(line) { sayLines.push(line); },
    travelTo(x, y) { origCalls++; return { moved: true }; },
    _sayLines: sayLines,
    _origCalls() { return origCalls; },
  };
  return Game;
}
function guardedHop(blockFn, origin, dest) {
  const Game = stubGame(blockFn, origin);
  const ctx = {};
  const restore = hs.installGuard(Game, ctx, {});
  const ret = Game.travelTo(dest.x, dest.y);
  restore();
  const log = ctx.homewardstepHopLog || [];
  return { Game, ctx, ret, log: log[log.length - 1] || null, sayLines: Game._sayLines, origCalls: Game._origCalls() };
}
const none = () => null;
const ESCAPE_LINE = "You don't walk there — you couldn't get home from there.";

// --- (b) Live installGuard behavior ---
{
  // Clean hop: allowed, orig called, nothing said.
  const r = guardedHop(none, { x: 4, y: 4 }, { x: 5, y: 4 });
  check('live clean hop allowed', r.origCalls === 1 && r.sayLines.length === 0, { origCalls: r.origCalls, sayLines: r.sayLines });
  check('live clean hop log allowPrime true', r.log && r.log.allowPrime === true, r.log);
}
{
  // Creek entry, E passes: vetoed with the ENTRY line, never escape line.
  const block = (x, y, fx, fy) => ((x === 5 && y === 4 && fx === 4 && fy === 4) ? { blockType: 'creek' } : null);
  const r = guardedHop(block, { x: 4, y: 4 }, { x: 5, y: 4 });
  check('live creek entry vetoed', r.origCalls === 0 && r.log && r.log.vetoed === true, { origCalls: r.origCalls, log: r.log });
  check('live creek entry cause=entry', r.log && r.log.vetoCause === 'entry', r.log);
  check('live creek entry line names the creek, not the escape line',
    r.sayLines.length === 1 && r.sayLines[0].indexOf('creek runs fast') >= 0 && r.sayLines[0] !== ESCAPE_LINE, r.sayLines);
}
{
  // Washed-out entry: vetoed with the washed-out entry line.
  const block = (x, y, fx, fy) => ((x === 5 && y === 4 && fx === 4 && fy === 4) ? { blockType: 'washed_out' } : null);
  const r = guardedHop(block, { x: 4, y: 4 }, { x: 5, y: 4 });
  check('live washed_out entry vetoed with washed-out line',
    r.origCalls === 0 && r.sayLines.length === 1 && r.sayLines[0].indexOf('washed out') >= 0, r.sayLines);
}
{
  // Fallen-tree entry: vetoed with the fallen-tree entry line.
  const block = (x, y, fx, fy) => ((x === 5 && y === 4 && fx === 4 && fy === 4) ? { blockType: 'fallen_tree' } : null);
  const r = guardedHop(block, { x: 4, y: 4 }, { x: 5, y: 4 });
  check('live fallen_tree entry vetoed with fallen-tree line',
    r.origCalls === 0 && r.sayLines.length === 1 && r.sayLines[0].indexOf('fallen tree') >= 0, r.sayLines);
}
{
  // Escape failure (everything blocked): vetoed with the ESCAPE line verbatim.
  const block = () => ({ blockType: 'creek' });
  const r = guardedHop(block, { x: 4, y: 4 }, { x: 5, y: 4 });
  check('live escape failure vetoed with escape line verbatim',
    r.origCalls === 0 && r.sayLines.length === 1 && r.sayLines[0] === ESCAPE_LINE, r.sayLines);
  check('live escape failure cause=escape', r.log && r.log.vetoCause === 'escape', r.log);
}
{
  // Rubble entry, E spent no credit: carve-out ALLOWS the hop.
  const block = (x, y, fx, fy) => ((x === 5 && y === 4 && fx === 4 && fy === 4) ? { blockType: 'rubble' } : null);
  const r = guardedHop(block, { x: 4, y: 4 }, { x: 5, y: 4 });
  check('live rubble entry allowed via carve-out (E credit unused)',
    r.origCalls === 1 && r.sayLines.length === 0, { origCalls: r.origCalls, sayLines: r.sayLines });
  check('live rubble entry log carveOutUsed true', r.log && r.log.carveOutUsed === true && r.log.allowPrime === true, r.log);
  check('live rubble entry ctx counter', r.ctx.homewardstepEntryCreditUses === 1, r.ctx.homewardstepEntryCreditUses);
}
{
  // Veto memory unchanged: second veto of the same destination is silent.
  const block = (x, y, fx, fy) => ((x === 5 && y === 4 && fx === 4 && fy === 4) ? { blockType: 'creek' } : null);
  const Game = stubGame(block, { x: 4, y: 4 });
  const ctx = {};
  const restore = hs.installGuard(Game, ctx, {});
  Game.travelTo(5, 4);
  Game.travelTo(5, 4);
  restore();
  check('live veto memory: first speaks, repeat silent',
    Game._sayLines.length === 1 && ctx.homewardstepVetoes === 2 && ctx.homewardstepSilentVetoes === 1,
    { sayLines: Game._sayLines, vetoes: ctx.homewardstepVetoes, silent: ctx.homewardstepSilentVetoes });
}

// --- (c) Shared-pool rule at unit level (via live allowPrimeForHop) ---
{
  const rubble = (x, y, fx, fy) => ((x === 5 && y === 4 && fx === 4 && fy === 4) ? { blockType: 'rubble' } : null);
  const Game = stubGame(rubble, { x: 4, y: 4 });
  // E spent the credit on the way home: rubble entry vetoes.
  const spent = hs.allowPrimeForHop(Game, 4, 4, 5, 4, { ok: true, creditUsed: 1 });
  check('carve-out: rubble entry vetoes when E already spent the credit',
    spent.allow === false && spent.carveOutUsed === false, spent);
  // E spent nothing: rubble entry passes on the shared credit.
  const free = hs.allowPrimeForHop(Game, 4, 4, 5, 4, { ok: true, creditUsed: 0 });
  check('carve-out: rubble entry passes when E spent no credit',
    free.allow === true && free.carveOutUsed === true, free);
  // E failed: rubble entry still vetoes (carve-out never rescues E).
  const efail = hs.allowPrimeForHop(Game, 4, 4, 5, 4, { ok: false, creditUsed: 0 });
  check('carve-out: E failure still vetoes under rubble entry', efail.allow === false, efail);
}
{
  // Non-rubble entry never uses the carve-out, even with credit free.
  const creek = (x, y, fx, fy) => ((x === 5 && y === 4 && fx === 4 && fy === 4) ? { blockType: 'creek' } : null);
  const Game = stubGame(creek, { x: 4, y: 4 });
  const r = hs.allowPrimeForHop(Game, 4, 4, 5, 4, { ok: true, creditUsed: 0 });
  check('carve-out: creek entry never passes on credit', r.allow === false && r.carveOutUsed === false, r);
  check('vetoLineForEntry: creek line', hs.vetoLineForEntry(r.entryBlockers).indexOf('creek runs fast') >= 0, hs.vetoLineForEntry(r.entryBlockers));
  check('vetoLineForEntry: rubble line', hs.vetoLineForEntry([{ blockType: 'rubble' }]).indexOf('rubble chokes') >= 0);
  check('vetoLineForEntry: unknown fallback', hs.vetoLineForEntry([]).indexOf("can't get in") >= 0);
}
{
  // Multi-tile rubble entries never use the carve-out (attemptHop rule:
  // single distinct tile only). Two rubble blockers on two tiles.
  const core = hs.allowFromParts(true, 0, [
    { x: 5, y: 4, blockType: 'rubble' }, { x: 6, y: 4, blockType: 'rubble' },
  ]);
  check('carve-out: two-tile rubble entry vetoes', core.allow === false && core.carveOutUsed === false, core);
  const mixed = hs.allowFromParts(true, 0, [
    { x: 5, y: 4, blockType: 'rubble' }, { x: 5, y: 4, blockType: 'creek' },
  ]);
  check('carve-out: mixed rubble+creek entry vetoes', mixed.allow === false, mixed);
}

// --- (d) Scope guard: only the live guard file changes ---
{
  const guarded = [
    'scripts/policies/competent-guarde-entry-b.js',
    'scripts/policies/competent.js',
    'scripts/policies/competent-homewardstep-outwardonly-b.js',
    'scripts/policies/competent-latescape-b.js',
    'scripts/creekhop-b-recorder.js',
  ];
  let clean = true, detail = {};
  for (const f of guarded) {
    try {
      const out = execSync('git status --porcelain -- ' + f, { cwd: ROOT, encoding: 'utf8' }).trim();
      detail[f] = out;
      if (out) clean = false;
    } catch (e) { clean = false; detail[f] = 'error'; }
  }
  try {
    const srcDiff = execSync('git status --porcelain -- src/js', { cwd: ROOT, encoding: 'utf8' }).trim();
    detail['src/js'] = srcDiff;
    if (srcDiff) clean = false;
  } catch (e) { clean = false; detail['src/js'] = 'error'; }
  check('scope: variant, competent.js, sibling guards, recorder, src/js unmodified', clean, detail);
  const changed = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf8' }).split('\n').filter((l) => l.trim()).map((l) => l.slice(3)).sort();
  check('scope: working tree holds only guard + this proof + dated evidence',
    changed.every((f) => f === 'scripts/policies/competent-homewardstep-b.js' || f === 'scripts/test-guarde-entry-deploy-b.js' || f.startsWith('evidence/2026-11-02/')),
    changed);
}

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
