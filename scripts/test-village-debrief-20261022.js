#!/usr/bin/env node
// test-village-debrief-20261022.js — PROOF for rogue P0-4.
//
// BLANK: the village-lost ending screen was a record (Days·Bearers·Plants)
// + lineage, but no pedagogical debrief — failure resolved as story, never
// as curriculum (roguelike-celebration-audit.md G1).
//
// GREEN: Game.villageDebrief() returns 3–5 short lines computed ONLY from
// already-recorded in-run data (codex learnedDay stamps, waveKillLog,
// v.fallen, codexInProgress) — every entry is grounded in a recorded run
// event, nothing is invented, nothing is granted (canon: in-run only, no
// cross-run inheritance; human-skills≠alien-abilities, so no System
// ability may appear). app.js ending() renders the card on village-lost.
// (ending() itself needs DOM and can't run in node — the rendering proof
// is source-text assertions on the card markup, plus the data contract
// the screen reads. Stated plainly, not hidden.)
//
// Usage: node scripts/test-village-debrief-20261022.js
'use strict';
const fs = require('./lib/source-text');
const path = require('path');
const { loadGame, setupGame, runDays, mulberry32 } = require('./sim-harness');
const { competent } = require('./policies/competent');

let pass = 0, fail = 0;
function check(id, ok, detail) {
  if (ok) { pass++; console.log(`  [OK] ${id}`); }
  else { fail++; console.log(`  [FAIL] ${id}${detail ? ' — ' + detail : ''}`); }
}

// independently recompute what the debrief may claim, straight from state
function learnedSet(Game) {
  const cx = (Game.state && Game.state.codex) || {};
  const out = [];
  for (const [pid, e] of Object.entries(cx.plants || {})) {
    if ((e.level || 0) < 1 || (e.identifiedDay || 0) <= 0) continue;
    const p = (Game.data.plants || []).find(x => x.id === pid);
    out.push({ name: p ? p.name : pid, by: e.taughtByName || null });
  }
  for (const [sid, e] of Object.entries(cx.skills || {})) {
    if (e.via === 'background' || (e.learnedDay || 0) <= 0) continue;
    const k = (Game.data.knowledge || []).find(x => x.id === sid);
    out.push({ name: k ? k.name : sid, by: null });
  }
  for (const [rid, e] of Object.entries(cx.recipes || {})) {
    if (e.via === 'background' || (e.learnedDay || 0) <= 0) continue;
    const r = (Game.data.recipes || []).find(x => x.id === rid);
    out.push({ name: r ? r.name : rid, by: e.learnedFrom || null });
  }
  for (const [aid, e] of Object.entries(cx.animals || {})) {
    if ((e.learnedDay || 0) <= 0) continue;
    const a = (Game.data.animals || []).find(x => x.id === aid);
    out.push({ name: a ? a.name : aid, by: null });
  }
  return out;
}

