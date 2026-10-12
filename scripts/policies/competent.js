// policies/competent.js — plays like an aware, experienced player (Steve 2026-10-09).
// Heuristics, not optimal. Genuinely trying to win: learns plants, teaches,
// cooks everything, avoids disease vectors, fights only with advantage,
// keeps the takes/gives ledger honest. This is the skill-ceiling seed.
'use strict';
const idle = require('./idle');

// Eat like someone who knows the disease roster (DISEASES.md): cooked/safe
// food first, never human meat (trembles — cooking doesn't kill prions),
// never raw meat (trichinosis/gutrot). Re-scans each take since indices shift.
function competentEat(Game) {
  const s = Game.state.scholar, vv = Game.state.village;
  try {
    if (s.kcal >= Game.kcalCap() * 0.85) return;
    // HONEST EATING (bal-survival 2026-10-10): eat from the PACK first
    // (your foraged food), pantry second. The old code took from the pantry
    // even with a full pack — making the player a net drain.
    try { Game.eat(); } catch (e) {}
    if (s.kcal >= Game.kcalCap() * 0.85) return;
    let guard = 0;
    while (s.kcal < Game.kcalCap() * 0.95 && guard++ < 20) {
      const pantry = vv.pantry || [];
      let best = -1, bestScore = -99;
      for (let i = 0; i < pantry.length; i++) {
        const it = pantry[i];
        if (!it || (it.kcalEach || 0) <= 0) continue;
        if (it.plantId === 'meat_human') continue; // trembles: no cure, ever
        let score = 1;
        const fs = it.foodState || '';
        if (fs === 'cooked' || fs === 'smoked' || fs === 'preserved' || fs === 'rendered') score = 10;
        else if (fs === 'raw') score = (it.plantId || '').startsWith('meat_') ? -10 : 2;
        if (score > bestScore) { bestScore = score; best = i; }
      }
      if (best < 0 || bestScore < 0) break;
      try { Game.takeFromPantry(best); } catch (e) { break; }
      try { Game.eat(); } catch (e) { break; }
    }
  } catch (e) {}
}

// ANSWER THE FIRE NETWORK (longsim food r4 2026-10-12): the aid instrument
// is the coalition's only non-national-gated food layer and it works
// end-to-end (offer -> inbound -> pantry; beg -> their pantry + trust) — but
// no competent-derived policy ever answered it, so every loop's sims measured
// a coalition food economy with the pipes shut. A competent player:
//   - ACCEPTS an aid offer. It only fires when Haven is genuinely struggling
//     and a rich neighbor noticed; there is no cost to saying yes.
//   - GIVES to a begging neighbor when the pantry can carry it (3x the ask,
//     1.5x when they once fed Haven — refusing a creditor costs double trust
//     and the ledger remembers). Refuses honestly otherwise.
function answerAidBeats(Game, ctx) {
  if (process.env.COMPETENT_AID === '0') return; // before/after harness gate
  const st = Game.state || {};
  const pantryKcal = () => {
    try { return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
  };
  try {
    if (st.pendingAidOffer && Game.answerAidOffer) {
      Game.answerAidOffer('accept');
      ctx.aidOffersAccepted = (ctx.aidOffersAccepted || 0) + 1;
    }
  } catch (e) {}
  try {
    const beg = st.pendingAidBeg;
    if (beg && Game.answerAidBeg) {
      const ask = beg.amount || 1500;
      const pk = pantryKcal();
      let creditor = false;
      try {
        const led = Game.aidLedger ? Game.aidLedger(beg.villageId) : null;
        creditor = led && (led.receivedKcal || 0) > (led.givenKcal || 0);
      } catch (e) {}
      const give = pk > ask * (creditor ? 1.5 : 3);
      const r = Game.answerAidBeg(give ? 'give' : 'refuse');
      if (r === 'gave') ctx.aidGivenKcal = (ctx.aidGivenKcal || 0) + ask;
      else ctx.aidRefused = (ctx.aidRefused || 0) + 1;
    }
  } catch (e) {}
}

// Loot the dead: an experienced player strips corpses (take, don't leave
// meat to rot — but never human meat). Range-checked inside corpseTakeItem.
function lootCorpses(Game, ctx) {
  try {
    if (!Game.corpses) return 0;
    let took = 0;
    for (const c of Game.corpses()) {
      if (!c || c.looted || c.buried) continue;
      const items = c.items || [];
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        if (!it || (it.units == null ? 1 : it.units) <= 0) continue;
        if (it.plantId === 'meat_human') continue; // trembles
        try {
          const r = Game.corpseTakeItem(c.id, i);
          if (r) { took++; ctx.looted = (ctx.looted || 0) + 1; }
        } catch (e) {}
      }
      if (took >= 12) break; // don't spend the whole day-part
    }
    return took;
  } catch (e) { return 0; }
}

function nearFire(Game) {
  try { return Game.nearFire(); } catch (e) { return false; }
}

// Cook every raw item in the pack when a fire is near. Raw = disease risk.
function cookPack(Game, ctx) {
  if (!nearFire(Game)) return 0;
  let cooked = 0;
  try {
    const inv = Game.state.scholar.inventory || [];
    for (let i = inv.length - 1; i >= 0; i--) {
      const it = inv[i];
      if (it && it.foodState === 'raw' && it.kcalEach > 0) {
        try { Game.cookFood(i); cooked++; } catch (e) {}
        if (cooked >= 6) break; // don't burn the whole day-part
      }
    }
  } catch (e) {}
  if (cooked) ctx.cooked = (ctx.cooked || 0) + cooked;
  return cooked;
}

// Safe water: fill when near a source, boil first (needs fire or beard_moss),
// then drink. An experienced player never drinks risky water raw.
function drinkSafe(Game, ctx) {
  try {
    const s = Game.state.scholar;
    // fill a bottle when the tile offers water
    try {
      const t = Game.playerTile ? Game.playerTile() : null;
      if (t && /creek|well|spring|river|pond/i.test(t.type || '') && (s.water || []).length < 3) {
        try { Game.fillWater(); } catch (e) {}
      }
    } catch (e) {}
    if ((s.hydration || 0) >= 70) return;
    if (!(s.water || []).length) return;
    try { Game.boilWater(); } catch (e) {}
    try { Game.doAction('drink'); ctx.drank = (ctx.drank || 0) + 1; } catch (e) {}
  } catch (e) {}
}

// Ticks: check after wilderness time; remove cleanly only when skilled.
// Blind yanks botch into wound_fever — an experienced player knows that.
function checkTicks(Game, ctx) {
  try {
    const list = Game.seList ? Game.seList('scholar') : [];
    const tick = (list || []).find(e => e.id === 'tick_attached');
    if (!tick) return;
    const knows = !!((Game.state.codex || {}).techniques || {}).tick_removal ||
      (Game.hasAbility && (Game.hasAbility('triage') || Game.hasAbility('field_medicine') || Game.hasAbility('herbal_remedy')));
    if (knows) {
      try { Game.removeTick(); ctx.ticksRemoved = (ctx.ticksRemoved || 0) + 1; } catch (e) {}
    } else {
      ctx.ticksIgnored = (ctx.ticksIgnored || 0) + 1;
    }
  } catch (e) {}
}

// Teach: pass known plants to villagers who don't know them.
// Knowledge → food → power starts with someone knowing the plants.
function teachRound(Game, ctx) {
  try {
    const known = Object.keys((Game.state.codex || {}).plants || {});
    if (!known.length) return;
    const vv = Game.state.village;
    const roster = (vv.roster || []).filter(id => id !== Game.villagerId);
    if (!roster.length) return;
    let taught = 0;
    for (const pid of known.slice(0, 3)) { // a few per day, not a lecture marathon
      for (const vid of roster) {
        let vk = [];
        try { vk = (vv.plantKnowledge && vv.plantKnowledge[vid]) || []; } catch (e) {}
        if (!vk.includes(pid)) {
          try { if (Game.teachPlant(vid, pid)) { taught++; break; } } catch (e) {}
        }
      }
      if (taught >= 2) break;
    }
    if (taught) ctx.taught = (ctx.taught || 0) + taught;
  } catch (e) {}
}

// Talk: one real conversation a day. Relationships are the other economy.
function talkRound(Game, ctx) {
  try {
    const vv = Game.state.village;
    const roster = (vv.roster || []).filter(id => id !== Game.villagerId);
    if (!roster.length || !Game.talkTo) return;
    const vid = roster[Math.floor(Math.random() * roster.length)];
    try {
      Game.talkTo(vid);
      try { Game.endConvo(vid, 'left'); } catch (e2) {} // don't leave modal state open
      ctx.talked = (ctx.talked || 0) + 1;
    } catch (e) {}
  } catch (e) {}
}

// Forage as a matter of course: a competent citizen works the land daily,
// not just when the ledger screams. The old gate (pantry < 25000) meant the
// player never foraged while the starting pantry looked fine — living off
// the commons, giving nothing, and getting exiled for freeloading by day 17
// (journey-scale r3 2026-10-11: 4/4 seeds exiled before the courtship began,
// all scale verbs blocked). Contribution is daily, not emergency-only.
function needTrip(Game, ctx) {
  try {
    const pantry = ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    const s = Game.state.scholar;
    if (pantry < 25000 || s.kcal < Game.kcalCap() * 0.5) return true;
    // CONTRIBUTION MAINTENANCE: if we haven't given to the pantry in 3 days,
    // we're taking without giving — forage. The village notices.
    if (ctx) {
      const day = (s && s.day) || 0;
      const lastGive = ctx._lastGiveDay || 0;
      if (day - lastGive >= 3) return true;
    }
    return false;
  } catch (e) { return false; }
}

