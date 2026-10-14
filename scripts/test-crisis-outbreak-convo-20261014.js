#!/usr/bin/env node
// test-crisis-outbreak-convo-20261014.js — PROOF for the crisis-leg r8 blanks
// (journey-crisis r8, 2026-10-14).
//
// BEFORE (sense-tested on 4 outbreak sims + full transcripts):
//  F1. The outbreak was conversationally invisible: 5 villagers down with gut
//      rot and healthy villagers' ask:lately talked monster names (naming
//      debate outranked a 3-sick/2-dead outbreak) or creek concerts —
//      t2LatelyEvent had no outbreak kind at all.
//  F2. convoFindFavorNeed checked hunger>70 BEFORE sickness: the sick rest by
//      the fire (r3 F1), hunger climbs past 70, so hungry+sick villagers got
//      food_share wants and never mentioned the gut rot doubling them over.
//  F3. The alive:want resume choice re-ran the want OPENER instead of engaging
//      the want: "Is there something you need?" -> three "you'll never guess"
//      hooks, zero news delivered (hook promise violated; want arc says
//      0 selected -> 1 surfaced -> 2 engaged).
//
// AFTER:
//  F1. New 'outbreak' lately-kind (>=2 sick): severe outbreaks (weight>=5,
//      sev2+ counts double) displace the naming debate; fresh grief and the
//      mantle still outrank; symptom-gated lines (never disease true names).
//  F2. sev2+ sickness outranks hunger in the want chain; sev1 still waits
//      behind real hunger; hunger>heal_help order otherwise unchanged.
//  F3. Want resume at stage 1-2 engages the want's beat (the news / the
//      favor's stakes) instead of re-hooking.
//
// Seeded PRNG (loadGame seeds BEFORE eval). Usage: node scripts/test-crisis-outbreak-convo-20261014.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function freshGame(Game) {
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.say = () => {};
  const v = Game.state.village;
  v.trust = v.trust || {};
  v.convoSeeds = {};
  v.sick = {};
  v.health = v.health || {};
  v.grief = 0;
  return (v.roster || []).filter(id => id !== Game.villagerId);
}
const adult = (Game, ids) => ids.find(id => { try { return Game.npcAge(id) >= 15; } catch (e) { return true; } });
function stageSick(Game, ids, n, sev) {
  const v = Game.state.village;
  v.sick = v.sick || {};
  ids.slice(0, n).forEach((id, i) => { v.sick[id] = { name: 'gut rot', daysLeft: 5, severity: sev == null ? 2 : sev }; });
}
function stageNamingDebate(Game) {
  Game.state.codex = Game.state.codex || {};
  Game.state.codex.monsters = Game.state.codex.monsters || {};
  Game.state.codex.monsters['test_beast'] = { namingKicked: true };
}
function latelyKind(Game, vid) {
  try { const ev = Game.t2LatelyEvent(vid); return ev ? ev.kind : 'none'; } catch (e) { return 'ERR:' + e.message; }
}

