'use strict';
// A separate coverage policy: ordinary capable survival, but waits for the
// late game and pursues announced campaigns using public, paid actions.
// No summoning, progression/relationship grants, teleports, or HP writes.
const { capable } = require('./capable');
const C = require('./competent');
const bump = (ctx, key, n = 1) => { ctx['campaign' + key] = (ctx['campaign' + key] || 0) + n; };
const day = G => G.state.scholar.day || 0;
function env(fn) {
  const vars = { CAPABLE_GREEDY: '1', CAPABLE_GREEDY_MAXTIER: '7', CAPABLE_GREEDY_LASTDAY: process.env.CAMPAIGN_LASTDAY || '200' };
  const old = Object.fromEntries(Object.keys(vars).map(k => [k, process.env[k]]));
  Object.assign(process.env, vars);
  try { return fn(); } finally { for (const k of Object.keys(vars)) { if (old[k] === undefined) delete process.env[k]; else process.env[k] = old[k]; } }
}
function food(G) {
  return (G.state.scholar.inventory || []).reduce((n, i) => n + (G.isFinishedFood(i) && !G.isSpoiled(i) ? (i.kcalEach || 0) * (i.units || 0) : 0), 0);
}
function provision(G, ctx, target) {
  if (!G.playerAtHaven()) return;
  for (let take = 0; take < 80 && food(G) < target; take++) {
    const reserve = 2 * G.villageDailyNeed();
    const pantry = G.state.village.pantry || [];
    const ix = pantry.findIndex(i => G.isFinishedFood(i) && !G.isSpoiled(i) && (i.kcalEach || 0) > 0 && G.pantryKcal() - i.kcalEach >= reserve);
    if (ix < 0) break;
    const before = food(G); G.takeFromPantry(ix);
    const gained = food(G) - before;
    if (gained <= 0) break;
    bump(ctx, 'ProvisionKcal', gained);
  }
}
function outfit(G, ctx, tid, m) {
  const done = ctx._campaignOutfits || (ctx._campaignOutfits = {});
  for (const vid of new Set(m.allies.map(a => a.villageId))) {
    const force = m.allies.filter(a => a.villageId === vid);
    for (const kind of ['weapon', 'armor']) {
      const key = tid + ':' + vid + ':' + kind;
      if (done[key] || force.some(a => (a.outfitted || []).some(i => (G.data.items.find(d => d.id === (i.itemId || i.id)) || {})[kind]))) continue;
      const ix = [];
      (G.state.scholar.inventory || []).forEach((i, n) => {
        const d = G.data.items.find(d => d.id === (i.itemId || i.id));
        if (ix.length < force.length && d && d[kind] && !i.bonded && !i.equipped && !i.worn && !i.fuel && !i.kcalEach) ix.push(n);
      });
      // One complete batch per force/type: no stacking multiple spare
      // weapons onto the first blade through repeated partial donations.
      if (ix.length !== force.length) continue;
      const r = G.titanOutfit(tid, vid, ix);
      if (r && r.given) { done[key] = true; bump(ctx, 'GearGiven', r.given); }
    }
  }
}
function target(G, tid) {
  const camps = (G.state.titans || {}).campaigns || {};
  if (tid === 'the_network') {
    const c = camps.network || {}, node = G.networkCurrentNode();
    const tile = node && c.tiles && c.tiles[node.id];
    return tile && G.worldMonsters().find(m => m.networkNode === node.id && m.tx === tile.x && m.ty === tile.y);
  }
  const c = camps.finale || {};
  const mid = tid === 'finale' ? (!c.crew ? 'finale_crew' : !c.opening ? 'finale_opening' : 'finale') : tid;
  return G.worldMonsters().find(m => m.id === mid);
}
function approach(G, ctx, m) {
  if (m.mx == null || m.my == null) return false;
  const pos = () => G.state.scholar;
  const near = () => Math.max(Math.abs(m.mx - pos().mx), Math.abs(m.my - pos().my)) <= 1;
  if (!near()) {
    const detail = G.genDetail(G.map.px, G.map.py);
    let best = null;
    for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]) {
      const x = m.mx + dx, y = m.my + dy;
      if (!detail[y] || detail[y][x] == null || G.cellProps(detail[y][x]).blocks) continue;
      const p = G.findPath(pos().mx, pos().my, x, y);
      if (p && p.length && (!best || p.length < best.path.length)) best = { x, y, path: p };
    }
    const path = best ? G.beginPathWalk(best.x, best.y) : [];
    for (const step of path || []) {
      if (G.over || G.tbfight || G.pendingEncounter || !G.pathStep(step[0], step[1])) break;
    }
  }
  if (G.tbfight) { ctx.campaignFight = G.tbfight; return true; }
  if (!near()) return false;
  const here = G.playerMonster();
  if (!here || here.id !== m.id || (m.networkNode && here.networkNode !== m.networkNode)) return false;
  G.startCombat(m.id);
  if (G.tbfight) { ctx.campaignFight = G.tbfight; bump(ctx, 'FightsStarted'); return true; }
  return false;
}
function road(G, ctx) {
  if (G.over || G.tbfight || G.pendingEncounter || G.state.activeContest) return;
  try {
    const acts = G.titanSelfActions(), st = G.state.titans || {}, camps = st.campaigns || {};
    const known = ['herald', 'nielsen', 'finale', 'the_network'].filter(t => acts.some(a => a.id === 'titan:council:' + t));
    const tid = (camps.network && camps.network.started && !camps.network.done && !camps.network.lost ? 'the_network' : null)
      || (camps.finale && camps.finale.started && !camps.finale.done ? 'finale' : null) || known[0];
    if (!tid || !known.includes(tid)) return;
    ctx.campaignTarget = tid;
    const seen = ctx._campaignCouncil || (ctx._campaignCouncil = {});
    if (!seen[tid]) { G.titanSelfDo('titan:council:' + tid); seen[tid] = true; bump(ctx, 'Councils'); }
    let m = G.titanMusterState(tid);
    const need = G.titanDef(tid).minAllies;
    const count = () => m ? (m.allies || []).length + (m.haven || []).length : 0;
    provision(G, ctx, Math.max(need, count()) * 1000 + 2400);
    // Do not create a hungry army just to watch it disperse at dawn.
    if (food(G) < Math.max(need, count()) * 1000 + 1200) { bump(ctx, 'FoodBlocked'); return; }
    const call = acts.find(a => a.id === 'titan:call:' + tid || a.id === 'titan:reinforce:' + tid);
    const last = ctx._campaignCalls || (ctx._campaignCalls = {});
    if (call && (last[tid] == null || day(G) - last[tid] >= 7)) {
      G.titanSelfDo(call.id); last[tid] = day(G); bump(ctx, 'Calls'); m = G.titanMusterState(tid);
    }
    if (!m) return;
    if (count() < need && count() + 3 >= need && acts.some(a => a.id === 'titan:commit:' + tid)) {
      G.titanSelfDo('titan:commit:' + tid); G.titanSelfDo('titan:commit:' + tid); bump(ctx, 'OwnCommitments');
    }
    ctx.campaignMaxBlades = Math.max(ctx.campaignMaxBlades || 0, count());
    C.gearUp(G, ctx); // keep the bearer's best pieces before donating spares
    outfit(G, ctx, tid, m);
    const started = tid === 'finale' ? camps.finale && camps.finale.started : tid === 'the_network' ? camps.network && camps.network.started : false;
    if (!started && !G.titanMusterReady(tid)) { bump(ctx, 'StrengthBlocked'); return; }
    const s = G.state.scholar;
    if (s.health < G.maxHealth() * 0.7) { bump(ctx, 'HealthBlocked'); return; }
    const goal = target(G, tid);
    if (!goal) { bump(ctx, 'MissingTarget'); return; }
    bump(ctx, 'Sorties');
    C.walkTo(G, goal.tx, goal.ty);
    if (G.over || G.tbfight || G.pendingEncounter) return;
    if (G.map.px !== goal.tx || G.map.py !== goal.ty) { bump(ctx, 'TravelBlocked'); return; }
    approach(G, ctx, goal);
  } catch (e) { (ctx.notes || (ctx.notes = [])).push('campaign road: ' + e.message); bump(ctx, 'Errors'); }
}
function make(id, enabled) {
  const p = { ...capable, id, desc: 'capable survival with late-game waiting; ' + (enabled ? 'public-action coalition campaigns' : 'matched campaign control') };
  for (const hook of ['setup', 'upkeep', 'daily', 'fight', 'contest', 'pending']) p[hook] = (G, ctx) => env(() => {
    if (enabled && G.tbfight && (G.state.titans || {})._fight) ctx.campaignFight = G.tbfight;
    const r = capable[hook] && capable[hook](G, ctx);
    if (enabled && (hook === 'upkeep' || hook === 'daily')) road(G, ctx);
    return r;
  });
  return p;
}
module.exports = { campaigner: make('campaigner', true), 'campaigner-control': make('campaigner-control', false), road, provision, outfit, approach, target, food };
