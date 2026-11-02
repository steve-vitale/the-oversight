// test-foreign-react-nod-r72.js -- journey-scale r72 Q2 proof.
// r71 carried item: 85054 d90 Nina (nonverbal sitting) — the player nods
// twice and the NPC answers identically both times: "They answer at
// length. They nod back, slowly." Mechanism: the foreign-react path
// (Game.nvRespond, react branch) uses a SINGLE fixed narration per
// gesture kind, unlike the fluent nv: pool which cycles via
// convoPickCycle. This test drives nvRespond directly for a foreign
// speaker (no shared tongue, no live translate, mediated note
// suppressed so it cannot fake a difference) and asserts consecutive
// gestures of the same kind carry DIFFERENT narrations.
// RED on current code (fixed narrations); GREEN after the fix varies
// the foreign-react narration map through convoPickCycle.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra ? '-- ' + extra : ''); }
}
// Which narration pool string (if any) a returned line carries.
function narrHit(line, pool) {
  for (const p of pool) if (String(line).includes(p)) return p;
  return null;
}
const POOLS = {
  nod: ['They nod back, slowly.',
        'They nod back, a little quicker this time.',
        'They nod, holding your gaze a beat longer.'],
  smile: ['A grin breaks through, quick and warm.',
          'They smile back, slower this time, like it just landed.',
          'A smile, tired but real.'],
  pointself: ['You tap your chest, then theirs. Us. They nod, emphatic.',
              'You press a hand to your own chest, then point at them. Together — they get it.',
              'You point at yourself, then at them, then at the fire. Together. They get it.'],
};

(async () => {
  const { Game } = await loadGame({ seed: 7773, mode: 'test-foreign-react-nod-r72' });
  await setupGame(Game);
  Game.say = () => {}; Game.sysSay = () => {}; Game.emit = () => {};
  const v = Game.state.village;
  const s = Game.state.scholar;
  const vid = (v.roster || []).find(id => id !== Game.villagerId);
  ok('setup: roster villager found', !!vid);
  // Foreign speaker: native Italian, no English; player English only, no
  // translator ability, low integration — so no live translate mediation.
  v.bgLangs = v.bgLangs || {};
  v.bgLangs[vid] = { native: 'italian', levels: { italian: 2 } };
  s.languages = { native: 'english', levels: { english: 2 } };
  s.langExposure = {};
  s.abilities = (s.abilities || []).filter(a => ((a && a.id) || a) !== 'translator');
  s.integration = 10;
  const c = Game.convoGet(vid);
  c._mediatedReacted = true; // suppress the once-per-convo mediated note

  for (const kind of ['nod', 'smile', 'pointself']) {
    const lines = [Game.nvRespond(vid, kind), Game.nvRespond(vid, kind), Game.nvRespond(vid, kind)];
    const hits = lines.map(l => narrHit(l, POOLS[kind]));
    console.log(`  ${kind}: hits=${JSON.stringify(hits)}`);
    ok(`${kind}: all three lines carry a known narration`, hits.every(Boolean),
      'lines: ' + lines.map(l => String(l).slice(0, 90)).join(' | '));
    ok(`${kind}: three consecutive gestures, three distinct narrations`,
      new Set(hits).size === 3, 'hits: ' + JSON.stringify(hits));
    ok(`${kind}: no two consecutive lines identical`,
      lines[0] !== lines[1] && lines[1] !== lines[2],
      'lines: ' + lines.map(l => String(l).slice(0, 90)).join(' | '));
  }

  console.log(`\n${pass}/${pass + fail} ${fail ? 'RED' : 'GREEN'}`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(1); });
