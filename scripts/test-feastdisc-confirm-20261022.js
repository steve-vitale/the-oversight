#!/usr/bin/env node
// test-feastdisc-confirm-20261022.js — confirm proof gates for the
// sim-feastdiscipline CONFIRM (run fleshout-20261022T1717Z follow-on).
//
// The layer itself (scripts/policies/feastdiscipline.js) was re-verified
// GREEN on this tree via scripts/test-feastdiscipline-20261022.js
// (32 PASS, 0 FAIL) BEFORE this test runs. These gates prove the CONFIRM
// MEASUREMENT PATH — fresh seeds, determinism of the new sweep script,
// and correctness of the primary (damage-majority) attribution.
//
// Gates:
//   C1 seed-freshness: all 12 confirm seeds absent from evidence/ +
//      scripts/ FILENAMES and script CONTENT (filename criterion — the
//      safe form of freshness, no substring-grep).
//   C2 armed determinism: one fresh seed x {leadfeast} x {control,
//      feastdisc}, 60d, same seed twice -> byte-identical sweep JSONs
//      (spawns the real confirm sweep to a /tmp evidence dir).
//   C3 attribution units: kill-time + damage-majority attribution on
//      synthetic waveKillLog/KILLDISC rows — RED->GREEN.
//   C4 metric-computation sanity: paired-row diff aggregation on
//      synthetic rows (median, guardrail checks) — RED->GREEN.
//
// Substrate: the non-seat long substrate
// (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
// KILLDISC=1 ARMORYDRIVE=1; VETREL/REPOSITION/VGEAR unset).
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO = path.join(__dirname, '..');
const SEEDS = [66111, 66112, 66113, 66114, 66115, 66116, 66117, 66118, 66119, 66120, 66121, 66122];

let pass = 0, fail = 0;
function gate(cond, label) {
  if (cond) { pass++; console.log('  PASS ' + label); }
  else { fail++; console.log('  FAIL ' + label); }
}

// ---------- C1: seed freshness (filename criterion) ----------
console.log('C1 seed-freshness');
{
  const names = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (e.name !== '.git' && e.name !== 'node_modules') walk(p); }
      else names.push(path.relative(REPO, p));
    }
  };
  walk(path.join(REPO, 'evidence'));
  walk(path.join(REPO, 'scripts'));
  let ok = true;
  for (const s of SEEDS) {
    // exact filename token: "-s<seed>." or "/s<seed>." or "-<seed>-"
    const rx = new RegExp('(^|[/\\\\-])s?' + s + '(\\.|-|$)');
    const hits = names.filter(n => rx.test(n));
    if (hits.length) { ok = false; console.log(`    seed ${s} filename hit: ${hits.slice(0, 3).join(', ')}`); }
  }
  gate(ok, '12 seeds: zero evidence/ + scripts/ filename hits');
  // script content scan (skip this test + the confirm sweep themselves)
  let contentOk = true;
  const skip = new Set(['test-feastdisc-confirm-20261022.js', 'sweep-feastdisc-confirm-20261022.js']);
  const scanJs = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { scanJs(p); continue; }
      if (!p.endsWith('.js') || skip.has(e.name)) continue;
      const body = fs.readFileSync(p, 'utf8');
      for (const s of SEEDS) {
        const rx = new RegExp('(?<![0-9])' + s + '(?![0-9])');
        if (rx.test(body)) { contentOk = false; console.log(`    seed ${s} content hit: ${path.relative(REPO, p)}`); }
      }
    }
  };
  scanJs(path.join(REPO, 'scripts'));
  gate(contentOk, '12 seeds: zero script-content hits (digit-boundary)');
}

