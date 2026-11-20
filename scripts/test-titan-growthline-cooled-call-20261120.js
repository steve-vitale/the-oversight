#!/usr/bin/env node
// test-titan-growthline-cooled-call-20261120.js — proof for the r245
// growth-line stale-promise fix (journey-deepening r245, Lane A leg 2).
//
// DEFECT (r244, seed 105024 day 86): the dawn growth line promised 2
// allied blades ("enough. Sound the call.") and the call sounded that
// morning harvested 0 — a contest death after dawn ate the growth, and
// the call performed the empty "THE CALL GOES OUT" ritual anyway. A
// real player hears the promise, sounds the call, gets nothing, and the
// game never says why.
//
// FIX (src/js/titans.js, two parts):
//   1. soundTitanCall re-validates at the act: if a growth line promised
//      allied blades and the fresh allied gain is 0, it does NOT sound —
//      it says the cooled line instead. No ritual, no trust cost.
//   2. titanMusterGrowthLine reports dawn state ("at dawn, … would send
//      … — enough, if the morning holds.") instead of issuing an
//      unconditional imperative about a future act.
//
// CASES (each on a fresh loadGame; expectations read off the live
// projection, never hardcoded counts):
//   C1 COOLED: line promises allied growth; the growth dies (fighters
//      killed) before the call; the call says the cooled line, sounds
//      nothing, charges no trust, adds no allies, re-arms the dawn line.
//   C2 MIRROR: line promises allied growth; the growth is still fresh;
//      the call sounds as before and the allies join.
//   C3 HAVEN: line names Haven volunteers; the volunteers are gone by
//      the commit tap; the first tap says "No one is free to march"
//      (the commit's existing fresh re-computation — asserted still true).
//   C4 WORDING: the spoken growth line carries the dawn framing ("at
//      dawn") and the honest qualifier ("if the morning holds") on the
//      enough-clause, and keeps the parseable number phrases.
//   C5 NO-PROMISE: a call with no growth line spoken sounds exactly as
//      before (the fix targets only the stale-promise case).
//
// RED verified against the unfixed code (git stash of titans.js): C1
// fails — the cooled call sounds "THE CALL GOES OUT" and brings 0.
'use strict';
const { loadGame, setupGame, quietLog } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS', name); }
  else { fail++; console.log('FAIL', name, extra === undefined ? '' : String(extra).slice(0, 400)); }
}

// Fixture: trusted links + located herald omen (same shape as
// test-heraldmuster-20261021.js fixtureCoalition). The links array is
// shared by reference so the test can add a link after the first call.
function fixtureCoalition(Game, linkIds) {
  const mk = (vid, nm) => ({
    id: vid, name: nm, opinion: 20,
    roster: [
      { id: vid + '_spk', name: 'Speaker ' + nm, alive: true },
      { id: vid + '_f1', name: nm + ' One', alive: true },
      { id: vid + '_f2', name: nm + ' Two', alive: true },
      { id: vid + '_f3', name: nm + ' Three', alive: true },
      { id: vid + '_f4', name: nm + ' Four', alive: true },
      { id: vid + '_f5', name: nm + ' Five', alive: true },
      { id: vid + '_f6', name: nm + ' Six', alive: true },
    ],
  });
  const villages = linkIds.map(([vid, nm]) => mk(vid, nm));
  Game.state.otherVillages = villages;
  const links = linkIds.map(([vid]) => ({ id: 'link-' + vid, primary: 'haven', subordinate: vid, status: 'active', trust: 75,
    theirSpeaker: { id: vid + '_spk', name: 'Speaker' }, arrears: 0 }));
  Game.mshipState = () => ({ links });
  Game.state.scholar.day = 100;
  Game._titanTest.titanState().omens.herald = { stage: 2, day: 95, warned: {} };
  // The herald must be present in the world for the line and the call.
  // titanMonsterPresent is internal (not on Game), so check the live
  // worldMonsters array directly and inject the herald if absent —
  // worldMonsters() reads state.worldMonsters live (r244 probe precedent).
  try {
    const wm = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
    if (!(wm || []).some(m => m && m.id === 'herald')) {
      const arr = (Game.state || {}).worldMonsters || [];
      arr.push({ id: 'herald' });
      Game.state.worldMonsters = arr;
    }
  } catch (e) {}
  return { villages, links };
}

function captureSay(Game) {
  const said = [];
  const osay = Game.say;
  Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return osay.call(this, t); };
  return { said, restore() { Game.say = osay; } };
}

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'growthline-cooled-' + seed, fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

