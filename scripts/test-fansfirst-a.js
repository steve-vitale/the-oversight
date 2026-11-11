// test-fansfirst-a.js — proof for the fans / audience first-numbers
// instrument + analyzer (arm sim-fansfirst-a, run fleshout-20261111T0715Z).
//
// Fixture leg (fast, always): every wrap proven live on a fixture game
// (seed 99104 — the trustfirst fixture seed, not a band seed):
// apAdjustFavor (favor moves + why-class), apCarePackage (gate-blocked
// at favor 5, sent at favor 35, snack kcal in range), apWackyGift
// (gift or vault-shy, recorded either way), apGrantItem (fan-package
// context flag), apPackageClubLine (names the loudest club at 20+),
// apClubBoon (looped until the 15% roll fires — fired-fight),
// apFeedMessage (looped until the 40% roll fires — fired-growing),
// apDailyTick (eligibility forced in the fixture: systemArrived +
// stubbed unlockedWave 2; drift −1/lane on a %3 day observed),
// apPersonaPackage (recorded, separate class), apContestInterference
// (forPlayer path, winMod 0), offerAudienceTrial / completeTrial /
// checkStruggle (offer → complete → struggle-check, integration +15),
// Game.say capture (fan lines recorded once — including sysSay-routed
// lines, which arrive via say; the test asserts EXACTLY ONE capture
// per sysSay call, proving no double-count), snapshot shape, and a
// RED check: installing on a Game with a method deleted logs
// instrumentErrors instead of throwing.
// RED checks (dead by construction): apCarePackage at favor 0 is
// gate-blocked, never sent; a non-fan say line records nothing; a
// sysSay line is captured exactly once, not twice.
// Analyzer leg (pure): classifyFavorWhy / classifyPackage /
// classifyBoon / classifyFeed / classifySayLine on one line per class
// + unclassified; findNamedFanLines positive + negative;
// reconcileFavor synthetic (drift explains the residue) + a
// residue-beyond-drift case.
// Neutrality miniature (live, 5 days): same seed, instrument on vs
// off, days + pantry + deaths identical.
// Usage: node scripts/test-fansfirst-a.js
'use strict';
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(__dirname, 'sim-harness'));
const { competent } = require(path.join(__dirname, 'policies', 'competent'));
const FF = require(path.join(__dirname, 'fansfirst-instrument-20261111'));
const AN = require(path.join(__dirname, 'fansfirst-analyze-20261111'));

let pass = 0, fails = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fails++; console.log('FAIL ' + name + ' :: ' + (detail || '')); }
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try { return ((Game.state.village || {}).pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0); } catch (e) { return null; }
}