async function main() {
  // ---- real sim to village death ----
  Math.random = mulberry32(4177);
  const { Game } = await loadGame({ seed: 4177, mode: 'debrief-proof', fullTelemetry: false });
  Game.say = () => {};
  await setupGame(Game);
  await runDays(Game, competent, { days: 12 });
  const roster = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
  for (const vid of roster) {
    const nm = ((Game.data.villagers || []).find(x => x.id === vid) || {}).name || 'villager';
    try { Game.registerDeath({ kind: 'villager', villagerId: vid, name: nm, cause: 'the famine', killerId: null }); } catch (e) {}
    try { Game.removeVillager(vid, 'killed'); } catch (e) {}
  }
  try { Game.playerDeath('starvation'); } catch (e) {}
  check('wipe-sets-flags', !!Game.over && !!Game.villageLost, `over=${!!Game.over} villageLost=${!!Game.villageLost}`);

  // purity: the debrief reads state, never writes it
  const before = JSON.stringify(Game.state);
  const lines = Game.villageDebrief();
  check('debrief-returns-array', Array.isArray(lines), `got ${typeof lines}`);
  check('debrief-does-not-mutate', JSON.stringify(Game.state) === before, 'state byte-identical after call');
  check('debrief-line-count', lines.length <= 5, `${lines.length} lines (audit: 3–5)`);
  console.log('  debrief lines:');
  for (const l of lines) console.log('   | ' + l);

  // ---- grounding: every entry traces to a recorded run event ----
  const learned = learnedSet(Game);
  const codexLine = lines.find(l => l.startsWith('📖'));
  if (learned.length) {
    check('codex-line-present', !!codexLine, 'codex grew line present when learnings recorded');
    if (codexLine) {
      const m = codexLine.match(/grew by (\d+)/);
      check('codex-count-grounded', !!m && Number(m[1]) === learned.length,
        `line claims ${m && m[1]}, state has ${learned.length}`);
      // every named example must be a genuinely learned entry (no invented learnings)
      const names = new Set(learned.map(l => l.name));
      // examples are the "among them X, Y, Z" segment before any "(+N more)"
      const exSeg = (codexLine.split('— among them ')[1] || '').split(' (+')[0];
      const examples = exSeg.split(', ').map(s => s.trim()).filter(Boolean);
      const examplesOk = examples.length > 0 && examples.length <= 3 && examples.every(n => names.has(n));
      check('codex-examples-grounded', examplesOk, 'examples: ' + examples.join(', '));
      const taught = learned.filter(l => l.by);
      const teachLine = lines.find(l => l.startsWith('🧑‍🏫'));
      check('teachers-grounded', taught.length === 0 ? !teachLine : !!teachLine,
        `taught=${taught.length}, line=${!!teachLine}`);
      if (teachLine && taught.length) {
        check('teacher-names-grounded', taught.slice(0, 2).every(t => teachLine.includes(t.by) && teachLine.includes(t.name)),
          teachLine.slice(0, 120));
      }
    }
  } else {
    check('codex-line-absent-when-nothing-learned', !codexLine, 'no invented learnings');
  }

  const kills = (Game.state.waveKillLog || []).slice().sort((a, b) => (a.d || 0) - (b.d || 0));
  const killLine = lines.find(l => l.startsWith('⚔️'));
  if (kills.length) {
    check('kill-line-present', !!killLine, 'kill line present when kills recorded');
    if (killLine) {
      const m = killLine.match(/First blood, day (\d+)/);
      check('first-blood-day-grounded', !!m && Number(m[1]) === (kills[0].d || 0),
        `line day ${m && m[1]}, log ${kills[0].d}`);
      const c = killLine.match(/(\d+) beasts? slain/);
      check('kill-count-grounded', !!c && Number(c[1]) === kills.length,
        `line ${c && c[1]}, log ${kills.length}`);
    }
  } else {
    check('kill-line-absent-when-no-kills', !killLine, 'no invented kills');
  }

  const fallen = ((Game.state.village || {}).fallen || []);
  const deathLine = lines.find(l => l.startsWith('💀'));
  if (fallen.length) {
    check('death-line-present', !!deathLine, 'death line present when deaths recorded');
    if (deathLine) {
      const m = deathLine.match(/(\d+) fell/);
      check('death-count-grounded', !!m && Number(m[1]) === fallen.length,
        `line ${m && m[1]}, fallen ${fallen.length}`);
      const causes = [...new Set(fallen.map(f => f.cause || 'the wilds'))];
      check('death-causes-grounded', causes.slice(0, 2).every(c => deathLine.includes(c)),
        'causes: ' + causes.slice(0, 2).join(', '));
    }
  } else {
    check('death-line-absent-when-no-deaths', !deathLine, 'no invented deaths');
  }

  const gaps = (typeof Game.codexInProgress === 'function') ? Game.codexInProgress() : [];
  const gapLine = lines.find(l => l.startsWith('🔍'));
  check('gaps-grounded', gaps.length === 0 ? !gapLine : !!gapLine,
    `inProgress=${gaps.length}, line=${!!gapLine}`);
  if (gapLine && gaps.length) {
    check('gap-descriptors-grounded', gaps.slice(0, 2).every(g => gapLine.includes(g.descriptor)),
      'descriptors from codexInProgress');
  }

  // ---- canon: human-skills≠alien-abilities — no System ability may appear ----
  const abilityNames = (Game.data.abilities || []).map(a => a.name).filter(Boolean);
  const leaked = [];
  for (const l of lines) for (const n of abilityNames) {
    if (n.length > 3 && l.includes(n)) leaked.push(n);
  }
  check('no-ability-leak', leaked.length === 0, leaked.slice(0, 3).join(', ') || 'no System abilities named');

  // ---- empty-run edge case: fresh game, debrief must not crash ----
  Math.random = mulberry32(9918);
  const g2 = await loadGame({ seed: 9918, mode: 'debrief-empty', fullTelemetry: false });
  const G = g2.Game;
  G.say = () => {};
  await setupGame(G);
  let empty = null, threw = null;
  try { empty = G.villageDebrief(); } catch (e) { threw = e; }
  check('empty-run-no-crash', !threw && Array.isArray(empty), threw ? String(threw).slice(0, 100) : `${empty.length} lines`);
  if (empty) {
    // a fresh run records nothing learnable: every line must still be grounded
    const l2 = learnedSet(G);
    check('empty-run-no-invented-learnings', l2.length === 0 ? !empty.find(x => x.startsWith('📖')) : true,
      `learned=${l2.length}, lines=${empty.length}`);
  }

  // ---- rendering: the card markup exists on the village-lost branch ----
  const appSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'app.js'), 'utf8');
  const endingFn = appSrc.slice(appSrc.indexOf('function ending()'));
  check('debrief-card-markup', /What the village learned/.test(endingFn), 'card title in ending()');
  check('debrief-villagelost-only', /st\.villageLost && typeof Game\.villageDebrief/.test(endingFn),
    'renders on village-lost only');
  check('debrief-calls-game', /Game\.villageDebrief\(\)/.test(endingFn), 'ending() calls Game.villageDebrief()');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('THREW: ' + e.stack); process.exit(1); });
