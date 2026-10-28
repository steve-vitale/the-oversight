#!/usr/bin/env node
// scripts/test-earlycrew-a-sense.js — SENSE-ONLY replay for
// sim-earlycrew-a (NON-MEASURED: narration replays never enter the
// census — narration can shift trajectories, so this proves wording
// and presence only, never counts). Purpose: read ONE seed's joint-
// outing window in plain words and judge whether outings that meet a
// monster read like people choosing to go out together, or like a
// mechanism herding them.
// Same say/sysSay tap pattern as test-fieldparty-form-a-sense.js:
// wraps record text and call the original, drawing no RNG. A
// fieldFight tap (after the original, pure log) ties narration to
// crewed meetings in the window.
// Usage: SEED=75103 DAYS=120 FROM_DAY=60 node scripts/test-earlycrew-a-sense.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
let earlycrewPolicy = null;
try { earlycrewPolicy = require('./policies/earlycrew').earlycrew; }
catch (e) {
  console.error('EARLYCREW POLICY MISSING (NO-GO verdict deletes it): scripts/policies/earlycrew.js is required to re-run this replay.');
  process.exit(1);
}
const SEED = parseInt(process.env.SEED || '75103', 10);
const DAYS = parseInt(process.env.DAYS || '120', 10);
const FROM_DAY = parseInt(process.env.FROM_DAY || '60', 10);
const HIT_RE = /forag|returns with|treeline|shouts for help|charges in|killed|mourns|fled|stood down|out there|together|patrol|scout|hunt/i;
(async () => {
  process.env.LEANLINKRESCUE = '1'; process.env.TABLESEATNOWAIT = '1'; process.env.EARLYCREW = '1';
  const { Game } = await loadGame({ seed: SEED, mode: 'earlycrew-a-sense', fullTelemetry: false, narration: true });
  await setupGame(Game);
  const hits = [];
  const fights = [];
  const wrap = (name) => {
    const orig = Game[name];
    if (typeof orig !== 'function') return;
    Game[name] = function (x) {
      try {
        const s = String(x);
        const day = ((Game.state || {}).scholar || {}).day || 0;
        if (day >= FROM_DAY && HIT_RE.test(s)) hits.push('[d' + day + '] ' + s.slice(0, 300));
      } catch (e) {}
      return orig.apply(this, arguments);
    };
  };
  wrap('say'); wrap('sysSay');
  const origFF = Game.fieldFight;
  if (typeof origFF === 'function') {
    Game.fieldFight = function (vid, mdef, m, opts) {
      const rec = origFF.apply(this, arguments);
      try {
        const day = ((Game.state || {}).scholar || {}).day || 0;
        if (day >= FROM_DAY) {
          const crew = (Game._outdoorCrew || []).filter(v => v !== vid);
          fights.push(`[d${day}] leader=${vid} monster=${(mdef && mdef.id) || (m && m.id)} crew=${JSON.stringify(crew)} allies=${(opts && opts.allies) | 0} outcome=${rec && rec.outcome} rounds=${rec && rec.rounds} calledHelp=${rec && rec.calledHelp} allyVid=${rec && rec.allyVid}`);
        }
      } catch (e) {}
      return rec;
    };
  }
  await quietLog(async () => { await runDays(Game, earlycrewPolicy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  console.log('=== earlycrew-a sense replay: seed=' + SEED + ' outdoorcrew narration=on, ' + DAYS + 'd from d' + FROM_DAY + ' (NON-MEASURED) ===');
  console.log('--- outing/fight narration hits (' + hits.length + ') ---');
  for (const h of hits) console.log('  ' + h);
  console.log('--- fieldFight taps in window (' + fights.length + ') ---');
  for (const f of fights) console.log('  ' + f);
  if (!hits.length && !fights.length) console.log('(no beats fired in this replay from d' + FROM_DAY + ')');
})().catch(e => { console.error('EARLYCREW SENSE FAILED:', (e && e.stack) || e); process.exit(1); });
