#!/usr/bin/env node
// test-sick-favor-20261011.js — PROOF for the crisis-leg blank:
// "sick villagers never asked for help and never mentioned being sick."
//
// BEFORE: convoFindFavorNeed had no disease need — a villager with gutrot
// opened conversations with small talk; treatVillager/tendVillager never
// called checkPromises, so curing a disease couldn't keep a heal promise.
// AFTER: a sick_help favor need (symptom-only lines, never the true disease
// name — canon docs/DISEASES.md), and tend/treat keep 'heal' promises.
//
// Seeded PRNG, deterministic. Usage: node scripts/test-sick-favor-20261011.js
//        SEED=7 node scripts/test-sick-favor-20261011.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const SEED = parseInt(process.env.SEED || '20261011', 10);

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
Math.random = mulberry32(SEED); // seeded BEFORE eval

global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\\\"]*\\.js' index.html | head -80", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
order.forEach(f => {
  try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
  catch (e) { console.error('EVAL FAIL ' + f + ': ' + e.message); process.exit(2); }
});
delete global.window;
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function freshGame() {
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.say = () => {};
  Game.state.scholar.kcal = 50000;
  const v = Game.state.village;
  v.trust = v.trust || {};
  v.convoSeeds = {};
  v.sick = {};
  return (v.roster || []).filter(id => id !== Game.villagerId);
}
const sicken = (vid, name) => {
  const v = Game.state.village;
  v.sick = v.sick || {};
  v.sick[vid] = { name: name || 'gut rot', daysLeft: 4, severity: 2 };
};
const trueName = (id) => { try { return (Game.seDef(id) || {}).name || id; } catch (e) { return id; } };

