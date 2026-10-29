#!/usr/bin/env node
// scripts/test-returns-a-sense.js — sim-returns-a sense tests.
// SENSE-TESTING LAW, two reads:
//   S1 (corpus-derived): the LONGEST chain thread in the fresh band,
//     end to end — every meeting with its returns class, plus the
//     HUNT departure/drop records for its villagers in the thread's
//     window. Read from the analyzer --out JSON (--analysis <path>).
//   S2 (fresh fixture, base code): a seeded objPick lottery for a
//     villager holding a fresh, armed, in-range fight memory —
//     200 picks, HUNT pick share, gate diagnosis via
//     objHuntCandidate, and one quoted departure line driven
//     through the real objDepart (emit wrapped to capture it).
//     A departure-line failure is reported honestly and does NOT
//     fail the script (prereg S2); the lottery counts + corpus
//     thread carry the sense bar in that case. Any outcome is
//     reported, none is failed on — except a missing analysis file
//     or an empty chain set, which are loud failures.
// Usage: node scripts/test-returns-a-sense.js [--analysis <path>] [--out <path>]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

function kitVillagers(G, vids) {
  const KIT = [['torso', 'hide_armor', 'Hide Armor'], ['head', 'skull_helm', 'Skull Helm'],
    ['legs', 'canvas_pants', 'Canvas Pants'], ['hands', 'work_gloves', 'Work Gloves'],
    ['feet', 'good_boots', 'Good Boots']];
  for (const vid of vids) {
    const vp = (G.data.villagers || []).find(x => x.id === vid) ||
               (G.data.background_survivors || []).find(x => x.id === vid);
    if (vp) {
      vp.items = ['hunting_spear', 'skull_helm', 'hide_armor', 'canvas_pants', 'work_gloves', 'good_boots'];
      vp.equipped = { melee: { itemId: 'hunting_spear', name: 'Hunting Spear' } };
      for (const [slot, iid, name] of KIT) vp.equipped[slot] = { itemId: iid, name };
    }
  }
  const vv = G.state.village || (G.state.village = {});
  vv.health = vv.health || {};
  for (const vid of vids) vv.health[vid] = 100;
}

