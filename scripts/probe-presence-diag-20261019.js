#!/usr/bin/env node
// probe-presence-diag-20261019.js — DIAGNOSTIC: why do wave-3+ TB fights
// start with 0 companions in range? Snapshots the join-relevant state at
// every wave-3+ startCombat on the CONTROL policy (tribfloor leadfeast).
//
// The join rule (game.js startCombat): villagers on the scholar's node with
// village.positions within Chebyshev 4 of the scholar's combat position
// join (nearest 4, no other gate). This probe records, per fight:
//   scholar grid pos, inside/outside, at-haven, day/part, aid-crisis,
//   villagers on node (count), each villager's d + inside/outside,
//   computed joiners, and the block reason when 0 join.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 \
//   SEEDS=63511,63512 DAYS=180 node scripts/probe-presence-diag-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`DIAG STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('DIAG STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('DIAG STOP: NODEWITNESS=1 required.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [63511, 63512]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;

function waveOf(Game, mid) {
  try {
    const m = ((Game.data || {}).monsters || []).find(x => x && x.id === mid);
    return (m && m.wave) || 0;
  } catch (e) { return 0; }
}

function snapshot(Game, monsterId) {
  const snap = { monsterId, wave: waveOf(Game, monsterId) };
  try {
    const s = Game.state.scholar || {};
    snap.day = s.day || 0;
    // day-part: the engine tracks it; try several paths (s.part was unset in v1)
    let part = '?';
    try {
      if (Game.dayPart) part = Game.dayPart();
      else if (s.part) part = s.part;
      else if (Game.state && Game.state.part) part = Game.state.part;
    } catch (e) {}
    snap.part = part;
    snap.smx = (s.mx !== undefined ? s.mx : null); snap.smy = (s.my !== undefined ? s.my : null);
    snap.inside = s.insideHaven !== false;
    snap.atHaven = !!(Game.playerAtHaven && Game.playerAtHaven());
    snap.aid = !!(Game.aidCrisis && Game.aidCrisis());
    snap.node = [(Game.map || {}).px, (Game.map || {}).py];
    const v = Game.state.village || {};
    const hx = v.px ?? 4, hy = v.py ?? 4;
    snap.havenNode = (snap.node[0] === hx && snap.node[1] === hy);
    const vpos = v.positions || {};
    const roster = v.roster || [];
    const px = snap.smx ?? 4, py = snap.smy ?? 4;
    const vill = [];
    let living = 0;
    for (const rid of roster) {
      if (rid === Game.villagerId) continue;
      let p = null; try { p = Game.getPerson(rid); } catch (e) {}
      if (!p || p.dead) continue;
      living++;
      const pos = vpos[rid];
      if (!pos) continue;
      const d = Math.max(Math.abs(pos.mx - px), Math.abs(pos.my - py));
      let inside = null;
      try { inside = Game.npcInside ? Game.npcInside(rid) : null; } catch (e) {}
      vill.push({ rid: String(rid).slice(0, 16), d, inside: inside === null ? null : !!inside });
    }
    vill.sort((a, b) => a.d - b.d);
    snap.rosterLiving = living;
    snap.onNode = vill.length;
    // WHERE ARE THE VILLAGERS? nodePos + inside/outside even without grid pos.
    // This distinguishes "away at other nodes" from "door-split at Haven".
    const away = [];
    try {
      const nodePos = v.nodePos || {};
      for (const rid of roster) {
        if (rid === Game.villagerId) continue;
        let p = null; try { p = Game.getPerson(rid); } catch (e) {}
        if (!p || p.dead) continue;
        if (vpos[rid]) continue; // already counted on-node
        const np = nodePos[rid];
        let inside = null;
        try { inside = Game.npcInside ? !!Game.npcInside(rid) : null; } catch (e) {}
        away.push({
          atHavenNode: !!(np && np.nx === hx && np.ny === hy),
          node: np ? [np.nx, np.ny] : null,
          inside,
        });
      }
    } catch (e) {}
    snap.awayHavenNode = away.filter(x => x.atHavenNode).length;
    snap.awayOtherNode = away.filter(x => !x.atHavenNode).length;
    snap.awayInside = away.filter(x => x.atHavenNode && x.inside === true).length;
    snap.awayOutside = away.filter(x => x.atHavenNode && x.inside === false).length;
    snap.joiners = vill.filter(x => x.d <= 4).slice(0, 4).map(x => ({ rid: x.rid, d: x.d, inside: x.inside }));
    snap.joinerCount = snap.joiners.length;
    // block reason when 0 joiners
    if (snap.joinerCount === 0) {
      if (vill.length === 0) snap.block = living === 0 ? 'no-living-villagers' : 'nobody-on-node';
      else {
        const minD = vill[0].d;
        const sameSide = vill.filter(x => x.inside === snap.inside).length;
        snap.block = sameSide === 0 ? 'door-split(all-across-door)' : ('too-far(min-d=' + minD + ',same-side=' + sameSide + ')');
      }
    } else snap.block = null;
    // villager spread summary (for the too-far case)
    snap.dSpread = vill.slice(0, 8).map(x => x.d);
  } catch (e) { snap.err = String(e.message).slice(0, 120); }
  return snap;
}

