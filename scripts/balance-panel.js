#!/usr/bin/env node
// Standard driver, one harness per child. Observation never calls game helpers.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto'), zlib = require('zlib');
const score = require('./lib/balance-scorecard'), gear = require('./gear-usage-audit');
const arg = (name, fallback) => { const i = process.argv.indexOf('--' + name); return i < 0 ? fallback : process.argv[i + 1]; };
const digest = x => crypto.createHash('sha256').update(x).digest('hex');
const read = file => JSON.parse(file.endsWith('.gz') ? zlib.gunzipSync(fs.readFileSync(file)) : fs.readFileSync(file, 'utf8'));
function manifest(root) {
  const out = {};
  function walk(dir) { for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const f = path.join(dir, e.name); if (e.isDirectory()) walk(f);
    else if (/\.(js|json)$/.test(f)) out[path.relative(root, f).replace(/\\/g, '/')] = digest(fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n'));
  } }
  walk(path.join(root, 'src')); walk(path.join(root, 'scripts/policies'));
  for (const f of ['index.html', 'scripts/sim-harness.js', 'scripts/sweep-compare.js']) out[f] = digest(fs.readFileSync(path.join(root, f), 'utf8').replace(/\r\n/g, '\n'));
  return out;
}
function install(G) {
  const census = gear.install(G), days = new Map(), intake = new Map(), bearerIds = new Set(), npcIds = new Set(), npcClassIds = new Set();
  census.startingTier = null; // Not sampled by this observer; starting gear is never earned.
  census.observedMethods = Object.keys(gear.METHODS); // Preserve the denominator, including zero-call methods.
  const classes = { player: new Set(), npc: new Set() }, gods = { player: new Set(), npc: new Set() }, events = {}, endings = [], errors = [];
  let firstDeath = null, accepted = 0;
  const initial = G.villagerId;
  const rememberClass = (role, rec, vid) => { if (rec?.path && !rec.lapsed) { classes[role].add(rec.path + '/' + rec.subclass); if (role === 'npc') npcClassIds.add(vid); } };
  function sample() {
    const s = G.state.scholar, v = G.state.village;
    bearerIds.add(G.villagerId); rememberClass('player', s.godpath, G.villagerId);
    for (const [vid, rec] of Object.entries(v.npcGodpath || {})) rememberClass('npc', rec, vid);
    for (const id of (s.godhood || {}).active || []) gods.player.add(id);
    for (const rec of Object.values(v.npcGodhood || {})) for (const id of rec.active || []) gods.npc.add(id);
    const roster = (v.roster || []).filter(id => id !== G.villagerId);
    const people = new Map((G.data.villagers || []).map(p => [p.id, p]));
    const living = roster.filter(id => people.has(id) && !people.get(id).dead);
    for (const id of living) npcIds.add(id);
    const needs = living.map(id => v.needs?.[id]).filter(n => Number.isFinite(n?.hunger));
    days.set(s.day, { day: s.day, bearer: G.villagerId, kcal: s.kcal, health: s.health, hydration: s.hydration,
      livingNpcs: living.length, unknownRosterPeople: roster.filter(id => !people.has(id)).length,
      knownNeeds: needs.length, hungryNpcs: needs.filter(n => n.hunger >= 80).length });
    for (const [day, book] of Object.entries(v.harvestIntake || {})) {
      let kcal = 0, nourishment = 0; const routes = {};
      for (const r of Object.values(book)) {
        kcal += r.kcal; nourishment += r.nourishment;
        for (const [name, value] of Object.entries(r.routes || {})) { const out = routes[name] || (routes[name] = { kcal: 0, nourishment: 0 }); out.kcal += value.kcal; out.nourishment += value.nourishment; }
      }
      intake.set(Number(day), { day: Number(day), kcal, nourishment, routes });
    }
    census.sample();
  }
  const tele = G.tele;
  G.tele = function (type, data) {
    try {
      events[type] = (events[type] || 0) + 1;
      if (type === 'death' && data?.player) { bearerIds.add(this.villagerId); if (this.villagerId === initial && firstDeath == null) firstDeath = this.state.scholar.day; }
      if (type === 'ability_used' && data?.ok) accepted++;
      if (type === 'class_recognized') rememberClass(data?.who === 'player' ? 'player' : 'npc', data, data?.who);
      if (type === 'table_won' || type === 'table_failed') endings.push({ day: this.state.scholar.day, type, ...JSON.parse(JSON.stringify(data || {})) });
    } catch (e) { errors.push({ at: 'telemetry observation', message: e.message }); }
    return tele.apply(this, arguments);
  };
  function finish(row) {
    sample(); delete census.sample;
    const sampled = [...days.values()], food = [...intake.values()], playerDeaths = Object.entries(row.deaths).filter(([k]) => k.startsWith('player:')).reduce((n, [, v]) => n + v, 0);
    const ratio = (n, d) => d > 0 ? n / d : null;
    const distress = (field, threshold) => { const known = sampled.filter(d => Number.isFinite(d[field])); return ratio(known.filter(d => d[field] < threshold).length, known.length); };
    const good = census.grants.filter(g => g.who === 'player' && g.gear && g.tier >= 3);
    const kcal = food.reduce((n, d) => n + d.kcal, 0), nourishment = food.reduce((n, d) => n + d.nourishment, 0);
    const survival = day => firstDeath != null && firstDeath <= day ? 0 : G.state.scholar.day > day ? 1 : null;
    return { gear: census, observerErrors: errors, samples: sampled, intake: food, events, endings,
      classes: Object.fromEntries(Object.entries(classes).map(([r, ids]) => [r, [...ids].sort()])), gods: Object.fromEntries(Object.entries(gods).map(([r, ids]) => [r, [...ids].sort()])),
      metrics: { won: row.won, entered: row.entered, table: row.table, national: row.national,
        survival30: survival(30), survival60: survival(60), playerDeaths, playerDeaths100Days: ratio(playerDeaths * 100, row.gameDays),
        communityLost: ['village-lost', 'village-dead', 'pop-zero'].includes(row.endReason) || G.villageLost ? 1 : 0,
        livingNpcs: sampled.some(d => d.unknownRosterPeople) ? null : score.mean(sampled.map(d => d.livingNpcs)),
        lowFood: distress('kcal', 500), lowWater: distress('hydration', 25), lowHealth: distress('health', 25),
        npcHungry: ratio(sampled.reduce((n, d) => n + d.hungryNpcs, 0), sampled.reduce((n, d) => n + d.knownNeeds, 0)),
        classAccess: classes.player.size ? 1 : 0, npcClassAccess: ratio([...npcClassIds].filter(id => npcIds.has(id)).length, npcIds.size),
        goodGear: good.length ? 1 : 0, contestShowGear: good.some(g => ['contest', 'show'].includes(g.source)) ? 1 : 0,
        craftTradeGear: good.some(g => ['craft', 'trade'].includes(g.source)) ? 1 : 0, corpseGear: good.some(g => g.source.startsWith('corpse-')) ? 1 : 0,
        usefulIntake: ratio(nourishment, kcal), bearerChanges: Math.max(0, bearerIds.size - 1), abilityAccepted: accepted } };
  }
  return { sample, finish, errors };
}
async function child() {
  const root = path.resolve(arg('root', path.join(__dirname, '..'))), policy = arg('policy', 'capable'), observe = arg('observe', '1') !== '0';
  const H = require(path.join(root, 'scripts/sim-harness')), { runComparison, POLICY_REGISTRY: registry } = require(path.join(root, 'scripts/sweep-compare'));
  const base = registry[policy]; if (!base) throw new Error('Unknown policy ' + policy);
  let G, observer; const warnings = [], warn = console.warn;
  console.warn = (...xs) => { warnings.push(xs.map(String).join(' ')); return warn.apply(console, xs); };
  registry[policy] = Object.assign({}, base, {
    setup(g, ctx) { G = g; if (observe) observer = install(g); if (base.setup) return base.setup(g, ctx); },
    daily(g, ctx) {
      const r = base.daily && base.daily(g, ctx);
      if (observer) { try { observer.sample(); } catch (e) { observer.errors.push({ at: 'daily sample', message: e.message }); } }
      return r;
    },
  });
  let report;
  try { report = await H.quietLog(() => runComparison({ seeds: [Number(arg('seed', 7))], policies: [policy], days: Number(arg('days', 150)), ...(arg('region', null) ? { region: arg('region') } : {}), origin: arg('origin', 'Columbus, Ohio') })); }
  finally { registry[policy] = base; console.warn = warn; }
  const row = report.runs[0], beforeSampling = gear.gameplayHash(G.state), observed = observer ? observer.finish(row) : null;
  const stateHash = gear.gameplayHash(G.state);
  if (beforeSampling !== stateHash) throw new Error('Final observation mutated gameplay state');
  process.stdout.write('@@BALANCE@@' + JSON.stringify({ row, stateHashVersion: 2, stateHash, warnings, ...(observed || {}) }) + '\n');
}
async function run() {
  const root = path.resolve(arg('root', path.join(__dirname, '..'))), out = arg('out', null);
  if (!out) throw new Error('--out <panel-directory> required');
  const flagNames = 'BEAM_FATIGUE BELONG_V3 CAMPAIGN_LASTDAY CAPABLE_AID_CALL CAPABLE_BEAM_FLEE CAPABLE_BEAM_RESIST_MIN CAPABLE_CONTEST_LETHAL CAPABLE_DEER_FLEE CAPABLE_DRAW_DECIDE CAPABLE_GREEDY CAPABLE_GREEDY_LASTDAY CAPABLE_GREEDY_MAXTIER CAPABLE_GREEDY_RECKLESS CAPABLE_HAVEN_FLEE CAPABLE_HUNT CAPABLE_OFF CAPABLE_READ_STAKES CAPABLE_TREAT_LOCKJAW COMPETENT_AID COMPETENT_CLEAN_CATCH COMPETENT_COOK_HAUL COMPETENT_CRAFT_ARMOR COMPETENT_DETECTIVE COMPETENT_DIRECTIONAL_FLEE COMPETENT_DPS_RACE COMPETENT_FEAST COMPETENT_FIGHT_ASSESS COMPETENT_KEEP_KNIFE COMPETENT_KITCHEN COMPETENT_ROUTE_AROUND COMPETENT_SEEK_FIGHTS COMPETENT_SURPLUS_FEAST COMPETENT_TALK COMPETENT_TALK_SKILLS COMPETENT_TRADE_RESERVE COMPETENT_TRAPLINE_SET COMPETENT_TRAUMA_RELIEF COMPETENT_TREAT_SICK COMPETENT_W2DISENGAGE COURTKILL EAT_FRAC FEASTSCALE_R13 FIFTHLINK FOCUSGROUP_CLOSE FOODLEVER_R5 FORCE_OCC FOURTHLINK GORGEDRIVE HIDE_R15 KILLROAD_COURT LOOT_ALL MEATSEEK_TEST MECHANIC POINTER_GATED SELFEED_DEBUG TALETELL_OFF TELEMETRY_FULL TRADE_POOL_GROWTH WAVE_EXTRA_CAP WHIFFGUARD WINSEEK_R8'.split(' ');
  const options = { seeds: arg('seeds', '') ? arg('seeds').split(',').map(Number) : require('./sweep-dashboard').seedList(Number(arg('n', 16))),
    policies: arg('policies', 'capable,maker,merchant,caregiver').split(','), days: Number(arg('days', 150)), region: arg('region', null), origin: arg('origin', 'Columbus, Ohio'),
    nodeVersion: process.version, flags: Object.fromEntries(flagNames.map(k => [k, process.env[k] ?? null])) };
  if (!options.seeds.length || options.seeds.some(s => !Number.isSafeInteger(s)) || new Set(options.seeds).size !== options.seeds.length || new Set(options.policies).size !== options.policies.length || !Number.isSafeInteger(options.days) || options.days < 1) throw new Error('Invalid/duplicate cases');
  if (process.env.REGION || process.env.ORIGIN || process.env.SEEDS || process.env.POLICIES || process.env.DAYS) throw new Error('Use explicit panel options; unset legacy sweep environment overrides');
  const observerHash = () => digest([__filename, path.join(__dirname, 'gear-usage-audit.js'), path.join(__dirname, 'lib/balance-scorecard.js')].map(f => fs.readFileSync(f)).join('\n'));
  const sources = manifest(root), observerDigest = observerHash();
  const contractDigest = digest(fs.readFileSync(path.join(__dirname, 'balance-metrics.json'))), sourceDigest = digest(JSON.stringify(sources));
  const head = () => sourceHead(root);
  const sourceHeadStart = head(), proofSeeds = arg('proof-seeds', String(options.seeds[0])).split(',').map(Number);
  if (proofSeeds.some(s => !options.seeds.includes(s))) throw new Error('Proof seeds must belong to the panel');
  const cache = path.join(out, 'cases'); fs.mkdirSync(cache, { recursive: true });
  const jobs = options.policies.flatMap(policy => options.seeds.flatMap(seed => (proofSeeds.includes(seed) ? ['1', '0'] : ['1']).map(observe => ({ policy, seed, observe }))));
  const results = []; let next = 0, reused = 0;
  async function worker() {
    while (next < jobs.length) {
      const job = jobs[next++], identity = { schemaVersion: 1, sourceDigest, observerDigest, contractDigest, ...options, seeds: undefined, policies: undefined, ...job };
      const key = digest(JSON.stringify(identity)), file = path.join(cache, key + '.json');
      if (fs.existsSync(file)) { const value = read(file); if (value.key !== key || JSON.stringify(value.identity) !== JSON.stringify(identity) || value.resultDigest !== digest(JSON.stringify(value.result)) || value.result.row.policy !== job.policy || value.result.row.seed !== job.seed) throw new Error('Invalid cached case ' + key); results.push(value); reused++; continue; }
      const result = await new Promise((resolve, reject) => {
        const args = [__filename, '--child', '--root', root, '--policy', job.policy, '--seed', String(job.seed), '--observe', job.observe, '--days', String(options.days), '--origin', options.origin, ...(options.region ? ['--region', options.region] : [])];
        const p = cp.spawn(process.execPath, args, { cwd: root, env: process.env }); let stdout = '', stderr = '';
        p.stdout.on('data', x => { stdout += x; }); p.stderr.on('data', x => { stderr += x; }); p.on('error', reject);
        p.on('close', code => { try { if (code) throw new Error(stderr || stdout.slice(-2000)); resolve(JSON.parse(stdout.split('@@BALANCE@@').pop())); } catch (e) { reject(e); } });
      }).catch(e => { fs.writeFileSync(file + '.error.json', JSON.stringify({ key, identity, error: e.message }) + '\n'); throw e; });
      const value = { key, identity, result, resultDigest: digest(JSON.stringify(result)) }, tmp = file + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(value) + '\n'); fs.renameSync(tmp, file); results.push(value); process.stdout.write('.');
    }
  }
  const parallel = Number(arg('par', 4)); if (!Number.isSafeInteger(parallel) || parallel < 1 || parallel > 32) throw new Error('--par must be 1..32');
  await Promise.all(Array.from({ length: parallel }, worker));
  const neutrality = options.policies.flatMap(policy => proofSeeds.map(seed => {
    const find = observe => results.find(x => x.identity.policy === policy && x.identity.seed === seed && x.identity.observe === observe).result;
    const on = find('1'), off = find('0'); return { policy, seed, match: on.stateHash === off.stateHash && JSON.stringify(on.row) === JSON.stringify(off.row), warnings: off.warnings.length };
  }));
  const rows = results.filter(x => x.identity.observe === '1').map(x => x.result).sort((a, b) => a.row.policy.localeCompare(b.row.policy) || a.row.seed - b.row.seed);
  const sourcesStable = JSON.stringify(sources) === JSON.stringify(manifest(root)) && observerDigest === observerHash() && contractDigest === digest(fs.readFileSync(path.join(__dirname, 'balance-metrics.json')));
  const panel = { schemaVersion: 1, sourceHeadStart, sourceHeadEnd: head(), sourceDigest, observerDigest, contractDigest, sources, options, validity: { sourcesStable, neutrality }, reused, rows };
  fs.writeFileSync(path.join(out, 'panel.json.gz'), zlib.gzipSync(JSON.stringify(panel) + '\n'));
  console.log(`\nSaved ${out}; ${rows.length} cases, ${reused} cached jobs.`);
  if (!sourcesStable || neutrality.some(p => !p.match || p.warnings) || rows.some(r => r.warnings.length || r.observerErrors.length || r.gear.errors.length)) throw new Error('Invalid panel; inspect retained results');
}
async function main() {
  if (process.argv.includes('--child')) return child();
  if (process.argv[2] === 'compare') {
    if (!arg('before', null) || !arg('after', null) || !arg('out', null)) throw new Error('compare --before <panel.json.gz> --after <panel.json.gz> --out <prefix>');
    const report = score.comparePanels(read(arg('before')), read(arg('after'))), out = arg('out');
    fs.writeFileSync(out + '.json', JSON.stringify(report, null, 2) + '\n'); fs.writeFileSync(out + '.md', score.markdown(report));
    console.log(report.decision); if (report.decision !== 'no_material_signal') process.exitCode = 2; return;
  }
  return run();
}
// An archive nested inside a checkout must not inherit its enclosing HEAD.
function sourceHead(root) {
  if (!fs.existsSync(path.join(root, '.git'))) return null;
  return cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}
module.exports = { install, manifest, sourceHead };
if (require.main === module) main().catch(e => { console.error(e.stack); process.exitCode = 1; });