async function main() {
  // ---- C1: cooled call ----
  {
    const Game = await freshGame(105031);
    const cap = captureSay(Game);
    const fx = fixtureCoalition(Game, [['ashford', 'Ashford']]);
    // First call: ashford answers 6 (quota 6, trust 75). Muster 6/10.
    const r1 = Game.soundTitanCall('herald');
    check('C1 first call sounds', r1 != null && cap.said.some(t => /THE CALL GOES OUT/.test(t)));
    const ms1 = Game.titanMusterState('herald');
    check('C1 first call brings 6 allies', ms1 && ms1.allies.length === 6, 'allies=' + (ms1 && ms1.allies.length));
    // Fresh growth arrives: a second trusted link. The line must speak.
    fx.links.push({ id: 'link-birch', primary: 'haven', subordinate: 'birch', status: 'active', trust: 75,
      theirSpeaker: { id: 'birch_spk', name: 'Speaker' }, arrears: 0 });
    fx.villages.push({ id: 'birch', name: 'Birch', opinion: 20,
      roster: [
        { id: 'birch_spk', name: 'Speaker Birch', alive: true },
        { id: 'birch_f1', name: 'Birch One', alive: true },
        { id: 'birch_f2', name: 'Birch Two', alive: true },
        { id: 'birch_f3', name: 'Birch Three', alive: true },
        { id: 'birch_f4', name: 'Birch Four', alive: true },
        { id: 'birch_f5', name: 'Birch Five', alive: true },
        { id: 'birch_f6', name: 'Birch Six', alive: true },
      ] });
    Game.state.otherVillages = fx.villages;
    const gBefore = Game.titanMusterGrowth('herald');
    check('C1 growth exists before the line', gBefore && gBefore.harvestable > 0, 'harvestable=' + (gBefore && gBefore.harvestable));
    cap.said.length = 0;
    Game.titanMusterGrowthLine(100);
    const line = cap.said.find(t => /The fires have warmed since the call/.test(t));
    check('C1 growth line speaks', !!line, cap.said.slice(-3).join(' | '));
    const msLine = Game.titanMusterState('herald');
    const promised = msLine ? (msLine._growthPromisedAllied || 0) : 0;
    check('C1 line stores the allied promise', promised > 0, 'promised=' + promised);
    // The morning eats the growth: birch's fighters die (the r244 shape —
    // a contest death after dawn). ALL free adults go, speaker included:
    // the projection counts the speaker as a free adult, so leaving them
    // alive leaves gain 1, not 0. Trust untouched, so this is a pure
    // availability loss, not a refusal.
    const birch = fx.villages.find(v => v.id === 'birch');
    birch.roster.forEach(r => { r.alive = false; });
    const gFresh = Game.titanMusterGrowth('herald');
    const freshAllied = (gFresh.links || []).reduce((a, l) => a + (l.gain || 0), 0);
    check('C1 fresh allied gain is 0 after the deaths', freshAllied === 0, 'freshAllied=' + freshAllied);
    const trustBefore = fx.links.map(l => l.trust).join(',');
    const alliesBefore = (Game.titanMusterState('herald').allies || []).length;
    cap.said.length = 0;
    const r2 = Game.soundTitanCall('herald');
    check('C1 cooled call returns null (not sounded)', r2 === null, 'r2=' + r2);
    check('C1 cooled call says the cooled line', cap.said.some(t => /The fires have cooled since dawn/.test(t)), cap.said.join(' | '));
    check('C1 cooled call sounds no ritual', !cap.said.some(t => /THE CALL GOES OUT/.test(t)), cap.said.join(' | '));
    check('C1 cooled call adds no allies', (Game.titanMusterState('herald').allies || []).length === alliesBefore,
      'before=' + alliesBefore + ' after=' + (Game.titanMusterState('herald').allies || []).length);
    check('C1 cooled call charges no trust', fx.links.map(l => l.trust).join(',') === trustBefore, 'before=' + trustBefore);
    const msCool = Game.titanMusterState('herald');
    check('C1 cooled call clears the promise', (msCool._growthPromisedAllied || 0) === 0, 'promised=' + msCool._growthPromisedAllied);
    check('C1 cooled call re-arms the dawn line on fresh numbers',
      msCool._growthSaid === (gFresh ? gFresh.harvestable : null),
      '_growthSaid=' + msCool._growthSaid + ' fresh=' + (gFresh && gFresh.harvestable));
    if ((gFresh.havenGain || 0) > 0) {
      check('C1 cooled line still names the Haven volunteers',
        cap.said.some(t => /Haven still has/.test(t) && /the commit sends them/.test(t)), cap.said.join(' | '));
    }
    cap.restore();
  }

  // ---- C2: mirror — growth still fresh, the call sounds as before ----
  {
    const Game = await freshGame(105032);
    const cap = captureSay(Game);
    const fx = fixtureCoalition(Game, [['ashford', 'Ashford']]);
    Game.soundTitanCall('herald');
    fx.links.push({ id: 'link-birch', primary: 'haven', subordinate: 'birch', status: 'active', trust: 75,
      theirSpeaker: { id: 'birch_spk', name: 'Speaker' }, arrears: 0 });
    fx.villages.push({ id: 'birch', name: 'Birch', opinion: 20,
      roster: [
        { id: 'birch_spk', name: 'Speaker Birch', alive: true },
        { id: 'birch_f1', name: 'Birch One', alive: true },
        { id: 'birch_f2', name: 'Birch Two', alive: true },
        { id: 'birch_f3', name: 'Birch Three', alive: true },
        { id: 'birch_f4', name: 'Birch Four', alive: true },
        { id: 'birch_f5', name: 'Birch Five', alive: true },
        { id: 'birch_f6', name: 'Birch Six', alive: true },
      ] });
    Game.state.otherVillages = fx.villages;
    cap.said.length = 0;
    Game.titanMusterGrowthLine(100);
    check('C2 growth line speaks', cap.said.some(t => /The fires have warmed since the call/.test(t)));
    const before = (Game.titanMusterState('herald').allies || []).length;
    cap.said.length = 0;
    const r = Game.soundTitanCall('herald');
    check('C2 fresh-growth call sounds', r != null && cap.said.some(t => /THE CALL GOES OUT/.test(t)));
    const after = (Game.titanMusterState('herald').allies || []).length;
    check('C2 fresh-growth call brings the promised blades', after === before + 6, 'before=' + before + ' after=' + after);
    check('C2 fresh-growth call reaches ready', Game.titanMusterReady('herald') === true);
    check('C2 call consumes the promise', (Game.titanMusterState('herald')._growthPromisedAllied || 0) === 0);
    cap.restore();
  }

  // ---- C3: Haven — volunteers gone by the commit tap ----
  {
    const Game = await freshGame(105033);
    const cap = captureSay(Game);
    fixtureCoalition(Game, [['ashford', 'Ashford']]);
    Game.soundTitanCall('herald');
    const vols = (typeof Game.titanVolunteers === 'function') ? Game.titanVolunteers() : [];
    check('C3 Haven volunteers exist to stage the case', vols.length >= 1, 'vols=' + vols.length);
    // The volunteers all leave (away) before the commit tap.
    const v = Game.state.village || {};
    v.away = v.away || {};
    vols.forEach(id => { v.away[id] = 1; });
    cap.said.length = 0;
    const r = Game.titanCommitOwn('herald');
    check('C3 commit with no volunteers says so', r === null && cap.said.some(t => /No one is free to march/.test(t)),
      'r=' + r + ' said=' + cap.said.join(' | '));
    cap.restore();
  }

  // ---- C4: wording — dawn framing + honest qualifier, numbers kept ----
  {
    const Game = await freshGame(105034);
    const cap = captureSay(Game);
    const fx = fixtureCoalition(Game, [['ashford', 'Ashford']]);
    Game.soundTitanCall('herald');
    fx.links.push({ id: 'link-birch', primary: 'haven', subordinate: 'birch', status: 'active', trust: 75,
      theirSpeaker: { id: 'birch_spk', name: 'Speaker' }, arrears: 0 });
    fx.villages.push({ id: 'birch', name: 'Birch', opinion: 20,
      roster: [
        { id: 'birch_spk', name: 'Speaker Birch', alive: true },
        { id: 'birch_f1', name: 'Birch One', alive: true },
        { id: 'birch_f2', name: 'Birch Two', alive: true },
        { id: 'birch_f3', name: 'Birch Three', alive: true },
        { id: 'birch_f4', name: 'Birch Four', alive: true },
        { id: 'birch_f5', name: 'Birch Five', alive: true },
        { id: 'birch_f6', name: 'Birch Six', alive: true },
      ] });
    Game.state.otherVillages = fx.villages;
    const g = Game.titanMusterGrowth('herald');
    cap.said.length = 0;
    Game.titanMusterGrowthLine(100);
    const line = cap.said.find(t => /The fires have warmed since the call/.test(t)) || '';
    check('C4 line keeps the instrument prefix', /^📯 The fires have warmed since the call — /.test(line), line);
    check('C4 line frames the numbers as dawn state', /at dawn,/.test(line), line);
    if (g && g.wouldBeReady) {
      check('C4 enough-clause carries the honest qualifier', /if the morning holds/.test(line), line);
    } else {
      check('C4 short-clause stays short (no imperative)', /Still short/.test(line), line);
    }
    const topGain = Math.max.apply(null, (g.links || []).map(l => l.gain || 0));
    check('C4 line keeps the parseable allied number', new RegExp('would send ' + topGain + ' more blades').test(line), line);
    check('C4 line keeps the parseable muster total', new RegExp('would stand at ' + g.total + ' of the ' + g.need).test(line), line);
    cap.restore();
  }

  // ---- C5: no promise spoken — a call sounds exactly as before ----
  {
    const Game = await freshGame(105035);
    const cap = captureSay(Game);
    fixtureCoalition(Game, [['ashford', 'Ashford']]);
    // No growth line ever spoken. Sound the call on a roster with no
    // free fighters (kill ashford's roster, speaker included — the
    // projection counts the speaker as a free adult): the old behavior —
    // ritual + "has no free fighters" — must be untouched.
    const ash = Game.state.otherVillages.find(v => v.id === 'ashford');
    ash.roster.forEach(r => { r.alive = false; });
    cap.said.length = 0;
    const r = Game.soundTitanCall('herald');
    check('C5 no-promise call still sounds', r != null && cap.said.some(t => /THE CALL GOES OUT/.test(t)), cap.said.join(' | '));
    check('C5 no-promise call still narrates the thin fire', cap.said.some(t => /has no free fighters to send/.test(t)), cap.said.join(' | '));
    cap.restore();
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
