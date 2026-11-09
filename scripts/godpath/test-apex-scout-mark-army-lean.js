#!/usr/bin/env node
// OVE-132 — Apex Predator army scout-mark lean via resolveOneAssignment.
//
// god.scale.army: "Scouts follow your marks."
// Settlement: scout assignment honors Game.apexScoutMarkLeanFor when an
// ascended Apex holder is active — higher shared-reveal chance on the haven
// scout ring + follow-marks beat when markSeen fires. Seeded proof + failing
// control that strips the helper. Preserves Garden/Voice/Market/All-Seeing
// army + contest leans. Muse off.
'use strict';
const K = require('./lib');
const T = K.reporter('apex-scout-mark-army-lean');

(async () => {
  const Game = await K.load({ seed: Number(process.env.SEED || 132) });
  const S = globalThis.Scattering;
  const GH = S.Godhood;
  K.newRun(Game);
  Game.state.systemArrived = true;
  const s = Game.state.scholar;
  const v = Game.state.village;
  const quiet = (fn) => { const l = K.captureSays(Game); try { return fn(); } finally { l.restore(); } };
  function clearGods() { s.godhood = { recognized: {}, active: [] }; v.npcGodhood = {}; }
  function ascendPlayer(id) {
    s.godhood = { recognized: {}, active: [] };
    quiet(() => GH.recognitionCeremony(Game, id));
    return Game.holderGod('player');
  }
  function ascendVillager(vid, id) {
    Game.getPerson(vid).dead = false;
    if (!v.roster.includes(vid)) v.roster.push(vid);
    (v.health || (v.health = {}))[vid] = 100;
    v.npcGodhood = v.npcGodhood || {};
    delete v.npcGodhood[vid];
    quiet(() => GH.villagerRecognitionCeremony(Game, vid, id));
    return Game.holderGod(vid);
  }

  const others = (v.roster || []).filter(id => id !== Game.villagerId);
  const scoutVid = others[0];
  T.ok('fixture scout villager', !!scoutVid, others.length);
  // Keep trust/competence ordinary so base reveal chance stays 0.5*eff.
  try {
    const person = Game.getPerson(scoutVid);
    if (person) person.job = 'cook';
    (v.trust || (v.trust = {}))[scoutVid] = 50;
  } catch (e) {}

  const play = Game.godPlay('apex_predator') || {};
  const leanVal = (typeof play.scoutMarkLean === 'number' && play.scoutMarkLean > 0)
    ? play.scoutMarkLean : 1;

  function fogScoutRing() {
    const hx = v.px ?? 4, hy = v.py ?? 4;
    let blank = 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const nx = hx + dx, ny = hy + dy;
      if (nx < 0 || nx > 8 || ny < 0 || ny > 8) continue;
      const t = Game.tileAt(nx, ny);
      if (!t) continue;
      t.revealed = false;
      blank++;
    }
    s.seenTiles = {};
    return blank;
  }

  function countShared() {
    const seen = s.seenTiles || {};
    let n = 0;
    for (const k of Object.keys(seen)) {
      if (seen[k] && seen[k].k === 's') n++;
    }
    return n;
  }

  function countRevealedRing() {
    const hx = v.px ?? 4, hy = v.py ?? 4;
    let n = 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const nx = hx + dx, ny = hy + dy;
      if (nx < 0 || nx > 8 || ny < 0 || ny > 8) continue;
      const t = Game.tileAt(nx, ny);
      if (t && t.revealed) n++;
    }
    return n;
  }

  function runScout() {
    const eff = Game.villagerCompetence(scoutVid, 'scout') * Game.trustTaskMult(scoutVid);
    const baseChance = Math.min(1, 0.5 * eff);
    // Roll equals base chance → fails strict `<` without lean; passes with lean*0.5.
    const roll = baseChance;
    const orig = Math.random;
    Math.random = function () { return roll; };
    const said = [];
    const osay = Game.say;
    Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return osay.call(this, t); };
    fogScoutRing();
    let err = null;
    try {
      Game.resolveOneAssignment(scoutVid, { task: 'scout' });
    } catch (e) { err = e; }
    finally {
      Game.say = osay;
      Math.random = orig;
    }
    return {
      err,
      eff,
      baseChance,
      lean: Game.apexScoutMarkLeanFor ? Game.apexScoutMarkLeanFor() : 0,
      revealed: countRevealedRing(),
      shared: countShared(),
      said,
      followLine: said.some(t => /Scouts follow your marks/i.test(t)),
      mappedLine: said.find(t => /scouts the land: mapped/i.test(t)) || '',
    };
  }

  T.section('data + wiring');
  {
    clearGods();
    T.ok('apexScoutMarkLeanFor is exported', typeof Game.apexScoutMarkLeanFor === 'function');
    T.ok('play.scoutMarkLean is a positive number', typeof play.scoutMarkLean === 'number' && play.scoutMarkLean > 0,
      play.scoutMarkLean);
    T.ok('no lean without an Apex holder', Game.apexScoutMarkLeanFor() === 0);
    T.ok('Terms kcal untouched (ambush 120)',
      Array.isArray(play.actions) && play.actions.some(a => a.id === 'terms_ambush' && a.cost && a.cost.kcal === 120));
    T.ok('ambushMult untouched', play.ambushMult === 3);
    T.ok('rangeDist untouched', play.rangeDist === 4);
    T.ok('Garden muster feed still exported', typeof Game.gardenMusterFeedFor === 'function');
    T.ok('Market outfit lean still exported', typeof Game.marketOutfitLeanFor === 'function');
    T.ok('All-Seeing council lean still exported', typeof Game.allSeeingCouncilLeanFor === 'function');
    T.ok('Voice Be Heard army helper still exported', typeof Game.voiceDeliverAllied === 'function');
  }

  T.section('CONTROL: scout without Apex → no follow lean');
  {
    clearGods();
    const out = runScout();
    T.ok('CONTROL: no error', !out.err, out.err && String(out.err.message || out.err));
    T.ok('CONTROL: helper lean 0', out.lean === 0, out.lean);
    T.ok('CONTROL: base chance in (0,1]', out.baseChance > 0 && out.baseChance <= 1, out.baseChance);
    T.ok('CONTROL: no tiles revealed at base-roll', out.revealed === 0, out.revealed);
    T.ok('CONTROL: no shared markSeen', out.shared === 0, out.shared);
    T.ok('CONTROL: no follow-marks line', out.followLine === false);
    T.ok('CONTROL: mapped 0 line', /mapped 0 new areas/i.test(out.mappedLine), out.mappedLine);
  }

  T.section('TREATMENT: Apex holder leans scout marks');
  {
    clearGods();
    T.ok('player ascends Apex', ascendPlayer('apex_predator') === 'apex_predator');
    T.ok('helper returns scoutMarkLean', Game.apexScoutMarkLeanFor() === leanVal, Game.apexScoutMarkLeanFor());
    const out = runScout();
    T.ok('TREATMENT: no error', !out.err, out.err && String(out.err.message || out.err));
    T.ok('TREATMENT: helper lean matches play', out.lean === leanVal, out.lean);
    T.ok('TREATMENT: tiles revealed (>0)', out.revealed > 0, out.revealed);
    T.ok('TREATMENT: shared markSeen matches reveals', out.shared === out.revealed, out.shared + '/' + out.revealed);
    T.ok('TREATMENT: follow-marks line', out.followLine === true, out.said.join(' | ').slice(0, 280));
    T.ok('TREATMENT: mapped N line names reveals',
      new RegExp('mapped ' + out.revealed + ' new area', 'i').test(out.mappedLine), out.mappedLine);
  }

  T.section('FAILING CONTROL: strip apexScoutMarkLeanFor');
  {
    clearGods();
    ascendPlayer('apex_predator');
    const hook = Game.apexScoutMarkLeanFor;
    Game.apexScoutMarkLeanFor = function () { return 0; };
    let out;
    try {
      out = runScout();
    } finally {
      Game.apexScoutMarkLeanFor = hook;
    }
    T.ok('FAILING CONTROL: lean collapses in settlement', out.revealed === 0, out.revealed);
    T.ok('FAILING CONTROL: no shared marks', out.shared === 0, out.shared);
    T.ok('FAILING CONTROL: no follow-marks line', out.followLine === false);
    T.ok('FAILING CONTROL: player is still Apex (ascended alone is not army LIVE)',
      Game.holderGod('player') === 'apex_predator');
    T.ok('FAILING CONTROL: live helper still returns lean when restored',
      Game.apexScoutMarkLeanFor() === leanVal, Game.apexScoutMarkLeanFor());
  }

  T.section('non-Apex holders get no scout-mark lean');
  {
    const gods = ['living_garden', 'voice_of_the_relay', 'unkillable', 'all_seeing', 'market_god', 'one_person_army'];
    for (const gid of gods) {
      clearGods();
      ascendPlayer(gid);
      T.ok(gid + ' helper returns 0', Game.apexScoutMarkLeanFor() === 0);
      const out = runScout();
      T.ok(gid + ': no reveals at base-roll', out.revealed === 0, out.revealed);
      T.ok(gid + ': no follow-marks line', out.followLine === false);
    }
  }

  T.section('NPC Apex holder leans scout marks');
  {
    clearGods();
    const npc = others[1] || others[0];
    T.ok('fixture villager for NPC Apex', !!npc, others.length);
    T.ok('villager ascends Apex', ascendVillager(npc, 'apex_predator') === 'apex_predator');
    T.ok('NPC Apex helper returns lean', Game.apexScoutMarkLeanFor() === leanVal,
      Game.apexScoutMarkLeanFor());
    const out = runScout();
    T.ok('NPC Apex: tiles revealed', out.revealed > 0, out.revealed);
    T.ok('NPC Apex: shared markSeen', out.shared === out.revealed);
    T.ok('NPC Apex: follow-marks line', out.followLine === true);
  }

  T.section('prior army + contest leans preserved');
  {
    clearGods();
    delete v.harvestDay;
    const day = s.day || 1;
    const cookfight = { id: 'cookfight', name: 'Cooking With Teeth', cat: 'weird', risk: 'medium' };
    const impress = { id: 'impress', name: 'Impress Us', cat: 'weird', risk: 'medium' };
    const drop = { id: 'drop', name: 'The Drop', cat: 'endurance', risk: 'hard' };
    const whoate = { id: 'whoate', name: 'Who Ate It', cat: 'detective', risk: 'medium' };
    const price = { id: 'price', name: 'The Price', cat: 'moot', risk: 'extreme' };
    const pit = { id: 'pit', name: 'The Pit', cat: 'blood', risk: 'hard' };

    ascendPlayer('living_garden');
    v.harvestDay = day;
    T.ok('Garden muster feed still covers need', Game.gardenMusterFeedFor(2000) === 2000);
    T.ok('Garden feast lean still fires for cookfight', Game.gardenFeastLeanFor(Game.villagerId, cookfight) > 0);
    delete v.harvestDay;

    clearGods();
    ascendPlayer('voice_of_the_relay');
    T.ok('Voice performance lean still fires for impress', Game.voicePerformanceLeanFor(Game.villagerId, impress) > 0);
    T.ok('Voice army delivery still callable', typeof Game.voiceDeliverAllied === 'function');

    clearGods();
    ascendPlayer('unkillable');
    T.ok('Unkillable endurance lean still fires for drop', Game.unkillableEnduranceLeanFor(Game.villagerId, drop) > 0);

    clearGods();
    ascendPlayer('all_seeing');
    T.ok('All-Seeing strategy lean still fires for whoate', Game.allSeeingStrategyLeanFor(Game.villagerId, whoate) > 0);
    T.ok('All-Seeing council lean still returns for All-Seeing holder', Game.allSeeingCouncilLeanFor() > 0);

    clearGods();
    ascendPlayer('market_god');
    T.ok('Market sponsor lean still fires for price', Game.marketSponsorLeanFor(Game.villagerId, price) > 0);
    T.ok('Market outfit lean still returns for Market holder', Game.marketOutfitLeanFor() > 0);

    clearGods();
    ascendPlayer('one_person_army');
    T.ok('OPA blood lean still fires for pit', Game.opaBloodLeanFor(Game.villagerId, pit) > 0);

    clearGods();
    ascendPlayer('apex_predator');
    T.ok('Apex scout helper does not grant All-Seeing council lean', Game.allSeeingCouncilLeanFor() === 0);
    T.ok('Apex scout helper does not grant Market outfit lean', Game.marketOutfitLeanFor() === 0);
  }

  T.done();
})().catch(e => { console.error(e && e.stack || e); process.exitCode = 1; });
