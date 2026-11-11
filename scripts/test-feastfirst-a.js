// test-feastfirst-a.js — proof for the feast/tribute first-numbers instrument
// (arm sim-feastfirst-a, run fleshout-20261111T0646Z).
// RED->GREEN where a behavior is asserted. Plain node, no jest.
// Usage: node scripts/test-feastfirst-a.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const FI = require(path.join(REPO, 'scripts', 'feastfirst-instrument-20261110'));
const AN = require(path.join(REPO, 'scripts', 'feastfirst-analyze-20261110'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fail++; fails.push(name); console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra).slice(0, 300) : '')); }
}
function eq(a, b, name) { ok(a === b, name, { got: a, want: b }); }

const WRAPPED = ['hostFeast', 'feastPlan', 'grantFeastBuff', 'noteFeastedCombatUse',
  'drawFeastScavenger', 'faceFeastDraw', 'driveOffFeastDraw', 'feastBundleBuyOut',
  'channelSentiment', 'channelReadyKeepsakes', 'payTribute', 'answerSystemFavor',
  'villageDeal', 'answerNationalChoice', 'answerGlobalChoice', 'tele',
  'pantryDraw', '_removePantryKcal', 'stockPantry'];

// ---- A. Analyzer classifier fixtures (no game load) ----
(function () {
  eq(AN.byQuality(0), 'thin(0)', 'A1 quality 0 is thin');
  eq(AN.byQuality(1), 'fine(1)', 'A2 quality 1 is fine');
  eq(AN.byQuality(2), 'legendary(2)', 'A3 quality 2 is legendary');
  ok(AN.byQuality(9).indexOf('unknown') === 0, 'A4 out-of-range quality is unknown');
})();