// WORK THE WATER (food-early 2026-10-09): a competent leader keeps the
// cistern filled. Villagers drink 2L/day each; nobody fetches water
// autonomously, so without assignments the village dies of thirst while
// food is still on the table — 11/49 baseline deaths. Runs in upkeep (per
// part); the already-assigned guard keeps it to one worker per need.
// Assign in person (assignTask refuses remote).
function workWater(Game, ctx) {
  try {
    if (!Game.playerAtHaven || !Game.playerAtHaven()) return;
    const v = Game.state.village || {};
    const vw = v.water || { clean: 0, dirty: 0 };
    const stored = (vw.clean || 0) + (vw.dirty || 0);
    const mouths = (v.roster || []).length;
    const asg = v.assignments || {};
    const onTask = (t) => Object.values(asg).some(a => a && a.task === t);
    const free = (v.roster || []).filter(id => {
      if (id === Game.villagerId) return false;
      if (asg[id]) return false;
      try { const p = Game.getPerson(id); return p && !p.dead; } catch (e) { return true; }
    });
    let fi = 0;
    const assignOne = (task) => {
      if (fi >= free.length) return false;
      try { Game.assignTask(free[fi++], task, { via: 'in-person' }); return true; }
      catch (e) { return false; }
    };
    if (stored < mouths * 4 && !onTask('water')) assignOne('water');
    if ((v.wood || 0) < 8 && !onTask('wood')) assignOne('wood');
  } catch (e) {}
}

// COUNTER-PLAY (bal-survival 2026-10-10): an honest player in the depletion
// build doesn't just forage harder — they build the second food leg. When
// the near grounds thin: break garden ground at haven, put a green-handed
// villager on garden duty (they sow from village seed stock), and put a
// fisher on the creek. Traps: set one when holding a trap tool on wild
// ground. All best-effort, in-person, obedience-gated like any leadership.
function groundsThinning(Game) {
  try {
    let stocked = 0, thin = 0;
    for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
      if (x === 4 && y === 4) continue;
      const dist = Math.abs(x - 4) + Math.abs(y - 4);
      if (dist < 1 || dist > 2) continue;
      const t = Game.tileAt(x, y);
      if (!t || t.type === 'ruin' || (t.stock || 0) <= 0) continue;
      stocked++;
      if (Game.depletionLevel(t) !== 'lush') thin++;
    }
    return stocked >= 3 && thin / stocked > 0.5;
  } catch (e) { return false; }
}

// SEED-FIRST (bal-survival 2026-10-10): sowing is the player's call, and
// seed is 2 units of a known gardenable plant from the PACK — not the
// pantry (the pantry never holds seed stock; stockPantry makes generic
// items). An honest player sows from the fresh haul BEFORE donating it,
// or the village eats the seed. Returns true when something was sown.
function trySow(Game, ctx) {
  try {
    if (!Game.gardenPlots || !Game.sowOptions || !Game.sowPlot) return false;
    if (!Game.playerAtHaven || !Game.playerAtHaven()) return false;
    const plots = Game.gardenPlots() || [];
    if (!plots.some(p => !p.pid && !p.dead)) return false;
    const opts = (Game.sowOptions() || []).slice();
    if (!opts.length) return false;
    // quick crops first (shoots 7d feed sooner), then richest
    opts.sort((a, b) => (a.growthDays - b.growthDays) || ((b.kcalEach || 0) - (a.kcalEach || 0)));
    try { Game.sowPlot(opts[0].pid); ctx.sown = (ctx.sown || 0) + 1; return true; }
    catch (e) { return false; }
  } catch (e) { return false; }
}

// THE KNIFE IN THE PACK (longsim food r6 2026-10-12): sim scholars start
// knifeless and stone never meets vine in the pack — the trapline's catches
// rot uncleaned (r5: 56 catches, ~1 cleaned). This is a materials-gathering
// BEHAVIOR blank, not a game bug: a real player prioritizing the line
// gathers the stone. The competent policy now does too:
//
//   - knifeNeeded: the trigger — uncleaned carcasses in the pack, trap
//     materials held (with the snare known), or actively traplining.
//   - keepKnife (camp ritual, before workTrapline): knap the universal
//     stone knife FIRST (everyone's L3 — the game's own knifeless message
//     points at it: stone + vine, 85%, durable), so the knife wins the
//     pack's vine before snare crafts eat it. Once knapped the knife is
//     held durably — this fires ~once per life.
//   - the trip: when the knife is needed and stone is the missing half, a
//     rubble-choked path is roadwork, not a detour — clear it (a day-part,
//     40 kcal, 1-3 real stone), then walk in. When vine is the missing
//     half, prefer revealed vine-rich ground (thickets).
// Env gate COMPETENT_KEEP_KNIFE=0 restores the exact old behavior for
// identical-seed before/after.
function packMat(Game, m) {
  try {
    return ((Game.state.scholar || {}).inventory || [])
      .filter(i => i && i.material === m).reduce((t, i) => t + (i.units || 0), 0);
  } catch (e) { return 0; }
}
function knifeNeeded(Game, ctx) {
  try {
    if (Game.hasCuttingTool && Game.hasCuttingTool()) return false;
    const inv = (Game.state.scholar || {}).inventory || [];
    if (inv.some(i => i && i.foodState === 'carcass')) return true; // uncleaned carcasses
    const snareKnown = (((Game.state.codex || {}).recipes || {}).snare || {}).level >= 1;
    if (snareKnown && (packMat(Game, 'vine') >= 1 || packMat(Game, 'stick') >= 1)) return true; // holds trap materials
    if ((ctx.trapsCrafted || 0) > 0 || (ctx.trapsSet || 0) > 0 || (ctx.trapsWireSet || 0) > 0) return true; // actively traplining
    return false;
  } catch (e) { return false; }
}
function knifeWantsStone(Game, ctx) {
  return knifeNeeded(Game, ctx) && packMat(Game, 'stone') < 1;
}
function knifeWantsVine(Game, ctx) {
  return knifeNeeded(Game, ctx) && packMat(Game, 'stone') >= 1 && packMat(Game, 'vine') < 1;
}
// hop-by-hop honest walk toward (hx,hy): one travelTo per hop, no force,
// bounded. travelTargets only reaches d<=3, so a single travelTo can't
// cross the map — walk it like a player would.
function walkTo(Game, hx, hy) {
  try {
    let guard = 0;
    while ((Game.map.px !== hx || Game.map.py !== hy) && guard++ < 10 && !Game.over && !Game.tbfight) {
      let best = null, bd = 1e9;
      for (const tt of (Game.travelTargets() || [])) {
        const d = Math.abs(tt.x - hx) + Math.abs(tt.y - hy);
        if (d < bd) { bd = d; best = tt; }
      }
      if (!best) break;
      const px0 = Game.map.px, py0 = Game.map.py;
      try { Game.travelTo(best.x, best.y); } catch (e) { break; }
      if (Game.map.px === px0 && Game.map.py === py0) break; // refused: stay put, safely
    }
  } catch (e) {}
}
// nearest rubble-choked path in travel reach (from the player's tile)
function nearestRubble(Game) {
  let best = null;
  try {
    for (const tt of (Game.travelTargets() || [])) {
      let b = null;
      try { b = Game.travelBlockage(tt.x, tt.y); } catch (e) {}
      if (!b || b.blockType !== 'rubble') continue;
      if (!best || tt.d < best.d) best = { x: tt.x, y: tt.y, d: tt.d };
    }
  } catch (e) {}
  return best;
}
// nearest unrevealed tile on the map (the expedition's frontier)
function nearestUnknown(Game) {
  try {
    const px = Game.map.px, py = Game.map.py;
    let ux = -1, uy = -1, ud = 1e9;
    for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
      if (x === px && y === py) continue;
      const t = Game.tileAt(x, y);
      if (!t || t.revealed) continue;
      const d = Math.abs(x - px) + Math.abs(y - py);
      if (d < ud) { ud = d; ux = x; uy = y; }
    }
    return ux < 0 ? null : { x: ux, y: uy };
  } catch (e) { return null; }
}
// Walk to the rubble's guarded side and clear it — the blockage card's own
// honest path (a day-part, 40 kcal, 1-3 stone into the pack). The guarded
// side is (bx+bf.dx, by+bf.dy): blockFrom.dx/dy is the direction you'd be
// coming FROM to enter the tile. Returns true when the rubble was cleared.
function clearRubbleForStone(Game, ctx, bx, by) {
  try {
    const t = Game.tileAt(bx, by);
    const bf = t && t.blockFrom;
    if (!bf || bf.type !== 'rubble') return false;
    const sx = bx + (bf.dx || 0), sy = by + (bf.dy || 0);
    if (sx < 0 || sy < 0 || sx > 8 || sy > 8) return false;
    if (Game.map.px !== sx || Game.map.py !== sy) {
      try { Game.travelTo(sx, sy); } catch (e) { return false; } // honest walk, no force
      if (Game.over || Game.tbfight) return false;
      if (Game.map.px !== sx || Game.map.py !== sy) return false;
    }
    const before = packMat(Game, 'stone');
    try { Game.clearBlockage(bx, by); } catch (e) { return false; }
    const gained = packMat(Game, 'stone') - before;
    ctx.rubbleCleared = (ctx.rubbleCleared || 0) + 1;
    if (gained > 0) ctx.stoneFromRubble = (ctx.stoneFromRubble || 0) + gained;
    return true;
  } catch (e) { return false; }
}
function keepKnife(Game, ctx) {
  if (process.env.COMPETENT_KEEP_KNIFE === '0') return; // before/after harness gate
  try {
    if (!knifeNeeded(Game, ctx)) return;
    // KNAP FIRST: stone + vine → the universal stone knife. Runs before
    // workTrapline's snare crafts in daily() so the durable knife wins the
    // vine race. The 15% fail is real: materials already consumed by craft().
    if (packMat(Game, 'stone') >= 1 && packMat(Game, 'vine') >= 1) {
      try {
        if (Game.craft('stone_knife')) ctx.knivesKnapped = (ctx.knivesKnapped || 0) + 1;
        else ctx.knapFailed = (ctx.knapFailed || 0) + 1;
      } catch (e) {}
    }
  } catch (e) {}
}
// STONE RUN (food r6): when the knife needs its stone half, a competent
// trapper makes a DELIBERATE detour to the nearest rubble-choked path —
// roadwork, not luck. (The forage trip's opportunistic clearing only fires
// when a blocked tile surfaces in the trip rotation, which ~never happens:
// 12-seed probe showed rubble=0 everywhere. A real player prioritizing the
// line walks to the rubble on purpose.) Scans travel reach for rubble,
// clears the nearest (a day-part, 40 kcal, 1-3 real stone), walks home.
// Fires at most until stone≥1 — then knifeWantsStone goes false.
function stoneRun(Game, ctx) {
  if (process.env.COMPETENT_KEEP_KNIFE === '0') return; // before/after harness gate
  try {
    if (!knifeWantsStone(Game, ctx)) return;
    const hx = Game.map.px, hy = Game.map.py;
    // 1. known roads first
    let best = nearestRubble(Game);
    // 2. EXPEDITION (food r6): rubble is ~8% of wild tiles and the player
    //    only knows the roads they've walked — the scan above is fog-honest
    //    but blind on most seeds (seed 11: 2 rubble tiles, both far from
    //    haven; the forage trips map the whole neighborhood by day 5). A
    //    real player needing stone walks the unknown: push the frontier
    //    (walkTo hops there honestly, real travel costs and encounter risk),
    //    re-scan at each new ground. Up to 3 pushes/day.
    let pushes = 0;
    while (!best && pushes < 3 && !Game.over && !Game.tbfight) {
      const U = nearestUnknown(Game);
      if (!U) break;
      walkTo(Game, U.x, U.y);
      pushes++;
      ctx.fogSteps = (ctx.fogSteps || 0) + 1;
      if (!Game.over && !Game.tbfight) best = nearestRubble(Game);
    }
    if (Game.over || Game.tbfight) { walkTo(Game, hx, hy); return; }
    if (best) {
      if (clearRubbleForStone(Game, ctx, best.x, best.y))
        ctx.stoneRuns = (ctx.stoneRuns || 0) + 1;
    }
    // walk home whether or not stone was found — never strand the expedition
    walkTo(Game, hx, hy);
  } catch (e) {}
}

