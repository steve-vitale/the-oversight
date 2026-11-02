#!/usr/bin/env node
// test-bearerorder-a.js — proof test for sim-bearerorder-a (Loop A 20261102,
// axis scale-onramp). READ-ONLY: asserts over the committed per-seed
// bearer-succession JSONs and the game-code sources the rule is read from.
// No harness, no writes, no RNG. Judged runs: bo-closecommit-s97330-r3.json
// and bo-closecommit-s97338-r3.json (driver with the npcIds sort-time
// instrument). r2 runs are the pre-instrument reproduction; r4/r5 are
// mechanism follow-ups (bumpTrust silence, trust-write Proxy stack).
// Proves:
//   1. The rule, from code: ledger.js sorts npcIds() by village trust;
//      villager-agency.js adds a deeds bonus before the ledger sort;
//      titans.js excludes the bearer from muster.haven on every pass.
//   2. Sort-time winner == chosen successor in 19/19 real succession
//      events across 2 seeds (10/10 on 97330, 9/9 on 97338).
//   3. The deeds bonus predicts sort-time trust exactly: entry trust +
//      min(12, floor(agencyScore/4)), capped at 100, for EVERY candidate
//      in every event (0 mismatches) — the bonus, not a rival sort,
//      explains the entry-trust anomalies.
//   4. The muster chain: all 6 committed-choice events chose a committed
//      blade who was already entry-trust rank 1; gate steps per pass.
//   5. Base rates: committed candidates 12/111 overall, chosen committed
//      6/19; in the 6 events where committed blades were still candidates,
//      chosen committed 6/6.
//   6. Succession order is NOT commit order on either seed (corrects the
//      closedecay "exactly the commit order" observation: same SET,
//      different order).
//   7. All passes went through playerDeath (mantleOutside == 0), and the
//      judged event sequences reproduce across driver versions (r2 == r3).
// Usage: node scripts/test-bearerorder-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-11-02', 'perseed-bearerorder-a');
let pass = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name + (detail != null ? ' — ' + detail : '')); }
  else { console.log('FAIL ' + name + (detail != null ? ' — ' + detail : '')); process.exitCode = 1; }
}
function load(f) { return JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); }
function src(f) { return fs.readFileSync(path.join(REPO, f), 'utf8'); }

// 1. Rule from code.
const ledger = src('src/js/ledger.js');
check('ledger: successor sorted by village trust, candidates[0] wins',
  ledger.includes('candidates.sort((a, b) => (trust[b] || 0) - (trust[a] || 0));') &&
  ledger.includes('const newId = candidates[0];'));
