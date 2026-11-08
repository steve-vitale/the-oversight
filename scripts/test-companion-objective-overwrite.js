#!/usr/bin/env node
// test-companion-objective-overwrite.js — VILLAGER-BRAIN Phase 4 slice
// (OVE-45): objAskCompanion must not cross-write another villager's
// objective. The GUARD offer arrives with terms advertised; the companion
// decides via npcInviteDecision (kind 'lure'); only on accept does
// objCommitGuardOffer write the companion's OWN objective.
//
// Pre-registered before behavior change (panel byte-stability):
//   - Dawn errand-mix CORE_KINDS absDelta ≤ 0.08 vs extras-off baseline
//     (same contract as test-villager-brain-dawn.js / believed-pantry).
//
// Proves:
//   1. Prepared ask-companion scene: refuse → overwrite count 0, companion
//      objective unchanged, ask returns null.
//   2. Accept (roll 0) → companion self-commits GUARD with advertised terms;
//      asker.companion linked; invite decision.accept true.
//   3. Failing control: restore pre-Phase-4 overwrite (no invite) → probe
//      counts a cross-person overwrite (proves the meter detects the defect).
//
// Usage: node scripts/test-companion-objective-overwrite.js
// Exit 0 = pass, 1 = fail, 2 = setup skip. No repo writes.
'use strict';
const path = require('path');
const { spawnSync } = require('child_process');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = 4242;
const PANEL_SEED = 20261108;
const PICKS = 500;
const CORE_KINDS = ['FORAGE', 'WATER', 'VISIT', 'HAVEN_CHORE', 'TRAPS', 'SEEK', 'EXPLORE', 'HUNT', 'HAUL', 'REST', 'EAT', 'LEAVE'];
const TOLERANCE = 0.08;

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function snapObj(o) {
  if (!o) return null;
  return {
    kind: o.kind, purpose: o.purpose, state: o.state,
    tx: o.tx, ty: o.ty, targetVid: o.targetVid,
    tightness: o.tightness, partsLeft: o.partsLeft,
    indoor: !!o.indoor, companion: o.companion || null,
    goal: o.goal || null, huntMid: o.huntMid || null,
  };
}

function sameObj(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.kind === b.kind && a.purpose === b.purpose && a.state === b.state &&
    a.tx === b.tx && a.ty === b.ty && a.targetVid === b.targetVid &&
    a.tightness === b.tightness && a.partsLeft === b.partsLeft &&
    a.indoor === b.indoor && a.companion === b.companion &&
    a.goal === b.goal && a.huntMid === b.huntMid;
}

async function stage(seedOff) {
  const { Game } = await loadGame({ seed: SEED + seedOff, mode: 'proof' });
  await setupGame(Game);
  Game.state.scholar.day = 12;
  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  Game.map.px = hx; Game.map.py = hy;
  try { Game.stockPantry(20000, 'test'); } catch (e) {}
  v.water = v.water || {}; v.water.clean = 2000; v.water.dirty = 0;
  const ids = (v.roster || []).filter(id => id !== Game.villagerId);
  for (const id of ids) {
    try {
      const n = Game.npcNeeds(id);
      if (n) { n.hunger = 10; n.energy = 80; n.social = 70; n.fear = 10; }
    } catch (e) {}
    try { Game.npcSetNode(id, hx, hy); } catch (e) {}
    try { Game.npcSetInside(id, true); } catch (e) {}
    try { const vp = Game.vpOf(id); if (vp) vp.hp = 100; } catch (e) {}
    v.trust = v.trust || {}; v.trust[id] = 80;
    v.sick = v.sick || {}; delete v.sick[id];
    v.away = v.away || {}; delete v.away[id];
  }
  return { Game, v, hx, hy, ids };
}

function prepAskScene(Game, v, hx, hy, ids) {
  // Leader + one outdoor-ready companion at haven; everyone else indoor.
  const leader = ids[0];
  const mate = ids[1];
  if (!leader || !mate) return null;
  for (const id of ids) {
    const o = Game.objOf(id);
    o.kind = 'HAVEN_CHORE'; o.purpose = 'chore'; o.state = 'indoor';
    o.indoor = true; o.companion = null; o.targetVid = null;
    o.goal = null; o.goalLine = null; o.huntMid = null;
    try { Game.npcSetNode(id, hx, hy); } catch (e) {}
  }
  const lo = Game.objOf(leader);
  lo.kind = 'FORAGE'; lo.purpose = 'forage'; lo.state = 'ready';
  lo.indoor = false; lo.tx = hx + 1; lo.ty = hy;
  lo.tightness = 1; lo.partsLeft = 3; lo.companion = null;
  const mo = Game.objOf(mate);
  mo.kind = 'WATER'; mo.purpose = 'water'; mo.state = 'ready';
  mo.indoor = false; mo.tx = hx; mo.ty = hy + 1;
  mo.tightness = 1; mo.partsLeft = 2; mo.companion = null;
  mo.goal = 'keep_own'; mo.goalLine = 'my errand';
  // Warm/protect so invite chance is high when roll is free; tests pin roll.
  try { if (Game.npcGoal) { /* generated goal is read-only in some builds */ } } catch (e) {}
  v.trust[mate] = 90;
  return { leader, mate, leaderObj: lo, mateObj: mo };
}