// Forage trip that feeds the garden: travel out, forage, travel home. The
// haul comes home as unidentified lumps (prepStash) — sorting, sowing, and
// donating happen as separate honest steps in daily(), not hidden in the trip.
function forageTripSeedFirst(Game, ctx) {
  const s = Game.state.scholar;
  const keepKnifeOn = process.env.COMPETENT_KEEP_KNIFE !== '0';
  try {
    const cands = [];
    for (const tt of (Game.travelTargets() || [])) {
      const t = Game.tileAt(tt.x, tt.y);
      if (!t || t.type === 'haven' || t.type === 'ruin' || (t.stock || 0) <= 0) continue;
      let blocked = false, blockType = null;
      try { const b = Game.travelBlockage(tt.x, tt.y); blocked = !!b; blockType = b && b.blockType; } catch (e) {}
      cands.push({ x: tt.x, y: tt.y, d: tt.d, blocked, blockType, type: t.type, revealed: !!t.revealed });
    }
    // VINE-RICH GROUND (food r6): when vine is the knife's missing half, a
    // competent player heads for the thickets — bushes grow in thickets, and
    // that's player-visible world knowledge (revealed tiles only; the fog
    // keeps its secrets). A vine-rich tile counts as one step nearer.
    const wantVine = keepKnifeOn && knifeWantsVine(Game, ctx);
    // STONE-FIRST SORT (food r6): when the knife needs its stone half, a
    // rubble-choked tile IS the destination — route to it deliberately
    // instead of sorting it last. The trip's clearing branch does the work.
    const wantStone = keepKnifeOn && knifeWantsStone(Game, ctx);
    const deff = (c) => c.d - ((wantVine && c.revealed && (c.type === 'thicket' || c.type === 'grove')) ? 1 : 0);
    cands.sort((a, b) =>
      ((wantStone && a.blockType === 'rubble' ? 0 : 1) - (wantStone && b.blockType === 'rubble' ? 0 : 1)) ||
      (a.blocked - b.blocked) || (deff(a) - deff(b)));
    if (!cands.length) return 0;
    const hx = Game.map.px, hy = Game.map.py;
    // WORKED-OUT PATCH (longsim combat r2 2026-10-11): the nearest stocked
    // tile is usually the one we picked clean yesterday (detail regrows in
    // ~2 days) — the old code foraged it anyway and the trip failed every
    // day, so the policy never gathered wild food OR crafting materials. A
    // competent player steps to another green patch when the forage comes
    // back empty, like the game's own failure line says. Try up to 3.
    let foraged = 0;
    for (const pick of cands.slice(0, 3)) {
      // HONEST TRAVEL (food r6): the old form passed pick.blocked as
      // travelTo's FORCE arg — a blocked path was crossed for free (no
      // 40 kcal, no stone, no card). A real player goes around or does the
      // roadwork. Never force.
      const res = keepKnifeOn
        ? Game.travelTo(pick.x, pick.y)
        : Game.travelTo(pick.x, pick.y, pick.blocked); // legacy: gate-off behavior
      if (Game.over || Game.tbfight) { try { Game.travelTo(hx, hy); } catch (e) {} return 0; }
      if (Game.map.px !== pick.x || Game.map.py !== pick.y) {
        // STONE RUN (food r6): rubble on the path and the knife needs its
        // stone half — do the roadwork (clearRubbleForStone: a day-part,
        // 40 kcal, 1-3 real stone), then walk in. The rubble's stone is why
        // a competent trapper clears paths.
        if (keepKnifeOn && res && res.blockType === 'rubble' && knifeWantsStone(Game, ctx)) {
          if (clearRubbleForStone(Game, ctx, res.x, res.y)) {
            const res2 = Game.travelTo(pick.x, pick.y);
            if (Game.over || Game.tbfight) { try { Game.travelTo(hx, hy); } catch (e) {} return 0; }
            if (Game.map.px !== pick.x || Game.map.py !== pick.y) continue;
          } else continue;
        } else continue;
      }
      let ok = null;
      try { ok = Game.doAction('forage', {}); ctx.forageTrips = (ctx.forageTrips || 0) + 1; } catch (e) {}
      if (ok) { foraged = 1; workTraplineSet(Game, ctx); break; }
    }
    try { Game.travelTo(hx, hy); } catch (e) {}
    return foraged;
  } catch (e) { try { Game.travelTo(Game.map.px, Game.map.py); } catch (e2) {} return 0; }
}

