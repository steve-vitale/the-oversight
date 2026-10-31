#!/usr/bin/env node
// test-capable-bot-20261014.js — proof that the CAPABLE bot's behaviours fire
// (Steve 2026-10-14: "Build a bot"; evidence/2026-10-14/simulator-audit.md §2).
//
// Scenario checks (one process, one load, fresh run per check):
//   1. REAL FLEE: hurt scholar away from Haven vs a strong monster -> the bot
//      walks to the havenward edge and pushes THROUGH (fight ends, node changes).
//   2. ABILITIES: a held combat action fires through Game.useAbility
//      (ability_used telemetry), and never below the hunger gate.
//   3. CHOICES: ability offer scored (synergy leg beats card 0); Table seat
//      taken when tablePreview().ready; trial-by-combat never picked; path by
//      strength, not position; contest phase by reward-vs-harm.
//   4. CONVERSATION: a held sitting with real turns, target by need.
//   5. competent.beastStrikeTarget: steps within moveLeft (was a "Too far" no-op).
//   6. A fight started during the daily round is finished before bed.
// Food capability: a controlled, paid pre-reactor feast must actually feed
// combat; an installed reactor must honestly refuse that buff. Natural sims
// retain both original seeds/horizon but run in independent child processes.
// Their legal reactor choices are diagnostics, not a food-deed quota.
'use strict';
const K = require('./godpath/lib');
const H = K.H;
const { capable, capableSummary, scoreOffer, scoreTableOption } = require('./policies/capable');
const C = require('./policies/competent');
const { execFileSync } = require('child_process');

async function campaign(seed) {
  const { Game: G } = await H.quietLog(() => H.loadGame({ seed, mode: 'test-capable' }));
  await H.quietLog(() => H.setupGame(G));
  let cx = null;
  const grants = [], plans = [], hosts = [];
  const originalPlan=G.feastPlan, originalHost=G.hostFeast;
  G.feastPlan=function(...args){
    const day=this.state.scholar.day,result=originalPlan.apply(this,args);
    plans.push({day,ok:!!result?.ok,have:result?.have,cost:result?.cost,why:result?.why});
    return result;
  };
  G.hostFeast=function(...args){
    const day=this.state.scholar.day,result=originalHost.apply(this,args);
    hosts.push({day,ok:!!result?.ok,why:result?.why});return result;
  };
  const original = G.grantFeastBuff;
  G.grantFeastBuff = function (...args) {
    const result = original.apply(this, args);
    grants.push({ day: G.state.scholar.day, granted: !!(result && result.granted), why: result && result.why });
    return result;
  };
  const pol = Object.assign({}, capable, { setup(g, c) { cx = c; return capable.setup(g, c); } });
  const r = await H.quietLog(() => H.runDays(G, pol, { days: 40 }));
  const pg = G.progState();
  return { seed, days: r.days, gameDays: r.gameDays || 0,
    food: !!(pg.sentimentTaught && (G.state.scholar.prog || {}).feastSurgeUsed),
    contests: cx.capContestChoices || 0, held: cx.capConvosHeld || 0,
    errors: cx.capErrors || [], grants, plans, hosts };
}

const T = K.reporter('test-capable-bot-20261014');

function drive(Game, ctx, maxIter) {
  // the harness's fight driver, with our policy
  H.driveFights(Game, capable, ctx);
  let n = 0;
  while (Game.tbfight && !Game.tbfight.over && n++ < (maxIter || 20)) H.driveFights(Game, capable, ctx);
}