// ---- B. Live wrap fixtures (one game load, direct calls) ----
async function liveFixtures() {
  const { Game } = await loadGame({ seed: 180265, mode: 'feastfirst-proof-b', fullTelemetry: false });
  await setupGame(Game);
  const orig = {};
  WRAPPED.forEach(function (n) { orig[n] = Game[n]; });
  const fi = FI.install(Game);
  const t = fi.t;

  // B1: stockPantry deposit recorded with name + kcal.
  Game.stockPantry(20000, 'Foraged food');
  ok(t.deposits.length === 1 && t.deposits[0].name === 'Foraged food' && t.deposits[0].kcal === 20000,
    'B1 stockPantry Foraged food recorded', t.deposits[0]);

  // B2: feastPlan recorded (ok with an empty-ish pantry is still a plan:
  // plan.ok only fails on over/exile/not-haven/one-day/no-guests).
  const plan = Game.feastPlan();
  ok(t.plans.length === 1 && t.plans[0].ok === true && typeof t.plans[0].cost === 'number' && t.plans[0].have >= 0,
    'B2 feastPlan recorded', t.plans[0]);
  ok(t.plans[0].bundleCount !== null && t.plans[0].bundleCount >= 0, 'B3 plan bundle preview counted', t.plans[0]);

  // B4: hostFeast with a stocked pantry succeeds; the report is recorded
  // whole (quality, spent, showed, bundle sheet, buff refusal).
  const rep = Game.hostFeast();
  ok(rep && rep.ok === true, 'B4 hostFeast ok on a stocked pantry', rep && rep.why);
  ok(t.feasts.length === 1 && t.feasts[0].ok === true && t.feasts[0].spent > 0,
    'B5 feast recorded with spent kcal', t.feasts[0]);
  ok(t.feasts[0].quality >= 0 && t.feasts[0].quality <= 2, 'B6 feast quality in range', t.feasts[0]);
  ok(t.feasts[0].showedN >= 1, 'B7 feast had guests who showed', t.feasts[0]);
  ok(t.feasts[0].bundle && typeof t.feasts[0].bundle.count === 'number', 'B8 feast bundle sheet recorded', t.feasts[0].bundle);
  ok(Array.isArray((Game.state || {}).feastLog) && Game.state.feastLog.length === 1,
    'B9 feastLog gained one entry', (Game.state || {}).feastLog);
  // B10: the unarmed feast's grant refusal is recorded (devotion gate).
  ok(t.grants.length >= 1, 'B10 grantFeastBuff recorded via hostFeast', t.grants);
  const refusal = t.grants.find(function (g) { return !g.granted; });
  ok(!!refusal && /keepsake|devotion|armed/i.test(refusal.why || ''), 'B11 unarmed grant refused at the devotion gate', refusal);

  // B12: armed grant grants, with a draw attempt recorded.
  const s = Game.state.scholar;
  s.prog = s.prog || {};
  s.prog.feastSurge = 1.5;
  const drawsBefore = t.draws.length;
  let g2 = null;
  try { g2 = Game.grantFeastBuff({ quality: 1, served: [], guests: [], surge: 1.5 }); } catch (e) { ok(false, 'B12 armed grant grants', { err: String(e && e.message) }); }
  ok(g2 && g2.granted === true && typeof g2.mult === 'number' && g2.mult > 1,
    'B12 armed grant grants with a mult', g2);
  ok(t.grants.filter(function (g) { return g.granted; }).length >= 1, 'B13 granted grant recorded');
  ok(t.draws.length === drawsBefore + 1, 'B14 drawFeastScavenger called on a fresh armed grant', t.draws[t.draws.length - 1]);

  // B15: combat use + draw face/drive-off wraps fire.
  try { Game.noteFeastedCombatUse(); } catch (e) {}
  eq(t.surgeUses.length, 1, 'B15 noteFeastedCombatUse recorded');
  try { Game.faceFeastDraw(); } catch (e) {}
  try { Game.driveOffFeastDraw(); } catch (e) {}
  eq(t.drawFaces.filter(function (x) { return x.kind === 'face'; }).length, 1, 'B16 faceFeastDraw recorded');
  eq(t.drawFaces.filter(function (x) { return x.kind === 'driveOff'; }).length, 1, 'B17 driveOffFeastDraw recorded');

  // B18: devotion channel wraps fire (no keepsake ready is an honest 0).
  let readyN = null;
  try { const ready = Game.channelReadyKeepsakes(); readyN = Array.isArray(ready) ? ready.length : null; } catch (e) {}
  ok(t.keepsakeReady.length >= 1 && t.keepsakeReady[t.keepsakeReady.length - 1].n === readyN,
    'B18 channelReadyKeepsakes recorded', t.keepsakeReady[t.keepsakeReady.length - 1]);
  try { Game.channelSentiment(0); } catch (e) {}
  eq(t.channels.length, 1, 'B19 channelSentiment recorded');

  // B20: tribute verbs record their (honest-null) calls under the fixture.
  let pt = 'not-called';
  try { pt = Game.payTribute('no-such-link', 4000); } catch (e) { pt = 'threw:' + String(e && e.message).slice(0, 40); }
  ok(t.tributes.some(function (x) { return x.verb === 'payTribute'; }), 'B20 payTribute recorded (no link -> null)', { pt: pt });
  let asf = 'not-called';
  try { asf = Game.answerSystemFavor('pay'); } catch (e) { asf = 'threw:' + String(e && e.message).slice(0, 40); }
  ok(t.tributes.some(function (x) { return x.verb === 'answerSystemFavor'; }), 'B21 answerSystemFavor recorded (no demand -> null)', { asf: asf });
  try { Game.villageDeal('no-such-village', 'tribute'); } catch (e) {}
  ok(t.tributes.some(function (x) { return x.verb === 'villageDeal'; }), 'B22 villageDeal recorded');
  try { Game.answerNationalChoice('feast'); } catch (e) {}
  try { Game.answerGlobalChoice('feast'); } catch (e) {}
  ok(t.tributes.some(function (x) { return x.verb === 'answerNationalChoice'; }), 'B23 answerNationalChoice recorded');
  ok(t.tributes.some(function (x) { return x.verb === 'answerGlobalChoice'; }), 'B24 answerGlobalChoice recorded');

  // B25: tele pellet_pass recorded.
  try { Game.tele('pellet_pass', { from: 'v1', to: 'v2', day: 1 }); } catch (e) {}
  ok(t.pelletPasses.length === 1 && t.pelletPasses[0].from === 'v1' && t.pelletPasses[0].to === 'v2',
    'B25 tele pellet_pass recorded', t.pelletPasses[0]);

  // B26: pantryDraw caller-tagged; the feast's real draw is hostFeast,
  // the plan's preview draw is tagged preview.
  const feastDraws = t.pantryDraws.filter(function (d) { return d.caller === 'hostFeast' && !d.preview; });
  ok(feastDraws.length >= 1 && feastDraws[0].taken > 0, 'B26 feast pantryDraw recorded (real, hostFeast)', feastDraws[0]);
  const previewDraws = t.pantryDraws.filter(function (d) { return d.preview; });
  ok(previewDraws.length >= 1, 'B27 plan preview draw tagged preview', { n: previewDraws.length });

  // B28: _removePantryKcal recorded with caller.
  const paid = Game._removePantryKcal(100);
  ok(t.pantryRemovals.length === 1 && t.pantryRemovals[0].paid === paid,
    'B28 _removePantryKcal recorded', t.pantryRemovals[0]);

  // B29: bundle buy-out records (ok with 8,000 spent, or an honest
  // already-banked refusal if the B4 feast completed the bundle).
  let bo = null;
  try { bo = Game.feastBundleBuyOut(); } catch (e) { ok(false, 'B29 buy-out recorded', { err: String(e && e.message) }); }
  ok(t.buyouts.length === 1, 'B29 buy-out recorded', t.buyouts[0]);
  ok((bo && bo.ok && bo.spent === 8000) || (bo && !bo.ok && /already banked/i.test(bo.why || '')),
    'B30 buy-out coherent (8000 spent or already-banked)', bo);

  // B31: snapshot shape.
  const snap = fi.snapshot();
  ok(Array.isArray(snap.feastLog), 'B31 snapshot feastLog array');
  ok(Array.isArray(snap.links), 'B32 snapshot links array');
  ok(typeof snap.ladderStage === 'number', 'B33 snapshot ladderStage number', snap);
  ok(typeof snap.hungryCount === 'number', 'B34 snapshot hungryCount number');
  ok(snap.pelletHolder === null || typeof snap.pelletHolder === 'object', 'B35 snapshot pelletHolder shape');
  ok(typeof snap.pantryKcal === 'number', 'B36 snapshot pantryKcal number');
  ok(Array.isArray(t.daily) && t.daily.length === 1, 'B37 snapshot stored');

  // B38: no instrument errors on the fixture run.
  eq(t.instrumentErrors.length, 0, 'B38 zero instrument errors', t.instrumentErrors);

  // B39: uninstall restores every wrapped method.
  fi.uninstall();
  const restored = WRAPPED.every(function (n) { return Game[n] === orig[n]; });
  ok(restored, 'B39 uninstall restores all wraps');
}

