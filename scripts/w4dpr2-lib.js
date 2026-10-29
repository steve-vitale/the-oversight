// w4dpr2-lib — shared parser + classifier for sim-w4dpr2 (analyzer,
// fixtures, sense). Pure functions over recorder rows; no game
// loads, no RNG, no writes. The parser reads ONLY the engine's own
// rec.log lines (fieldFights.js formats, verified by grep):
//   volley: '  loosed — it takes <phrase> for <N> (<left> left).'
//   strike: 'R<r>: <name> strikes for <N> ... (<left> left)'
//   ally extra: 'R<r>: <name> strikes again for <N> ...'
//   hit: 'R<r>: <atk> hits <name> for <N> (<left> left)'
//   un-write heal: 'R<r>: ... wounds un-write. (+<N>)'
// Anything else in the log is narration, not damage, and is
// ignored by the parser (it still appears in the verbatim trace).
// Attribution: a strike/hit subject matching exactly one of
// (leaderFirst, allyFirst) goes to that fighter; a subject
// matching BOTH (same first name on both fighters) falls back
// to in-round strike order (first strike line = leader, later
// = ally) for strikes, and to UNKNOWN for hits (no honest
// order rule exists there — reported, never guessed).
'use strict';

function emptyRounds(n) {
  const out = [];
  for (let r = 0; r <= n; r++) out.push({ round: r, leaderDealt: 0, allyDealt: 0, leaderTaken: 0, allyTaken: 0, heals: 0, volleyHits: 0, volleyMisses: 0 });
  return out;
}