async function main() {
  const { Game } = await loadGame({ seed: 20261014, mode: 'proof-outbreak-convo' });
  await setupGame(Game);

  // ---------- F1. the outbreak lately-kind ----------
  console.log('\n-- F1. outbreak lately-kind --');
  {
    const ids = freshGame(Game);
    const a = adult(Game, ids), b = adult(Game, ids.filter(x => x !== a)), c = adult(Game, ids.filter(x => x !== a && x !== b));
    const healthy = adult(Game, ids.filter(x => x !== a && x !== b && x !== c));
    stageSick(Game, [a, b, c], 3, 2); // weight 6: severe
    ok('3 sev2 sick -> healthy villager lately is outbreak', latelyKind(Game, healthy) === 'outbreak', latelyKind(Game, healthy));
    const ev = Game.t2LatelyEvent(healthy);
    ok('outbreak carries count + symptom desc', ev && ev.n === 3 && /gut cramps/.test(ev.desc || ''), JSON.stringify(ev));
    const evSelf = Game.t2LatelyEvent(a);
    ok('sick villager own lately is outbreak, self=true', evSelf && evSelf.kind === 'outbreak' && evSelf.self === true, JSON.stringify(evSelf));
    const openers = Game.t2gen_lately(healthy) || [];
    ok('healthy opener names the symptom', openers.some(l => /gut cramps/.test(l)), openers[0]);
    const selfOpeners = Game.t2gen_lately(a) || [];
    ok('sick-self opener is first-person', selfOpeners.some(l => /down with it too/.test(l)), selfOpeners[0]);
    const fol = Game.t2fol_lately(healthy) || [];
    ok('follow-up pools exist for outbreak', fol.length === 3 && fol.every(arr => arr.length === 3) && /sick row/.test(fol[0].join(' ')), JSON.stringify(fol).slice(0, 80));
  }
  {
    // severe outbreak displaces the naming debate
    const ids = freshGame(Game);
    const a = adult(Game, ids), b = adult(Game, ids.filter(x => x !== a)), c = adult(Game, ids.filter(x => x !== a && x !== b));
    const healthy = adult(Game, ids.filter(x => x !== a && x !== b && x !== c));
    stageNamingDebate(Game);
    stageSick(Game, [a, b, c], 3, 2);
    ok('severe outbreak beats live naming debate', latelyKind(Game, healthy) === 'outbreak', latelyKind(Game, healthy));
  }
  {
    // mild outbreak does NOT displace the debate
    const ids = freshGame(Game);
    const a = adult(Game, ids), b = adult(Game, ids.filter(x => x !== a));
    const healthy = adult(Game, ids.filter(x => x !== a && x !== b));
    stageNamingDebate(Game);
    stageSick(Game, [a, b], 2, 1); // weight 2: mild
    ok('mild outbreak yields to the naming debate', latelyKind(Game, healthy) === 'naming', latelyKind(Game, healthy));
  }
  {
    // threshold: one sick villager is personal, not village news
    const ids = freshGame(Game);
    const a = adult(Game, ids);
    const healthy = adult(Game, ids.filter(x => x !== a));
    stageSick(Game, [a], 1, 3);
    ok('1 sick -> no outbreak kind', latelyKind(Game, healthy) !== 'outbreak', latelyKind(Game, healthy));
  }
  {
    // fresh grief still outranks
    const ids = freshGame(Game);
    const a = adult(Game, ids), b = adult(Game, ids.filter(x => x !== a)), c = adult(Game, ids.filter(x => x !== a && x !== b));
    const healthy = adult(Game, ids.filter(x => x !== a && x !== b && x !== c));
    stageSick(Game, [a, b, c], 3, 3);
    Game.state.village.grief = 2;
    try { Game.state.corpses = [{ villagerId: a, name: 'Test Villager' }]; } catch (e) {}
    ok('fresh grief outranks outbreak', latelyKind(Game, healthy) === 'mourning', latelyKind(Game, healthy));
  }

  // ---------- F4. mourning names the sickness when disease took them ----------
  console.log('\n-- F4. sickness-death mourning --');
  {
    const ids = freshGame(Game);
    const a = adult(Game, ids);
    const healthy = adult(Game, ids.filter(x => x !== a));
    Game.state.village.grief = 2;
    try { Game.state.corpses = [{ villagerId: a, name: 'Test Villager', cause: 'gutrot' }]; } catch (e) {}
    const ev = Game.t2LatelyEvent(healthy);
    ok('disease corpse flags sickDeath', ev && ev.kind === 'mourning' && ev.sickDeath === true, JSON.stringify(ev));
    const openers = Game.t2gen_lately(healthy) || [];
    ok('mourning opener names the sickness', openers.some(l => /sickness took/.test(l)), openers[openers.length - 1]);
    ok('no disease true name in the line', !openers.some(l => /gutrot/i.test(l)), 'symptom-honest');
  }
  {
    // non-disease death: no sickDeath flag, lines unchanged
    const ids = freshGame(Game);
    const a = adult(Game, ids);
    const healthy = adult(Game, ids.filter(x => x !== a));
    Game.state.village.grief = 2;
    try { Game.state.corpses = [{ villagerId: a, name: 'Test Villager', cause: 'combat' }]; } catch (e) {}
    const ev = Game.t2LatelyEvent(healthy);
    ok('combat death has no sickDeath flag', ev && ev.kind === 'mourning' && !ev.sickDeath, JSON.stringify(ev));
  }

  // ---------- F2. want chain: severe sickness outranks hunger ----------
  console.log('\n-- F2. sick_help vs hunger want order --');
  {
    const ids = freshGame(Game);
    const vid = adult(Game, ids);
    const v = Game.state.village;
    const need = (hunger, sick) => {
      try { Game.npcNeeds(vid).hunger = hunger; } catch (e) {}
      v.sick = sick ? { [vid]: sick } : {};
      try { return Game.convoFindFavorNeed(vid); } catch (e) { return { kind: 'ERR:' + e.message }; }
    };
    let r = need(85, { name: 'gut rot', daysLeft: 5, severity: 3 });
    ok('hungry + sev3 sick -> sick_help', r && r.kind === 'sick_help', r && r.kind);
    r = need(85, { name: 'gut rot', daysLeft: 5, severity: 1 });
    ok('hungry + sev1 sick -> food_share (mild waits)', r && r.kind === 'food_share', r && r.kind);
    r = need(85, null);
    ok('hungry + healthy -> food_share (unchanged)', r && r.kind === 'food_share', r && r.kind);
    r = need(20, { name: 'gut rot', daysLeft: 5, severity: 2 });
    ok('satiated + sev2 sick -> sick_help', r && r.kind === 'sick_help', r && r.kind);
    try { v.health[vid] = 40; } catch (e) {}
    r = need(20, null);
    ok('injured (health<60) -> heal_help (unchanged)', r && r.kind === 'heal_help', r && r.kind);
  }

  // ---------- F3. want resume engages, not re-hooks ----------
  console.log('\n-- F3. alive:want resume engages the beat --');
  {
    const ids = freshGame(Game);
    const vid = adult(Game, ids);
    Game.convoPlantSeed(vid, { wantId: 'share_news', note: 'test news' });
    Game.startConvo(vid);
    const c = Game.convoGet(vid);
    ok('test rig: seeded share_news want selected', c.want && c.want.id === 'share_news', c.want && c.want.id);
    const HOOK = /never guess what I saw|something happened this morning|get to tell you first/;
    // first resume at stage 0 -> opener (the hook): correct per the arc
    Game.convoTurn(vid, 'alive:want:share_news');
    let tr = (Game.convoGet(vid).transcript || []).map(e => String(e.text)).join(' ');
    ok('first ask states the want (hook)', HOOK.test(tr), tr.slice(-120));
    ok('want now surfaced (stage>=1)', (Game.convoGet(vid).want.stage || 0) >= 1, 'stage=' + Game.convoGet(vid).want.stage);
    // second resume at stage>=1 -> ENGAGE: the news, not another hook
    const before = tr.length;
    Game.convoTurn(vid, 'alive:want:share_news');
    tr = (Game.convoGet(vid).transcript || []).map(e => String(e.text)).join(' ');
    const added = tr.slice(before);
    ok('second ask delivers news, not a re-hook', !HOOK.test(added), added.slice(0, 140));
    const npcSaid = added.split('"Is there something you need? Really."').pop() || '';
    ok('second ask has real content', npcSaid.replace(/"/g, '').trim().length > 30, added.slice(0, 140));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
