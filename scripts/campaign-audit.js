#!/usr/bin/env node
'use strict';
// Natural coverage screen, standard driver. No prepared game state here.
const fs = require('fs'), path = require('path'), crypto = require('crypto'), { spawn } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const digest = x => crypto.createHash('sha256').update(x).digest('hex');
const BALANCE = require('./balance-panel');
const FLAG_NAMES = 'BEAM_FATIGUE BELONG_V3 CAMPAIGN_LASTDAY CAPABLE_AID_CALL CAPABLE_BEAM_FLEE CAPABLE_BEAM_RESIST_MIN CAPABLE_CONTEST_LETHAL CAPABLE_DEER_FLEE CAPABLE_DRAW_DECIDE CAPABLE_GREEDY CAPABLE_GREEDY_LASTDAY CAPABLE_GREEDY_MAXTIER CAPABLE_GREEDY_RECKLESS CAPABLE_HAVEN_FLEE CAPABLE_HUNT CAPABLE_OFF CAPABLE_READ_STAKES CAPABLE_TREAT_LOCKJAW COMPETENT_AID COMPETENT_CLEAN_CATCH COMPETENT_COOK_HAUL COMPETENT_CRAFT_ARMOR COMPETENT_DETECTIVE COMPETENT_DIRECTIONAL_FLEE COMPETENT_DPS_RACE COMPETENT_FEAST COMPETENT_FIGHT_ASSESS COMPETENT_KEEP_KNIFE COMPETENT_KITCHEN COMPETENT_ROUTE_AROUND COMPETENT_SEEK_FIGHTS COMPETENT_SURPLUS_FEAST COMPETENT_TALK COMPETENT_TALK_SKILLS COMPETENT_TRADE_RESERVE COMPETENT_TRAPLINE_SET COMPETENT_TRAUMA_RELIEF COMPETENT_TREAT_SICK COMPETENT_W2DISENGAGE COURTKILL EAT_FRAC FEASTSCALE_R13 FIFTHLINK FOCUSGROUP_CLOSE FOODLEVER_R5 FORCE_OCC FOURTHLINK GORGEDRIVE HIDE_R15 KILLROAD_COURT LOOT_ALL MEATSEEK_TEST MECHANIC POINTER_GATED SELFEED_DEBUG TALETELL_OFF TELEMETRY_FULL TRADE_POOL_GROWTH WAVE_EXTRA_CAP WHIFFGUARD WINSEEK_R8'.split(' ');
function observerDigest() { return digest([__filename, 'balance-panel.js', 'gear-usage-audit.js', 'lib/balance-scorecard.js', 'balance-metrics.json'].map(f => fs.readFileSync(path.isAbsolute(f) ? f : path.join(__dirname, f))).join('\n')); }
// Read existing state only: these snapshots diagnose a policy refusal, never
// provide hidden information to the policy or initialize a game helper.
function checkpoint(G, ctx) {
  const s = G.state.scholar || {}, v = G.state.village || {};
  return JSON.parse(JSON.stringify({ day: s.day, person: G.villagerId, target: ctx.campaignTarget || null,
    position: { tx: G.map?.px, ty: G.map?.py, mx: s.mx, my: s.my, insideHaven: !!s.insideHaven },
    haven: { tx: v.px, ty: v.py }, equipped: s.equipped || {},
    health: s.health, kcal: s.kcal, inventory: s.inventory || [], pantry: v.pantry || [],
    roster: v.roster || [], progress: s.prog || {}, titans: G.state.titans || {},
    links: v.mship?.links || [] }));
}
async function child() {
  const root = path.resolve(arg('root', ROOT)), H = require(path.join(root, 'scripts/sim-harness'));
  const { POLICY_REGISTRY: reg, runComparison } = require(path.join(root, 'scripts/sweep-compare'));
  const id = arg('policy', 'campaigner'), base = reg[id]; let G, ctx, maxOvertime = 0;
  const fights = [], resolved = [], blockages = {}, warnings = [], warn = console.warn;
  console.warn = (...xs) => { warnings.push(xs.map(String).join(' ')); return warn.apply(console, xs); };
  const observe = arg('observe', '1') !== '0';
  let balanced;
  reg[id] = { ...base };
  for (const hook of ['setup', 'upkeep', 'daily', 'fight', 'contest', 'pending']) reg[id][hook] = (g, c) => {
    G = g; ctx = c;
    if (hook === 'setup' && observe) {
      balanced = BALANCE.install(G);
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
    const reasons = ['FoodBlocked', 'StrengthBlocked', 'HealthBlocked', 'MissingTarget', 'TravelBlocked', 'Errors'];
    const before = Object.fromEntries(reasons.map(k => [k, c['campaign' + k] || 0]));
    const r = base[hook] && base[hook](g, c);
    if (balanced && hook === 'daily') {
      try { balanced.sample(); } catch (e) { balanced.errors.push({ at: 'daily sample', message: e.message }); }
    }
    if (observe) for (const reason of reasons) {
      const n = (c['campaign' + reason] || 0) - before[reason];
      if (n <= 0) continue;
      const point = checkpoint(g, c), entry = blockages[reason] || (blockages[reason] = { count: 0, first: point });
      entry.count += n; entry.last = point;
    }
    maxOvertime = Math.max(maxOvertime, (((G.state.scholar || {}).prog || {}).overtime || 0));
    return r;
  };
  const rep = await H.quietLog(() => runComparison({ seeds: [Number(arg('seed', 7))], policies: [id], days: Number(arg('days', 240)), origin: arg('origin', 'Columbus, Ohio'), ...(arg('region', null) ? { region: arg('region') } : {}) }));
  console.warn = warn;
  const rawRow = rep.runs[0], beforeFinish = require('./gear-usage-audit').gameplayHash(G.state), measured = balanced ? balanced.finish(rawRow) : null;
  if (beforeFinish !== require('./gear-usage-audit').gameplayHash(G.state)) throw new Error('Campaign final observation mutated gameplay');
  const st = G.state.titans || {}, camps = st.campaigns || {};
  const counters = Object.fromEntries(Object.entries(ctx).filter(([k, v]) => k.startsWith('campaign') && typeof v !== 'object'));
  const row = { ...rawRow, rawRow, balanced: measured, blockages, warnings,
    measurement: { sourceDigest: digest(JSON.stringify(BALANCE.manifest(root))), observerDigest: observerDigest() },
    counters, fights, resolved, maxOvertime, omens: Object.fromEntries(Object.entries(st.omens || {}).map(([k, v]) => [k, v.stage])), slain: st.slain || {}, finale: camps.finale || null, network: camps.network || null, activeLinks: (((G.state.village.mship || {}).links) || []).filter(l => l.status === 'active').length, policyErrors: (ctx.notes || []).filter(n => n.startsWith('campaign road:')), capabilityErrors: ctx.capErrors || [], stateHash: require('./gear-usage-audit').gameplayHash(G.state) };
  if (row.pacing) { row.pacing = { ...row.pacing }; delete row.pacing.perDay; }
  process.stdout.write('\n@@CAMPAIGN@@' + JSON.stringify(row) + '\n');
}
async function main() {
  if (process.argv.includes('--child')) return child();
  const root = path.resolve(arg('root', ROOT)), seeds = arg('seeds', '') ? arg('seeds').split(',').map(Number) : require('./sweep-dashboard').seedList(Number(arg('n', 16)));
  const sources = BALANCE.manifest(root), sourceDigest = digest(JSON.stringify(sources)), observerStart = observerDigest();
  const sourceHeadStart = BALANCE.sourceHead(root);
  const policies = arg('policies', 'campaigner-control,campaigner').split(',');
  const days = Number(arg('days', 240)), proofSeeds = arg('proof-seeds', String(seeds[0])).split(',').map(Number), parallel = Number(arg('jobs', 4));
  if (!seeds.length || seeds.some(s=>!Number.isSafeInteger(s)) || new Set(seeds).size!==seeds.length || new Set(policies).size!==policies.length || proofSeeds.some(s=>!seeds.includes(s)) || !Number.isSafeInteger(days) || days<1 || !Number.isSafeInteger(parallel) || parallel<1 || parallel>32) throw new Error('Invalid/duplicate campaign cases or proof seeds');
  if (['REGION','ORIGIN','SEEDS','POLICIES','DAYS'].some(k=>process.env[k])) throw new Error('Use explicit campaign options, not legacy sweep environment overrides');
  const options = { days, origin: arg('origin', 'Columbus, Ohio'), region: arg('region', null), nodeVersion: process.version, flags: Object.fromEntries(FLAG_NAMES.map(k=>[k,process.env[k]??null])) };
  const jobs = seeds.flatMap(seed => policies.flatMap(policy => [{ seed, policy, kind: 'campaign', observe: '1' }, ...(proofSeeds.includes(seed)?[{seed,policy,kind:'campaign',observe:'0'},{seed,policy,kind:'standard',observe:'1'}]:[])])), rows = [], controls = [];
  const out = arg('out', '.git/campaign-natural-16.json'), cache = path.resolve(arg('cache', out+'.cases'));fs.mkdirSync(cache,{recursive:true});let next = 0, reused = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const job = jobs[next++];
      const identity={schemaVersion:2,sourceDigest,observerDigest:observerStart,...options,...job},key=digest(JSON.stringify(identity)),file=path.join(cache,key+'.json');let result;
      if(fs.existsSync(file)){const saved=JSON.parse(fs.readFileSync(file));if(saved.key!==key||JSON.stringify(saved.identity)!==JSON.stringify(identity)||saved.resultDigest!==digest(JSON.stringify(saved.result)))throw new Error('Invalid campaign cache '+key);result=saved.result;reused++;}
      else { result=await new Promise((resolve, reject) => {
        const marker=job.kind==='standard'?'@@BALANCE@@':'@@CAMPAIGN@@';
        const p = spawn(process.execPath, [job.kind==='standard'?path.join(__dirname,'balance-panel.js'):__filename, '--child', '--root', root, '--seed', String(job.seed), '--policy', job.policy, '--days', String(days), '--observe', job.observe, '--origin',options.origin,...(options.region?['--region',options.region]:[])], { cwd: root, env: process.env });
        let out = '', err = ''; p.stdout.on('data', b => { out += b; }); p.stderr.on('data', b => { err += b; });
        p.on('error', reject); p.on('close', code => { const line = out.split('\n').find(l => l.startsWith(marker)); if (code || !line) reject(new Error(JSON.stringify(job) + ': ' + err + out.slice(-1500))); else resolve(JSON.parse(line.slice(marker.length))); });
      });const saved={key,identity,result,resultDigest:digest(JSON.stringify(result))};fs.writeFileSync(file+'.tmp',JSON.stringify(saved)+'\n');fs.renameSync(file+'.tmp',file);}
      const resultRow=job.kind==='standard'?result.row:result.rawRow;if(resultRow.policy!==job.policy||resultRow.seed!==job.seed)throw new Error('Mismatched campaign case '+key);
      if(job.kind==='campaign'&&job.observe==='1')rows.push(result);else controls.push({...job,result});
      process.stderr.write('.');
    }
  };
  await Promise.all(Array.from({ length: parallel }, worker));
  rows.sort((a, b) => a.policy.localeCompare(b.policy) || a.seed - b.seed);
  const files = ['scripts/policies/campaigner.js', 'scripts/policies/capable.js', 'scripts/policies/competent.js', 'scripts/sim-harness.js', 'scripts/sweep-compare.js', 'src/js/engine/combat.js', 'src/js/game.js', 'src/js/sigW5.js', 'src/js/titans.js', 'src/js/finale-campaign.js', 'src/js/network-campaign.js', 'src/data/titans.json'];
  const stable = JSON.stringify(sources) === JSON.stringify(BALANCE.manifest(root)) && observerStart === observerDigest();
  controls.sort((a,b)=>a.policy.localeCompare(b.policy)||a.seed-b.seed||a.kind.localeCompare(b.kind));
  const neutrality=policies.flatMap(policy=>proofSeeds.map(seed=>{const on=rows.find(r=>r.policy===policy&&r.seed===seed),off=controls.find(c=>c.kind==='campaign'&&c.policy===policy&&c.seed===seed).result,std=controls.find(c=>c.kind==='standard'&&c.policy===policy&&c.seed===seed).result;return{policy,seed,match:on.stateHash===off.stateHash&&on.stateHash===std.stateHash&&JSON.stringify(on.rawRow)===JSON.stringify(off.rawRow)&&JSON.stringify(on.rawRow)===JSON.stringify(std.row)&&JSON.stringify(on.balanced.metrics)===JSON.stringify(std.metrics),warnings:off.warnings.length+std.warnings.length,errors:off.policyErrors.length+off.capabilityErrors.length+std.observerErrors.length+std.gear.errors.length};}));
  const report = { schemaVersion: 2, kind: 'natural campaign coverage screen; no prepared state', seeds, policies, proofSeeds, ...options, sourceHeadStart, sourceHeadEnd:BALANCE.sourceHead(root), sources, sourceDigest, observerDigest: observerStart, reused, validity: { sourcesStable: stable, neutrality }, hashes: Object.fromEntries(files.map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex')])), rows, controls };
  const bytes = JSON.stringify(report, null, 2) + '\n'; fs.writeFileSync(out, out.endsWith('.gz') ? require('zlib').gzipSync(bytes) : bytes);
  if (!stable || neutrality.some(n=>!n.match||n.warnings||n.errors) || rows.some(r => r.measurement.sourceDigest !== sourceDigest || r.measurement.observerDigest !== observerStart || r.warnings.length || r.policyErrors.length || r.capabilityErrors.length || r.balanced.observerErrors.length || r.balanced.gear.errors.length)) throw new Error('Invalid campaign measurement; retained report has diagnostics');
  for (const id of policies) {
    const rs = rows.filter(r => r.policy === id);
    console.log('\n' + id + ': ' + JSON.stringify({ runs: rs.length, wins: rs.filter(r => r.won).length, councils: rs.filter(r => r.counters.campaignCouncils).length, calls: rs.filter(r => r.counters.campaignCalls).length, campaignFights: rs.reduce((n, r) => n + (r.counters.campaignFightsStarted || 0), 0), slain: rs.map(r => r.slain), errors: rs.flatMap(r => r.policyErrors) }));
  }
}
module.exports = { checkpoint };
if (require.main === module) main().catch(e => { console.error(e); process.exitCode = 1; });
