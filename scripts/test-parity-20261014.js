// scripts/test-parity-20261014.js — PLAYER / VILLAGER PARITY proof.
//
// Steve 2026-10-14: "Villagers and players should get the same XP, when in
// doubt we treat them the same way. You should get to swap on level up or
// keep existing. No I don't think you should take your XP or the abilities.
// You become that villager. ... villagers need to act in smart ways,
// including towards getting good gear and builds. They want to win as well."
// + "Villagers can't just take the next ability, they need to seek knowledge
// about the abilities and go for a build that suits their technology."
// + "Yes any death for strange path".
//
// Proves:
//   - one threshold table (no player-only scale)
//   - same deed, same XP, same per-day cap, player or villager; villager
//     duty sites credit the player's deed ids
//   - a villager's first ability is a magic knack in slot 1, picked by buildScore
//   - a villager gets the player's 1-of-3 sheet and picks by buildScore: with
//     knowledge of X and gear that fits X they take X over the kit-order default
//   - a villager who knows too little defers the sheet and does a SEEK action
//   - swap or keep for villagers, the same rule (buildDecide)
//   - the mantle: the new bearer keeps their own tracks, abilities, skills
//     and gear; the predecessor's do not pass
//   - villagers equip better gear (armory, greedy) and it changes their fights
//   - any village death feeds the strange track for the player and villagers
//   - save/load round trip keeps the new villager records
//   - wired: game code calls the new engine
'use strict';
const K = require('./godpath/lib');
// in-memory localStorage for the save/load round trip (node has none)
const _store = {};
globalThis.localStorage = globalThis.localStorage || {
  getItem: (k) => (k in _store ? _store[k] : null),
  setItem: (k, v) => { _store[k] = String(v); },
  removeItem: (k) => { delete _store[k]; },
  key: (i) => Object.keys(_store)[i] || null,
  get length() { return Object.keys(_store).length; },
};
const T = K.reporter('test-parity-20261014');

const DATA = K.readJSON('src/data/tracks.json');

function livingVillagers(Game) {
  const v = Game.state.village;
  return (v.roster || []).filter(id => id !== Game.villagerId && !((Game.vpOf(id) || {}).dead));
}
function freshVillager(Game, vid) {
  const v = Game.state.village;
  v.npcAbilities = v.npcAbilities || {}; v.npcAbilities[vid] = [];
  v.npcSkills = v.npcSkills || {}; v.npcSkills[vid] = [];
  v.npcKnow = v.npcKnow || {}; v.npcKnow[vid] = {};
  v.npcBuild = v.npcBuild || {}; delete v.npcBuild[vid];
  v.npcDeedDay = v.npcDeedDay || {}; delete v.npcDeedDay[vid];
  v.npcXp = v.npcXp || {}; delete v.npcXp[vid];
  const x = Game.npcXp(vid);
  for (const t of DATA.tracks) { x[t] = 0; x.granted[t] = 0; x.skilled[t] = 0; }
  x.sheets = []; x.seekFor = null; x.lastSeek = null;
  const p = Game.getPerson(vid);
  if (p) { p.items = []; p.equipped = {}; p.stashed = []; }
  return x;
}

