#!/usr/bin/env node
// test-moot-grammar-20261011.js — PROOF (journey-social leg 2026-10-11).
//
// BUG: the moot-demand summons said "The thefts gets a moot" / "The threats
// gets a moot" — chargeWords are plural for theft ('the thefts') and
// intimidation ('the threats') but the template verb was singular.
// FIX: justiceVoice.json templates use "{ChargeWord} {verb} a moot";
// justiceDemandMoot computes verb ('get' for plural charges, 'gets' else).
//
// RED on old code: any collected summons line contains "thefts gets" or
//   "threats gets".
// GREEN: plural charges always take "get", singular ("the killing",
///  "the attack") always take "gets" — via the real justiceDemandMoot path
//   AND via direct template fill.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

let failures = 0;
function check(cond, label) {
  console.log((cond ? 'ok   ' : 'FAIL ') + label);
  if (!cond) failures++;
}

(async () => {
  const { Game } = await loadGame({ seed: 424242, mode: 'moot-grammar' });
  await setupGame(Game);
  const vv = Game.state.village || {};
  const roster = (vv.roster || []).filter(id => id !== Game.villagerId);
  const victim = roster[0];
  // a bold confronter so the bold-only refused template is eligible
  let bold = null;
  try {
    bold = roster.find(id => { const t = String(Game.npcTemper(id) || '').toLowerCase(); return t === 'bold' || t === 'intense'; }) || null;
  } catch (e) {}
  const confronter = bold || roster[1] || victim;

  const lines = [];
  const oldSay = Game.say;
  Game.say = function (t) { const s = String(t == null ? '' : t); if (/^⚖ /.test(s)) lines.push(s); };

  const types = ['theft', 'intimidation', 'murder', 'attack'];
  const seen = {};
  for (const type of types) {
    seen[type] = new Set();
    for (const reason of ['refused', 'heat']) {
      const j = Game.justiceState();
      j.crimes = [{ type, witnessed: true, victim, day: Game.state.scholar.day }];
      j.confrontedBy = confronter;
      j.confrontRefused = reason === 'refused';
      j.silenceRefused = false;
      j.mootDemanded = false;
      try { Game.betrayalState().cases = []; } catch (e) {}
      for (let i = 0; i < 40; i++) {
        const before = lines.length;
        try { Game.justiceDemandMoot(); } catch (e) { /* ignore */ }
        for (let k = before; k < lines.length; k++) seen[type].add(lines[k]);
        // reset the case so the next iteration re-demands
        try { Game.betrayalState().cases = []; } catch (e) {}
        const jj = Game.justiceState(); jj.mootDemanded = false;
      }
    }
  }
  Game.say = oldSay;

  for (const type of types) {
    const set = [...seen[type]];
    const badPlural = set.filter(s => /thefts gets|threats gets/.test(s));
    check(badPlural.length === 0, `${type}: no plural-subject "gets" (${set.length} distinct summons lines)`);
    if (badPlural.length) console.log('   e.g. ' + badPlural[0]);
  }
  // positive: plural charges produce "get a moot" via the real path
  const theftGet = [...seen.theft].some(s => /thefts get a moot/.test(s));
  check(theftGet, 'theft: real path produced "the thefts get a moot"');
  const intimGet = [...seen.intimidation].some(s => /threats get a moot/.test(s));
  check(intimGet, 'intimidation: real path produced "the threats get a moot"');
  const murderGets = [...seen.murder].some(s => /killing gets a moot/.test(s));
  check(murderGets, 'murder: real path produced "the killing gets a moot"');
  // direct template fill (JSON-level): the {verb} slot fills
  const data = Game.justiceVoiceData();
  const tmpl = (data.summons.refused.find(x => String(x.text || '').includes('{verb}')) || {}).text;
  const filled = tmpl ? Game.justiceVoiceFill(tmpl, { name: 'Tamika', chargeWord: 'the thefts', ChargeWord: 'The thefts', verb: 'get' }) : null;
  check(!!filled && /The thefts get a moot/.test(filled), 'direct fill: "{ChargeWord} {verb} a moot" -> "The thefts get a moot"');

  console.log(failures ? `\n${failures} FAILURES` : '\nALL GREEN');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
