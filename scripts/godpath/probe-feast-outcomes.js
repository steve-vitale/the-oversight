#!/usr/bin/env node
// Read-only campaign diagnosis. One shared harness per child process.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto');
const arg = (name, fallback) => { const i = process.argv.indexOf('--' + name); return i < 0 ? fallback : process.argv[i + 1]; };
const hash = require('../gear-usage-audit').gameplayHash;
async function child() {
  const root = path.resolve(arg('root', path.join(__dirname, '../..')));
  const H = require(path.join(root, 'scripts/sim-harness'));
  const { runComparison, POLICY_REGISTRY: registry } = require(path.join(root, 'scripts/sweep-compare'));
  const policy = arg('policy', 'capable'), base = registry[policy], observe = arg('observe', '1') !== '0';
  if (!base) throw new Error('Unknown policy ' + policy);
  const days = [], events = [], feasts = [], warnings = []; let G, depth = 0;
  function bars() {
    const s = G.state.scholar;
    return { day: s.day, part: G.dayPart, bearer: G.villagerId, kcal: s.kcal, health: s.health, hydration: s.hydration, feastDay: s.feastDay, over: G.over };
  }
  registry[policy] = Object.assign({}, base, {
    setup(g, ctx) {
      G = g;
      if (observe) {
        for (const name of ['hostFeast', 'eat', 'eatOne', 'eatStashOne', 'villageMeal', 'takeFromPantry', 'tbEnd']) {
          const original = G[name]; if (!original) continue;
          G[name] = function () {
            const before = bars(), beforeHash = name === 'hostFeast' ? hash(this.state) : null;
            const level = depth++; let result;
            try { result = original.apply(this, arguments); } finally { depth--; }
            const after = bars();
            if (name === 'hostFeast') feasts.push({ before, after, beforeHash, afterHash: hash(this.state), ok: !!result?.ok, why: result?.why, spent: result?.spent, showed: result?.showed, skipped: result?.skipped, buffGranted: result?.buffGranted });
            if (JSON.stringify(before) !== JSON.stringify(after) || name === 'tbEnd' || (name === 'hostFeast' && result?.ok)) events.push({ name, depth: level, before, after });
            return result;
          };
        }
        const tele = G.tele;
        G.tele = function (type, data) {
          if (['death', 'table_entered', 'table_failed', 'table_won', 'combat_start', 'combat_end'].includes(type)) events.push({ type, at: bars(), data: JSON.parse(JSON.stringify(data || {})) });
          return tele.apply(this, arguments);
        };
      }
      if (base.setup) return base.setup(g, ctx);
    },
    daily(g, ctx) {
      if (observe) days.push({ phase: 'before', ...bars(), hash: hash(g.state) });
      const result = base.daily && base.daily(g, ctx);
      if (observe) days.push({ phase: 'after', ...bars(), hash: hash(g.state) });
      return result;
    },
  });
  const warn = console.warn;
  console.warn = (...args) => { warnings.push(args.map(String).join(' ')); return warn.apply(console, args); };
  let report;
  try { report = await H.quietLog(() => runComparison({ seeds: [Number(arg('seed', 7))], policies: [policy], days: 150 })); }
  finally { registry[policy] = base; console.warn = warn; }
  process.stdout.write('@@FEAST@@' + JSON.stringify({ row: report.runs[0], hash: hash(G.state), days, events, feasts, warnings }) + '\n');
}
async function main() {
  if (process.argv.includes('--child')) return child();
  if (!arg('before', null) || !arg('out', null)) throw new Error('--before and --out required');
  const roots = { before: path.resolve(arg('before')), after: path.resolve(arg('after', path.join(__dirname, '../..'))) };
  const cases = arg('cases', 'capable:5,maker:555,merchant:42,caregiver:2026').split(',').map(value => { const [policy, seed] = value.split(':'); return { policy, seed: Number(seed) }; });
  const jobs = Object.entries(roots).flatMap(([side, root]) => cases.flatMap(c => ['0', '1'].map(observe => ({ side, root, ...c, observe }))));
  let next = 0; const rows = [];
  async function worker() {
    while (next < jobs.length) {
      const job = jobs[next++];
      const value = await new Promise((resolve, reject) => {
        const p = cp.spawn(process.execPath, [__filename, '--child', '--root', job.root, '--policy', job.policy, '--seed', String(job.seed), '--observe', job.observe], { cwd: job.root });
        let out = '', err = ''; p.stdout.on('data', x => { out += x; }); p.stderr.on('data', x => { err += x; }); p.on('error', reject);
        p.on('close', code => { try { if (code) throw new Error(err); resolve(JSON.parse(out.split('@@FEAST@@').pop())); } catch (e) { reject(e); } });
      }); rows.push({ ...job, ...value }); process.stdout.write('.');
    }
  }
  await Promise.all(Array.from({ length: Number(arg('par', 4)) }, worker));
  const comparisons = cases.map(c => {
    const get = (side, observe) => rows.find(r => r.side === side && r.observe === observe && r.policy === c.policy && r.seed === c.seed);
    const before = get('before', '1'), after = get('after', '1');
    const neutral = side => { const on = get(side, '1'), off = get(side, '0'); return on.hash === off.hash && JSON.stringify(on.row) === JSON.stringify(off.row); };
    const first = before.days.findIndex((d, i) => d.hash !== after.days[i]?.hash);
    const firstFeast = before.feasts.findIndex((f, i) => f.afterHash !== after.feasts[i]?.afterHash);
    return { ...c, observerNeutralBefore: neutral('before'), observerNeutralAfter: neutral('after'), firstDailyDifference: first, beforeDaily: before.days[first], afterDaily: after.days[first], firstFeastDifference: firstFeast, beforeFeast: before.feasts[firstFeast], afterFeast: after.feasts[firstFeast] };
  });
  const sources = {};
  for (const [side, root] of Object.entries(roots)) sources[side] = Object.fromEntries(['src/js/game.js', 'scripts/policies/competent.js', 'scripts/policies/capable.js', 'scripts/policies/livelihood.js', 'scripts/sim-harness.js', 'scripts/sweep-compare.js'].map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex')]));
  fs.writeFileSync(arg('out'), JSON.stringify({ roots, sources, cases, comparisons, rows }, null, 2) + '\n');
  if (comparisons.some(c => !c.observerNeutralBefore || !c.observerNeutralAfter)) throw new Error('Observer changed a campaign; retain diagnostic but do not interpret.');
  console.log('\nObserver on/off campaigns match.');
}
if (require.main === module) main().catch(e => { console.error(e.stack); process.exitCode = 1; });
