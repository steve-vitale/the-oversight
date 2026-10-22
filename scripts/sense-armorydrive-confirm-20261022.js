#!/usr/bin/env node
// sense-armorydrive-confirm-20261022.js — SENSE-TESTING LAW probe for the
// sim-armorydrive CONFIRM. Re-runs the FIRST confirm config with a villager
// wave-4 kill (armed arm) deterministically with Game.say wrapped, and dumps
// narration windows around the kill. READ-ONLY: stdout only, no writes.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//        KILLDISC=1 ARMORYDRIVE=1 node scripts/sense-armorydrive-confirm-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));

const SEEDS = [65471, 65472, 65473, 65474, 65475, 65476, 65477, 65478,
               65479, 65480, 65481, 65482, 65483, 65484, 65485, 65486];
const DIR = path.join(REPO, 'evidence', '2026-10-22', 'perseed-armorydrive-confirm');

function villagerW4Kills(r) {
  return (r.w4killsDetail || []).filter(e => e.by && e.by !== 'player' && e.by !== e.bearerAtKill);
}

(async () => {
  // Find the first (seed, policy) armed config with a villager wave-4 kill.
  let pick = null;
  for (const s of SEEDS) {
    for (const p of ['leadfeast', 'belongfeast']) {
      const fp = path.join(DIR, `armorydrive-${p}-armorydrive-s${s}.json`);
      if (!fs.existsSync(fp)) continue;
      const r = JSON.parse(fs.readFileSync(fp, 'utf8'));
      const kills = villagerW4Kills(r);
      if (kills.length) {
        pick = { seed: s, policy: p, kills };
        break;
      }
    }
    if (pick) break;
  }
  if (!pick) { console.error('NO armed config with a villager wave-4 kill found in the confirm corpus.'); process.exit(3); }
  const first = pick.kills.slice().sort((a, b) => a.d - b.d)[0];
  const day = first.d;
  console.log(`sense config: s${pick.seed} ${pick.policy} armorydrive — ${pick.kills.length} villager wave-4 kill(s); first: d${day} ${first.mid} by ${first.byName || first.by}`);

  const { Game } = await loadGame({ seed: pick.seed, mode: 'armorydrive-sense', fullTelemetry: false });
  await setupGame(Game);
  const policy = AD.armedFor(pick.policy);
  const lines = [];
  const osay = Game.say.bind(Game);
  Game.say = function (x) {
    try {
      const d2 = (Game.state && Game.state.scholar && Game.state.scholar.day) | 0;
      lines.push(`[d${d2}] ${String(x).replace(/\s+/g, ' ').slice(0, 600)}`);
    } catch (e) {}
    return osay.apply(this, arguments);
  };
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`captured ${lines.length} narration lines`);
  const killer = (first.byName || first.by || '').split(' ')[0].toLowerCase();
  const monster = String(first.mid || '').split('_').pop();
  for (const [lo, hi, label] of [[day - 2, day + 2, `THE KILLS (d${day}: ${first.byName || first.by} vs ${first.mid})`], [day - 12, day - 3, 'RUN-UP (staging/invites/donations)']]) {
    console.log(`\n===== ${label} =====`);
    const win = lines.filter(l => {
      const m = l.match(/^\[d(\d+)\]/);
      if (!m) return false;
      const d2 = parseInt(m[1], 10);
      return d2 >= lo && d2 <= hi;
    });
    const rx = new RegExp(`strike|fight|kill|slain|veteran|wave|mirror|stand|ready|party|invite|armory|donat|weapon|${killer}|${monster}`, 'i');
    const rel = win.filter(l => rx.test(l));
    console.log(`(${rel.length} relevant of ${win.length} lines in window)`);
    for (const l of rel.slice(0, 140)) console.log(l);
    if (rel.length > 140) console.log(`... (${rel.length - 140} more)`);
  }
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
