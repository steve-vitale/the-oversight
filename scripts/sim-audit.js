#!/usr/bin/env node
// scripts/sim-audit.js — what the simulator can't see, and what silently fails.
//
// Runs seeds × policies, each in its own process (never two harnesses in one
// process), with two instruments on:
//   SIM_CATCH=1        every empty `catch (e) {}` in src/ reports what it
//                      swallowed (site, count, first message)
//   NODE_V8_COVERAGE   V8 function coverage; the harness tags each eval'd file
//                      with //# sourceURL so coverage names the real file
// and merges them into evidence/<date>/sim-audit-<label>.{json,md}:
//   - swallowed errors ranked by (runs affected, count)
//   - per-file function coverage; every NAMED function that never ran in any
//     run, under any policy (dead code, or a feature behind a bug/gate)
//
//   node scripts/sim-audit.js                         # default matrix
//   SEEDS=7,42 POLICIES=competent DAYS=60 node scripts/sim-audit.js
//   LABEL=after-fix node scripts/sim-audit.js
//
// Child mode (internal): node scripts/sim-audit.js --child <seed> <policy> <days>
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const ROOT = path.join(__dirname, '..');

// ---------------- child ----------------
if (process.argv[2] === '--child') {
  const [seed, policyId, days] = process.argv.slice(3);
  (async () => {
    const H = require('./sim-harness');
    const { POLICY_REGISTRY } = require('./sweep-compare');
    const policy = POLICY_REGISTRY[policyId];
    if (!policy) throw new Error('unknown policy ' + policyId);
    const { Game, loadFails } = await H.loadGame({ seed: Number(seed), mode: 'sim-audit' });
    await H.setupGame(Game);
    const r = await H.quietLog(() => H.runDays(Game, policy, { days: Number(days) }));
    const s = Game.state.scholar || {};
    const out = {
      seed: Number(seed), policy: policyId, days: r.days, endReason: r.endReason,
      won: !!Game.won, loadFails, swallowed: H.swallowReport(),
      abilities: (s.abilities || []).map(a => a.id), synergies: s.activeSynergies || [],
      integration: s.integration || 0,
    };
    process.stdout.write('\n@@RESULT@@' + JSON.stringify(out) + '\n');
  })().catch(e => { process.stdout.write('\n@@RESULT@@' + JSON.stringify({ seed, policy: policyId, crash: String(e && e.stack || e).slice(0, 400) }) + '\n'); });
  return;
}

// ---------------- parent ----------------
const SEEDS = (process.env.SEEDS || '7,42,99,1234').split(',').map(Number);
const POLICIES = (process.env.POLICIES || 'competent,winseek,oraclev2,socialite,kind,deed-seeking').split(',');
const DAYS = Number(process.env.DAYS || 120);
const JOBS = Number(process.env.JOBS || Math.max(1, os.cpus().length));
const LABEL = process.env.LABEL || 'baseline';
const DATE = new Date().toISOString().slice(0, 10);
const COVROOT = path.join(os.tmpdir(), 'sim-audit-cov-' + process.pid);

function runChild(seed, policy, idx) {
  return new Promise(resolve => {
    const covDir = path.join(COVROOT, String(idx));
    fs.mkdirSync(covDir, { recursive: true });
    const env = Object.assign({}, process.env, { SIM_CATCH: '1', NODE_V8_COVERAGE: covDir });
    const child = spawn(process.execPath, [__filename, '--child', String(seed), policy, String(DAYS)], { cwd: ROOT, env });
    let out = '';
    child.stdout.on('data', d => { out += d; if (out.length > 4e6) out = out.slice(-2e6); });
    child.stderr.on('data', () => {});
    child.on('close', () => {
      const m = out.split('@@RESULT@@').pop();
      let res;
      try { res = JSON.parse(m.trim().split('\n')[0]); } catch (e) { res = { seed, policy, crash: 'no result' }; }
      res.covDir = covDir;
      resolve(res);
    });
  });
}

// line number of a char offset
function lineOf(text, off, cache) {
  let lines = cache.get(text);
  if (!lines) {
    lines = [0];
    for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) lines.push(i + 1);
    cache.set(text, lines);
  }
  let lo = 0, hi = lines.length - 1;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (lines[mid] <= off) lo = mid; else hi = mid - 1; }
  return lo + 1;
}

