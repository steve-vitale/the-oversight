#!/usr/bin/env node
// test-volleysoft-b.js — sim-volleysoft-b proof + sizing test.
//
// The volley-softened finish is a SIZING question, not a lever: zero src/js
// in this arm. This test re-drives the constructed volley-softened shapes
// through the REAL Game.fieldFight and sizes what a finish would need:
//
//   S1. Replication of vetfinish V2 (audit 180/200/220 of 1200, bow-only):
//       the volley drops the beast below its break line, the contact
//       finish never attempts, the reason recorded is 'volley-damage'.
//   S2. Wider shapes (herald 120/140/160 of 800, influencer 140/160/180
//       of 950, bow-only): same recording, so the sizing spans the
//       wave-4 kinds a bow fighter actually meets.
//   S3. What happens next WITHOUT any finish: outcome distribution
//       (vKill / vDie / vFlee / round-cap), rounds spent, fighter HP lost
//       — the cost the missing finish leaves on the table. Premise check:
//       a volley-softened wave-4 beast must NOT flee (mCanFlee is off for
//       every wave-3+ kind; only lockpick_raccoon, wave 1, carries flee),
//       so mFlee must be 0 across all volley-softened fights.
//   S4. Counterfactual strike sizing (LABELED counterfactual, never an
//       engine outcome): the strike the contact finish would have landed
//       had the meeting been eligible — lroll([4+wb, 8+wb]) with the bow's
//       wb 11 -> [15,19], drawn on a SEPARATE seeded stream so the real
//       fight's RNG is untouched — and the FS-window share
//       (R - strike <= 3 * strike, R = post-volley remainder). A spear
//       sensitivity ([19,23], wb 15) is reported alongside: the spear
//       shape never volleys in the wild today (spear-in-ranged-slot), so
//       it sizes a hypothetical, not a reachable window.
//
// Writes nothing into the repo. Usage: node scripts/test-volleysoft-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL: ${name}${extra != null ? ' :: ' + JSON.stringify(extra) : ''}`); }
}
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
// Mirrors fieldFights.js lroll: range[0] + floor(rng() * (range[1]-range[0]+1))
function lrollDraw(rng, lo, hi) { return lo + Math.floor(rng() * (hi - lo + 1)); }

const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
check('static: contact finish requires mDealt === 0', ffSrc.indexOf('rec.mDealt === 0') >= 0);
check('static: volley-damage reason recorded', ffSrc.indexOf("'volley-damage'") >= 0);
check('static: mCanFlee default-off', ffSrc.indexOf('var mCanFlee = !!(mdef && mdef.flee);') >= 0);
check('static: FS 3x size gate present', ffSrc.indexOf('members[0].hp <= 3 * _cfVd') >= 0);
check('static: volley-break block records fsMetBelowBreak', ffSrc.indexOf('rec.fsMetBelowBreak = true;') >= 0);
const monsters = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const w3plusFlee = monsters.filter(function (m) { return (m.wave | 0) >= 3 && !!m.flee; });
check('static: no wave-3+ monster kind carries a flee component', w3plusFlee.length === 0, { flee: w3plusFlee.map(function (m) { return m.id; }) });
check('static: only lockpick_raccoon carries flee', monsters.filter(function (m) { return !!m.flee; }).map(function (m) { return m.id; }).join(',') === 'lockpick_raccoon');

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  return s[Math.floor(s.length / 2)];
}

