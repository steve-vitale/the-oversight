// scripts/test-unified-tracks-20261014.js — UNIFIED TRACKS proof.
//
// Steve 2026-10-14: "I think we need to sync the player and villager system.
// But the villager system sounds like the better model." + "There should be
// maybe 8 natural level ups plus a few other gifts or events etc that compete
// for those 6 slots."
//
// Proves (spec step 8):
//   - thresholds, tracks and kits come from src/data/tracks.json for both
//     (the old NPC_* names are views of it); kits are magic only
//   - the same event credits whoever did it (villagerGainXP with the
//     bearer's id credits the player; a villager's id credits the villager)
//   - the player gets a level-up sheet: 1 of the next 3 unheld kit abilities
//   - a villager gets the next kit ability (deterministic), and skill-lane
//     entries become villager SKILLS (no slot) that still answer npcHasAbility
//   - replace-on-full works, "keep what I have" works, level-ups queue
//   - magic trial deeds credit track XP instead of granting
//   - the audience trial teaches a skill, never a magic gift
//   - occupation lean seeds starting XP below the first threshold
//   - game code calls the engine (deed sites wired)
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('test-unified-tracks-20261014');

const DATA = K.readJSON('src/data/tracks.json');
const ABIL = K.readJSON('src/data/abilities.json');
const lane = (id) => ((ABIL.find(a => a.id === id) || {}).lane) || '?';
const ids = (list) => (list || []).map(c => (c && c.id) || c);

function villagers(Game, n) {
  const v = Game.state.village;
  return (v.roster || []).filter(id => id !== Game.villagerId).slice(0, n);
}
function resetPlayer(Game) {
  const s = Game.state.scholar;
  s.abilities = [];
  s.abilityChoices = null;
  s.levelUpQueue = [];
  s.tracks = null;
  s.trackStats = {};
  s.deedDay = {};
  s.deedConverted = {};
  return s;
}

