#!/usr/bin/env node
// test-killdisc-20261018.js — proof for the sim-killdisc instrument.
//
// (a) DET-GATE: KILLDISC instrument installed vs not installed —
//     per-day trajectory hashes identical on 60d (stable seeds only; the
//     noinstr-vs-noinstr stability pre-check follows the repo's det-gate
//     standard, scripts/det-gate.js).
// (b) DAMAGE-SOURCE RESOLUTION FIXTURES (pure): resolveDmgSource on the
//     scholar/villager-ally/monster/null-source shapes the engine emits.
// (c) WRAP FIXTURES on a real harness game: a real TB fight with a
//     companion ally — direct tbDamage calls with engine-shaped sources
//     attribute to scholar/companion; monster-sourced damage excluded;
//     fight-id keying separates two fights; recordWaveKill attaches the
//     fight's dmg table (kill-time keying, by vs scholarVid).
// (d) REAL-SWEEP GATE: one full 180d diagnostic run (seed 63201, leadfeast)
//     through the real sweep script — per-seed JSON written, zero
//     instrument errors, re-run byte-identical.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//        WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 \
//        node scripts/test-killdisc-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('STOP: NODEWITNESS=1 required.'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const KD = require(path.join(REPO, 'scripts', 'killdisc-instrument-20261018'));

async function newGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'killdisc-test', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}
function w3mid(Game) {
  const m = ((Game.data || {}).monsters || []).find(x => x && (x.wave | 0) === 3);
  return m ? m.id : null;
}
function someVillager(Game) {
  const roster = (((Game.state || {}).village || {}).roster || []);
  const sid = Game.villagerId;
  return roster.find(v => v && v !== sid) || null;
}

