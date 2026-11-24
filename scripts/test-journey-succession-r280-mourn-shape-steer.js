// Proof: journey-succession r280 — mourning second sittings steer away
// from the first sitting's shape (r279 MOURN-TEMPLATE finding).
//
// r279 found 2 verbatim repeats at the d+3 -> d+8 edge — 34544 Gabriela
// (Tashi d+3 / Javier d+8, opener:owed-favor) and 34549 Claire (Tebogo
// d+3 / Enrique d+8, opener:burnt-piece). Different speakers, same shape,
// same dead, dplus difference exactly 5. Root cause: the mourning opener
// pool is picked per-villager, and villageLineFresh (LINE_FRESH_DAYS=5)
// counts a difference of exactly 5 as FRESH, so nothing steers the
// second sitting away from the first sitting's shape.
//
// Fix (convoTopics.js, topic2Ask): a village-level shape memory per dead
// person, state.village.mournShapesServed (deadId -> [unfilled template
// strings]). In the stage-1 fill-aware retry, candidates already recorded
// for THIS dead person are skipped (single-name mourning only, deadId
// present); the final template is recorded for the dead person after the
// decision. If NO candidate passes, the original pick returns unchanged
// (the documented last-resort gap — a dry, not a wrong shape).
//
// Staging the r279 pair shape: the dead is a BEARER (lineage entry with a
// cause), so the d+3 sitting rides the fresh-corpse branch and the d+8
// sitting rides the mantle branch (grief decayed to 0 by then — with
// grief still 1 the d+8 event is NAMELESS, and the mantle branch never
// fires; that is the wild mechanism, verified by probe). Both sittings
// name the same dead with the same deadId and the same 5-template pool.
// The wild 5-day gap also evicts the first sitting's line from the
// 48-entry run-ledger window, so the test floods the ledger with dummy
// chunks between the sittings to reproduce that eviction honestly —
// without it the r267 retry would mask the defect on base.
//
// Cases (each in its own process; never two harnesses in one process):
//   steer       — d+3 sitting (speaker A), flood the ledger, d+8 sitting
//                 (speaker B, different villager) with B's per-villager
//                 dedupe pre-populated so the pick MUST be A's template
//                 on base. FIXED: B serves a DIFFERENT template; UNFIXED:
//                 B serves A's template verbatim (RED).
//   control     — same staging, NO pre-population, NO flood: both sittings
//                 serve honestly (any of the 5 generics), none dry —
//                 the fix must not change any unblocked path.
//   exhaustion  — all 5 templates pre-recorded for the dead: the original
//                 pick returns unchanged, no crash, the served line still
//                 names the dead (the documented last-resort gap).
//
// Usage: node scripts/test-journey-succession-r280-mourn-shape-steer.js [case]
//   case: steer | control | exhaustion | all (default: all, sequential children)
'use strict';
const { execFileSync } = require('child_process');
const CASE = process.argv[2] || 'all';
const CASES = ['steer', 'control', 'exhaustion'];
const SEED = { steer: 5802, control: 5803, exhaustion: 5804 };

