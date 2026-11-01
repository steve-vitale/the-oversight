'use strict';
// Real paid production, shared deed accounting and source-hook controls.
const assert = require('assert/strict'), fs = require('fs'), cp = require('child_process');
const K = require('./lib'), mode = process.argv[2] || 'normal';
async function run() {
  const read = fs.readFileSync;
  const removed = mode.startsWith('removed-') ? mode.slice(8) : null;
  if (removed) fs.readFileSync = function (file, ...args) {
    let text = read.call(this, file, ...args);
    const suffix = removed === 'armor' ? '/src/js/villager-build.js' : '/src/js/game.js';
    if (String(file).replace(/\\/g, '/').endsWith(suffix)) {
      const before = String(text), marker = removed === 'armor'
        ? "this.creditDeed(vid, 'crafting'); // actual armor production"
        : "this.creditDeed(vid, 'crafting'); // actual ammo production";
      const after = before.replace(marker, '/* actual production credit removed */');
      assert.notEqual(after, before, 'must remove the real production hook');
      text = typeof text === 'string' ? after : Buffer.from(after);
    }
    return text;
  };
  let G; try { G = await K.load({ seed: 7 }); } finally { fs.readFileSync = read; }
  const T = K.reporter('NPC successful production deeds');
  const fixed = (n, f) => { const r = Math.random; Math.random = () => n; try { return f(); } finally { Math.random = r; } };
  function fresh() {
    G.over = false; G.tbfight = null; K.newRun(G);
    const s = G.state.scholar, v = G.state.village;
    const ids = v.roster.filter(id => id !== G.villagerId && G.npcAge(id) >= 18);
    assert(ids.length >= 2); const id = ids[0], other = ids[1], p = G.getPerson(id);
    s.day = 85; s.dayTicks = 128; s.actionClock = 0; G.dayPart = 1;
    v.roster = [G.villagerId, id, other]; v.away = {}; v.npcDeedDay = {}; v.avCraftCd = {};
    v.health = { [id]: 100, [other]: 100 };
    for (const who of [id, other]) { const p = G.getPerson(who); p.items = []; p.stashed = []; p.equipped = {}; G.npcSetNode(who, 4, 4); }
    return { s, v, id, other, p };
  }
  function supply(c, kind) {
    const r = G.data.recipes.find(r => r.id === kind); assert(r);
    Object.assign(G.stashState().materials, r.materials);
    if (kind === 'bark_armor') {
      c.p.items.push('bark_armor'); c.p.equipped.torso = { itemId: kind };
      (c.v.avCraft ||= {})[c.id] = { [kind]: 2 };
    } else {
      const weapon = kind === 'bolt' ? 'crossbow' : 'bow';
      c.p.items.push(weapon); c.p.equipped.ranged = { itemId: weapon };
      (c.v.ammoCraft ||= {})[c.id] = { [kind]: 2 };
    }
    return r;
  }
  const xp = id => G.npcXp(id).craft;
  let c = fresh(), r = G.data.recipes.find(r => r.id === 'bark_armor');
  c.s.inventory = Object.entries(r.materials).map(([material, units]) => ({ material, units }));
  G.learnRecipe(r.id, 3); let old = G.playerTracks().craft.xp;
  assert(fixed(.1, () => G.craft(r.id))); const playerGain = G.playerTracks().craft.xp - old;
  T.ok('real player success establishes the shared authored credit', playerGain === G.trackData().deeds.crafting.n);
  for (const kind of ['bark_armor', 'arrow', 'bolt']) {
    c = fresh(); r = supply(c, kind); old = xp(c.id);
    const bearerXp = G.playerTracks().craft.xp, otherXp = xp(c.other);
    const result = fixed(.1, () => kind === 'bark_armor' ? G.villagerArmorCraftDay() : G.villagerPocketAmmo(c.id));
    assert(kind === 'bark_armor' ? result === 1 : result.craftedOk, kind + ' actual success required');
    assert.equal(xp(c.id) - old, playerGain, kind + ' must earn the same crafting deed as the player');
    T.ok(kind + ' pays actual materials and credits its own maker once per batch',
      Object.keys(r.materials).every(m => G.stashState().materials[m] === 0) && c.v.npcDeedDay[c.id].crafting.n === 1 &&
      G.playerTracks().craft.xp === bearerXp && xp(c.other) === otherXp);
    const after = xp(c.id);
    fixed(.1, () => kind === 'bark_armor' ? G.villagerArmorCraftDay() : G.villagerPocketAmmo(c.id));
    T.ok(kind + ' repeat/cooldown or full quiver gives no extra deed', xp(c.id) === after);
    c = fresh(); supply(c, kind); old = xp(c.id);
    fixed(.99, () => kind === 'bark_armor' ? G.villagerArmorCraftDay() : G.villagerPocketAmmo(c.id));
    T.ok(kind + ' paid failure consumes materials without successful-work XP', xp(c.id) === old && Object.keys(r.materials).every(m => G.stashState().materials[m] === 0));
    c = fresh(); supply(c, kind); G.stashState().materials = {}; old = xp(c.id);
    fixed(.1, () => kind === 'bark_armor' ? G.villagerArmorCraftDay() : G.villagerPocketAmmo(c.id));
    T.ok(kind + ' missing materials earns no credit', xp(c.id) === old && !c.v.npcDeedDay[c.id]);
    c = fresh(); supply(c, kind); c.p.dead = true; old = xp(c.id);
    fixed(.1, () => kind === 'bark_armor' ? G.villagerArmorCraftDay() : G.villagerPocketAmmo(c.id));
    T.ok(kind + ' dead resident earns no credit', xp(c.id) === old);
  }
  c = fresh(); supply(c, 'arrow'); c.p.stashed = [{ itemId: 'arrow', units: 5 }]; old = xp(c.id);
  const pocket = G.villagerPocketAmmo(c.id);
  T.ok('moving existing ammunition is not crafting', pocket.pocketed === 5 && pocket.crafted === 0 && xp(c.id) === old);
  c = fresh(); supply(c, 'arrow'); old = xp(c.id);
  G.creditDeed(c.id, 'crafting');
  assert(fixed(.1, () => G.villagerPocketAmmo(c.id)).craftedOk);
  supply(c, 'bark_armor'); assert.equal(fixed(.1, () => G.villagerArmorCraftDay()), 1);
  T.ok('other crafting, arrows and armor share one existing per-person daily cap', xp(c.id) - old === 2 * playerGain && c.v.npcDeedDay[c.id].crafting.n === 2);
  c.s.day++; c.p.items = c.p.items.filter(i => (typeof i === 'string' ? i : i.itemId) !== 'arrow'); supply(c, 'arrow');
  assert(fixed(.1, () => G.villagerPocketAmmo(c.id)).craftedOk);
  T.ok('a later real day earns credit again', xp(c.id) - old === 3 * playerGain && c.v.npcDeedDay[c.id].crafting.n === 1);
  c = fresh(); supply(c, 'arrow'); G.state.systemArrived = true;
  const track = G.npcXp(c.id), threshold = G.trackThresholds(c.id)[0];
  track.craft = threshold - playerGain; track.granted.craft = 0;
  (c.v.npcAbilities ||= {})[c.id] = []; track.sheets = [];
  assert(fixed(.1, () => G.villagerPocketAmmo(c.id)).craftedOk);
  T.ok('real production earns a level sheet without bypassing build knowledge',
    track.craft === threshold && track.granted.craft === 1 && track.sheets.length === 1 && track.seekFor === 'craft',
    JSON.stringify({ threshold, track, abilities: c.v.npcAbilities[c.id] }));
  // Prepared knowledge prerequisite, not free knowledge in a natural campaign.
  G.npcLearnAbility(c.id, 'echo_location', 2, 'prepared-test');
  G.npcLearnAbility(c.id, 'lucky_rock', 2, 'prepared-test');
  const choice = G.villagerResolveLevelUps(c.id);
  T.ok('the earned sheet resolves through the real build brain once informed',
    choice === 'picked' && c.v.npcAbilities[c.id].length === 1 && !track.sheets.length);
  assert.equal(T.done().fail, 0);
  if (mode === 'normal') for (const hook of ['armor', 'ammo']) {
    const child = cp.spawnSync(process.execPath, [__filename, 'removed-' + hook], { encoding: 'utf8', windowsHide: true, timeout: 60000 });
    assert.notEqual(child.status, 0); assert.match(child.stderr, /must earn the same crafting deed as the player/);
    console.log('Actual removed ' + hook + ' credit hook rejected');
  }
}
run().catch(e => { console.error(e.stack); process.exitCode = 1; });
