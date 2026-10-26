#!/usr/bin/env node
// test-saystub-b.js — proof test for the sim-saystub-b instrument.
// Usage: node scripts/test-saystub-b.js
//   T1: unit — capture mechanics on a stub object (no game load).
//   T2: stock-harness stub proof + capture proof on the real game
//       (loads the game once, seed 9753; asserts the stock say is
//       a dead end for emit wrappers AND that the capture records
//       the same call). T2 must pass BEFORE the sweep runs.
//   T3: corpus mode — reads evidence/2026-10-25/sim-saystub-b-corpus,
//       verifies validity + neutrality + the GO rule (A/B/C), and
//       prints the verdict. If the corpus is absent, T3 reports
//       SKIP (not PASS) and the run exits non-zero only if --strict
//       is passed; the sweep runner always runs with the corpus
//       present, so a SKIP there is a loud failure.
// Exit 0 only when every executed test passes (SKIP in T3 without
// --strict still exits 0, but prints SKIP loudly).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const CORPUS = path.join(REPO, 'evidence', '2026-10-25', 'sim-saystub-b-corpus');
const STRICT = process.argv.includes('--strict');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name + (extra ? ' — ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// The known cook line TEMPLATE (src/js/game.js cook duty), with
// concrete illustrative values for the stub proof only. This is
// NOT a captured game line and is never quoted as one: the GO
// line must come from the sweep corpus (T3).
const KNOWN_TEMPLATE = '🍲 Mara cooked for the haven — meals stretched. Mara worked the smoke racks too — 3 batches preserved (~2400 kcal, keeps for weeks).';
const RACKS_FULL_TEMPLATE = '🍲 Tomas cooked for the haven — meals stretched. The racks are already full (12000 kcal kept — more than the haven can eat before it turns), so Tomas left the fresh pile for tonight\'s dinner instead of smoking it onto the rot pile.';

async function main() {
  const { COOK_SAY_FILTER, installSayCapture, isWorkedLine, isRacksFullLine } = require(path.join(REPO, 'scripts', 'say-capture'));

  // ---- T1: unit mechanics on a stub object ----
  {
    const seen = [];
    const stub = {
      state: { scholar: { day: 7 } },
      say(s) { seen.push(s); return 42; },
    };
    const cap = installSayCapture(stub, { cap: 2 });
    const ret = stub.say(KNOWN_TEMPLATE);
    ok('T1 return passthrough', ret === 42, 'orig return preserved');
    ok('T1 delegation', seen.length === 1 && seen[0] === KNOWN_TEMPLATE, 'orig still called');
    ok('T1 capture', cap.samples.length === 1 && cap.samples[0].day === 7 && isWorkedLine(cap.samples[0]), 'day-tagged + worked');
    stub.say('The village feasts tonight.');
    ok('T1 filter rejects non-cook', cap.samples.length === 1, 'unrelated line not recorded');
    stub.say(RACKS_FULL_TEMPLATE);
    ok('T1 racks-full captured', cap.samples.length === 2 && isRacksFullLine(cap.samples[1]), 'second line recorded');
    stub.say(KNOWN_TEMPLATE);
    ok('T1 cap enforced', cap.samples.length === 2, 'cap 2 holds');
    let threw = false;
    try { installSayCapture(stub); } catch (e) { threw = true; }
    ok('T1 double-wrap refused', threw, 'no silent double-count');
    cap.uninstall();
    ok('T1 uninstall restores', stub.say === stub.say && typeof stub.say === 'function' && seen.length === 4, 'orig restored');
  }
  ok('T1 matcher matches known template', COOK_SAY_FILTER.test(KNOWN_TEMPLATE), 'smoke-racks line matches');
  ok('T1 matcher matches racks-full', COOK_SAY_FILTER.test(RACKS_FULL_TEMPLATE), 'racks-full line matches');

  // ---- T2: stock-harness stub proof + capture proof on the real game ----
  {
    const { loadGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
    const { Game } = await loadGame({ seed: 9753, mode: 'saystub-b-test', fullTelemetry: false });
    // Half 1: stock say is a dead end for emit wrappers.
    const emitSeen = [];
    const oEmit = Game.emit;
    if (typeof oEmit === 'function') Game.emit = function () { emitSeen.push(String(arguments[0] == null ? '' : arguments[0])); return oEmit.apply(this, arguments); };
    const logBefore = (Game.log || []).length;
    Game.say(KNOWN_TEMPLATE);
    const reachedEmit = emitSeen.some(t => t.includes('smoke racks'));
    const inLog = (Game.log || []).slice(logBefore).some(e => String((e && e.text) || e).includes('smoke racks'));
    ok('T2 stock say reaches no emit wrapper', !reachedEmit, reachedEmit ? 'emit saw the line' : 'emit wrapper saw nothing');
    ok('T2 stock say leaves no log line', !inLog, inLog ? 'log gained the line' : 'log unchanged');
    if (typeof oEmit === 'function') Game.emit = oEmit;
    // Half 2: the capture records the identical call.
    const cap = installSayCapture(Game, { cap: 200 });
    Game.say(KNOWN_TEMPLATE);
    ok('T2 capture records direct say', cap.samples.length === 1 && isWorkedLine(cap.samples[0]), cap.samples.length ? cap.samples[0].text.slice(0, 60) : 'nothing captured');
    ok('T2 capture is not a matcher invention', COOK_SAY_FILTER.test(cap.samples[0] ? cap.samples[0].text : ''), 'same matcher, live say path');
    cap.uninstall();
  }

  // ---- T3: corpus verification + GO verdict ----
  if (!fs.existsSync(CORPUS)) {
    console.log('SKIP T3 corpus mode — corpus dir absent: ' + CORPUS);
    if (STRICT) fail++;
  } else {
    const seeds = [9750, 9751, 9752, 9753, 9754, 9755, 9756, 9757];
    const rows = {};
    let present = 0;
    for (const cap of ['cap0', 'cap1']) {
      for (const s of seeds) {
        const f = path.join(CORPUS, `saystub-b-${cap}-pd0-dg1-leadfeast-s${s}.json`);
        if (!fs.existsSync(f)) { ok('T3 file present ' + cap + ' s' + s, false); continue; }
        try { rows[cap + ':' + s] = JSON.parse(fs.readFileSync(f, 'utf8')); present++; }
        catch (e) { ok('T3 file parses ' + cap + ' s' + s, false, e.message); }
      }
    }
    ok('T3 16/16 corpus files present', present === 16, present + '/16');
    const NUM = ['daysAlive', 'preserveVillagerBatches', 'preserveVillagerKcal', 'preserveVillagerResolutions', 'deaths', 'national', 'waveReach', 'rank'];
    let validity = true, neutral = true, goA = false, goC = true, workedDetail = [];
    for (const s of seeds) {
      const a = rows['cap0:' + s], b = rows['cap1:' + s];
      if (!a || !b) { validity = false; neutral = false; goC = false; continue; }
      if (a.seed !== s || b.seed !== s || a.cap !== 0 || b.cap !== 1) { validity = false; ok('T3 tags s' + s, false, 'arm/seed tag mismatch'); }
      if (!(b.preserveVillagerBatches >= b.preserveVillagerResolutions)) { validity = false; ok('T3 batches>=resolutions s' + s, false, b.preserveVillagerBatches + ' < ' + b.preserveVillagerResolutions); }
      if (!(a.preserveVillagerBatches >= a.preserveVillagerResolutions)) { validity = false; ok('T3 batches>=resolutions cap0 s' + s, false); }
      const wl = (b.saySamples || []).filter(isWorkedLine).length;
      workedDetail.push('s' + s + ' worked=' + wl + ' res=' + b.preserveVillagerResolutions);
      if (wl !== b.preserveVillagerResolutions) { validity = false; ok('T3 worked==resolutions s' + s, false, wl + ' vs ' + b.preserveVillagerResolutions); }
      if ((b.saySamples || []).some(x => /worked the smoke racks too/.test(x.text) && x.text.startsWith('🍲') && /cooked for the haven/.test(x.text))) goA = true;
      if (b.preserveVillagerBatches > 0 && !(b.saySamples || []).length) { goC = false; ok('T3 saySamples>0 where batches>0 s' + s, false); }
      for (const k of NUM) {
        const eq = JSON.stringify(a[k]) === JSON.stringify(b[k]);
        if (!eq) { neutral = false; ok('T3 neutrality s' + s + ' field ' + k, false, 'cap0=' + JSON.stringify(a[k]) + ' cap1=' + JSON.stringify(b[k])); }
      }
    }
    ok('T3 validity (tags, batches>=res, worked==res)', validity, workedDetail.join('; '));
    ok('T3 neutrality cap0==cap1 all fields all seeds', neutral, neutral ? '8/8 cells identical' : 'see failures above');
    ok('T3 GO-A known-line captured', goA, goA ? 'worked-line with cooked-for-haven template present' : 'no qualifying line');
    ok('T3 GO-C saySamples>0 where batches>0', goC, goC ? 'every preserving cell spoke' : 'a preserving cell was silent');
    const go = goA && neutral && goC && validity;
    console.log('VERDICT ' + (go ? 'GO' : 'NO-GO') + ' (A=' + goA + ' B=' + neutral + ' C=' + goC + ' validity=' + validity + ')');
    if (!go) fail++;
  }

  console.log(`\n${pass} PASS / ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