(async () => {
  await Game.init();
  console.log(`seed=${SEED}`);

  // ---------- 1. need detection ----------
  console.log('\n-- 1. sick villagers surface a sick_help need --');
  {
    const ids = freshGame();
    const vid = ids[0];
    sicken(vid, 'gut rot');
    const need = Game.convoFindFavorNeed(vid);
    ok('sick villager -> sick_help need', need && need.kind === 'sick_help', JSON.stringify(need));
    ok('need carries the sickness', need && /gut rot/.test(need.sickName || ''), need && need.sickName);
    const need2 = Game.convoFindFavorNeed(ids[1]);
    ok('healthy villager -> no sick_help', !need2 || need2.kind !== 'sick_help', JSON.stringify(need2));
    // priority: hunger still wins over sickness (the body starves first)
    try { Game.npcNeeds(vid).hunger = 95; } catch (e) {}
    const need3 = Game.convoFindFavorNeed(vid);
    ok('hunger outranks sickness', need3 && need3.kind === 'food_share', need3 && need3.kind);
  }

  // ---------- 2. the want + symptom-only opener ----------
  console.log('\n-- 2. the want surfaces in the opening, symptoms only --');
  {
    const ids = freshGame();
    const vid = ids[0];
    sicken(vid, 'gut rot');
    try { Game.state.village.trust[vid] = 30; } catch (e) {}
    const sel = Game.convoSelectWant(vid);
    ok('want selected is ask_favor', sel && sel.id === 'ask_favor', sel && sel.id);
    Game.startConvo(vid);
    const c = Game.convoGet(vid);
    const opener = (c.transcript || []).map(e => e.text).join(' ');
    ok('opener mentions symptoms', /cramp/i.test(opener), opener.slice(0, 120));
    ok('opener never names the disease', !new RegExp(trueName('gutrot'), 'i').test(opener), 'true name: ' + trueName('gutrot'));
    ok('favor instance built', !!(c.want && c.want.favor && c.want.favor.kind === 'sick_help'));
    ok('favor kind registered', (c.want.favor.keepKind === 'heal' && c.want.favor.goal === 'heal'));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---------- 3. commit -> tend -> promise kept ----------
  console.log('\n-- 3. "I\'ll do it" -> tend -> promise kept --');
  {
    const ids = freshGame();
    const vid = ids[0];
    sicken(vid, 'wound fever');
    try { Game.state.village.trust[vid] = 30; } catch (e) {}
    Game.startConvo(vid);
    const findChoice = (id) => (Game.convoChoices(vid) || []).find(x => x.id === id);
    // answer their hanging question first (any gq: variant — yn or open),
    // then engage the want
    const gq = (Game.convoChoices(vid) || []).find(x => /^gq:/.test(x.id));
    if (gq) Game.convoTurn(vid, gq.id);
    let h = findChoice('dlg:help'); if (h) Game.convoTurn(vid, 'dlg:help');
    else { const d = findChoice('dlg:details'); if (d) Game.convoTurn(vid, 'dlg:details'); }
    const cm = findChoice('dlg:commit');
    ok('commit choice offered', !!cm);
    if (cm) Game.convoTurn(vid, 'dlg:commit');
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    const p = (Game.state.village.promises || {})[vid];
    ok('obligation tracked', !!(p && p.favorId && !p.kept), JSON.stringify(p && { goal: p.goal, kept: p.kept }));
    const trustBefore = (Game.state.village.trust || {})[vid] || 0;
    Game.tendVillager(vid);
    const p2 = (Game.state.village.promises || {})[vid];
    ok('tending keeps the heal promise', !!(p2 && p2.kept === true), JSON.stringify(p2 && p2.kept));
    const favor = Game.convoGetFavor(vid);
    ok('favor marked fulfilled', !!(favor && favor.state === 'fulfilled'), favor && favor.state);
    ok('trust rose', ((Game.state.village.trust || {})[vid] || 0) > trustBefore, `${trustBefore} -> ${(Game.state.village.trust || {})[vid]}`);
  }

  // ---------- 4. treatVillager (medicine) also keeps ----------
  console.log('\n-- 4. treatVillager keeps heal promises too --');
  {
    const ids = freshGame();
    const vid = ids[1];
    sicken(vid, 'gut rot');
    // give the player herbal_remedy L2 (treatVillager's gate)
    try {
      Game.state.scholar.abilities = Game.state.scholar.abilities || [];
      if (!Game.state.scholar.abilities.find(a => (a.id || a) === 'herbal_remedy'))
        Game.state.scholar.abilities.push({ id: 'herbal_remedy', level: 2, xp: 0 });
      else Game.state.scholar.abilities.find(a => (a.id || a) === 'herbal_remedy').level = 2;
    } catch (e) {}
    // open promise directly (bypasses convo): the keep path is what's under test
    Game.state.village.promises = Game.state.village.promises || {};
    Game.state.village.promises[vid] = { goal: 'heal', day: Game.state.scholar.day, kept: false, favorId: 'favor-test', favorTask: 'test task', favorDeadline: Game.state.scholar.day + 2 };
    Game.treatVillager(vid, 'herbal_remedy');
    const p = (Game.state.village.promises || {})[vid];
    ok('treating keeps the heal promise', !!(p && p.kept === true), JSON.stringify(p && p.kept));
  }

  // ---------- 5. two pools: alien quirks never ask ----------
  console.log('\n-- 5. alien quirks do not produce a sickness ask --');
  {
    const ids = freshGame();
    const vid = ids[2];
    // shellgut is an ALIEN quirk (monster-meat), not a mundane v.sick record
    let applied = false;
    try {
      const person = ((Game.state.village || {}).rosterChars || {})[vid];
      applied = Game.applyStatus(person, 'shellgut', { source: 'test' });
    } catch (e) {}
    const need = Game.convoFindFavorNeed(vid);
    ok('alien quirk -> no sick_help', !need || need.kind !== 'sick_help', JSON.stringify(need));
  }

  // ---------- 6. wound still wins (existing priority intact) ----------
  console.log('\n-- 6. existing priorities intact --');
  {
    const ids = freshGame();
    const vid = ids[0];
    sicken(vid, 'gut rot');
    try { Game.state.village.health = Game.state.village.health || {}; Game.state.village.health[vid] = 40; } catch (e) {}
    const need = Game.convoFindFavorNeed(vid);
    ok('wound outranks sickness', need && need.kind === 'heal_help', need && need.kind);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(2); });
