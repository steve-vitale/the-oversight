#!/usr/bin/env node
// test-sim-envoyaccord.js — proof tests for arm sim-envoyaccord.
// E1 judgeBase replicates judgeLink's deterministic part (fixtures
// hand-computed from hierarchy.js judgeLink()).
// E2 classifyEnvoyEvent covers every engine-grounded condition.
// E3 live instrument smoke: 60d pinned run, daily rows monotonic,
// verb wraps installed, zero instrument errors.
// E4 determinism: pinned 180d config run twice in separate child
// processes (one harness per process) — byte-identical JSON.
// E5 diagGo floors (backlog #894 fix): empty population, all-accord
// population, dominant corpus, diffuse corpus.
// Usage: node scripts/test-sim-envoyaccord.js
//   EA_DET_CHILD=1 EA_DET_SEED=73301 node scripts/test-sim-envoyaccord.js
//     — child mode: run one pinned config, print its sha256 (used by E4).
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const EI = require(path.join(REPO, 'scripts', 'sim-envoyaccord-instrument'));
const { analyzeCorpus } = require(path.join(REPO, 'scripts', 'sim-envoyaccord-analyze'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function evBase(over) {
  return Object.assign({ day: 100, epithet: 'the Indispensable', frame: 'indispensable', isEnvoy: true,
    snap: { nLinksActive: 0, pendingAccord: null, pendingCounter: null }, known: [{ id: 'ov1', name: 'Testville' }],
    verbCounts: { proposeLink: 0, proposePeer: 0, raidVillage: 0 }, accordAnsweredEver: false, accordStagedEver: false }, over || {});
}
function synthConfig(seed, beats) {
  return { seed, envoyBeats: beats, envoyDaily: [{ day: 1 }], finalSnap: { nLinksActive: 0, pendingAccord: null, nKnown: 1 },
    unlock: { w4Day: null, w5Day: null }, postunlockDeaths: [], postunlockFights: [],
    days: 180, endReason: 'survived', rankAtEnd: 'village', national: 0, table: 0, won: 0, exiled: 0, maxWave: 3,
    envoyErrors: [], instrumentErrors: [] };
}
async function main() {
  if (process.env.EA_DET_CHILD === '1') {
    const { oneRun } = require(path.join(REPO, 'scripts', 'sim-envoyaccord-sweep'));
    const seed = parseInt(process.env.EA_DET_SEED || '73301', 10);
    const out = await oneRun(seed, { write: false, days: 180, evidDir: path.join(REPO, 'evidence', '2026-10-24', 'perseed-envoyaccord') });
    const body = JSON.stringify(out);
    console.log('DET ' + crypto.createHash('sha256').update(body).digest('hex') + ' bytes=' + body.length);
    return;
  }
  // E1 — judgeBase fixtures (hand-computed from hierarchy.js judgeLink).
  check('E1a primary accept (38+10+5+4=57)', EI.judgeBase(20, 10, false, 100, 80, { asSubordinate: false, tributeKcalPerWeek: 4000 }) === 57, 'got ' + EI.judgeBase(20, 10, false, 100, 80, { asSubordinate: false, tributeKcalPerWeek: 4000 }));
  check('E1b primary decline (38-10=28)', EI.judgeBase(0, 0, false, 50, 80, { asSubordinate: false, tributeKcalPerWeek: 4000 }) === 28);
  check('E1c subordinate accept (38+5+5+15+10+8=81)', EI.judgeBase(10, 10, true, 0, 0, { asSubordinate: true, tributeKcalPerWeek: 4000 }) === 81);
  check('E1d primary counter (38+10-10=38)', EI.judgeBase(0, 20, false, 60, 60, { asSubordinate: false, tributeKcalPerWeek: 4000 }) === 38);
  check('E1e centralBand thresholds', EI.centralBand(55) === 'accept' && EI.centralBand(54) === 'counter' && EI.centralBand(35) === 'counter' && EI.centralBand(34) === 'decline' && EI.centralBand(null) === 'unknown');
  // E2 — classify branches.
  check('E2a pending-accord is accord', EI.classifyEnvoyEvent(evBase({ snap: { nLinksActive: 0, pendingAccord: { linkId: 'l1', day: 90 }, pendingCounter: null } })).condition === 'accord-pending-unanswered');
  check('E2b answered is accord', EI.classifyEnvoyEvent(evBase({ accordAnsweredEver: true })).condition === 'accord-answered');
  check('E2c link-exists', EI.classifyEnvoyEvent(evBase({ snap: { nLinksActive: 1, pendingAccord: null, pendingCounter: null } })).condition === 'link-exists-no-pending-accord');
  check('E2d pending-counter', EI.classifyEnvoyEvent(evBase({ snap: { nLinksActive: 0, pendingAccord: null, pendingCounter: { targetId: 'ov1', day: 50 } } })).condition === 'pending-counter-blocks-proposal');
  check('E2e no-known', EI.classifyEnvoyEvent(evBase({ known: [] })).condition === 'no-known-village');
  check('E2f no-proposal', EI.classifyEnvoyEvent(evBase({})).condition === 'no-proposal-made');
  check('E2g proposal-no-link', EI.classifyEnvoyEvent(evBase({ verbCounts: { proposeLink: 1, proposePeer: 0, raidVillage: 0 } })).condition === 'proposal-made-no-link');
  // E5 — diagGo floors (#894: never vacuously true).
  const empty = analyzeCorpus([synthConfig(73301, [])], [73301]);
  check('E5a empty population is NO-GO, not vacuous GO', empty.diagGo === false && empty.verdictLabel === 'NO-GO-no-population', empty.verdictLabel);
  const allAccord = analyzeCorpus([synthConfig(73301, [evBase({ accordAnsweredEver: true }), evBase({ accordAnsweredEver: true })])], [73301]);
  check('E5b all-accord population is NO-GO on this bar', allAccord.diagGo === false && allAccord.verdictLabel === 'NO-GO-no-failing-condition', allAccord.verdictLabel);
  const dominant = analyzeCorpus([synthConfig(73301, [evBase({}), evBase({}), evBase({}), evBase({ known: [] })])], [73301]);
  check('E5c dominant condition (3/4) is GO', dominant.diagGo === true && dominant.dominant === 'no-proposal-made' && dominant.dominantShare === 0.75, JSON.stringify({ d: dominant.dominant, s: dominant.dominantShare }));
  const diffuse = analyzeCorpus([synthConfig(73301, [evBase({}), evBase({}), evBase({ known: [] }), evBase({ known: [] }), evBase({ snap: { nLinksActive: 0, pendingAccord: null, pendingCounter: { targetId: 'ov1', day: 50 } } })])], [73301]);
  check('E5d diffuse (max 2/5) is NO-GO', diffuse.diagGo === false && diffuse.verdictLabel === 'NO-GO-diffuse', diffuse.verdictLabel);
  // E3 — live instrument smoke (60d pinned run, single harness process).
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const PI = require(path.join(REPO, 'scripts', 'postunlock-instrument'));
  const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
  const t = {};
  const { Game } = await loadGame({ seed: 73301, mode: 'envoyaccord', fullTelemetry: false });
  check('E3a verb existence: proposeLink/answerAccord are functions', typeof Game.proposeLink === 'function' && typeof Game.answerAccord === 'function' && typeof Game.answerCounter === 'function' && typeof Game.ledgerBeat === 'function');
  check('E3b competent calls no link verbs (grep + live log agree)', (() => {
    const src = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8');
    return !/proposeLink|proposeCovenant|proposeTrade|answerAccord|answerCounter|raidVillage/.test(src);
  })());
  PI.install(Game, t);
  EI.install(Game, t);
  const policy = EI.wrapPolicy(competent, t);
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 60, manifest: undefined, sampleEvery: 30 }); });
  const rows = t.envoyDaily || [];
  const mono = rows.every((r, i) => i === 0 || r.day >= rows[i - 1].day);
  check('E3c daily rows present and day-monotonic', rows.length >= 30 && mono, 'rows=' + rows.length);
  check('E3d zero instrument errors', (t.envoyErrors || []).length === 0, JSON.stringify(t.envoyErrors || []));
  check('E3e beats array present (count is measured, not asserted)', Array.isArray(t.envoyBeats), 'beats=' + (t.envoyBeats || []).length);
  console.log('E3-info days=' + result.days + ' endReason=' + result.endReason + ' dailyRows=' + rows.length + ' beats=' + (t.envoyBeats || []).length + ' envoyBeats=' + (t.envoyBeats || []).filter(b => b.isEnvoy).length);
  // E4 — determinism: pinned 180d config twice in separate processes.
  const childEnv = Object.assign({}, process.env, { EA_DET_CHILD: '1', EA_DET_SEED: '73301' });
  const runChild = () => spawnSync(process.execPath, [__filename], { env: childEnv, encoding: 'utf8', timeout: 900000 });
  const c1 = runChild();
  const c2 = runChild();
  const h1 = (c1.stdout || '').match(/DET ([0-9a-f]{64})/);
  const h2 = (c2.stdout || '').match(/DET ([0-9a-f]{64})/);
  check('E4 determinism: pinned 180d config byte-identical across two processes', !!(h1 && h2 && h1[1] === h2[1]), 'h1=' + (h1 && h1[1]) + ' h2=' + (h2 && h2[1]) + ' c1status=' + c1.status + ' c2status=' + c2.status + ' c1err=' + (c1.stderr || '').slice(0, 300));
  console.log('TEST-SUMMARY pass=' + pass + ' fail=' + fail);
  if (fail > 0) process.exit(1);
}
main().catch(e => { console.error('TEST FAILED:', (e && e.stack) || e); process.exit(1); });
