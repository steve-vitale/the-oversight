#!/usr/bin/env node
// scripts/test-funnel-a-sense.js — sim-funnel-a sense tests.
// SENSE-TESTING LAW, two reads:
//   S1 (corpus-derived): the FULL trace of the band's one HUNT
//     attempt triple (seed 75106, visjoin_115, eulogy) — every
//     anchor/surviving meeting, note, pick, departure, and drop in
//     order, quoted verbatim from the funnel corpus rows (not
//     summarized into counts first). A second triple trace is
//     printed in compact form for contrast. The judgment is about
//     meaning and coherence: does the trace read as a person
//     deciding, walking, and finding nothing — or as noise?
//   S2 (fresh fixture, base code): the funnel recorder installed
//     on a real game — a seeded wave-4 fight memory via
//     objNoteMonsterSighting, then objPick driven until pick
//     records exist. Asserts the pick record shape the taxonomy
//     depends on (pre-pick memories, chosen kind, candidate at
//     pick time, gate flags) and quotes one pick record verbatim.
//     A missing pick record is a loud failure (the recorder, not
//     the lottery, is what this proves).
// Usage: node scripts/test-funnel-a-sense.js [--analysis <path>]
//   [--out <path>]
// Analysis default: evidence/2026-10-29/funnel-a-analysis.json
// (written by test-funnel-a.js --out). Corpus default:
// evidence/2026-10-29/perseed-funnel-a/.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');
const { newStore: newFunnelStore, installFunnelDiag } = require('./policies/funnel-diag');

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
    : path.join(REPO, 'evidence', '2026-10-29', 'funnel-a-analysis.json');
  if (!fs.existsSync(analysisPath)) {
    console.log(`SENSE-FAIL: analysis file missing: ${analysisPath} (run test-funnel-a.js --out first)`);
    process.exit(1);
  }
  const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
  const triples = analysis.triples || [];
  if (triples.length !== 19) {
    console.log(`SENSE-FAIL: expected 19 triples in analysis, got ${triples.length}`);
    process.exit(1);
  }
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-29', 'perseed-funnel-a');
  const attempt = triples.find(t => t.seed === 75106 && t.vid === 'visjoin_115' && t.mid === 'eulogy');
  if (!attempt) {
    console.log('SENSE-FAIL: attempt triple (75106 visjoin_115 eulogy) missing from analysis');
    process.exit(1);
  }
  console.log('=== S1: full survivor-triple trace, verbatim (attempt triple) ===');
  console.log(`triple: s${attempt.seed} ${attempt.vid} ${attempt.mid} class=${attempt.cls} stage=${attempt.stage} :: ${attempt.sub}`);
  const row = JSON.parse(fs.readFileSync(path.join(evidDir, `s${attempt.seed}-fresh.json`), 'utf8'));
  const vid = attempt.vid, mid = attempt.mid;
  const anchorDay = attempt.anchorDay;
  // Verbatim trace: anchor + later judgedA meetings (fieldparty),
  // notes + picks (funnel), departures + drops (returns), all for
  // this vid, in part order within each channel, printed as
  // recorded — no rewording, no aggregation.
  const fpMs = (row.fieldparty.meetings || []).filter(m => m.vid === vid && m.mid === mid);
  const notes = (row.funnel.notes || []).filter(n => n.vid === vid && n.mid === mid);
  const picks = (row.funnel.picks || []).filter(p => p.vid === vid);
  const deps = (row.returns.departures || []).filter(d => d.vid === vid);
  const drops = (row.returns.drops || []).filter(d => d.vid === vid && d.mid === mid);
  console.log(`-- meetings (fieldparty, vid+mid, ${fpMs.length}) --`);
  for (const m of fpMs) console.log(`  MEETING d${m.day} part=${m.part} ${m.vid} ${m.mid} ${m.mHpStart}->${m.mHpLeft} ${m.outcome} caller=${m.caller} channel=${m.channel}`);
  console.log(`-- notes (funnel, vid+mid, ${notes.length}) --`);
  for (const n of notes) console.log(`  NOTE d${n.day} part=${n.part} dayPart=${n.dayPart} ${n.vid} ${n.mid} @(${n.tx},${n.ty}) refreshed=${n.refreshed} listLenAfter=${n.listLenAfter} evicted=${JSON.stringify(n.evicted)} post=${JSON.stringify(n.postSightings)}`);
  console.log(`-- picks (funnel, vid, ${picks.length}; showing picks from anchor day ${anchorDay} on) --`);
  for (const p of picks.filter(p => p.day >= anchorDay)) {
    console.log(`  PICK d${p.day} part=${p.part} dayPart=${p.dayPart} ${p.vid} chosen=${p.chosen ? p.chosen.kind + '/' + p.chosen.state + '/hunt=' + (p.chosen.huntMid || '-') + '@(' + p.chosen.huntTx + ',' + p.chosen.huntTy + ')/memDay=' + p.chosen.huntDay : 'null'} candidate=${p.candidate ? p.candidate.mid + '@(' + p.candidate.tx + ',' + p.candidate.ty + ')/memDay=' + p.candidate.day : 'null'} gates=${JSON.stringify(p.gates)} pre=${JSON.stringify(p.preSightings)}`);
  }
  console.log(`-- departures (returns, vid, ${deps.length}; HUNT + LEAVE only) --`);
  for (const d of deps.filter(d => d.objective && (d.objective.kind === 'HUNT' || d.objective.kind === 'LEAVE'))) {
    console.log(`  DEPART d${d.day} part=${d.part} ${d.vid} ${d.objective.kind} hunt=${d.objective.huntMid || '-'} @(${d.objective.huntTx},${d.objective.huntTy}) memDay=${d.objective.huntDay}`);
  }
  console.log(`-- drops (returns, vid+mid, ${drops.length}) --`);
  for (const d of drops) console.log(`  DROP d${d.day} part=${d.part} ${d.vid} ${d.mid} @(${d.tx},${d.ty}) dropped=${d.dropped}`);
  const deaths = (row.deathsList || []).filter(d => d.who === vid);
  console.log(`-- deaths (vid, ${deaths.length}) --`);
  for (const d of deaths) console.log(`  DEATH d${d.day} ${d.who} cause=${d.cause} player=${d.player}`);
  console.log('S1-JUDGMENT: (written in evidence; the trace above is the exhibit)');
  // Contrast triple: first triple in analysis order that is not the attempt.
  const other = triples.find(t => !(t.seed === 75106 && t.vid === 'visjoin_115' && t.mid === 'eulogy'));
  console.log(`=== S1b: contrast triple (compact): s${other.seed} ${other.vid} ${other.mid} anchor d${other.anchorDay} class=${other.cls} :: ${other.sub} counts=${JSON.stringify(other.counts)} ===`);

  console.log('=== S2: live pick-capture fixture (funnel recorder on a real game) ===');
  const { Game: G, loadFails } = await loadGame({ seed: 75106, mode: 'funnel-a-sense', fullTelemetry: false, narration: true });
  if (loadFails.length) throw new Error('loadFails: ' + loadFails.join('; '));
  await setupGame(G);
  const roster = ((G.state.village || {}).roster || []).filter(id => id && id !== G.villagerId);
  if (!roster.length) throw new Error('no non-scholar roster villagers after setup');
  const fvid = roster[0];
  kitVillagers(G, [fvid]);
  const fuStore = newFunnelStore();
  installFunnelDiag(G, fuStore);
  const v = G.state.village || {};
  const hx = (v.px != null) ? v.px : 4;
  const hy = (v.py != null) ? v.py : 4;
  let noted = null;
  try { noted = G.objNoteMonsterSighting ? G.objNoteMonsterSighting(fvid, 'influencer', hx + 1, hy) : null; } catch (e) { noted = null; }
  console.log(`villager=${fvid} haven=(${hx},${hy}) noted=${JSON.stringify(noted)}`);
  console.log(`note records after seeding: ${fuStore.notes.length} (expect >= 1)`);
  for (const n of fuStore.notes) console.log(`  NOTE d${n.day} ${n.vid} ${n.mid} @(${n.tx},${n.ty}) refreshed=${n.refreshed} listLenAfter=${n.listLenAfter}`);
  let armed = null, maxD = null, cand = null;
  try { armed = G.objVillagerArmed ? G.objVillagerArmed(fvid) : null; } catch (e) { armed = null; }
  try { maxD = G.npcMaxDist ? G.npcMaxDist(fvid) : null; } catch (e) { maxD = null; }
  try { cand = G.objHuntCandidate ? G.objHuntCandidate(fvid, hx, hy) : null; } catch (e) { cand = null; }
  console.log(`gates: armed=${armed} maxD=${maxD} huntCandidate=${JSON.stringify(cand)}`);
  const kinds = {};
  for (let i = 0; i < 200; i++) {
    let o = null;
    try { o = G.objPick ? G.objPick(fvid, hx, hy) : null; } catch (e) { console.log(`  objPick throw at i=${i}: ${String(e && e.message || e).slice(0, 120)}`); break; }
    if (!o) break;
    kinds[o.kind] = (kinds[o.kind] || 0) + 1;
    // Re-install is harmless (idempotent per store); the recorder
    // stays installed across picks because objPick does not
    // reinstall the game object. No action needed per pick.
  }
  console.log(`lottery (200 objPick draws): ${JSON.stringify(kinds)}`);
  console.log(`pick records captured: ${fuStore.picks.length} (expect >= 1 — wave-4 memory held throughout)`);
  if (!fuStore.picks.length) {
    console.log('SENSE-FAIL: funnel recorder captured zero picks for a wave-4 memory holder — pick-time capture is broken');
    process.exit(1);
  }
  const first = fuStore.picks[0];
  console.log('first pick record, verbatim:');
  console.log(`  ${JSON.stringify(first)}`);
  const shapeOk = !!(first.vid && first.chosen && Array.isArray(first.preSightings)
    && first.preSightings.some(s => s[0] === 'influencer')
    && first.gates && typeof first.gates.armed === 'boolean'
    && ('candidate' in first));
  console.log(`pick record shape: ${shapeOk ? 'PASS' : 'FAIL'} (vid + chosen + preSightings with influencer + gates.armed boolean + candidate field)`);
  if (!shapeOk) { console.log('SENSE-FAIL: pick record shape incomplete'); process.exit(1); }
  const huntPicks = fuStore.picks.filter(p => p.chosen && p.chosen.kind === 'HUNT');
  console.log(`HUNT picks among captured: ${huntPicks.length}`);
  const outIdx = process.argv.indexOf('--out');
  if (outIdx >= 0 && process.argv[outIdx + 1]) {
    fs.mkdirSync(path.dirname(process.argv[outIdx + 1]), { recursive: true });
    fs.writeFileSync(process.argv[outIdx + 1], JSON.stringify({
      s1: { attempt: { seed: attempt.seed, vid: attempt.vid, mid: attempt.mid, cls: attempt.cls, sub: attempt.sub },
        meetings: fpMs, notes, picks: picks.filter(p => p.day >= anchorDay),
        departures: deps.filter(d => d.objective && (d.objective.kind === 'HUNT' || d.objective.kind === 'LEAVE')),
        drops, deaths },
      s1b: other,
      s2: { vid: fvid, haven: [hx, hy], noted, gates: { armed, maxD, cand }, lottery: kinds,
        pickCount: fuStore.picks.length, firstPick: first, huntPicks: huntPicks.length, shapeOk },
    }, null, 1) + '\n');
    console.log(`wrote ${process.argv[outIdx + 1]}`);
  }
  console.log('FUNNEL-SENSE: PASS — verbatim attempt trace quoted + live pick capture proven');
}
main().catch(e => { console.error('SENSE-FAIL', e && e.stack || e); process.exit(1); });