(async function () {
  // ---- analyzer leg (pure, no sim) ----
  check('classifyFavorWhy: contest-win', AN.classifyFavorWhy('Hazel won Beastmaster on camera') === 'contest-win');
  check('classifyFavorWhy: show-win', AN.classifyFavorWhy('won the Mouth Race') === 'show-win');
  check('classifyFavorWhy: show-colon', AN.classifyFavorWhy('show: Mouth Race') === 'show');
  check('classifyFavorWhy: show-cheer', AN.classifyFavorWhy('cheering for Marta') === 'show-cheer');
  check('classifyFavorWhy: ratings-stunt', AN.classifyFavorWhy('ratings stunt') === 'ratings-stunt');
  check('classifyFavorWhy: show', AN.classifyFavorWhy("Mara shone on Ask a Human") === 'show');
  check('classifyFavorWhy: show-loss', AN.classifyFavorWhy("Mara's beautiful disaster on Mouth Race") === 'show');
  check('classifyFavorWhy: highlight', AN.classifyFavorWhy('the highlight package') === 'highlight');
  check('classifyFavorWhy: death-reel', AN.classifyFavorWhy('the Death Reel ran your highlights') === 'death-reel');
  check('classifyFavorWhy: group-encounter', AN.classifyFavorWhy('faced down a group encounter — the crowd loves a spectacle') === 'group-encounter');
  check('classifyFavorWhy: fight-outcome win', AN.classifyFavorWhy('defeated the Reunion') === 'fight-outcome');
  check('classifyFavorWhy: fight-outcome flee', AN.classifyFavorWhy('fled from the Eater — the crowd boos') === 'fight-outcome');
  check('classifyFavorWhy: sigW5', AN.classifyFavorWhy('the audience overrules your cancellation — RENEWED') === 'sigW5');
  check('classifyFavorWhy: other first token', AN.classifyFavorWhy('fixture boost') === 'other:fixture');
  check('classifyFavorWhy: empty unclassified', AN.classifyFavorWhy('') === 'unclassified');
  check('classifyFavorWhy: null unclassified', AN.classifyFavorWhy(null) === 'unclassified');

  check('classifyPackage: sent', AN.classifyPackage({ returned: true, favorAtCall: 30 }) === 'sent');
  check('classifyPackage: gate-blocked', AN.classifyPackage({ returned: false, favorAtCall: 5 }) === 'gate-blocked');
  check('classifyPackage: cooldown-blocked', AN.classifyPackage({ returned: false, favorAtCall: 30 }) === 'cooldown-blocked');
  check('classifyPackage: null unclassified', AN.classifyPackage(null) === 'unclassified');

  check('classifyBoon: fired-fight', AN.classifyBoon({ returned: true, topLane: 'fight', topValue: 30 }) === 'fired-fight');
  check('classifyBoon: gate-blocked', AN.classifyBoon({ returned: false, topLane: 'fight', topValue: 10, lastBoonDay: null, day: 20 }) === 'gate-blocked');
  check('classifyBoon: cooldown-blocked', AN.classifyBoon({ returned: false, topLane: 'fight', topValue: 30, lastBoonDay: 18, day: 20 }) === 'cooldown-blocked');
  check('classifyBoon: roll-blocked', AN.classifyBoon({ returned: false, topLane: 'fight', topValue: 30, lastBoonDay: null, day: 20 }) === 'roll-blocked');

  check('classifyFeed: fired-growing', AN.classifyFeed({ returned: true, favorAtCall: 30 }) === 'fired-growing');
  check('classifyFeed: fired-restless', AN.classifyFeed({ returned: true, favorAtCall: -40 }) === 'fired-restless');
  check('classifyFeed: fired-watching', AN.classifyFeed({ returned: true, favorAtCall: 0 }) === 'fired-watching');
  check('classifyFeed: cooldown-blocked', AN.classifyFeed({ returned: false, lastFeedDay: 10, day: 10 }) === 'cooldown-blocked');
  check('classifyFeed: roll-blocked', AN.classifyFeed({ returned: false, lastFeedDay: 5, day: 10 }) === 'roll-blocked');

  check('classifySayLine: package', AN.classifySayLine('📦 A care package drops from the sky with a little parachute. There\'s a note: "WE LOVE YOU!"') === 'package');
  check('classifySayLine: package-club-credit', AN.classifySayLine('"WE LOVE YOU! — your fight fans"') === 'package-club-credit');
  check('classifySayLine: boon', AN.classifySayLine('📦 Your fight fans voted: a training stimulant, military-grade, questionably legal. You feel dangerous.') === 'boon');
  check('classifySayLine: feed-growing', AN.classifySayLine('📺 SYSTEM: ""Your fan club is GROWING. There\'s fan art. It\'s... surprisingly good.""') === 'feed-growing');
  check('classifySayLine: feed-restless', AN.classifySayLine('📺 SYSTEM: ""The crowd is getting restless. "BORING," says the feed.""') === 'feed-restless');
  check('classifySayLine: feed-watching', AN.classifySayLine('📺 SYSTEM: ""The audience is watching. The gamblers are watching. Everyone\'s watching.""') === 'feed-watching');
  check('classifySayLine: feed-lane', AN.classifySayLine('📺 SYSTEM: ""The fight clubs are making banners. Your name, in fire.""') === 'feed-lane');
  check('classifySayLine: favor-announce', AN.classifySayLine('📺 SYSTEM: "📈 your fight fans +5 — defeated the Reunion (favor: 5)"') === 'favor-announce');
  check('classifySayLine: trial-offer', AN.classifySayLine('◈ AUDIENCE TRIAL — SYSTEM: "The audience wants an encore. A trial, then — smaller this time, but televised." Fully identify 3 plants within 3 days. Reward: integration, and a lesson.') === 'trial-offer');
  check('classifySayLine: trial-expired', AN.classifySayLine('The trial window closed. The audience makes a disappointed sound, like wind.') === 'trial-expired');
  check('classifySayLine: trial-complete', AN.classifySayLine('◈ TRIAL COMPLETE — the audience applauds, which sounds like static. (+15 integration, gift: a lesson: Wound Care)') === 'trial-complete');
  check('classifySayLine: follower', AN.classifySayLine('📱 2 followers turn the audience — care packages thin, the System\'s favor trickles away. (-2 favor.)') === 'follower');
  check('classifySayLine: standings', AN.classifySayLine('📊 THE STANDINGS — Haven sits 1st of 8. Haven leads. The audience has a favorite, and it\'s you.') === 'standings');
  check('classifySayLine: interference', AN.classifySayLine('📺 Kess is in the judging booth. They\'re smiling. That\'s never good.') === 'interference');
  check('classifySayLine: persona-package', AN.classifySayLine('📦 A package arrives, wrapped in brown paper and string, labeled in triplicate. Inside: a fan letter. In YOUR handwriting. You did not write it.') === 'persona-package');
  check('classifySayLine: other-fan', AN.classifySayLine('"Someone in the audience keeps voting for you. The System can\'t trace the votes. Curious."') === 'other-fan');
  check('classifySayLine: generic unclassified', AN.classifySayLine('You wait. The light changes. Nothing asks anything of you.') === 'unclassified');

  check('findNamedFanLines: names a fan persona', AN.findNamedFanLines([{ day: 3, line: 'Zyx the fan sends their regards from the stands.' }]).length === 1);
  check('findNamedFanLines: fan-comma-name', AN.findNamedFanLines([{ day: 3, line: 'Your fan, Mara, cheers from the stands.' }]).length === 1);
  check('findNamedFanLines: generic club is not a name', AN.findNamedFanLines([{ day: 3, line: 'Your fight fans voted: a training stimulant.' }]).length === 0);
  check('findNamedFanLines: fan club growing is not a name', AN.findNamedFanLines([{ day: 3, line: '"Your fan club is GROWING. There\'s fan art."' }]).length === 0);
  check('findNamedFanLines: empty corpus is a measured zero', AN.findNamedFanLines([]).length === 0);
  check('findNamedFanLines: fan-leafed tree is botany, not a fan', AN.findNamedFanLines([{ day: 77, line: 'Wei showed Fatima the fan-leafed tree dropping foul-smelling yellow fruit — "remember it." The haven hears about it by supper.' }]).length === 0);

  const recSeed = {
    daily: [
      { fanClubs: { fight: 0, survival: 0, social: 0, showbiz: 0 } },
      { fanClubs: { fight: 4, survival: 0, social: 0, showbiz: 2 } },
    ],
    favorEvents: [
      { lane: 'fight', n: 5 }, { lane: 'showbiz', n: 2 },
    ],
    dailyEvents: [
      { drift: { before: { fight: 5, showbiz: 2 }, after: { fight: 4, showbiz: 2 } } },
    ],
  };
  const rec = AN.reconcileFavor(recSeed);
  check('reconcileFavor: drift explains the residue', rec.ok === true && rec.perLane.fight.residue === 0 && rec.perLane.showbiz.residue === 0,
    JSON.stringify(rec));
  const badSeed = JSON.parse(JSON.stringify(recSeed));
  badSeed.favorEvents = [{ lane: 'fight', n: 3 }];
  check('reconcileFavor: residue beyond drift is flagged', AN.reconcileFavor(badSeed).ok === false);

  // ---- fixture leg ----
  const { Game } = await loadGame({ seed: 99104, mode: 'competent-fansfirst-proof', fullTelemetry: false });
  await setupGame(Game);
  const ff = FF.install(Game);
  const T = ff.t;
  check('install: zero instrument errors', T.instrumentErrors.length === 0, JSON.stringify(T.instrumentErrors.slice(0, 3)));
  check('install: all wraps present (no missing-method errors)', !T.instrumentErrors.some(function (e) { return /-missing/.test(e); }));
  check('install: tele wrapped', T.teleWrapped === true);

  // Favor: two moves, two lanes, two why-classes.
  Game.apAdjustFavor(5, 'Hazel won Beastmaster on camera', 'fight');
  Game.apAdjustFavor(2, 'the Death Reel ran your highlights', 'showbiz');
  check('apAdjustFavor: events recorded', T.favorEvents.length === 2, 'events=' + T.favorEvents.length);
  check('apAdjustFavor: clubs moved', T.favorEvents[0].clubsAfter.fight === 5 && T.favorEvents[1].clubsAfter.showbiz === 2,
    JSON.stringify(T.favorEvents.map(function (e) { return e.clubsAfter; })));
  check('apAdjustFavor: why-classes', AN.classifyFavorWhy(T.favorEvents[0].why) === 'contest-win' &&
    AN.classifyFavorWhy(T.favorEvents[1].why) === 'death-reel');
  check('apAdjustFavor: favor is the loudest lane', Game.apFavor() === 5);

  // Package: gate-blocked at favor 5, then sent at favor 35.
  const pkg0 = Game.apCarePackage();
  check('apCarePackage: gate-blocked at favor 5', pkg0 === false && T.packageEvents.length === 1 &&
    AN.classifyPackage(T.packageEvents[0]) === 'gate-blocked');
  Game.apAdjustFavor(30, 'fixture boost', 'fight');
  check('apAdjustFavor: favor now 35', Game.apFavor() === 35);
  const clubLine = Game.apPackageClubLine();
  check('apPackageClubLine: names the loudest club at 20+', clubLine === ' — your fight fans', JSON.stringify(clubLine));
  const kcalBefore = (Game.state.scholar || {}).kcal || 0;
  const pkg1 = Game.apCarePackage();
  const pkgEv = T.packageEvents[T.packageEvents.length - 1];
  check('apCarePackage: sent at favor 35', pkg1 === true && pkgEv.returned === true);
  check('apCarePackage: origin direct (not a daily tick)', pkgEv.origin === 'direct');
  check('apCarePackage: snack kcal in the 30–69 canon range',
    ((Game.state.scholar.kcal || 0) - kcalBefore) >= 30 && ((Game.state.scholar.kcal || 0) - kcalBefore) <= 69,
    'delta=' + ((Game.state.scholar.kcal || 0) - kcalBefore));
  check('apCarePackage: gift recorded (id or vault-shy null)',
    T.wackyEvents.length >= 1 && (pkgEv.giftId === null || typeof pkgEv.giftId === 'string'),
    'gift=' + pkgEv.giftId);
  check('apCarePackage: event classified sent', AN.classifyPackage(pkgEv) === 'sent');

  // Wacky gift + grant context, direct calls.
  const wg = Game.apWackyGift(1);
  check('apWackyGift: event recorded', T.wackyEvents.length >= 2 && T.wackyEvents[T.wackyEvents.length - 1].tier === 1);
  const grBefore = T.grantEvents.length;
  if (wg) Game.apGrantItem(wg.id);
  check('apGrantItem: direct call recorded as other-context',
    T.grantEvents.length === grBefore + (wg ? 1 : 0) &&
    (!wg || T.grantEvents[T.grantEvents.length - 1].ctx === 'other'),
    'wg=' + (wg && wg.id));

  // Boon: loop until the 15% roll fires (lane 35 >= 25 gate passes).
  let boonFired = false;
  for (let i = 0; i < 100 && !boonFired; i++) { if (Game.apClubBoon()) boonFired = true; }
  check('apClubBoon: fires within 100 tries at lane 35', boonFired, 'attempts=' + T.boonEvents.length);
  const boonEv = T.boonEvents.filter(function (e) { return e.returned; })[0];
  check('apClubBoon: fired event is fight (top lane)', !!boonEv && boonEv.topLane === 'fight' &&
    AN.classifyBoon(boonEv) === 'fired-fight');
  check('apClubBoon: roll-blocked attempts classified', T.boonEvents.filter(function (e) { return !e.returned; })
    .every(function (e) { return AN.classifyBoon(e) === 'roll-blocked'; }));

  // Feed: loop until the 40% roll fires (favor 35 = growing band).
  let feedFired = false;
  for (let i = 0; i < 100 && !feedFired; i++) { if (Game.apFeedMessage()) feedFired = true; }
  check('apFeedMessage: fires within 100 tries', feedFired, 'attempts=' + T.feedEvents.length);
  const feedEv = T.feedEvents.filter(function (e) { return e.returned; })[0];
  check('apFeedMessage: fired event is growing band', !!feedEv && AN.classifyFeed(feedEv) === 'fired-growing');

  // Say capture: sysSay routes through say — exactly ONE capture per call.
  Game.state.systemArrived = true;
  const sayBefore = T.fanSays.length;
  Game.sysSay('"Your fan club is GROWING. There\'s fan art. It\'s... surprisingly good."');
  check('say capture: sysSay line captured exactly once (no double-count)',
    T.fanSays.length === sayBefore + 1, 'before=' + sayBefore + ' after=' + T.fanSays.length);
  check('say capture: sysSay line classified feed-growing',
    AN.classifySayLine(T.fanSays[T.fanSays.length - 1].line) === 'feed-growing');
  Game.say('The audience is watching. The gamblers are watching. Everyone\'s watching. No pressure.');
  check('say capture: direct say line captured', T.fanSays.length === sayBefore + 2);
  const sayBefore2 = T.fanSays.length;
  Game.say('You wait. The light changes. Nothing asks anything of you.');
  check('RED: non-fan say line records nothing', T.fanSays.length === sayBefore2);

  // Daily tick: force eligibility (systemArrived + stubbed wave 2),
  // set a %3 day, watch the drift move each lane 1 toward 0.
  const origWave = Game.unlockedWave;
  Game.unlockedWave = function () { return 2; };
  const dayBefore = gday(Game);
  Game.state.scholar.day = 3;
  const dBefore = T.dailyEvents.length;
  Game.apDailyTick();
  const dEv = T.dailyEvents[T.dailyEvents.length - 1];
  check('apDailyTick: event recorded, eligible', T.dailyEvents.length === dBefore + 1 && dEv.eligible === true);
  check('apDailyTick: drift moves fight 35→34 and showbiz 2→1', !!dEv.drift &&
    dEv.drift.before.fight === 35 && dEv.drift.after.fight === 34 &&
    dEv.drift.before.showbiz === 2 && dEv.drift.after.showbiz === 1,
    'drift=' + JSON.stringify(dEv.drift));
  check('apDailyTick: package roll accounted for the day', ['called', 'gate-blocked', 'cooldown-blocked', 'roll-blocked'].indexOf(dEv.pkgRoll) >= 0,
    'pkgRoll=' + dEv.pkgRoll);
  Game.unlockedWave = origWave;
  Game.state.scholar.day = dayBefore;

  // Trials: offer → complete → struggle-check.
  const integBefore = (Game.state.scholar || {}).integration || 0;
  Game.offerAudienceTrial('struggle');
  const trialEv = T.trialEvents.filter(function (e) { return e.kind === 'offer'; })[0];
  check('offerAudienceTrial: offer recorded with a task', !!trialEv && trialEv.offered === true &&
    ['haul_small', 'haul', 'identify'].indexOf(trialEv.taskId) >= 0, 'task=' + (trialEv && trialEv.taskId));
  check('offerAudienceTrial: trial line classified trial-offer',
    T.fanSays.some(function (s) { return AN.classifySayLine(s.line) === 'trial-offer'; }));
  Game.completeTrial();
  const compEv = T.trialEvents.filter(function (e) { return e.kind === 'complete'; })[0];
  check('completeTrial: completion recorded, integration +15', !!compEv &&
    ((Game.state.scholar || {}).integration || 0) === integBefore + 15,
    'integ=' + (Game.state.scholar || {}).integration + ' before=' + integBefore);
  Game.checkStruggle();
  check('checkStruggle: struggle-check recorded', T.trialEvents.some(function (e) { return e.kind === 'struggle-check'; }));

  // Interference (forPlayer path) + persona package + tele filter.
  const if0 = T.interferenceEvents.length;
  const ifRet = Game.apContestInterference({}, { forPlayer: true });
  check('apContestInterference: forPlayer call recorded, winMod 0', T.interferenceEvents.length === if0 + 1 &&
    T.interferenceEvents[if0].winMod === 0 && T.interferenceEvents[if0].forPlayer === true,
    'ret=' + JSON.stringify(ifRet));
  const pp0 = T.personaPackageEvents.length;
  Game.apPersonaPackage();
  check('apPersonaPackage: event recorded (separate class)', T.personaPackageEvents.length === pp0 + 1);
  const tele0 = T.teleEvents.length;
  Game.tele('fan_test', { x: 1 });
  Game.tele('random_thing', {});
  check('tele: fan-ish type recorded, other type ignored', T.teleEvents.length === tele0 + 1 &&
    T.teleEvents[T.teleEvents.length - 1].type === 'fan_test');

  // Snapshot shape.
  const snap = ff.snapshot();
  check('snapshot: four clubs + favor + viewership present',
    snap.fanClubs && ['fight', 'survival', 'social', 'showbiz'].every(function (L) { return typeof snap.fanClubs[L] === 'number'; }) &&
    typeof snap.favor === 'number' && typeof snap.viewership === 'number',
    'favor=' + snap.favor + ' vw=' + snap.viewership);
  check('snapshot: trial is null after completion', snap.trial === null);

  // RED: installing on a Game with a method deleted logs instead of throwing.
  const { Game: Game2 } = await loadGame({ seed: 99105, mode: 'competent-fansfirst-proof2', fullTelemetry: false });
  await setupGame(Game2);
  const keep = Game2.apCarePackage;
  delete Game2.apCarePackage;
  let ff2 = null, threw = false;
  try { ff2 = FF.install(Game2); } catch (e) { threw = true; }
  check('RED: install with a deleted method does not throw, logs it', !threw && ff2 && ff2.t.instrumentErrors.some(function (e) { return /apCarePackage-missing/.test(e); }),
    'errors=' + JSON.stringify(ff2 ? ff2.t.instrumentErrors : null));
  if (ff2) ff2.uninstall();
  Game2.apCarePackage = keep;

  ff.uninstall();
  check('final: zero instrument errors on the fixture game', T.instrumentErrors.length === 0, JSON.stringify(T.instrumentErrors.slice(0, 3)));

  // ---- neutrality miniature (live, 5 days) ----
  async function miniDays(seed, instOn) {
    const { Game: G } = await loadGame({ seed: seed, mode: 'competent-fansfirst-mini', fullTelemetry: false });
    await setupGame(G);
    let inst = null;
    if (instOn) inst = FF.install(G);
    let res = null;
    await quietLog(async function () { res = await runDays(G, competent, { days: 5, manifest: undefined, sampleEvery: 30 }); });
    if (inst) inst.uninstall();
    return { days: res.days, kcal: pantryKcal(G), deaths: ((res.samples && res.samples.deaths) || []).length };
  }
  const mOn = await miniDays(99104, true);
  const mOff = await miniDays(99104, false);
  check('neutrality miniature: 5d days + pantry + deaths identical on/off',
    mOn.days === mOff.days && mOn.kcal === mOff.kcal && mOn.deaths === mOff.deaths,
    'on=' + JSON.stringify(mOn) + ' off=' + JSON.stringify(mOff));

  console.log('\n' + pass + ' passed, ' + fails + ' failed');
  process.exitCode = fails ? 1 : 0;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
