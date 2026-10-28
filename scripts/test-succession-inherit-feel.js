#!/usr/bin/env node
// test-succession-inherit-feel.js -- PROOF for tackle-succession (Steve
// 2026-10-27: when the player takes over as a villager, that character must
// feel purpose-made and intentional -- the items they would have, the
// choices they have made, their build -- not a blank or reset character).
//
// Method: plant a fully-owned heir before a death mantle, then check what
// the new bearer wakes up with. Named takeover case: death mantle via
// Game.playerDeath, heir = highest-trust NPC. Bars (see evidence bars file):
// items, stashed, worn slots, abilities (+knack), tracks (+sheets), knowledge
// (plants/skills/ability levels), languages, bonds/goal, predecessor leak,
// and the unchanged new-body rules. Exit 0 = all green, 1 = failure.
// Usage: node scripts/test-succession-inherit-feel.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(id, ok, detail) {
  console.log(`  [${ok ? 'OK' : 'FAIL'}] ${id}${detail ? ' -- ' + detail : ''}`);
  if (!ok) fails++;
}
const idOf = (it) => (typeof it === 'string' ? it : (it && (it.itemId || it.id)) || it);

(async () => {
  const { Game } = await loadGame({ seed: 4242, mode: 'test-succession-inherit-feel' });
  Game.say = () => {}; Game.sysSay = () => {};
  await setupGame(Game);
  const v = Game.state.village, s = Game.state.scholar;
  const oldId = Game.villagerId;
  const npcs = (v.roster || []).filter(id => id !== oldId);
  if (npcs.length < 2) { console.log('need 2 NPCs'); process.exit(1); }
  const heir = npcs[0], other = npcs[1];
  for (const id of npcs) v.trust[id] = 5;
  v.trust[heir] = 90;
  const person = Game.getPerson(heir);
  const EQ = globalThis.Scattering.equipment;

  // ---- plant the heir's own life ----
  person.languages = { native: 'spanish', levels: { spanish: 2, english: 1 } };
  try { EQ.autoEquip(person, Game.data.items); } catch (e) {}
  const wornBefore = {};
  for (const [sl, e] of Object.entries(person.equipped || {})) {
    if (e && e.itemId) wornBefore[sl] = e.itemId;
  }
  const itemsBefore = (person.items || []).map(idOf).filter(Boolean);
  // A stashed belonging at their space (not carried, not worn).
  const defs = Game.data.items || [];
  const stashDef = defs.find(d => d && d.id && !itemsBefore.includes(d.id)
    && !d.weapon && !d.armor && d.class !== 'sentimental') || { id: 'lighter' };
  person.stashed = [stashDef.id];
  // Abilities + knack + tracks + a pending sheet.
  v.npcAbilities = v.npcAbilities || {};
  if (!((v.npcAbilities[heir] || []).length)) v.npcAbilities[heir] = ['beast_calm'];
  const abilBefore = (v.npcAbilities[heir] || []).slice();
  v.npcKnacks = v.npcKnacks || {};
  v.npcKnacks[heir] = abilBefore[0];
  const T = Game.trackData ? Game.trackData() : { tracks: [] };
  v.npcXp = v.npcXp || {};
  // The heir's EFFECTIVE record, exactly as mantleBecome reads it (map
  // entry, else the npcXp() computation) — then add a pending sheet to a
  // COPY of it. (Overwriting the entry with a sheets-only object would
  // clobber the heir's real per-track xp and fake a tracks failure.)
  const effX = (v.npcXp[heir] && Object.keys(v.npcXp[heir]).length)
    ? Object.assign({}, v.npcXp[heir])
    : (Game.npcXp ? (Game.npcXp(heir) || {}) : {});
  const xpBefore = Object.assign({}, effX);
  if (T.tracks && T.tracks.length) {
    xpBefore.sheets = [{ track: T.tracks[0], level: 1 }];
    v.npcXp[heir] = xpBefore;
  }
  // Knowledge: a skill the Codex does not yet hold, a plant list, an
  // ability-knowledge entry above the Codex level.
  const codexSkillsBefore = Object.keys((Game.state.codex || {}).skills || {});
  const knowDefs = (() => { try { return Game.data.knowledge || []; } catch (e) { return []; } })();
  const skillId = (knowDefs.map(k => k.id).find(id => !codexSkillsBefore.includes(id))) || 'herbal_medicine';
  v.npcSkills = v.npcSkills || {};
  v.npcSkills[heir] = [skillId];
  const plantsBefore = Game.plantsKnownBy ? Game.plantsKnownBy(heir) : [];
  const abilDefs = Game.data.abilities || [];
  const knowId = (abilDefs.map(a => a.id).find(id => !abilBefore.includes(id)
    && ((Game.state.codex.abilities || {})[id] || {}).level < 2)) || abilBefore[0];
  v.npcKnow = v.npcKnow || {};
  v.npcKnow[heir] = Object.assign({}, (v.npcKnow[heir] || {}), { [knowId]: 2 });
  // Relationships + goal + deed/godhood records.
  let bondBefore = null;
  try { Game.bondAdd(heir, other, 30, 'inherit-feel probe'); bondBefore = Game.bondGet(heir, other); } catch (e) {}
  const goalBefore = person.goal;
  v.npcDeedDay = v.npcDeedDay || {};
  v.npcDeedDay[heir] = { inherit_feel_marker: 1 };
  v.npcGodhood = v.npcGodhood || {};
  v.npcGodhood[heir] = { recognized: { inherit_feel: true }, active: [] };
  v.npcGodpath = v.npcGodpath || {};
  v.npcGodpath[heir] = { path: 'inherit_feel_path' };
  // Predecessor's own gear (must NOT auto-transfer).
  const oldInvBefore = (s.inventory || []).map(idOf).filter(Boolean);
  const oldEqBefore = Object.values(s.equipped || {}).map(idOf).filter(Boolean);
  const oldGear = [...new Set([...oldInvBefore, ...oldEqBefore])].filter(id => !itemsBefore.includes(id));

  console.log(`old bearer: ${oldId}, heir: ${heir} (${person.name}), goal: ${goalBefore}`);
  console.log(`heir wore: ${JSON.stringify(wornBefore)}; carried: ${itemsBefore.length}; stashed: ${stashDef.id}; abilities: ${abilBefore.join(',')}`);

  // ---- the death ----
  Game.playerDeath('the hunt');
  const ns = Game.state.scholar;
  check('heir-took-mantle', Game.villagerId === heir, `new=${Game.villagerId} heir=${heir}`);
  const invAfter = (ns.inventory || []).map(idOf).filter(Boolean);
  const eqAfter = {};
  for (const [sl, e] of Object.entries(ns.equipped || {})) if (e && e.itemId) eqAfter[sl] = e.itemId;
  const heldAfter = new Set([...invAfter, ...Object.values(eqAfter)]);

  check('items-carried', itemsBefore.every(id => heldAfter.has(id)),
    `missing=${itemsBefore.filter(id => !heldAfter.has(id)).join(',') || 'none'}`);
  check('stashed-carried', heldAfter.has(stashDef.id) && !(person.stashed || []).length,
    `inPack=${heldAfter.has(stashDef.id)} personStashed=${JSON.stringify(person.stashed)}`);
  const wornLost = Object.entries(wornBefore).filter(([sl, id]) => eqAfter[sl] !== id);
  check('worn-preserved', wornLost.length === 0,
    wornLost.length ? `moved=${wornLost.map(([sl, id]) => `${sl}:${id}->${eqAfter[sl] || '-'}`).join(',')}` : `slots=${Object.keys(wornBefore).join(',')}`);
  const abilAfter = (ns.abilities || []).map(a => a.id);
  check('abilities-carried', abilBefore.length === abilAfter.length && abilBefore.every(id => abilAfter.includes(id)),
    `after=${abilAfter.join(',')}`);
  const knackEntry = (ns.abilities || []).find(a => a.id === abilBefore[0]);
  check('knack-latent', !!(knackEntry && knackEntry.latent), `knack=${abilBefore[0]} latent=${knackEntry && knackEntry.latent}`);
  // Tracks: the heir's record, plus the two documented death deeds that
  // land on the NEW bearer after the mantle (tracks.json: mantle +2
  // strange, death_in_family +1 strange). Those are the death's own events,
  // not the heir's record, so strange expects heir + 3.
  let tracksOk = true;
  for (const t of (T.tracks || [])) {
    const want = (effX[t] || 0) + (t === 'strange' ? 3 : 0);
    if (((ns.tracks || {})[t] || {}).xp !== want) tracksOk = false;
  }
  check('tracks-carried', tracksOk, `tracks=${JSON.stringify(ns.tracks)}`);
  if (xpBefore.sheets) {
    check('sheets-carried', (ns.levelUpQueue || []).some(q => q.track === xpBefore.sheets[0].track && q.level === xpBefore.sheets[0].level),
      `queue=${JSON.stringify(ns.levelUpQueue)}`);
  }
  const codexPlants = Object.keys((Game.state.codex || {}).plants || {});
  check('plants-carried', plantsBefore.every(pid => codexPlants.includes(pid)),
    `missing=${plantsBefore.filter(pid => !codexPlants.includes(pid)).join(',') || 'none'}`);
  check('skill-carried', !!((Game.state.codex || {}).skills || {})[skillId],
    `skill=${skillId} codexSkills=${Object.keys((Game.state.codex || {}).skills || {}).join(',')}`);
  check('ability-knowledge-carried', (((Game.state.codex || {}).abilities || {})[knowId] || {}).level >= 2,
    `know=${knowId} level=${(((Game.state.codex || {}).abilities || {})[knowId] || {}).level}`);
  // Languages: the heir's own tongues + their occupation's polyglot, never
  // the predecessor's.
  const occ = (((Game.data.characterGen || {}).occupations) || []).find(o => o.id === person.occupationId) || {};
  const wantLangs = Game.levelsOf(person.languages);
  for (const l of (occ.polyglot || [])) wantLangs[l] = 2;
  const langsOk = Object.keys(wantLangs).every(l => (ns.languages || {})[l] === wantLangs[l])
    && (ns.englishLevel === (wantLangs.english != null ? wantLangs.english : 2));
  check('languages-carried', langsOk,
    `after=${JSON.stringify(ns.languages)} englishLevel=${ns.englishLevel} want=${JSON.stringify(wantLangs)}`);
  if (bondBefore) {
    const bondAfter = Game.bondGet(heir, other);
    check('bond-carried', bondAfter && bondAfter.v === bondBefore.v && bondAfter.depth === bondBefore.depth,
      `before=${JSON.stringify(bondBefore)} after=${JSON.stringify(bondAfter)}`);
  }
  check('goal-carried', person.goal === goalBefore, `goal=${person.goal}`);
  check('deedday-carried', (ns.deedDay || {}).inherit_feel_marker === 1, `deedDay=${JSON.stringify(ns.deedDay)}`);
  check('godhood-carried', !!((ns.godhood || {}).recognized || {}).inherit_feel, `godhood=${JSON.stringify(ns.godhood)}`);
  check('godpath-carried', (ns.godpath || {}).path === 'inherit_feel_path', `godpath=${JSON.stringify(ns.godpath)}`);
  const leaked = oldGear.filter(id => heldAfter.has(id));
  check('predecessor-gear-not-transferred', leaked.length === 0, `leaked=${leaked.join(',') || 'none'}`);
  check('new-body-statuses-empty', (ns.statuses || []).length === 0 && (ns.diseases || []).length === 0 && (ns.poisons || []).length === 0, '');
  check('new-body-stats', (ns.stats || {}).str === 5 || typeof (ns.stats || {}).str === 'number', `stats=${JSON.stringify(ns.stats)}`);

  // Sense read, as a person would read it: does the new bearer read as the
  // heir who lived here, not as a reset stranger?
  const senseBits = [
    `bearer ${person.name}`,
    `goal ${person.goal}`,
    `wears ${Object.values(eqAfter).join(', ') || 'nothing'}`,
    `carries ${invAfter.join(', ') || 'nothing'}`,
    `speaks ${Object.keys(ns.languages || {}).join(', ')}`,
    `knows ${abilAfter.join(', ')}`,
  ];
  console.log('SENSE: ' + senseBits.join(' | '));

  console.log(fails ? `\n${fails} FAILURES` : '\nALL GREEN');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('THREW:', e.stack); process.exit(1); });