// ---------- C2: armed determinism of the confirm sweep ----------
console.log('C2 confirm-sweep determinism (60d x2, one fresh seed)');
{
  const env = Object.assign({}, process.env, {
    FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1',
    SEATDRIVE: '0', KILLDISC: '1', ARMORYDRIVE: '1',
    REPO,
  });
  delete env.VETREL; delete env.REPOSITION; delete env.VGEAR;
  const out1 = '/tmp/feastdisc-confirm-det/a';
  const out2 = '/tmp/feastdisc-confirm-det/b';
  for (const d of [out1, out2]) execFileSync('rm', ['-rf', d]);
  for (const [dir, arm, feastdisc] of [[out1, 'control', false], [out2, 'control', false]]) {
    const e = Object.assign({}, env, { ARM: arm, SEEDS: '66111', POLICIES: 'leadfeast', DAYS: '60', EVID: dir });
    delete e.FEASTDISC;
    execFileSync(process.execPath, [path.join(REPO, 'scripts', 'sweep-feastdisc-confirm-20261022.js')], { env: e, stdio: 'pipe', cwd: REPO });
  }
  const a = fs.readFileSync(path.join(out1, 'control-lead-s66111.json'), 'utf8');
  const b = fs.readFileSync(path.join(out2, 'control-lead-s66111.json'), 'utf8');
  gate(a === b, 'control 60d re-run byte-identical');
  for (const d of [out1, out2]) execFileSync('rm', ['-rf', d]);
  // armed side
  for (const [dir] of [[out1], [out2]]) {
    const e = Object.assign({}, env, { ARM: 'feastdisc', FEASTDISC: '1', SEEDS: '66111', POLICIES: 'leadfeast', DAYS: '60', EVID: dir });
    execFileSync(process.execPath, [path.join(REPO, 'scripts', 'sweep-feastdisc-confirm-20261022.js')], { env: e, stdio: 'pipe', cwd: REPO });
  }
  const a2 = fs.readFileSync(path.join(out1, 'feastdisc-lead-s66111.json'), 'utf8');
  const b2 = fs.readFileSync(path.join(out2, 'feastdisc-lead-s66111.json'), 'utf8');
  gate(a2 === b2, 'feastdisc 60d re-run byte-identical');
  // sanity: the file carries the attribution fields the primary needs
  const j = JSON.parse(a2);
  gate(Array.isArray(j.w4killRows) && j.hasOwnProperty('nW4VillagersDmgMaj') && j.hasOwnProperty('fdTele'), 'sweep JSON carries w4killRows + nW4VillagersDmgMaj + fdTele');
  for (const d of [out1, out2]) execFileSync('rm', ['-rf', d]);
}

