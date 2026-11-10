// test-roundcap-b.js — sim-roundcap-b proof + sizing test.
//
// The round-cap walk-away is a SIZING question, not a lever: zero src/js
// in this arm. This test proves the instrument and sizes what a cap
// extension (+1/+2/+3 rounds) would convert:
//
//   S1. Static: MAX_ROUNDS = 15, rec.roundCap set at the cap, the
//       disengagement branch (arena judges / committed walk-away /
//       worse-off side), finishLog 'timeout' mapping, no wave-3+ kind
//       carries a flee component (so wild caps are walk-aways, not
//       beast flights).
//   S2. Instrument: the roundcap layer decorates field rows with
//       roundCap / vHpStart / vWb / vStrikeMin / vStrikeMax / oneStrike,
//       and vWb matches an independent computation through the engine's
//       own equipment helpers.
//   S3. Identity: the cap-extension re-drive loads fieldFights.js with
//       MAX_ROUNDS replaced in memory ONLY (sim-harness sourcePatch;
//       src/js on disk untouched). CAP=15 patched must reproduce the
//       CAP=15 UNPATCHED outcomes exactly (same shapes, same streams),
//       and the CAP=15 log must be a prefix of the CAP=18 log once the
//       cap line is stripped — proving the extension is a true
//       continuation of the same fight, not a different fight.
//   S4. Sizing: for every fight capped at 15, the matched outcome at
//       CAP=16/17/18 — conversion (vKill within the extension), fighter
//       death cost (vDie within the extension), still-capped share —
//       overall and for the near-dead (mHpLeft <= 30) pool.
//
// Shapes mirror scripts/roundcap-redrive-20261110.js DEFAULT_SHAPES
// (Buffering anchor + wild-typical + no-trick control + chorus_line +
// callback). If the lists drift, the S3 identity comparison fails
// loudly. Writes nothing into the repo. Usage:
//   node scripts/test-roundcap-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, quietLog, mulberry32 } = require(path.join(REPO, 'scripts', 'sim-harness'));
const RCINST = require(path.join(REPO, 'scripts', 'roundcap-instrument-20261110'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL: ${name}${extra != null ? ' :: ' + JSON.stringify(extra) : ''}`); }
}

const SHAPES = [
  { def: 'buffering', max: 310, hps: [29, 43, 73], items: ['bow', { id: 'arrow', units: 4 }], ally: false, health: 100, tricks: ['buffering'] },
  { def: 'buffering', max: 310, hps: [149, 158, 210], items: ['bow', { id: 'arrow', units: 4 }], ally: false, health: 100, tricks: ['buffering'] },
  { def: 'buffering', max: 310, hps: [43, 73], items: ['bow', { id: 'arrow', units: 4 }], ally: false, health: 100, tricks: [] },
  { def: 'chorus_line', max: 300, hps: [225, 260], items: ['bow', { id: 'arrow', units: 4 }], ally: false, health: 100, tricks: ['chorus_line'] },
  { def: 'callback', max: 260, hps: [260], items: ['bow', { id: 'arrow', units: 4 }], ally: false, health: 100, tricks: ['callback'] },
];
function shapeKey(sh) {
  return sh.def + '/' + sh.items.map(function (i) { return typeof i === 'string' ? i : i.id; }).join('+') +
    '/h' + (sh.health != null ? sh.health : 100) + '/t' + ((sh.tricks || []).join(',') || 'none');
}

function runRedrive(cap) {
  const env = Object.assign({}, process.env, { CAP: String(cap) });
  const out = execSync('node scripts/roundcap-redrive-20261110.js', { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const rows = {};
  let summary = null;
  out.split('\n').forEach(function (line) {
    if (!line.trim()) return;
    const r = JSON.parse(line);
    if (r.summary) { summary = r; return; }
    rows[r.shape + '|' + r.entryHp + '|' + r.stream] = r;
  });
  return { rows: rows, summary: summary };
}

async function main() {
  // ---- S1. static ----
  const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
  check('static: MAX_ROUNDS = 15', ffSrc.indexOf('var MAX_ROUNDS = 15;') >= 0);
  check('static: roundCap set at the cap', ffSrc.indexOf('if (_flOn) rec.roundCap = true;') >= 0);
  check('static: committed walk-away branch', ffSrc.indexOf("' walks away. ' + mPhraseCap + ' holds the field; it is not leaving. (Committed)") >= 0);
  check('static: worse-off-side branch', ffSrc.indexOf('the worse-off side disengages.') >= 0);
  check('static: judges branch (arena)', ffSrc.indexOf('the judges give it to the less-bloodied.') >= 0);
  const flSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'finishLog.js'), 'utf8');
  check('static: finishLog maps roundCap vFlee to timeout', flSrc.indexOf("return roundCap ? 'timeout' : 'flee';") >= 0);
  const monsters = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  const w3plusFlee = monsters.filter(function (m) { return (m.wave | 0) >= 3 && !!m.flee; });
  check('static: no wave-3+ kind carries a flee component', w3plusFlee.length === 0, { flee: w3plusFlee.map(function (m) { return m.id; }) });

  // ---- S2+S3. in-process unpatched load, instrument, same shapes ----
  const { Game } = await loadGame({ seed: 87104, mode: 'roundcap-proof', fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  const roster = ((Game.state.village || {}).roster || []).filter(function (v) { return v !== Game.villagerId; });
  check('engine: roster has non-scholar fighters', roster.length >= 2, roster.length);
  const defs = {};
  for (const m of (Game.data.monsters || [])) defs[m.id] = m;
  check('engine: buffering/chorus_line/callback defs present', !!(defs.buffering && defs.chorus_line && defs.callback));

  const inst = RCINST.install(Game);
  const t = inst.t;
  function runFight(vid, items, def, startHp, maxHp, streamSeed, health, allyVid, tricks) {
    const vp = (Game.data.villagers || []).find(function (x) { return x.id === vid; }) || {};
    vp.items = items.map(function (it) {
      if (typeof it === 'string') return { itemId: it, units: 1 };
      return { itemId: it.id, units: it.units || 1 };
    });
    delete vp.equipped;
    try {
      Game.state.villagerTricks = {};
      (tricks || []).forEach(function (x) { Game.state.villagerTricks[x] = true; });
    } catch (e) {}
    var hv = Game.state.village.health || (Game.state.village.health = {});
    hv[vid] = health;
    if (allyVid) { hv[allyVid] = 100; }
    const opts = { allies: allyVid ? 1 : 0, allyVids: allyVid ? [allyVid] : [],
      allyFromStart: true, rng: mulberry32(streamSeed) };
    return Game.fieldFight(vid, def, { hp: startHp, maxHp: maxHp }, opts);
  }

  const local = {};
  for (const sh of SHAPES) {
    for (const hp of sh.hps) {
      for (let s = 1; s <= 30; s++) {
        const vid = roster[s % roster.length], allyVid = sh.ally === false ? null : roster[(s + 1) % roster.length];
        const streamSeed = s * 104729 + hp;
        const before = (t.fieldFights || []).length;
        let rec;
        try { rec = runFight(vid, sh.items, defs[sh.def], hp, sh.max, streamSeed, (sh.health != null ? sh.health : 100), allyVid, sh.tricks); }
        catch (e) { continue; }
        const row = (t.fieldFights || [])[(t.fieldFights || []).length - 1];
        local[shapeKey(sh) + '|' + hp + '|' + s] = { rec: rec, row: row, before: before };
      }
    }
  }
  const localRows = Object.keys(local).map(function (k) { return local[k]; });
  check('S2: instrument recorded every local fight', localRows.length >= 300 && (t.fieldFights || []).length >= 300,
    { local: localRows.length, rows: (t.fieldFights || []).length });
  check('S2: zero instrument errors', (t.instrumentErrors || []).length === 0, t.instrumentErrors);
  // Row fields agree with the engine record on every fight.
  let rowBad = 0, wbBad = 0, oneStrikeBad = 0;
  const S = (globalThis.S || ((globalThis.Scattering || {}).S)) || {};
  localRows.forEach(function (x) {
    const rec = x.rec, row = x.row;
    if (!row || row.roundCap !== !!rec.roundCap || row.rounds !== rec.rounds || row.outcome !== rec.outcome ||
        row.mHpLeft !== rec.mHpLeft || row.vHpLeft !== rec.vHpLeft) rowBad++;
    // Independent wb computation through the engine's own helpers.
    try {
      const vp = ((Game.data.villagers || []).find(function (v) { return v.id === row.vid; }) ||
                  (Game.data.background_survivors || []).find(function (v) { return v.id === row.vid; })) || {};
      const wb = Math.round(((S.equipment.weaponBonusOf(vp, Game.data.items, 'melee') || 0) +
                             (S.equipment.weaponBonusOf(vp, Game.data.items, 'ranged') || 0)) / 2);
      if (row.vWb !== wb) wbBad++;
    } catch (e) { wbBad++; }
    const expectOne = !!(row.roundCap && row.mHpLeft != null && row.vStrikeMax != null && row.mHpLeft <= row.vStrikeMax);
    if (row.oneStrike !== expectOne) oneStrikeBad++;
    if (row.vHpStart == null) rowBad++;
  });
  check('S2: row fields agree with rec on every fight', rowBad === 0, { rowBad: rowBad });
  check('S2: instrument wb matches independent computation', wbBad === 0, { wbBad: wbBad });
  check('S2: oneStrike consistent with mHpLeft/vStrikeMax', oneStrikeBad === 0, { oneStrikeBad: oneStrikeBad });
  const localCaps = localRows.filter(function (x) { return x.rec.roundCap; });
  check('S2: constructed shapes cap (pool non-empty)', localCaps.length >= 20, { capped: localCaps.length });
  const localNearDead = localCaps.filter(function (x) { return x.rec.mHpLeft <= 30; });
  check('S2: near-dead capped pool non-empty', localNearDead.length >= 10, { nearDead: localNearDead.length });
  try { inst.uninstall(); } catch (e) {}

  // ---- S3. identity: CAP=15 patched == unpatched ----
  const patched15 = runRedrive(15);
  let idBad = 0, idChecked = 0;
  Object.keys(local).forEach(function (k) {
    const l = local[k], p = patched15.rows[k];
    if (!p) { idBad++; return; }
    idChecked++;
    const r = l.rec;
    if (p.outcome !== r.outcome || p.rounds !== r.rounds || p.mHpLeft !== r.mHpLeft ||
        p.vHpLeft !== r.vHpLeft || p.mDealt !== r.mDealt ||
        JSON.stringify(p.log) !== JSON.stringify(r.log || [])) idBad++;
  });
  check('S3 identity: CAP=15 patched reproduces unpatched outcomes exactly', idBad === 0, { checked: idChecked, mismatches: idBad });
  check('S3 identity: patched CAP=15 summary matches local counts', patched15.summary && patched15.summary.capped === localCaps.length,
    { patchedCapped: patched15.summary && patched15.summary.capped, localCapped: localCaps.length });

  // ---- S4. sizing: matched outcomes at CAP=16/17/18 ----
  const c16 = runRedrive(16), c17 = runRedrive(17), c18 = runRedrive(18);
  function stripCapLine(log) { return (log || []).filter(function (x) { return x.indexOf('Neither gives after') < 0; }); }
  let prefixBad = 0;
  Object.keys(local).forEach(function (k) {
    if (!local[k].rec.roundCap) return;
    const pre = stripCapLine(local[k].rec.log || []), ext = stripCapLine((c18.rows[k] || {}).log || []);
    if (JSON.stringify(ext.slice(0, pre.length)) !== JSON.stringify(pre)) prefixBad++;
  });
  check('S4: CAP=15 log is a prefix of the CAP=18 log (true continuation)', prefixBad === 0, { prefixBad: prefixBad, capped: localCaps.length });

  function sizing(capRows, label) {
    const keys = Object.keys(local).filter(function (k) { return local[k].rec.roundCap; });
    const conv = keys.filter(function (k) { return capRows[k] && capRows[k].outcome === 'vKill'; });
    const died = keys.filter(function (k) { return capRows[k] && capRows[k].outcome === 'vDie'; });
    const still = keys.filter(function (k) { return capRows[k] && capRows[k].roundCap; });
    const ndKeys = keys.filter(function (k) { return local[k].rec.mHpLeft <= 30; });
    const ndConv = ndKeys.filter(function (k) { return capRows[k] && capRows[k].outcome === 'vKill'; });
    console.log('SIZING ' + label + ': capped-at-15 n=' + keys.length +
      ' converted=' + conv.length + ' died=' + died.length + ' still-capped=' + still.length +
      ' | near-dead<=30 n=' + ndKeys.length + ' converted=' + ndConv.length +
      ' rate=' + (ndKeys.length ? (ndConv.length / ndKeys.length).toFixed(3) : 'n/a'));
    return { keys: keys, conv: conv, died: died, still: still, ndKeys: ndKeys, ndConv: ndConv };
  }
  const s16 = sizing(c16.rows, '+1 (CAP=16)');
  const s17 = sizing(c17.rows, '+2 (CAP=17)');
  const s18 = sizing(c18.rows, '+3 (CAP=18)');
  check('S4 sizing: +1 round converts 0 capped fights', s16.conv.length === 0, { conv: s16.conv.length });
  check('S4 sizing: +2 rounds converts 0 capped fights', s17.conv.length === 0, { conv: s17.conv.length });
  check('S4 sizing: +3 rounds converts few (<=5 of 89)', s18.conv.length <= 5, { conv: s18.conv.length });
  check('S4 sizing: near-dead conversion at +3 is below the draft GO bar (0.50)', s18.ndKeys.length > 0 && (s18.ndConv.length / s18.ndKeys.length) < 0.50,
    { rate: s18.ndKeys.length ? (s18.ndConv.length / s18.ndKeys.length).toFixed(3) : null });
  check('S4 sizing: the extension has a real death cost (>=1 capped fighter dies who walked away at 15)', s18.died.length >= 1, { died: s18.died.length });
  check('S4 sizing: Buffering wait-caps convert 0 at +3 (the fighter keeps waiting)', s18.conv.filter(function (k) { return k.indexOf('buffering/') === 0; }).length === 0,
    { bufferingConv: s18.conv.filter(function (k) { return k.indexOf('buffering/') === 0; }).length });

  console.log(`roundcap proof: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(function (e) { console.error('ROUNDCAP PROOF FAILED:', (e && e.stack) || e); process.exit(1); });
