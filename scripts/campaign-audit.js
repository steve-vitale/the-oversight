#!/usr/bin/env node
'use strict';
// Natural coverage screen, standard driver. No prepared game state here.
const fs = require('fs'), path = require('path'), crypto = require('crypto'), { spawn } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
async function child() {
  const root = path.resolve(arg('root', ROOT)), H = require(path.join(root, 'scripts/sim-harness'));
  const { POLICY_REGISTRY: reg, runComparison } = require(path.join(root, 'scripts/sweep-compare'));
  const id = arg('policy', 'campaigner'), base = reg[id]; let G, ctx, maxOvertime = 0;
  const fights = [], resolved = [];
  const observe = arg('observe', '1') !== '0';
  reg[id] = { ...base };
  for (const hook of ['setup', 'upkeep', 'daily', 'fight', 'contest', 'pending']) reg[id][hook] = (g, c) => {
    G = g; ctx = c;
    if (hook === 'setup' && observe) {
      const start = G.startCombat, end = G.tbEnd;
      G.startCombat = function(mid) {
        const old = this.tbfight, r = start.apply(this, arguments), f = this.tbfight, mark = (this.state.titans || {})._fight;
        if (f && f !== old && mark) fights.push({ day: this.state.scholar.day, mid, mark: { ...mark }, allies: f.fighters.filter(a => a.kind === 'ally').length });
        return r;
      };
      G.tbEnd = function(result) {
        const mark = (this.state.titans || {})._fight;
        if (this.tbfight && mark) resolved.push({ day: this.state.scholar.day, result, mark: { ...mark }, round: this.tbfight.round });
        return end.apply(this, arguments);
      };
    }
    const r = base[hook] && base[hook](g, c);
    maxOvertime = Math.max(maxOvertime, (((G.state.scholar || {}).prog || {}).overtime || 0));
    return r;
  };
  const rep = await H.quietLog(() => runComparison({ seeds: [Number(arg('seed', 7))], policies: [id], days: Number(arg('days', 240)) }));
  const st = G.state.titans || {}, camps = st.campaigns || {};
  const counters = Object.fromEntries(Object.entries(ctx).filter(([k, v]) => k.startsWith('campaign') && typeof v !== 'object'));
  const row = { ...rep.runs[0], counters, fights, resolved, maxOvertime, omens: Object.fromEntries(Object.entries(st.omens || {}).map(([k, v]) => [k, v.stage])), slain: st.slain || {}, finale: camps.finale || null, network: camps.network || null, activeLinks: (((G.state.village.mship || {}).links) || []).filter(l => l.status === 'active').length, policyErrors: (ctx.notes || []).filter(n => n.startsWith('campaign road:')), capabilityErrors: ctx.capErrors || [], stateHash: require('./gear-usage-audit').gameplayHash(G.state) };
  if (row.pacing) delete row.pacing.perDay;
  process.stdout.write('\n@@CAMPAIGN@@' + JSON.stringify(row) + '\n');
}
async function main() {
  if (process.argv.includes('--child')) return child();
  const root = path.resolve(arg('root', ROOT)), seeds = require('./sweep-dashboard').seedList(Number(arg('n', 16)));
  const policies = arg('policies', 'campaigner-control,campaigner').split(',');
  const jobs = seeds.flatMap(seed => policies.map(policy => ({ seed, policy }))), rows = []; let next = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const job = jobs[next++];
      rows.push(await new Promise((resolve, reject) => {
        const p = spawn(process.execPath, [__filename, '--child', '--root', root, '--seed', String(job.seed), '--policy', job.policy, '--days', arg('days', '240')], { cwd: root, env: process.env });
        let out = '', err = ''; p.stdout.on('data', b => { out += b; }); p.stderr.on('data', b => { err += b; });
        p.on('error', reject); p.on('exit', code => { const line = out.split('\n').find(l => l.startsWith('@@CAMPAIGN@@')); if (code || !line) reject(new Error(JSON.stringify(job) + ': ' + err + out.slice(-1500))); else resolve(JSON.parse(line.slice(12))); });
      }));
      process.stderr.write('.');
    }
  };
  await Promise.all(Array.from({ length: Number(arg('jobs', 4)) }, worker));
  rows.sort((a, b) => a.policy.localeCompare(b.policy) || a.seed - b.seed);
  const files = ['scripts/policies/campaigner.js', 'scripts/policies/capable.js', 'scripts/policies/competent.js', 'scripts/sim-harness.js', 'scripts/sweep-compare.js', 'src/js/engine/combat.js', 'src/js/game.js', 'src/js/sigW5.js', 'src/js/titans.js', 'src/js/finale-campaign.js', 'src/js/network-campaign.js', 'src/data/titans.json'];
  const report = { kind: 'natural campaign coverage screen; no prepared state', seeds, days: Number(arg('days', 240)), hashes: Object.fromEntries(files.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex')])), rows };
  const out = arg('out', '.git/campaign-natural-16.json'); fs.writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
  for (const id of policies) {
    const rs = rows.filter(r => r.policy === id);
    console.log('\n' + id + ': ' + JSON.stringify({ runs: rs.length, wins: rs.filter(r => r.won).length, councils: rs.filter(r => r.counters.campaignCouncils).length, calls: rs.filter(r => r.counters.campaignCalls).length, campaignFights: rs.reduce((n, r) => n + (r.counters.campaignFightsStarted || 0), 0), slain: rs.map(r => r.slain), errors: rs.flatMap(r => r.policyErrors) }));
  }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
