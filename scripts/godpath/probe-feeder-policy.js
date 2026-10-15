#!/usr/bin/env node
'use strict';
// Replay one saved case without the scorecard observer; expose the policy's
// own action counters. Never use those counters as an ascension receipt.
const fs = require('fs'), path = require('path'), cp = require('crypto'), z = require('zlib');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
(async () => {
  const root = path.resolve(arg('root', path.join(__dirname, '../..'))), file = arg('panel', null), out = arg('out', null);
  if (!file || !out) throw new Error('--panel <saved-panel.json.gz> --out <case.json> required');
  const panel = JSON.parse(z.gunzipSync(fs.readFileSync(file))), seed = Number(arg('seed', 7));
  const expected = panel.rows.find(r => r.row.policy === 'garden-feeder' && r.row.seed === seed);
  if (!expected || panel.options.nodeVersion !== process.version) throw new Error('No matching case/Node version');
  for (const [k, value] of Object.entries(panel.options.flags)) if ((process.env[k] ?? null) !== value) throw new Error('Flag mismatch ' + k);
  const hash = b => cp.createHash('sha256').update(b).digest('hex');
  function validate() { for (const [f, h] of Object.entries(panel.sources)) if (hash(fs.readFileSync(path.join(root, f), 'utf8').replace(/\r\n/g, '\n')) !== h) throw new Error('Source mismatch ' + f); }
  validate();
  const H = require(path.join(root, 'scripts/sim-harness')), S = require(path.join(root, 'scripts/sweep-compare'));
  const base = S.POLICY_REGISTRY['garden-feeder']; let G, ctx; const gifts = [];
  S.POLICY_REGISTRY['garden-feeder'] = Object.assign({}, base, { setup(g, c) { G = g; ctx = c;
    const give = g.giveFood;
    g.giveFood = function (vid) {
      const s = this.state.scholar, v = this.state.village, day = s.day, bearer = this.villagerId;
      const before = { reserve: s.kcal, hunger: v.needs?.[vid]?.hunger, stock: s.inventory.reduce((n, i) => n + (i.units || 0) * (i.kcalEach || 0), 0), consumed: v.harvestIntake?.[day]?.[vid]?.routes?.gift?.kcal || 0 };
      const result = give.apply(this, arguments);
      gifts.push({ day, bearer, recipient: vid, before, after: { reserve: this.state.scholar.kcal, hunger: v.needs?.[vid]?.hunger,
        stock: this.state.scholar.inventory.reduce((n, i) => n + (i.units || 0) * (i.kcalEach || 0), 0), consumed: v.harvestIntake?.[day]?.[vid]?.routes?.gift?.kcal || 0 },
        sameBearer: this.villagerId === bearer, sameDay: this.state.scholar.day === day, result });
      return result;
    };
    return base.setup?.(g, c); } });
  let report;
  try { report = await H.quietLog(() => S.runComparison({ seeds: [seed], policies: ['garden-feeder'], days: panel.options.days, origin: panel.options.origin, ...(panel.options.region ? { region: panel.options.region } : {}) })); }
  finally { S.POLICY_REGISTRY['garden-feeder'] = base; }
  const stateHash = require('../gear-usage-audit').gameplayHash(G.state), match = stateHash === expected.stateHash && JSON.stringify(report.runs[0]) === JSON.stringify(expected.row);
  validate();
  const result = { seed, sourceDigest: panel.sourceDigest, probeDigest: hash(fs.readFileSync(__filename)), match, row: report.runs[0], stateHash,
    counters: Object.fromEntries(['feederHarvests', 'feederTends', 'feederGifts'].map(k => [k, ctx[k] || 0])), gifts, notes: ctx.notes };
  fs.writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ seed, match, counters: result.counters }));
  if (!match) throw new Error('Probe changed the saved campaign');
})().catch(e => { console.error(e); process.exitCode = 1; });
