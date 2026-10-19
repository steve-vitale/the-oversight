#!/usr/bin/env node
// Observe actual acquisitions and feature use. One seeded game per process.
// node scripts/gear-usage-audit.js --label before --n 16 --days 150
// --root points at a frozen source/scripts checkout for matched comparisons.
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const METHODS = {
  _contestEnd: 'contest', _contestResolveOthers: 'contest', _showEnd: 'show', _showVillagerEnd: 'show',
  apCarePackage: 'fan-package', apClubBoon: 'fan-vote', apPersonaPackage: 'patron', apDeadDrop: 'patron',
  visitorWares: 'trade-stock', visitorBuyWare: 'trade', traderSell: 'trade-sale', craft: 'craft', doAction: 'action',
  tbEnd: 'combat', corpseTakeItem: 'corpse', corpseLootAll: 'corpse', readBook: 'book', preserveFood: 'preserve',
  renderFat: 'render', cleanCarcass: 'clean', takePrepMaterial: 'counter-material', makePemmican: 'pemmican', expandStorage: 'storage', donateWeapon: 'armory',
  takeWeapon: 'armory', donateMedicine: 'pharmacy', takeMedicine: 'pharmacy', takePrepMaterial: 'materials', giveFood: 'care', comfort: 'care', proposeTrade: 'league',
  proposeCovenant: 'league', drawLeaguePool: 'league', answerDefenseCall: 'league',
  answerTradeCall: 'league', answerCovenantCrisis: 'league', orderMember: 'party-order', networkSummon: 'network',
  _cxPrizeAbilityOffer: 'system-prize', _cxPrizeSynergyHint: 'system-prize',
  _cxPrizeKnowledgeDump: 'system-prize', _cxPrizeEvolutionAssist: 'system-prize',
  maybeGrantCapstoneItem: 'capstone',
  marketNamePrice: 'market',
};
function gameplayHash(state) {
  const comparable = JSON.parse(JSON.stringify(state));
  // Wall-clock diagnostics vary with machine load. Retain any other/future
  // pacing fields so this does not mask a gameplay-state difference.
  if (comparable.pacing) for (const k of ['lastTs', 'dayMinutes', 'totalMin']) delete comparable.pacing[k];
  return require('crypto').createHash('sha256').update(JSON.stringify(comparable)).digest('hex');
}
// Observation only: no technique, fire, detail, pantry or modifier helpers.
// Nominal freshness deliberately excludes spoilage bonuses; these are input
// snapshots, not permission checks. Explicit zero-unit stacks count as empty.
function preservationSnapshot(G) {
  const s = G.state.scholar || {}, day = s.day || 0;
  const out = { renderKnown: !!(((G.state.codex || {}).techniques || {}).render), containers: {} };
  for (const [name, inv] of Object.entries({ pack: s.inventory, prep: s.prepStash, pantry: (G.state.village || {}).pantry })) {
    const n = { rawFat: 0, renderedFat: 0, smokableMeat: 0, preservedMeat: 0, berries: 0 };
    for (const it of inv || []) {
      if (!it || (it.spoilDay != null && it.spoilDay <= day)) continue;
      const units = it.units == null ? 1 : Math.max(0, Number(it.units) || 0);
      if (it.foodKind === 'fat' && it.foodState === 'raw') n.rawFat += units;
      if (it.foodKind === 'fat' && it.foodState === 'rendered') n.renderedFat += units;
      if (it.foodKind === 'meat' && ['cleaned', 'cooked'].includes(it.foodState)) n.smokableMeat += units;
      if (it.foodKind === 'meat' && it.foodState === 'preserved') n.preservedMeat += units;
      if (it.foodKind === 'plant' && /berr/i.test(String(it.plantId || '')) && it.edible !== false) n.berries += units;
    }
    n.ingredientSets = Math.min(Math.floor(n.preservedMeat / 2), n.renderedFat, Math.floor(n.berries / 2));
    out.containers[name] = n;
  }
  return out;
}
function install(G) {
  const rec = { calls: {}, effects: {}, grants: [], missing: [], errors: [], contest: {}, show: {}, crafts: {}, recipeAccess: {}, maxTier: 0, maxFavor: 0, startingTier: 0 };
  const stack = [];
  const defs = new Map(G.data.items.map(d => [d.id, d]));
  const inventory = () => {
    const out = new Map();
    const add = (it, who) => {
      const id = typeof it === 'string' ? it : it && (it.itemId || it.id);
      if (!defs.has(id)) return;
      const k = who + ':' + id, prev = out.get(k);
      out.set(k, { id, who, n: (prev ? prev.n : 0) + (typeof it === 'string' ? 1 : it.units == null ? 1 : it.units) });
    };
    const s = G.state.scholar || {};
    (s.inventory || []).forEach(it => add(it, 'player'));
    Object.values(s.equipped || {}).forEach(it => add(it, 'player'));
    for (const vid of ((G.state.village || {}).roster || [])) {
      if (vid === G.villagerId) continue;
      // getPerson may hydrate an old seed. Observation must not generate a
      // person (or consume RNG) before the game's own first encounter.
      const p = (G.data.villagers || []).find(p => p.id === vid);
      if (!p) continue;
      (p.items || []).forEach(it => add(it, vid));
      // NPC items remain in person.items when worn; don't count equipped twice.
    }
    return out;
  };
  const gained = (before, after, source, child, result) => {
    const totals = map => { const out = new Map(); for (const v of map.values()) out.set(v.id, (out.get(v.id) || 0) + v.n); return out; };
    const b = totals(before), a = totals(after);
    const left = new Map([...a].map(([id, n]) => [id, Math.max(0, n - (b.get(id) || 0) - (child.get(id) || 0))]));
    for (const [k, v] of after) {
      const n = Math.min(Math.max(0, v.n - ((before.get(k) || {}).n || 0)), left.get(v.id) || 0);
      if (!(n > 0)) continue;
      left.set(v.id, left.get(v.id) - n);
      const d = defs.get(v.id), tier = d.lootTier || d.tier || 1;
      rec.grants.push({ day: G.state.scholar.day, source, id: v.id, who: v.who, n, tier, gear: !!(d.armor || d.weapon), beamResist: !!(d.armor || {}).beamResist,
        ...(source === 'market' ? { marketPayment: {
          barterKcal: Number.isFinite(result?.paidKcal) ? result.paidKcal : null,
          onCredit: typeof result?.marker === 'boolean' ? result.marker : null,
          borrowed: Number.isFinite(result?.tier) ? result.tier >= 4 : null,
          debtAfter: Number.isFinite(result?.markers) ? result.markers : null,
          // This boundary may be called directly or inside useAbility. It
          // observes barter, not the enclosing activation payment.
          activationKcal: null,
        } } : {}) });
      rec.maxTier = Math.max(rec.maxTier, tier);
    }
  };
  for (const [name, lane] of Object.entries(METHODS)) {
    const fn = G[name];
    if (typeof fn !== 'function') { rec.missing.push(name); continue; }
    G[name] = function (...args) {
      rec.calls[name] = (rec.calls[name] || 0) + 1;
      const corpse = lane === 'corpse' ? (G.state.corpses || []).find(c => c.id === args[0]) : null;
      const source = corpse ? 'corpse-' + (corpse.kind || 'unknown') : lane;
      const before = inventory(), bearer = G.villagerId, frame = { lane: source, children: new Map() };
      let craft;
      if (name === 'craft') {
        craft = rec.crafts[args[0]] || (rec.crafts[args[0]] = { attempts: 0, successes: 0 });
        craft.attempts++;
      }
      stack.push(frame);
      let result;
      try { result = fn.apply(this, args); }
      catch (e) { rec.errors.push({ method: name, message: e.message }); throw e; }
      finally {
        stack.pop();
        const after = inventory();
        // Parent source subtracts the child's net increases: one item, one source.
        // Succession replaces a whole pack. It is not a combat reward.
        if (bearer === G.villagerId) gained(before, after, source, frame.children, result);
        if (stack.length) for (const [k, v] of after) {
          const n = Math.max(0, v.n - ((before.get(k) || {}).n || 0));
          const par = stack[stack.length - 1].children;
          par.set(v.id, (par.get(v.id) || 0) + n);
        }
      }
      if (result && result !== false) rec.effects[name] = (rec.effects[name] || 0) + 1;
      if (craft && result === true) craft.successes++;
      // Calls/results are reachability evidence, NOT universal success counts.
      if (name === '_contestEnd') { const k = String(args[1]); rec.contest[k] = (rec.contest[k] || 0) + 1; }
      if (name === '_showEnd') { const k = String(args[1]); rec.show[k] = (rec.show[k] || 0) + 1; }
      return result;
    };
  }
  rec.sample = () => {
    // Read existing knowledge/materials only. Never call lazy discovery or
    // grant helpers from an observer. Samples include successor knowledge;
    // they establish access during the run, not one person's learning rate.
    const food = preservationSnapshot(G);
    const access = rec.preservationAccess || (rec.preservationAccess = { samples: 0, renderKnownSamples: 0, containers: {} });
    access.samples++; access.renderKnownSamples += food.renderKnown ? 1 : 0;
    for (const [where, counts] of Object.entries(food.containers)) {
      const a = access.containers[where] || (access.containers[where] = { peakUnits: {}, samplesWith: {} });
      for (const [kind, n] of Object.entries(counts)) {
        a.peakUnits[kind] = Math.max(a.peakUnits[kind] || 0, n);
        a.samplesWith[kind] = (a.samplesWith[kind] || 0) + (n > 0 ? 1 : 0);
      }
    }
    const pack = G.state.scholar.inventory || [];
    const known = (G.state.codex || {}).recipes || {};
    for (const r of G.data.recipes) {
      const level = (known[r.id] || {}).level || 0;
      if (!level) continue;
      const a = rec.recipeAccess[r.id] || (rec.recipeAccess[r.id] = { maxLevel: 0, knownSamples: 0, materialsReadySamples: 0 });
      a.maxLevel = Math.max(a.maxLevel, level); a.knownSamples++;
      if (Object.entries(r.materials || {}).every(([m, n]) => pack.filter(it => m === 'bait' ? (it.kcalEach || 0) > 0 : it.material === m).reduce((n, it) => n + (it.units || 0), 0) >= n)) a.materialsReadySamples++;
    }
    for (const v of inventory().values()) {
      const d = defs.get(v.id);
      rec.maxTier = Math.max(rec.maxTier, d.lootTier || d.tier || 1);
    }
    const ap = G.state.alienPlayers || {}, fc = ap.fanClubs;
    let favor = ap.favor || 0;
    if (fc) { let best = -1; favor = 0; for (const lane of ['fight', 'survival', 'social', 'showbiz']) { const n = fc[lane] || 0; if (Math.abs(n) > best) { best = Math.abs(n); favor = n; } } }
    rec.maxFavor = Math.max(rec.maxFavor, favor);
  };
  return rec;
}
async function child() {
  const root = path.resolve(arg('root', ROOT));
  const region = arg('region', null), origin = arg('origin', null);
  const H = require(path.join(root, 'scripts/sim-harness'));
  const { POLICY_REGISTRY: registry, runComparison } = require(path.join(root, 'scripts/sweep-compare'));
  const id = arg('policy', 'capable'), base = registry[id];
  if (!base) throw new Error('Unknown policy ' + id);
  let G, rec;
  const sample = ctx => { if (rec) { rec.policyCounters = Object.fromEntries(Object.entries(ctx).filter(([k]) => k.startsWith('livelihood'))); rec.sample(); } };
  registry[id] = Object.assign({}, base, {
    setup(g, ctx) {
      G = g;
      if (arg('observe', '1') !== '0') {
        rec = install(G); rec.sample();
        rec.startingTier = Math.max(1, ...((G.state.scholar.inventory || []).concat(Object.values(G.state.scholar.equipped || {}))).filter(Boolean).map(it => { const d = G.data.items.find(d => d.id === (it.itemId || it.id)); return d ? d.lootTier || d.tier || 1 : 1; }));
      }
      if (base.setup) base.setup(g, ctx);
    },
    upkeep(g, ctx) { if (base.upkeep) base.upkeep(g, ctx); sample(ctx); },
    daily(g, ctx) { if (base.daily) base.daily(g, ctx); sample(ctx); },
  });
  // Use the standard driver, including its ten-day sampling and daily
  // progression snapshot. A different sampling cadence can initialize lazy
  // game state at different times and produce a different trajectory.
  let rep;
  try { rep = await H.quietLog(() => runComparison({ seeds: [Number(arg('seed', 7))], policies: [id], days: Number(arg('days', 150)), ...(region ? { region } : {}), ...(origin ? { origin } : {}) })); }
  finally { registry[id] = base; }
  const r = rep.runs[0];
  if (rec) delete rec.sample;
  const stateHash = gameplayHash(G.state);
  if (arg('dump-state', null)) fs.writeFileSync(arg('dump-state'), JSON.stringify(G.state));
  process.stdout.write('\n@@GEAR@@' + JSON.stringify({ seed: Number(arg('seed', 7)), policy: id, region: r.region, origin: r.origin, days: r.days, endReason: r.endReason, won: !!r.won, sat: !!r.entered, invited: !!r.table, deaths: r.deaths, stateHashVersion: 2, stateHash, ...(rec || {}) }) + '\n');
}
async function main() {
  if (process.argv.includes('--child')) return child();
  const seeds = require('./sweep-dashboard').seedList(Number(arg('n', 16)));
  const policies = arg('policies', 'capable,socialite').split(',');
  const root = path.resolve(arg('root', ROOT)), rows = [], jobs = [];
  for (const policy of policies) for (const seed of seeds) jobs.push({ policy, seed });
  let next = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const { policy, seed } = jobs[next++];
      const row = await new Promise((resolve, reject) => {
        const p = spawn(process.execPath, [__filename, '--child', '--root', root, '--policy', policy, '--seed', String(seed), '--days', arg('days', '150'), ...(arg('region', null) ? ['--region', arg('region')] : []), ...(arg('origin', null) ? ['--origin', arg('origin')] : [])], { cwd: root, env: process.env });
        let out = '', err = '';
        p.stdout.on('data', x => { out += x; if (out.length > 3e6) out = out.slice(-2e6); });
        p.stderr.on('data', x => { err += x; });
        p.on('error', reject);
        p.on('close', code => { try { if (code) throw new Error(err.slice(-1200)); resolve(JSON.parse(out.split('@@GEAR@@').pop().trim())); } catch (e) { reject(new Error(policy + '/' + seed + ': ' + e.message)); } });
      });
      rows.push(row); process.stdout.write('.');
    }
  };
  await Promise.all(Array.from({ length: Number(arg('par', 4)) }, worker));
  rows.sort((a, b) => a.policy.localeCompare(b.policy) || seeds.indexOf(a.seed) - seeds.indexOf(b.seed));
  const sources = {};
  for (const r of rows) for (const g of r.grants) {
    const s = sources[g.source] || (sources[g.source] = { items: 0, gear: 0, tier3: 0, tier4: 0, beam: 0 });
    s.items += g.n; s.gear += g.gear ? g.n : 0; s.tier3 += g.tier >= 3 ? g.n : 0; s.tier4 += g.tier >= 4 ? g.n : 0; s.beam += g.beamResist ? g.n : 0;
  }
  const date = new Date().toISOString().slice(0, 10), dir = path.join(ROOT, 'evidence', date);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'gear-usage-' + arg('label', 'audit'));
  const sha = require('child_process').execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const hashes = {};
  const walk = dir => { for (const ent of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, ent.name); if (ent.isDirectory()) walk(p); else if (/\.(js|json)$/.test(p)) hashes[path.relative(root, p).replace(/\\/g, '/')] = require('crypto').createHash('sha256').update(fs.readFileSync(p)).digest('hex'); } };
  walk(path.join(root, 'src')); walk(path.join(root, 'scripts', 'policies'));
  for (const rel of ['scripts/sweep-compare.js', 'scripts/sim-harness.js']) hashes[rel] = require('crypto').createHash('sha256').update(fs.readFileSync(path.join(root, rel))).digest('hex');
  hashes['observer/gear-usage-audit.js'] = require('crypto').createHash('sha256').update(fs.readFileSync(__filename)).digest('hex');
  fs.writeFileSync(file + '.json', JSON.stringify({ schemaVersion: 2, driver: 'sweep-compare', root, sourceHead: sha, sourceHashes: hashes, seeds, policies, requestedRegion: arg('region', process.env.REGION || null), origin: arg('origin', process.env.ORIGIN || 'Columbus, Ohio'), days: Number(arg('days', 150)), sources, rows }, null, 2) + '\n');
  const methods = Object.keys(METHODS).map(m => [m, rows.reduce((n, r) => n + (r.calls[m] || 0), 0), rows.filter(r => r.calls[m]).length]);
  fs.writeFileSync(file + '.md', ['# Gear and usage census', '', 'Observer only; acquisitions exclude starting gear. Calls are coverage, not proof of value or success. NPC gifts count for their recipient. Nested sources do not double-count.', '', `Source: ${sha}; ${rows.length} runs, ${seeds.length} seeds, ${arg('days', 150)} days.`, '', '| source | items | gear | tier 3+ | tier 4 | beam armor |', '|---|---:|---:|---:|---:|---:|', ...Object.entries(sources).map(([s, n]) => `| ${s} | ${n.items} | ${n.gear} | ${n.tier3} | ${n.tier4} | ${n.beam} |`), '', '| method | calls | runs |', '|---|---:|---:|', ...methods.map(m => `| ${m[0]} | ${m[1]} | ${m[2]} |`), '', '| policy | wins | mean days | max favor | starting tier 4 runs |', '|---|---:|---:|---:|---:|', ...policies.map(p => { const rs = rows.filter(r => r.policy === p); return `| ${p} | ${rs.filter(r => r.won).length}/${rs.length} | ${(rs.reduce((n, r) => n + r.days, 0) / rs.length).toFixed(1)} | ${Math.max(...rs.map(r => r.maxFavor))} | ${rs.filter(r => r.startingTier === 4).length} |`; }), ''].join('\n'));
  console.log('\nwrote ' + file + '.{json,md}');
}
if (require.main === module) main().catch(e => { console.error(e.stack); process.exitCode = 1; });
module.exports = { install, METHODS, gameplayHash, preservationSnapshot };
