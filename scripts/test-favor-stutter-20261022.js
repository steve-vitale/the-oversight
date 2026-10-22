// scripts/test-favor-stutter-20261022.js — proof test for journey-scale r21
// (2026-10-22): THE HUNGER STUTTER.
//
// RED (pre-fix, captured in the pilot transcript
// evidence/2026-10-22/journey-scale-r21-lead/journey-scale-r21-transcript-30001-day140.txt):
//   "I'm going hungry — tell me you've got food to spare. I'm going hungry here.
//    I can't keep going like this."
// The food_share favor's slot composition (convo-wants.js build()) pairs
// opener[1] "I'm {hungerWord} —" with detail[2] "tell me you've got food to
// spare. I'm {hungerWord} here." — the hunger word lands twice in one spoken
// line. The fix rotates the detail index when both fire.
//
// GREEN means:
//   1. the stutter detector flags the known RED line (the test would have
//      caught the bug);
//   2. across a 300-instance sweep per hunger severity (70/80/90 — covering
//      all 3 hunger words), with every opener and every detail observed at
//      least once per severity, NO composed favor line contains the same
//      hunger word twice.
// Usage: node scripts/test-favor-stutter-20261022.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const HUNGER_WORDS = ['going hungry', 'running on empty', 'past hungry'];
const OPENERS = ['I hate to ask, but', '—', 'Please —']; // opener[1] = `I'm {w} —`
const DETAILS = ['do you have anything to eat?', 'have you got anything to spare?', "tell me you've got food to spare."];

function stutters(line) {
  const s = String(line || '').toLowerCase();
  for (const w of HUNGER_WORDS) {
    let n = 0, i = 0;
    while ((i = s.indexOf(w, i)) !== -1) { n++; i += w.length; }
    if (n >= 2) return w;
  }
  return null;
}

(async () => {
  let pass = 0, fail = 0;
  const t = (name, cond, extra) => {
    if (cond) { pass++; console.log(`  ok: ${name}`); }
    else { fail++; console.log(`  FAIL: ${name}${extra ? ' — ' + extra : ''}`); }
  };

  // 1. the detector catches the known RED line from the pilot transcript
  const redLine = `"I'm going hungry — tell me you've got food to spare. I'm going hungry here. I can't keep going like this."`;
  t('detector flags the pre-fix stutter line', stutters(redLine) === 'going hungry', 'detector=' + stutters(redLine));

  // 2. sweep the real composition path
  const { Game } = await loadGame({ seed: 424242, mode: 'favor-stutter-proof' });
  await setupGame(Game);
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  t('roster has villagers to ask', roster.length > 0, 'roster=' + roster.length);
  const vid = roster[0];

  for (const sev of [70, 80, 90]) {
    const lines = [];
    const seenOpeners = new Set(), seenDetails = new Set();
    for (let i = 0; i < 300; i++) {
      let f = null;
      try { f = Game.convoBuildFavor(vid, { kind: 'food_share', hunger: sev }); } catch (e) { f = null; }
      if (!f || !f.line) { t(`sev ${sev}: favor #${i} composed`, false, 'null favor'); break; }
      lines.push(f.line);
      const s = f.line;
      if (s.includes('I hate to ask, but')) seenOpeners.add(0);
      if (/I'm (going hungry|running on empty|past hungry) —/.test(s)) seenOpeners.add(1);
      if (s.includes('Please —')) seenOpeners.add(2);
      DETAILS.forEach((d, di) => { if (s.includes(d)) seenDetails.add(di); });
    }
    const bad = lines.map((l, i) => ({ i, l, w: stutters(l) })).filter(x => x.w);
    t(`sev ${sev}: 300 favors composed`, lines.length === 300, 'got ' + lines.length);
    t(`sev ${sev}: all 3 openers observed`, seenOpeners.size === 3, 'seen=' + [...seenOpeners].join(','));
    t(`sev ${sev}: all 3 details observed`, seenDetails.size === 3, 'seen=' + [...seenDetails].join(','));
    t(`sev ${sev}: zero stuttered lines`, bad.length === 0,
      bad.length ? `first: #${bad[0].i} word="${bad[0].w}" line=${bad[0].l.slice(0, 120)}` : '');
  }

  console.log(`\n${fail === 0 ? 'GREEN' : 'RED'}: ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('PROOF ERROR:', e && e.stack || e); process.exit(2); });