(async () => {
  const t0 = Date.now();
  const matrix = [];
  for (const p of POLICIES) for (const s of SEEDS) matrix.push([s, p]);
  console.log(`sim-audit: ${matrix.length} runs (${POLICIES.length} policies × ${SEEDS.length} seeds × ${DAYS}d), ${JOBS} parallel`);
  const results = [];
  let next = 0;
  await Promise.all(Array.from({ length: JOBS }, async () => {
    while (next < matrix.length) {
      const i = next++;
      const r = await runChild(matrix[i][0], matrix[i][1], i);
      results.push(r);
      process.stdout.write(r.crash ? 'X' : '.');
    }
  }));
  process.stdout.write('\n');

  // ---- swallowed errors ----
  const sw = {};
  for (const r of results) for (const x of (r.swallowed || [])) {
    const a = sw[x.site] || (sw[x.site] = { site: x.site, n: 0, runs: 0, msg: x.msg });
    a.n += x.n; a.runs++;
  }
  const swList = Object.values(sw).sort((a, b) => b.runs - a.runs || b.n - a.n);

  // ---- coverage ----
  const srcCache = new Map(), lineCache = new Map();
  const fnMap = {}; // file -> key -> {name, line, hit}
  for (const r of results) {
    if (!r.covDir || !fs.existsSync(r.covDir)) continue;
    for (const f of fs.readdirSync(r.covDir)) {
      let j; try { j = JSON.parse(fs.readFileSync(path.join(r.covDir, f), 'utf8')); } catch (e) { continue; }
      for (const sc of j.result || []) {
        const url = sc.url || '';
        if (!/^src\/js\//.test(url)) continue;
        let text = srcCache.get(url);
        if (text == null) { try { text = fs.readFileSync(path.join(ROOT, url), 'utf8'); } catch (e) { text = ''; } srcCache.set(url, text); }
        const fm = fnMap[url] || (fnMap[url] = {});
        for (const fn of sc.functions || []) {
          const rg = (fn.ranges || [])[0];
          if (!rg || !fn.functionName) continue; // anonymous callbacks: too noisy to name
          if (rg.startOffset === 0 && rg.endOffset >= text.length - 1) continue; // whole script
          const key = rg.startOffset + ':' + fn.functionName;
          const e = fm[key] || (fm[key] = { name: fn.functionName, line: lineOf(text, rg.startOffset, lineCache), hit: false });
          if (rg.count > 0) e.hit = true;
        }
      }
    }
  }
  const files = Object.keys(fnMap).sort().map(f => {
    const fns = Object.values(fnMap[f]);
    const dead = fns.filter(x => !x.hit).sort((a, b) => a.line - b.line);
    return { file: f, total: fns.length, hit: fns.length - dead.length, never: dead.map(x => `${x.name}:${x.line}`) };
  });
  try { fs.rmSync(COVROOT, { recursive: true, force: true }); } catch (e) {}

  // ---- outcomes ----
  const crashes = results.filter(r => r.crash);
  const outcomes = results.filter(r => !r.crash).map(r => `${r.policy}/s${r.seed}: ${r.days}d ${r.endReason}${r.won ? ' WON' : ''}, abilities ${r.abilities.length}, synergies ${r.synergies.length}, integ ${Math.round(r.integration)}`);

  const dir = path.join(ROOT, 'evidence', DATE);
  fs.mkdirSync(dir, { recursive: true });
  const base = path.join(dir, `sim-audit-${LABEL}`);
  fs.writeFileSync(base + '.json', JSON.stringify({ seeds: SEEDS, policies: POLICIES, days: DAYS, results: results.map(r => { const c = Object.assign({}, r); delete c.covDir; delete c.swallowed; return c; }), swallowed: swList, coverage: files }, null, 1));
  const totFns = files.reduce((a, f) => a + f.total, 0), totHit = files.reduce((a, f) => a + f.hit, 0);
  const md = [
    `# Sim audit — ${LABEL} (${DATE})`, '',
    `${results.length} runs: policies ${POLICIES.join(', ')} × seeds ${SEEDS.join(', ')} × ${DAYS} days. Crashes: ${crashes.length}.`, '',
    `## Swallowed errors (${swList.length} sites, ${swList.reduce((a, b) => a + b.n, 0)} total)`, '',
    '| runs | count | site | first message |', '|---|---|---|---|',
    ...swList.slice(0, 60).map(x => `| ${x.runs}/${results.length} | ${x.n} | \`${x.site}\` | ${String(x.msg).replace(/\|/g, '/')} |`), '',
    `## Function coverage: ${totHit}/${totFns} named functions ran at least once (${Math.round(100 * totHit / Math.max(1, totFns))}%)`, '',
    '| file | ran | never ran (name:line) |', '|---|---|---|',
    ...files.sort((a, b) => (b.total - b.hit) - (a.total - a.hit)).map(f => `| \`${f.file}\` | ${f.hit}/${f.total} | ${f.never.slice(0, 25).join(', ')}${f.never.length > 25 ? ` … +${f.never.length - 25}` : ''} |`), '',
    '## Run outcomes', '', ...outcomes.map(o => '- ' + o), ...crashes.map(c => `- CRASH ${c.policy}/s${c.seed}: ${c.crash}`), '',
  ].join('\n');
  fs.writeFileSync(base + '.md', md);
  console.log(`swallowed: ${swList.length} sites; coverage ${totHit}/${totFns}; crashes ${crashes.length}; ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  console.log('wrote ' + path.relative(ROOT, base) + '.{md,json}');
})();
