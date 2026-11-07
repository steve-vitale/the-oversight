// raise-answer-probe-20261107.js — one-off probe for journey-scale r108.
// The r108 driver saves transcripts only for CONVO_DAYS talks; the
// link-raise answers happen inside the policy's own talks (talkTo +
// convoTurn), whose lines go through sayLine into the conversation
// transcript — invisible in the say capture. This probe replays seed
// 97002 (first raise answer d6) with a read-only convoTurn wrapper that
// records every turn's pick + returned line, so the run note's people
// check can read the raise-answer talk verbatim.
// Usage: SEED=97002 DAYCAP=12 node scripts/raise-answer-probe-20261107.js
// Writes: evidence/2026-11-07/journey-scale-r108/raise-answer-probe-<seed>.txt
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '97002', 10);
const DAYCAP = parseInt(process.env.DAYCAP || '12', 10);
const OUT = path.join(ROOT, 'evidence', '2026-11-07', 'journey-scale-r108', 'raise-answer-probe-' + SEED + '.txt');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const LR = require('./policies/scalecourt-nogate-morntrace3-linkraise');

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'raise-answer-probe' });
  const lines = [];
  const dayOf = () => { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } };
  const origTurn = Game.convoTurn.bind(Game);
  Game.convoTurn = function (vid, id) {
    const r = origTurn(vid, id);
    try {
      const nm = (Game.displayName ? Game.displayName(vid) : vid) || vid;
      lines.push('d' + dayOf() + ' ' + nm + ' (' + vid + ') YOU:[' + id + '] -> ' + String((r && r.line) || '').slice(0, 220) + (r && r.ended ? ' [ENDED]' : ''));
    } catch (e) { lines.push('d' + dayOf() + ' ' + vid + ' YOU:[' + id + '] (record-error ' + (e && e.message) + ')'); }
    return r;
  };
  const origTalk = Game.talkTo.bind(Game);
  Game.talkTo = function (vid) {
    const r = origTalk(vid);
    try {
      const nm = (Game.displayName ? Game.displayName(vid) : vid) || vid;
      lines.push('d' + dayOf() + ' TALK-OPEN ' + nm + ' (' + vid + '): ' + String(r && (r.line || r) || '').slice(0, 220));
    } catch (e) {}
    return r;
  };
  await setupGame(Game);
  LR.resetLinkraiseStats();
  const policy = Object.create(LR.linkraisePolicy);
  policy._ctx = null;
  const baseSetup = LR.linkraisePolicy.setup ? LR.linkraisePolicy.setup.bind(LR.linkraisePolicy) : null;
  policy.setup = function (G, ctx) { if (baseSetup) baseSetup(G, ctx); policy._ctx = ctx; };
  await runDays(Game, policy, {
    days: DAYCAP,
    manifest: { seed: SEED, mode: 'raise-answer-probe', date: new Date().toISOString().slice(0, 10), node: process.version },
  });
  const stats = LR.linkraiseStats();
  const head = ['probe seed ' + SEED + ' DAYCAP=' + DAYCAP,
    'linkraise: seen=' + stats.raisesSeen + ' answered=' + stats.raisesAnswered + ' linked=' + stats.raisesLinked + ' counter=' + stats.raisesCountered + ' errors=' + stats.errors,
    'events: ' + JSON.stringify(stats.events),
    '--- conversation turns (policy talks + CONVO_DAYS talks, if any) ---'];
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, head.concat(lines).join('\n') + '\n');
  console.log('probe wrote ' + OUT + ' turns=' + lines.length + ' answered=' + stats.raisesAnswered);
})().catch(e => { console.error('PROBE ERROR:', e && e.stack || e); process.exit(2); });
