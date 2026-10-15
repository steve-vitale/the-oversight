#!/usr/bin/env node
// sense-replay-check: replicate sweep-succgrace oneRun exactly (instruments
// included) for one seed/arm, with a Game.say beat hook; verify trajHash
// matches the committed sweep row. Extraction only.
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const fc = require('./food-coupling-20261013');
const sr = require('./scale-repro-20261013');
const HL = require('./holdloss-lib-20261015');
const RB = require('./readinessbind-lib');
const TW = require('./tworung-lib-20261015');
const crypto = require('crypto');
const { leadfeast, belongfeast } = require('./policies/feastscale');

function attachBeats(Game, t) {
  t.beats = [];
  const gday = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try {
      const txt = String((msg && (msg.text || msg.msg || msg.message)) || msg || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
      t.beats.push({ day: gday(), text: txt.slice(0, 320) });
    } catch (e) {}
    return origSay(msg);
  };
}
function attachDeaths(Game, t) { t.deaths = []; }

(async () => {
  const seed = 22, pid = 'leadfeast', armed = true;
  if (armed) process.env.SUCCGRACE = '1'; else delete process.env.SUCCGRACE;
  const { Game } = await loadGame({ seed, mode: 'succsense-check' });
  await setupGame(Game);
  const m = fc.attachInstruments(Game);
  sr.attachScale(Game, m);
  const t = {};
  attachBeats(Game, t);
  attachDeaths(Game, t);
  const hashes = [];
  const base = leadfeast;
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    if (origDaily) { try { origDaily(G, ctx); } catch (e) {} }
    try { hashes.push(RB.trajectoryHash(G)); } catch (e) {}
  };
  const result = await runDays(Game, policy, { days: 180, sampleEvery: 10 });
  const trajHash = crypto.createHash('sha1').update(hashes.join('|')).digest('hex');
  console.log('days', result.days, 'endReason', result.endReason);
  console.log('trajHash', trajHash);
  console.log('committed', '324eba6320c4fac6...');
  const RE = /dead hold no treaties|bond is fraying|realm came apart|silence answered|new speaker sends word/i;
  for (const b of t.beats.filter(b => RE.test(b.text))) console.log(`d${b.day}: ${b.text.slice(0, 200)}`);
  delete process.env.SUCCGRACE;
})().catch(e => { console.error('FATAL', e); process.exit(2); });
