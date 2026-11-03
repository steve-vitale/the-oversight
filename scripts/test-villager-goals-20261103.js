'use strict';
// test-villager-goals-20261103.js — villager goals system proof (goals-sys).
// One fixture, one process per invocation (harness rule: never two harnesses
// in one node process). Usage:
//   node scripts/test-villager-goals-20261103.js weights
//   node scripts/test-villager-goals-20261103.js gates
//   node scripts/test-villager-goals-20261103.js choices on|off
// Prints one JSON line per section. Exit 0 = all asserted legs pass
// (skipped legs reported, never counted as passes), 2 = setup could not
// produce the fixture, 1 = an asserted leg failed or a harness error.
// No repo writes: prints only.
const path = require('path');
const repo = path.join(__dirname, '..');
const section = process.argv[2];
const arm = process.argv[3] || 'on';
const { loadGame, setupGame } = require(path.join(repo, 'scripts', 'sim-harness'));

function out(o) { console.log(JSON.stringify(o)); }
function fail(msg, extra) { out(Object.assign({ section, pass: false, fail: msg }, extra || {})); process.exit(1); }

(async () => {
  const { Game } = await loadGame({ seed: 98901, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  if (typeof Game.vgoalWeights !== 'function' || typeof Game.vgoalGate !== 'function' ||
    typeof Game.vgoalBiasCands !== 'function' || typeof Game.objPick !== 'function') {
    out({ section, skip: 'goals API or objPick missing' }); process.exit(2);
  }
  const v = Game.state.village || {};
  const hx = (v.px == null ? 4 : v.px), hy = (v.py == null ? 4 : v.py);
  const day = (Game.state.scholar || {}).day || 0;
  const npcs = (v.roster || []).filter(id => id !== Game.villagerId);
  const alive = npcs.filter(id => { try { const p = Game.getPerson(id); return p && !p.dead; } catch (e) { return false; } });
  if (alive.length < 2) { out({ section, skip: 'roster<2' }); process.exit(2); }
  const vid = alive[0], ally = alive[1];
  const person = id => { try { return Game.getPerson(id); } catch (e) { return null; } };
  const setNode = (id, x, y) => { try { Game.npcSetNode(id, x, y); } catch (e) {} };
  const setNeeds = (id, o) => {
    try {
      const n = Game.npcNeeds(id);
      if (!n) return false;
      Object.assign(n, o);
      const back = Game.npcNeeds(id);
      for (const k of Object.keys(o)) if (back[k] !== o[k]) return false;
      return true;
    } catch (e) { return false; }
  };
  const setGoal = (id, g) => {
    const p = person(id); if (!p) return false;
    p.goal = g;
    try { return Game.npcGoal(id) === g; } catch (e) { return false; }
  };
  const setTemp = (id, t) => {
    const p = person(id); if (!p) return false;
    p.personality = p.personality || {}; p.personality.temperament = t;
    try { return Game.npcTemper(id) === t; } catch (e) { return false; }
  };
  const occByLean = want => {
    try {
      const occs = (Game.data.characterGen || {}).occupations || [];
      const list = Array.isArray(occs) ? occs : Object.keys(occs).map(k => Object.assign({ id: k }, occs[k]));
      for (const o of list) {
        const lean = (typeof Game.occupationLean === 'function') ? (Game.occupationLean(o.id) || {}) : {};
        let top = null, topXp = -1;
        for (const tr of Object.keys(lean)) if (lean[tr] > topXp) { topXp = lean[tr]; top = tr; }
        if (top === want) return o.id;
      }
    } catch (e) {}
    return null;
  };
  const setOcc = (id, occId) => {
    const p = person(id); if (!p || !occId) return false;
    p.occupationId = occId;
    try {
      const lean = Game.occupationLean(occId) || {};
      return Object.keys(lean).length > 0;
    } catch (e) { return false; }
  };
  const stripGear = id => {
    const p = person(id); if (!p) return;
    p.items = []; p.stashed = []; p.equipped = {};
  };
  const giveGear = id => {
    const p = person(id); if (!p) return false;
    const items = Game.data.items || [];
    const weapon = items.find(d => d && d.weapon && d.weapon.bonus > 0);
    const armor = items.find(d => d && d.armor && d.armor.protection > 0);
    if (!weapon || !armor) return false;
    p.items = [];
    p.equipped = { melee: { itemId: weapon.id }, torso: { itemId: armor.id } };
    return true;
  };
  const trustBoth = (a, b, val) => {
    const pa = person(a), pb = person(b);
    if (pa) { pa.trust = pa.trust || {}; pa.trust[b] = val; }
    if (pb) { pb.trust = pb.trust || {}; pb.trust[a] = val; }
    v.trust = v.trust || {}; v.trust[a] = val; v.trust[b] = val;
  };
  const coLocate = () => {
    try {
      const n = Game.npcNode(vid);
      if (n) setNode(ally, n.nx, n.ny);
    } catch (e) {}
  };
  const addLore = () => {
    try {
      if (typeof Game.recordVillageLore === 'function') {
        Game.recordVillageLore(vid, 'test-village', { how: 'visit', day });
        if ((Game.villageLoreOf(vid) || {})['test-village']) return true;
      }
    } catch (e) {}
    try {
      v.villageLore = v.villageLore || {}; v.villageLore[vid] = v.villageLore[vid] || {};
      v.villageLore[vid]['test-village'] = { how: 'visit', day };
      return !!((Game.villageLoreOf(vid) || {})['test-village']);
    } catch (e) { return false; }
  };
  const addFought = () => {
    try {
      const a = Game.agencyState ? Game.agencyState() : null;
      if (!a) return false;
      a.know = a.know || {}; a.know[vid] = a.know[vid] || {}; a.know[vid].fought = a.know[vid].fought || [];
      a.know[vid].fought.push('test_monster');
      return a.know[vid].fought.length > 0;
    } catch (e) { return false; }
  };
  // Open every gate that can be opened, so weight comparisons are not
  // vacuous (a gated-to-zero goal reads the same in every variant).
  const openAll = () => {
    coLocate(); trustBoth(vid, ally, 50); addLore(); addFought(); stripGear(vid);
    setNeeds(vid, { hunger: 20, fear: 10, social: 40, energy: 90 });
  };

  if (section === 'weights') {
    const legs = [];
    const leg = (name, ok, detail) => legs.push(Object.assign({ name, pass: !!ok }, detail || {}));
    openAll();
    if (!setGoal(vid, 'protect') || !setTemp(vid, 'steady')) { out({ section, skip: 'goal/temp mutation did not read back' }); process.exit(2); }
    const wProtect = Game.vgoalWeights(vid);
    if (!setGoal(vid, 'prove')) { out({ section, skip: 'goal mutation did not read back' }); process.exit(2); }
    const wProve = Game.vgoalWeights(vid);
    leg('goal-label', wProtect.safety > wProve.safety && wProve.bank_veterans > wProtect.bank_veterans,
      { protect: { safety: wProtect.safety, veterans: wProtect.bank_veterans }, prove: { safety: wProve.safety, veterans: wProve.bank_veterans } });
    setGoal(vid, 'prove');
    if (!setTemp(vid, 'cautious')) { out({ section, skip: 'temp mutation did not read back' }); process.exit(2); }
    const wCautious = Game.vgoalWeights(vid);
    if (!setTemp(vid, 'bold')) { out({ section, skip: 'temp mutation did not read back' }); process.exit(2); }
    const wBold = Game.vgoalWeights(vid);
    leg('temperament', wCautious.safety > wBold.safety && wBold.bank_veterans > wCautious.bank_veterans,
      { cautious: { safety: wCautious.safety, veterans: wCautious.bank_veterans }, bold: { safety: wBold.safety, veterans: wBold.bank_veterans } });
    setTemp(vid, 'steady'); setGoal(vid, 'prove');
    const combatOcc = occByLean('combat'), socialOcc = occByLean('social');
    if (!combatOcc || !socialOcc || !setOcc(vid, combatOcc)) {
      legs.push({ name: 'occupation', skip: 'no combat/social occupation found' });
    } else {
      const wCombat = Game.vgoalWeights(vid);
      if (!setOcc(vid, socialOcc)) {
        legs.push({ name: 'occupation', skip: 'occ mutation did not read back' });
      } else {
        const wSocial = Game.vgoalWeights(vid);
        leg('occupation', wCombat.bank_veterans > wSocial.bank_veterans && wSocial.bonds > wCombat.bonds,
          { combat: { veterans: wCombat.bank_veterans, bonds: wCombat.bonds }, social: { veterans: wSocial.bank_veterans, bonds: wSocial.bonds } });
      }
    }
    const fails = legs.filter(l => l.pass === false);
    out({ section, legs, pass: fails.length === 0 && legs.some(l => l.pass) });
    process.exit(fails.length ? 1 : (legs.some(l => l.pass) ? 0 : 2));
  }

  if (section === 'gates') {
    const legs = [];
    const leg = (name, closed, opened, note) => {
      const pass = (opened === null) ? null : (closed === 0 && opened > 0);
      legs.push({ name, closed, opened, pass, note: note || undefined });
    };
    // Start from a closed slate: no allies arranged, no lore, no fought,
    // no trust, fresh village (system not arrived -> knowledge want null).
    const p = person(vid); if (p) { p.trust = {}; }
    try { if (v.assignments) for (const k of Object.keys(v.assignments)) delete v.assignments[k]; } catch (e) {}
    try { Game._outdoorCrew = []; } catch (e) {}
    // party_up — closed means NO sensed ally: EVERY other villager moved
    // far away, trust below the sensing floor, no assignments, no crew
    // snapshot. (A fresh village starts everyone co-located at Haven, so
    // moving just one ally leaves the rest sensed — the first two versions
    // of this leg proved exactly that.)
    for (const id of alive) { if (id !== vid) { setNode(id, hx + 3, hy + 3); trustBoth(vid, id, 10); } }
    const partyClosed = Game.vgoalGate(vid, 'party_up');
    coLocate(); trustBoth(vid, ally, 50);
    const partyOpened = Game.vgoalGate(vid, 'party_up');
    leg('party_up', partyClosed, partyOpened);
    // gear_up
    stripGear(vid);
    const gearOpen = Game.vgoalGate(vid, 'gear_up');
    const geared = giveGear(vid);
    const gearClosed = geared ? Game.vgoalGate(vid, 'gear_up') : null;
    legs.push({ name: 'gear_up', closed: gearClosed, opened: gearOpen, pass: geared ? (gearOpen > 0 && gearClosed === 0) : null, note: geared ? undefined : 'no weapon/armor defs found' });
    stripGear(vid);
    // bank_veterans
    const vetClosed = Game.vgoalGate(vid, 'bank_veterans');
    const fought = addFought();
    const vetOpened = fought ? Game.vgoalGate(vid, 'bank_veterans') : null;
    if (fought) {
      Game.state.waveKillLog = Game.state.waveKillLog || [];
      Game.state.waveKillLog.push({ d: day, mid: 'test_monster', w: 4, by: vid, via: 'wild', trick: null });
    }
    const vetSatisfied = fought ? Game.vgoalGate(vid, 'bank_veterans') : null;
    legs.push({ name: 'bank_veterans', closed: vetClosed, opened: vetOpened, satisfied: vetSatisfied,
      pass: fought ? (vetClosed === 0 && vetOpened > 0 && vetSatisfied === 0) : null,
      note: fought ? undefined : 'agency know store unavailable' });
    // build_standing
    const standClosed = Game.vgoalGate(vid, 'build_standing');
    const lored = addLore();
    const standOpened = lored ? Game.vgoalGate(vid, 'build_standing') : null;
    legs.push({ name: 'build_standing', closed: standClosed, opened: standOpened,
      pass: lored ? (standClosed === 0 && standOpened > 0) : null,
      note: lored ? undefined : 'lore write did not read back' });
    // food_security (graded gate: hunger forces 1, low hunger + rich pantry gives 0.4)
    setNeeds(vid, { hunger: 80, fear: 10, social: 40, energy: 90 });
    const foodHigh = Game.vgoalGate(vid, 'food_security');
    setNeeds(vid, { hunger: 10, fear: 10, social: 40, energy: 90 });
    let pantry = null;
    try { pantry = (typeof Game.pantryDaysEstimate === 'function') ? Game.pantryDaysEstimate() : null; } catch (e) {}
    const foodLow = Game.vgoalGate(vid, 'food_security');
    legs.push({ name: 'food_security', high: foodHigh, low: foodLow, pantryDays: pantry,
      pass: foodHigh === 1 && (pantry != null && pantry >= 3 ? foodLow === 0.4 : true),
      note: (pantry != null && pantry >= 3) ? undefined : 'pantry-days low leg skipped (pantry < 3d)' });
    // bonds
    if (p) { p.trust = {}; }
    const bondsClosed = Game.vgoalGate(vid, 'bonds');
    trustBoth(vid, ally, 50);
    const bondsOpened = Game.vgoalGate(vid, 'bonds');
    leg('bonds', bondsClosed, bondsOpened);
    // knowledge (null side solid; positive side only if the fixture yields a want)
    const knowClosed = Game.vgoalGate(vid, 'knowledge');
    let knowOpened = null, knowNote = 'no knowledge want produced by fixture';
    try {
      Game.state.systemArrived = true;
      const x = Game.npcXp ? Game.npcXp(vid) : null;
      if (x) x.lastSeek = -99;
      const want = (typeof Game.villagerWantsKnowledge === 'function') ? Game.villagerWantsKnowledge(vid) : null;
      if (want != null) { knowOpened = Game.vgoalGate(vid, 'knowledge'); knowNote = undefined; }
    } catch (e) {}
    legs.push({ name: 'knowledge', closed: knowClosed, opened: knowOpened,
      pass: knowOpened != null ? (knowClosed === 0 && knowOpened > 0) : null, note: knowNote });
    // safety (graded gate: fear forces 1, gossip forces 1, baseline 0.3)
    setNeeds(vid, { hunger: 20, fear: 10, social: 40, energy: 90 });
    const safeBase = Game.vgoalGate(vid, 'safety');
    setNeeds(vid, { hunger: 20, fear: 80, social: 40, energy: 90 });
    const safeFear = Game.vgoalGate(vid, 'safety');
    setNeeds(vid, { hunger: 20, fear: 10, social: 40, energy: 90 });
    v.gossip = v.gossip || [];
    v.gossip.push({ action: 'raid', day, heard: [vid] });
    const safeGossip = Game.vgoalGate(vid, 'safety');
    legs.push({ name: 'safety', base: safeBase, fear: safeFear, gossip: safeGossip,
      pass: safeBase === 0.3 && safeFear === 1 && safeGossip === 1 });
    const fails = legs.filter(l => l.pass === false);
    out({ section, legs, pass: fails.length === 0 && legs.some(l => l.pass) });
    process.exit(fails.length ? 1 : (legs.some(l => l.pass) ? 0 : 2));
  }

  if (section === 'choices') {
    if (arm === 'off') Game.vgoalDisabled = true;
    // Fixture: belong + warm + social occupation, all perception gates open,
    // needs neutral, knowledge want null (fresh village: system not arrived).
    if (!setGoal(vid, 'belong') || !setTemp(vid, 'warm')) { out({ section, arm, skip: 'goal/temp mutation did not read back' }); process.exit(2); }
    const socialOcc = occByLean('social');
    if (socialOcc) setOcc(vid, socialOcc);
    openAll();
    try {
      if (Game.villagerWantsKnowledge(vid) != null) { out({ section, arm, skip: 'fixture has a knowledge want (hard SEEK gate)' }); process.exit(2); }
    } catch (e) {}
    const N = 200, counts = {};
    let hardGated = 0;
    for (let i = 0; i < N; i++) {
      let o = null;
      try { o = Game.objPick(vid, hx, hy); } catch (e) { out({ section, arm, skip: 'objPick threw: ' + (e && e.message) }); process.exit(2); }
      if (!o || !o.kind) { out({ section, arm, skip: 'objPick returned no kind' }); process.exit(2); }
      if (o.kind === 'REST' || o.kind === 'EAT' || o.kind === 'LEAVE') hardGated++;
      counts[o.kind] = (counts[o.kind] || 0) + 1;
    }
    if (hardGated > N * 0.5) { out({ section, arm, skip: 'fixture hard-gated on ' + hardGated + '/' + N + ' calls' }); process.exit(2); }
    out({ section, arm, counts, total: N, hardGated, pass: true });
    process.exit(0);
  }

  out({ section, skip: 'unknown section (weights|gates|choices)' });
  process.exit(2);
})().catch(e => { out({ section, error: String((e && e.stack) || e) }); process.exit(1); });