const betrayal = src('src/js/betrayal.js');
check('betrayal: npcIds = roster minus current bearer, no other filter',
  /npcIds\(\) \{\s*return \(this\.state\.village\.roster \|\| \[\]\)\.filter\(id => id !== this\.villagerId\);/.test(betrayal));
const agency = src('src/js/villager-agency.js');
check('villager-agency: pre-sort deeds bonus min(12, floor(agencyScore/4)), cap 100',
  agency.includes('var bonus = Math.min(12, Math.floor(this.agencyScore(id) / 4));') &&
  agency.includes('v.trust[id] = Math.min(100, (v.trust[id] || 0) + bonus);'));
check('villager-agency: agencyScore = achievements + expeditions*2 + kills*8 + nodes + tier*4',
  agency.includes('(s.expeditions || 0) * 2 + (s.monsterKills || 0) * 8') &&
  agency.includes('((a.tier || {})[vid] || 0) * 4'));
const titans = src('src/js/titans.js');
check('titans: titanHavenBlades excludes the bearer (Game.villagerId)',
  titans.includes('h.vid === Game.villagerId'));
check('titans: titanReconcileBearer re-filters muster.haven on mantleBecome',
  titans.includes('if (m) m.haven = titanHavenBlades(m);') &&
  titans.includes('delete v.titanCommitted[Game.villagerId]'));
check('titans: titanVolunteers sorts by linkStanding (agency + trust/5)',
  titans.includes('Game.linkStanding') && src('src/js/hierarchy.js').includes('s += ((this.state.village.trust || {})[vid] || 0) / 5;'));

// Helpers over judged runs.
function realEvents(rec) {
  return rec.events.filter(function (e) { return e.pre && e.pre.rosterOrder && e.pre.rosterOrder.length; });
}
function sortCall(e) {
  let out = null;
  (e.npcCallsDuring || []).forEach(function (c) { if (c.roster) out = c; });
  return out;
}
function sortWinner(e) {
  const sc = sortCall(e);
  if (!sc) return null;
  return sc.roster.slice().sort(function (a, b) { return (sc.trust[b] || 0) - (sc.trust[a] || 0); })[0];
}
function bonusMismatches(e) {
  const sc = sortCall(e);
  if (!sc) return ['no-sortcall'];
  const by = {};
  e.pre.rosterOrder.forEach(function (c) { by[c.vid] = c; });
  const bad = [];
  sc.roster.forEach(function (vid) {
    const c = by[vid];
    if (!c) return;
    const bonus = c.agency ? Math.min(12, Math.floor(c.agency / 4)) : 0;
    const pred = Math.min(100, c.trust + bonus);
    if (pred !== sc.trust[vid]) bad.push(vid + ':pred' + pred + '!=sort' + sc.trust[vid]);
  });
  return bad;
}

const r30 = load('bo-closecommit-s97330-r3.json');
const r38 = load('bo-closecommit-s97338-r3.json');
check('97330 call day 97, 97338 call day 113', r30.callDay === 97 && r38.callDay === 113);
check('97330 10 events, 97338 9 real + 1 village-lost',
  r30.events.length === 10 && realEvents(r38).length === 9 && r38.events.length === 10);
check('mantleOutsidePlayerDeath == 0 on both judged runs (all passes via playerDeath)',
  (r30.mantleOutsidePlayerDeath || []).length === 0 && (r38.mantleOutsidePlayerDeath || []).length === 0);

// 2+3. Sort-time winner + bonus prediction on every event.
[ ['97330', r30], ['97338', r38] ].forEach(function (pair) {
  const label = pair[0], rec = pair[1];
  const evs = realEvents(rec);
  const wins = evs.filter(function (e) { return sortWinner(e) === e.chosen; }).length;
  check(label + ' sort-time winner == chosen on every real event', wins === evs.length, wins + '/' + evs.length);
  const bad = [];
  evs.forEach(function (e) { bonusMismatches(e).forEach(function (m) { bad.push('d' + e.pre.day + ':' + m); }); });
  check(label + ' deeds bonus predicts sort-time trust for every candidate (0 mismatches)', bad.length === 0, bad.slice(0, 3).join(', '));
});

// 4. Muster chain specifics.
const m30 = realEvents(r30).filter(function (e) { return e.chosenWasCommitted; });
const m38 = realEvents(r38).filter(function (e) { return e.chosenWasCommitted; });
check('97330 committed choices: Vera d103, Nora d106, Aroha d106',
  m30.map(function (e) { return e.chosenName + '@' + e.pre.day; }).join(',') === 'Vera@103,Nora@106,Aroha@106');
check('97338 committed choices: Dmitri d115, Clinton d117, Elif d117',
  m38.map(function (e) { return e.chosenName + '@' + e.pre.day; }).join(',') === 'Dmitri@115,Clinton@117,Elif@117');
check('all 6 committed choices were already entry-trust rank 1 (bonus did not decide the chain)',
  m30.concat(m38).every(function (e) { return e.chosenTrustRank === 1; }));
function gate(e, which) {
  const g = which === 'before' ? e.pre.gateBefore : e.gateAfter;
  return g ? g.livingAllies + g.validHaven : null;
}
const d103 = realEvents(r30).find(function (e) { return e.pre.day === 103; });
check('97330 d103 pass steps gate 11 -> 10', gate(d103, 'before') === 11 && gate(d103, 'after') === 10);
const d106 = realEvents(r30).filter(function (e) { return e.pre.day === 106; });
check('97330 d106 passes step gate 10 -> 9 -> 8 (end-of-day 8, not a single jump)',
  d106.map(function (e) { return gate(e, 'before') + '>' + gate(e, 'after'); }).join(',') === '10>9,9>8,8>8');
const d115 = realEvents(r38).find(function (e) { return e.pre.day === 115; });
check('97338 d115 pass steps gate 9 -> 8 (already short; no decay needed)',
  gate(d115, 'before') === 9 && gate(d115, 'after') === 8);
const d117 = realEvents(r38).filter(function (e) { return e.pre.day === 117; });
check('97338 d117 passes step gate 8 -> 7 -> 6',
  d117.map(function (e) { return gate(e, 'before') + '>' + gate(e, 'after'); }).join(',') === '8>7,7>6,6>6');

// 5. Base rates.
let cand = 0, comm = 0, chosenComm = 0, evN = 0;
[ r30, r38 ].forEach(function (rec) {
  realEvents(rec).forEach(function (e) {
    evN++; cand += e.candidateCount; comm += e.committedCandidateCount;
    if (e.chosenWasCommitted) chosenComm++;
  });
});
check('base rate: committed candidates 12/111, chosen committed 6/19',
  cand === 111 && comm === 12 && chosenComm === 6 && evN === 19,
  'cand=' + cand + ' comm=' + comm + ' chosenComm=' + chosenComm + '/' + evN);
const withComm = [ r30, r38 ].reduce(function (acc, rec) {
  return acc.concat(realEvents(rec).filter(function (e) { return e.committedCandidateCount > 0; }));
}, []);
check('in the 6 events where committed blades were still candidates, chosen committed 6/6',
  withComm.length === 6 && withComm.every(function (e) { return e.chosenWasCommitted; }));

// 6. Succession order != commit order (same set, different order).
check('97330 succession Vera,Nora,Aroha != commit Aroha,Vera,Nora',
  m30.map(function (e) { return e.chosenName; }).join(',') === 'Vera,Nora,Aroha' &&
  (realEvents(r30).find(function (e) { return e.pre.day === 103; }).pre.committedHavenOrder || []).map(function (v) {
    const by = {}; realEvents(r30).find(function (e) { return e.pre.day === 103; }).pre.rosterOrder.forEach(function (c) { by[c.vid] = c.name; });
    return by[v];
  }).join(',') === 'Aroha,Vera,Nora');
check('97338 succession Dmitri,Clinton,Elif != commit Dmitri,Elif,Clinton',
  m38.map(function (e) { return e.chosenName; }).join(',') === 'Dmitri,Clinton,Elif' &&
  (realEvents(r38).find(function (e) { return e.pre.day === 115; }).pre.committedHavenOrder || []).map(function (v) {
    const by = {}; realEvents(r38).find(function (e) { return e.pre.day === 115; }).pre.rosterOrder.forEach(function (c) { by[c.vid] = c.name; });
    return by[v];
  }).join(',') === 'Dmitri,Elif,Clinton');

// Tie-breaks at sort-time top (stable sort = roster order).
const tie93 = realEvents(r30).find(function (e) { return e.pre.day === 93; });
const sc93 = sortCall(tie93);
check('97330 d93 sort-time tie Piper/Piya at 100, earlier roster entry (Piper) wins',
  sc93 && sc93.trust.gen_5as5ocl === 100 && sc93.trust.gen_z3a95hz === 100 &&
  tie93.chosen === 'gen_5as5ocl' && sc93.roster.indexOf('gen_5as5ocl') < sc93.roster.indexOf('gen_z3a95hz'));
const tie117 = realEvents(r38).find(function (e) { return e.pre.day === 117 && e.chosenName === 'Clinton'; });
const sc117 = sortCall(tie117);
check('97338 d117 sort-time tie Clinton/Elif at 92, earlier roster entry (Clinton) wins',
  sc117 && sc117.trust.gen_kbmt4mj === 92 && sc117.trust.elif_demir === 92 &&
  sc117.roster.indexOf('gen_kbmt4mj') < sc117.roster.indexOf('elif_demir'));

// 7. Reproduction across driver versions (r2 pre-instrument == r3 judged).
function seq(rec) { return rec.events.map(function (e) { return (e.pre ? e.pre.day : '?') + ':' + e.chosenName; }).join(','); }
const r30b = load('bo-closecommit-s97330-r2.json');
const r38b = load('bo-closecommit-s97338-r2.json');
check('97330 event sequence r2 == r3 (instrument did not move outcomes)', seq(r30b) === seq(r30), seq(r30));
check('97338 event sequence r2 == r3 (instrument did not move outcomes)', seq(r38b) === seq(r38), seq(r38));

// Transcript: mantle lines name the committed successors.
function hasMantle(rec, day, first) {
  return rec.events.some(function (e) {
    return e.pre && e.pre.day === day && (e.transcript || []).some(function (t) { return t.line.indexOf('The mantle passes to ' + first) >= 0; });
  });
}
check('transcript d103: mantle passes to Vera Bhatt', hasMantle(r30, 103, 'Vera Bhatt'));
check('transcript d106: mantle passes to Nora Wilson and to Aroha Ngata',
  hasMantle(r30, 106, 'Nora Wilson') && hasMantle(r30, 106, 'Aroha Ngata'));
check('transcript d115: mantle passes to Dmitri Sokolov', hasMantle(r38, 115, 'Dmitri Sokolov'));

console.log('TOTAL PASS ' + pass);