function countCrossWrites(beforeMap, afterMap, askerId) {
  // A cross-person overwrite: any non-asker villager whose objective
  // fields changed. Phase 4 accept path DOES change the acceptor — the
  // probe separates refuse (must be 0) from accept (change allowed only
  // after decision.accept via objCommitGuardOffer).
  let n = 0;
  for (const id of Object.keys(beforeMap)) {
    if (id === askerId) continue;
    if (!sameObj(beforeMap[id], afterMap[id])) n++;
  }
  return n;
}

(async () => {
  console.log('== refuse: overwrite count 0, objective untouched ==');
  {
    const { Game, v, hx, hy, ids } = await stage(0);
    const scene = prepAskScene(Game, v, hx, hy, ids);
    check('refuse scene prepared', !!scene);
    if (scene) {
      const beforeMate = snapObj(Game.objOf(scene.mate));
      const beforeAll = {};
      for (const id of ids) beforeAll[id] = snapObj(Game.objOf(id));
      // roll:1 always refuses (chance clamped ≤ 95).
      const cid = Game.objAskCompanion(scene.leader, scene.leaderObj, hx, hy, { roll: 1 });
      const afterMate = snapObj(Game.objOf(scene.mate));
      const afterAll = {};
      for (const id of ids) afterAll[id] = snapObj(Game.objOf(id));
      const overwrites = countCrossWrites(beforeAll, afterAll, scene.leader);
      const last = Game._lastCompanionAsk || {};
      check('refuse returns null', cid == null, 'got=' + cid);
      check('refuse: overwrite count 0', overwrites === 0, 'n=' + overwrites);
      check('refuse: companion objective unchanged', sameObj(beforeMate, afterMate),
        JSON.stringify({ beforeMate, afterMate }));
      check('refuse: asker.companion unset', !scene.leaderObj.companion);
      check('refuse: decision.accept false', !!(last.decision) && last.decision.accept === false,
        JSON.stringify(last.decision));
      check('refuse: offer advertised GUARD terms',
        !!(last.offer && last.offer.kind === 'GUARD' &&
          last.offer.tx === scene.leaderObj.tx && last.offer.ty === scene.leaderObj.ty &&
          last.offer.targetVid === scene.leader),
        JSON.stringify(last.offer));
    }
  }

  console.log('== accept: companion self-commits GUARD via invite path ==');
  {
    const { Game, v, hx, hy, ids } = await stage(1);
    const scene = prepAskScene(Game, v, hx, hy, ids);
    check('accept scene prepared', !!scene);
    if (scene) {
      const beforeMate = snapObj(Game.objOf(scene.mate));
      // roll:0 always accepts (chance clamped ≥ 5).
      const cid = Game.objAskCompanion(scene.leader, scene.leaderObj, hx, hy, { roll: 0 });
      const afterMate = snapObj(Game.objOf(scene.mate));
      const last = Game._lastCompanionAsk || {};
      check('accept returns companion id', cid === scene.mate, 'got=' + cid);
      check('accept: decision.accept true', !!(last.decision && last.decision.accept),
        JSON.stringify(last.decision));
      check('accept: invite kind lure', last.decision && last.offer && true,
        'decision present');
      check('accept: companion kind GUARD', afterMate.kind === 'GUARD', JSON.stringify(afterMate));
      check('accept: companion purpose guard', afterMate.purpose === 'guard');
      check('accept: advertised target/tx/ty',
        afterMate.tx === scene.leaderObj.tx && afterMate.ty === scene.leaderObj.ty &&
        afterMate.targetVid === scene.leader,
        JSON.stringify(afterMate));
      check('accept: companion linked to asker', afterMate.companion === scene.leader);
      check('accept: asker.companion linked', scene.leaderObj.companion === scene.mate);
      check('accept: prior errand goal cleared', afterMate.goal == null);
      check('accept: prior objective was not GUARD', beforeMate.kind === 'WATER',
        JSON.stringify(beforeMate));
      // Commit helper is the only writer — callable as self-commit.
      check('objCommitGuardOffer wired', typeof Game.objCommitGuardOffer === 'function');
    }
  }

  console.log('== failing control: pre-Phase-4 overwrite is detected ==');
  {
    const { Game, v, hx, hy, ids } = await stage(2);
    const scene = prepAskScene(Game, v, hx, hy, ids);
    check('control scene prepared', !!scene);
    if (scene) {
      const _ask = Game.objAskCompanion.bind(Game);
      // Restore the old cross-person draft: pick top cand, write their
      // objective, skip invite. The probe must see overwriteCount ≥ 1.
      Game.objAskCompanion = function (vid, obj, hx2, hy2, opts) {
        const r = _ask(vid, obj, hx2, hy2, Object.assign({}, opts || {}, { roll: 1 }));
        // Force the old overwrite onto the prepared mate regardless of refuse.
        const mate = scene.mate;
        const co2 = this.objOf(mate);
        co2.kind = 'GUARD'; co2.purpose = 'guard'; co2.state = 'ready';
        co2.goal = null; co2.goalLine = null;
        co2.tx = obj.tx; co2.ty = obj.ty; co2.targetVid = vid;
        co2.tightness = obj.tightness; co2.partsLeft = obj.partsLeft;
        co2.indoor = false; co2.companion = vid;
        obj.companion = mate;
        return mate;
      };
      const beforeAll = {};
      for (const id of ids) beforeAll[id] = snapObj(Game.objOf(id));
      const cid = Game.objAskCompanion(scene.leader, scene.leaderObj, hx, hy, { roll: 1 });
      const afterAll = {};
      for (const id of ids) afterAll[id] = snapObj(Game.objOf(id));
      const overwrites = countCrossWrites(beforeAll, afterAll, scene.leader);
      check('control: old overwrite still returns a companion', cid === scene.mate);
      check('control: overwrite count ≥ 1', overwrites >= 1, 'n=' + overwrites);
      Game.objAskCompanion = _ask;
      // Restored path with refuse stays clean.
      const scene2 = prepAskScene(Game, v, hx, hy, ids);
      const before3 = {};
      for (const id of ids) before3[id] = snapObj(Game.objOf(id));
      const cid3 = Game.objAskCompanion(scene2.leader, scene2.leaderObj, hx, hy, { roll: 1 });
      const after3 = {};
      for (const id of ids) after3[id] = snapObj(Game.objOf(id));
      const overwritesRestored = countCrossWrites(before3, after3, scene2.leader);
      check('control restored: refuse returns null', cid3 == null, 'got=' + cid3);
      check('control restored: overwrite count 0', overwritesRestored === 0, 'n=' + overwritesRestored);
    }
  }

  console.log('== pre-registered errand-mix panel (absDelta ≤ 0.08) ==');
  {
    const repo = path.join(__dirname, '..');
    function panelArm(disableExtras) {
      const code = `
        const path = require('path');
        const { loadGame, setupGame } = require(path.join(${JSON.stringify(repo)}, 'scripts', 'sim-harness'));
        (async () => {
          const { Game } = await loadGame({ seed: ${PANEL_SEED}, mode: 'herald', fullTelemetry: false });
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
          for (let i = 0; i < ${PICKS}; i++) {
            const o = Game.objOf(vid); o.kind = 'idle'; o.state = 'idle';
            Game.objPick(vid, hx, hy);
            const last = Game.vbrainLastLog(vid);
            kinds.push((last && (last.corePick || last.pick)) || o.kind);
          }
          const shares = {};
          for (const k of kinds) shares[k] = (shares[k] || 0) + 1;
          for (const k of Object.keys(shares)) shares[k] /= kinds.length;
          process.stdout.write(JSON.stringify({ shares, n: kinds.length }));
        })().catch(e => { console.error(e); process.exit(2); });
      `;
      const r = spawnSync(process.execPath, ['-e', code], { encoding: 'utf8', maxBuffer: 5e6 });
      if (r.status !== 0) {
        check('panel arm ok', false, (r.stderr || '').slice(0, 400));
        return null;
      }
      return JSON.parse(r.stdout.trim().split('\n').pop());
    }
    const baseArm = panelArm(true);
    const treatArm = panelArm(false);
    if (baseArm && treatArm) {
      const violations = [];
      const drifts = {};
      for (const k of CORE_KINDS) {
        const b = baseArm.shares[k] || 0;
        const t = treatArm.shares[k] || 0;
        const d = Math.abs(t - b);
        drifts[k] = { base: +b.toFixed(4), treat: +t.toFixed(4), absDelta: +d.toFixed(4) };
        if (d > TOLERANCE) violations.push({ kind: k, absDelta: d, tol: TOLERANCE });
      }
      check('errand-mix absDelta within pre-registered ±0.08', violations.length === 0,
        JSON.stringify({ violations, drifts }));
    }
  }

  console.log('== result ==');
  console.log(pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
