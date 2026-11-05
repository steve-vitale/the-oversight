// PROOF: synergy bonus — synergistic deeds grant more XP, legibly.
// XP coverage + synergy + gear + healer road (Steve 2026-11-05).
// The synergy table lives in tracks.json; creditSynergy(who, synergyId) grants
// the bonus via gainTrackXP, caps per day, and tele's 'track_synergy' (the
// legible record) + says a line for the player.
// Usage: node scripts/test-xp-synergy-20261105.js   (exit 1 on any FAIL)
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./sim-harness.js');
const L = require('./godpath/lib.js');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail !== undefined ? ' :: ' + detail : '')); }
}
function xpOf(Game, who, track) {
  // npcXp(vid) initializes the record (occupation lean) on first touch — call
  // it before measuring, or the 'before' read misses the lean.
  if (who === 'player') return ((Game.state.scholar.tracks || {})[track] || {}).xp || 0;
  try { Game.npcXp && Game.npcXp(who); } catch (e) {}
  return (((Game.state.village.npcXp || {})[who] || {})[track]) || 0;
}

async function main() {
  // ---- table shape ----
  const T = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'tracks.json'), 'utf8'));
  const syn = T.synergies || {};
  console.log('synergy table');
  const want = ['fight_with_ability', 'teach_learned_skill', 'craft_taught_recipe', 'heal_save', 'forage_new_plant'];
  for (const id of want) {
    const s = syn[id];
    check('synergy exists: ' + id, !!s);
    if (s) {
      check(id + ' has deed/track/bonus/perDay/label', !!(s.deed && s.track && Number.isFinite(s.bonus) && s.bonus > 0 && Number.isFinite(s.perDay) && s.label), JSON.stringify(s));
    }
  }
  check('synergy bonuses are small (<= 2 XP)', Object.values(syn).every(s => s.bonus <= 2), JSON.stringify(syn));

  const Game = await L.load({ seed: 99101 });
  const scholar = L.newRun(Game, 'Columbus, Ohio');
  const village = Game.state.village;
  const vid = (village.roster || []).find(id => id !== Game.villagerId);
  if (!vid) { console.log('FAIL no roster villager'); process.exit(1); }
  village.npcXp = village.npcXp || {};
  Game.state.scholar.day = 10;

  // ---- creditSynergy: grants, caps, tele's ----
  console.log('creditSynergy mechanics');
  check('Game.creditSynergy exists', typeof Game.creditSynergy === 'function');
  {
    const before = xpOf(Game, vid, 'craft');
    const r1 = Game.creditSynergy(vid, 'heal_save');
    const mid = xpOf(Game, vid, 'craft');
    check('heal_save grants its bonus (+2 craft XP)', mid - before === (syn.heal_save ? syn.heal_save.bonus : 2), 'before=' + before + ' mid=' + mid + ' r=' + r1);
    const r2 = Game.creditSynergy(vid, 'heal_save');
    const after = xpOf(Game, vid, 'craft');
    check('synergy per-day cap: second call same day grants nothing', after === mid, 'mid=' + mid + ' after=' + after + ' r2=' + r2);
    const tele = (Game.state.telemetry || []).filter(e => e && e.type === 'track_synergy');
    check("tele 'track_synergy' recorded (legible)", tele.length >= 1 && tele[tele.length - 1].synergy === 'heal_save', 'tele=' + JSON.stringify(tele.slice(-1)));
  }

  // ---- teach_learned_skill: teacher learned the skill from someone else ----
  console.log('synergy: teach a skill learned from someone else');
  {
    // 'steady_hands' is a teachable craft skill. The teacher (vid) was taught
    // it by another villager in an earlier lesson — recorded in the
    // skill-lessons ledger.
    village.skillLessons = village.skillLessons || [];
    village.skillLessons.push({ day: 5, teacher: 'someone_else', learner: vid, skill: 'steady_hands' });
    try { Game.npcLearnSkill && Game.npcLearnSkill(vid, 'steady_hands'); } catch (e) {}
    const learner = (village.roster || []).find(id => id !== Game.villagerId && id !== vid);
    if (learner) {
      const before = xpOf(Game, vid, 'social');
      const ok = Game.teachSkill(vid, learner, 'steady_hands', { via: 'test' });
      const after = xpOf(Game, vid, 'social');
      check('lesson taught', ok === true, 'ok=' + ok);
      // teaching deed (1) + synergy bonus (1) = +2 social XP
      check('teaching a learned skill grants deed + synergy', ok && (after - before) >= 2, 'before=' + before + ' after=' + after);
    } else {
      console.log('  (skip teach: no second villager)');
    }
  }

  // ---- fight_with_ability: a kill with an ability in play ----
  console.log('synergy: fight won with an ability used');
  {
    // 'ambush' fires on contact (awareness section) — a weak monster
    // (hummice) so the fight ends in a kill, not a flee.
    village.npcAbilities[vid] = ['ambush'];
    village.health = village.health || {};
    village.health[vid] = 100;
    const mdef = (Game.data.monsters || []).find(m => m.id === 'hummice');
    let s = 11;
    const rng = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    const before = xpOf(Game, vid, 'combat');
    const rec = Game.fieldFight(vid, mdef, null, { rng, awareness: true });
    const after = xpOf(Game, vid, 'combat');
    console.log('  fight outcome=' + (rec && rec.outcome) + ' ffFired=' + JSON.stringify((rec && rec.ffFired) || []));
    if (rec && rec.outcome === 'vKill' && (rec.ffFired || []).length) {
      // fight_won (2) + synergy bonus (1) = +3 combat XP
      check('kill with an ability fired grants deed + synergy', after - before >= 3, 'before=' + before + ' after=' + after);
    } else {
      check('kill with an ability fired grants deed + synergy', false, 'outcome=' + (rec && rec.outcome) + ' ffFired=' + JSON.stringify((rec && rec.ffFired) || []));
    }
  }

  console.log(pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