async function oneRun(seed) {
  const { Game } = await loadGame({ seed, mode: 'presence-diag', fullTelemetry: false });
  const fights = [];
  const origSC = Game.startCombat.bind(Game);
  Game.startCombat = function (monsterId) {
    let snap = null;
    try {
      const w = waveOf(Game, monsterId || Game.pendingMonsterId);
      if (w >= 3) snap = snapshot(Game, monsterId || Game.pendingMonsterId);
    } catch (e) {}
    const r = origSC.apply(this, arguments);
    if (snap) { try { snap.partySize = ((Game.tbfight || {}).fighters || []).filter(x => x && (x.kind === 'villager' || x.kind === 'ally')).length; } catch (e) {} fights.push(snap); }
    return r;
  };
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, TF.leadfeast, { days: DAYS, manifest: undefined, sampleEvery: 60 }); });
  return { seed, fights, days: result.days, endReason: result.endReason };
}

(async () => {
  const all = [];
  for (const seed of SEEDS) {
    console.log(`diag seed ${seed}...`);
    const r = await oneRun(seed);
    console.log(`  ${r.fights.length} wave-3+ fights, end=${r.endReason}`);
    all.push(r);
  }
  // aggregate
  const fights = all.flatMap(r => r.fights.map(f => Object.assign({ seed: r.seed }, f)));
  const by0 = fights.filter(f => f.joinerCount === 0);
  console.log(`\nTOTAL wave-3+ fights: ${fights.length}; 0-joiner: ${by0.length}`);
  const blocks = {};
  for (const f of by0) blocks[f.block || '?'] = (blocks[f.block || '?'] || 0) + 1;
  console.log('block reasons:', JSON.stringify(blocks, null, 1));
  const atHaven = fights.filter(f => f.atHaven).length;
  console.log(`atHaven: ${atHaven}/${fights.length}; aid: ${fights.filter(f => f.aid).length}/${fights.length}`);
  const insideF = fights.filter(f => f.inside).length;
  console.log(`scholar inside: ${insideF}/${fights.length}`);
  // joiner-count distribution
  const dist = {};
  for (const f of fights) dist[f.joinerCount] = (dist[f.joinerCount] || 0) + 1;
  console.log('joiner distribution:', JSON.stringify(dist));
  // villager-on-node stats for 0-joiner fights
  const onNode0 = by0.map(f => f.onNode);
  onNode0.sort((a, b) => a - b);
  console.log(`0-joiner fights: onNode median=${onNode0[Math.floor(onNode0.length / 2)]}, rosterLiving median=${(() => { const a = by0.map(f => f.rosterLiving).sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; })()}`);
  // save
  const out = path.join(REPO, 'evidence', '2026-10-19', 'presence-diag.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ seeds: SEEDS, days: DAYS, fights }, null, 1));
  console.log('wrote', out);
})().catch(e => { console.error('DIAG FAIL', e); process.exit(1); });
