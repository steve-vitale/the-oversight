// scripts/test-ladder-minting.js — ladder minting-per-track, discovery-once,
// capstone checks, and beat/tick proofs (leg 1).
// Prereg: evidence/2026-11-08/sim-ladder-leg1-prereg.md (bars L1/L3).
// Uses the shared kit (scripts/godpath/lib.js); rigged states, no seeds.
'use strict';
const K = require('./godpath/lib');

function resetXp(Game) {
  const T = ['combat', 'field', 'social', 'craft', 'strange'];
  const pt = Game.playerTracks();
  for (const t of T) pt[t].xp = 0;
  const roster = ((Game.state.village || {}).roster || []);
  for (const vid of roster) {
    if (!vid || vid === Game.villagerId) continue;
    const vp = Game.vpOf ? Game.vpOf(vid) : null;
    if (vp && vp.dead) continue;
    const x = Game.npcXp(vid);
    for (const t of T) x[t] = 0;
  }
}

function resetLadderState(Game) {
  resetXp(Game);
  Game.state.waveLedger = {};
  Game.state.feastLog = [];
  Game.state.waveKillLog = [];
  try { Game.deedState().contestsSurvived = 0; } catch (e) {}
  try { Game.state.codex = { plants: {}, monsters: {}, animals: {}, recipes: {}, techniques: {}, skills: {} }; } catch (e) {}
  try { const ls = Game.hierarchyState(); ls.length = 0; } catch (e) {}
  delete Game.state._ladderPeakStage;
  delete Game.state._ladderCapBeat;
  try { Game.state.nationalLive = false; Game.state.globalLive = false; Game.state.networkLive = false; } catch (e) {}
  try { delete Game.progState().ladderCapstone; } catch (e) {}
}

// Three seasoned subordinate links make a realm (polityOf('haven')), so
// each one counts as a seasoned regional+ link for Talk — and as an active
// link for Explore (iii). Day is 40 days back (season = 30+ days, trust 40+).
function rigRealmLinks(Game) {
  const day = ((Game.state.scholar || {}).day || 0);
  const ls = Game.hierarchyState();
  for (let i = 1; i <= 3; i++) {
    ls.push({ status: 'active', primary: 'haven', subordinate: 'village' + i, day: day - 40, trust: 50 });
  }
}

function livingVillager(Game, exclude) {
  const roster = ((Game.state.village || {}).roster || []);
  for (const vid of roster) {
    if (!vid || vid === Game.villagerId || vid === exclude) continue;
    const vp = Game.vpOf ? Game.vpOf(vid) : null;
    if (vp && !vp.dead) return vid;
  }
  return null;
}