// ---- C. Live feast miniature: competent 40 days ----
// GATES FINDING (probe, seed 180265, 40d): the policy's daily() runs at
// dusk (dayPart 2) on only ~1/8 days (5/40; the rest at part 3), and the
// scholar's pantry gives are 0 — so eveningFeast's recent-gives gate
// (>=1500 kcal given in the last 7 days) never opens and feastPlan is
// never reached under competent in this window. The devotion lane DOES
// run (channelSentiment 26×, surge armed to 3). The 150d pilot judges
// whether any seed ever feasts; this miniature proves the devotion
// wraps live and the snapshot complete, and records the feast counts
// as data, not as a pass/fail on the gate.
async function feastMiniature() {
  const { Game } = await loadGame({ seed: 180265, mode: 'feastfirst-proof-c', fullTelemetry: false });
  await setupGame(Game);
  const fi = FI.install(Game);
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally { try { fi.snapshot(); } catch (e) {} }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: 40, manifest: undefined, sampleEvery: 30 }); });
  fi.uninstall();
  console.log('    [miniature 40d] plans=' + fi.t.plans.length + ' feasts=' + fi.t.feasts.filter(function (f) { return f.ok; }).length +
    ' channels=' + fi.t.channels.length + ' keepsakeReady=' + fi.t.keepsakeReady.length +
    ' surge=' + (((Game.state.scholar || {}).prog || {}).feastSurge || 'none'));
  ok(fi.t.channels.length > 0, 'C1 policy channels keepsakes in 40 days', { n: fi.t.channels.length });
  ok(fi.t.wrapLive.channelReadyKeepsakes === true, 'C2 channelReadyKeepsakes wrap live in miniature');
  ok(fi.t.wrapLive.channelSentiment === true, 'C3 channelSentiment wrap live in miniature');
  ok(fi.t.wrapLive.pantryDraw === true, 'C4 pantryDraw wrap live in miniature');
  ok(fi.t.daily.length > 0 && fi.t.daily.every(function (x) { return Array.isArray(x.feastLog) && Array.isArray(x.links); }),
    'C5 every snapshot has feastLog + links', { snaps: fi.t.daily.length });
  ok(fi.t.daily.every(function (x) { return typeof x.hungryCount === 'number' && typeof x.ladderStage === 'number'; }),
    'C6 every snapshot has hungryCount + ladderStage');
  eq(fi.t.instrumentErrors.length, 0, 'C7 zero instrument errors in miniature', fi.t.instrumentErrors);
  ok(result.days > 0, 'C8 miniature ran days', { days: result.days });
}

