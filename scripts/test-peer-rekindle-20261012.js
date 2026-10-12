#!/usr/bin/env node
// test-peer-rekindle-20261012.js — PROOF for the journey-scale3 blank fix.
//
// BLANK (observed in journey-scale3-20261012 seed 20202): Emberhold's
// subordinate link snapped on day 65 — narrated aloud ("Nobody meant it.
// That's how these things go."). On day 91 the representative walked back in
// and formed a COVENANT with Emberhold, and the game said NOTHING about the
// break: "The relationship starts at trust 30" as if the table never broke.
// The primary/subordinate path remembers broken links ("debts survive the
// break"), but _formPeerLink formed with amnesia.
//
// FIX (src/js/hierarchy.js, _formPeerLink): after formation, scan for the
// latest broken link with the same unordered pair (any kind) and say one
// memory line aloud + a history note. No balance change (trust still 30).
//
// Checks (each x3 seeds):
//   1. covenant after a broken primary link -> the memory line fires with the
//      right village name and the days-ago count.
//   2. trade charter after a broken link -> same memory line.
//   3. covenant with NO prior broken link -> NO memory line (no false positive).
//   4. broken link with a DIFFERENT village -> NO memory line (pair-matched).
//   5. the new link still starts at trust 30 (no balance change).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = [11, 22, 33];
let failures = 0;
function check(name, cond, extra) {
  if (cond) { console.log(`  ok: ${name}`); }
  else { failures++; console.log(`  FAIL: ${name}${extra ? ' — ' + extra : ''}`); }
}

function saidLines(Game) {
  const out = [];
  const _say = Game.say;
  Game.say = function (...a) { out.push(String(a[0] || '')); return _say.apply(this, a); };
  return out;
}

function knownVillage(Game) {
  const ovs = (Game.state.otherVillages || []).filter(v => v && v.id !== 'haven');
  return ovs.length ? ovs[0] : null;
}

async function runSeed(seed) {
  console.log(`seed ${seed}:`);
  const { Game } = await loadGame({ seed, mode: 'test-peer-rekindle', fullTelemetry: false });
  await setupGame(Game);
  const said = saidLines(Game);

  const v1 = knownVillage(Game);
  if (!v1) { check('a known village exists', false); return; }
  v1.opinion = 60; // guarantee the judge accepts (>=55 band)
  v1.rumored = true; // the early-contact curve: Haven has heard of this fire

  // 1-2. form primary link, break it, wait, form covenant -> memory line
  let linkId = null;
  try {
    const r = Game.proposeLink(v1.id);
    const links = Game.hierarchyState().filter(l => l.status === 'active');
    linkId = links.length ? links[links.length - 1].id : null;
  } catch (e) { check('proposeLink ran', false, e.message); return; }
  check('primary link formed', !!linkId);
  Game.state.scholar.day += 10;
  const breakDay = Game.state.scholar.day;
  try { Game.breakLink(linkId, 'walked'); } catch (e) { check('breakLink ran', false, e.message); return; }
  check('link broke', Game.hierarchyState().find(l => l.id === linkId).status === 'broken');
  Game.state.scholar.day += 26; // 26 days later, like the observed run
  said.length = 0;
  try { Game.proposeCovenant(v1.id); } catch (e) { check('proposeCovenant ran', false, e.message); return; }
  const cov = Game.hierarchyState().find(l => l.status === 'active' && l.kind === 'covenant' && l.b === v1.id);
  check('covenant formed', !!cov);
  const memLine = said.find(s => /Nobody says the last table was nothing/.test(s));
  check('memory line said aloud', !!memLine, said.slice(-3).join(' | ').slice(0, 200));
  check('memory line names the wait', !!memLine && /26 days ago/.test(memLine), memLine);
  check('trust still starts at 30', cov && cov.trust === 30, 'trust=' + (cov && cov.trust));
  const note = (cov.history || []).find(h => h.kind === 'formed' && /Rekindled/.test(h.note || ''));
  check('history note recorded', !!note);

  // 2. trade charter after a broken link -> memory line too
  // (break the covenant, wait, form a trade charter with the same village)
  try { Game.breakLink(cov.id, 'walked'); } catch (e) {}
  Game.state.scholar.day += 5;
  said.length = 0;
  try { Game.proposeTrade(v1.id); } catch (e) { check('proposeTrade ran', false, e.message); return; }
  const trade = Game.hierarchyState().find(l => l.status === 'active' && l.kind === 'trade' && l.b === v1.id);
  check('trade charter formed', !!trade);
  const memLine2 = said.find(s => /Nobody says the last table was nothing/.test(s));
  check('memory line fires for trade too', !!memLine2);
  check('trade days-ago is 5', !!memLine2 && /5 days ago/.test(memLine2), memLine2);

  // 3-4. no false positives: fresh village, and different-village broken link
  const v2 = (Game.state.otherVillages || []).find(v => v && v.id !== 'haven' && v.id !== v1.id);
  if (v2) {
    v2.opinion = 60;
    v2.rumored = true;
    said.length = 0;
    try { Game.proposeCovenant(v2.id); } catch (e) {}
    const cov2 = Game.hierarchyState().find(l => l.status === 'active' && l.kind === 'covenant' && l.b === v2.id);
    check('second covenant formed', !!cov2);
    const memLine3 = said.find(s => /Nobody says the last table was nothing/.test(s));
    check('no memory line for a village never broken with', !memLine3);
  } else {
    console.log('  (only one village known — skipping false-positive checks)');
  }
}

(async () => {
  for (const s of SEEDS) {
    try { await runSeed(s); }
    catch (e) { failures++; console.log(`seed ${s} FATAL: ` + (e && e.stack || e)); }
  }
  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
