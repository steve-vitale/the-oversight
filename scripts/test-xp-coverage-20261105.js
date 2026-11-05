// PROOF: XP coverage — the healing deed fires wherever healing actually happens.
// XP coverage + synergy + gear + healer road (Steve 2026-11-05).
// Before the build the 'healing' deed credited 0 times in a 30-day panel despite
// 228 heal checks and 26 care rescues: Mending, lifeline, field_medicine, triage
// and the player-as-medic heal check never credited it.
// Usage: node scripts/test-xp-coverage-20261105.js   (exit 1 on any FAIL)
'use strict';
const H = require('./sim-harness.js');
const L = require('./godpath/lib.js');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail !== undefined ? ' :: ' + detail : '')); }
}
function xpOf(Game, who, track) {
  // npcXp(vid) initializes the record (occupation lean) on first touch — call
  // it before measuring, or the 'before' read misses the lean and the delta
  // includes it.
  if (who === 'player') return ((Game.state.scholar.tracks || {})[track] || {}).xp || 0;
  try { Game.npcXp && Game.npcXp(who); } catch (e) {}
  return (((Game.state.village.npcXp || {})[who] || {})[track]) || 0;
}

async function main() {
  const Game = await L.load({ seed: 99101 });
  const scholar = L.newRun(Game, 'Columbus, Ohio');
  const village = Game.state.village;
  const vid = (village.roster || []).find(id => id !== Game.villagerId);
  if (!vid) { console.log('FAIL no roster villager'); process.exit(1); }
  village.npcXp = village.npcXp || {};
  village.npcAbilities = village.npcAbilities || {};
  village.health = village.health || {};
  village.health[vid] = 100;
  // The System must have arrived for villager level-up sheets to queue; XP
  // itself credits regardless. Set a known day so per-day caps are readable.
  Game.state.scholar.day = 10;

  // ---- 1. noteCareRescue (the save shape) credits the healing deed ----
  console.log('healing deed: care rescue (Mending/lifeline shape)');
  {
    const before = xpOf(Game, vid, 'craft');
    // A save: patient restored from 20 (<=25% of 100) to 60 (>25%).
    Game.noteCareRescue(vid, Game.villagerId, 20, 60, 100, 'mending_hands', 'battle');
    const after = xpOf(Game, vid, 'craft');
    check('care rescue credits healing deed (+1 craft XP)', after - before >= 1, 'before=' + before + ' after=' + after);
    check('care watch recorded (god deed still wired)', !!((Game.state.village.godpathCareWatch || {})[vid] || []).length);
  }

  // ---- 2. field_medicine in a field fight credits the healing deed ----
  console.log('healing deed: field_medicine in a field fight');
  {
    village.npcAbilities[vid] = ['field_medicine'];
    village.health[vid] = 50; // hurt, so the skill fires
    const mdef = (Game.data.monsters || []).find(m => m.id === 'hushwolf');
    const before = xpOf(Game, vid, 'craft');
    // Deterministic RNG for the fight.
    let s = 12345;
    const rng = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    const rec = Game.fieldFight(vid, mdef, null, { rng });
    const fired = (rec && rec.ffFired) || [];
    check('field_medicine fired in the fight', fired.includes('field_medicine'), 'ffFired=' + JSON.stringify(fired));
    if (fired.includes('field_medicine')) {
      const after = xpOf(Game, vid, 'craft');
      check('field_medicine use credits healing deed', after - before >= 1, 'before=' + before + ' after=' + after);
    }
  }

  // ---- 3. player-as-medic heal check credits the PLAYER ----
  console.log('healing deed: player-as-medic departure patch');
  {
    // Make the player the camp healer: learn the triage skill. The skill id
    // is 'wound_care' (learnSkill maps the triage ability to its skill);
    // hasAbility('triage') then reads true via the skill-lane mapping.
    try { Game.learnSkill && Game.learnSkill('wound_care', 1, 'test'); } catch (e) {}
    village.health[vid] = 40; // hurt enough to patch
    const before = xpOf(Game, 'player', 'craft');
    const medic = Game.campHealerId && Game.campHealerId('here');
    check('camp healer resolves to the player', medic === Game.villagerId, 'medic=' + medic + ' player=' + Game.villagerId);
    if (medic === Game.villagerId) {
      Game.villagerHealCheck(vid);
      const after = xpOf(Game, 'player', 'craft');
      check('player-as-medic patch credits player healing deed', after - before >= 1, 'before=' + before + ' after=' + after);
    }
  }

  // ---- 4. triage credits the healing deed to the camp healer ----
  console.log('healing deed: triage tent');
  {
    // The camp healer (whoever they are — the player if the bearer holds the
    // triage skill, else a medical-occupation villager) does the tending.
    // A hurt villager gives the tents someone to tend.
    const healer = (Game.campHealerId && (Game.campHealerId('haven') || Game.campHealerId('here'))) || null;
    village.health[vid] = 50;
    if (healer) {
      const before = xpOf(Game, healer === Game.villagerId ? 'player' : healer, 'craft');
      // _triageRun(mode, rel): mode 'triage' tends everyone; rel is the
      // relief (needs a used{} book). The pantry must cover the cost.
      Game.state.village.pantryKcal = 100000;
      const r = Game._triageRun('triage', { speaker: 'Test Speaker', used: {} });
      const after = xpOf(Game, healer === Game.villagerId ? 'player' : healer, 'craft');
      check('triage run completes', r !== 'short' && r !== null && r !== undefined && r !== 'noneed', 'result=' + JSON.stringify(r));
      check('triage credits healing deed to the camp healer', after - before >= 1, 'healer=' + healer + ' before=' + before + ' after=' + after);
    } else {
      console.log('  (skip triage: no camp healer resolves)');
    }
  }

  console.log(pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