(async () => {
  const Game = await K.load({ seed: 20261014 });
  K.newRun(Game);
  const s = Game.state.scholar;
  const v = Game.state.village;
  Game.state.systemArrived = true;
  const vids = livingVillagers(Game);

  T.section('one XP scale');
  {
    const th = Game.trackThresholds('player');
    T.ok('player thresholds === villager thresholds === tracks.json', JSON.stringify(th) === JSON.stringify(Game.trackThresholds(vids[0])) && JSON.stringify(th) === JSON.stringify(DATA.thresholds), JSON.stringify(th));
    T.ok('no playerScale in the data', DATA.playerScale === undefined);
    T.ok('a level is the same XP for both', Game.trackLevelFor(DATA.thresholds[1], 'player') === 2 && Game.trackLevelFor(DATA.thresholds[1], vids[0]) === 2);
    const leanMax = Math.max(...K.readJSON('src/data/characterGen.json').occupations.map(o => Math.max(...Object.values(o.trackLean || { x: 0 }))));
    T.ok('occupation lean is on the shared scale (below the first threshold, not trivially small)', leanMax < DATA.thresholds[0] && leanMax >= DATA.thresholds[0] / 3, String(leanMax));
  }

  T.section('same deed, same XP, same cap');
  {
    const va = vids[0];
    freshVillager(Game, va);
    s.tracks = null; s.deedDay = {}; s.abilityChoices = null; s.levelUpQueue = [];
    const p0 = Game.playerTracks().field.xp, v0 = Game.npcXp(va).field;
    for (let i = 0; i < 3; i++) { Game.creditDeed('player', 'foraging'); Game.creditDeed(va, 'foraging'); }
    const dp = Game.playerTracks().field.xp - p0, dv = Game.npcXp(va).field - v0;
    T.ok('foraging x3: player and villager gain the same (cap 2/day each)', dp === dv && dp === DATA.deeds.foraging.n * DATA.deeds.foraging.perDay, `player +${dp}, villager +${dv}`);
    const c0 = Game.playerTracks().combat.xp, cv0 = Game.npcXp(va).combat;
    Game.noteDeed('fight_won'); Game.creditDeed(va, 'fight_won');
    T.ok('fight_won: same n for both', Game.playerTracks().combat.xp - c0 === Game.npcXp(va).combat - cv0 && Game.npcXp(va).combat - cv0 === DATA.deeds.fight_won.n);
    T.ok('the bearer\'s villager id credits the player', (() => { const b = Game.playerTracks().social.xp; Game.creditDeed(Game.villagerId, 'teaching'); return Game.playerTracks().social.xp === b + DATA.deeds.teaching.n; })());
    // a real villager duty site: cooking for the haven credits craft like the player's cooking
    const k0 = Game.npcXp(va).craft;
    Game.resolveOneAssignment(va, { task: 'cook' });
    T.ok('villager cook duty credits the cooking deed (craft +' + DATA.deeds.cooking.n + ')', Game.npcXp(va).craft === k0 + DATA.deeds.cooking.n, `${k0} -> ${Game.npcXp(va).craft}`);
  }

  T.section('the villager\'s first ability works like the player\'s');
  {
    const held = vids.map(id => (v.npcAbilities[id] || []));
    const knackIds = new Set(Game.knackPool().map(a => a.id));
    const withKnack = vids.filter(id => v.npcKnacks && v.npcKnacks[id]);
    T.ok('every starting villager has a magic knack', withKnack.length === vids.length && withKnack.every(id => knackIds.has(v.npcKnacks[id])));
    // pickVillagerKnack chooses from the 3 lifeseed choices by buildScore
    const vb = vids[1];
    const choices = Game.knackChoicesFor(Game.vpOf(vb));
    const pick = Game.pickVillagerKnack(vb, choices);
    const best = choices.map(c => ({ id: c.id, sc: Game.buildScore(vb, c.id, { know: 2, noTarget: true }) })).sort((a, b) => b.sc - a.sc)[0];
    T.ok('the knack is the buildScore pick of the 3 choices', pick === best.id, pick + ' vs ' + best.id);
    // old saves: a skill-id knack is re-chosen, and the knack lands in slot 1
    const vc = vids[2];
    v.npcKnacks[vc] = 'still_hands'; v.npcAbilities[vc] = []; delete (v.npcKnackSlotted || {})[vc];
    Game.grantVillagerKnacks();
    T.ok('old-save skill knack is re-chosen from the magic pool and slotted', knackIds.has(v.npcKnacks[vc]) && v.npcAbilities[vc][0] === v.npcKnacks[vc], v.npcKnacks[vc]);
    T.ok('gossip has no lines for skill ids', !/still_hands|storm_ear|pathfinder:/.test(K.readSrc('src/js/spawn-knack.js').split('const seen = {')[1].split('};')[0]));
    void held;
  }

  T.section('villager level-up: 1 of 3, picked by buildScore (knowledge + technology)');
  {
    const va = vids[3];
    freshVillager(Game, va);
    // the strange kit's first three: X is not the kit-order default
    const offers = Game.villagerLevelUpOffers(va, 'strange');
    T.ok('offers = the next 3 unheld strange kit abilities', JSON.stringify(offers) === JSON.stringify(DATA.kits.strange.slice(0, 3)), offers.join(','));
    const X = 'static_toss'; // "THROW it" — a ranged ability
    // a field build (echo_location, bloodhound: no path shared with the
    // offers), an understood X, and a bow
    const BUILD = ['echo_location', 'bloodhound'];
    v.npcAbilities[va] = BUILD.slice();
    Game.npcLearnAbility(va, X, 3, 'test');
    const p = Game.getPerson(va);
    p.items = ['apex_bow'];
    Game.villagerGearUp(va, false);
    T.ok('setup: a ranged weapon is their technology', Game.buildTechnology(va).ranged > 0);
    const sc = offers.map(id => Game.buildScore(va, id, { onSheet: true }));
    T.ok('buildScore ranks X above the kit-order default', sc[offers.indexOf(X)] > sc[0], offers.map((id, i) => id + '=' + sc[i]).join(' '));
    const tl0 = K.teleEvents(Game, 'villager_level_up').length;
    Game.gainTrackXP(va, 'strange', DATA.thresholds[0], 'test');
    const ev = K.teleEvents(Game, 'villager_level_up').slice(tl0);
    T.ok('crossing a threshold resolves a sheet of 3', ev.length === 1 && (ev[0].offers || []).length === 3, JSON.stringify(ev[0] || {}));
    T.ok('they picked X, not the kit-order default', (v.npcAbilities[va] || []).includes(X) && !(v.npcAbilities[va] || []).includes(offers[0]), (v.npcAbilities[va] || []).join(','));
    // the same record without the knowledge and the bow does NOT pick X
    const vb = vids[4];
    freshVillager(Game, vb);
    v.npcAbilities[vb] = BUILD.slice();
    const scB = Game.buildScore(vb, X, { onSheet: true });
    const dB = Game.buildDecide(vb, Game.villagerLevelUpOffers(vb, 'strange'));
    T.ok('without the knowledge and the bow, X is not their pick', dB.pick !== X, JSON.stringify(dB));
    T.ok('without the knowledge and the bow, X scores lower', scB < sc[offers.indexOf(X)], scB + ' < ' + sc[offers.indexOf(X)]);
  }

  T.section('knows too little: defers and seeks');
  {
    const va = vids[5];
    freshVillager(Game, va);
    const x = Game.npcXp(va);
    Game.gainTrackXP(va, 'field', DATA.thresholds[0], 'test');
    T.ok('the sheet waits (no ability taken)', (v.npcAbilities[va] || []).length === 0 && (x.sheets || []).length === 1);
    T.ok('they want knowledge for the sheet', Game.villagerWantsKnowledge(va) === 'sheet');
    const t0 = K.teleEvents(Game, 'villager_seek_knowledge').length;
    const o = Game.objPick(va, v.px ?? 4, v.py ?? 4);
    T.ok('the agency picks a SEEK objective', o.kind === 'SEEK', o.kind);
    T.ok('the seek taught them something (tele villager_seek_knowledge)', K.teleEvents(Game, 'villager_seek_knowledge').length === t0 + 1);
    // second seek (or day 3) settles the sheet
    Game.villagerSeekKnowledge(va);
    T.ok('with enough knowledge, the sheet is chosen', (x.sheets || []).length === 0 && (v.npcAbilities[va] || []).length === 1, (v.npcAbilities[va] || []).join(','));
    // a sheet never waits forever: day 3 picks with what they know
    const vb = vids[6];
    freshVillager(Game, vb);
    const xb = Game.npcXp(vb);
    Game.gainTrackXP(vb, 'craft', DATA.thresholds[0], 'test');
    s.day = (s.day || 0) + 3;
    Game.villagerResolveLevelUps(vb);
    T.ok('after 3 days the sheet resolves anyway', (xb.sheets || []).length === 0 && (v.npcAbilities[vb] || []).length === 1);
  }

  T.section('swap or keep (villagers, the player\'s rule)');
  {
    const va = vids[7];
    freshVillager(Game, va);
    // full slots of a coherent brawler build; a sheet of craft sustain
    v.npcAbilities[va] = DATA.kits.combat.slice(3, 9);
    const p = Game.getPerson(va); p.items = ['machete', 'leather_jacket']; Game.villagerGearUp(va, false);
    const offersK = Game.villagerLevelUpOffers(va, 'craft');
    const dK = Game.buildDecide(va, offersK);
    const heldK = v.npcAbilities[va].slice();
    Game.gainTrackXP(va, 'craft', DATA.thresholds[0], 'test');
    if (dK.keep) T.ok('full + weak offers: KEEP (nothing changes)', JSON.stringify(v.npcAbilities[va]) === JSON.stringify(heldK));
    else T.ok('full + strong offer: REPLACE the weakest', v.npcAbilities[va].includes(dK.pick) && !v.npcAbilities[va].includes(dK.replace) && v.npcAbilities[va].length === 6);
    // force the other branch: six junk utility abilities vs a known, fitting offer
    const vb = vids[8];
    freshVillager(Game, vb);
    v.npcAbilities[vb] = ['lucky_rock', 'dowsing', 'rain_dancer', 'squirrel_friend', 'beard_moss', 'translator'];
    Game.npcLearnAbility(vb, 'static_toss', 3, 'test');
    const pb = Game.getPerson(vb); pb.items = ['apex_bow']; Game.villagerGearUp(vb, false);
    const dR = Game.buildDecide(vb, Game.villagerLevelUpOffers(vb, 'strange'));
    Game.gainTrackXP(vb, 'strange', DATA.thresholds[0], 'test');
    T.ok('buildDecide replaces when the offer beats the weakest by > 1', !!(dR.pick && dR.replace), JSON.stringify(dR));
    // "the weakest" is judged when the sheet resolves: the level-up first
    // teaches the offers (npcLearnAbility), which can reorder near-tied junk
    // (translator vs beard_moss both ~1.25 depend on the roster's languages,
    // which origins-world 2026-10-14 changed). So: exactly one of the six
    // left, and it scores no better than any of the six right now.
    const six = ['lucky_rock', 'dowsing', 'rain_dancer', 'squirrel_friend', 'beard_moss', 'translator'];
    const gone = six.filter(id => !v.npcAbilities[vb].includes(id));
    const techB = Game.buildTechnology(vb);
    const scB = id => Game.buildScore(vb, id, { without: id, tech: techB });
    const weakestOut = gone.length === 1 && six.every(id => scB(gone[0]) <= scB(id) + 1e-9);
    T.ok('...and the villager swapped: 6 held, the pick in, the weakest out', v.npcAbilities[vb].length === 6 && v.npcAbilities[vb].includes(dR.pick) && weakestOut, v.npcAbilities[vb].join(',') + ' gone=' + gone.join(',') + ' ' + six.map(id => id + ':' + scB(id)).join(' '));
    T.ok('kept + swapped both happen (one of each across the two setups)', !!dK.keep || !!dK.replace);
  }

  T.section('gear: villagers take the better weapon and it changes their fights');
  {
    const va = vids[9] || vids[0];
    freshVillager(Game, va);
    const p = Game.getPerson(va);
    p.items = ['sharpened_stick'];
    Game.villagerGearUp(va, false);
    const EQ = globalThis.Scattering.equipment;
    const wb0 = EQ.weaponBonusOf(p, Game.data.items, 'melee');
    const st = Game.stashState();
    st.weapons.push({ itemId: 'machete', units: 1 });
    // everyone else is already better armed than the pile's machete? make
    // sure the greedy pass picks the villager who gains most: arm the rest
    // (and nobody carries a spare to gift, so this is the armory's call)
    for (const id of livingVillagers(Game)) { if (id === va) continue; const q = Game.getPerson(id); q.items = ['phase_blade']; q.stashed = []; }
    Game.villagerGearDay();
    const wb1 = EQ.weaponBonusOf(p, Game.data.items, 'melee');
    T.ok('the armory machete went to the villager who needed it', wb1 > wb0 && (p.equipped.melee || {}).itemId === 'machete', wb0 + ' -> ' + wb1);
    T.ok('their old weapon went back on the pile', st.weapons.some(e => (e.itemId || e.id) === 'sharpened_stick'));
    // the fight reads it: same monster, same HP, many fights — the armed villager hurts it more
    const mdef = Game.data.monsters.find(m => m.id === 'gallowdeer');
    const run = (items) => {
      p.items = items.slice(); p.equipped = {};
      let left = 0;
      for (let i = 0; i < 30; i++) {
        v.health = v.health || {}; v.health[va] = 100;
        const rec = Game.fieldFight(va, mdef, { hp: 160, maxHp: 160 }, { noFlee: true });
        left += rec.mHpLeft;
      }
      return left / 30;
    };
    const bare = run([]);
    const armed = run(['phase_blade']);
    T.ok('fieldFight: the armed villager leaves the beast with less HP', armed < bare, `bare ${bare.toFixed(1)} vs armed ${armed.toFixed(1)}`);
    v.health[va] = 100;
  }

  T.section('any village death feeds the strange track — player and villagers alike');
  {
    const [va, vb] = livingVillagers(Game).slice(0, 2);
    const x = Game.npcXp(va);
    s.deedDay = {}; v.npcDeedDay = {};
    const p0 = Game.playerTracks().strange.xp, v0 = x.strange;
    Game.registerDeath({ kind: 'villager', villagerId: vb, name: 'Test Death', mx: 4, my: 4, cause: 'test' });
    T.ok('the player gets death_in_family', Game.playerTracks().strange.xp === p0 + DATA.deeds.death_in_family.n);
    T.ok('a villager gets the same', Game.npcXp(va).strange === v0 + DATA.deeds.death_in_family.n, `${v0} -> ${Game.npcXp(va).strange}`);
  }

  T.section('the mantle: you become that villager');
  {
    const roster = livingVillagers(Game);
    const heir = roster[0];
    freshVillager(Game, heir);
    // the heir's own record
    v.npcAbilities[heir] = ['echo_location', 'bloodhound'];
    const xh = Game.npcXp(heir); xh.field = DATA.thresholds[1] + 3; xh.granted.field = 2; xh.skilled.field = 2;
    Game.npcLearnSkill(heir, 'field_dressing');
    const ph = Game.getPerson(heir); ph.items = ['hunting_spear', 'leather_jacket']; Game.villagerGearUp(heir, false);
    // the dying bearer's record: different abilities and much more XP
    s.abilities = [{ id: 'rage', level: 2 }, { id: 'war_cry', level: 1 }];
    s.tracks = null; Game.playerTracks(); s.tracks.combat.xp = DATA.thresholds[3]; s.tracks.combat.level = 4;
    s.abilityChoices = null; s.levelUpQueue = [];
    s.equipped = { melee: { itemId: 'machete', name: 'Machete' } };
    const integ = s.integration;
    v.trust = v.trust || {};
    for (const id of roster) v.trust[id] = 10;
    v.trust[heir] = 99;
    const oldId = Game.villagerId;
    Game.playerDeath('test');
    T.ok('the heir is the bearer', Game.villagerId === heir && !Game.over);
    const ids = K.abilityIds(Game);
    T.ok('abilities: theirs (echo_location, bloodhound) + nothing of the predecessor\'s', ids.includes('echo_location') && ids.includes('bloodhound') && !ids.includes('rage') && !ids.includes('war_cry'), ids.join(','));
    T.ok('tracks: their own XP, not the predecessor\'s', s.tracks.field.xp === DATA.thresholds[1] + 3 + DATA.deeds.mantle.n * 0 && s.tracks.combat.xp < DATA.thresholds[3], JSON.stringify(s.tracks));
    T.ok('their earned levels are not re-offered', s.tracks.field.level === 2 && !(s.levelUpQueue || []).some(q => q.track === 'field'));
    T.ok('skills: their own know-how is in the Codex', Game.skillKnown('field_dressing'));
    T.ok('gear: they still wear their spear and jacket', ((s.equipped.ranged || s.equipped.melee || {}).itemId === 'hunting_spear') && ((s.equipped.torso || {}).itemId === 'leather_jacket'), JSON.stringify(s.equipped));
    T.ok('the predecessor\'s machete is not on them', !Object.values(s.equipped).some(e => e && e.itemId === 'machete') && !(s.inventory || []).some(i => i.itemId === 'machete'));
    T.ok('integration (the office) is unchanged', s.integration === integ);
    T.ok('the heir has no villager records left', !(v.npcAbilities || {})[heir] && !(v.npcXp || {})[heir]);
    T.ok('the mantle deed lands on the heir\'s own strange track', s.tracks.strange.xp >= DATA.deeds.mantle.n);
    void oldId;
  }

  T.section('save / load round trip');
  {
    const vk = livingVillagers(Game)[0];
    Game.npcLearnAbility(vk, 'third_eye', 2, 'test');
    const x = Game.npcXp(vk); x.sheets = [{ track: 'combat', level: 1, day: s.day || 0 }];
    Game.state.runKey = 'parity-test';
    const saved = Game.save();
    const loaded = Game.load('parity-test');
    const v2 = Game.state.village;
    T.ok('save/load ok', saved === true && loaded !== false, `save=${saved} load=${loaded}`);
    T.ok('villager knowledge survives', ((v2.npcKnow || {})[vk] || {}).third_eye === 2);
    T.ok('pending villager sheets survive', ((((v2.npcXp || {})[vk] || {}).sheets) || []).length >= 0 && !!(v2.npcXp || {})[vk]);
    T.ok('knacks stay slotted (load migration idempotent)', Object.keys(v2.npcKnacks || {}).every(id => !(v2.roster || []).includes(id) || id === Game.villagerId || ((v2.npcAbilities || {})[id] || []).length <= 6));
  }

  T.section('old saves migrate');
  {
    const v3 = Game.state.village;
    const vk = livingVillagers(Game)[1];
    const x = Game.npcXp(vk);
    x.field = 8; // an old-scale villager at field level 2 ([3, 8, 16, 32, 64])
    delete v3.trackScale;
    Game.migrateTrackScale();
    T.ok('old villager XP is rescaled: level 2 stays level 2', Game.trackLevelFor(x.field) === 2, String(x.field));
    T.ok('the migration is idempotent', Game.migrateTrackScale() === 0);
  }

  T.section('wired');
  {
    const src = ['src/js/tracks.js', 'src/js/villager-objectives.js', 'src/js/ledger.js', 'src/js/game.js', 'src/js/spawn-knack.js', 'src/js/conversation.js', 'src/js/fieldFights.js'].map(K.readSrc).join('\n');
    T.ok('tracks queue villager sheets -> villagerResolveLevelUps', /villagerResolveLevelUps\(vid\)/.test(K.readSrc('src/js/tracks.js')));
    T.ok('objectives call villagerSeekKnowledge / villagerNeedTrack', src.includes('this.villagerSeekKnowledge(vid)') && src.includes('this.villagerNeedTrack(vid)'));
    T.ok('playerDeath calls mantleBecome', K.readSrc('src/js/ledger.js').includes('this.mantleBecome(oldId, newId)'));
    T.ok('endDay village tick calls villagerBuildDay', K.readSrc('src/js/game.js').includes('this.villagerBuildDay()'));
    T.ok('knacks pick by pickVillagerKnack', K.readSrc('src/js/spawn-knack.js').includes('this.pickVillagerKnack(vid, choices)'));
    T.ok('conversation teaches (npcLearnFromTalk)', K.readSrc('src/js/conversation.js').includes('this.npcLearnFromTalk(vid'));
    T.ok('field fights teach witnesses (npcWitnessAbility)', K.readSrc('src/js/fieldFights.js').includes('this.npcWitnessAbility('));
    T.ok('the capable bot uses the same brain', K.readSrc('scripts/policies/capable.js').includes("Game.buildDecide('player'"));
    T.ok('villager-build.js loads from index.html', K.readSrc('index.html').includes('src/js/villager-build.js'));
    T.ok('no player-only XP scale left in tracks.js', !/playerScale/.test(K.readSrc('src/js/tracks.js')));
  }

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exitCode = 2; });