async function main() {
  const T = K.reporter('test-ladder-minting');
  const Game = await K.load({ seed: 7 });
  K.newRun(Game);
  const day = ((Game.state.scholar || {}).day || 0);

  // --- Fight: 1pt per 2 wave-ledger pts, waves 3-5 only ---
  resetLadderState(Game);
  Game.state.waveLedger = {
    1: { points: 10, perType: {}, perTypeX: {} },
    2: { points: 10, perType: {}, perTypeX: {} },
    3: { points: 4, perType: {}, perTypeX: {} },
    4: { points: 2, perType: {}, perTypeX: {} },
    5: { points: 0, perType: {}, perTypeX: {} },
  };
  let L = Game.villageLadder();
  T.ok('Fight counts waves 3-5 only: (4+2+0)/2 = 3', L.tracks.fight === 3, 'got ' + L.tracks.fight);
  T.ok('Fight detail carries the ledger total', L.detail.fightLedger === 6, 'got ' + L.detail.fightLedger);

  // --- Forage + Craft: 1pt per 12 summed XP, scholar + living roster ---
  resetLadderState(Game);
  Game.playerTracks().field.xp = 24; // scholar: 2
  Game.playerTracks().craft.xp = 36; // scholar: 3
  const vid = livingVillager(Game);
  T.ok('a living villager exists to rig', !!vid);
  if (vid) {
    const x = Game.npcXp(vid);
    x.field = 48; // villager: 4
    x.craft = 12; // villager: 1
  }
  L = Game.villageLadder();
  T.ok('Forage sums scholar + villager: (24+48)/12 = 6', L.tracks.forage === 6, 'got ' + L.tracks.forage);
  T.ok('Craft sums scholar + villager: (36+12)/12 = 4', L.tracks.craft === 4, 'got ' + L.tracks.craft);

  // --- dead villagers' XP does NOT count (living roster only) ---
  resetLadderState(Game);
  Game.playerTracks().field.xp = 0;
  if (vid) {
    const x = Game.npcXp(vid);
    x.field = 120;
    // Kill the villager in the record the ladder reads (vpOf dead).
    const vp = Game.vpOf(vid);
    if (vp) vp.dead = true;
  }
  L = Game.villageLadder();
  T.ok('dead villager field XP excluded: Forage 0', L.tracks.forage === 0, 'got ' + L.tracks.forage);
  if (vid) { const vp = Game.vpOf(vid); if (vp) vp.dead = false; }

  // --- Talk: 2pts per seasoned regional+ link + 1pt per contest survived ---
  resetLadderState(Game);
  rigRealmLinks(Game);
  Game.deedState().contestsSurvived = 3;
  L = Game.villageLadder();
  T.ok('Talk links counted: 3 seasoned regional+ links', L.detail.links === 3, 'got ' + L.detail.links);
  T.ok('Talk = 3 links x2 + 3 contests = 9', L.tracks.talk === 9, 'got ' + L.tracks.talk);
  T.ok('Explore counts the same links at formation: 3', L.detail.activeLinks === 3, 'got ' + L.detail.activeLinks);

  // --- Explore: breadth above 8 + active links (discovery deeds read 0) ---
  resetLadderState(Game);
  for (let i = 0; i < 12; i++) Game.state.codex.plants['plant' + i] = { level: 1 }; // breadth 12
  rigRealmLinks(Game); // 3 active links
  L = Game.villageLadder();
  T.ok('breadth 12 -> (12-8)/4 = 1 Explore pt from breadth', L.detail.breadth === 12, 'breadth ' + L.detail.breadth);
  T.ok('Explore = 1 breadth + 3 links = 4 (discovery 0)', L.tracks.explore === 4, 'got ' + L.tracks.explore);
  T.ok('discovery deeds read 0 (Amendment 1: no lifetime store)', L.detail.discovery === 0);

  // --- DISCOVERY IS COUNTED ONCE: field XP incl. discovery deeds stays in Forage ---
  // (prereg Amendment 1: the split cannot be computed yet, so discovery XP
  // lives inside the summed field total — never double-counted in Explore).
  resetLadderState(Game);
  Game.playerTracks().field.xp = 24; // 24 field XP, all of it discovery deeds in fiction
  L = Game.villageLadder();
  T.ok('field XP counts as Forage in full: 24/12 = 2', L.tracks.forage === 2, 'got ' + L.tracks.forage);
  T.ok('Explore takes nothing from it: 0', L.tracks.explore === 0, 'got ' + L.tracks.explore);
  const deeds = Game.trackData().deeds || {};
  T.ok('discovery deed carries the ladder:explore tag in data', deeds.discovery && deeds.discovery.ladder === 'explore', JSON.stringify(deeds.discovery));

  // --- ladderTick fires stage + cap beats once, and records the peak ---
  resetLadderState(Game);
  Game.state.waveLedger = { 3: { points: 12, perType: {}, perTypeX: {} } }; // Fight 6
  Game.playerTracks().field.xp = 72; // Forage 6 -> Village (12 counted)
  const says = [];
  Game.sysSay = (t) => { says.push(String(t)); };
  Game.ladderTick();
  T.ok('stage beat fired on reaching Village', says.some(s => /VILLAGE STANDING/.test(s)), says.join(' | '));
  T.ok('peak stage recorded', (Game.state._ladderPeakStage | 0) === 1, 'got ' + Game.state._ladderPeakStage);
  const nSays = says.length;
  Game.ladderTick();
  T.ok('stage beat does not repeat', says.length === nSays, 'says grew ' + nSays + ' -> ' + says.length);

  // --- cap beat fires once per rung ---
  resetLadderState(Game);
  Game.state.waveLedger = { 3: { points: 30, perType: {}, perTypeX: {} } }; // Fight 15, capped toward Village
  says.length = 0;
  Game.ladderTick();
  T.ok('cap beat fired for capped Fight', says.some(s => /Fight has carried this rung/.test(s)), says.join(' | '));
  const nCap = says.length;
  Game.ladderTick();
  T.ok('cap beat does not repeat on the same rung', says.length === nCap, 'says grew ' + nCap + ' -> ' + says.length);

  // --- capstones: military tribute (veterans on hand) ---
  // LEG 3 FIX (ladder leg 3, tribute scholar-readiness): the scholar is
  // NOT a payable veteran — readiness counts only non-scholar living
  // wave-4 veterans, so it agrees with delivery.
  resetLadderState(Game);
  const v2 = livingVillager(Game);
  const v3 = livingVillager(Game, v2);
  T.ok('two living non-scholar villagers exist for the tribute rig', !!(v2 && v3));
  Game.state.waveKillLog = [
    { by: v2, w: 4 },
    { by: v3, w: 4 },
  ];
  let cap = Game.ladderCapstoneReady('military_tribute');
  T.ok('tribute ready with 2 living non-scholar wave-4 veterans', cap.ready === true && cap.veterans === 2, JSON.stringify(cap));
  Game.state.waveKillLog = [{ by: v2, w: 4 }, { by: Game.villagerId, w: 4 }];
  cap = Game.ladderCapstoneReady('military_tribute');
  T.ok('scholar-veteran + 1 villager is NOT ready (the scholar is not payable)', cap.ready === false && cap.reason === 'veterans-short' && cap.veterans === 1, JSON.stringify(cap));
  Game.state.waveKillLog = [{ by: Game.villagerId, w: 4 }];
  cap = Game.ladderCapstoneReady('military_tribute');
  T.ok('tribute not ready with the scholar alone', cap.ready === false && cap.reason === 'veterans-short', JSON.stringify(cap));
  Game.state.waveKillLog = [{ by: Game.villagerId, w: 3 }];
  cap = Game.ladderCapstoneReady('military_tribute');
  T.ok('wave-3 kills do not count as wave-4 veterans', cap.ready === false && cap.veterans === 0, JSON.stringify(cap));

  // --- capstones: trade charter (sealed link + national scale) ---
  resetLadderState(Game);
  const ls = Game.hierarchyState();
  ls.push({ status: 'active', kind: 'trade', a: 'haven', b: 'villageX', chartered: true, day: day - 40, trust: 50 });
  Game.state.nationalLive = true;
  cap = Game.ladderCapstoneReady('trade_charter');
  T.ok('charter ready: sealed trade link + national scale', cap.ready === true, JSON.stringify(cap));
  Game.state.nationalLive = false;
  cap = Game.ladderCapstoneReady('trade_charter');
  T.ok('charter not ready below national scale', cap.ready === false && cap.reason === 'scale-short', JSON.stringify(cap));
  Game.state.nationalLive = true;
  ls.length = 0;
  cap = Game.ladderCapstoneReady('trade_charter');
  T.ok('charter not ready with no sealed link', cap.ready === false && cap.reason === 'no-sealed-charter', JSON.stringify(cap));

  // --- capstones: feast embassy (bundle flag + National stage) ---
  resetLadderState(Game);
  Game.state.waveLedger = { 3: { points: 48, perType: {}, perTypeX: {} } }; // Fight 24
  Game.playerTracks().field.xp = 192; // Forage 16 -> National (40)
  T.ok('rigged National stage for embassy', Game.ladderStage() === 3, 'stage ' + Game.ladderStage());
  cap = Game.ladderCapstoneReady('feast_embassy');
  T.ok('embassy not ready: no bundle feast yet (leg 2 flag)', cap.ready === false && cap.reason === 'no-bundle-feast', JSON.stringify(cap));
  Game.state.feastLog = [{ bundle: true, quality: 2, day }];
  cap = Game.ladderCapstoneReady('feast_embassy');
  T.ok('embassy ready: bundle feast + National stage', cap.ready === true, JSON.stringify(cap));

  // --- capstones: delivered + unknown ---
  resetLadderState(Game);
  Game.progState().ladderCapstone = 'military_tribute';
  T.ok('delivered capstone reads back', Game.ladderCapstoneDelivered() === 'military_tribute');
  cap = Game.ladderCapstoneReady('military_tribute');
  T.ok('delivered capstone is not re-ready', cap.ready === false && cap.reason === 'delivered', JSON.stringify(cap));
  delete Game.progState().ladderCapstone;
  cap = Game.ladderCapstoneReady('no_such_deed');
  T.ok('unknown capstone reads not-ready', cap.ready === false && cap.reason === 'unknown-capstone', JSON.stringify(cap));
  const defs = Game.ladderCapstones();
  T.ok('three capstone deeds defined', Array.isArray(defs) && defs.length === 3, 'got ' + (defs && defs.length));
  T.ok('capstone ids are the brief\u2019s three', defs.map(d => d.id).sort().join(',') === 'feast_embassy,military_tribute,trade_charter', defs.map(d => d.id).join(','));

  T.done();
}

main().catch(e => { console.error(e); process.exitCode = 1; });