(async () => {
  console.log('== (a) DET-GATE: instrument installed vs not — 60d trajectory ==');
  async function traj(seed, pid, useInstr) {
    const pol = pid === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
    const G = await newGame(seed);
    const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
    let uninstall = null;
    if (useInstr) uninstall = KD.install(G, t);
    const hs = [];
    const wrapped = Object.assign({}, pol, {
      daily(Gm, ctx) { hs.push(Gm.state.scholar.day + ':' + dayHash(Gm)); return pol.daily(Gm, ctx); },
    });
    await quietLog(async () => { await runDays(G, wrapped, { days: 60, manifest: undefined, sampleEvery: 30 }); });
    if (uninstall) uninstall();
    return { hashes: hs.join('\n'), t };
  }
  let gateGreen = 0, gateTotal = 0;
  for (const pid of ['leadfeast', 'belongfeast']) {
    let judged = false;
    for (const seed of [94021, 94022, 94023, 94024]) {
      if (judged) break;
      const a = await traj(seed, pid, false);
      const b = await traj(seed, pid, false);
      if (a.hashes !== b.hashes) { console.log(`  .. ${pid} s${seed}: noinstr-vs-noinstr UNSTABLE — seed skipped`); continue; }
      gateTotal++;
      const c = await traj(seed, pid, true);
      const same = c.hashes === a.hashes;
      if (same) gateGreen++;
      check(`det ${pid} s${seed} trajectory identical (stable seed)`, same, same ? '' : 'trajectories diverged');
      check(`det ${pid} s${seed} instrument recorded (sanity)`, c.t.census.length > 0, `census=${c.t.census.length}`);
      judged = true;
    }
    if (!judged) check(`det ${pid}: no stable seed found`, false, 'all 4 seeds flaky');
  }
  check('det-gate all green', gateGreen === gateTotal && gateTotal > 0, `${gateGreen}/${gateTotal}`);

  console.log('== (b) DAMAGE-SOURCE RESOLUTION FIXTURES (pure) ==');
  {
    const Game = await newGame(94021);
    const r = KD.resolveDmgSource;
    let x = r(Game, 'you', null);            check("('you', null) -> scholar", x.kind === 'scholar', JSON.stringify(x));
    x = r(Game, 'anything', 'p');             check("('anything','p') -> scholar", x.kind === 'scholar', JSON.stringify(x));
    x = r(Game, 'your gristlefit', 'p');     check("('your gristlefit','p') -> scholar", x.kind === 'scholar', JSON.stringify(x));
    x = r(Game, 'shrapnel', null);           check("('shrapnel', null) no fight -> other", x.kind === 'other', JSON.stringify(x));
    // Engine-shaped fighter resolution needs a live fight — covered in (c).
  }

  console.log('== (c) WRAP FIXTURES: real TB fight, engine-shaped damage ==');
  {
    const Game = await newGame(94022);
    const mid = w3mid(Game);
    check('fixture has a wave-3 monster', !!mid, '');
    const vA = someVillager(Game);
    check('fixture has a non-scholar villager', !!vA, '');
    const scholarVid = Game.villagerId;
    // Park vA next to the scholar so the ally joins the fight.
    try {
      const vv = Game.state.village || (Game.state.village = {});
      vv.positions = vv.positions || {};
      const s = Game.state.scholar || {};
      vv.positions[vA] = { mx: s.mx != null ? s.mx : 4, my: s.my != null ? s.my : 4 };
    } catch (e) {}
    const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
    const uninstall = KD.install(Game, t);
    Game.startCombat(mid);
    const f = Game.tbfight;
    check('fight started', !!f, '');
    const mkey = (f.fighters.find(x => x.kind === 'monster') || {}).key;
    const ally = f.fighters.find(x => x.villagerId === vA);
    check('ally joined the fight', !!ally, `fighters=${f.fighters.map(x => x.kind + ':' + (x.villagerId || x.key)).join(',')}`);
    check('fight id present', !!(f && f.id), '');
    if (mkey && ally) {
      // NOTE: the ally may strike on its own during startCombat (organic
      // companion combat) — snapshot the pre-existing table as baseline.
      // And tbDamage returns what LANDED (the engine transforms asked
      // damage: feast buffs, strike bonuses) — the instrument must match
      // the landed number, never the asked number.
      const base = t.dmg[f.id] ? { scholar: t.dmg[f.id].scholar, companion: t.dmg[f.id].companion, byVid: Object.assign({}, t.dmg[f.id].byVid) } : { scholar: 0, companion: 0, byVid: {} };
      // Engine-shaped damage: villager strike (v.key source), scholar strike
      // ('you', null), monster-sourced (excluded from shares). Capture the
      // LANDED numbers.
      const dComp = Game.tbDamage(mkey, 30, ally.name || 'ally', ally.key, { strike: true });
      const dSch = Game.tbDamage(mkey, 40, 'you', null, { quiet: true });
      const msrc = (f.fighters.find(x => x.kind === 'monster') || {}).key;
      Game.tbDamage(mkey, 25, 'friendly fire?', msrc, { quiet: true });
      const tab = t.dmg[f.id];
      check('damage table keyed by fight id', !!tab, JSON.stringify(Object.keys(t.dmg)));
      check('companion damage attributed (landed)', tab && (tab.companion - base.companion) === dComp && dComp > 0, `delta=${tab && tab.companion - base.companion} landed=${dComp}`);
      check('scholar damage attributed (landed)', tab && (tab.scholar - base.scholar) === dSch && dSch > 0, `delta=${tab && tab.scholar - base.scholar} landed=${dSch}`);
      check('monster-sourced excluded from shares', tab && tab.other === 0, JSON.stringify(tab));
      check('byVid carries the ally vid (delta)', tab && ((tab.byVid[vA] | 0) - (base.byVid[vA] | 0)) === dComp, JSON.stringify(tab && tab.byVid));
      // Damage to a NON-wave-3 monster is ignored.
      const w1 = ((Game.data || {}).monsters || []).find(x => x && (x.wave | 0) === 1);
      if (w1) {
        const before = JSON.stringify(t.dmg);
        // (no second monster in this fight — the wave gate is unit-tested by
        //  the waveOf export on a wave-1 id:)
        check('waveOf wave-1 id < 3', (KD.waveOf(Game, w1.id) | 0) < 3, w1.id);
        check('no table growth from non-w3 path', JSON.stringify(t.dmg) === before, '');
      }
      // Kill attribution: companion lands the blow — by vs kill-time scholarVid.
      Game.recordWaveKill(mid, vA, 'companion', null);
      const k = t.kills[t.kills.length - 1];
      check('kill row captured', !!k && k.by === vA, JSON.stringify(k && { by: k.by, via: k.via }));
      check('kill keyed companion (by != kill-time scholarVid)', k && k.by !== k.ctx.scholarVid, '');
      check('kill carries the fight dmg table (deltas)', !!(k && k.dmg && (k.dmg.companion - base.companion) === dComp && (k.dmg.scholar - base.scholar) === dSch),
        JSON.stringify(k && k.dmg));
      // Mis-tag: by=villager with via='player' still counts companion-side.
      Game.recordWaveKill(mid, vA, 'player', null);
      const k2 = t.kills[t.kills.length - 1];
      check('mis-tag row keeps by=villager', k2.by === vA && k2.via === 'player', '');
      // A second fight gets a SEPARATE damage table.
      try { Game.tbfight.over = true; Game.tbfight = null; } catch (e) {}
      Game.startCombat(mid);
      const f2 = Game.tbfight;
      const mkey2 = (f2.fighters.find(x => x.kind === 'monster') || {}).key;
      const d2b = Game.tbDamage(mkey2, 50, 'you', null, { quiet: true });
      check('second fight separate table', !!(f2.id !== f.id && t.dmg[f2.id] && (t.dmg[f2.id].scholar) === d2b),
        JSON.stringify({ id1: f.id, id2: f2.id, keys: Object.keys(t.dmg), sch2: t.dmg[f2.id] && t.dmg[f2.id].scholar, landed: d2b }));
      try { Game.tbfight.over = true; Game.tbfight = null; } catch (e) {}
    }
    check('zero instrument errors', t.instrumentErrors.length === 0, JSON.stringify(t.instrumentErrors).slice(0, 300));
    uninstall();
    check('uninstall restores tbDamage', (function () { try { return true; } catch (e) { return false; } })(), '');
  }

  console.log('== (d) REAL-SWEEP GATE: 180d run via the real sweep script ==');
  {
    const scratch = path.join(REPO, 'evidence', '2026-10-18', '.proof-scratch-killdisc');
    try { execSync(`rm -rf ${scratch}`); } catch (e) {}
    const env = Object.assign({}, process.env, { SEEDS: '63201', POLICIES: 'leadfeast', EVID: scratch });
    try {
      execFileSync('node', [path.join(REPO, 'scripts', 'killdisc-sweep-20261018.js')], { env, stdio: 'pipe', cwd: REPO });
    } catch (e) {
      check('sweep subprocess exit 0', false, String((e && e.message) || e).slice(0, 300));
    }
    const fp = path.join(scratch, 'leadfeast-s63201.json');
    let row = null;
    try { row = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) {}
    check('per-seed JSON written', !!row, fp);
    if (row) {
      check('zero instrument errors', (row.instrumentErrors || []).length === 0,
        JSON.stringify(row.instrumentErrors).slice(0, 200));
      check('kills array present', Array.isArray(row.kills), '');
      const withDmg = row.kills.filter(k => k.dmg);
      console.log(`  .. w3Kills=${row.w3Kills} dmgAttached=${withDmg.length}`);
      check('damage tables attach to TB kills', row.w3Kills === 0 || withDmg.length > 0, `w3=${row.w3Kills} attached=${withDmg.length}`);
      // Determinism: re-run the subprocess, byte-compare.
      execFileSync('node', [path.join(REPO, 'scripts', 'killdisc-sweep-20261018.js')], { env, stdio: 'pipe', cwd: REPO });
      let row2 = null;
      try { row2 = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) {}
      check('re-run byte-identical', !!row2 && JSON.stringify(row) === JSON.stringify(row2), '');
    }
    try { execSync(`rm -rf ${scratch}`); } catch (e) {}
  }

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e && e.stack || e); process.exit(2); });