// Donate the haul: identified edible inventory food goes to the pantry.
// (The seed was already sown by trySow; the player keeps a 1-day buffer.)
function donateHaul(Game, ctx) {
  try {
    const s = Game.state.scholar;
    const cap = Game.kcalCap ? Game.kcalCap() : 2400;
    const keep = cap; // one day's buffer stays in the pack
    let packKcal = (s.inventory || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
    const inv = s.inventory || [];
    for (let i = inv.length - 1; i >= 0; i--) {
      const it = inv[i];
      if (!it || (it.kcalEach || 0) <= 0 || it.edible === false) continue;
      const ik = it.kcalEach * (it.units || 1);
      if (packKcal - ik < keep) continue; // keep the buffer
      try { Game.donateToPantry(i); packKcal -= ik; ctx.donated = (ctx.donated || 0) + 1; ctx._lastGiveDay = (Game.state.scholar && Game.state.scholar.day) || 0; } catch (e) {}
    }
  } catch (e) {}
}

// SORT THE HAUL (bal-survival 2026-10-10): foraging yields unknowns, period —
// identification happens at the camp ritual. An honest player sorts the bag
// at haven after a trip: known plants (and field-clicked ones) become real
// food that can be eaten, sown, or donated. Without this the haul is lumps.
// A villager who KNOWS the plants sorts with you — watching a knower teaches
// (faster than solo field-clicks); solo is the fallback.
function sortHaul(Game, ctx) {
  try {
    if (!Game.atCamp || !Game.atCamp()) return 0;
    const stash = (Game.state.scholar || {}).prepStash || [];
    const hasLumps = stash.some(l => l && l.lump && Object.keys(l.lump).length);
    if (!hasLumps) return 0;
    // best sorter: the roster villager who knows the most plants (background
    // knowledge breaks the chicken-and-egg); solo if nobody knows anything.
    let bestVid = null, bestKnown = 0;
    try {
      const v = Game.state.village || {};
      for (const rid of (v.roster || [])) {
        if (rid === Game.villagerId) continue;
        const known = Game.villagerKnowsPlants ? (Game.villagerKnowsPlants(rid) || []).length : 0;
        if (known > bestKnown) { bestKnown = known; bestVid = rid; }
      }
    } catch (e) {}
    let sorted = 0;
    for (let i = stash.length - 1; i >= 0 && sorted < 3; i--) {
      if (stash[i] && stash[i].lump && Object.keys(stash[i].lump).length) {
        try { Game.sortBag(bestVid, i); sorted++; } catch (e) {}
      }
    }
    if (sorted) ctx.sorted = (ctx.sorted || 0) + sorted;
    return sorted;
  } catch (e) { return 0; }
}

function freeVillagers(Game) {
  try {
    const v = Game.state.village || {};
    const asg = v.assignments || {};
    return (v.roster || []).filter(id => {
      if (id === Game.villagerId) return false;
      if (asg[id]) return false;
      try { const p = Game.getPerson(id); return p && !p.dead; } catch (e) { return true; }
    });
  } catch (e) { return []; }
}

function assignBest(Game, task, occWords) {
  try {
    const v = Game.state.village || {};
    const asg = v.assignments || {};
    if (Object.values(asg).some(a => a && a.task === task)) return false;
    const free = freeVillagers(Game);
    if (!free.length) return false;
    const score = (id) => {
      let s = 0;
      try {
        const p = Game.getPerson(id) || {};
        const occ = (p.formerOccupation || '').toLowerCase();
        if (occWords.some(w => occ.includes(w))) s += 2;
        if (Game.villagerCompetence) s += Game.villagerCompetence(id, task);
      } catch (e) {}
      return s;
    };
    free.sort((a, b) => score(b) - score(a));
    try { Game.assignTask(free[0], task, { via: 'in-person' }); return true; }
    catch (e) { return false; }
  } catch (e) { return false; }
}

// assignAnother: like assignBest but allows MULTIPLE villagers on the same
// task (the creek crew, not a lone fisher).
function assignAnother(Game, task, occWords) {
  try {
    const v = Game.state.village || {};
    const free = freeVillagers(Game);
    if (!free.length) return false;
    const score = (id) => {
      let s = 0;
      try {
        const p = Game.getPerson(id) || {};
        const occ = (p.formerOccupation || '').toLowerCase();
        if (occWords.some(w => occ.includes(w))) s += 2;
        if (Game.villagerCompetence) s += Game.villagerCompetence(id, task);
      } catch (e) {}
      return s;
    };
    free.sort((a, b) => score(b) - score(a));
    try { Game.assignTask(free[0], task, { via: 'in-person' }); return true; }
    catch (e) { return false; }
  } catch (e) { return false; }
}

function counterPlay(Game, ctx) {
  try {
    if (!Game.playerAtHaven || !Game.playerAtHaven()) return;
    const day = (Game.state.scholar || {}).day || 0;
    if ((ctx._cpDay || 0) === day) return;
    ctx._cpDay = day;
    // gardens: the answer to thinning ground. Break ground, staff it, sow.
    // Prefer a gardener who KNOWS gardenable plants — their knowledge guides
    // the sowing (villager-guided sowOptions). MAINTAIN the assignment: a
    // garden untended dies, so keep a gardener on duty while plots live.
    try {
      const plots = Game.gardenPlots ? Game.gardenPlots() : [];
      const livePlots = plots.filter(p => p.pid && !p.dead).length;
      const v = Game.state.village || {};
      const hasGardener = Object.values(v.assignments || {}).some(a => a && a.task === 'garden');
      if (plots.length < 6 && (groundsThinning(Game) || plots.length < 2 || (livePlots > 0 && !hasGardener))) {
        // break ground early: 4 plots by day 2-3, the garden needs scale
        // to matter (2 plots is a hobby; 4 is a food leg). 6 was tried:
        // the plot-making ate the gardener's tending time.
        while ((Game.gardenPlots ? Game.gardenPlots().length : 0) < 4) {
          const before = Game.gardenPlots ? Game.gardenPlots().length : 0;
          try { Game.makePlot(); } catch (e) { break; }
          // PROGRESS GUARD (competence panel 2026-10-10): makePlot() returns
          // null without throwing when the player isn't on the haven tile
          // (playerAtHaven is true within 1 node, but makePlot needs the
          // haven tile itself) — a roaming policy (oracle/winseek patrols)
          // interrupted mid-return spins this forever. Break on no progress.
          if ((Game.gardenPlots ? Game.gardenPlots().length : 0) <= before) break;
        }
        if (!hasGardener) {
          const GARDENABLE = new Set(["muscadine","elderberry","blackberry","pawpaw","persimmon","cattail","wild_onion","wood_sorrel","lambs_quarters","chickweed","dandelion","acorn","hickory_nut","walnut"]);
          let knowerAssigned = false;
          try {
            for (const rid of (v.roster || [])) {
              if ((v.assignments || {})[rid]) continue;
              const known = Game.villagerKnowsPlants ? Game.villagerKnowsPlants(rid) : [];
              if (known.some(k => GARDENABLE.has(k))) {
                try { Game.delegateTask(rid, 'garden'); knowerAssigned = true; ctx.gardenStaffed = (ctx.gardenStaffed || 0) + 1; } catch (e) {}
                break;
              }
            }
          } catch (e) {}
          if (!knowerAssigned && assignBest(Game, 'garden', ['farmer', 'gardener', 'botanist', 'herbalist', 'forager', 'cook']))
            ctx.gardenStaffed = (ctx.gardenStaffed || 0) + 1;
        }
      }
      trySow(Game, ctx); // sow from the pack whenever there's an empty plot
    } catch (e) {}
    // fishing: the creek crew. Two fishers from day one — the early deficit
    // kills before the garden matures. Three when the pantry is critical.
    // (Three from day one was tried: more exposure killed more than the
    // extra fish saved. Two is the sweet spot.)
    try {
      const v = Game.state.village || {};
      const pantryKcal = ((v.pantry || [])).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
      const fishers = Object.values(v.assignments || {}).filter(a => a && a.task === 'fish').length;
      const day = (Game.state.scholar || {}).day || 0;
      const wantFishers = pantryKcal < 15000 ? 3 : (pantryKcal < 30000 || day <= 5) ? 2 : 1;
      for (let i = fishers; i < wantFishers; i++) {
        if (assignAnother(Game, 'fish', ['fisherman', 'fishing guide', 'sailor', 'hunter', 'cook']))
          ctx.fishStaffed = (ctx.fishStaffed || 0) + 1;
        else break;
      }
    } catch (e) {}
    // STAFF THE SMOKE RACKS (longsim food 2026-10-11): a competent leader
    // puts a cook on duty when fresh food is about to rot. Anyone can work
    // the racks (rough job: 0.80x, 15d); a real preserver
    // (chef/fisherman/farmer/smoker) is preferred and does it properly.
    // Only free villagers: pulling a fisher off the creek to smoke is the
    // player's call, not the bot's.
    try {
      const v = Game.state.village || {};
      const day = (Game.state.scholar || {}).day || 0;
      const asg = v.assignments || {};
      const hasCook = Object.values(asg).some(a => a && a.task === 'cook');
      if (!hasCook) {
        let freshKcal = 0;
        for (const it of (v.pantry || [])) {
          const sd = it.spoilDay == null ? 99999 : it.spoilDay;
          if ((it.kcalEach || 0) > 0 && (it.units || 0) > 0 && sd - day <= 3 && sd - day >= 0 && it.foodState !== 'preserved')
            freshKcal += (it.kcalEach || 0) * (it.units || 1);
        }
        if (freshKcal > 1500) {
          let best = null, bestSkill = -1;
          for (const id of freeVillagers(Game)) {
            let sk = 0;
            try { sk = Game.specialistSkill ? Game.specialistSkill(Game.getPerson(id) || {}, 'preserver') : 0; }
            catch (e) {}
            if (sk > bestSkill) { bestSkill = sk; best = id; }
          }
          if (best) {
            try { Game.assignTask(best, 'cook', { via: 'in-person' }); ctx.cookStaffed = (ctx.cookStaffed || 0) + 1; }
            catch (e) {}
          }
        }
      }
    } catch (e) {}
    // (trap setting now lives in workTrapline, called from daily)
  } catch (e) {}
}

// WORK THE TRAPLINE (longsim combat r2 2026-10-11): traps sat at 0/0 across
// every measured run — the policy "crafts nothing and invents nothing," so
// the whole craft->set->dawn-check trapline (ecology, shyness, uses, rot,
// carcasses) never ran in a 200-day sim. A competent player who knows the
// snare keeps a small trapline: craft what they know (L2+ reliably; L1 blind
// only when materials are plentiful — 35% odds, materials at real risk), set
// it on wild ground, and the dawn check does the rest. Cap: 2 held traps —
// traps are consumed on set and wear out, so this maintains a working line,
// not a stockpile. The old every-3-days setter in counterPlay is folded in
// here (one place, one cadence).
const TRAPLINE_IDS = ['snare', 'deadfall', 'box_trap', 'spring_snare', 'minnow_trap', 'pit_trap'];
// CLEAN THE CATCH (longsim food r5 2026-10-12): trapped carcasses rot in
// ~2 days ("clean it quickly (knife). It rots fast") and the policy never
// cleaned them — seed 11: 31 catches, 0 cleaned, the meat lost (rotted or
// dropped on player death). A competent player with a cutting tool cleans
// the catch at camp (8 ticks each, first rung of the preservation ladder);
// without a knife the carcass sits, honestly.
function cleanCatch(Game, ctx) {
  if (process.env.COMPETENT_CLEAN_CATCH === '0') return; // before/after harness gate
  try {
    const s = Game.state.scholar; if (!s) return;
    const inv = s.inventory || [];
    let stash = [];
    try { stash = (Game.prepStash && Game.prepStash()) || []; } catch (e) {}
    const nInv = inv.filter(i => i && i.foodState === 'carcass').length;
    const nStash = stash.filter(i => i && i.foodState === 'carcass').length;
    if (!nInv && !nStash) return;
    // KNAP FIRST: the dawn catch says "clean it quickly (knife)" and the
    // knifeless message points at the universal stone-knife recipe (L3 for
    // everyone) — a competent trapper holding stone + vine knaps the edge
    // instead of watching dinner rot. Durable craft, lives in the pack.
    if (!Game.hasCuttingTool || !Game.hasCuttingTool()) {
      const have = (m) => inv.filter(i => i && i.material === m).reduce((t, i) => t + (i.units || 0), 0);
      if (have('stone') >= 1 && have('vine') >= 1) {
        try { if (Game.craft('stone_knife')) ctx.knappedKnife = (ctx.knappedKnife || 0) + 1; } catch (e) {}
      }
    }
    if (!Game.hasCuttingTool || !Game.hasCuttingTool()) return; // still knifeless: the carcass sits, honestly
    // THE KITCHEN COUNTER (food r6 2026-10-12): the homecoming pooling moves
    // unprocessed hauls — carcasses included — from the pack to the prep
    // stash. The r5 policy only swept the pack, so trapped carcasses rotted
    // on the counter untouched (53 catches, 0 cleaned on identical seeds).
    // A competent trapper cleans the counter too — same action, same knife.
    try { Game.cleanCarcass(); ctx.cleanedCarcasses = (ctx.cleanedCarcasses || 0) + nInv; } catch (e) {}
    try {
      const m = stash.filter(i => i && i.foodState === 'carcass').length;
      if (m) {
        Game.cleanCarcass(undefined, stash);
        ctx.cleanedCarcasses = (ctx.cleanedCarcasses || 0) + m;
        ctx.cleanedStash = (ctx.cleanedStash || 0) + m;
      }
    } catch (e) {}
  } catch (e) {}
}

// SET THE LINE WHERE YOU STAND (longsim food r5 2026-10-12): the SET half
// of workTrapline never fired — it ran at day-end, when the player is back
// at haven, and setTrap refuses haven tiles. The traps were crafted and
// never set (2 crafts / 0 sets across 200-day sims). A real player sets the
// trap while OUT on the wild tile, right after working it — the dawn check
// visits every tile's traps, so the line works while you sleep elsewhere.
// This is called from forageTripSeedFirst on the foraged tile, one trap per
// outing (the 2-held cap keeps it a working line, not a stockpile).
// Wire fallback: snare wire in hand sets an improvised 2-use snare with no
// recipe knowledge needed (setTrap's honest-tackle path) — a competent
// player finding wire sets it.
function workTraplineSet(Game, ctx) {
  if (process.env.COMPETENT_TRAPLINE_SET === '0') return; // before/after harness gate
  try {
    const s = Game.state.scholar; if (!s) return;
    const pt = Game.playerTile ? Game.playerTile() : null;
    if (!pt || pt.type === 'haven' || pt.type === 'ruin') return;
    const tools = s.tools || [];
    const trap = tools.find(t => t && TRAPLINE_IDS.includes(t.recipeId));
    if (trap) {
      try { const r = Game.setTrap(trap.recipeId); if (r) ctx.trapsSet = (ctx.trapsSet || 0) + 1; } catch (e) {}
      return;
    }
    // no held trap, but wire in the pack? improvise.
    try {
      if (Game.hasItem && Game.hasItem('snare_wire')) {
        const r = Game.setTrap('snare');
        if (r) ctx.trapsWireSet = (ctx.trapsWireSet || 0) + 1;
      }
    } catch (e) {}
  } catch (e) {}
}

function workTrapline(Game, ctx) {
  try {
    const s = Game.state.scholar; if (!s) return;
    const day = s.day || 0;
    if ((ctx._trapDay || 0) === day) return;
    ctx._trapDay = day;
    // CRAFT: restock the line at day-end (in haven). Setting now happens
    // out on the wild tile via workTraplineSet (food r5 fix — see above).
    try {
      const level = (((Game.state.codex || {}).recipes || {}).snare || {}).level || 0;
      if (level >= 1) {
        const tools = s.tools || [];
        const held = tools.filter(t => t && TRAPLINE_IDS.includes(t.recipeId)).length;
        if (held < 2) {
          const inv = s.inventory || [];
          const have = (m) => inv.filter(i => i && i.material === m).reduce((t, i) => t + (i.units || 0), 0);
          const vine = have('vine'), stick = have('stick');
          const matsOk = level >= 2 ? (vine >= 1 && stick >= 1) : (vine >= 3 && stick >= 3); // blind craft: gamble only what you can lose
          if (matsOk) {
            try { const r = Game.craft('snare'); if (r) ctx.trapsCrafted = (ctx.trapsCrafted || 0) + 1; } catch (e) {}
          }
        }
      }
    } catch (e) {}
  } catch (e) {}
}

// GEAR UP (longsim combat lever 2026-10-11): a competent player equips the
// best weapon and armor they own. The sim policy never equipped anything —
// every measured fight was bare-fisted and unarmored, which made the combat
// death share measure naked-fighter lethality instead of the game's curve.
// This only equips what the world already gave (loot, gifts, finds); it
// crafts nothing and invents nothing.
function gearUp(Game, ctx) {
  try {
    const s = Game.state.scholar;
    if (!s) return;
    const eq = s.equipped || {};
    const inv = s.inventory || [];
    const defOf = (it) => (Game.data.items || []).find(d => d.id === (it.itemId || it.id));
    // AMMO AWARENESS (journey-scale r3 2026-10-11): a ranged weapon with no
    // ammo is a stick you hold wrong — the scale harness watched a player
    // strike a Highbeam Deer 34 rounds for 0 damage ("No arrow left" every
    // round) and die. Never equip a dry ranged weapon while a usable one
    // exists; craft arrows when the best weapon is dry; unequip a dry
    // ranged weapon rather than posing with it.
    const ammoOk = (w) => {
      try { if (!w || !w.ammo) return true; return Game.ammoCount(w.ammo) > 0; }
      catch (e) { return true; }
    };
    const wbonus = (slot) => {
      const w = eq[slot];
      if (!w) return -1;
      const def = (Game.data.items || []).find(d => d.id === (w.itemId || w.id));
      return ((def || {}).weapon || {}).bonus || 0;
    };
    // WEAPON SLOT ROUTING (fix 2026-10-12): route exactly like the inventory
    // UI (app.js data-equip-w) — isRangedWeapon (range > 1, which INCLUDES
    // spears), not the def's flavor type. The old `w.type === 'ranged'` check
    // sent every spear to 'melee', where equip() refuses it ("That goes on
    // your ranged") — so the policy silently fought bare-fisted with spears
    // in the pack, and ctx.geared counted the failed equip as success.
    const weaponSlot = (def, w) => {
      try {
        const g = typeof globalThis !== 'undefined' ? globalThis : {};
        const Seq = (g.Scattering && g.Scattering.equipment) || (g.S && g.S.equipment);
        if (Seq && typeof Seq.isRangedWeapon === 'function' && Seq.isRangedWeapon(def)) return 'ranged';
      } catch (e) {}
      return (w && w.type === 'ranged') ? 'ranged' : 'melee';
    };
    // WEAPON: best bonus among USABLE weapons in inventory -> melee or ranged slot
    let bestI = -1, bestB = -1, bestSlot = 'melee';
    let dryI = -1, dryB = -1, drySlot = 'ranged', dryW = null;
    for (let i = 0; i < inv.length; i++) {
      const def = defOf(inv[i]);
      if (def && def.class === 'weapon') {
        const w = def.weapon || {};
        const b = w.bonus || 0;
        const slot = weaponSlot(def, w);
        if (ammoOk(w)) {
          if (b > bestB) { bestB = b; bestI = i; bestSlot = slot; }
        } else if (b > dryB) { dryB = b; dryI = i; drySlot = slot; dryW = w; }
      }
    }
    if (bestI < 0 && dryI >= 0) {
      // best weapon is dry: a competent player makes arrows (honest fail ok)
      try { if (Game.craft) Game.craft('arrow'); } catch (e) {}
      if (ammoOk(dryW)) { bestI = dryI; bestB = dryB; bestSlot = drySlot; ctx.arrowCraft = (ctx.arrowCraft || 0) + 1; }
      else ctx.dryWeaponDays = (ctx.dryWeaponDays || 0) + 1;
    }
    if (bestI >= 0 && bestB > wbonus(bestSlot)) {
      try { Game.equip(bestI, bestSlot); ctx.geared = (ctx.geared || 0) + 1; } catch (e) {}
    }
    if (bestI < 0) {
      // nothing usable: unequip any dry ranged weapon rather than posing
      try {
        for (const slot of Object.keys(eq)) {
          const cur = eq[slot]; if (!cur) continue;
          const def = (Game.data.items || []).find(d => d.id === (cur.itemId || cur.id));
          const w = def && def.weapon;
          if (w && w.ammo && !ammoOk(w) && Game.unequip) {
            try { Game.unequip(slot); ctx.unarmedDry = (ctx.unarmedDry || 0) + 1; } catch (e2) {}
          }
        }
      } catch (e) {}
    }
    // ARMOR (longsim combat r6 2026-10-12): wear the BEST armor owned, and
    // craft bark armor when the recipe is known. Two blanks closed:
    // (1) the old code equipped the FIRST armor-def item in inventory order
    // only when every armor slot was empty — sims showed a P=2 garment worn
    // over a P=10 bark armor sitting in the pack, never upgrading;
    // (2) the policy never crafted the universally-craftable bark armor
    // (bark 3 + vine 2, no knowledge requirement on the recipe itself —
    // craft() enforces the L1+ knowledge gate, blind L1 attempts are honest
    // 35% fails with materials at risk), so 2/3 sampled seeds fought wave-3
    // — which the design anchors at P=64 — with P~2.
    // Env gate COMPETENT_CRAFT_ARMOR=0 restores the old first-found behavior
    // for before/after measurement.
    const armorCraftOn = process.env.COMPETENT_CRAFT_ARMOR !== '0';
    const protOf = (it) => {
      const def = defOf(it);
      return (def && def.armor) ? (def.armor.protection || 0) : 0;
    };
    const armorSlotFor = (it) => {
      try {
        const def = defOf(it);
        const g = typeof globalThis !== 'undefined' ? globalThis : {};
        const Seq = (g.Scattering && g.Scattering.equipment) || (g.S && g.S.equipment);
        if (Seq && typeof Seq.slotForItem === 'function') {
          const want = Seq.slotForItem(def);
          if (want) return want;
        }
      } catch (e) {}
      return 'armor';
    };
    if (!armorCraftOn) {
      // LEGACY PATH (pre-r6): first armor-def item in inventory order, only
      // when every armor slot is empty. Preserved verbatim for before/after
      // measurement via COMPETENT_CRAFT_ARMOR=0.
      const hasArmor = ['torso', 'armor', 'head', 'body'].some(sl => eq[sl]);
      if (!hasArmor) {
        for (let i = 0; i < inv.length; i++) {
          const def = defOf(inv[i]);
          if (def && def.armor) {
            try { Game.equip(i, 'armor'); ctx.geared = (ctx.geared || 0) + 1; } catch (e) {}
            break;
          }
        }
      }
    } else {
    let wornMax = 0;
    for (const sl of ['torso', 'armor', 'head', 'body']) {
      const cur = eq[sl];
      if (cur) wornMax = Math.max(wornMax, protOf(cur));
    }
    let abestI = -1, abestP = -1;
    for (let i = 0; i < inv.length; i++) {
      const p = protOf(inv[i]);
      if (p > 0 && p > abestP) { abestP = p; abestI = i; }
    }
    if (armorCraftOn && abestI < 0 && wornMax < 10) {
      // Nothing owned and nothing decent worn: craft bark armor when the
      // recipe is known (handling a villager's bark armor teaches L1) and
      // the materials are on hand. craft() enforces every gate itself.
      try {
        const rk = ((Game.state.codex || {}).recipes || {}).bark_armor || {};
        if ((rk.level || 0) >= 1) {
          const have = (m) => inv.filter(it => it && it.material === m)
            .reduce((t, it) => t + (it.units || 0), 0);
          if (have('bark') >= 3 && have('vine') >= 2 && Game.craft) {
            const made = Game.craft('bark_armor');
            if (made) {
              ctx.barkArmorCrafted = (ctx.barkArmorCrafted || 0) + 1;
              // re-scan: craft() replaced scholar.inventory with a new
              // filtered array — rebind the local before indexing into it.
              inv.length = 0;
              Array.prototype.push.apply(inv, Game.state.scholar.inventory || []);
              abestI = -1; abestP = -1;
              for (let i = 0; i < inv.length; i++) {
                const p = protOf(inv[i]);
                if (p > 0 && p > abestP) { abestP = p; abestI = i; }
              }
            }
          }
        }
      } catch (e) {}
    }
    if (abestI >= 0 && abestP > wornMax) {
      try {
        Game.equip(abestI, armorSlotFor(inv[abestI]));
        ctx.geared = (ctx.geared || 0) + 1;
      } catch (e) {}
    }
    } // end armorCraftOn branch
  } catch (e) {}
}

// BEAST TRICKS (longsim combat r5 2026-10-12): the competent policy PLAYS
// monster counters tactically — the Undertale half of the fight. Blank from
// sim-combat-r2: "counters discovered 91–103; policy still doesn't play
// them tactically."
//
// KNOWLEDGE-GATED (Steve: "If you don't know, it doesn't show"): a trick is
// attempted only for a monster type the village has actually learned — fully
// discovered (state.monsterCounters, via trick or beasttricks teaching), or
// hint-revealed in the Monster Codex (slaying a type surfaces counter.hint;
// the player read the carcass entry). Blind types get no tricks.
//
// One attempt per monster per fight; setup-dependent tricks (windup,
// sidestep, recovery) wait for their setup while the policy fights normally
// in between. After the trick fires or proves unavailable, normal fighting
// resumes. Each kind maps to the tb* action checkMonsterCounter observes
// (game.js) — shout / offer_food / wait / move / strike / round_end — so the
// action actually fires the observation.
function beastMidOf(m) { try { return m.monsterId || (m.mdef || {}).id || null; } catch (e) { return null; } }
function beastCounterOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    return (def && def.counter) || null;
  } catch (e) { return null; }
}
function beastTrickKnown(Game, mid) {
  // Full discovery (trick performed or taught at haven): nothing to learn,
  // so no trick is wasted.
  try { return !!((Game.state.monsterCounters || {})[mid]); } catch (e) { return false; }
}
function beastHintKnown(Game, mid) {
  // The codex hint IS knowledge: a slain type shows counter.hint (app.js
  // renders it at codex stage 'slain'), and the player read it.
  try {
    if (beastTrickKnown(Game, mid)) return true;
    const e = ((Game.state.codex || {}).monsters || {})[mid];
    return !!(e && e.stage === 'slain');
  } catch (e) { return false; }
}
// Interior free tiles (1..7): grid edges are the flee-by-barrier (by design)
// — stepping on them can end the fight mid-trick.
function beastFreeTiles(Game, f, px, py) {
  const out = [];
  try {
    const occupied = new Set(
      ((f.fighters || []).filter(x => x && x.alive && x.key !== 'p')).map(x => x.mx + ',' + x.my));
    for (let tx = 1; tx <= 7; tx++) for (let ty = 1; ty <= 7; ty++) {
      if (tx === px && ty === py) continue;
      if (occupied.has(tx + ',' + ty)) continue;
      out.push([tx, ty]);
    }
  } catch (e) {}
  return out;
}
// Closest free tile avoiding a set of "x,y" cells (a telegraph lane).
function beastDodgeTile(Game, f, px, py, avoid) {
  const cands = beastFreeTiles(Game, f, px, py);
  cands.sort((a, b) =>
    (Math.max(Math.abs(a[0] - px), Math.abs(a[1] - py)) - Math.max(Math.abs(b[0] - px), Math.abs(b[1] - py))) ||
    (a[0] - b[0]) || (a[1] - b[1]));
  for (const c of cands) { if (!avoid || !avoid.has(c[0] + ',' + c[1])) return c; }
  return cands[0] || null;
}
// Strike a chosen target: close the distance first (interior tiles only),
// then strike. Returns 'moved', 'struck', or 'stuck'.
function beastStrikeTarget(Game, f, ctx, p, px, py, tgt, endTurn) {
  try {
    const w = (Game.equippedWeapon && Game.equippedWeapon()) || { range: 1 };
    const tmx = tgt.mx != null ? tgt.mx : 4, tmy = tgt.my != null ? tgt.my : 4;
    const d0 = Math.max(Math.abs(tmx - px), Math.abs(tmy - py));
    if (d0 > (w.range || 1)) {
      const occupied = new Set(
        ((f.fighters || []).filter(x => x && x.alive && x.key !== 'p')).map(x => x.mx + ',' + x.my));
      let bx = null, by = null, bd = 1e9;
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
        if (!dx && !dy) continue;
        const cx = tmx + dx, cy = tmy + dy;
        if (cx < 1 || cx > 7 || cy < 1 || cy > 7) continue;
        if (occupied.has(cx + ',' + cy)) continue;
        const dd = Math.max(Math.abs(cx - px), Math.abs(cy - py));
        if (dd < bd) { bd = dd; bx = cx; by = cy; }
      }
      if (bx != null) {
        try { Game.tbPlayerMove(bx, by); } catch (e) {}
        ctx.closed = (ctx.closed || 0) + 1;
      }
      endTurn();
      return 'moved';
    }
  } catch (e) {}
  try { Game.tbPlayerStrike(tgt.key); ctx.struck = (ctx.struck || 0) + 1; } catch (e) {}
  endTurn();
  return 'struck';
}
// Attempt one beast trick this turn. Returns true when the turn is consumed.
function beastTrickPlay(Game, f, ctx, p, endTurn) {
  try {
    if (ctx._btFight !== f) { ctx._btFight = f; ctx._btTried = {}; ctx._btSeq = {}; }
    const tried = ctx._btTried, seq = ctx._btSeq;
    const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
    const live = (f.fighters || []).filter(x => x && x.kind === 'monster' && (x.hp || 0) > 0 && !x.fled);
    const markTypeTried = (mid) => { for (const x of live) { if (beastMidOf(x) === mid) tried[x.key] = 1; } };
    for (const m of live) {
      const mid = beastMidOf(m);
      if (!mid || tried[m.key]) continue;
      const ctr = beastCounterOf(Game, mid);
      if (!ctr || !ctr.kind) { tried[m.key] = 1; continue; }
      // Knowledge gate: the trick is attempted for KNOWN counters — fully
      // discovered (state.monsterCounters) OR hint-revealed (codex 'slain':
      // the player read the carcass entry). Fully-known tricks still pay
      // mechanically (the shout scatters, the sidestep dodges) — a competent
      // player USES a known trick, not just discovers it. Blind types get
      // no tricks.
      if (!beastHintKnown(Game, mid)) continue;
      const kind = ctr.kind;
      const trickDone = () => { ctx.beastTricks = (ctx.beastTricks || 0) + 1; };
      // --- instant tricks: no setup, one action ---
      if (kind === 'shout') {
        // hummice / belltoad: the bellow IS the trick (scatters the choir).
        tried[m.key] = 1;
        try { Game.tbPlayerShout(); } catch (e) {}
        trickDone();
        return true;
      }
      if (kind === 'offer_food') {
        // lockpick_raccoon: buy it off. One bribe per raccoon.
        const inv = (((Game.state || {}).scholar || {}).inventory) || [];
        const hasFood = inv.some(i => i && (i.units || 0) > 0 && (i.kcalEach || 0) > 0);
        tried[m.key] = 1;
        if (hasFood) { try { Game.tbPlayerOfferFood(); } catch (e) {} trickDone(); }
        return true;
      }
      if (kind === 'wait') {
        // heckler / moderator: silence is the verb it can't moderate.
        // tbPlayerWait auto-advances — never endTurn after it.
        tried[m.key] = 1;
        try { Game.tbPlayerWait(); } catch (e) {}
        trickDone();
        return true;
      }
      // --- move tricks ---
      if (kind === 'move_windup') {
        // MOVE while it winds up, don't stare. The windup is the setup.
        if (!m.telegraph) continue;
        const cells = (m.telegraph && Array.isArray(m.telegraph.cells)) ? m.telegraph.cells : [];
        const avoid = new Set(cells.map(c => c.cx + ',' + c.cy));
        const spot = beastDodgeTile(Game, f, px, py, avoid);
        if (!spot) { tried[m.key] = 1; continue; }
        tried[m.key] = 1;
        try { Game.tbPlayerMove(spot[0], spot[1]); } catch (e) {}
        trickDone();
        endTurn();
        return true;
      }
      if (kind === 'move_x2') {
        // Dodge on two consecutive rounds — the sequence IS the trick.
        // ctr.vary (review_drone): never the same net direction twice.
        // ctr.tiles (warranty_caller): cover N tiles this turn.
        const need = (ctr.tiles | 0) || 1;
        const st = seq[m.key] || (seq[m.key] = { n: 0, dir: null, round: -1 });
        if (st.n > 0 && f.round !== st.round + 1) { st.n = 0; st.dir = null; } // sequence broken
        const cands = beastFreeTiles(Game, f, px, py);
        // deterministic: farthest from the beast first, then low coords
        cands.sort((a, b) =>
          (Math.max(Math.abs(b[0] - m.mx), Math.abs(b[1] - m.my)) -
           Math.max(Math.abs(a[0] - m.mx), Math.abs(a[1] - m.my))) ||
          (a[0] - b[0]) || (a[1] - b[1]));
        let pick = null;
        for (const c of cands) {
          let path = null;
          try { path = Game.findPath(px, py, c[0], c[1]) || []; } catch (e) { continue; }
          if (path.length < need) continue;
          let cost = 0;
          try { cost = path.reduce((s, t) => s + Game.tbTerrainCost(t[0], t[1]), 0); } catch (e) { continue; }
          if (cost <= 0 || cost > (p.moveLeft || 0)) continue;
          const dir = Math.sign(c[0] - px) + ',' + Math.sign(c[1] - py);
          if (ctr.vary && st.dir && dir === st.dir) continue;
          pick = [c[0], c[1], dir]; break;
        }
        if (!pick) { tried[m.key] = 1; delete seq[m.key]; continue; }
        try { Game.tbPlayerMove(pick[0], pick[1]); } catch (e) {}
        st.n += 1; st.dir = pick[2]; st.round = f.round;
        trickDone();
        if (st.n >= 2) { tried[m.key] = 1; delete seq[m.key]; }
        endTurn();
        return true;
      }
      if (kind === 'sidestep') {
        // Step OFF the lane: must be IN it to leave it. The telegraph is
        // the setup; without one, fight normally and check again later.
        const tg = m.telegraph;
        const cells = tg && Array.isArray(tg.cells) ? tg.cells : null;
        if (!cells || !cells.length) continue;
        if (!cells.some(c => c.cx === px && c.cy === py)) continue;
        const lane = new Set(cells.map(c => c.cx + ',' + c.cy));
        const spot = beastDodgeTile(Game, f, px, py, lane);
        if (!spot || lane.has(spot[0] + ',' + spot[1])) { tried[m.key] = 1; continue; }
        tried[m.key] = 1;
        try { Game.tbPlayerMove(spot[0], spot[1]); } catch (e) {}
        trickDone();
        endTurn();
        return true;
      }
      if (kind === 'keep_distance') {
        // End the turn AT the trick's distance — no farther. The DISENGAGE
        // rule (game.js tbEndCheck) ends fights vs non-chasers beyond their
        // reach, and it runs BEFORE the round_end counter observation: backing
        // off to the far corner "works" but the trick never registers. The
        // honest play is exactly `need` tiles out.
        // (Engine tension, documented in evidence: bright_idea needs 3 but
        // disengages past 2 — the trick is still the right survival play, it
        // just can't discover via round_end while disengage fires first.)
        const need = (ctr.tiles | 0) || 3;
        const d = Math.max(Math.abs(m.mx - px), Math.abs(m.my - py));
        tried[m.key] = 1;
        if (d !== need) {
          const cands = beastFreeTiles(Game, f, px, py);
          // prefer exactly `need` tiles out; fall back to closest to it
          cands.sort((a, b) => {
            const da = Math.abs(Math.max(Math.abs(a[0] - m.mx), Math.abs(a[1] - m.my)) - need);
            const db = Math.abs(Math.max(Math.abs(b[0] - m.mx), Math.abs(b[1] - m.my)) - need);
            return (da - db) || (a[0] - b[0]) || (a[1] - b[1]);
          });
          for (const c of cands) {
            let path = null;
            try { path = Game.findPath(px, py, c[0], c[1]) || []; } catch (e) { continue; }
            if (!path.length) continue;
            let cost = 0;
            try { cost = path.reduce((s, t) => s + Game.tbTerrainCost(t[0], t[1]), 0); } catch (e) { continue; }
            if (cost <= 0 || cost > (p.moveLeft || 0)) continue;
            try { Game.tbPlayerMove(c[0], c[1]); } catch (e) {}
            break;
          }
        }
        trickDone();
        endTurn();
        return true;
      }
      // --- strike tricks: the strike itself is the observation ---
      if (kind === 'strike_lead' || kind === 'strike_windup' || kind === 'strike_recovery' ||
          kind === 'strike_first' || kind === 'strike_nonhead' || kind === 'fresh_weapon') {
        let tgt = m;
        if (kind === 'strike_lead') {
          // the lead is the first-spawned of its type (counterIsLead logic)
          const same = live.filter(x => beastMidOf(x) === mid);
          tgt = same[0];
          let li = (f.fighters || []).indexOf(tgt);
          for (const x of same) {
            const xi = (f.fighters || []).indexOf(x);
            if (xi < li) { tgt = x; li = xi; }
          }
        } else if (kind === 'strike_windup') {
          if (!m.telegraph) continue; // hit it WHILE it folds
        } else if (kind === 'strike_recovery') {
          // the window: discharged and no new windup yet
          if (!m._counterDischarged || m.telegraph) continue;
        } else if (kind === 'strike_first') {
          if (((f._counterStrikes | 0) !== 0)) { tried[m.key] = 1; continue; }
          if (m.urWalkout) { tried[m.key] = 1; continue; } // behind the picket line: untargetable
        } else if (kind === 'strike_nonhead') {
          const same = live.filter(x => beastMidOf(x) === mid);
          tgt = same.find(x => ((x.segmentIndex | 0) > 0)) || m;
        } else if (kind === 'fresh_weapon') {
          // the understudy must have SEEN a weapon already: the trick is
          // the mid-fight SWITCH, not the opener. usSeen is keyed by the
          // strike-time weapon name (def.name — equip() writes that).
          const seen = (m.usSeen && Object.keys(m.usSeen)) || [];
          if (!seen.length) { tried[m.key] = 1; continue; }
          let cur = 'your hands';
          try { cur = (Game.equippedWeapon() || {}).name || cur; } catch (e) {}
          if (seen.indexOf(cur) >= 0) {
            const inv = (((Game.state || {}).scholar || {}).inventory) || [];
            const defs = ((Game.data || {}).items || []);
            let sw = -1, swSlot = null, wantName = null;
            for (let i = 0; i < inv.length; i++) {
              const it = inv[i]; if (!it) continue;
              const def = defs.find(d => d && d.id === (it.itemId || it.id));
              if (!def || def.class !== 'weapon') continue;
              const nm = def.name || 'weapon';
              if (seen.indexOf(nm) >= 0) continue;
              const wr = def.weapon || {};
              // weapon_split (equipment.js): range > 1 -> ranged slot.
              // equippedWeapon() reads melee first, so a ranged switch needs
              // the melee slot cleared or the strike still uses the old one.
              swSlot = (((wr.range || 1) > 1 || wr.type === 'ranged') ? 'ranged' : 'melee');
              sw = i; wantName = nm; break;
            }
            if (sw < 0) { tried[m.key] = 1; continue; } // no fresh weapon: unavailable
            try { if (swSlot === 'ranged') Game.unequip('melee'); } catch (e) {}
            try { Game.equip(sw, swSlot); } catch (e) {}
            let after = cur;
            try { after = (Game.equippedWeapon() || {}).name || after; } catch (e) {}
            if (after !== wantName) { tried[m.key] = 1; continue; } // switch failed: unavailable
          }
          // else: the current weapon is already fresh to it — strike as-is
        }
        const r = beastStrikeTarget(Game, f, ctx, p, px, py, tgt, endTurn);
        if (r === 'struck') { markTypeTried(mid); trickDone(); }
        return true;
      }
      // Unknown kind: never loop on it.
      tried[m.key] = 1;
    }
  } catch (e) {}
  return false;
}

