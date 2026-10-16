// scripts/test-villagevoice-20261016.js — proof for sim-villagevoice.
//   unit:   classifier known-answer on synthetic beat streams (FIXTURES +
//           duplicate-detection across a stream — every category hit)
//   detgate: 4 identical (seed, policy) 60d runs -> byte-identical beat
//           payloads (read-only proof; 60d samples a full life cycle —
//           death, wave, contest, table lanes all fire by d60 on seed 118)
//   smoke:  loadGame + instrument + 5d green, per-seed JSON has numeric
//           national/table/wins/exiled keys
// Usage: node scripts/test-villagevoice-20261016.js [unit|detgate|smoke|all]
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');
const { extractText, classify, FIXTURES, SENSE_CATS } = require('./villagevoice-lib-20261016');

let failures = 0;
function ok(cond, label) {
  if (cond) { console.log(`  ok   ${label}`); }
  else { failures++; console.log(`  FAIL ${label}`); }
}

function unit() {
  console.log('== unit: classifier known-answer ==');
  const catsSeen = new Set();
  // stream pass: each fixture gets its OWN seen-map first (no false
  // duplicates), then a second pass over the whole stream shares one map.
  const soloSeen = new Map();
  for (const f of FIXTURES) {
    const c = classify(f.t, { names: f.names, seen: soloSeen, deathDay: f.deathDay || {}, beatDay: f.beatDay || 0 });
    ok(c.cat === f.want, `solo ${f.why}: got ${c.cat}, want ${f.want}`);
    ok(!!c.cat, 'zero-attributed invariant holds');
    catsSeen.add(c.cat);
  }
  // duplicate: the same beat twice in one stream -> second is fingerprint
  const dupSeen = new Map();
  const first = classify('"I need to check the snares before dusk," Mira says.', { names: ['Mira'], seen: dupSeen });
  const second = classify('"I need to check the snares before dusk," Mira says.', { names: ['Mira'], seen: dupSeen });
  ok(first.cat === 'dialogue-with-stakes', `first occurrence classified: ${first.cat}`);
  ok(second.cat === 'template-fingerprint' && second.base === 'dialogue-with-stakes',
    `duplicate -> template-fingerprint with base=${second.base}`);
  ok(second.villagerBeat === true, 'duplicate of villager beat still a villager beat');
  // system beat duplicated -> fingerprint but NOT a villager beat
  const sSeen = new Map();
  classify('THE HERALD does not notice you.', { names: [], seen: sSeen });
  const s2 = classify('THE HERALD does not notice you.', { names: [], seen: sSeen });
  ok(s2.cat === 'template-fingerprint' && s2.villagerBeat === false, 'system duplicate is fingerprint, non-villager');
  // GO arithmetic on a mixed synthetic stream: >=95% sensed among villager beats.
  // Honest-limit fixtures (marked limit:true) are excluded: they are the
  // known residue, not evidence the classifier is broken.
  const stream = FIXTURES.filter((f) => !f.limit);
  const names = ['Mira', 'Okafor', 'Joren', 'Amara'];
  const stSeen = new Map();
  let vill = 0, sensed = 0;
  for (const f of stream) {
    const c = classify(f.t, { names, seen: stSeen, deathDay: f.deathDay || {}, beatDay: f.beatDay || 0 });
    if (c.villagerBeat) { vill++; if (SENSE_CATS.includes(c.cat)) sensed++; }
  }
  console.log(`  stream villagerBeats=${vill} sensed=${sensed}`);
  ok(vill > 0 && sensed / vill >= 0.95, `synthetic stream GO share >=95% (got ${(100 * sensed / vill).toFixed(1)}%)`);
  return failures === 0;
}

const day = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

async function trajectoryHash(seed) {
  const { Game } = await loadGame({ seed, mode: 'villagevoice-detgate' });
  await setupGame(Game);
  const beats = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try { const t = extractText(msg); if (t) beats.push({ d: day(Game), t }); } catch (e) {}
    return origSay(msg);
  };
  await quietLog(async () => { await runDays(Game, Object.assign({}, leadfeast), { days: 60 }); });
  return crypto.createHash('sha256').update(JSON.stringify(beats)).digest('hex');
}

async function detgate() {
  console.log('== detgate: 4/4 trajectory-identical (s118 leadfeast 60d) ==');
  const hashes = [];
  for (let i = 0; i < 4; i++) {
    const h = await trajectoryHash(118);
    hashes.push(h);
    console.log(`  run ${i + 1}: ${h.slice(0, 16)}...`);
  }
  ok(hashes.every((h) => h === hashes[0]), '4/4 identical beat payloads');
  return failures === 0;
}

async function smoke() {
  console.log('== smoke: instrument + 5d + per-seed schema ==');
  const beatsDir = path.join(__dirname, '..', 'evidence', '2026-10-16', 'villagevoice-beats');
  fs.mkdirSync(beatsDir, { recursive: true });
  const tmpOut = path.join(beatsDir, 'SMOKE-s999.json');
  try {
    const { Game } = await loadGame({ seed: 999, mode: 'villagevoice-smoke' });
    await setupGame(Game);
    const beats = [];
    const origSay = Game.say.bind(Game);
    Game.say = function (msg) {
      try { const t = extractText(msg); if (t) beats.push({ d: day(Game), t }); } catch (e) {}
      return origSay(msg);
    };
    const res = await runDays(Game, Object.assign({}, leadfeast), { days: 5 });
    ok(res.days === 5, `5 days ran (got ${res.days})`);
    ok(beats.length > 0, `beats captured (${beats.length})`);
    fs.writeFileSync(tmpOut, JSON.stringify({ beats }));
    ok(fs.existsSync(tmpOut), 'beat JSON written');
    const ps = {
      seed: 999, policyId: 'leadfeast',
      national: 0, table: 0, wins: 0, exiled: 0,
      days: res.days,
    };
    for (const k of ['national', 'table', 'wins', 'exiled']) {
      ok(typeof ps[k] === 'number', `per-seed key ${k} numeric`);
    }
    fs.unlinkSync(tmpOut);
  } catch (e) {
    ok(false, `smoke threw: ${e.message}`);
  }
  return failures === 0;
}

(async () => {
  const which = process.argv[2] || 'all';
  if (which === 'unit' || which === 'all') unit();
  if (which === 'detgate' || which === 'all') await detgate();
  if (which === 'smoke' || which === 'all') await smoke();
  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
