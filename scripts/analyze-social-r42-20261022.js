#!/usr/bin/env node
// analyze-social-r42-20261022.js -- social leg r42 post-hoc analysis.
// Reads the per-seed JSONs (journey-social-r42-pilot-s*.json) and computes:
//   M2(a) verdict-margin alignment (also printed by the driver),
//   M2(b) SCORE COUNTERFACTUAL: for each natural NPC vote with a recorded
//         score, subtract the friendship term (affAcc*0.4) and re-tally the
//         verdict. Exact post-hoc counterfactual — no live game needed.
//         A vote is "friendship-decisive" when |score| < |affAcc*0.4|.
//   F1 affinity-term distribution, F2 fabricated-case shield.
// Usage: node scripts/analyze-social-r42-20261022.js [glob-prefix]
//   default: evidence/2026-10-22/journey-social-r42-pilot
'use strict';
const fs = require('fs');
const path = require('path');
const EVIDIR = path.join(__dirname, '..', 'evidence', '2026-10-22');
const PREFIX = process.argv[2] || path.join(EVIDIR, 'journey-social-r42-pilot');

const files = fs.readdirSync(EVIDIR).filter(f => f.startsWith(path.basename(PREFIX) + '-s') && f.endsWith('.json'));
if (!files.length) { console.log('no per-seed JSONs found'); process.exit(2); }

// Ceremony-authoritative player vote: the moot txt's beat stream carries the
// game's own "Your 'guilty'/'not guilty' lands in the count" line. Take the
// first such line on/after the trial day (windows overlap; only the trial's
// own ceremony counts). Overrides the driver's ledger on mismatch (r42:
// s3801 case_2 ledger=acquit, ceremony=guilty — the ||vc fallback bug).
function ceremonyVote(seed, m) {
  try {
    const fn = m.file;
    if (!fn) return null;
    const txt = fs.readFileSync(path.join(EVIDIR, `social-r42-pilot-moots`, fn), 'utf8');
    const D = m.trialDay != null ? m.trialDay : m.convenedDay;
    for (const line of txt.split('\n')) {
      const dm = /^\[day (\d+)\]/.exec(line);
      if (!dm || parseInt(dm[1], 10) < D) continue;
      if (/Your "guilty" lands in the count/.test(line)) return 'guilty';
      if (/Your "not guilty" lands in the count/.test(line)) return 'acquit';
    }
  } catch (e) {}
  return null;
}

let qual = 0, aligned = 0, flipped = 0, decisiveVotes = 0, totalVotes = 0;
const terms = [];
const fabCases = [];
console.log(`# r42 M2(b) score-counterfactual — ${files.length} seeds`);
for (const f of files.sort()) {
  const r = JSON.parse(fs.readFileSync(path.join(EVIDIR, f), 'utf8'));
  const moots = (r.moots || []).filter(m => !m.playerAccused);
  console.log(`\n## seed ${r.seed}: ${moots.length} NPC-NPC moots`);
  for (const m of moots) {
    const aff = m.affinity || [];
    // M2(a)
    let m2a = 'UNDECIDED (unanimous — no variance to align)';
    if (aff.length >= 4) {
      const g = aff.filter(v => v.vote === 'guilty'), a = aff.filter(v => v.vote === 'acquit');
      const mean = (xs) => { const q = xs.map(v => v.affAcc).filter(x => x != null); return q.length ? q.reduce((t, x) => t + x, 0) / q.length : null; };
      const mg = mean(g), ma = mean(a);
      if (mg != null && ma != null) {
        qual++;
        if (ma > mg) { aligned++; m2a = 'ALIGNED'; } else m2a = 'MISALIGNED';
      }
    }
    // M2(b): score counterfactual per vote, then re-tally.
    // The player's ballot is held constant across conditions (it carries no
    // friendship term); NPC votes are the counterfactual frame. The player
    // vote is ceremony-authoritative (driver ledger had one mismatch).
    const cv = ceremonyVote(r.seed, m);
    const pv = cv || m.playerVote;
    if (cv && m.playerVote && cv !== m.playerVote) console.log(`  NOTE ${m.caseId}: ledger playerVote=${m.playerVote} overridden by ceremony=${cv}`);
    const pvGuilty = pv === 'guilty' ? 1 : 0;
    const total = aff.length + (m.playerVote ? 1 : 0);
    const need = Math.floor(total / 2) + 1;
    let natGuilty = pvGuilty, cfGuilty = pvGuilty, decisive = [];
    for (const v of aff) {
      if (v.affAcc == null || v.score == null) continue;
      totalVotes++;
      const term = v.affAcc * 0.4;
      terms.push(Math.abs(term));
      if (v.vote === 'guilty') natGuilty++;
      const cfScore = v.score - term; // score is Math.round(s): ±0.5 rounding caveat
      if (cfScore < 0) cfGuilty++;
      if (Math.abs(v.score) < Math.abs(term)) { decisiveVotes++; decisive.push(v.name); }
    }
    const natAcquit = aff.length - (natGuilty - pvGuilty);
    const cfAcquit = aff.length - (cfGuilty - pvGuilty);
    const natVerdict = natGuilty >= need ? 'guilty' : 'acquit';
    const cfVerdict = cfGuilty >= need ? 'guilty' : 'acquit';
    const flip = natVerdict !== cfVerdict;
    if (flip) flipped++;
    if (m.fabricated) fabCases.push({ seed: r.seed, caseId: m.caseId, verdict: m.verdict, deepBonds: (m.accusedProfile || {}).deepNpcBonds });
    // Alignment is only defined when voters disagreed; unanimous moots are UNDECIDED.
    let alignNote = m2a;
    console.log(`  moot ${m.caseId} (${m.charge}${m.fabricated ? ', FABRICATED' : ''}): voters=${aff.length} natural=${natGuilty}G/${natAcquit}A verdict=${m.verdict || natVerdict} | no-friendship=${cfGuilty}G/${cfAcquit}A -> ${cfVerdict} ${flip ? '*** VERDICT FLIPS ***' : ''} | M2(a)=${alignNote} | friendship-decisive votes: ${decisive.length ? decisive.join(', ') : 'none'}`);
  }
}
terms.sort((a, b) => a - b);
console.log(`\nM2(a): ${aligned}/${qual} qualifying moots aligned`);
console.log(`M2(b): ${flipped} natural verdicts flip without the friendship term; ${decisiveVotes}/${totalVotes} individual votes friendship-decisive`);
console.log(`F1: |aff*0.4| over ${terms.length} votes — max ${terms.length ? terms[terms.length - 1].toFixed(1) : 'n/a'}, median ${terms.length ? terms[Math.floor(terms.length / 2)].toFixed(1) : 'n/a'}, >=5: ${terms.filter(t => t >= 5).length}`);
console.log(`F2 fabricated: ${fabCases.length ? fabCases.map(c => `s${c.seed}:${c.caseId}=${c.verdict}(deepBonds=${c.deepBonds})`).join(' ') : '(none)'}`);