// ---- D. Neutrality miniature: instrument on vs off, 12 days ----
async function neutralityMini() {
  async function mini(seed, on) {
    const { Game } = await loadGame({ seed: seed, mode: 'feastfirst-proof-d', fullTelemetry: false });
    await setupGame(Game);
    let fi = null;
    if (on) fi = FI.install(Game);
    const wrapped = Object.assign({}, competent, {
      daily: function (Gm, ctx) {
        try { return competent.daily(Gm, ctx); } finally { try { if (fi) fi.snapshot(); } catch (e) {} }
      },
    });
    let result = null;
    await quietLog(async function () { result = await runDays(Game, wrapped, { days: 12, manifest: undefined, sampleEvery: 30 }); });
    if (fi) fi.uninstall();
    const pantryKcal = ((Game.state || {}).village || {}).pantry || [];
    const pk = pantryKcal.reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
    const deaths = ((result && result.samples && result.samples.deaths) || []).length;
    return { days: result.days, pantryKcal: pk, deaths: deaths, errors: fi ? fi.t.instrumentErrors.length : 0 };
  }
  const on = await mini(180265, true);
  const off = await mini(180265, false);
  ok(on.days === off.days && on.pantryKcal === off.pantryKcal && on.deaths === off.deaths,
    'D1 neutrality miniature identical', { on: on, off: off });
  eq(on.errors, 0, 'D2 miniature instrument errors 0');
}

(async function () {
  try {
    await liveFixtures();
    await feastMiniature();
    await neutralityMini();
  } catch (e) {
    fail++;
    fails.push('harness-threw: ' + (e && e.stack ? e.stack.split('\n').slice(0, 5).join(' | ') : String(e)));
    console.log('FAIL harness-threw :: ' + String(e && e.stack || e).slice(0, 500));
  }
  console.log('\nfeastfirst proof: ' + pass + ' passed, ' + fail + ' failed' + (fails.length ? ' :: ' + fails.join(' ; ') : ''));
  process.exit(fail ? 1 : 0);
})();