async function main() {
  const aIdx = process.argv.indexOf('--analysis');
  const analysisPath = aIdx >= 0 && process.argv[aIdx + 1]
    ? process.argv[aIdx + 1]
    : path.join(REPO, 'evidence', '2026-10-29', 'returns-a-analysis.json');
  if (!fs.existsSync(analysisPath)) {
    console.log(`SENSE-FAIL: analysis file missing: ${analysisPath} (run test-returns-a.js --out first)`);
    process.exit(1);
  }
  const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
  const chains = analysis.chains || [];
  if (!chains.length) {
    console.log('SENSE-FAIL: no chains in analysis — no corpus chain thread exists to read (S1 cannot pass)');
    process.exit(1);
  }
  const longest = chains.slice().sort((a, b) => (b.length - a.length) || (b.totalDamage - a.totalDamage))[0];
  const vids = [...new Set(longest.meetings.map(m => m.vid))];
  const d0 = longest.meetings[0].day, d1 = longest.meetings[longest.meetings.length - 1].day;
  const hunt = analysis.hunt || {};
  const threadDeps = (hunt.allHuntDepartures || []).filter(d => vids.indexOf(d.vid) >= 0 && d.day >= d0 - 1 && d.day <= d1 + 1);
  const threadDrops = (hunt.allHuntDrops || []).filter(d => vids.indexOf(d.vid) >= 0 && d.day >= d0 - 1 && d.day <= d1 + 1);
  console.log('=== S1: longest corpus chain thread, end to end ===');
  console.log(`chain: seed=${longest.seed} beast=${longest.mid} meetings=${longest.length} span=${longest.spanDays}d damage=${longest.totalDamage} terminalHp=${longest.terminalHp} class=${longest.cls} flagged=${longest.flagged}`);
  for (const m of longest.meetings) {
    console.log(`  d${m.day} ${m.vid} ${m.mHpStart}->${m.mHpLeft} ${m.outcome} [${m.retClass}] flags=${JSON.stringify(m.retFlags)} huntTile=${m.retHuntTile}`);
  }
  console.log(`thread window d${d0 - 1}..d${d1 + 1}, villagers=${vids.join(',')}`);
  console.log(`  HUNT departures in window: ${threadDeps.length}`);
  for (const d of threadDeps) console.log(`    d${d.day} ${d.vid} -> ${d.objective.huntMid} @(${d.objective.huntTx},${d.objective.huntTy}) memDay=${d.objective.huntDay}`);
  console.log(`  HUNT drops in window (arrived, quarry gone): ${threadDrops.length}`);
  for (const d of threadDrops) console.log(`    d${d.day} ${d.vid} ${d.mid} @(${d.tx},${d.ty}) dropped=${d.dropped}`);
  const delibInThread = longest.meetings.filter(m => m.retClass === 'DELIBERATE').length;
  console.log(`  DELIBERATE meetings in this thread: ${delibInThread}/${longest.length}`);
  console.log(`  BAND TOTALS (from analysis): deliberate meetings=${(analysis.classCounts || {}).DELIBERATE || 0} orphaned=${(analysis.classCounts || {}).DELIBERATE_ORPHANED || 0} memory-only=${(analysis.classCounts || {}).MEMORY_ONLY || 0} accidental=${(analysis.classCounts || {}).ACCIDENTAL || 0} huntDeparturesW4=${hunt.huntDeparturesW4} huntDropsW4=${hunt.huntDropsW4}`);

  // ---- S2: mechanism fixture ----
  console.log('=== S2: HUNT offer lottery fixture (fresh armed memory, base code) ===');
  // narration:true is REQUIRED to quote a departure line: sim-harness
  // stubs G.say to a no-op by default (telemetry + state carry the
  // signal in sweeps). This fixture only demonstrates the mechanism
  // and the line; the census sweep keeps narration off, as chainkill did.
  const { Game: G, loadFails } = await loadGame({ seed: 75106, mode: 'returns-a-sense', fullTelemetry: false, narration: true });
  if (loadFails.length) throw new Error('loadFails: ' + loadFails.join('; '));
  await setupGame(G);
  const roster = ((G.state.village || {}).roster || []).filter(id => id && id !== G.villagerId);
  if (!roster.length) throw new Error('no non-scholar roster villagers after setup');
  const vid = roster[0];
  kitVillagers(G, [vid]);
  const v = G.state.village || {};
  const hx = (v.px != null) ? v.px : 4;
  const hy = (v.py != null) ? v.py : 4;
  const memTx = hx + 1, memTy = hy;
  let noted = null;
  try { noted = G.objNoteMonsterSighting ? G.objNoteMonsterSighting(vid, 'influencer', memTx, memTy) : null; } catch (e) { noted = null; }
  console.log(`villager=${vid} haven=(${hx},${hy}) memory tile=(${memTx},${memTy}) noted=${JSON.stringify(noted)}`);
  let armed = null, maxD = null, sheltered = null, resting = null, cand = null;
  try { armed = G.objVillagerArmed ? G.objVillagerArmed(vid) : null; } catch (e) { armed = null; }
  try { maxD = G.npcMaxDist ? G.npcMaxDist(vid) : null; } catch (e) { maxD = null; }
  try { sheltered = G.isSheltered ? G.isSheltered(vid) : null; } catch (e) { sheltered = null; }
  try { resting = G.isPostFleeResting ? G.isPostFleeResting(vid) : null; } catch (e) { resting = null; }
  try { cand = G.objHuntCandidate ? G.objHuntCandidate(vid, hx, hy) : null; } catch (e) { cand = null; }
  console.log(`gates: armed=${armed} maxD=${maxD} sheltered=${sheltered} postFleeResting=${resting} huntCandidate=${JSON.stringify(cand)}`);
  const kinds = {};
  let huntObj = null;
  for (let i = 0; i < 200; i++) {
    let o = null;
    try { o = G.objPick ? G.objPick(vid, hx, hy) : null; } catch (e) { console.log(`  objPick throw at i=${i}: ${String(e && e.message || e).slice(0, 120)}`); break; }
    if (!o) break;
    kinds[o.kind] = (kinds[o.kind] || 0) + 1;
    if (o.kind === 'HUNT') huntObj = JSON.parse(JSON.stringify(o));
  }
  console.log(`lottery (200 objPick draws): ${JSON.stringify(kinds)} HUNT share=${((kinds.HUNT || 0) / 200)}`);
  let depLines = [];
  let depErr = null;
  if (huntObj) {
    const origEmit = G.emit;
    try {
      G.emit = function (text, surface) {
        try { depLines.push({ text: String(text), surface: surface || null }); } catch (e) {}
        return origEmit.apply(this, arguments);
      };
      try { G.objDepart(vid, huntObj, hx, hy, true); } catch (e) { depErr = String((e && e.message) || e).slice(0, 160); }
    } catch (e) { depErr = String((e && e.message) || e).slice(0, 160); }
    finally { try { G.emit = origEmit; } catch (e) {} }
    console.log(`departure: huntObj=${JSON.stringify(huntObj)} err=${depErr}`);
    console.log('departure lines captured via emit:');
    for (const l of depLines) console.log(`  [${l.surface}] ${l.text}`);
    if (!depLines.length) console.log('  (no lines captured — departure line NOT driven cleanly; reported honestly per prereg S2)');
  } else {
    console.log('departure: no HUNT objective drawn in 200 picks — no departure line to drive (lottery share 0 is itself the finding)');
  }
  const outIdx = process.argv.indexOf('--out');
  if (outIdx >= 0 && process.argv[outIdx + 1]) {
    fs.mkdirSync(path.dirname(process.argv[outIdx + 1]), { recursive: true });
    fs.writeFileSync(process.argv[outIdx + 1], JSON.stringify({
      s1: { seed: longest.seed, mid: longest.mid, meetings: longest.meetings, threadDeps, threadDrops, delibInThread },
      s2: { vid, haven: [hx, hy], memoryTile: [memTx, memTy], noted, gates: { armed, maxD, sheltered, resting, cand }, lottery: kinds, huntObj, depLines, depErr },
    }, null, 1) + '\n');
    console.log(`wrote ${process.argv[outIdx + 1]}`);
  }
  console.log('RETURNS-SENSE: PASS — corpus thread quoted + mechanism lottery quoted (departure line best-effort, see above)');
}
main().catch(e => { console.error('SENSE-FAIL', e && e.stack || e); process.exit(1); });
