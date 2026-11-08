#!/usr/bin/env node
// test-villager-brain-dawn.js — phase-1 dawn scorer proof (VILLAGER-BRAIN).
//
 // Proves:
 //   1. One scoring entry is wired (vbrainScorePick / vbrainLogGate).
 //   2. Every dawn pick (gate + lottery) leaves a log that names the pick
 //      and at least one consideration.
 //   3. EXPEDITION / win-plan feed the dawn list; agency does not chance-roll
 //      when vbrainOwnsDawn is live.
 //   4. Pre-registered errand-mix panel: core kinds stay inside tolerance
 //      vs a disabled-extras baseline on the same seed (aimed moves are
 //      EXPEDITION + win-plan feeds; FORAGE/WATER/VISIT/HAVEN_CHORE/TRAPS/
 //      SEEK/EXPLORE/HUNT/HAUL shares must hold).
 //
 // Usage: node scripts/test-villager-brain-dawn.js
 // Exit 0 = pass, 1 = fail, 2 = setup skip. No repo writes.
'use strict';
const path = require('path');
const repo = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(repo, 'scripts', 'sim-harness'));

const SEED = 20261108;
const PICKS = 500;
// Pre-registered before the run: absolute share delta vs baseline for kinds
// this change did not aim to move. EXPEDITION is an aimed fold (not checked).
const CORE_KINDS = ['FORAGE', 'WATER', 'VISIT', 'HAVEN_CHORE', 'TRAPS', 'SEEK', 'EXPLORE', 'HUNT', 'HAUL', 'REST', 'EAT', 'LEAVE'];
const TOLERANCE = 0.08; // 8 percentage points absolute

function out(o) { console.log(JSON.stringify(o)); }
function fail(msg, extra) {
  out(Object.assign({ pass: false, fail: msg }, extra || {}));
  process.exit(1);
}

function shareMap(kinds) {
  const counts = {};
  for (const k of kinds) counts[k] = (counts[k] || 0) + 1;
  const shares = {};
  for (const k of Object.keys(counts)) shares[k] = counts[k] / kinds.length;
  return shares;
}

function prepVillage(Game) {
  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy;
  try { Game.stockPantry(20000, 'test'); } catch (e) {}
  v.water = v.water || {}; v.water.clean = 2000; v.water.dirty = 0;
  const ids = (v.roster || []).filter(id => id !== Game.villagerId);
  for (const id of ids) {
    try {
      const n = Game.npcNeeds(id);
      if (n) { n.hunger = 10; n.energy = 80; n.social = 40; n.fear = 10; }
    } catch (e) {}
    try { Game.npcSetNode(id, hx, hy); } catch (e) {}
    try { Game.npcSetInside(id, true); } catch (e) {}
    v.trust = v.trust || {}; v.trust[id] = 50;
  }
  return { v, hx, hy, ids };
}