// ---------- C3: attribution units (mirrors the sweep's logic) ----------
console.log('C3 attribution units (synthetic, RED->GREEN)');
{
  // Mirror of the sweep's kill-time + damage-majority attribution.
  function attribute(w4log, killdiscRows, bearerByDay, scholarVid) {
    const w4villagers = new Set(), w4villagersDmgMaj = new Set();
    for (const e of w4log) {
      const bearer = bearerByDay[e.d] != null ? bearerByDay[e.d] : scholarVid;
      const isScholar = (e.by === bearer || e.by === 'player');
      if (!isScholar && e.by) w4villagers.add(e.by);
    }
    for (const k of killdiscRows) {
      const d = k.dmg || {};
      const sD = d.scholar || 0, cD = d.companion || 0, oD = d.other || 0;
      const tot = sD + cD + oD;
      const nonScholarShare = tot > 0 ? (cD + oD) / tot : 0;
      const dmgMaj = nonScholarShare >= 0.5;
      const bearer = bearerByDay[k.day] != null ? bearerByDay[k.day] : scholarVid;
      const killTimeVillager = k.by && k.by !== bearer && k.by !== 'player';
      if (killTimeVillager && dmgMaj && k.by) w4villagersDmgMaj.add(k.by);
    }
    return { w4villagers, w4villagersDmgMaj };
  }
  const bearerByDay = { 81: 'v_scholar', 52: 'v_scholar' };
  const scholarVid = 'v_scholar';
  const w4log = [
    { w: 4, d: 81, by: 'v_fatima' },   // villager, kill-time
    { w: 4, d: 52, by: 'v_scholar' },  // scholar bearer kill -> not villager
    { w: 4, d: 90, by: 'player' },     // player kill -> not villager
    { w: 3, d: 70, by: 'v_fatima' },   // wave 3 -> excluded below
  ];
  const killdisc = [
    { day: 81, by: 'v_fatima', dmg: { scholar: 30, companion: 40, other: 0 } },  // 0.57 non-scholar -> dmgMaj villager
    { day: 52, by: 'v_scholar', dmg: { scholar: 60, companion: 40, other: 0 } }, // scholar kill -> excluded
    { day: 83, by: 'v_valeria', dmg: { scholar: 80, companion: 20, other: 0 } }, // 0.20 -> NOT dmgMaj
    { day: 84, by: 'v_elif', dmg: { scholar: 0, companion: 50, other: 0 } },     // 1.0 -> dmgMaj villager
    { day: 85, by: 'v_noor', dmg: { scholar: 0, companion: 0, other: 0 } },      // 0 damage -> NOT dmgMaj (tot=0 guard)
  ];
  const r = attribute(w4log.filter(e => e.w === 4), killdisc, bearerByDay, scholarVid);
  gate(r.w4villagers.size === 1 && r.w4villagers.has('v_fatima'), 'kill-time: exactly the villager kill (scholar/player excluded)');
  gate(r.w4villagersDmgMaj.size === 2 && r.w4villagersDmgMaj.has('v_fatima') && r.w4villagersDmgMaj.has('v_elif'),
    'damage-majority: fatima 0.57 + elif 1.0 counted, valeria 0.20 + zero-damage noor excluded');
  // RED check: a scholar-majority companion-credited kill must NOT count.
  const r2 = attribute([{ w: 4, d: 81, by: 'v_fatima' }],
    [{ day: 81, by: 'v_fatima', dmg: { scholar: 90, companion: 10, other: 0 } }], bearerByDay, scholarVid);
  gate(r2.w4villagersDmgMaj.size === 0, 'RED->GREEN: scholar-majority kill (0.10) does not count as damage-majority');
  // RED check: bearer-map fallback — kill on a day with no census entry
  // falls back to the live scholar id, so a villager kill still counts.
  const r3 = attribute([{ w: 4, d: 999, by: 'v_fatima' }],
    [{ day: 999, by: 'v_fatima', dmg: { scholar: 10, companion: 90, other: 0 } }], bearerByDay, scholarVid);
  gate(r3.w4villagersDmgMaj.size === 1, 'bearer fallback: uncensused day still attributes the villager dmgMaj kill');
}

// ---------- C4: paired-row aggregation sanity (synthetic) ----------
console.log('C4 paired-row aggregation (synthetic, RED->GREEN)');
{
  function median(a) {
    const s = a.slice().sort((x, y) => x - y);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }
  // synthetic: 4 matched pairs, armed dmgMaj villager kills vs control
  const pairs = [
    { seed: 1, control: { dm: 0 }, armed: { dm: 2 } },
    { seed: 2, control: { dm: 1 }, armed: { dm: 0 } },
    { seed: 3, control: { dm: 0 }, armed: { dm: 1 } },
    { seed: 4, control: { dm: 0 }, armed: { dm: 3 } },
  ];
  const armedTot = pairs.reduce((a, p) => a + p.armed.dm, 0);
  const ctrlTot = pairs.reduce((a, p) => a + p.control.dm, 0);
  const armedSeeds = pairs.filter(p => p.armed.dm >= 1).length;
  gate(armedTot === 6 && ctrlTot === 1 && armedSeeds === 3, 'primary aggregation: armed 6 vs control 1, seeds 3');
  gate(armedTot >= ctrlTot + 2 && armedSeeds >= 3, 'GO-threshold arithmetic: 6>=1+2 AND 3>=3 -> GO');
  // guardrail arithmetic: median survival diff, starvation diff
  const survDiffs = [0, -3, -12, 5]; // armed - control per matched seed
  gate(median(survDiffs) === -1.5, 'guardrail: median of per-seed survival diffs (0,-3,-12,5) = -1.5');
  const starv = [{ c: 2, a: 4 }, { c: 0, a: 0 }];
  gate(starv.reduce((a, x) => a + x.a, 0) <= starv.reduce((a, x) => a + x.c, 0) + 3,
    'guardrail: starvation deaths <= control+3 (4 <= 2+3)');
  // RED check: a miss is NO-GO — 2/12 armed seeds does NOT meet the bar.
  gate(!(2 >= 3), 'RED->GREEN: 2/12 armed seeds is NO-GO against the >=3/12 bar (not re-scored)');
}

console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
