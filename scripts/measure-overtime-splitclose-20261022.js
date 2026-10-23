#!/usr/bin/env node
// measure-overtime-splitclose-20261022.js — overtime prevalence across the
// sim-splitclose pilot corpus.
//
// IN-FLIGHT FINDING follow-up (evidence/2026-10-22/sim-splitclose.md): on the
// long pre-seat substrate, overtime reruns inflate wave-4 HP pools (suburb
// 1396 x 1.25^4 ~= 3433) — "the veterans bar is chased against INFLATING
// targets." This sampler re-runs the 32 pilot configs DETERMINISTICALLY (E4:
// armed+KILLDISC deterministic; E1: control composition byte-identical) and
// samples Game.overtimeTier() at each wave-4 TB fight start, plus the
// monster's base HP band (monsters.json) vs scaled start HP. It does NOT
// change any game behavior — read-only hooks.
//
// Question: what fraction of the corpus's wave-4 fights happened at
// overtime tier >= 1 (inflated targets)?
//
// Usage (full substrate env):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 KILLDISC=1 node scripts/measure-overtime-splitclose-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'ARMORYDRIVE', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`OT STOP: ${k}=1 is required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('OT STOP: SEATDRIVE=0 is required.'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const SC = require(path.join(REPO, 'scripts', 'policies', 'splitclose'));

const SEEDS = [65611, 65612, 65613, 65614, 65615, 65616, 65617, 65618];
const BASES = ['leadfeast', 'belongfeast'];

function waveOf(Game, mid) {
  try { const d = ((Game.data || {}).monsters || []).find(x => x && x.id === mid); return (d && d.wave) || 1; } catch (e) { return 1; }
}
function baseHp(Game, mid) {
  try { const d = ((Game.data || {}).monsters || []).find(x => x && x.id === mid); return (d && d.hp) || null; } catch (e) { return null; }
}

async function one(seed, baseName, arm) {
  const policy = arm === 'control' ? SC.controlFor(baseName) : SC.armedFor(baseName);
  const { Game } = await loadGame({ seed, mode: 'splitclose-overtime', fullTelemetry: false });
  const fights = [];
  let cur = null, clockStartDay = null, finalTier = 0;
  const oStart = Game.startCombat;
  if (typeof oStart === 'function') {
    Game.startCombat = function (mid) {
      const r = oStart.apply(this, arguments);
      try {
        const f = Game.tbfight;
        let tier = 0;
        try { tier = (typeof Game.overtimeTier === 'function') ? (Game.overtimeTier() | 0) : 0; } catch (e) {}
        if (tier > 0 && clockStartDay === null) {
          try { clockStartDay = (((Game.state || {}).scholar || {}).day || 0); } catch (e) { clockStartDay = -1; }
        }
        finalTier = tier;
        if (f && (waveOf(Game, mid) | 0) === 4) {
          cur = {
            day: (((Game.state || {}).scholar || {}).day || 0), mid, tier,
            baseHp: baseHp(Game, mid), startHp: null, maxHp: null, outcome: null,
          };
          fights.push(cur);
        } else cur = null;
      } catch (e) { cur = null; }
      return r;
    };
  }
  const oDmg = Game.tbDamage;
  if (typeof oDmg === 'function') {
    Game.tbDamage = function (targetKey, dmg, sourceLabel, sourceKey) {
      const r = oDmg.apply(this, arguments);
      try {
        if (cur && Game.tbfight && String(Game.tbfight.id) === String(cur.fid || Game.tbfight.id)) {
          const tgt = Game.tbFighter ? Game.tbFighter(targetKey) : null;
          if (tgt && tgt.kind === 'monster' && cur.maxHp === null) {
            cur.maxHp = Math.round(tgt.maxHp || tgt.hp || 0);
            cur.startHp = cur.maxHp;
          }
        }
      } catch (e) {}
      return r;
    };
  }
  const oEnd = Game.tbEnd;
  if (typeof oEnd === 'function') {
    Game.tbEnd = function (res) {
      try { if (cur && Game.tbfight && cur.maxHp !== null) cur.outcome = String(res); else if (cur) cur.outcome = String(res); } catch (e) {}
      return oEnd.apply(this, arguments);
    };
  }
  await setupGame(Game);
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  try { finalTier = (typeof Game.overtimeTier === 'function') ? (Game.overtimeTier() | 0) : finalTier; } catch (e) {}
  return { seed, base: baseName, arm, fights, clockStartDay, finalTier };
}

async function main() {
  const quick = process.env.OTQUICK === '1';
  const rows = [];
  const arms = quick ? ['splitclose'] : ['control', 'splitclose'];
  const bases = quick ? ['leadfeast'] : BASES;
  const seeds = quick ? [65611] : SEEDS;
  for (const arm of arms) {
    for (const b of bases) {
      for (const s of seeds) {
        process.env.SPLITCLOSE = arm === 'splitclose' ? '1' : '';
        const row = await one(s, b, arm);
        rows.push(row);
        console.log(`done ${arm} ${b} s${s}: w4fights=${row.fights.length} inflated=${row.fights.filter(f => f.tier >= 1).length} finalTier=${row.finalTier}`);
      }
    }
  }
  const fights = rows.flatMap(r => r.fights.map(f => ({ ...f, arm: r.arm, base: r.base, seed: r.seed })));
  const inflated = fights.filter(f => f.tier >= 1);
  const summary = {
    instrument: 'measure-overtime-splitclose-20261022.js',
    base: 'f2daadf3d',
    configs: rows.length,
    wave4Fights: fights.length,
    inflatedFights: inflated.length,
    inflatedShare: fights.length ? +(inflated.length / fights.length).toFixed(3) : null,
    configsWithOvertime: rows.filter(r => r.finalTier >= 1).length,
    tierHistogram: {},
    configsWithWave4Fights: rows.filter(r => r.fights.length > 0).length,
    rows,
  };
  for (const f of fights) summary.tierHistogram[f.tier] = (summary.tierHistogram[f.tier] || 0) + 1;
  const out = path.join(REPO, 'evidence', '2026-10-22', 'overtime-prevalence-splitclose.json');
  fs.writeFileSync(out, JSON.stringify(summary, null, 2));
  console.log(`\nOT prevalence: ${inflated.length}/${fights.length} wave-4 fights at tier>=1 (${summary.inflatedShare})`);
  console.log(`configs with overtime active: ${summary.configsWithOvertime}/32; configs with wave-4 fights: ${summary.configsWithWave4Fights}/32`);
  console.log(`tier histogram: ${JSON.stringify(summary.tierHistogram)}`);
  console.log(`wrote ${out}`);
}
main().catch(e => { console.error('OT FAIL: ' + (e && e.stack || e)); process.exit(1); });