function parseFightLog(f) {
  const log = Array.isArray(f.log) ? f.log : [];
  const rounds = Math.max(0, f.rounds | 0);
  const per = emptyRounds(rounds);
  let unknownDealt = 0, unknownTaken = 0, unknownLines = 0;
  const strikeOrder = {}; // round -> count of strike lines seen
  for (const raw of log) {
    const line = String(raw);
    let m;
    // Volley (pre-round, round 0). 'loosed wide' = miss, no damage.
    if (line.indexOf('loosed') >= 0) {
      if ((m = line.match(/for (\d+) \(/))) { per[0].leaderDealt += (+m[1]); per[0].volleyHits++; }
      else if (line.indexOf('loosed wide') >= 0) { per[0].volleyMisses++; }
      continue;
    }
    // Un-write heal (monster HP restored, mDealt NOT reduced).
    if (line.indexOf('un-write') >= 0) {
      const hm = line.match(/^R(\d+):.*\(\+(\d+)\)/);
      if (hm) { const r = +hm[1]; if (per[r]) per[r].heals += (+hm[2]); }
      continue;
    }
    // Strike lines.
    if ((m = line.match(/^R(\d+): (.+?) strikes (again )?for (\d+)/))) {
      const r = +m[1], subj = m[2], again = !!m[3], dmg = +m[4];
      if (!per[r]) { unknownLines++; continue; }
      const isLeader = subj === f.leaderFirst, isAlly = f.allyFirst && subj === f.allyFirst;
      // 'strikes again' FIRST: it is always the ally extra blow
      // (fieldFights.js:1197, godpath extraAlly) — even when the
      // ally shares the leader's first name, 'again' names the ally.
      if (again) per[r].allyDealt += dmg;
      else if (isLeader && !isAlly) per[r].leaderDealt += dmg;
      else if (isAlly && !isLeader) per[r].allyDealt += dmg;
      else if (isLeader && isAlly) {
        const seen = strikeOrder[r] || 0;
        if (seen === 0) per[r].leaderDealt += dmg; else per[r].allyDealt += dmg;
      }
      else { unknownDealt += dmg; unknownLines++; }
      strikeOrder[r] = (strikeOrder[r] || 0) + 1;
      continue;
    }
    // Monster-hit lines.
    if ((m = line.match(/^R(\d+): .* hits (.+?) for (\d+) \(/))) {
      const r = +m[1], tgt = m[2], dmg = +m[3];
      if (!per[r]) { unknownLines++; continue; }
      const isLeader = tgt === f.leaderFirst, isAlly = f.allyFirst && tgt === f.allyFirst;
      if (isLeader && !isAlly) per[r].leaderTaken += dmg;
      else if (isAlly && !isLeader) per[r].allyTaken += dmg;
      else { unknownTaken += dmg; unknownLines++; }
      continue;
    }
  }
  const sum = (k) => per.reduce((t, p) => t + p[k], 0);
  const parsedDealt = sum('leaderDealt') + sum('allyDealt');
  const parsedTaken = sum('leaderTaken') + sum('allyTaken');
  const parsedAllyDealt = sum('allyDealt');
  return {
    per: per,
    volleyDealt: per[0].leaderDealt,
    leaderDealt: sum('leaderDealt') - per[0].leaderDealt,
    allyDealt: parsedAllyDealt,
    dealt: parsedDealt,
    taken: parsedTaken,
    leaderTaken: sum('leaderTaken'),
    allyTaken: sum('allyTaken'),
    heals: sum('heals'),
    unknownDealt: unknownDealt, unknownTaken: unknownTaken, unknownLines: unknownLines,
    // Validation against the engine's own totals. dealtDelta and
    // takenDelta must be 0 for a trusted parse; allyDelta must
    // be 0 for a trusted ally share. Non-zero = PARSE-MISMATCH,
    // reported, never adjusted.
    dealtDelta: parsedDealt - (f.mDealt | 0),
    takenDelta: parsedTaken - ((f.vTaken | 0) + (f.allyTaken | 0)),
    allyDelta: parsedAllyDealt - (f.allyDealt | 0),
  };
}

// Break reason, prereg priority order. Returns {reason, sub} where
// sub carries the outcome for CAP (vFlee/mFlee) and the trick
// flag for DRIVE-OFF. OTHER must be 0 for a GO.
function classifyBreak(f) {
  const log = Array.isArray(f.log) ? f.log : [];
  const capLine = log.some(l => String(l).indexOf('Neither gives after 15 rounds') >= 0);
  // The only trick branch that sets vFlee directly is the suburb
  // leave (fieldFights.js: fleeWise = true, narrated "Navigation
  // is victory"). Other trick exits (offer_food, redactor starve)
  // set mFlee and land in DRIVE-OFF. So TRICK-EXIT = fleeWise.
  const trickExit = !!f.fleeWise && f.outcome === 'vFlee';
  if (f.outcome === 'vKill') return { reason: 'KILL', sub: 'vKill' };
  if (f.rounds >= 15 && capLine) return { reason: 'CAP', sub: f.outcome };
  if (f.outcome === 'mFlee') return { reason: 'DRIVE-OFF', sub: ((f.trickLog || []).length ? 'trick' : 'breakline') };
  if (f.outcome === 'vDie') return { reason: 'PARTY-DEATH', sub: 'vDie' };
  if (f.outcome === 'vFlee' && f.fleeHopeless) return { reason: 'HOPELESS', sub: 'vFlee' };
  if (f.outcome === 'vFlee' && f.fleeLearn && !f.fleeHopeless) return { reason: 'LEARN-WITHDRAWAL', sub: 'vFlee' };
  if (f.outcome === 'vFlee' && trickExit) return { reason: 'TRICK-EXIT', sub: 'vFlee' };
  if (f.outcome === 'vFlee' && !f.fleeHopeless && !f.fleeLearn) return { reason: 'WOUND-FLOOR', sub: 'vFlee' };
  return { reason: 'OTHER', sub: String(f.outcome) };
}

// Loadout class from the recorder's loadout (post preferred, pre
// fallback — the caller passes the resolved one). Never assumes
// melee+ranged stack: a spear id in RANGED is a spear config.
function loadoutClass(lo) {
  if (!lo) return 'unknown';
  const melee = lo.melee || null, ranged = lo.ranged || null;
  const carried = lo.carriedWeapons || [];
  if (melee && ranged) return melee + '+' + ranged;
  if (melee) return melee + (carried.indexOf('bow') >= 0 ? '+bow-carried-not-equipped' : '');
  if (ranged) return 'ranged-only:' + ranged + (carried.length ? '+carried:' + carried.join(',') : '');
  if (carried.length) return 'unarmed-equipped+carried:' + carried.join(',');
  return 'unarmed';
}

function medianOf(a) {
  if (!a.length) return null;
  const s = a.slice().sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)];
}
function quartiles(a) {
  if (!a.length) return { q25: null, med: null, q75: null, min: null, max: null };
  const s = a.slice().sort((x, y) => x - y);
  return { q25: s[Math.floor(s.length * 0.25)], med: s[Math.floor(s.length / 2)], q75: s[Math.floor(s.length * 0.75)], min: s[0], max: s[s.length - 1] };
}

module.exports = { parseFightLog, classifyBreak, loadoutClass, medianOf, quartiles, emptyRounds };