(async () => {
  const Game = await K.load({ seed: 20261014 });
  K.newRun(Game);
  const s = Game.state.scholar;

  T.section('shared data');
  T.ok('tracks.json loaded at init (Game.data.tracks)', !!(Game.data.tracks && Array.isArray(Game.data.tracks.tracks)));
  T.ok('five tracks incl. strange', JSON.stringify(Game.trackData().tracks) === JSON.stringify(['combat', 'field', 'social', 'craft', 'strange']));
  T.ok('villager thresholds = data thresholds', JSON.stringify(Game.trackThresholds('villager')) === JSON.stringify(DATA.thresholds));
  // PARITY (2026-10-14, Steve: "Villagers and players should get the same
  // XP"): one scale — the player's thresholds ARE the data thresholds.
  T.ok('player thresholds = data thresholds (one scale, no playerScale)',
    JSON.stringify(Game.trackThresholds('player')) === JSON.stringify(DATA.thresholds) && DATA.playerScale === undefined);
  T.ok('NPC_ABILITY_KITS is the data kit (one source)', Game.NPC_ABILITY_KITS === Game.data.tracks.kits);
  T.ok('NPC_XP_THRESHOLDS reads the data', JSON.stringify(Game.NPC_XP_THRESHOLDS) === JSON.stringify(DATA.thresholds));
  const kitIds = [].concat(...Object.values(DATA.kits));
  T.ok('every kit entry is lane magic', kitIds.every(id => lane(id) === 'magic'), kitIds.filter(id => lane(id) !== 'magic').join(','));
  T.ok('every magic ability sits in exactly one kit (fusion_reactor excepted)',
    ABIL.filter(a => a.lane === 'magic' && a.id !== 'fusion_reactor').every(a => kitIds.filter(k => k === a.id).length === 1));
  T.ok('villager skill lists are skill-lane', [].concat(...Object.values(DATA.skills)).every(id => lane(id) === 'skill'));
  T.ok('jobs that lost a magic power lean toward a track whose kit holds it',
    [['firefighter', 'adrenaline_control'], ['soldier', 'cornered_rat'], ['roofer', 'survivor'], ['forager', 'green_thumb'], ['mushroom_grower', 'green_thumb']]
      .every(([occ, ab]) => { const lean = Game.occupationLean(occ); const tr = Object.keys(DATA.kits).find(t => DATA.kits[t].includes(ab)); return (lean[tr] || 0) >= 2; }));

  T.section('occupation lean: below the first threshold');
  {
    const occs = K.readJSON('src/data/characterGen.json').occupations;
    T.ok('every occupation has a trackLean', occs.every(o => o.trackLean && Object.keys(o.trackLean).length));
    T.ok('lean values stay below the villager first threshold', occs.every(o => Object.values(o.trackLean).every(v => v < DATA.thresholds[0])));
    resetPlayer(Game);
    const tr = Game.playerTracks();
    const first = Game.trackThresholds('player')[0];
    T.ok('player starts with lean XP, no free level', Object.values(tr).every(t => t.level === 0 && t.xp < first) && Object.values(tr).some(t => t.xp > 0),
      JSON.stringify(tr));
    const [v0] = villagers(Game, 1);
    delete (Game.state.village.npcXp || {})[v0];
    const x = Game.npcXp(v0);
    const p = Game.getPerson(v0);
    const lean = Game.occupationLean(p && p.occupationId);
    T.ok('villager record seeded with their job lean', Object.keys(lean).every(t => x[t] === Math.min(DATA.thresholds[0] - 1, lean[t])) && Object.keys(lean).length > 0,
      (p && p.occupationId) + ' ' + JSON.stringify(lean));
  }

  T.section('same event credits the doer');
  {
    resetPlayer(Game);
    Game.state.systemArrived = true;
    const [va] = villagers(Game, 1);
    const before = Game.playerTracks().craft.xp;
    const vBefore = Game.npcXp(va).craft;
    // the camp-healer deed site passes whoever healed: the bearer or a villager
    Game.villagerGainXP(Game.villagerId, 'craft', 1, 'healing');
    T.ok('healing by the bearer credits the player', Game.playerTracks().craft.xp === before + 1);
    T.ok('the bearer gets no villager record', !((Game.state.village.npcXp || {})[Game.villagerId]));
    Game.villagerGainXP(va, 'craft', 1, 'healing');
    T.ok('healing by a villager credits that villager', Game.npcXp(va).craft === vBefore + 1);
    T.ok('...and not the player', Game.playerTracks().craft.xp === before + 1);
    // the deed table (same tracks as the villager sites)
    const f0 = Game.playerTracks().field.xp;
    Game.noteDeed('foraging'); Game.noteDeed('foraging'); Game.noteDeed('foraging');
    T.ok('player foraging feeds field (per-day cap 2)', Game.playerTracks().field.xp === f0 + 2, f0 + ' -> ' + Game.playerTracks().field.xp);
    s.day = (s.day || 0) + 1;
    Game.noteDeed('foraging');
    T.ok('cap resets next day', Game.playerTracks().field.xp === f0 + 3);
    // a real deed through game code: the forage action credits field
    const tr = Game.trackData();
    T.ok('deed table only names real tracks', Object.values(tr.deeds).every(d => tr.tracks.includes(d.track)));
  }

  T.section('player level-up: pick 1 of the next 3 unheld kit abilities');
  {
    resetPlayer(Game);
    Game.state.systemArrived = true;
    K.openSlots(Game, 6);
    const first = Game.trackThresholds('player')[0];
    const t0 = K.teleEvents(Game, 'track_level').length;
    Game.gainTrackXP('player', 'combat', first, 'test');
    const ch = s.abilityChoices || [];
    T.ok('crossing the first threshold opens a sheet', ch.length === 3, ids(ch).join(','));
    // GOD-PATH (2026-10-14, by design): the sheet is the next 3 of the kit,
    // except a duplicate role is swapped for the next kit entry with a new
    // role (spec: "the 3 offers should be different roles where possible").
    const roleOf = (id) => (ABIL.find(a => a.id === id) || {}).role;
    T.ok('the sheet opens with the kit\'s next ability and draws only from the combat kit',
      ids(ch)[0] === DATA.kits.combat[0] && ids(ch).every(id => DATA.kits.combat.includes(id)), ids(ch).join(','));
    T.ok('the sheet\'s roles are distinct', new Set(ids(ch).map(roleOf)).size === ch.length, ids(ch).map(roleOf).join(','));
    T.ok('src names the track', ch.every(c => c.src === 'level_up:combat'));
    T.ok('tele track_level {who, track, level}', K.teleEvents(Game, 'track_level').length === t0 + 1);
    Game.chooseAbility(DATA.kits.combat[1]);
    T.ok('the pick lands in a slot', K.abilityIds(Game).includes(DATA.kits.combat[1]));
    Game.gainTrackXP('player', 'combat', Game.trackThresholds('player')[1] - Game.playerTracks().combat.xp, 'test');
    T.ok('the next sheet skips what you hold', ids(s.abilityChoices).length === 3 && !ids(s.abilityChoices).includes(DATA.kits.combat[1]) && ids(s.abilityChoices)[0] === DATA.kits.combat[0], ids(s.abilityChoices).join(','));
    Game.chooseAbility(DATA.kits.combat[0]);
  }

  T.section('queue: never drop');
  {
    resetPlayer(Game);
    Game.state.systemArrived = true;
    K.openSlots(Game, 6);
    Game.gainTrackXP('player', 'field', Game.trackThresholds('player')[1], 'test'); // two field levels at once
    T.ok('two crossings: one sheet open, one queued', (s.abilityChoices || []).length === 3 && (s.levelUpQueue || []).length === 1);
    Game.chooseAbility(s.abilityChoices[0].id);
    T.ok('choosing opens the queued sheet', (s.abilityChoices || []).length === 3 && s.abilityChoices[0].src === 'level_up:field' && s.abilityChoices[0].level === 2);
    // a pending non-level-up sheet blocks, never overwritten
    Game.chooseAbility(s.abilityChoices[0].id);
    s.abilityChoices = [{ id: 'purify', name: 'Purify', src: 'aid' }];
    Game.gainTrackXP('player', 'social', Game.trackThresholds('player')[0], 'test');
    T.ok('a pending gift sheet is not overwritten', s.abilityChoices[0].id === 'purify' && s.levelUpQueue.length === 1);
    s.abilityChoices = null;
    Game.pumpLevelUps();
    T.ok('the queued level-up opens once the sheet clears', s.abilityChoices && s.abilityChoices[0].src === 'level_up:social');
    s.abilityChoices = null; s.levelUpQueue = [];
    // before the System arrives: queued, not offered
    resetPlayer(Game);
    Game.state.systemArrived = false;
    Game.gainTrackXP('player', 'craft', Game.trackThresholds('player')[0], 'test');
    T.ok('pre-arrival: level queued, no sheet', !(s.abilityChoices || []).length && s.levelUpQueue.length === 1);
    Game.state.systemArrived = true;
    Game.pumpLevelUps();
    T.ok('arrival pump opens it', (s.abilityChoices || [])[0] && s.abilityChoices[0].src === 'level_up:craft');
  }

  T.section('replace on full / keep what I have');
  {
    resetPlayer(Game);
    Game.state.systemArrived = true;
    s.integration = 100;
    const filler = DATA.kits.strange.slice(0, 6);
    for (const id of filler) K.giveAbility(Game, id);
    T.ok('setup: 6/6', s.abilities.length === 6 && Game.abilitySlots() === 6);
    Game.gainTrackXP('player', 'craft', Game.trackThresholds('player')[0], 'test');
    const offer = s.abilityChoices[0].id;
    Game.chooseAbility(offer);
    T.ok('full: a pick without a replacement is refused, sheet stays', !K.abilityIds(Game).includes(offer) && (s.abilityChoices || []).length === 3);
    Game.chooseAbility(offer, filler[2]);
    T.ok('full: the pick REPLACES the named ability', K.abilityIds(Game).includes(offer) && !K.abilityIds(Game).includes(filler[2]) && s.abilities.length === 6,
      K.abilityIds(Game).join(','));
    Game.gainTrackXP('player', 'craft', Game.trackThresholds('player')[1] - Game.playerTracks().craft.xp, 'test');
    const held = K.abilityIds(Game).slice();
    T.ok('next sheet open', (s.abilityChoices || []).length > 0);
    T.ok('keepAbilities declines', Game.keepAbilities() === true && !(s.abilityChoices || []).length);
    T.ok('...and nothing changed', JSON.stringify(K.abilityIds(Game)) === JSON.stringify(held));
    T.ok('stats count picks, replaces, keeps', (s.trackStats.replaced || 0) === 1 && (s.trackStats.kept || 0) === 1);
    // a non-level-up offer still waits for a free slot (unchanged)
    s.abilityChoices = [{ id: 'purify', name: 'Purify', src: 'aid' }];
    Game.chooseAbility('purify', held[0]);
    T.ok('non-level-up offers never replace', !K.abilityIds(Game).includes('purify') && K.abilityIds(Game).includes(held[0]));
    s.abilityChoices = null;
  }

  T.section('villagers: next kit ability, skills not slots');
  {
    Game.state.systemArrived = true;
    const [vb, vc] = villagers(Game, 3).slice(1);
    const v = Game.state.village;
    v.npcXp = v.npcXp || {}; v.npcXp[vb] = null; delete v.npcXp[vb];
    v.npcAbilities = v.npcAbilities || {}; v.npcAbilities[vb] = [];
    v.npcSkills = v.npcSkills || {}; v.npcSkills[vb] = [];
    const x = Game.npcXp(vb); x.combat = 0;
    // PARITY (2026-10-14): villagers get the player's 1-of-3 sheet and choose
    // by buildScore (test-parity-20261014.js). Give them enough knowledge to
    // choose now rather than go and seek it first.
    v.npcKnow = v.npcKnow || {}; v.npcKnow[vb] = { pocket_sand: 2, third_eye: 2 };
    Game.villagerGainXP(vb, 'combat', DATA.thresholds[0], 'test');
    T.ok('threshold 1 -> one of the first 3 kit abilities (chosen)', v.npcAbilities[vb].length === 1 && DATA.kits.combat.slice(0, 3).includes(v.npcAbilities[vb][0]), (v.npcAbilities[vb] || []).join(','));
    Game.villagerGainXP(vb, 'combat', DATA.thresholds[1] - x.combat, 'test');
    T.ok('threshold 2 -> a second, from the next 3 unheld', v.npcAbilities[vb].length === 2 && DATA.kits.combat.slice(0, 4).includes(v.npcAbilities[vb][1]), (v.npcAbilities[vb] || []).join(','));
    const sk0 = DATA.skills.combat[0];
    T.ok('level ' + DATA.skillLevels[0] + ' teaches the track skill (' + sk0 + ') as a SKILL', Game.npcKnowsSkill(vb, Game.abilitySkillId(sk0)) && !v.npcAbilities[vb].includes(sk0));
    T.ok('the skill answers npcHasAbility', Game.npcHasAbility(vb, sk0));
    // any skill-lane grant (old kit entries, shieldbearer path) becomes a skill
    v.npcAbilities[vc] = []; v.npcSkills[vc] = [];
    Game.npcGrantAbility(vc, 'tracker');
    T.ok('npcGrantAbility(skill-lane) -> villager skill, no slot', !v.npcAbilities[vc].includes('tracker') && Game.npcKnowsSkill(vc, 'track_read'));
    T.ok('merged skill carries its abilities (tracker -> game_sense)', Game.npcHasAbility(vc, 'tracker') && Game.npcHasAbility(vc, 'game_sense'));
    T.ok('npcOwnedIds = magic slots + skill-carried abilities', Game.npcOwnedIds(vc).includes('blood_trail'));
    // old saves: skill-lane ids in villager slots migrate
    v.npcAbilities[vc] = ['triage', 'rage'];
    const moved = Game.migrateNpcLanes();
    T.ok('migration moves skill-lane slot entries to skills', moved >= 1 && JSON.stringify(v.npcAbilities[vc]) === '["rage"]' && Game.npcHasAbility(vc, 'field_medicine'));
    // pre-arrival: XP accrues, no magic grant
    Game.state.systemArrived = false;
    v.npcAbilities[vc] = []; delete v.npcXp[vc];
    const xc = Game.npcXp(vc); xc.field = 0;
    Game.villagerGainXP(vc, 'field', DATA.thresholds[0], 'test');
    T.ok('pre-arrival: XP accrues, no grant', xc.field === DATA.thresholds[0] && v.npcAbilities[vc].length === 0);
    Game.state.systemArrived = true;
    v.npcKnow[vc] = { pocket_sand: 2, third_eye: 2 };
    Game.villagerGainXP(vc, 'field', 0, 'test');
    T.ok('post-arrival: the pending sheet fires (one of the first 3 field abilities)', v.npcAbilities[vc].length === 1 && DATA.kits.field.slice(0, 3).includes(v.npcAbilities[vc][0]), (v.npcAbilities[vc] || []).join(','));
    T.ok('the dead earn nothing', (() => { const vp = Game.vpOf(vc); vp.dead = true; const r = Game.villagerGainXP(vc, 'field', 5, 'test'); vp.dead = false; return r === 0; })());
  }

  T.section('deeds that granted magic now credit tracks');
  {
    resetPlayer(Game);
    Game.state.systemArrived = true;
    K.openSlots(Game, 6);
    s.trialDeeds = {};
    const c0 = Game.playerTracks().combat.xp;
    Game.noteTrialDeed('win_a_fight', 1);
    T.ok('win_a_fight: no adrenaline_control grant', !K.abilityIds(Game).includes('adrenaline_control'));
    T.ok('...combat +' + DATA.deedConversions.win_a_fight.n, Game.playerTracks().combat.xp === c0 + DATA.deedConversions.win_a_fight.n);
    Game.noteTrialDeed('win_a_fight', 1);
    T.ok('...once only', Game.playerTracks().combat.xp === c0 + DATA.deedConversions.win_a_fight.n);
    s.practiceDeeds = {};
    for (let i = 0; i < 3; i++) Game.notePracticeDeed('war_cry', 1);
    T.ok('war_cry practice: no grant, combat credited', !K.abilityIds(Game).includes('war_cry') && Game.playerTracks().combat.xp === c0 + 2 * 3);
  }

  T.section('audience trial teaches a skill');
  {
    resetPlayer(Game);
    Game.state.systemArrived = true;
    K.openSlots(Game, 6);
    const known0 = Object.keys(Game.state.codex.skills || {}).filter(k => (Game.state.codex.skills[k].level || 0) >= 1).length;
    s.lastIntegration = 80; // isolate: no integration-milestone strange XP in this step
    const st0 = Game.playerTracks().strange.xp;
    const pg = Game.progState();
    pg.trial = { kind: 'pantry', text: 'test', need: 1, start: 0, expires: 999 };
    Game.completeTrial();
    const known1 = Object.keys(Game.state.codex.skills || {}).filter(k => (Game.state.codex.skills[k].level || 0) >= 1).length;
    T.ok('no ability sheet from the trial', !(s.abilityChoices || []).length && K.abilityIds(Game).length === 0);
    T.ok('one new skill learned', known1 === known0 + 1, known0 + ' -> ' + known1);
    T.ok('the trial feeds the strange track', Game.playerTracks().strange.xp === st0 + DATA.deeds.audience_trial.n);
  }

  T.section('wired: game code calls the engine');
  {
    const src = K.readSrc('src/js/game.js') + K.readSrc('src/js/contests.js') + K.readSrc('src/js/encounters.js') + K.readSrc('src/js/conversation.js') +
      K.readSrc('src/js/food.js') + K.readSrc('src/js/ledger.js') + K.readSrc('src/js/corpses.js') + K.readSrc('src/js/progression.js');
    for (const d of Object.keys(DATA.deeds)) {
      // PARITY (2026-10-14): villager sites credit through creditDeed(who, id)
      T.ok(`deed "${d}" has a game call site`, src.includes(`noteDeed('${d}')`) || src.includes(`noteDeed && this.noteDeed('${d}')`) || new RegExp(`creditDeed\\([^;]*'${d}'`).test(src));
    }
    T.ok('tracks.js loads from index.html', K.readSrc('index.html').includes('src/js/tracks.js'));
  }

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exitCode = 2; });