function pickKinds(Game, vid, hx, hy, n) {
  // Panel uses the CORE lottery pick (log.corePick when an aimed override
  // won, else log.pick). EXPEDITION / win-plan overrides are aimed moves and
  // are counted separately — they must not look like chore/visit drift.
  const kinds = [];
  const aimed = [];
  for (let i = 0; i < n; i++) {
    const o = Game.objOf(vid);
    o.kind = 'idle'; o.state = 'idle'; o.indoor = false;
    const before = (Game.vbrainLogs() || []).length;
    Game.objPick(vid, hx, hy);
    const logs = Game.vbrainLogs() || [];
    const last = logs.length > before ? logs[logs.length - 1] : Game.vbrainLastLog(vid);
    const core = (last && (last.corePick || last.pick)) || o.kind;
    kinds.push(core);
    if (last && last.override) aimed.push({ pick: last.pick, override: last.override, core: last.corePick });
  }
  return { kinds, aimed };
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);

  if (typeof Game.vbrainScorePick !== 'function' || typeof Game.vbrainLogGate !== 'function' ||
      typeof Game.vbrainFeedExtras !== 'function' || typeof Game.vbrainOwnsDawn !== 'function') {
    out({ skip: 'villager-brain API missing' });
    process.exit(2);
  }
  if (!Game.vbrainOwnsDawn()) fail('vbrainOwnsDawn returned false');

  const { v, hx, hy, ids } = prepVillage(Game);
  if (ids.length < 2) { out({ skip: 'roster<2' }); process.exit(2); }
  const vid = ids[0];

  // --- Gate log: low energy forces REST and explains it ---
  try {
    const n = Game.npcNeeds(vid);
    n.energy = 20; n.hunger = 10;
  } catch (e) { fail('needs write failed'); }
  Game.objOf(vid).kind = 'idle';
  Game.objPick(vid, hx, hy);
  const gateLog = Game.vbrainLastLog(vid);
  if (!gateLog || gateLog.mode !== 'gate' || gateLog.pick !== 'REST') {
    fail('gate pick not logged', { gateLog });
  }
  if (!gateLog.candidates || !gateLog.candidates[0] || !gateLog.candidates[0].considerations ||
      !gateLog.candidates[0].considerations.length) {
    fail('gate log missing considerations', { gateLog });
  }
  const commitGate = Game.vbrainCommit(vid);
  if (!commitGate || commitGate.kind !== 'REST') fail('gate commitment missing', { commitGate });

  // Restore body for lottery
  try {
    const n = Game.npcNeeds(vid);
    n.energy = 80; n.hunger = 10; n.social = 40; n.fear = 10;
  } catch (e) {}

  // --- Lottery log: every candidate has considerations; pick is named ---
  if (Game.state.village.vbrain) Game.state.village.vbrain.logs = [];
  Game.objOf(vid).kind = 'idle';
  Game.objPick(vid, hx, hy);
  const lotLog = Game.vbrainLastLog(vid);
  if (!lotLog || (lotLog.mode !== 'lottery' && lotLog.mode !== 'gate')) {
    fail('lottery/gate log missing after objPick', { lotLog });
  }
  if (!lotLog.pick) fail('log pick empty', { lotLog });
  if (!Array.isArray(lotLog.candidates) || !lotLog.candidates.length) {
    fail('log candidates empty', { lotLog });
  }
  for (const c of lotLog.candidates) {
    if (!c.considerations || !c.considerations.length) {
      fail('candidate missing considerations', { kind: c.kind, c });
    }
  }

  // --- Feeder presence: EXPEDITION offered for a ranger profile ---
  let fed = [];
  const cands = [{ kind: 'HAVEN_CHORE', w: 1.4 }];
  try {
    const a = Game.agencyState();
    a.profiles = a.profiles || {};
    a.profiles[vid] = 'explorer';
  } catch (e) {}
  Game.vbrainDisableExtras = false;
  Game.vbrainFeedExtras(vid, cands, hx, hy);
  fed = cands.map(c => c.kind);
  const expedFed = fed.indexOf('EXPEDITION') !== -1;
  if (!expedFed) fail('EXPEDITION not fed for explorer profile', { fed });

  // Force an indoor core pick + hash-eligible expedition into the log once.
  Game.state.village.vbrain.logs = [];
  const forced = [
    { kind: 'HAVEN_CHORE', w: 1.0 },
    { kind: 'EXPEDITION', w: 9.0, vbrainSrc: 'agency_range',
      considerations: [{ id: 'range_profile', raw: 1, note: 'explorer' }] },
  ];
  // Salt the hash by retrying days until override fires or give up.
  let sawOverride = false;
  for (let d = 0; d < 40 && !sawOverride; d++) {
    try { Game.state.scholar.day = 10 + d; } catch (e) {}
    Game.state.village.vbrain.logs = [];
    const picked = Game.vbrainScorePick(vid, forced.map(c => Object.assign({}, c)), { rng: () => 0.01 });
    const L = Game.vbrainLastLog(vid);
    if (L && L.override === 'expedition_hash' && L.pick === 'EXPEDITION' && L.corePick === 'HAVEN_CHORE') {
      sawOverride = true;
      // Scorer still returns the core lottery kind so chore/facing draws stay
      // on the legacy stream; commitment is EXPEDITION. objPick then aligns.
      if (!picked || picked.kind !== 'HAVEN_CHORE') fail('scorer must return core pick for RNG stream', { picked, L });
      const c = Game.vbrainCommit(vid);
      if (!c || c.kind !== 'EXPEDITION') fail('override commit should be EXPEDITION', { c, L });
      const aligned = { kind: 'HAVEN_CHORE', purpose: 'chore', indoor: true, state: 'indoor', chore: 'fire' };
      Game.vbrainAlignObjective(vid, aligned, hx, hy);
      if (aligned.kind !== 'EXPEDITION' || !aligned.indoor || aligned.purpose !== 'chore') {
        fail('align must rewrite objective to EXPEDITION hold', { aligned, L });
      }
    }
  }
  if (!sawOverride) fail('expedition_hash override never fired across day salts');

  // --- Agency: with brain live, chance-roll path is not taken ---
  try {
    const br = Game.state.village.vbrain;
    br.commit[vid] = { kind: 'HAVEN_CHORE', day: (Game.state.scholar || {}).day || 0, winPlanAction: 'gear_hold' };
    const ex = Game.vbrainExecuteDepart(vid, hx, hy, false);
    if (ex !== 'hold') fail('gear_hold commit should hold', { ex });
  } catch (e) { fail('vbrainExecuteDepart threw', { err: String(e && e.message || e) }); }

  // Static seam check: agencyTick must not chance-roll when brain owns dawn.
  const agencySrc = require('fs').readFileSync(path.join(repo, 'src/js/villager-agency.js'), 'utf8');
  if (!/vbrainOwnsDawn/.test(agencySrc) || !/vbrainExecuteDepart/.test(agencySrc)) {
    fail('agencyTick missing brain dawn hooks');
  }
  if (!/if \(typeof this\.vbrainOwnsDawn === 'function' && this\.vbrainOwnsDawn\(\)\)/.test(agencySrc)) {
    fail('agencyTick missing vbrainOwnsDawn guard around chance roll');
  }

  // --- Pre-registered errand-mix panel ---
  // Two fresh harness loads (harness rule: never two in one process). Spawn
  // child processes so baseline/treatment share the same seed and setup.
  const { spawnSync } = require('child_process');
  function panelArm(disableExtras) {
    const code = `
      const path = require('path');
      const { loadGame, setupGame } = require(path.join(${JSON.stringify(repo)}, 'scripts', 'sim-harness'));
      (async () => {
        const { Game } = await loadGame({ seed: ${SEED}, mode: 'herald', fullTelemetry: false });
        await setupGame(Game);
        const v = Game.state.village; const hx = v.px ?? 4, hy = v.py ?? 4;
        try { Game.stockPantry(20000, 'test'); } catch (e) {}
        v.water = v.water || {}; v.water.clean = 2000; v.water.dirty = 0;
        const ids = (v.roster || []).filter(id => id !== Game.villagerId);
        for (const id of ids) {
          try { const n = Game.npcNeeds(id); if (n) { n.hunger = 10; n.energy = 80; n.social = 40; n.fear = 10; } } catch (e) {}
          try { Game.npcSetNode(id, hx, hy); } catch (e) {}
          v.trust = v.trust || {}; v.trust[id] = 50;
        }
        const vid = ids[0];
        Game.vbrainDisableExtras = ${disableExtras ? 'true' : 'false'};
        const kinds = [];
        let aimed = 0, exped = 0;
        for (let i = 0; i < ${PICKS}; i++) {
          const o = Game.objOf(vid); o.kind = 'idle'; o.state = 'idle';
          Game.objPick(vid, hx, hy);
          const last = Game.vbrainLastLog(vid);
          kinds.push((last && (last.corePick || last.pick)) || o.kind);
          if (last && last.override) aimed++;
          if (last && last.pick === 'EXPEDITION') exped++;
        }
        const shares = {};
        for (const k of kinds) shares[k] = (shares[k] || 0) + 1;
        for (const k of Object.keys(shares)) shares[k] /= kinds.length;
        process.stdout.write(JSON.stringify({ shares, aimed, exped, n: kinds.length }));
      })().catch(e => { console.error(e); process.exit(2); });
    `;
    const r = spawnSync(process.execPath, ['-e', code], { encoding: 'utf8', maxBuffer: 5e6 });
    if (r.status !== 0) fail('panel arm failed', { disableExtras, stderr: (r.stderr || '').slice(0, 500), status: r.status });
    return JSON.parse(r.stdout.trim().split('\n').pop());
  }

  const baseArm = panelArm(true);
  const treatArm = panelArm(false);
  const drifts = {};
  const violations = [];
  for (const k of CORE_KINDS) {
    const b = baseArm.shares[k] || 0;
    const t = treatArm.shares[k] || 0;
    const d = Math.abs(t - b);
    drifts[k] = { base: +b.toFixed(4), treat: +t.toFixed(4), absDelta: +d.toFixed(4) };
    if (d > TOLERANCE) violations.push({ kind: k, absDelta: d, tol: TOLERANCE });
  }
  const expedRate = treatArm.n ? treatArm.exped / treatArm.n : 0;

  if (violations.length) {
    fail('errand-mix drifted outside pre-registered tolerance', { violations, drifts, expedRate });
  }

  out({
    pass: true,
    seed: SEED,
    picks: PICKS,
    tolerance: TOLERANCE,
    gate: { pick: gateLog.pick, gate: gateLog.gate },
    lotterySample: { pick: lotLog.pick, nCands: lotLog.candidates.length, src: lotLog.pickSrc },
    expedFed: expedFed,
    expedRate: +expedRate.toFixed(4),
    aimedOverrides: treatArm.aimed,
    drifts,
    logCount: Game.vbrainLogs().length,
    commit: Game.vbrainCommit(vid),
  });
})().catch(e => {
  console.error(e);
  process.exit(1);
});