const competent = {
  id: 'competent',
  desc: 'aware experienced player: learns, teaches, cooks, avoids vectors, fights with advantage',
  setup(Game, ctx) {
    ctx.knownAtStart = Object.keys((Game.state.codex || {}).plants || {}).length;
  },
  upkeep(Game, ctx) {
    cookPack(Game, ctx);
    competentEat(Game);
    drinkSafe(Game, ctx);
    checkTicks(Game, ctx);
    workWater(Game, ctx);
    gearUp(Game, ctx); // equip best weapon/armor owned (longsim combat 2026-10-11)
  },
  daily(Game, ctx) {
    // the honest food run: forage, sort the haul at camp, sow seed first,
    // donate the rest. (Foraging yields unknowns — an honest player sorts.)
    stoneRun(Game, ctx); // deliberate rubble detour when the knife needs stone (food r6)
    if (needTrip(Game, ctx)) forageTripSeedFirst(Game, ctx);
    sortHaul(Game, ctx); // identify the haul at camp — unknowns become food
    keepKnife(Game, ctx); // knap the stone knife FIRST (food r6: wins the vine race)
    cleanCatch(Game, ctx); // clean the trapline's catch before it rots (food r5)
    trySow(Game, ctx); // sow from identified pack plants when plots wait
    donateHaul(Game, ctx); // the rest feeds the village
    counterPlay(Game, ctx); // gardens / fishing / traps when the land thins
    workTrapline(Game, ctx); // craft + set the snare line when known (longsim combat r2)
    // donate surplus beyond a 2-day personal buffer
    try {
      const s = Game.state.scholar;
      const cap = Game.kcalCap();
      if (s.kcal > cap * 1.5) {
        const inv = s.inventory || [];
        for (let i = inv.length - 1; i >= 0; i--) {
          if ((inv[i].kcalEach || 0) > 0 && inv[i].foodState !== 'raw') {
            try { Game.donateToPantry(i); ctx.donated = (ctx.donated || 0) + 1; ctx._lastGiveDay = (Game.state.scholar && Game.state.scholar.day) || 0; break; } catch (e) {}
          }
        }
      }
    } catch (e) {}
    teachRound(Game, ctx);
    // LEARN FIRST: knowledge is the food economy. Until we know 5 plants,
    // triple the conversations — gratitude teaches, and taught plants feed.
    try {
      const known = Object.keys((Game.state.codex || {}).plants || {}).length;
      if (known < 5) { talkRound(Game, ctx); talkRound(Game, ctx); }
    } catch (e) {}
    talkRound(Game, ctx);
    lootCorpses(Game, ctx); // strip the dead after fights
    answerAidBeats(Game, ctx); // the fire network: accept offers, answer begs
    // ASK ABOUT BEAST TRICKS (longsim combat 2026-11): a curious player asks
    // when the village knows something. counterTeachable() gates the topic.
    try {
      if (Game.counterTeachable && Game.askAbout) {
        const teachable = Game.counterTeachable();
        if (teachable) {
          const vv = Game.state.village || {};
          const roster = (vv.roster || []).filter(id => id !== Game.villagerId);
          if (roster.length) {
            const vid = roster[Math.floor(Math.random() * roster.length)];
            const r = Game.askAbout(vid, 'beasttricks');
            if (r && r.taught) ctx.beastTricks = (ctx.beastTricks || 0) + 1;
          }
        }
      }
    } catch (e) {}
    // TAKE THE SYSTEM'S OFFER (coverage 2026-10-09): an experienced player
    // chooses an ability when offered — the sim never did, so ability_granted
    // never fired. Pick the first offer (a competent player takes the gift).
    try {
      const ch = (Game.state.scholar || {}).abilityChoices;
      if (ch && ch.length && Game.chooseAbility) {
        Game.chooseAbility(ch[0].id);
        ctx.choseAbility = (ctx.choseAbility || 0) + 1;
      }
    } catch (e) {}
    const known = Object.keys((Game.state.codex || {}).plants || {}).length;
    ctx.knownPlants = known;
    // EAT THE DAY'S HAUL (longsim food r2 2026-10-11): daily forages AFTER
    // the last upkeep, so the upkeep's competentEat never sees the fresh
    // haul — the player was sleeping (and starving) on foraged food still
    // in the pack. Eat after the day's work, before the harness sleeps.
    competentEat(Game);
  },
  // Fight only with advantage: assess at fight START and walk away from bad
  // ones (an experienced player doesn't take 3:1 fights). Below 35% HP,
  // walk to the edge (flee-by-barrier). Otherwise strike the weakest.
  // BEAST TRICKS (longsim combat r5 2026-10-12) play before the generic
  // strike-the-weakest: the policy fights monster counters tactically.
  fight(Game, ctx) {
    try {
      const f = Game.tbfight;
      if (!f || f.over || !Game.tbIsPlayerTurn()) return false;
      const p = Game.tbFighter('p');
      const hpPct = (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1);
      const endTurn = () => {
        try {
          const q = Game.tbFighter('p');
          q.moveLeft = 0; q.acted = true;
          Game.tbAfterPlayerAction();
        } catch (e) {}
      };
      const flee = () => {
        try {
          const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
          const tx = px <= 4 ? 0 : 8;
          try { Game.tbPlayerMove(tx, py); ctx.fled = (ctx.fled || 0) + 1; } catch (e) {}
        } catch (e) {}
        endTurn();
        return true;
      };
      // NEW-FIGHT ASSESSMENT: don't start fights you can't win.
      if (ctx._fightObj !== f) {
        ctx._fightObj = f;
        try {
          const monsters = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
          let totalMhp = 0, maxWave = 1;
          for (const m of monsters) {
            totalMhp += m.maxHp || m.hp || 0;
            const md = ((Game.data || {}).monsters || []).find(d => d.id === m.monsterId);
            if (md && md.wave) maxWave = Math.max(maxWave, md.wave);
          }
          const pmax = p.maxHp || 100;
          const outmatched = totalMhp > 2.5 * pmax ||
            (maxWave >= 2 && hpPct < 0.7) ||
            hpPct < 0.5;
          if (outmatched && monsters.length) {
            ctx.fledBad = (ctx.fledBad || 0) + 1;
            return flee();
          }
        } catch (e) {}
      }
      if (hpPct < 0.35) {
        // retreat toward the nearest edge — the barrier ends pursuit honestly
        return flee();
      }
      // BEAST TRICKS (longsim combat r5 2026-10-12): play known monster
      // counters tactically before the generic strike-the-weakest. Never
      // overrides the walk-away assessment above.
      try { if (beastTrickPlay(Game, f, ctx, p, endTurn)) return true; } catch (e) {}
      const alive = f.fighters.filter(x => x.kind === 'monster' && (x.hp || 0) > 0);
      if (!alive.length) return false;
      alive.sort((a, b) => (a.hp || 0) - (b.hp || 0));
      const tgt = alive[0];
      const px = p.mx != null ? p.mx : 4, py = p.my != null ? p.my : 4;
      const tmx = tgt.mx != null ? tgt.mx : 4, tmy = tgt.my != null ? tgt.my : 4;
      // CLOSE THE DISTANCE (coverage 2026-10-09): striking out of range is a
      // no-op that never advances the turn. Move adjacent first, then strike.
      // (Grid is 0..8; skip off-grid and monster-occupied tiles.)
      try {
        const w = (Game.equippedWeapon && Game.equippedWeapon()) || { range: 1 };
        const d0 = Math.max(Math.abs(tmx - px), Math.abs(tmy - py));
        if (d0 > (w.range || 1)) {
          const occupied = new Set(
            f.fighters.filter(x => x.alive && x.key !== 'p').map(x => x.mx + ',' + x.my));
          let bx = null, by = null, bd = 1e9;
          for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
            if (!dx && !dy) continue;
            const cx = tmx + dx, cy = tmy + dy;
            if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
            if (occupied.has(cx + ',' + cy)) continue;
            const dd = Math.max(Math.abs(cx - px), Math.abs(cy - py));
            if (dd < bd) { bd = dd; bx = cx; by = cy; }
          }
          if (bx != null) {
            try { Game.tbPlayerMove(bx, by); } catch (e) {}
            ctx.closed = (ctx.closed || 0) + 1;
          }
          endTurn();
          return true;
        }
      } catch (e) {}
      // STRIKE THEN END TURN (coverage 2026-10-09): tbPlayerStrike leaves
      // moveLeft > 0, so the turn never auto-advances — the policy spun on
      // "Already acted" forever, freezing the game clock. End explicitly.
      try { Game.tbPlayerStrike(tgt.key); ctx.struck = (ctx.struck || 0) + 1; } catch (e) {}
      endTurn();
      return true;
    } catch (e) { return false; }
  },
};

module.exports = { competent, workTrapline, workTraplineSet, forageTripSeedFirst, sortHaul, donateHaul, needTrip, keepKnife, stoneRun, clearRubbleForStone };