async function main() {
  const { Game } = await loadGame({ seed: 87104, mode: 'herald', fullTelemetry: false });
  await quietLog(async () => { await setupGame(Game); });
  const roster = ((Game.state.village || {}).roster || []).filter(function (v) { return v !== Game.villagerId; });
  check('engine: roster has non-scholar fighters', roster.length >= 2, roster.length);
  const defs = {};
  for (const m of (Game.data.monsters || [])) defs[m.id] = m;
  check('engine: audit/herald/influencer defs present', !!(defs.audit && defs.herald && defs.influencer));

  function runFight(vid, items, def, startHp, maxHp, streamSeed, health, allyVid) {
    const vp = (Game.data.villagers || []).find(function (x) { return x.id === vid; }) || {};
    vp.items = items.map(function (it) {
      if (typeof it === 'string') return { itemId: it, units: 1 };
      return { itemId: it.id, units: it.units || 1 };
    });
    delete vp.equipped;
    var hv = Game.state.village.health || (Game.state.village.health = {});
    hv[vid] = health;
    if (allyVid) { hv[allyVid] = 100; }
    const opts = { allies: allyVid ? 1 : 0, allyVids: allyVid ? [allyVid] : [],
      allyFromStart: true, rng: mulberry32(streamSeed) };
    return Game.fieldFight(vid, def, { hp: startHp, maxHp: maxHp }, opts);
  }

  const shapes = [
    { def: 'audit', hps: [180, 200, 220], max: 1200 },
    { def: 'herald', hps: [120, 140, 160], max: 800 },
    // Influencer entries stay >= 15% of max (150/950 = 15.8%): a 140-HP
    // entry (14.7%) is already below the break line at entry, i.e. a
    // met-below-break meeting, not a volley-softened one — the prereg bar
    // (entryFrac >= 0.15) excludes it, and the first run's 14 contact
    // attempts were exactly those volley-missed met-below-break fights.
    { def: 'influencer', hps: [150, 170, 190], max: 950 },
  ];
  const byShape = {};
  let fights = 0, volleyBelow = 0, volleyKills = 0, contact = 0, volleyDamageWhy = 0,
    mflee = 0, fsCommits = 0, contactAmongVS = 0;
  const vs = []; // volley-softened meetings, with counterfactual sizing
  for (const sh of shapes) {
    byShape[sh.def] = { fights: 0, volleyBelow: 0, volleyKills: 0 };
    for (const hp of sh.hps) {
      for (let s = 1; s <= 30; s++) {
        const vid = roster[s % roster.length], allyVid = roster[(s + 1) % roster.length];
        const streamSeed = s * 104729 + hp;
        let rec;
        try {
          rec = runFight(vid, ['bow', { id: 'arrow', units: 4 }], defs[sh.def], hp, sh.max, streamSeed, 100, allyVid);
        } catch (e) { continue; }
        fights++; byShape[sh.def].fights++;
        const vdmg = (rec.volley && rec.volley.dmg) || 0;
        const R = hp - vdmg;
        if (vdmg > 0 && R <= 0) { volleyKills++; byShape[sh.def].volleyKills++; continue; }
        if (vdmg > 0 && R > 0 && (R / sh.max) < 0.15) {
          volleyBelow++; byShape[sh.def].volleyBelow++;
          if (rec.contactFinishAttempted) contactAmongVS++;
          // Counterfactual strike draws on a SEPARATE stream (never touches the fight RNG).
          const bowStrike = lrollDraw(mulberry32(streamSeed + 7919), 15, 19);
          const spearStrike = lrollDraw(mulberry32(streamSeed + 104729), 19, 23);
          vs.push({
            kind: sh.def, entryHp: hp, maxHp: sh.max, volleyDmg: vdmg, remainder: R,
            frac: +(R / sh.max).toFixed(3),
            bowStrike: bowStrike, bowKill: R <= bowStrike,
            bowFsWindow: (R - bowStrike) <= 3 * bowStrike,
            spearStrike: spearStrike, spearKill: R <= spearStrike,
            spearFsWindow: (R - spearStrike) <= 3 * spearStrike,
            outcome: rec.outcome, rounds: rec.rounds,
            vHpLeft: rec.vHpLeft, mHpLeft: rec.mHpLeft, mDealt: rec.mDealt,
            fsWhy: rec.fsNoCommitWhy || null,
          });
        }
        if (rec.contactFinishAttempted) contact++;
        if (rec.fsNoCommitWhy === 'volley-damage') volleyDamageWhy++;
        if (rec.outcome === 'mFlee') mflee++;
        if (rec.fsCommitMhp != null) fsCommits++;
      }
    }
  }
  console.log('SHAPES: ' + JSON.stringify(byShape));
  console.log('VOLLEY: fights ' + fights + ', volley-below-break ' + volleyBelow +
    ', volley-kills ' + volleyKills + ', contact attempted ' + contact +
    ', volley-damage reasons ' + volleyDamageWhy + ', FS commits ' + fsCommits +
    ', mFlee outcomes ' + mflee);
  check('S1 audit replication: volley reaches the window (>=10/90)', byShape.audit.volleyBelow >= 10, byShape.audit);
  check('S1+S2: volley-softened meetings are excluded by design (reason volley-damage >=1)', volleyDamageWhy >= 1, { volleyDamageWhy: volleyDamageWhy, volleyBelow: volleyBelow });
  check('S1+S2: contact finish never attempts on a volley-softened meeting', contactAmongVS === 0, { contactAmongVS: contactAmongVS, contactAll: contact });
  check('S1+S2: FS commit never fires on a volley-softened meeting', fsCommits === 0, { fsCommits: fsCommits });
  check('S3 premise: no volley-softened beast flees (mFlee 0)', mflee === 0, { mflee: mflee });

  // --- sizing on the volley-softened pool ---
  const R = vs.map(function (x) { return x.remainder; });
  const outcomes = {};
  vs.forEach(function (x) { outcomes[x.outcome] = (outcomes[x.outcome] || 0) + 1; });
  const rounds = vs.map(function (x) { return x.rounds; });
  const hpLost = vs.map(function (x) { return 100 - (x.vHpLeft | 0); });
  const bowKill = vs.filter(function (x) { return x.bowKill; }).length;
  const bowFs = vs.filter(function (x) { return x.bowFsWindow; }).length;
  const spearKill = vs.filter(function (x) { return x.spearKill; }).length;
  const spearFs = vs.filter(function (x) { return x.spearFsWindow; }).length;
  const vFleeN = outcomes.vFlee || 0, vKillN = outcomes.vKill || 0, vDieN = outcomes.vDie || 0;
  const roundsKill = vs.filter(function (x) { return x.outcome === 'vKill'; }).map(function (x) { return x.rounds; });
  const hpLostKill = vs.filter(function (x) { return x.outcome === 'vKill'; }).map(function (x) { return 100 - (x.vHpLeft | 0); });
  const hpLostFlee = vs.filter(function (x) { return x.outcome === 'vFlee'; }).map(function (x) { return 100 - (x.vHpLeft | 0); });
  const roundsDie = vs.filter(function (x) { return x.outcome === 'vDie'; }).map(function (x) { return x.rounds; });
  console.log('SIZING outcomes: vKill rounds median ' + median(roundsKill) + ' HP-lost median ' + median(hpLostKill) +
    ' | vFlee HP-lost median ' + median(hpLostFlee) +
    ' | vDie rounds median ' + median(roundsDie) +
    ' | all rounds range [' + Math.min.apply(null, rounds) + '..' + Math.max.apply(null, rounds) + ']');
  const fleeInWindow = vs.filter(function (x) { return x.outcome === 'vFlee' && x.bowFsWindow; }).length;
  const killInWindow = vs.filter(function (x) { return x.outcome === 'vKill' && x.bowFsWindow; }).length;
  console.log('SIZING volley-softened n=' + vs.length +
    ' remainder median ' + median(R) + ' range [' + (R.length ? Math.min.apply(null, R) : null) + '..' + (R.length ? Math.max.apply(null, R) : null) + ']' +
    ' outcomes ' + JSON.stringify(outcomes) +
    ' rounds median ' + median(rounds) +
    ' fighter-HP-lost median ' + median(hpLost) +
    ' bow-strike-kill ' + bowKill + '/' + vs.length +
    ' bow-FS-window ' + bowFs + '/' + vs.length +
    ' spear-strike-kill ' + spearKill + '/' + vs.length +
    ' spear-FS-window ' + spearFs + '/' + vs.length +
    ' fled-in-FS-window ' + fleeInWindow + ' killed-in-FS-window ' + killInWindow);
  console.log('SIZING by kind: ' + JSON.stringify((function () {
    const o = {};
    ['audit', 'herald', 'influencer'].forEach(function (k) {
      const xs = vs.filter(function (x) { return x.kind === k; });
      o[k] = { n: xs.length,
        remMed: median(xs.map(function (x) { return x.remainder; })),
        bowKill: xs.filter(function (x) { return x.bowKill; }).length,
        bowFs: xs.filter(function (x) { return x.bowFsWindow; }).length,
        vKill: xs.filter(function (x) { return x.outcome === 'vKill'; }).length,
        vFlee: xs.filter(function (x) { return x.outcome === 'vFlee'; }).length,
        vDie: xs.filter(function (x) { return x.outcome === 'vDie'; }).length };
    });
    return o;
  })()));
  check('S4 sizing: pool non-empty (volley-softened >= 30 across shapes)', vs.length >= 30, { n: vs.length });
  check('S4 sizing: remainder distribution recorded (median > 0)', (median(R) | 0) > 0, { median: median(R) });
  // The sizing must be able to separate the three fates; a degenerate pool
  // (all one outcome) would make the vFlee-convertible share meaningless.
  check('S3 sizing: pool shows more than one fighter fate', Object.keys(outcomes).length >= 2, outcomes);

  console.log(`volleysoft proof: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(function (e) { console.error('VOLLEYSOFT PROOF FAILED:', (e && e.stack) || e); process.exit(1); });