const DRY = [
  '"...Sorry, lost my train of thought."',
  '"Hm. Never mind — go on."',
  '"...Actually, forget it."',
  '"...Where was I? Gone. Ask me something else."',
  '"Huh. That went clean out of my head."',
  '"...No, it\'s not coming back. What were you saying?"',
  '"Lost it. The thought, I mean. Go on."',
  '"...Sorry — that one slipped away from me."',
];
const isDry = (t) => DRY.some(d => String(t || '').includes(d.replace(/"/g, '')));
function lastNpcLine(Game, vid) {
  const c = Game.convoGet(vid);
  const tr = (c && c.transcript) || [];
  for (let i = tr.length - 1; i >= 0; i--) {
    if (tr[i].who === 'them') return String(tr[i].text || '');
  }
  return '';
}
function transcriptHasDry(Game, vid) {
  const c = Game.convoGet(vid);
  const tr = (c && c.transcript) || [];
  return tr.some(e => e.who === 'them' && isDry(e.text));
}
function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
// Stage a BEARER death: fresh corpse (dayDied) + lineage entry (same day,
// with a cause) so the d+3 sitting rides the fresh branch and the d+8
// sitting rides the mantle branch. Returns the dead's first name.
function stageDeath(Game, vid, dayDied) {
  let name = null;
  try {
    const rc = ((Game.state.village || {}).rosterChars || {})[vid];
    if (rc && rc.name) name = rc.name;
  } catch (e) {}
  if (!name) {
    try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) name = ch.name; } catch (e) {}
  }
  if (!name) name = String(vid);
  Game.state.corpses = [{ villagerId: vid, name, kind: 'person', dayDied, witnesses: [] }];
  try {
    const lin = (typeof Game.lineage === 'function') ? Game.lineage() : null;
    if (lin) lin.push({ name, villagerId: vid, day: dayDied, cause: 'the wild' });
  } catch (e) {}
  return firstName(name);
}
// Which of the pool's templates produced the served line: fill each
// candidate for this speaker and substring-match the filled core.
function templateOf(Game, vid, served, pool) {
  for (const cand of pool) {
    let filled = null;
    try { filled = Game.t2fill(cand, Game.vpOf(vid), vid); } catch (e) { filled = null; }
    if (!filled) continue;
    const core = String(filled).replace(/^"|"$/g, '');
    if (core && String(served).indexOf(core) !== -1) return cand;
  }
  return null;
}
// Flood the run ledger with dummy chunks (trimmed to the 48-entry window)
// so the first sitting's line is evicted — the wild 5-day gap, in miniature.
function floodRunLedger(Game) {
  try {
    const ledger = Game.convoRunLedger();
    for (let i = 0; i < 48; i++) ledger.push('proof-flood-chunk-' + i);
    while (ledger.length > 48) ledger.shift();
  } catch (e) {}
}
async function runCase(mode) {
  const { loadGame, setupGame } = require('./sim-harness.js');
  const { Game } = await loadGame({ seed: SEED[mode], mode: 'succession-r280-mourn-shape-steer-proof', fullTelemetry: true });
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  v.trust = v.trust || {};
  for (const id of roster) v.trust[id] = 90;
  v.grief = 1;
  Game.state.scholar.day = 40;
  const results = [];
  function ok(label, cond, detail) { results.push([label, !!cond, String(detail == null ? '' : detail)]); }
  ok(mode + ': roster has >= 3 villagers', roster.length >= 3, 'roster=' + roster.length);
  if (roster.length < 3) { console.log('FAIL roster too small'); process.exit(1); }
  const speakerA = roster[0];
  const speakerB = roster[2];
  const deadVid = roster[1];
  const dname = stageDeath(Game, deadVid, 37);
  const evA = (typeof Game.t2LatelyEvent === 'function') ? Game.t2LatelyEvent(speakerA) : null;
  ok(mode + ': d+3 event is named mourning for ' + dname, !!(evA && evA.kind === 'mourning' && evA.name === dname && evA.deadId === deadVid), JSON.stringify(evA));
  if (!evA || evA.kind !== 'mourning') { console.log('FAIL no d+3 mourning event'); process.exit(1); }
  const poolA = (typeof Game.t2gen_lately === 'function') ? Game.t2gen_lately(speakerA) : [];
  ok(mode + ': d+3 mourning pool is the 5 generics', Array.isArray(poolA) && poolA.length === 5, 'pool=' + poolA.length);
  if (!Array.isArray(poolA) || poolA.length !== 5) { console.log('FAIL pool not 5 generics'); process.exit(1); }
  // Sitting A (d+3): ask about the dead, record the served template.
  Game.startConvo(speakerA);
  Game.convoTurn(speakerA, 'alive:event:mourning');
  const servedA = lastNpcLine(Game, speakerA);
  const t1 = templateOf(Game, speakerA, servedA, poolA);
  ok(mode + ': d+3 serving names the dead', servedA.indexOf(dname) !== -1, JSON.stringify(servedA));
  ok(mode + ': d+3 template identified', !!t1, JSON.stringify(servedA));
  ok(mode + ': d+3 no dry line', !transcriptHasDry(Game, speakerA), '');
  if (!t1) { console.log('FAIL could not identify d+3 template'); process.exit(1); }
  // Advance to d+8: grief decayed (the wild condition), mantle branch names
  // the same dead with the same deadId and the same 5-template pool.
  Game.state.scholar.day = 45;
  v.grief = 0;
  const evB = (typeof Game.t2LatelyEvent === 'function') ? Game.t2LatelyEvent(speakerB) : null;
  ok(mode + ': d+8 event is named mourning for ' + dname, !!(evB && evB.kind === 'mourning' && evB.name === dname && evB.deadId === deadVid), JSON.stringify(evB));
  if (!evB || evB.kind !== 'mourning') { console.log('FAIL no d+8 mourning event'); process.exit(1); }
  const poolB = (typeof Game.t2gen_lately === 'function') ? Game.t2gen_lately(speakerB) : [];
  ok(mode + ': d+8 mourning pool is the 5 generics', Array.isArray(poolB) && poolB.length === 5, 'pool=' + poolB.length);
  if (mode === 'steer') floodRunLedger(Game);
  if (mode === 'exhaustion') {
    // All 5 templates already recorded for this dead: the retry finds
    // nothing and the original pick returns unchanged.
    try {
      v.mournShapesServed = v.mournShapesServed || {};
      v.mournShapesServed[deadVid] = poolB.slice();
    } catch (e) {}
  }
  Game.startConvo(speakerB);
  if (mode === 'steer') {
    // Force the pick to A's template: pre-populate B's per-villager dedupe
    // with the other 4, so convoPick MUST draw T1 (as the wild pick did).
    const cB = Game.convoGet(speakerB);
    cB.said = cB.said || {};
    cB.said['t2:lately'] = poolB.filter(t => t !== t1);
  }
  Game.convoTurn(speakerB, 'alive:event:mourning');
  const servedB = lastNpcLine(Game, speakerB);
  const t2 = templateOf(Game, speakerB, servedB, poolB);
  ok(mode + ': d+8 serving names the dead', servedB.indexOf(dname) !== -1, JSON.stringify(servedB));
  ok(mode + ': d+8 template identified', !!t2, JSON.stringify(servedB));
  ok(mode + ': d+8 no dry line', !transcriptHasDry(Game, speakerB), '');
  if (mode === 'steer') {
    ok('steer: d+8 template DIFFERS from the d+3 template', !!t2 && t2 !== t1, 'd+3=' + JSON.stringify(t1) + ' d+8=' + JSON.stringify(t2));
  }
  let fails = 0;
  for (const [label, pass, detail] of results) {
    console.log((pass ? 'PASS' : 'FAIL') + ' ' + label + (detail ? ' — ' + detail : ''));
    if (!pass) fails++;
  }
  console.log(mode.toUpperCase() + ' ' + (fails === 0 ? 'PASS' : 'FAIL') + ' (' + (results.length - fails) + '/' + results.length + ')');
  process.exit(fails === 0 ? 0 : 1);
}
if (CASE === 'all') {
  let fails = 0;
  for (const name of CASES) {
    try {
      execFileSync(process.execPath, [__filename, name], { stdio: 'inherit' });
    } catch (e) { fails++; }
  }
  console.log('ALL ' + (fails === 0 ? 'PASS' : 'FAIL'));
  process.exit(fails === 0 ? 0 : 1);
}
runCase(CASE).catch(e => { console.error(e); process.exit(1); });