async function main() {
  global.__policyRandom = H.mulberry32(12345);
  const Game = await K.load({ seed: 9 }); // seed 8 (2026-10-17, sim-gengap-b): seed 7's flee fixture stalled (5 barrier pushes, 0 exits) after the occupation pool grew 55->78 shifted the scenario RNG; 8 preserves every scenario precondition. Seed 9 (2026-10-31, lootabilities build): items.json gained two tier-1 loot pieces, shifting the scenario RNG again — at seed 8 a villager's fight consumed the feast buff before the player's first combat use; 9 preserves every scenario precondition, all sections pass, no assertion changed.

  // ---------- 1. real flee ----------
  T.section('1. real flee exits the fight');
  {
    K.newRun(Game);
    Game.map.px = 4; Game.map.py = 6; // two nodes south of Haven: havenward = north
    const mid = (Game.data.monsters || []).filter(m => (m.wave || 1) >= 2).sort((a, b) => (b.hp || 0) - (a.hp || 0))[0].id;
    K.fight(Game, mid, { px: 4, py: 4, mx: 4, my: 7, hp: 100 });
    const pf = Game.tbFighter('p'); pf.hp = 30; // hurt: < 35%
    const ctx = { notes: [] };
    const from = [Game.map.px, Game.map.py];
    let guard = 0;
    while (Game.tbfight && !Game.tbfight.over && guard++ < 30) {
      if (Game.tbIsPlayerTurn()) { if (!capable.fight(Game, ctx)) break; }
      else break;
    }
    const s = capableSummary(ctx);
    T.ok('flee decided', s.capFleeDecisions >= 1, JSON.stringify(s));
    T.ok('pushed through the barrier', s.capFleePushes >= 1, JSON.stringify(s));
    T.ok('fight exited (not just walked to the edge)', s.capFleeExits >= 1 || !Game.tbfight || Game.tbfight.over, JSON.stringify(s));
    T.ok('left the node havenward', Game.map.py < from[1], `from ${from} now ${[Game.map.px, Game.map.py]}`);
    T.ok('no policy errors', !(ctx.capErrors || []).length, JSON.stringify(ctx.capErrors));
  }

  // ---------- 2. abilities in combat ----------
  T.section('2. abilities fire in combat through useAbility');
  {
    K.newRun(Game);
    K.openSlots(Game, 6);
    K.giveAbility(Game, 'pocket_sand', { force: true });
    K.giveAbility(Game, 'static_toss', { force: true });
    Game.state.scholar.kcal = 2000;
    const before = K.teleEvents(Game, 'ability_used').length;
    K.fight(Game, 'hushwolf', { px: 3, py: 4, mx: 5, my: 4, hp: 200 });
    const ctx = { notes: [] };
    drive(Game, ctx, 6);
    const after = K.teleEvents(Game, 'ability_used').length;
    T.ok('capAbilityUses > 0', (ctx.capAbilityUses || 0) > 0, JSON.stringify(ctx.capAbilityById || {}));
    T.ok('ability_used telemetry > 0', after > before, `before ${before} after ${after}`);
    // hunger gate: below 500 kcal the bot never taps an ability
    K.newRun(Game);
    K.openSlots(Game, 6);
    K.giveAbility(Game, 'static_toss', { force: true });
    Game.state.scholar.kcal = 300;
    K.fight(Game, 'hushwolf', { px: 3, py: 4, mx: 5, my: 4, hp: 200 });
    const ctx2 = { notes: [] };
    if (Game.tbIsPlayerTurn()) capable.fight(Game, ctx2);
    T.ok('hunger gate respected (no use at kcal 300)', !(ctx2.capAbilityUses > 0) && (ctx2.capAbilityHungerSkips || 0) >= 1, JSON.stringify(capableSummary(ctx2)));
    try { if (Game.tbfight) Game.tbEnd('fled'); } catch (e) { Game.tbfight = null; }
  }

  // ---------- 3. choices by scoring ----------
  T.section('3. choices are scored, not option 0');
  {
    K.newRun(Game);
    K.openSlots(Game, 6);
    // a synergy leg: hold one half of a two-leg synergy, offer the other half second
    const syn = (Game.data.synergies || []).find(x => Array.isArray(x.requires) && x.requires.length === 2 &&
      x.requires.every(id => (Game.data.abilities || []).some(a => a.id === id)));
    const [legA, legB] = syn.requires;
    K.giveAbility(Game, legA, { force: true });
    const filler = (Game.data.abilities || []).find(a => a.id !== legA && a.id !== legB && !(Game.data.synergies || []).some(y => (y.requires || []).includes(a.id)));
    const held = [legA];
    T.ok(`offer scoring: synergy leg ${legB} beats ${filler.id}`, scoreOffer(Game, { id: legB }, held) > scoreOffer(Game, { id: filler.id }, held) + 1);
    Game.state.scholar.abilityChoices = [{ id: filler.id, name: filler.name }, { id: legB, name: legB }];
    const ctx = { notes: [] };
    capable.upkeep(Game, ctx);
    T.ok('upkeep took the synergy leg (not card 0)', Game.hasAbility(legB) && (ctx.capOffersNotFirst || 0) >= 1, JSON.stringify(capableSummary(ctx)));

    // Table seat: stub the preview the way table.js shapes it (ready at day >= 90)
    const realPrev = Game.tablePreview, realSeat = Game.tableTakeSeat;
    let sat = 0;
    Game.tablePreview = () => ({ seat: 'lesser', doors: ['The Feared'], day: 95, ready: true });
    Game.tableTakeSeat = () => { sat++; return { ok: true }; };
    capable.daily(Game, { notes: [] });
    T.ok('Table seat taken when tablePreview().ready', sat === 1);
    Game.tablePreview = () => ({ seat: 'lesser', doors: [], day: 60, ready: false });
    capable.daily(Game, { notes: [] });
    T.ok('Table seat NOT taken before day 90 (ready=false)', sat === 1);
    Game.tablePreview = realPrev; Game.tableTakeSeat = realSeat;
    // Table options: the trial is never volunteered; paths priced by strength
    const trial = scoreTableOption(Game, { id: 'beat:trial', label: 'Demand the champion. (TRIAL BY COMBAT — real fight, real death)' }, {});
    const calm = scoreTableOption(Game, { id: 'beat:mercy', label: 'Show mercy.' }, { branch: 'light' });
    T.ok('trial by combat scored below every other beat', trial < calm && trial < 0);
    const realEP = Game.tableEarnedPaths, realBr = Game.tableBranch;
    Game.tableEarnedPaths = () => [{ id: 'feared', earned: true, strength: 10 }, { id: 'beloved', earned: true, strength: 60 }];
    Game.tableBranch = () => ({ branch: 'light' });
    T.ok('path scored by earned strength, not position', scoreTableOption(Game, { id: 'path:beloved' }, {}) > scoreTableOption(Game, { id: 'path:feared' }, {}));
    Game.tableEarnedPaths = realEP; Game.tableBranch = realBr;
  }

  // ---------- 4. a held conversation ----------
  T.section('4. a conversation is held (real turns), target by need');
  {
    K.newRun(Game);
    const ctx = { notes: [] };
    const realBase = capable.daily;
    // only the talk layer: call daily, count held sittings
    realBase.call(capable, Game, ctx);
    T.ok('held at least one conversation', (ctx.capConvosHeld || 0) >= 1, JSON.stringify(capableSummary(ctx)));
    T.ok('real exchanges taken (deepTurns > 0)', (ctx.deepTurns || 0) > 0);
  }

  // ---------- 5. beastStrikeTarget clamp (competent fix) ----------
  T.section('5. competent.beastStrikeTarget steps within moveLeft');
  {
    const moves = [];
    const fake = {
      equippedWeapon: () => ({ range: 1 }),
      findPath: (sx, sy, tx, ty) => { const out = []; let x = sx; while (x !== tx) { x += Math.sign(tx - x); out.push([x, sy]); } return out; },
      tbTerrainCost: () => 1,
      tbPlayerMove: (x, y) => { moves.push([x, y]); return true; },
      tbPlayerStrike: () => true,
    };
    const f = { fighters: [{ key: 'm1', alive: true, mx: 7, my: 4 }] };
    const p = { mx: 1, my: 4, moveLeft: 3 };
    C.beastStrikeTarget(fake, f, {}, p, 1, 4, f.fighters[0], () => {});
    T.ok('moved', moves.length === 1, JSON.stringify(moves));
    T.ok('destination within this turn\'s 3 squares (was 5 away: "Too far" no-op)', moves[0] && Math.abs(moves[0][0] - 1) <= 3, JSON.stringify(moves));
  }

  // ---------- 6. a fight that starts in the daily round is finished before bed ----------
  T.section('6. no fight left live at bedtime (sleep would refuse: a lost game day)');
  {
    K.newRun(Game);
    Game.map.px = 4; Game.map.py = 6;
    K.fight(Game, 'hushwolf', { px: 3, py: 4, mx: 5, my: 4, hp: 100 });
    const ctx = { notes: [] };
    capable.daily(Game, ctx);
    T.ok('fight resolved by the end of daily', !Game.tbfight || Game.tbfight.over, JSON.stringify(capableSummary(ctx)));
  }

  // ---------- 7. paid feast -> real capable combat, before a reactor ----------
  T.section('7. capable food chain and the reactor tradeoff');
  {
    K.newRun(Game);
    const s = Game.state.scholar, v = Game.state.village;
    s.day = 20; s.integration = 65; s.trauma = 0; s.kcal = 2400;
    s.abilities = []; s.backgroundAbilities = []; s.abilityChoices = [];
    for (const id of ['pocket_sand', 'static_toss', 'echo_location']) K.giveAbility(Game, id, { force: true, level: 3 });
    const ctx = { notes: [] };
    const ready = Game.channelReadyKeepsakes();
    T.ok('fixture holds a real unchanneled keepsake', ready.length > 0);
    Game.teachSentiment(); // real lesson channels the held keepsake
    T.ok('lesson and mastered gifts arm devotion without setting deed flags', Game.sentimentTaught() && s.prog.feastSurge > 1 && !s.prog.feastSurgeUsed, JSON.stringify({ prog: s.prog, abilities: s.abilities }));
    T.ok('pre-reactor chain has no reactor', !Game.fusionReactorOnline());
    // Named fixture food is explicit setup. Donation and feast spend must use
    // the actual engines; no fake contribution, grant or combat-use receipt.
    v.pantry = [{ itemId: 'foraged_food_dried', name: 'Foraged food (dried)', kcalEach: 200, units: 500, edible: true, foodState: 'dried' }];
    v.health = v.health || {}; v.trust = v.trust || {};
    for (const id of v.roster || []) { v.health[id] = 100; v.trust[id] = 30; }
    C.recentGives(Game, ctx, 7); // establish the real contribution baseline
    s.inventory.push({ itemId: 'foraged_food_dried', name: 'Foraged food (dried)', kcalEach: 200, units: 10, edible: true, foodState: 'dried' });
    const donated = s.inventory.length - 1;
    Game.donateToPantry(donated);
    T.ok('real donation clears the policy contribution bar', C.recentGives(Game, ctx, 7) >= 1500);
    Game.dayPart = 2;
    const originalHost = Game.hostFeast, receipts = [];
    Game.hostFeast = function (...args) {
      const before = this.pantryKcalLive(this.state.village);
      const result = originalHost.apply(this, args);
      receipts.push({ before, after: this.pantryKcalLive(this.state.village), result });
      return result;
    };
    try { capable.upkeep(Game, ctx); }
    finally { Game.hostFeast = originalHost; }
    const feast = receipts.find(x => x.result && x.result.ok);
    T.ok('capable upkeep actually hosts a feast', !!feast, JSON.stringify(receipts));
    T.ok('feast spends its reported real pantry calories', !!feast && feast.result.spent > 0 && feast.before - feast.after === feast.result.spent);
    T.ok('paid feast actually grants the buff', !!feast && feast.result.buffGranted === true && Game.feastedActive());
    T.ok('capable faces the actual feast draw', !!Game.tbfight && !Game.tbfight.over && (ctx.facedDraw || 0) > 0);
    const originalNote = Game.noteFeastedCombatUse, uses = [];
    Game.noteFeastedCombatUse = function (...args) {
      const scholar = this.state.scholar, buff = scholar.feastBuff;
      const before = !!(buff && buff.used), fighting = !!(this.tbfight && !this.tbfight.over);
      const result = originalNote.apply(this, args);
      uses.push({ fighting, before, after: !!(buff && buff.used), earned: !!scholar.prog.feastSurgeUsed, source: scholar.prog.feastSurgeBy });
      return result;
    };
    try { drive(Game, ctx); }
    finally { Game.noteFeastedCombatUse = originalNote; }
    T.ok('real capable player combat earns the food deed at first use', uses.some(x => x.fighting && !x.before && x.after && x.earned && x.source === 'p'), JSON.stringify(uses));
    T.ok('earned food deed persists through combat settlement', !!s.prog.feastSurgeUsed);
    T.ok('combat spends devotion only on actual use', !s.prog.feastSurge);
    T.ok('food chain has no policy errors', !(ctx.capErrors || []).length, JSON.stringify(ctx.capErrors));

    // Separate fresh run, same loaded harness: the reactor is a permanent
    // authored tradeoff. Never bypass it to satisfy a campaign win/deed quota.
    K.newRun(Game);
    const reactor = Game.state.scholar;
    K.giveAbility(Game, 'fusion_reactor', { force: true });
    reactor.fusionReactor = { installed: true, online: true };
    const refusal = Game.grantFeastBuff({ quality: 2, surge: 1.5, served: [], guests: [] });
    T.ok('online reactor refuses the otherwise armed grant honestly', Game.fusionReactorOnline() && refusal.granted === false && /reactor.*ceiling/i.test(refusal.why));
    T.ok('reactor refusal invents neither feast buff nor food deed', !reactor.feastBuff && !(reactor.prog || {}).feastSurgeUsed);
  }

  // ---------- short sims: one harness per independent process ----------
  T.section('short sims: 2 seeds x 40 days');
  {
    let contests = 0, held = 0, errs = [], days = 0, gdays = 0, food = 0;
    for (const seed of [42, 1234]) {
      const r = JSON.parse(execFileSync(process.execPath, [__filename, '--campaign', String(seed)], { encoding: 'utf8', timeout: 120000 }));
      days += r.days;
      gdays += r.gameDays || 0;
      if (r.food) food++;
      contests += r.contests;
      held += r.held;
      errs = errs.concat(r.errors);
      // Natural trajectories can lose the contribution/opportunity substrate
      // when intended dialogue choices change. Retain that coverage warning;
      // a fixed forty-day deed deadline is not the capability contract. The
      // unconditional paid donation -> policy feast -> actual combat proof
      // above remains mandatory, including its authored reactor refusal.
      const qualified=r.plans.filter(p=>p.ok && p.have>=p.cost*1.5);
      if(qualified.length) {
        T.ok(`seed ${seed}: qualified observed feast plans receive an actual host attempt`,
          qualified.every(p=>r.hosts.some(h=>h.day===p.day)),JSON.stringify({qualified,hosts:r.hosts}));
        T.ok(`seed ${seed}: host attempts return a real feast or explicit refusal`,
          r.hosts.every(h=>h.ok || typeof h.why==='string'&&h.why.length>0),JSON.stringify(r.hosts));
      } else console.log(`  INFO seed ${seed}: feast opportunity unobserved; keep the natural food-deed coverage watch`);
      console.log(`  INFO original campaign seed=${seed} foodDeeds=${r.food} grants=${JSON.stringify(r.grants)}`);
    }
    T.ok('runs completed', days > 40, String(days));
    T.ok('game days keep pace with loop days (no fight left live at sleep)', gdays >= days - 6, `loop ${days} game ${gdays}`);
    console.log(`  INFO original two-seed food-deed count=${food}; capability required by controlled real-combat proof above`);
    T.ok('contest choices taken by scoring', contests > 0, String(contests));
    T.ok('conversations held in-sim', held > 0, String(held));
    T.ok('no policy-side errors', errs.length === 0, JSON.stringify(errs.slice(0, 5)));
  }

  T.done();
}

(process.argv[2] === '--campaign'
  ? campaign(Number(process.argv[3])).then(r => process.stdout.write(JSON.stringify(r)))
  : main()).catch(e => { console.error(e); process.exitCode = 1; });
