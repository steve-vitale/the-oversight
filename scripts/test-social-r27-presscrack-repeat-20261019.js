#!/usr/bin/env node
// test-social-r27-presscrack-repeat-20261019.js -- PROOF TEST (journey-social r27).
// Pressing two different cracks on the same accomplice served the fixed
// string "Done — their story has a crack in it now." twice verbatim
// (transcript-verified 2026-10-19, seed 2002 d53 Isabella, gen_y48s3wr held
// two inconsistencies — both breaks real, the telling parroted).
// The fix (betrayal.js `press` act): cycle the broke-line via
// convoPickCycle. Outcome-awareness is untouched: the crack line only fires
// when pressAccomplice actually found a crack.
// GREEN = two real breaks on the same accomplice produce two distinct
// tellings, and a held press still cycles the held-box lines (never the
// crack line).
// RED (pre-fix) = both breaks say "Done — their story has a crack in it now."
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };

function lastNpcLine(Game, vid, before) {
  const tr = safe(() => (Game.convoGet(vid) || {}).transcript || [], []);
  const fresh = tr.slice(before);
  for (let i = fresh.length - 1; i >= 0; i--) {
    if (fresh[i] && fresh[i].who !== 'you') return String(fresh[i].text || '');
  }
  return null;
}

async function main() {
  const { Game } = await loadGame({ seed: 777003, mode: 'presscrack-repeat-proof' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const roster = (Game.state.village.roster || []).filter(id => id !== sid);
  const vid = roster[0], acc = roster[1] || roster[0];

  // Fabricate a case where the same accomplice holds TWO unfound cracks.
  const v = Game.state.village;
  v.betrayal = v.betrayal || {};
  v.betrayal.cases = v.betrayal.cases || [];
  v.betrayal.cases.push({
    id: 'case_press27', plotId: 'p_none', target: sid,
    accused: [acc], foundBribes: [], exposedBribes: [],
    belief: {}, evidence: [],
    inconsistencies: [
      { found: false, field: 'whereabouts', selfContra: true, claims: { [acc]: 'at the fire' }, altClaim: 'by the treeline' },
      { found: false, field: 'motive', selfContra: false, claims: { [acc]: 'no reason', [vid]: 'the food stores' } },
    ],
  });

  Game.startConvo(vid);
  const spoken = [];
  for (let i = 0; i < 2; i++) {
    const before = safe(() => (Game.convoGet(vid) || {}).transcript.length || 0, 0);
    Game.betrayalTurn(vid, `betrayal:press:case_press27:${acc}`);
    spoken.push(lastNpcLine(Game, vid, before));
  }
  spoken.forEach((l, i) => console.log(`press ${i + 1}:`, l));

  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };
  if (spoken.some(l => !l)) fail('a press pick produced no NPC line');
  if (spoken[0] === spoken[1]) fail(`two real breaks, one parroted telling: "${spoken[0]}"`);
  // Both breaks must still claim a crack (outcome-aware), never the held line.
  for (const l of spoken) {
    if (l && /story holds|Nothing new/i.test(l)) fail('a real break spoke the held line: ' + l);
  }
  // A held press (no cracks left) still speaks a held-box line, not a crack
  // telling. (Held-box lines can contain the word "crack" — "No crack —
  // yet" — so match against the crack pool itself, not the substring.)
  const before = safe(() => (Game.convoGet(vid) || {}).transcript.length || 0, 0);
  Game.betrayalTurn(vid, `betrayal:press:case_press27:${acc}`);
  const held = lastNpcLine(Game, vid, before);
  console.log('held press:', held);
  const CRACK_TELLINGS = [
    'Done — their story has a crack in it now.',
    "Another crack. The telling doesn't hold together anymore.",
    'There — the story splits again. You mark the spot.',
  ];
  if (held && CRACK_TELLINGS.some(t => String(held).includes(t))) fail('held press claimed a crack: ' + held);
  if (held && !/story holds|Same story|walked them through/i.test(held)) fail('held press spoke neither held-box nor dry-terminal line: ' + held);

  Game.endConvo(vid, 'left');
  console.log(fails ? `RESULT: ${fails} FAILURES` : 'RESULT: GREEN — crack tellings vary, outcome-awareness kept');
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.error('ERROR:', e && e.stack || e); process.exit(1); });
