#!/usr/bin/env node
// Standard driver, one harness per child. Observation never calls game helpers.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto'), zlib = require('zlib');
const score = require('./lib/balance-scorecard'), gear = require('./gear-usage-audit'), cohorts = require('./lib/balance-cohorts'), luck = require('./lib/luck-instrument');
const arg = (name, fallback) => { const i = process.argv.indexOf('--' + name); return i < 0 ? fallback : process.argv[i + 1]; };
const digest = x => crypto.createHash('sha256').update(x).digest('hex');
const { normalizeSource } = require('./lib/source-text');
const observerFiles = Object.freeze(['scripts/balance-panel.js','scripts/gear-usage-audit.js','scripts/lib/balance-scorecard.js','scripts/lib/simulation-flags.js','scripts/lib/balance-cohorts.js','scripts/lib/source-text.js','scripts/lib/luck-instrument.js']);
function observerIdentity(root) {
  const readText = file => normalizeSource(fs.readFileSync(path.join(root,file),'utf8'));
  return { observerDigest:digest(observerFiles.map(readText).join('\n')), contractDigest:digest(readText('scripts/balance-metrics.json')) };
}
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
function communityLossCoverage(row,engineLost,unknownPopulation=false){
  const terminalLoss=['village-lost','village-dead'].includes(row.endReason)||engineLost;
  const c=row.communityExposure;
  if(c===undefined){
    if(row.stop?.version===1)return{status:'invalid',lost:null,error:'Current driver omitted community exposure'};
    return{status:terminalLoss||(!unknownPopulation&&row.endReason!=='pop-zero')?'known':'unknown',
      source:'legacy-terminal-rule',lost:terminalLoss?1:unknownPopulation||row.endReason==='pop-zero'?null:0,
      note:'Historical stop rule only; no population history reconstructed.'};
  }
  const count=n=>Number.isSafeInteger(n)&&n>=0,at=x=>x&&Number.isSafeInteger(x.iteration)&&x.iteration>0&&x.iteration<=c.observations&&count(x.gameDay);
  const valid=c.version===1&&c.thresholdIterations===10&&
    ['observations','zeroObservations','unknownObservations','maxConsecutiveZero','sustainedEpisodes'].every(k=>count(c[k]))&&
    c.zeroObservations+c.unknownObservations<=c.observations&&c.maxConsecutiveZero<=c.zeroObservations&&
    typeof c.sustainedEmpty==='boolean'&&c.sustainedEmpty===(c.sustainedEpisodes>0)&&
    c.sustainedEmpty===(c.maxConsecutiveZero>=10)&&c.sustainedEpisodes<=Math.floor(c.zeroObservations/10)&&
    (c.zeroObservations?at(c.firstEmpty):c.firstEmpty===null)&&
    (c.sustainedEmpty?at(c.firstSustainedEmpty)&&c.firstSustainedEmpty.iteration>=10:c.firstSustainedEmpty===null)&&
    typeof c.recoveredAfterSustained==='boolean'&&
    (c.recoveredAfterSustained?c.sustainedEmpty&&at(c.firstRecovery)&&c.firstRecovery.iteration>c.firstSustainedEmpty.iteration:c.firstRecovery===null);
  if(!valid)return{status:'invalid',lost:null,error:'Invalid community exposure history'};
  const lost=terminalLoss||c.sustainedEmpty?1:c.unknownObservations||unknownPopulation?null:0;
  return{status:lost===null?'unknown':'known',source:'driver-history-v1',lost,history:c};
}
// PANEL CONTRACT RULINGS (Steve 2026-10-24) — pure metric mappings, unit-tested
// in scripts/godpath/test-panel-contract-rulings.js:
// - 665: the `table` metric counts SITTINGS (the seat taken), not invitations.
//   A run counts when it sat (row.entered), whether or not a waiting
//   invitation was ever observed — prompt-seat substrates skip waiting, and
//   counting invitations printed a fake regression there.
// - 753: deaths are tracked twice. `playerDeaths` = deaths of the
//   player-flagged character only (row.deaths 'player:' keys, set only by
//   ledger.js playerDeath for the scholar). `villageDeaths` = every death
//   recorded in the run (all row.deaths values). The old per-arm
//   `playerDeaths` series meant total deaths, so it lives on as
//   `villageDeaths`; the new narrow `playerDeaths` is not comparable to it.
function deathMetrics(deaths) {
  const entries = Object.entries(deaths || {});
  const finite = v => Number.isFinite(v) ? v : 0;
  return { playerDeaths: entries.filter(([k]) => k.startsWith('player:')).reduce((n, [, v]) => n + finite(v), 0),
    villageDeaths: entries.reduce((n, [, v]) => n + finite(v), 0) };
}
function tableSitting(row) { return row && row.entered ? 1 : 0; }
function install(G) {
  const census = gear.install(G), days = new Map(), npcDays = new Map(), intake = new Map(), bearerIds = new Set(), npcIds = new Set(), unknownNpcIds = new Set(), npcClassIds = new Set();
  census.startingTier = null; // Not sampled by this observer; starting gear is never earned.
  census.observedMethods = Object.keys(gear.METHODS); // Preserve the denominator, including zero-call methods.
  const classes = { player: new Set(), npc: new Set() }, gods = { player: new Set(), npc: new Set() }, events = {}, endings = [], errors = [];
  let firstDeath = null, accepted = 0;
  const initial = G.villagerId;
  // LUCK INSTRUMENTATION (rogue P0-6, 2026-10-22): collect the game's honest
  // binary chance rolls (hunt/trap/snare/pit/fish) via the no-op G.luckRoll
  // hook. The sink writes ONLY to this closure — never to game state — so the
  // observer-neutrality proof (observe=1 vs observe=0 stateHash match) holds.
  const luckRolls = { hunt: [], trap: [], snare: [], pit: [], fish: [] };
  try {
    G.__luckSink = (stream, p, hit) => {
      const arr = luckRolls[stream];
      if (arr && Number.isFinite(p)) arr.push({ p: Math.min(1, Math.max(0, p)), hit: !!hit });
    };
  } catch (e) { errors.push({ at: 'luck sink install', message: e.message }); }
  // Read canonical definitions directly. No knowledge/build/needs helpers:
  // those can initialize state or consume RNG while answering a query.
  function npcSnapshot() {
    const v = G.state.village, roster = new Set(v.roster || []), people = new Map();
    for (const p of G.data.villagers || []) if (p?.id && !people.has(p.id)) people.set(p.id, p);
    for (const [id, p] of Object.entries(v.rosterChars || {})) if (p?.id === id && !people.has(id)) people.set(id, p);
    for (const p of G.data.background_survivors || []) if (p?.id && !people.has(p.id)) people.set(p.id, p);
    const reason = id => id === G.villagerId ? 'currentBearer' : !roster.has(id) ? 'notResident' : !people.has(id) ? 'unknownPerson' : people.get(id).dead ? 'deadPerson' : null;
    const ids = [...roster].filter(id => !reason(id));
    return { ids, eligible: new Set(ids), reason,
      unknown: [...roster].filter(id => reason(id) === 'unknownPerson'),
      dead: [...roster].filter(id => reason(id) === 'deadPerson'),
      duplicateRosterEntries: (v.roster || []).length - roster.size };
  }
  const rememberClass = (role, rec, vid, eligible) => {
    if (rec?.path && !rec.lapsed) {
      if (role === 'npc' && !(eligible || npcSnapshot().eligible).has(vid)) return;
      classes[role].add(rec.path + '/' + rec.subclass);
      if (role === 'npc') npcClassIds.add(vid);
    }
  };
  function sample() {
    const s = G.state.scholar, v = G.state.village;
    const npcs = npcSnapshot(), npcBuilds = { classes: [], gods: [] }, excluded = { classes: {}, gods: {} };
    bearerIds.add(G.villagerId); rememberClass('player', s.godpath, G.villagerId);
    for (const [vid, rec] of Object.entries(v.npcGodpath || {})) {
      if (!rec?.path || rec.lapsed) continue;
      const why = npcs.reason(vid);
      if (why) { excluded.classes[why] = (excluded.classes[why] || 0) + 1; continue; }
      rememberClass('npc', rec, vid, npcs.eligible); npcBuilds.classes.push({ who: vid, build: rec.path + '/' + rec.subclass });
    }
    for (const id of (s.godhood || {}).active || []) gods.player.add(id);
    for (const [vid, rec] of Object.entries(v.npcGodhood || {})) {
      if (!rec?.active?.length) continue;
      const why = npcs.reason(vid);
      if (why) { excluded.gods[why] = (excluded.gods[why] || 0) + 1; continue; }
      for (const id of new Set(rec.active)) { gods.npc.add(id); npcBuilds.gods.push({ who: vid, build: id }); }
    }
    const living = npcs.ids;
    for (const id of living) npcIds.add(id);
    for (const id of npcs.unknown) unknownNpcIds.add(id);
    const needs = living.map(id => v.needs?.[id]).filter(n => Number.isFinite(n?.hunger));
    days.set(s.day, { day: s.day, bearer: G.villagerId, kcal: s.kcal, health: s.health, hydration: s.hydration,
      livingNpcs: living.length, unknownRosterPeople: npcs.unknown.length,
      knownNeeds: needs.length, hungryNpcs: needs.filter(n => n.hunger >= 80).length });
    npcDays.set(s.day, { day: s.day, bearer: G.villagerId, eligible: living.slice().sort(), unknown: npcs.unknown.sort(), dead: npcs.dead.sort(),
      duplicateRosterEntries: npcs.duplicateRosterEntries, classes: npcBuilds.classes, gods: npcBuilds.gods, excludedBuildRecords: excluded });
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
    const sampled = [...days.values()], food = [...intake.values()], { playerDeaths, villageDeaths } = deathMetrics(row.deaths);
    const ratio = (n, d) => d > 0 ? n / d : null;
    const distress = (field, threshold) => { const known = sampled.filter(d => Number.isFinite(d[field])); return ratio(known.filter(d => d[field] < threshold).length, known.length); };
    const good = census.grants.filter(g => g.who === 'player' && g.gear && g.tier >= 3);
    // Day receipts are an eight-day diagnostic ring. Use the versioned
    // cumulative book for the metric so delayed sampling cannot lose meals.
    const intakeCoverage = intakeSnapshot(G.state.village);
    const kcal = intakeCoverage.totals?.kcal || 0, nourishment = intakeCoverage.totals?.nourishment || 0;
    const survival = day => firstDeath != null && firstDeath <= day ? 0 : G.state.scholar.day > day ? 1 : null;
    const community=communityLossCoverage(row,!!G.villageLost,unknownNpcIds.size>0);
    if(community.status==='invalid')errors.push({at:'community exposure',message:community.error});
    // LUCK INSTRUMENTATION (rogue P0-6): per-run binomial luck summary from
    // the recorded roll streams. Descriptive only — the luck metric columns
    // are direction-neutral and reviewChanges:false, so they can never move
    // a comparison verdict. A reviewer reads luckSummary.streams.*.tercile
    // (unlucky/neutral/lucky) next to the run's wins to see whether an arm's
    // wins came from luck or the lever.
    let luckSummary = null;
    try { luckSummary = luck.summarizeRun(luckRolls); }
    catch (e) { errors.push({ at: 'luck summary', message: e.message }); }
    const luckMetrics = luckSummary ? luck.metricValues(luckSummary) : {};
    return { gear: census, observerErrors: errors, samples: sampled, intake: food, intakeCoverage, events, endings,communityLossCoverage:community,
      luck: luckSummary,
      npcExposure: { schemaVersion: 1, identityRule: 'known-living-resident-not-current-bearer', sampledIdentities: [...npcIds].sort(),
        unknownIdentities: [...unknownNpcIds].sort(), classIdentities: [...npcClassIds].filter(id => npcIds.has(id)).sort(), days: [...npcDays.values()] },
      classes: Object.fromEntries(Object.entries(classes).map(([r, ids]) => [r, [...ids].sort()])), gods: Object.fromEntries(Object.entries(gods).map(([r, ids]) => [r, [...ids].sort()])),
      metrics: { won: row.won, entered: row.entered, table: tableSitting(row), national: row.national,
        survival30: survival(30), survival60: survival(60), playerDeaths, playerDeaths100Days: ratio(playerDeaths * 100, row.gameDays),
        villageDeaths, villageDeaths100Days: ratio(villageDeaths * 100, row.gameDays),
        communityLost: community.lost,
        livingNpcs: sampled.some(d => d.unknownRosterPeople) ? null : score.mean(sampled.map(d => d.livingNpcs)),
        lowFood: distress('kcal', 500), lowWater: distress('hydration', 25), lowHealth: distress('health', 25),
        npcHungry: ratio(sampled.reduce((n, d) => n + d.hungryNpcs, 0), sampled.reduce((n, d) => n + d.knownNeeds, 0)),
        classAccess: classes.player.size ? 1 : 0, npcClassAccess: unknownNpcIds.size ? null : ratio([...npcClassIds].filter(id => npcIds.has(id)).length, npcIds.size),
        goodGear: good.length ? 1 : 0, contestShowGear: good.some(g => ['contest', 'show'].includes(g.source)) ? 1 : 0,
        craftTradeGear: good.some(g => ['craft', 'trade'].includes(g.source)) ? 1 : 0, corpseGear: good.some(g => g.source.startsWith('corpse-')) ? 1 : 0,
        usefulIntake: ratio(nourishment, kcal), bearerChanges: Math.max(0, bearerIds.size - 1), abilityAccepted: accepted,
        ...luckMetrics } };
  }
  return { sample, finish, errors };
}
function intakeSnapshot(v) {
  const t=v.harvestIntakeTotals;
  if (!t) return { schemaVersion:1,status:'unknown',reason:'no-versioned-producer',totals:null };
  const validPair=p=>p && Number.isFinite(p.kcal) && p.kcal>=0 && Number.isFinite(p.nourishment) && p.nourishment>=0;
  if (t.version!==1 || !validPair(t) || !Number.isSafeInteger(t.records) || t.records<1 ||
      !Number.isFinite(t.startedDay) || ['roles','actors','routes'].some(k=>!t[k] || typeof t[k]!=='object' ||
        Object.values(t[k]).some(p=>!validPair(p))))
    return { schemaVersion:1,status:'unknown',reason:'invalid-or-unsupported-producer',totals:null };
  for (const field of ['roles','actors','routes']) for (const key of ['kcal','nourishment']) {
    const sum=Object.values(t[field]).reduce((n,p)=>n+p[key],0);
    if (Math.abs(sum-t[key])>1e-6*Math.max(1,t[key]))
      return {schemaVersion:1,status:'unknown',reason:'inconsistent-producer-totals',totals:null};
  }
  return {schemaVersion:1,status:'versioned-cumulative',scope:'instrumented meal routes since first recorded meal; not prior-save history or all reserve changes',
    totals:JSON.parse(JSON.stringify(t))};
}
async function child() {
  const root = path.resolve(arg('root', path.join(__dirname, '..'))), policy = arg('policy', 'capable'), observe = arg('observe', '1') !== '0';
  const H = require(path.join(root, 'scripts/sim-harness')), { runComparison, POLICY_REGISTRY: registry } = require(path.join(root, 'scripts/sweep-compare'));
  const capabilities=require(path.join(root,'scripts/sweep-compare')).comparisonCapabilities;
  const occupation = arg('occupation', null);
  if (occupation != null && !capabilities?.occupation) throw Error('Target driver does not declare occupation selection support');
  if ((arg('region',null)||arg('origin','Columbus, Ohio')!=='Columbus, Ohio') && (!capabilities||!capabilities.region||!capabilities.origin)) throw Error('Target driver does not declare explicit origin/region support');
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
  try { report = await H.quietLog(() => runComparison({ seeds: [Number(arg('seed', 7))], policies: [policy], days: Number(arg('days', 150)), ...(arg('region', null) ? { region: arg('region') } : {}), ...(occupation != null ? { occupation } : {}), origin: arg('origin', 'Columbus, Ohio') })); }
  finally { registry[policy] = base; console.warn = warn; }
  if (report.exclusions?.length) {
    const row = report.exclusions[0];
    process.stdout.write('@@BALANCE@@' + JSON.stringify({ row, excluded: true, stateHashKind: 'selection', stateHash: digest(JSON.stringify(row.selection)), warnings }) + '\n');
    return;
  }
  const row = report.runs[0], beforeSampling = gear.gameplayHash(G.state), observed = observer ? observer.finish(row) : null;
  const stateHash = gear.gameplayHash(G.state);
  if (beforeSampling !== stateHash) throw new Error('Final observation mutated gameplay state');
  process.stdout.write('@@BALANCE@@' + JSON.stringify({ row, stateHashVersion: 2, stateHash, warnings, ...(observed || {}) }) + '\n');
}
async function run() {
  const root = path.resolve(arg('root', path.join(__dirname, '..'))), out = arg('out', null);
  if (!out) throw new Error('--out <panel-directory> required');
  const flagNames = 'BEAM_FATIGUE BELONG_V3 CAMPAIGN_LASTDAY CAPABLE_AID_CALL CAPABLE_BEAM_FLEE CAPABLE_BEAM_RESIST_MIN CAPABLE_CONTEST_LETHAL CAPABLE_DEER_FLEE CAPABLE_DRAW_DECIDE CAPABLE_GREEDY CAPABLE_GREEDY_LASTDAY CAPABLE_GREEDY_MAXTIER CAPABLE_GREEDY_RECKLESS CAPABLE_HAVEN_FLEE CAPABLE_HUNT CAPABLE_OFF CAPABLE_READ_STAKES CAPABLE_TREAT_LOCKJAW COMPETENT_AID COMPETENT_CLEAN_CATCH COMPETENT_COOK_HAUL COMPETENT_CRAFT_ARMOR COMPETENT_DETECTIVE COMPETENT_DIRECTIONAL_FLEE COMPETENT_DPS_RACE COMPETENT_FEAST COMPETENT_FIGHT_ASSESS COMPETENT_KEEP_KNIFE COMPETENT_KITCHEN COMPETENT_ROUTE_AROUND COMPETENT_SEEK_FIGHTS COMPETENT_SURPLUS_FEAST COMPETENT_TALK COMPETENT_TALK_SKILLS COMPETENT_TRADE_RESERVE COMPETENT_TRAPLINE_SET COMPETENT_TRAUMA_RELIEF COMPETENT_TREAT_SICK COMPETENT_W2DISENGAGE COURTKILL EAT_FRAC FEASTSCALE_R13 FIFTHLINK FOCUSGROUP_CLOSE FOODLEVER_R5 FORCE_OCC FOURTHLINK GORGEDRIVE HIDE_R15 KILLROAD_COURT LOOT_ALL MEATSEEK_TEST MECHANIC POINTER_GATED SELFEED_DEBUG TALETELL_OFF TELEMETRY_FULL TRADE_POOL_GROWTH WAVE_EXTRA_CAP WHIFFGUARD WINSEEK_R8'.split(' ');
  const sources = manifest(root);
  const options = { seeds: arg('seeds', '') ? arg('seeds').split(',').map(Number) : require('./sweep-dashboard').seedList(Number(arg('n', 16))),
    policies: arg('policies', 'capable,risk-aware,socialite,winseek').split(','), days: Number(arg('days', 150)), region: arg('region', null), origin: arg('origin', 'Columbus, Ohio'),
    nodeVersion: process.version, flags: require('./lib/simulation-flags').snapshot(root,sources,flagNames) };
  if (arg('occupation', null) != null) options.occupation = arg('occupation', null);
  if (!options.seeds.length || options.seeds.some(s => !Number.isSafeInteger(s)) || new Set(options.seeds).size !== options.seeds.length || new Set(options.policies).size !== options.policies.length || !Number.isSafeInteger(options.days) || options.days < 1) throw new Error('Invalid/duplicate cases');
  if (process.env.REGION || process.env.ORIGIN || process.env.SEEDS || process.env.POLICIES || process.env.DAYS) throw new Error('Use explicit panel options; unset legacy sweep environment overrides');
  const observerRoot = path.resolve(__dirname,'..');
  const observerHash = () => observerIdentity(observerRoot).observerDigest;
  const observerDigest = observerHash();
  const contractDigest = observerIdentity(observerRoot).contractDigest, sourceDigest = digest(JSON.stringify(sources));
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
        if (options.occupation != null) args.push('--occupation', options.occupation);
        const p = cp.spawn(process.execPath, args, { cwd: root, env: process.env }); let stdout = '', stderr = '';
        p.stdout.setEncoding('utf8'); p.stderr.setEncoding('utf8');
        p.stdout.on('data', x => { stdout += x; }); p.stderr.on('data', x => { stderr += x; }); p.on('error', reject);
        p.on('close', code => { try { if (code) throw new Error(stderr || stdout.slice(-2000)); resolve(JSON.parse(stdout.split('@@BALANCE@@').pop())); } catch (e) { reject(e); } });
      }).catch(e => { fs.writeFileSync(file + '.error.json', JSON.stringify({ key, identity, error: e.message }) + '\n'); throw e; });
      const value = { key, identity, result, resultDigest: digest(JSON.stringify(result)) }, tmp = file + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(value) + '\n'); fs.renameSync(tmp, file); results.push(value); process.stdout.write('.');
    }
  }
  const parallel = Number(arg('par', 4)); if (!Number.isSafeInteger(parallel) || parallel < 1 || parallel > 32) throw new Error('--par must be 1..32');
  await Promise.all(Array.from({ length: parallel }, worker));
  const proofs = options.policies.flatMap(policy => proofSeeds.map(seed => {
    const find = observe => results.find(x => x.identity.policy === policy && x.identity.seed === seed && x.identity.observe === observe).result;
    const on = find('1'), off = find('0'); return { policy, seed, match: on.excluded === off.excluded && on.stateHash === off.stateHash && JSON.stringify(on.row) === JSON.stringify(off.row), warnings: off.warnings.length, ...(on.excluded ? { kind: 'selection' } : {}) };
  }));
  const observed = results.filter(x => x.identity.observe === '1').map(x => x.result).sort((a, b) => a.row.policy.localeCompare(b.row.policy) || a.row.seed - b.row.seed);
  const rows = observed.filter(r => !r.excluded), exclusions = observed.filter(r => r.excluded), neutrality = proofs.filter(p => p.kind !== 'selection');
  const sourcesStable = JSON.stringify(sources) === JSON.stringify(manifest(root)) && observerDigest === observerHash() && contractDigest === observerIdentity(observerRoot).contractDigest;
  const panel = { schemaVersion: 1, flagCoverage:{discovered:require('./lib/simulation-flags').discover(root,sources,flagNames),rule:'Legacy flags retain explicit null defaults; additional source-declared flags enter cache inputs when set. Discovery names remain source-bound metadata, not a changed simulation setting.'}, sourceHeadStart, sourceHeadEnd: head(), sourceDigest, observerDigest, contractDigest, sources, options, validity: { sourcesStable, neutrality }, reused, rows };
  if (options.occupation != null) { panel.exclusions = exclusions; panel.validity.selection = proofs.filter(p => p.kind === 'selection'); }
  fs.writeFileSync(path.join(out, 'panel.json.gz'), zlib.gzipSync(JSON.stringify(panel) + '\n'));
  console.log(`\nSaved ${out}; ${rows.length} cases, ${reused} cached jobs.`);
  if (!sourcesStable || proofs.some(p => !p.match || p.warnings) || cohorts.validate(panel).length || rows.some(r => r.warnings.length || r.observerErrors.length || r.gear.errors.length)) throw new Error('Invalid panel; inspect retained results: ' + cohorts.validate(panel).join('; '));
}
async function main() {
  if (process.argv.includes('--child')) return child();
  if (process.argv[2] === 'compare') {
    if (!arg('before', null) || !arg('after', null) || !arg('out', null)) throw new Error('compare --before <panel.json.gz> --after <panel.json.gz> --out <prefix>');
    // 797 (Steve 2026-10-24): --intervention-flags <csv> declares flags that
    // ARE the intervention (e.g. an env-gated lever's own flag). Declared flags
    // are exempted from the flags match and recorded on the report; the
    // exemption is never inferred from the panels themselves.
    const interventionFlags = arg('intervention-flags', null) ? arg('intervention-flags', null).split(',').map(s => s.trim()).filter(Boolean) : [];
    const report = score.comparePanels(read(arg('before')), read(arg('after')), { interventionFlags }), out = arg('out');
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
module.exports = { install, manifest, sourceHead, intakeSnapshot, observerIdentity, observerFiles, communityLossCoverage, deathMetrics, tableSitting };
if (require.main === module) main().catch(e => { console.error(e.stack); process.exitCode = 1; });
